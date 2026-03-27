# Skloop — Monetization System Prompt (Generous, Non-Predatory)

You are working on **Skloop**, a Next.js 16 + Supabase gamified coding education platform.
Read every file in Step 1 before writing any code. All changes are additive — do not remove existing functionality.

---

## STEP 1 — Read these files first

```
app/(app)/settings/page.tsx
app/(app)/shop/page.tsx
lib/shop-items.ts
context/UserContext.tsx
actions/user-actions.ts
app/api/loopy/route.ts
app/api/loopy-chat/route.ts
app/api/generate-roadmap/route.ts
app/(app)/mentorship/find/page.tsx
app/(app)/mentorship/sessions/page.tsx
components/shell/Sidebar.tsx
```

---

## STEP 2 — Core monetization philosophy (READ THIS FIRST, IMPLEMENT FROM IT)

**What is always free, forever, no gates:**
- Every lesson, quiz, IDE challenge, flowchart challenge
- All courses, tracks, and modules
- Streaks, XP, levels, badges, chests, quests
- Daily Codele, typing race, DSA quiz
- Leaderboards and leagues
- Peer chat, study circles (up to 3)
- Profile, portfolio, timeline
- All mentor video session content (watching uploaded videos)
- Community features

**What Plus (₹149/mo) adds — QoL, not access:**
- Unlimited AI hints (free = 20/day, still genuinely useful)
- AI code reviewer mode in Loopy
- AI interview prep mode in Loopy
- Offline lesson saving (PWA cache)
- Custom profile themes (extra colour schemes)
- Early access to new features before general release
- "Plus" badge on profile

**What Pro (₹399/mo) adds — power user tier:**
- Everything in Plus
- Book live mentor sessions (video/voice/text)
- Downloadable certificates of completion
- Private study circles (unlimited)
- Full activity analytics export (CSV)
- Priority mentor matching

**What never requires money:**
- The coin shop — coins are earned by learning only, never bought
- Any content that teaches coding
- Connecting with peers or messaging

---

## STEP 3 — DB migrations

```sql
-- Add plan fields to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free' 
    CHECK (plan = ANY (ARRAY['free','plus','pro'])),
  ADD COLUMN IF NOT EXISTS plan_expires_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS ai_queries_today integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_queries_reset_at date DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS referral_code text UNIQUE;

-- Referral tracking
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL REFERENCES public.profiles(id),
  referred_id uuid NOT NULL REFERENCES public.profiles(id),
  status text DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending','converted'])),
  converted_at timestamp with time zone,
  reward_granted boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT referrals_pkey PRIMARY KEY (id),
  CONSTRAINT referrals_referred_unique UNIQUE (referred_id)
);
```

---

## STEP 4 — Plan definitions (single source of truth)

**Create `lib/plans.ts`:**

```ts
export type Plan = 'free' | 'plus' | 'pro'

export const PLAN_CONFIG = {
  free: {
    label: 'Free',
    price_monthly: 0,
    price_yearly: 0,
    ai_queries_per_day: 20,
    can_book_mentor: false,
    max_study_circles: 3,
    can_use_code_reviewer: false,
    can_use_interview_prep: false,
    can_export_analytics: false,
    can_get_certificate: false,
    can_save_offline: false,
    can_create_private_circles: false,
    has_plus_badge: false,
  },
  plus: {
    label: 'Plus',
    price_monthly: 149,
    price_yearly: 1490,
    ai_queries_per_day: Infinity,
    can_book_mentor: false,
    max_study_circles: 10,
    can_use_code_reviewer: true,
    can_use_interview_prep: true,
    can_export_analytics: false,
    can_get_certificate: false,
    can_save_offline: true,
    can_create_private_circles: false,
    has_plus_badge: true,
  },
  pro: {
    label: 'Pro',
    price_monthly: 399,
    price_yearly: 3990,
    ai_queries_per_day: Infinity,
    can_book_mentor: true,
    max_study_circles: 999,
    can_use_code_reviewer: true,
    can_use_interview_prep: true,
    can_export_analytics: true,
    can_get_certificate: true,
    can_save_offline: true,
    can_create_private_circles: true,
    has_plus_badge: true,
  },
} as const

export function getPlan(plan: string): Plan {
  if (plan === 'plus' || plan === 'pro') return plan
  return 'free'
}

export function canDo(plan: Plan, feature: keyof typeof PLAN_CONFIG.free): boolean {
  return !!PLAN_CONFIG[plan][feature]
}

// Used in UI to show what upgrading gives you
export const UPGRADE_REASONS: Record<string, { plan: Plan; label: string }> = {
  unlimited_ai: { plan: 'plus', label: 'Unlimited AI hints' },
  code_reviewer: { plan: 'plus', label: 'AI Code Reviewer' },
  interview_prep: { plan: 'plus', label: 'AI Interview Prep' },
  book_mentor: { plan: 'pro', label: 'Book live mentor sessions' },
  certificate: { plan: 'pro', label: 'Completion certificates' },
  analytics_export: { plan: 'pro', label: 'Analytics export' },
}
```

---

## STEP 5 — Soft upgrade prompt component (not a hard wall)

**Create `components/ui/UpgradeNudge.tsx`:**

This is shown as a gentle suggestion, never blocking the user from doing the free version of something. It appears inline, below the feature, not as a modal that interrupts the flow.

```tsx
'use client'
import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { Plan } from '@/lib/plans'

interface UpgradeNudgeProps {
  requiredPlan: Plan
  featureLabel: string
  compact?: boolean // for inline/small contexts
}

export function UpgradeNudge({ requiredPlan, featureLabel, compact = false }: UpgradeNudgeProps) {
  const planLabel = requiredPlan === 'plus' ? 'Plus (₹149/mo)' : 'Pro (₹399/mo)'

  if (compact) {
    return (
      <Link
        href="/settings?tab=billing"
        className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 hover:text-amber-700 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100"
      >
        <Sparkles size={10} />
        {planLabel}
      </Link>
    )
  }

  return (
    <div className="flex items-center justify-between gap-4 p-3 bg-zinc-50 border border-zinc-100 rounded-2xl">
      <div className="flex items-center gap-2">
        <Sparkles size={16} className="text-amber-500 shrink-0" />
        <div>
          <div className="text-sm font-bold text-zinc-800">{featureLabel}</div>
          <div className="text-xs text-zinc-500">Available with {planLabel}</div>
        </div>
      </div>
      <Link
        href="/settings?tab=billing"
        className="shrink-0 bg-zinc-900 text-white text-xs font-bold px-3 py-1.5 rounded-xl hover:bg-zinc-800"
      >
        Upgrade
      </Link>
    </div>
  )
}
```

**Important:** `UpgradeNudge` is shown ALONGSIDE the free version of a feature, not instead of it. For example, next to the AI query counter (not blocking the chat). The user can still use their 20 free queries — the nudge just tells them there's more.

---

## STEP 6 — AI rate limiting (soft, not hard)

**Create `lib/ai-rate-limit.ts`:**

```ts
import { createClient } from '@/utils/supabase/server'
import { PLAN_CONFIG, getPlan } from './plans'

export async function checkAiQuota(userId: string): Promise<{
  allowed: boolean
  used: number
  limit: number | typeof Infinity
  remaining: number | typeof Infinity
}> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, ai_queries_today, ai_queries_reset_at')
    .eq('id', userId)
    .single()

  if (!profile) return { allowed: false, used: 0, limit: 0, remaining: 0 }

  const plan = getPlan(profile.plan ?? 'free')
  const limit = PLAN_CONFIG[plan].ai_queries_per_day

  // Unlimited plans skip all counting
  if (limit === Infinity) {
    return { allowed: true, used: 0, limit: Infinity, remaining: Infinity }
  }

  // Reset if new day
  const needsReset = profile.ai_queries_reset_at !== today
  const used = needsReset ? 0 : (profile.ai_queries_today ?? 0)

  if (needsReset) {
    await supabase.from('profiles')
      .update({ ai_queries_today: 0, ai_queries_reset_at: today })
      .eq('id', userId)
  }

  const allowed = used < limit
  const remaining = Math.max(0, limit - used)

  return { allowed, used, limit, remaining }
}

export async function incrementAiQuota(userId: string): Promise<void> {
  const supabase = await createClient()
  const today = new Date().toISOString().split('T')[0]

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, ai_queries_today, ai_queries_reset_at')
    .eq('id', userId)
    .single()

  if (!profile) return

  const plan = getPlan(profile.plan ?? 'free')
  const limit = PLAN_CONFIG[plan].ai_queries_per_day

  // Don't count for unlimited plans
  if (limit === Infinity) return

  const needsReset = profile.ai_queries_reset_at !== today

  await supabase.from('profiles').update({
    ai_queries_today: needsReset ? 1 : (profile.ai_queries_today ?? 0) + 1,
    ai_queries_reset_at: today,
  }).eq('id', userId)
}
```

**Update all three AI routes** (`app/api/loopy/route.ts`, `app/api/loopy-chat/route.ts`, `app/api/generate-roadmap/route.ts`):

At the top of each POST handler, after auth check:

```ts
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

const quota = await checkAiQuota(user.id)

if (!quota.allowed) {
  return NextResponse.json({
    error: 'Daily AI limit reached',
    used: quota.used,
    limit: quota.limit,
    remaining: 0,
    reset: 'midnight',
    is_quota_error: true,
    upgrade_plan: 'plus',
  }, { status: 429 })
}

// After successful AI response, increment:
await incrementAiQuota(user.id)
```

**In the Loopy page frontend** (`app/(app)/loopy/page.tsx`):

When a 429 with `is_quota_error: true` is received, show a non-blocking message in the chat thread:

```tsx
// Add this as a message in the chat, not a modal:
{
  role: 'system',
  content: `You've used all 20 free AI hints for today 🦉 — they reset at midnight. 
  [Upgrade to Plus for unlimited →](/settings?tab=billing)`
}
```

Also show a small quota indicator near the chat input: `"AI hints: {remaining}/20"` for free users, hidden for Plus/Pro users. This normalises the limit rather than hiding it.

---

## STEP 7 — Stripe integration

**Install:** `npm install stripe`

**Add to `.env.local`** (add these as comments at the top of the checkout route file so the developer knows to set them):
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PLUS_MONTHLY_PRICE_ID=price_...
STRIPE_PLUS_YEARLY_PRICE_ID=price_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...
NEXT_PUBLIC_APP_URL=https://skloop.online
```

**Create `app/api/create-checkout/route.ts`:**

```ts
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@/utils/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' })

const PRICE_IDS: Record<string, string> = {
  plus_monthly: process.env.STRIPE_PLUS_MONTHLY_PRICE_ID!,
  plus_yearly: process.env.STRIPE_PLUS_YEARLY_PRICE_ID!,
  pro_monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID!,
  pro_yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID!,
}

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { plan, billing } = await req.json()
  // plan: 'plus' | 'pro', billing: 'monthly' | 'yearly'

  const priceKey = `${plan}_${billing}`
  const priceId = PRICE_IDS[priceKey]
  if (!priceId) return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })

  // Check if referred user — give 50% discount on Plus
  const { data: profile } = await supabase
    .from('profiles')
    .select('referred_by, stripe_customer_id')
    .eq('id', user.id)
    .single()

  const discounts = []
  if (profile?.referred_by && plan === 'plus') {
    // Apply referral coupon (create this coupon in Stripe dashboard: 50% off forever)
    if (process.env.STRIPE_REFERRAL_COUPON_ID) {
      discounts.push({ coupon: process.env.STRIPE_REFERRAL_COUPON_ID })
    }
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=billing&success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?tab=billing`,
    customer_email: user.email,
    customer: profile?.stripe_customer_id || undefined,
    discounts: discounts.length ? discounts : undefined,
    allow_promotion_codes: true, // Let users enter promo codes
    subscription_data: {
      trial_period_days: 7, // 7-day free trial for first-time subscribers
      metadata: { user_id: user.id, plan }
    },
    metadata: { user_id: user.id, plan },
  })

  return NextResponse.json({ url: session.url })
}
```

**Create `app/api/stripe-webhook/route.ts`:**

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
    return new Response('Invalid signature', { status: 400 })
  }

  const supabase = await createClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const userId = session.metadata?.user_id
    const plan = session.metadata?.plan as 'plus' | 'pro'
    if (!userId || !plan) return new Response('ok')

    // Get subscription end date
    let expiresAt: string | null = null
    if (session.subscription) {
      const sub = await stripe.subscriptions.retrieve(session.subscription as string)
      expiresAt = new Date(sub.current_period_end * 1000).toISOString()
    }

    await supabase.from('profiles').update({
      plan,
      plan_expires_at: expiresAt,
      stripe_customer_id: session.customer as string,
    }).eq('id', userId)

    // Grant referral reward to referrer if this is the referred user's first subscription
    const { data: referral } = await supabase
      .from('referrals')
      .select('*')
      .eq('referred_id', userId)
      .eq('status', 'pending')
      .maybeSingle()

    if (referral && !referral.reward_granted) {
      // Give referrer 1 month free — create a Stripe coupon or just extend their plan
      await supabase.from('referrals')
        .update({ status: 'converted', converted_at: new Date().toISOString(), reward_granted: true })
        .eq('id', referral.id)

      // Notify referrer
      await supabase.from('notifications').insert({
        user_id: referral.referrer_id,
        title: '🎉 Referral reward!',
        content: 'Your friend just upgraded. You\'ve earned 1 free month of Plus!',
        type: 'referral_reward',
      })

      // Extend referrer's plan by 1 month (simple: update plan_expires_at)
      const { data: referrerProfile } = await supabase
        .from('profiles')
        .select('plan, plan_expires_at')
        .eq('id', referral.referrer_id)
        .single()

      if (referrerProfile) {
        const currentExpiry = referrerProfile.plan_expires_at
          ? new Date(referrerProfile.plan_expires_at)
          : new Date()
        currentExpiry.setMonth(currentExpiry.getMonth() + 1)
        await supabase.from('profiles').update({
          plan: referrerProfile.plan === 'free' ? 'plus' : referrerProfile.plan,
          plan_expires_at: currentExpiry.toISOString(),
        }).eq('id', referral.referrer_id)
      }
    }
  }

  if (event.type === 'customer.subscription.updated') {
    const sub = event.data.object as Stripe.Subscription
    // Sync expiry date on renewal
    const userId = sub.metadata?.user_id
    if (userId) {
      await supabase.from('profiles').update({
        plan_expires_at: new Date(sub.current_period_end * 1000).toISOString(),
      }).eq('id', userId)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    const userId = sub.metadata?.user_id
    if (userId) {
      await supabase.from('profiles').update({
        plan: 'free',
        plan_expires_at: null,
      }).eq('id', userId)
    }
  }

  return new Response('ok')
}

// Stripe sends raw body — disable Next.js body parsing
export const config = { api: { bodyParser: false } }
```

---

## STEP 8 — Billing settings page (real UI)

**File:** `app/(app)/settings/page.tsx` — replace the `BillingSettings` stub with a real component.

**Layout of the billing tab:**

**Current plan card at top:**
- If free: "Free Plan — You're learning for free 🎉" with an "Upgrade" CTA
- If Plus: "Plus Plan — Renews {date}" with "Manage" and "Cancel" links
- If Pro: "Pro Plan — Renews {date}" with "Manage" and "Cancel" links

**"Yearly saves 2 months" toggle** — switches displayed prices between monthly and yearly.

**Three plan cards side by side** (or stacked on mobile):

Each card has:
- Plan name + price (large)
- One-line tagline
- Feature list (checkmarks for included, dashes for not)
- CTA button: "Current Plan" (disabled, if active), "Start 7-day trial" (if upgrading), "Downgrade" (if currently higher)

Feature list for each card — keep it short and honest:

**Free (₹0):**
- ✓ All courses and lessons
- ✓ All quests, chests, streaks
- ✓ Peer chat and study circles (up to 3)
- ✓ Daily games (Codele, typing, quiz)
- ✓ 20 AI hints per day
- ✓ Leaderboards and leagues
- – Unlimited AI hints
- – Live mentor sessions
- – Completion certificates

**Plus (₹149/mo or ₹1490/yr):**
- ✓ Everything in Free
- ✓ Unlimited AI hints
- ✓ AI Code Reviewer
- ✓ AI Interview Prep Mode
- ✓ Plus badge on profile
- ✓ Early access to new features
- – Live mentor sessions
- – Completion certificates

**Pro (₹399/mo or ₹3990/yr):**
- ✓ Everything in Plus
- ✓ Book live mentor sessions
- ✓ 1-on-1 video/voice/text calls
- ✓ Completion certificates
- ✓ Private study circles (unlimited)
- ✓ Analytics export

The Plus card gets a "Most Popular" badge. The Pro card gets an "For Serious Learners" badge.

**Clicking "Start 7-day trial"** calls `fetch('/api/create-checkout', { method: 'POST', body: JSON.stringify({ plan, billing }) })` and redirects to the returned `url`.

**Below the cards:**
A small FAQ accordion with 3-4 questions:
- "Can I cancel anytime?" — Yes, cancel from your account. No questions asked.
- "What happens to my progress if I downgrade?" — Nothing. All your XP, streaks, and badges stay forever.
- "Is the free tier limited?" — No content is locked behind payment. Plus/Pro add convenience features, not content.
- "Do you have student discounts?" — Yes — join via a friend's referral link for 50% off Plus forever.

---

## STEP 9 — Referral system

**Create `actions/referral-actions.ts`:**

```ts
'use server'
import { createClient } from '@/utils/supabase/server'
import { nanoid } from 'nanoid' // install: npm install nanoid

export async function getOrCreateReferralCode(): Promise<string> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Unauthorized')

  const { data: profile } = await supabase
    .from('profiles')
    .select('referral_code, username')
    .eq('id', user.id)
    .single()

  if (profile?.referral_code) return profile.referral_code

  // Generate a code based on username + random suffix
  const base = (profile?.username ?? 'user').toLowerCase().replace(/[^a-z0-9]/g, '')
  const code = `${base}-${nanoid(4)}`

  await supabase.from('profiles')
    .update({ referral_code: code })
    .eq('id', user.id)

  return code
}

export async function applyReferralCode(code: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Can't use own code
  const { data: currentProfile } = await supabase
    .from('profiles')
    .select('referral_code, referred_by')
    .eq('id', user.id)
    .single()

  if (currentProfile?.referred_by) return { success: false, error: 'You have already used a referral code.' }
  if (currentProfile?.referral_code === code) return { success: false, error: 'You cannot use your own referral code.' }

  // Find referrer
  const { data: referrer } = await supabase
    .from('profiles')
    .select('id')
    .eq('referral_code', code)
    .maybeSingle()

  if (!referrer) return { success: false, error: 'Invalid referral code.' }

  // Link the referral
  await supabase.from('profiles').update({ referred_by: referrer.id }).eq('id', user.id)
  await supabase.from('referrals').insert({
    referrer_id: referrer.id,
    referred_id: user.id,
  })

  return { success: true }
}

export async function getReferralStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: referrals } = await supabase
    .from('referrals')
    .select('status, converted_at, profiles!referrals_referred_id_fkey(username, avatar_url)')
    .eq('referrer_id', user.id)
    .order('created_at', { ascending: false })

  return {
    total: referrals?.length ?? 0,
    converted: referrals?.filter(r => r.status === 'converted').length ?? 0,
    pending: referrals?.filter(r => r.status === 'pending').length ?? 0,
    referrals: referrals ?? [],
  }
}
```

Install: `npm install nanoid`

**Add a "Refer Friends" tab to the settings page:**

A clean referral page with:
- User's unique referral link: `https://skloop.online/signup?ref={code}` (with copy button)
- "Share on WhatsApp" / "Share on Twitter" buttons (simple `window.open` with pre-filled text)
- How it works: 3-step explainer (Friend joins → Friend upgrades → You get 1 free month of Plus)
- Stats: Total referrals / Converted / Free months earned
- List of referred users with their status (pending/converted) and their avatar

**In `app/(app)/signup/page.tsx` (or auth layout):**
Check for `?ref={code}` in the URL params after signup and call `applyReferralCode(code)` automatically. Store the ref code in localStorage during signup flow so it survives OAuth redirects too.

---

## STEP 10 — Plan-aware features in the UI

**Apply plan gates softly in these specific places — never blocking core learning:**

### AI quota indicator in Loopy page
```tsx
// Show only for free users, near the input box
{plan === 'free' && (
  <div className="flex items-center justify-between text-xs text-zinc-400 px-4 pb-1">
    <span>AI hints: {remaining}/20 today</span>
    {remaining < 5 && (
      <UpgradeNudge requiredPlan="plus" featureLabel="Unlimited hints" compact />
    )}
  </div>
)}
```

### AI Code Review tab in Loopy
Show the tab for all users. For free users, it's clickable — but when they try to send a message in that mode, show the UpgradeNudge inline:
```tsx
{plan === 'free' ? (
  <UpgradeNudge
    requiredPlan="plus"
    featureLabel="AI Code Reviewer analyzes your code for bugs and improvements"
  />
) : (
  <CodeReviewInterface />
)}
```

### Mentor booking button
The mentor video library is always fully accessible. Only the "Book a session" button is gated:
```tsx
{canDo(plan, 'can_book_mentor') ? (
  <Link href={`/mentorship/book/${mentor.id}`} className="...">Book Session</Link>
) : (
  <div className="space-y-2">
    <button disabled className="... opacity-50">Book Session</button>
    <UpgradeNudge requiredPlan="pro" featureLabel="Book live 1-on-1 sessions" compact />
  </div>
)}
```

### Plus badge on profile
```tsx
{profile?.plan === 'plus' || profile?.plan === 'pro' ? (
  <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
    ✦ PLUS
  </span>
) : null}
```

### Study circle creation limit
When a free user tries to create a 4th study circle:
```tsx
if (userCircleCount >= PLAN_CONFIG[plan].max_study_circles) {
  toast("You can join up to 3 circles on the free plan. Upgrade for more.", "info")
  // Show UpgradeNudge below the create button instead of blocking
}
```

---

## STEP 11 — Add plan to UserContext

**File:** `context/UserContext.tsx`

Add `plan` to the `UserProfile` interface:
```ts
interface UserProfile {
  // ...existing fields
  plan: 'free' | 'plus' | 'pro'
  plan_expires_at: string | null
  referral_code: string | null
}
```

Add `plan` to the profile select query in the layout and UserProvider. Default to `'free'` if null.

Export a `usePlan()` convenience hook:
```ts
export function usePlan() {
  const { profile } = useUser()
  const plan = getPlan(profile?.plan ?? 'free')
  return {
    plan,
    isPlus: plan === 'plus' || plan === 'pro',
    isPro: plan === 'pro',
    isFree: plan === 'free',
    canDo: (feature: keyof typeof PLAN_CONFIG.free) => canDo(plan, feature),
  }
}
```

---

## STEP 12 — Verification checklist

- [ ] `lib/plans.ts` exists with `PLAN_CONFIG`, `getPlan`, `canDo`, `UPGRADE_REASONS`
- [ ] `components/ui/UpgradeNudge.tsx` exists with compact and full variants
- [ ] `lib/ai-rate-limit.ts` exists with `checkAiQuota` and `incrementAiQuota`
- [ ] All three AI routes call `checkAiQuota` and return 429 with `is_quota_error: true` when over limit
- [ ] Free users see "AI hints: X/20 today" near the Loopy input
- [ ] When quota is hit, message appears in chat — not a blocking modal
- [ ] Stripe checkout route exists at `/api/create-checkout`
- [ ] Stripe webhook route exists at `/api/stripe-webhook`
- [ ] Webhook handles: checkout.session.completed, subscription.updated, subscription.deleted
- [ ] `profiles.plan` is updated on successful checkout
- [ ] Billing settings tab shows three real plan cards with feature lists
- [ ] "Start 7-day trial" CTA calls the checkout endpoint
- [ ] Billing page has FAQ accordion with honest answers
- [ ] `actions/referral-actions.ts` exists with `getOrCreateReferralCode`, `applyReferralCode`, `getReferralStats`
- [ ] Settings page has a "Refer Friends" tab with referral link + copy button
- [ ] `?ref=code` in signup URL automatically applies referral
- [ ] Referrer gets 1 free month of Plus when referred user converts (via webhook)
- [ ] `usePlan()` hook exported from `context/UserContext.tsx`
- [ ] Plus badge shown on profile for Plus/Pro users
- [ ] Mentor booking button shows UpgradeNudge for free/Plus users (Pro only)
- [ ] AI Code Reviewer shows UpgradeNudge for free users (Plus unlocks)
- [ ] Study circle creation shows UpgradeNudge when limit reached (not hard block)
- [ ] Nothing in the core learning path is gated — all courses, lessons, quests accessible to free users

---

## Important notes

- Stack: Next.js 16, React 19, Supabase SSR, TypeScript, Tailwind CSS 4
- Add `stripe` and `nanoid` as new dependencies
- `canDo()` from `lib/plans.ts` is the only way to check plan features — never inline plan string comparisons
- The `UpgradeNudge` is a suggestion, never a blocker for learning features
- Coins remain entirely separate from the payment system — they are earned through learning and spent on cosmetics only, never bought with real money
- The 7-day free trial is only for first-time subscribers — check `stripe_customer_id` is null before applying
- Referral discount (50% off Plus forever) requires creating a Stripe coupon with `forever` duration in the Stripe dashboard, then setting `STRIPE_REFERRAL_COUPON_ID` in env
- All server actions and API routes must call `supabase.auth.getUser()` first
- Do not gate any lesson, quest, streak, leaderboard, or gamification feature