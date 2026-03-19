# Skloop — Monetization, AI Overhaul, Mentorship & QoL Prompt

You are working on **Skloop**, a Next.js 16 + Supabase gamified coding education platform.
Read every file in Step 1 before writing a single line. These are all additive changes — do not break existing functionality.

---

## STEP 1 — Read these files first (required)

```
app/api/loopy/route.ts
app/api/loopy-chat/route.ts
app/api/generate-roadmap/route.ts
lib/loopy-prompts.ts
lib/shop-items.ts
app/(app)/loopy/page.tsx
app/(app)/settings/page.tsx
app/(app)/shop/page.tsx
app/(app)/mentorship/find/page.tsx
app/(app)/mentorship/dashboard/page.tsx
app/(app)/mentorship/sessions/page.tsx
app/(app)/mentorship/apply/page.tsx
components/course/challenges/WebIDEChallenge.tsx
components/lesson/FlowchartBuilder.tsx
components/mentorship/SessionVideoCard.tsx
components/mentorship/MentorSettingsModal.tsx
components/mentorship/MentorHandbookModal.tsx
actions/mentorship-actions.ts
actions/user-actions.ts
context/UserContext.tsx
```

---

## STEP 2 — DB migrations required

Add these as SQL migration comments at the top of relevant action files. Run in Supabase SQL editor before deploying.

```sql
-- Subscription/plan tracking
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free' CHECK (plan = ANY (ARRAY['free','pro','mentor_pro'])),
  ADD COLUMN IF NOT EXISTS plan_expires_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS ai_queries_today integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_queries_reset_at date DEFAULT CURRENT_DATE;

-- Mentor booking slots
CREATE TABLE IF NOT EXISTS public.mentor_availability (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL,
  day_of_week integer NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  start_time time NOT NULL,
  end_time time NOT NULL,
  is_active boolean DEFAULT true,
  CONSTRAINT mentor_availability_pkey PRIMARY KEY (id),
  CONSTRAINT mentor_availability_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.profiles(id)
);

-- Live session bookings (1-on-1 calls)
CREATE TABLE IF NOT EXISTS public.live_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL,
  mentee_id uuid NOT NULL,
  scheduled_at timestamp with time zone NOT NULL,
  duration_minutes integer DEFAULT 60,
  session_type text DEFAULT 'video' CHECK (session_type = ANY (ARRAY['video','voice','text'])),
  status text DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending','confirmed','ongoing','completed','cancelled','no_show'])),
  room_id text, -- Daily.co or Whereby room ID
  room_url text,
  coins_cost integer NOT NULL DEFAULT 0,
  mentor_earnings integer NOT NULL DEFAULT 0,
  notes text,
  mentee_rating integer CHECK (mentee_rating >= 1 AND mentee_rating <= 5),
  mentee_review text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT live_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT live_sessions_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.profiles(id),
  CONSTRAINT live_sessions_mentee_id_fkey FOREIGN KEY (mentee_id) REFERENCES public.profiles(id)
);

-- AI conversation history (persistent, cross-session)
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mode text NOT NULL DEFAULT 'helpful',
  context text, -- 'lesson', 'ide', 'flowchart', 'general'
  context_id text, -- topic_id or challenge_id for context-aware responses
  created_at timestamp with time zone DEFAULT now(),
  last_message_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_conversations_pkey PRIMARY KEY (id),
  CONSTRAINT ai_conversations_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.ai_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['user','assistant','system'])),
  content text NOT NULL,
  tokens_used integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT ai_messages_pkey PRIMARY KEY (id),
  CONSTRAINT ai_messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.ai_conversations(id) ON DELETE CASCADE
);

-- Mentor earnings wallet
CREATE TABLE IF NOT EXISTS public.mentor_earnings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  mentor_id uuid NOT NULL,
  live_session_id uuid,
  amount_coins integer NOT NULL,
  type text DEFAULT 'session' CHECK (type = ANY (ARRAY['session','tip','bonus'])),
  status text DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending','paid'])),
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT mentor_earnings_pkey PRIMARY KEY (id),
  CONSTRAINT mentor_earnings_mentor_id_fkey FOREIGN KEY (mentor_id) REFERENCES public.profiles(id)
);
```

---

## STEP 3 — Monetization System

### 💰 MON 1 — Free vs Pro plan gates

**Files:** `context/UserContext.tsx`, `lib/plans.ts` (create new), `components/ui/ProGate.tsx` (create new), `app/(app)/settings/page.tsx`

**Create `lib/plans.ts`:**

Define what each plan gets. This is the single source of truth — import this everywhere plan checks are needed:

```ts
export type Plan = 'free' | 'pro' | 'mentor_pro'

export const PLAN_LIMITS = {
  free: {
    ai_queries_per_day: 10,
    ide_ai_hints_per_day: 5,
    can_book_mentor: false,
    can_be_mentor: true,
    max_study_circles: 1,
    can_access_leagues: false,
    can_download_resources: false,
  },
  pro: {
    ai_queries_per_day: 100,
    ide_ai_hints_per_day: 50,
    can_book_mentor: true,
    can_be_mentor: true,
    max_study_circles: 10,
    can_access_leagues: true,
    can_download_resources: true,
  },
  mentor_pro: {
    ai_queries_per_day: 200,
    ide_ai_hints_per_day: 100,
    can_book_mentor: true,
    can_be_mentor: true,
    max_study_circles: 999,
    can_access_leagues: true,
    can_download_resources: true,
  },
} as const

export const PLAN_PRICES = {
  pro: { monthly: 999, yearly: 7999 }, // in paise/cents
  mentor_pro: { monthly: 1999, yearly: 15999 },
} as const

export function isPro(plan: Plan) {
  return plan === 'pro' || plan === 'mentor_pro'
}
```

**Create `components/ui/ProGate.tsx`:**

A wrapper component that blurs content and shows an upgrade prompt for free users trying to access pro features:

```tsx
interface ProGateProps {
  feature: keyof typeof PLAN_LIMITS.free
  children: React.ReactNode
  fallback?: React.ReactNode // custom locked state instead of blur
}

export function ProGate({ feature, children, fallback }: ProGateProps) {
  const { profile } = useUser()
  const plan = (profile?.plan ?? 'free') as Plan
  const hasAccess = PLAN_LIMITS[plan][feature]

  if (hasAccess) return <>{children}</>

  if (fallback) return <>{fallback}</>

  return (
    <div className="relative rounded-2xl overflow-hidden">
      <div className="pointer-events-none select-none blur-sm opacity-50">
        {children}
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl p-6 text-center">
        <Crown className="text-amber-500 mb-2" size={32} />
        <div className="font-black text-zinc-900 text-lg">Pro Feature</div>
        <div className="text-zinc-500 text-sm mt-1 mb-4">Upgrade to Skloop Pro to unlock this</div>
        <Link href="/settings?tab=billing" className="bg-zinc-900 text-white font-bold px-6 py-2.5 rounded-2xl text-sm hover:bg-zinc-800">
          Upgrade to Pro
        </Link>
      </div>
    </div>
  )
}
```

**In `app/(app)/settings/page.tsx` — replace `BillingSettings` with a real pricing UI:**

Three plan cards side by side (Free / Pro / Mentor Pro):
- Free: 10 AI queries/day, 1 study circle, no mentor booking, no leagues — "Current Plan" if on free
- Pro (₹999/mo): 100 AI queries/day, book mentors, leagues, all features — "Upgrade" button
- Mentor Pro (₹1999/mo): everything in Pro + unlimited circles, priority matching, mentor analytics

Each card shows a feature checklist using checkmarks and crosses. Pro and Mentor Pro cards have a "Most Popular" / "For Educators" badge respectively.

Below the cards, show "Yearly billing saves 33%" toggle that switches the displayed price.

The "Upgrade" buttons should link to `/api/create-checkout-session?plan=pro` (create this endpoint in Step 4).

**Add `plan` to `UserProfile` interface in `context/UserContext.tsx`** and include it in the profile select query.

---

### 💰 MON 2 — Stripe checkout integration

**Files:** Create `app/api/create-checkout-session/route.ts`, `app/api/stripe-webhook/route.ts`

**`app/api/create-checkout-session/route.ts`:**

```ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/utils/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

const PRICE_IDS = {
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
  pro_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
  mentor_pro_monthly: process.env.STRIPE_MENTOR_PRO_MONTHLY_PRICE_ID!,
  mentor_pro_yearly: process.env.STRIPE_MENTOR_PRO_YEARLY_PRICE_ID!,
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan, billing } = await req.json() // plan: 'pro'|'mentor_pro', billing: 'monthly'|'yearly'
  const priceKey = `${plan}_${billing}` as keyof typeof PRICE_IDS
  const priceId = PRICE_IDS[priceKey]

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=billing&success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=billing`,
    customer_email: user.email,
    metadata: { user_id: user.id, plan },
  })

  return NextResponse.json({ url: session.url })
}
```

**`app/api/stripe-webhook/route.ts`:**

Handle `checkout.session.completed` and `customer.subscription.deleted` events:
- On completed: update `profiles.plan = metadata.plan`, set `plan_expires_at` to subscription end date, save `stripe_customer_id`
- On deleted: reset `profiles.plan = 'free'`, clear `plan_expires_at`

```ts
import Stripe from 'stripe'
import { createClient } from '@/utils/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

export async function POST(req: Request) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return new Response('Webhook signature failed', { status: 400 })
  }

  const supabase = await createClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    await supabase.from('profiles').update({
      plan: session.metadata?.plan ?? 'free',
      stripe_customer_id: session.customer as string,
      plan_expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    }).eq('id', session.metadata?.user_id)
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    await supabase.from('profiles').update({ plan: 'free', plan_expires_at: null })
      .eq('stripe_customer_id', sub.customer as string)
  }

  return new Response('ok')
}
```

Add to `.env.local` template (as comments in the route file):
```
# STRIPE_SECRET_KEY=sk_live_...
# STRIPE_WEBHOOK_SECRET=whsec_...
# STRIPE_PRO_MONTHLY_PRICE_ID=price_...
# STRIPE_PRO_YEARLY_PRICE_ID=price_...
# STRIPE_MENTOR_PRO_MONTHLY_PRICE_ID=price_...
# STRIPE_MENTOR_PRO_YEARLY_PRICE_ID=price_...
```

Add `stripe` to dependencies: `npm install stripe`.

---

### 💰 MON 3 — Coin top-up packs (one-time purchases)

**Files:** `app/(app)/shop/page.tsx`, create `app/api/create-coin-purchase/route.ts`

Add a "Coin Packs" tab to the shop page alongside existing categories:

Four coin pack cards:
- Starter Pack: 500 coins — ₹99
- Popular Pack: 1500 coins — ₹249 (badge: "Best Value")
- Power Pack: 4000 coins — ₹599
- Mega Pack: 10000 coins — ₹999

Each card shows a coin icon stack, the amount, price, and a "Buy Now" button. Clicking opens a Stripe one-time payment checkout (not subscription).

**`app/api/create-coin-purchase/route.ts`:**

Similar to checkout session but `mode: 'payment'` instead of subscription. On webhook `payment_intent.succeeded`, award coins via `increment_profile_stats` RPC.

---

### 💰 MON 4 — AI query rate limiting tied to plan

**Files:** `app/api/loopy/route.ts`, `app/api/loopy-chat/route.ts`, `app/api/generate-roadmap/route.ts`, `actions/user-actions.ts`

Add a server-side per-day query counter that respects plan limits.

Create a shared utility `lib/ai-rate-limit.ts`:
```ts
import { createClient } from '@/utils/supabase/server'
import { PLAN_LIMITS } from './plans'

export async function checkAndIncrementAiQuota(userId: string): Promise<{ allowed: boolean; remaining: number }> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, ai_queries_today, ai_queries_reset_at')
    .eq('id', userId)
    .single()

  if (!profile) return { allowed: false, remaining: 0 }

  const plan = (profile.plan ?? 'free') as keyof typeof PLAN_LIMITS
  const limit = PLAN_LIMITS[plan].ai_queries_per_day

  // Reset counter if it's a new day
  if (profile.ai_queries_reset_at !== today) {
    await supabase.from('profiles').update({
      ai_queries_today: 1,
      ai_queries_reset_at: today
    }).eq('id', userId)
    return { allowed: true, remaining: limit - 1 }
  }

  if (profile.ai_queries_today >= limit) {
    return { allowed: false, remaining: 0 }
  }

  await supabase.from('profiles').update({
    ai_queries_today: profile.ai_queries_today + 1
  }).eq('id', userId)

  return { allowed: true, remaining: limit - profile.ai_queries_today - 1 }
}
```

In each AI route, after auth check, call `checkAndIncrementAiQuota`. If not allowed, return:
```ts
return NextResponse.json({
  error: 'Daily AI limit reached',
  upgrade_url: '/settings?tab=billing',
  is_limit_error: true
}, { status: 429 })
```

In the frontend Loopy page and IDE AI assistant, when receiving a 429 with `is_limit_error: true`, show a "You've used all your AI queries for today. Upgrade to Pro for 100/day →" message with a link.

---

## STEP 4 — AI Overhaul

### 🤖 AI 1 — Revamp the Loopy page into a proper AI assistant hub

**File:** `app/(app)/loopy/page.tsx`

The current Loopy page has two modes (helpful/story) chosen upfront and a basic chat. Revamp it into a proper multi-context assistant with four modes accessible via tabs:

**Tab 1 — Tutor Mode** (replaces current "helpful"):
- Socratic method, same as now but with better UI
- Conversation is persistent — saved to `ai_conversations` table and loaded on return
- Shows "conversation history" sidebar on desktop with past sessions grouped by topic
- Loopy mascot reacts visually (mood changes based on response sentiment)
- Supports markdown rendering in responses (use existing `react-markdown`)
- Show "Thinking..." with animated dots while waiting

**Tab 2 — Code Review Mode** (new):
- User pastes code or shares their IDE project
- Loopy reviews it for bugs, style, efficiency — using a new system prompt:
```
You are Loopy, a code reviewer for Skloop. The user has shared code with you.
Review it for: bugs, inefficiencies, style issues, and best practices.
Format your response as:
1. Overall assessment (1-2 sentences)
2. Issues found (bullet list, each with severity: 🔴 Bug / 🟡 Warning / 🟢 Suggestion)
3. One specific improvement to make first
Be constructive, specific, and encouraging. Keep total response under 200 words.
```
- Monaco editor embedded in the input area (small, read-only preview of pasted code)
- "Review Code" button triggers the AI call

**Tab 3 — Interview Prep Mode** (new):
- Loopy conducts mock technical interviews
- User picks difficulty (Easy/Medium/Hard) and topic (Arrays, Trees, Strings, etc.)
- Loopy asks a coding question in text, user explains their approach in text
- Loopy evaluates the approach, asks follow-up questions like a real interviewer
- System prompt:
```
You are a senior software engineer at a top tech company conducting a mock technical interview on Skloop.
Ask ONE coding interview question at a time based on the specified difficulty and topic.
After the user responds, evaluate their approach: did they consider edge cases? What's the time/space complexity?
Ask one follow-up question to probe deeper. Never give the answer directly — guide through questions.
Keep each response under 150 words.
```

**Tab 4 — Boss Fight Mode** (replaces current "story"):
- Same RPG concept but with better narrative structure
- Track HP as an actual UI element (heart bar at top)
- Show the current challenge as a "quest card" with monster name and lore

---

### 🤖 AI 2 — AI assistant embedded in the WebIDE

**File:** `components/course/challenges/WebIDEChallenge.tsx`

Add a collapsible AI assistant panel inside the IDE. It sits as a right-side drawer that can be toggled with a "Ask Loopy" button in the IDE toolbar.

**Add to the toolbar area:**
```tsx
<button
  onClick={() => setShowAIPanel(!showAIPanel)}
  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4F268]/20 hover:bg-[#D4F268]/40 text-xs font-bold text-zinc-700 border border-[#D4F268]/50"
>
  <Bot size={14} />
  Ask Loopy
</button>
```

**The AI panel (right drawer, ~280px wide):**
- Collapsed by default, slides in from right
- Shows current challenge instructions at the top (collapsible)
- Chat interface below — user can type questions about their code
- "Check my code" quick action button that auto-sends the current editor content as context
- Context-aware system prompt that includes the challenge data:

```ts
// In the API call for IDE AI:
const ideSystemPrompt = `
You are Loopy, helping a student with a specific coding challenge in Skloop's IDE.

CHALLENGE: ${challengeData.instructions}
VALIDATION RULES: ${JSON.stringify(challengeData.validationRules)}
STUDENT'S CURRENT CODE:
HTML: ${htmlContent}
CSS: ${cssContent}  
JS: ${jsContent}

YOUR ROLE:
- Guide them toward solving the challenge using hints, NOT full solutions
- When they ask "check my code", identify what's missing vs the validation rules
- Be specific about which validation rule they haven't met yet
- Never write the solution code directly
- Keep responses under 100 words
`
```

Create a new API endpoint `app/api/loopy-ide/route.ts` for this — it takes `message`, `challengeData`, `currentCode` (html/css/js strings), and conversation history. Use the same Groq client. Apply plan-based rate limiting using the IDE-specific limit (`ide_ai_hints_per_day`).

---

### 🤖 AI 3 — AI assistant embedded in the FlowchartBuilder

**File:** `components/lesson/FlowchartBuilder.tsx`

Add a "Hint" button to the flowchart challenge toolbar. When clicked, it sends the current flowchart structure (nodes + edges as JSON) along with the challenge prompt to a new endpoint `app/api/loopy-flowchart/route.ts`.

**Context-aware hint prompt:**
```ts
const flowchartSystemPrompt = `
You are Loopy, helping a student build a flowchart/algorithm visualisation in Skloop.

CURRENT FLOWCHART (nodes and edges):
${JSON.stringify({ nodes: nodes.map(n => ({ id: n.id, type: n.type, code: n.data.code })), edges })}

CHALLENGE GOAL: ${challengeGoal || 'Build a correct algorithm flowchart'}

Analyze their flowchart structure. Are the logic flow, conditions, and loops correct?
Give ONE specific hint about what to fix or add next. Don't describe the full solution.
Keep your response under 80 words.
`
```

Show the hint in a small animated toast/popup near the hint button — not a separate panel. After the hint appears, it fades out after 8 seconds or the user dismisses it.

---

### 🤖 AI 4 — Persistent AI conversation history

**Files:** `app/(app)/loopy/page.tsx`, create `actions/ai-actions.ts`

**`actions/ai-actions.ts`:**
```ts
'use server'
import { createClient } from '@/utils/supabase/server'

export async function getOrCreateConversation(mode: string, context?: string, contextId?: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // Try to find an existing conversation from today for this context
  const today = new Date().toISOString().split('T')[0]
  const { data: existing } = await supabase
    .from('ai_conversations')
    .select('id')
    .eq('user_id', user.id)
    .eq('mode', mode)
    .eq('context', context ?? 'general')
    .gte('created_at', today)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing) return existing.id

  const { data: newConv } = await supabase
    .from('ai_conversations')
    .insert({ user_id: user.id, mode, context: context ?? 'general', context_id: contextId })
    .select('id')
    .single()

  return newConv?.id ?? null
}

export async function saveAiMessages(conversationId: string, messages: { role: string; content: string }[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('ai_messages').insert(
    messages.map(m => ({ conversation_id: conversationId, role: m.role, content: m.content }))
  )
  await supabase.from('ai_conversations').update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId)
}

export async function getConversationHistory(conversationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('ai_messages')
    .select('role, content, created_at')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .limit(50)

  return data ?? []
}

export async function getPastConversations() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('ai_conversations')
    .select('id, mode, context, created_at, last_message_at')
    .eq('user_id', user.id)
    .order('last_message_at', { ascending: false })
    .limit(20)

  return data ?? []
}
```

In `app/(app)/loopy/page.tsx`, on mount: call `getOrCreateConversation` to get/create today's conversation. Load its history via `getConversationHistory` and pre-populate the messages array. After every exchange, call `saveAiMessages` with the new user+assistant messages.

Add a conversation history sidebar (desktop only): shows past 10 conversations with their mode and date. Clicking one loads that conversation's history.

---

### 🤖 AI 5 — Smart AI model routing

**File:** `app/api/loopy/route.ts` (and other AI routes)

Instead of always using `llama-3.3-70b-versatile`, route to different models based on task:

```ts
function selectModel(mode: string, messageLength: number): string {
  // Long complex messages or interview mode → best model
  if (mode === 'interview' || messageLength > 500) {
    return 'llama-3.3-70b-versatile'
  }
  // Short hints, quick responses → faster smaller model
  if (mode === 'flowchart_hint' || messageLength < 100) {
    return 'llama-3.1-8b-instant' // much faster for hints
  }
  // Code review → needs reasoning
  if (mode === 'code_review') {
    return 'llama-3.3-70b-versatile'
  }
  // Default story/helpful
  return 'llama-3.1-70b-versatile'
}
```

Also add **streaming responses** to the main Loopy chat. Replace `groq.chat.completions.create` with the streaming version for tutor and interview modes:

```ts
// In /api/loopy/route.ts for streaming:
const stream = await groq.chat.completions.create({
  messages,
  model: selectedModel,
  temperature: 0.7,
  max_tokens: 500,
  stream: true,
})

const encoder = new TextEncoder()
const readable = new ReadableStream({
  async start(controller) {
    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || ''
      if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
    }
    controller.enqueue(encoder.encode('data: [DONE]\n\n'))
    controller.close()
  }
})

return new Response(readable, {
  headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' }
})
```

In the Loopy page frontend, handle SSE streaming — show text appearing word by word as it arrives. This makes responses feel instant and much more alive.

---

## STEP 5 — Mentorship Overhaul

### 🎓 MENTOR 1 — Live 1-on-1 session booking system

**Files:** Create `app/(app)/mentorship/book/[mentorId]/page.tsx`, `components/mentorship/BookingCalendar.tsx`, add to `actions/mentorship-actions.ts`

**Add to `actions/mentorship-actions.ts`:**

```ts
export async function getMentorAvailability(mentorId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('mentor_availability')
    .select('*')
    .eq('mentor_id', mentorId)
    .eq('is_active', true)
  return data ?? []
}

export async function bookLiveSession(input: {
  mentorId: string
  scheduledAt: string
  durationMinutes: number
  sessionType: 'video' | 'voice' | 'text'
  notes?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Check mentee has enough coins
  const { data: profile } = await supabase.from('profiles')
    .select('coins, plan').eq('id', user.id).single()
  
  const { data: mentor } = await supabase.from('profiles')
    .select('hourly_rate').eq('id', input.mentorId).single()

  const coinCost = Math.round((mentor?.hourly_rate ?? 0) * (input.durationMinutes / 60))
  const mentorEarnings = Math.round(coinCost * 0.8) // 80% to mentor, 20% platform fee

  if ((profile?.coins ?? 0) < coinCost) {
    return { success: false, error: 'Insufficient coins' }
  }

  // Deduct coins from mentee
  await supabase.rpc('increment_profile_stats', {
    x_user_id: user.id, xp_amount: 0, coins_amount: -coinCost
  })

  // Create the live session
  const { data: session } = await supabase.from('live_sessions').insert({
    mentor_id: input.mentorId,
    mentee_id: user.id,
    scheduled_at: input.scheduledAt,
    duration_minutes: input.durationMinutes,
    session_type: input.sessionType,
    coins_cost: coinCost,
    mentor_earnings: mentorEarnings,
    notes: input.notes,
  }).select().single()

  // Notify mentor
  await supabase.from('notifications').insert({
    user_id: input.mentorId,
    title: '📅 New session booked!',
    content: `A student has booked a ${input.sessionType} session with you.`,
    type: 'session_booking',
    metadata: { session_id: session?.id }
  })

  return { success: true, session }
}

export async function confirmLiveSession(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Generate a Whereby room URL (or use Daily.co)
  // For now, generate a unique meeting link using a room ID
  const roomId = `skloop-${sessionId.slice(0, 8)}`
  const roomUrl = `https://whereby.com/${roomId}` // Replace with actual API call

  await supabase.from('live_sessions').update({
    status: 'confirmed',
    room_id: roomId,
    room_url: roomUrl,
  }).eq('id', sessionId).eq('mentor_id', user.id)

  // Notify mentee
  const { data: session } = await supabase.from('live_sessions')
    .select('mentee_id').eq('id', sessionId).single()

  await supabase.from('notifications').insert({
    user_id: session?.mentee_id,
    title: '✅ Session confirmed!',
    content: 'Your mentor has confirmed your session. Join link is ready.',
    type: 'session_confirmed',
    metadata: { session_id: sessionId, room_url: roomUrl }
  })

  return { success: true, roomUrl }
}
```

**Create `app/(app)/mentorship/book/[mentorId]/page.tsx`:**

A booking flow with three steps:

Step 1 — Session type selector: three large cards:
- Video Call 📹 — "Face to face, best for walkthroughs"
- Voice Call 🎙️ — "Audio only, lower bandwidth"
- Text Session 💬 — "Async chat, flexible timing"

Step 2 — Calendar picker: Show a weekly calendar grid. Available slots from `getMentorAvailability` highlighted in lime green. User clicks a slot to select it. Show duration options (30min / 60min / 90min) below.

Step 3 — Review & pay: Summary card showing mentor name, session type, date/time, duration, coin cost. "Confirm & Pay {X} Coins" button. Shows user's current coin balance.

**`components/mentorship/BookingCalendar.tsx`:**

A 7-day calendar component. Each day column shows time slots. Available = clickable green pill. Booked = grey strikethrough. Selected = filled lime.

---

### 🎓 MENTOR 2 — Live session room (video/voice/text)

**Files:** Create `app/(app)/mentorship/live/[sessionId]/page.tsx`, create `app/api/create-meeting-room/route.ts`

**`app/api/create-meeting-room/route.ts`:**

Integrate with Whereby Embedded API (free tier allows this) to create meeting rooms on demand:

```ts
export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { sessionId } = await req.json()

  // Verify user is mentor or mentee for this session
  const { data: session } = await supabase.from('live_sessions')
    .select('mentor_id, mentee_id, session_type')
    .eq('id', sessionId).single()

  if (!session || (session.mentor_id !== user.id && session.mentee_id !== user.id)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  // Create Whereby room
  const response = await fetch('https://api.whereby.dev/v1/meetings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.WHEREBY_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      endDate: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
      fields: ['hostRoomUrl'],
    })
  })

  const room = await response.json()

  // Save room URL to DB
  await supabase.from('live_sessions').update({
    room_url: room.roomUrl,
    status: 'confirmed'
  }).eq('id', sessionId)

  // Return host URL for mentor, regular URL for mentee
  const isHost = session.mentor_id === user.id
  return NextResponse.json({
    roomUrl: isHost ? room.hostRoomUrl : room.roomUrl,
    sessionType: session.session_type
  })
}
```

Add env: `WHEREBY_API_KEY=...`

**`app/(app)/mentorship/live/[sessionId]/page.tsx`:**

For **video/voice sessions**: Embed the Whereby room in an iframe:
```tsx
<iframe
  src={roomUrl}
  allow="camera; microphone; fullscreen; speaker; display-capture"
  className="w-full h-screen"
/>
```

For **text sessions**: A real-time chat interface using Supabase Realtime (reuse the existing `ChatWindow` pattern but scoped to this session), with:
- Code sharing button (opens mini Monaco editor, shares code block in chat)
- Screen share option (link to a separate video room)
- File upload (images of code/diagrams)
- Session timer showing time remaining

Both session types include:
- A top bar showing mentor/mentee name, session duration, and a "End Session" button
- A shared notes area (collaborative text field saved to the `live_sessions.notes` column in real time)
- "Report issue" button

---

### 🎓 MENTOR 3 — Mentor availability & earnings dashboard

**Files:** `app/(app)/mentorship/dashboard/page.tsx`, create `components/mentorship/AvailabilityEditor.tsx`, create `components/mentorship/EarningsCard.tsx`

**`components/mentorship/AvailabilityEditor.tsx`:**

A weekly availability grid where mentors set their available hours:
- 7 columns (Mon–Sun), each with time slot checkboxes (9am, 10am, 11am... 8pm)
- Mentors click to toggle availability
- "Save Availability" saves to `mentor_availability` table
- Shows current timezone and a note "Students will see your times in their timezone"

**`components/mentorship/EarningsCard.tsx`:**

A card on the mentor dashboard showing:
- Total coins earned (this week / all time)
- "Withdraw to real money" CTA (for future feature — show coming soon for now)
- Pending sessions (coins held)
- Completed sessions (coins released)
- A simple bar chart (use recharts, already in deps) of earnings over last 8 weeks

Add both components as new tabs to `app/(app)/mentorship/dashboard/page.tsx` alongside existing "Requests", "Upcoming", "History" tabs. Add "Availability" and "Earnings" tabs.

---

### 🎓 MENTOR 4 — Mentor profile page with reviews & portfolio

**Files:** Add to `app/(app)/mentorship/find/page.tsx`, create `app/(app)/mentorship/mentor/[id]/page.tsx`

**Create `app/(app)/mentorship/mentor/[id]/page.tsx`:**

A dedicated public mentor profile page (different from the user profile — this is mentorship-specific):

- Header: mentor avatar, name, headline, specialties as pill tags, star rating with review count, availability status ("Available this week" / "Fully booked")
- Stats row: Total sessions completed, Average rating, Response time, Years of experience
- "Book a Session" CTA button (links to `/mentorship/book/[id]`)
- About section: mentor bio
- Session types offered: Video / Voice / Text with hourly rate in coins for each
- Published video sessions: the existing `SessionVideoCard` components
- Reviews section: list of `session_reviews` with reviewer avatar, rating stars, comment, date

**Add to `actions/mentorship-actions.ts`:**

```ts
export async function getMentorPublicProfile(mentorId: string) {
  const supabase = await createClient()

  const [profileRes, reviewsRes, availabilityRes, sessionsRes] = await Promise.all([
    supabase.from('profiles').select('*, mentor_profiles(*)').eq('id', mentorId).single(),
    supabase.from('session_reviews')
      .select('*, profiles!session_reviews_reviewer_id_fkey(username, avatar_url)')
      .eq('mentor_sessions.mentor_id', mentorId)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase.from('mentor_availability').select('*').eq('mentor_id', mentorId).eq('is_active', true),
    supabase.from('mentor_sessions').select('*').eq('mentor_id', mentorId).eq('status', 'published').order('created_at', { ascending: false })
  ])

  return {
    profile: profileRes.data,
    reviews: reviewsRes.data ?? [],
    availability: availabilityRes.data ?? [],
    sessions: sessionsRes.data ?? [],
  }
}
```

Make the mentor cards on the find page link to this profile page instead of opening the profile modal.

---

### 🎓 MENTOR 5 — Mentor matching & discovery improvements

**Files:** `app/(app)/mentorship/find/page.tsx`, `actions/mentorship-actions.ts`

**Improve the mentor listing page:**

1. Add filter chips at the top: "Available Now", "Video Sessions", "Under 500 coins/hr", "Top Rated (4.5+)", and specialty tags (HTML/CSS, JavaScript, React, DSA, Algorithms)

2. Add a sort dropdown: "Best Match", "Highest Rated", "Most Sessions", "Lowest Price"

3. Add a "Quick Match" button — for users who don't want to browse. Asks two questions:
   - "What do you need help with?" (dropdown: debugging, code review, project help, interview prep, concept explanation)
   - "When are you available?" (now / today / this week)
   
   Then shows one recommended mentor (the highest-rated available mentor matching the criteria).

4. Update `getMentors()` in `actions/mentorship-actions.ts` to accept filters:
```ts
export async function getMentors(filters?: {
  specialty?: string
  maxRate?: number
  minRating?: number
  sessionType?: 'video' | 'voice' | 'text'
  availableNow?: boolean
}) {
  // Build query with filters applied
}
```

---

## STEP 6 — Quality of Life Improvements

### 🔧 QOL 1 — Global command palette (Cmd+K)

**Files:** Create `components/ui/CommandPalette.tsx`, add to `components/shell/AppShell.tsx`

A Cmd+K command palette that lets users navigate anywhere instantly:

```tsx
// Triggered by Cmd+K or Ctrl+K
// Shows a modal with a search input
// Results include:
// - Pages: Dashboard, Profile, Roadmap, Shop, etc. (static list)
// - Recent lessons (from SWR cache)
// - Actions: "Ask Loopy", "Open Shop", "View Streak"
// - Mentor search: type "mentor" + name
```

Build it as a simple modal with a text input and a filtered list. No external library needed — just a `useEffect` for the keyboard shortcut and `useState` for the query. Each result is a link or action. Use fuzzy matching on the label.

Register the keyboard shortcut in `AppShell.tsx`:
```tsx
useEffect(() => {
  const handler = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setCommandOpen(true)
    }
  }
  window.addEventListener('keydown', handler)
  return () => window.removeEventListener('keydown', handler)
}, [])
```

---

### 🔧 QOL 2 — Notifications page wired up to real data

**File:** `app/(app)/notifications/page.tsx`, `actions/notification-actions.ts`

Replace the `INITIAL_NOTIFICATIONS = []` stub with real data. The `notifications` table already exists in the DB with `id, user_id, title, content, type, is_read, created_at, actor_id, metadata`.

In `actions/notification-actions.ts`, add:
```ts
export async function getUserNotifications() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('notifications')
    .select('*, actor:profiles!notifications_actor_id_fkey(username, avatar_url)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return data ?? []
}

export async function markAllNotificationsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('notifications').update({ is_read: true }).eq('user_id', user.id)
}
```

Map notification `type` to an icon and color in the page:
- `streak_warning` → 🔥 orange
- `session_booking` → 📅 blue
- `session_confirmed` → ✅ green
- `quest_complete` → 🎯 lime
- `badge_earned` → 🏅 amber
- `message` → 💬 purple
- default → 🔔 grey

Show unread count badge on the sidebar notification icon. Add a realtime subscription in `NotificationListener.tsx` that updates a global unread count (store in a Zustand-like `useState` at the UserContext level or as a separate `notifCount` exported from UserContext).

---

### 🔧 QOL 3 — Keyboard shortcuts inside the IDE

**File:** `components/course/challenges/WebIDEChallenge.tsx`

Add a keyboard shortcuts panel (accessible via `?` key or a "Shortcuts" button):

Register these shortcuts in the IDE:
- `Cmd/Ctrl + Enter` → Run code (triggers preview update)
- `Cmd/Ctrl + S` → Save to cloud
- `Cmd/Ctrl + Shift + F` → Format code
- `Cmd/Ctrl + /` → Toggle comment
- `Cmd/Ctrl + K` → Open AI assistant panel
- `Escape` → Close any open panel

Show a floating "Keyboard Shortcuts" tooltip card when `?` is pressed.

---

### 🔧 QOL 4 — Dark mode toggle

**Files:** `app/layout.tsx`, `components/shell/AppShell.tsx`, `app/(app)/settings/page.tsx`

Add a theme preference to the settings page (Light / Dark / System) that saves to localStorage and applies a `dark` class to `<html>`. The app already uses Tailwind — just ensure dark mode variants are enabled.

In `app/layout.tsx`, add a `ThemeScript` that runs before hydration to prevent flash:
```tsx
// Inline script in <head> to set theme before paint
const themeScript = `
  (function() {
    const theme = localStorage.getItem('skloop-theme') || 'system'
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (theme === 'dark' || (theme === 'system' && prefersDark)) {
      document.documentElement.classList.add('dark')
    }
  })()
`
```

In settings, add three buttons: Sun (Light), Moon (Dark), Monitor (System). Clicking saves to localStorage and updates `document.documentElement.classList` immediately.

---

### 🔧 QOL 5 — Real calendar page using user_events table

**File:** `app/(app)/calendar/page.tsx`

The calendar UI and date logic already exist — it just uses empty mock data. Wire it to the `user_events` table:

Add to `actions/` or inline:
```ts
// Get events for a user
const { data: events } = await supabase
  .from('user_events')
  .select('*')
  .eq('user_id', user.id)
  .gte('start_time', startOfMonth.toISOString())
  .lte('end_time', endOfMonth.toISOString())

// Create event
await supabase.from('user_events').insert({
  user_id: user.id,
  title: newEventTitle,
  start_time: selectedDate + 'T' + newEventTime,
  end_time: selectedDate + 'T' + newEventTime, // same for now
  event_type: newEventType
})
```

Also pull in `live_sessions` for the current user (as mentee or mentor) and show them on the calendar as a different event type (blue pills for scheduled sessions vs yellow for personal events).

---

### 🔧 QOL 6 — Contacts page using connections table

**File:** `app/(app)/contacts/page.tsx`

Wire it to the existing `connections` table. Show three tabs:
- "Friends" — accepted connections with avatar, name, online status (from presence), "Message" button
- "Pending" — sent requests you're waiting on, "Cancel" button
- "Requests" — incoming requests, "Accept" / "Decline" buttons

Each friend card shows: avatar, name, level, streak, last seen. Tapping opens the existing `UserProfileModal`.

Search bar filters the list by username.

---

### 🔧 QOL 7 — Toast improvements + global loading state

**Files:** `components/ui/ToastProvider.tsx`, `components/shell/AppShell.tsx`

1. Add toast types beyond success/error: `info`, `warning`, `achievement`. Each has distinct styling.

2. Add a global page loading bar (thin progress line at the very top of the viewport, like YouTube/GitHub's) that triggers on Next.js router navigation events:
```tsx
// In AppShell or layout, listen to navigation events
useEffect(() => {
  const handleStart = () => setNavLoading(true)
  const handleEnd = () => setNavLoading(false)
  // use next/navigation's useRouter events or pathname changes
}, [])
```

3. Long-running actions (booking a session, opening a chest, AI responses) should show a subtle `isLoading` state with a spinner in the relevant button rather than freezing the whole page.

---

## STEP 7 — Verification checklist

After all fixes:

**Monetization:**
- [ ] `lib/plans.ts` exists with `PLAN_LIMITS` and `isPro()`
- [ ] `ProGate` component correctly blurs content and shows upgrade prompt for free users
- [ ] Settings billing tab shows three plan cards (Free/Pro/Mentor Pro) with feature lists and prices
- [ ] `/api/create-checkout-session` returns a Stripe checkout URL
- [ ] `/api/stripe-webhook` handles subscription events and updates `profiles.plan`
- [ ] Coin pack cards exist in the shop
- [ ] `checkAndIncrementAiQuota` is called in all three AI routes
- [ ] AI routes return 429 with `upgrade_url` when limit exceeded
- [ ] Frontend shows quota warning message with upgrade link on 429

**AI:**
- [ ] Loopy page has 4 tabs: Tutor, Code Review, Interview Prep, Boss Fight
- [ ] Conversation history is saved to `ai_conversations` + `ai_messages` tables
- [ ] Past conversations sidebar loads and allows switching sessions
- [ ] WebIDE has "Ask Loopy" button that opens AI panel with context-aware responses
- [ ] IDE AI panel "Check my code" sends current editor content as context
- [ ] FlowchartBuilder has "Hint" button that calls `/api/loopy-flowchart`
- [ ] `/api/loopy-ide` and `/api/loopy-flowchart` routes exist with plan-aware rate limiting
- [ ] Tutor mode uses SSE streaming (responses appear word by word)
- [ ] Model routing selects faster model for short hints

**Mentorship:**
- [ ] `mentor_availability` table and `live_sessions` table migrations noted
- [ ] `/mentorship/book/[mentorId]` page exists with 3-step booking flow
- [ ] Booking deducts coins from mentee and creates `live_sessions` row
- [ ] `/mentorship/live/[sessionId]` page exists with Whereby embed for video/voice
- [ ] Text session type uses a real-time chat interface
- [ ] Mentor dashboard has "Availability" tab with weekly grid editor
- [ ] Mentor dashboard has "Earnings" tab with coin totals and bar chart
- [ ] `/mentorship/mentor/[id]` public profile page exists with reviews, videos, booking CTA
- [ ] Mentor find page has filter chips and sort dropdown

**QoL:**
- [ ] Cmd+K opens command palette with navigation and quick actions
- [ ] Notifications page loads real data from `notifications` table
- [ ] Sidebar notification icon shows unread count badge
- [ ] IDE has keyboard shortcut `Cmd+Enter` to run, `Cmd+S` to save
- [ ] Dark mode toggle in settings saves to localStorage and applies instantly
- [ ] Calendar page loads real `user_events` and shows `live_sessions` on the grid
- [ ] Contacts page shows accepted connections, pending requests, incoming requests

---

## Important notes

- Stack: Next.js 16, React 19, Supabase SSR, TypeScript, Tailwind CSS 4, Groq SDK, Framer Motion 12, Recharts (already installed)
- Add `stripe` as a new dependency (`npm install stripe`)
- Whereby Embedded is free for basic use — add `WHEREBY_API_KEY` to env
- All new server actions must call `supabase.auth.getUser()` first and use the verified `user.id`
- The `ProGate` component should be importable from `@/components/ui/ProGate`
- Streaming AI responses: the frontend should handle SSE with `EventSource` or `fetch` with `ReadableStream`
- `PLAN_LIMITS` is the single source of truth — never hardcode plan checks inline, always import from `lib/plans.ts`
- Do not change existing mentorship video upload flow — only add to it
- Groq free tier supports streaming — no API plan change needed
- For Stripe: create products and prices in Stripe dashboard, then add price IDs to env