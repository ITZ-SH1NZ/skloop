# Skloop — Duolingo-Like Features Prompt

You are working on **Skloop**, a Next.js 16 + Supabase gamified coding education platform.
Read every file listed in Step 1 before writing any code. These changes are purely additive — do not remove any existing functionality.

---

## STEP 1 — Read these files first (required)

```
components/lesson/LessonLayout.tsx
components/lesson/QuizView.tsx
components/lesson/ChallengeView.tsx
components/lesson/ArticleView.tsx
components/lesson/VideoView.tsx
components/roadmap/GamifiedPath.tsx
components/loopy/LoopyMascot.tsx
components/loopy/LoopyHeader.tsx
components/dashboard/DashboardHeader.tsx
components/dashboard/DailyQuestsWidget.tsx
components/ui/RewardBurst.tsx
components/shell/AppShell.tsx
app/setup/page.tsx
app/(app)/lesson/[lessonId]/page.tsx
app/(app)/roadmap/page.tsx
lib/sound.ts
context/UserContext.tsx
actions/user-actions.ts
actions/quest-actions.ts
```

---

## STEP 2 — DB Schema additions needed

Add these as migration comments at the top of the relevant action files. Run them in Supabase SQL editor before deploying.

```sql
-- REQUIRED: Lesson sessions table for tracking lesson attempts
CREATE TABLE IF NOT EXISTS public.lesson_sessions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  topic_id uuid NOT NULL,
  started_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone,
  status text DEFAULT 'active' CHECK (status = ANY (ARRAY['active','completed','abandoned'])),
  hearts_lost integer DEFAULT 0,
  questions_correct integer DEFAULT 0,
  questions_total integer DEFAULT 0,
  xp_earned integer DEFAULT 0,
  is_perfect boolean DEFAULT false,
  CONSTRAINT lesson_sessions_pkey PRIMARY KEY (id),
  CONSTRAINT lesson_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT lesson_sessions_topic_id_fkey FOREIGN KEY (topic_id) REFERENCES public.topics(id)
);

-- REQUIRED: Add strength score to topic progress for spaced repetition
ALTER TABLE public.user_topic_progress
  ADD COLUMN IF NOT EXISTS strength integer DEFAULT 5 CHECK (strength >= 0 AND strength <= 5),
  ADD COLUMN IF NOT EXISTS times_correct integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS times_wrong integer DEFAULT 0;

-- REQUIRED: Weekly league memberships
CREATE TABLE IF NOT EXISTS public.league_members (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  league_week text NOT NULL, -- e.g. '2026-W12'
  division text DEFAULT 'bronze' CHECK (division = ANY (ARRAY['bronze','silver','gold','diamond'])),
  weekly_xp integer DEFAULT 0,
  rank integer,
  CONSTRAINT league_members_pkey PRIMARY KEY (id),
  CONSTRAINT league_members_user_week_unique UNIQUE (user_id, league_week),
  CONSTRAINT league_members_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);
```

---

## STEP 3 — Implement all features IN ORDER

---

### 🎮 FEATURE 1 — Hearts (Lives) system inside lessons

**Files to modify:** `components/lesson/QuizView.tsx`, `components/lesson/ChallengeView.tsx`, `components/lesson/LessonLayout.tsx`, `app/(app)/lesson/[lessonId]/page.tsx`

**What to build:**

Add a hearts system with 3 lives per lesson session. Each wrong answer costs 1 heart. Losing all 3 ends the lesson with a "defeated" screen.

**In `LessonLayout.tsx`:**

Add `hearts`, `maxHearts`, and `onHeartLost` as optional props with defaults:
```tsx
interface LessonLayoutProps {
    // ...existing props
    hearts?: number        // current hearts (default 3)
    maxHearts?: number     // max hearts (default 3)
    onHeartLost?: () => void
    totalSteps?: number    // for progress bar
    currentStep?: number   // for progress bar
}
```

In the header, add a hearts display to the right side — small heart icons, filled red when active, grey outline when lost. Animate a heart breaking (scale down + fade) when one is lost using Framer Motion.

Add a thin progress bar **above** the header (not in it — a 4px strip at the very top of the screen):
```tsx
<div className="h-1 w-full bg-zinc-100">
    <motion.div
        className="h-full bg-[#D4F268] rounded-full"
        animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
    />
</div>
```

**In `QuizView.tsx`:**

1. Add hearts state: `const [hearts, setHearts] = useState(3)`
2. On wrong answer in `handleOptionClick`, call `setHearts(h => h - 1)` and play an error sound via `soundManager`
3. Replace the quiet "Next Question" flow with a **full-width animated feedback banner** at the bottom of the screen that slides up from below on every answer:

```tsx
// Correct answer banner
<motion.div
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="fixed bottom-0 left-0 right-0 bg-[#D4F268] border-t-4 border-[#a3e635] p-4 md:p-6 flex items-center justify-between z-50"
>
    <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
            <Check className="text-[#4d7c0f]" size={22} />
        </div>
        <div>
            <div className="font-black text-[#1a2e05] text-lg">Correct!</div>
            <div className="text-[#4d7c0f] text-sm font-medium">+{xpForQuestion} XP</div>
        </div>
    </div>
    <button onClick={handleNext} className="bg-[#4d7c0f] text-white font-black px-6 py-3 rounded-2xl">
        Continue
    </button>
</motion.div>

// Wrong answer banner
<motion.div
    initial={{ y: 100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    className="fixed bottom-0 left-0 right-0 bg-red-50 border-t-4 border-red-400 p-4 md:p-6 flex items-center justify-between z-50"
>
    <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
            <X className="text-red-600" size={22} />
        </div>
        <div>
            <div className="font-black text-red-700 text-lg">Incorrect</div>
            <div className="text-red-500 text-sm">Correct answer: <span className="font-bold">{correctAnswerText}</span></div>
        </div>
    </div>
    <button onClick={handleNext} className="bg-red-500 text-white font-black px-6 py-3 rounded-2xl">
        Continue
    </button>
</motion.div>
```

4. Add a `hearts <= 0` check — when the last heart breaks, show a "defeated" screen instead of continuing:

```tsx
// Defeated screen
<div className="flex flex-col items-center justify-center min-h-screen gap-6 text-center p-8">
    <LoopyMascot size={120} mood="screaming" />
    <h2 className="text-3xl font-black text-zinc-900">You ran out of hearts!</h2>
    <p className="text-zinc-500 max-w-sm">Don't give up — practice makes perfect. Try again or use a streak shield.</p>
    <div className="flex gap-3">
        <button onClick={onRetry} className="bg-zinc-900 text-white font-black px-6 py-3 rounded-2xl">Try Again</button>
        <button onClick={onExit} className="bg-zinc-100 text-zinc-600 font-bold px-6 py-3 rounded-2xl">Exit Lesson</button>
    </div>
</div>
```

5. Thread heart state up to `app/(app)/lesson/[lessonId]/page.tsx` — pass `hearts` and `onHeartLost` down through the lesson type components.

**Perfect lesson bonus:** If `heartsLost === 0` at lesson completion, add `+50%` XP multiplier and show a "PERFECT! 🎯" badge on the completion screen.

---

### 📊 FEATURE 2 — Progress bar in lesson header + Loopy reactions

**Files to modify:** `components/lesson/LessonLayout.tsx`, `app/(app)/lesson/[lessonId]/page.tsx`

**What to build:**

The progress bar is already described in Feature 1. Additionally:

Add a small **Loopy companion** to every lesson — bottom-right corner, 60px size, reacts to what's happening:

```tsx
// In LessonLayout, add Loopy to bottom-right
<div className="fixed bottom-6 right-6 z-40 pointer-events-none">
    <LoopyMascot
        size={60}
        mood={loopyMood}  // passed as prop
        isStatic={false}
    />
</div>
```

Pass `loopyMood` as a prop from the parent page, which updates it based on events:
- Default/idle: `"happy"`
- Correct answer: `"celebrating"` (reset to happy after 2s)
- Wrong answer: `"annoyed"` (reset to happy after 2s)
- Lost all hearts: `"screaming"`
- Lesson complete: `"celebrating"` + `hasCrown={true}`
- Video lesson: `"thinking"`

In `app/(app)/lesson/[lessonId]/page.tsx`, manage `loopyMood` state and pass it down.

---

### ✨ FEATURE 3 — XP flies to the XP bar visually

**Files to modify:** `components/ui/RewardBurst.tsx`, `components/dashboard/DashboardHeader.tsx`, `components/lesson/LessonLayout.tsx`

**What to build:**

The existing `RewardBurst` animates XP particles upward but they disappear off-screen. Make them fly to a real destination.

1. Add a DOM ref to the XP counter in `DashboardHeader.tsx`:
```tsx
<div ref={xpBarRef} id="xp-bar-target" className="...existing classes...">
    {/* existing XP display */}
</div>
```

2. In `RewardBurst.tsx`, accept an optional `targetRef` prop. When provided, animate particles to fly to the target element's position rather than off-screen:
```tsx
// Calculate target position
const targetRect = targetRef?.current?.getBoundingClientRect()
const targetX = targetRect ? targetRect.left + targetRect.width / 2 : 100
const targetY = targetRect ? targetRect.top + targetRect.height / 2 : 20

// In the particle animation:
animate={{
    x: [p.x, p.x + (Math.random() - 0.5) * 150, targetX],
    y: [p.y, p.y - 100 - Math.random() * 100, targetY],
    opacity: [1, 1, 0],
    scale: [0.5, 1.2, 0.3],
}}
```

3. When particles arrive at the XP bar, trigger the existing XP counter animation (it already has a `key={userProfile?.xp}` animation — ensure this fires after particle arrival with a 200ms delay).

4. On the lesson completion screen, show a "level up" animation if the XP crosses a level threshold:
```tsx
// After XP is awarded, check if level changed
if (newLevel > oldLevel) {
    setShowLevelUp(true)  // triggers a full-screen level-up overlay
}
```

Level-up overlay: full screen, Loopy with crown, large level number, lime green background, auto-dismisses after 2.5s.

---

### 🔥 FEATURE 4 — Streak at-risk system

**Files to modify:** `components/dashboard/DashboardHeader.tsx`, `app/(app)/dashboard/page.tsx`, `components/dashboard/DailyQuestsWidget.tsx`

**What to build:**

Currently streak is just a number. Add emotional urgency around it.

**1. Pulsing flame when streak is at risk today:**

In `DashboardHeader.tsx`, check if the user has done any activity today:
```tsx
const hasActivityToday = /* check if any quest completed today from questsData */
const streakAtRisk = (userProfile?.streak ?? 0) > 0 && !hasActivityToday
```

When `streakAtRisk` is true:
- Add a pulsing red glow behind the flame icon: `animate={{ boxShadow: ['0 0 0px #ef4444', '0 0 12px #ef4444', '0 0 0px #ef4444'] }}`
- Change the streak number colour to red
- Add a small "!" badge on the streak icon

**2. Streak-at-risk banner on dashboard:**

In `app/(app)/dashboard/page.tsx`, show a dismissible banner at the top when `streakAtRisk`:
```tsx
{streakAtRisk && !bannerDismissed && (
    <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-orange-50 border border-orange-200 rounded-2xl p-4 flex items-center justify-between mb-4"
    >
        <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
                <div className="font-bold text-orange-900">Your {userProfile?.streak}-day streak is at risk!</div>
                <div className="text-orange-600 text-sm">Complete any lesson or daily quest to protect it.</div>
            </div>
        </div>
        <button onClick={() => setBannerDismissed(true)} className="text-orange-400 hover:text-orange-600">
            <X size={18} />
        </button>
    </motion.div>
)}
```

**3. Streak-break screen:**

In `actions/user-actions.ts`, `processDailyLogin` already handles streak resets. After a streak reset, set a flag in the profile's `active_powers` jsonb: `{ streak_broken: true, streak_broken_at: now() }`.

In `app/(app)/dashboard/page.tsx`, check for this flag on mount. If present and within the last 24h, show a full-screen modal:
```tsx
// Streak broken modal
<div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
    <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-3xl p-8 max-w-sm w-full text-center"
    >
        <LoopyMascot size={100} mood="huddled" />
        <h2 className="text-2xl font-black mt-4 text-zinc-900">Streak lost 😢</h2>
        <p className="text-zinc-500 mt-2">Your {previousStreak}-day streak has ended. But every expert was once a beginner.</p>
        <button onClick={dismissStreakModal} className="mt-6 bg-zinc-900 text-white font-black px-8 py-3 rounded-2xl w-full">
            Start a new streak
        </button>
    </motion.div>
</div>
```

After dismissing, clear the `streak_broken` flag from `active_powers`.

---

### 🗺️ FEATURE 5 — Lesson path nodes become large visual bubbles

**Files to modify:** `components/roadmap/GamifiedPath.tsx`

**What to build:**

The existing path nodes are relatively small. Make them large, expressive, Duolingo-style circular bubbles.

In the section where individual topic nodes are rendered, replace the current node component with a larger bubble:

```tsx
// Topic node bubble (replace existing node rendering)
<motion.div
    className="relative cursor-pointer select-none"
    style={{ width: 80, height: 80 }}
    whileHover={status !== 'locked' ? { scale: 1.1, y: -4 } : {}}
    whileTap={status !== 'locked' ? { scale: 0.95 } : {}}
    onClick={() => status !== 'locked' && handleNodeClick(node)}
>
    {/* Outer ring — shows completion */}
    <div className={`absolute inset-0 rounded-full border-4 ${
        status === 'completed' ? 'border-[#D4F268] bg-[#D4F268]' :
        status === 'active'    ? 'border-zinc-900 bg-white shadow-xl shadow-zinc-900/20' :
                                 'border-zinc-200 bg-zinc-100'
    }`}>
        {/* Inner icon */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
            <span className="text-2xl">
                {status === 'completed' ? '✓' :
                 status === 'locked'    ? '🔒' :
                 node.type === 'video'     ? '▶' :
                 node.type === 'quiz'      ? '🧠' :
                 node.type === 'challenge' ? '⚔️' : '📖'}
            </span>
            {status !== 'locked' && (
                <span className="text-[9px] font-black text-zinc-500">+{node.xp_reward}XP</span>
            )}
        </div>
    </div>

    {/* Active node: bouncing indicator */}
    {status === 'active' && (
        <motion.div
            className="absolute -top-2 left-1/2 -translate-x-1/2"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
        >
            <div className="bg-zinc-900 text-white text-[10px] font-black px-2 py-0.5 rounded-full whitespace-nowrap">
                START
            </div>
        </motion.div>
    )}

    {/* Completed: star burst */}
    {status === 'completed' && (
        <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center text-[10px]">
            ⭐
        </div>
    )}
</motion.div>
```

Also add a **node label** below each bubble showing the topic title (truncated to 12 chars), visible for active and completed nodes:
```tsx
<div className="text-center mt-1.5 max-w-[88px]">
    <span className="text-[11px] font-bold text-zinc-600 leading-tight line-clamp-2">
        {node.title}
    </span>
</div>
```

---

### 🏆 FEATURE 6 — Lesson completion screen with perfect bonus

**Files to modify:** `app/(app)/lesson/[lessonId]/page.tsx`, create `components/lesson/LessonComplete.tsx`

**What to build:**

Create a new `LessonComplete` component that shows after any lesson type is finished:

```tsx
// components/lesson/LessonComplete.tsx
interface LessonCompleteProps {
    xpEarned: number
    isPerfect: boolean
    streak: number
    onContinue: () => void
    topicTitle: string
}
```

Layout:
1. Full screen, white background
2. Large Loopy mascot (120px) — `celebrating` mood, `hasCrown={isPerfect}`
3. Title: "Lesson Complete!" or "PERFECT! ⚡" if `isPerfect`
4. XP awarded with animated count-up: `+{xpEarned} XP` — use the existing `CountUp` component
5. If perfect: show a "Perfect Lesson" badge with golden border, "+50% XP bonus" pill
6. Streak count with flame: "🔥 {streak} day streak"
7. Two buttons: "Continue" → next lesson, "Back to Path" → course page

Trigger `RewardBurst` automatically when this screen mounts. Play `soundManager.playRocketLaunch(0.6)` on mount.

In `app/(app)/lesson/[lessonId]/page.tsx`:
- Track `heartsLost` across the lesson session
- On `onComplete` callback from any lesson type, calculate: `isPerfect = heartsLost === 0`, `finalXp = isPerfect ? Math.round(baseXp * 1.5) : baseXp`
- Pass to `LessonComplete` and render it instead of navigating away immediately

---

### 🎯 FEATURE 7 — Duolingo-style onboarding (replaces current setup page)

**Files to modify:** `app/setup/page.tsx`

**What to build:**

Replace the current skill marketplace setup (Guitar, Cooking, Yoga) with a coder placement flow:

**Step 1 — Pick your track:**
Two big cards: "Web Development 🌐" and "Data Structures & Algorithms 🧠". Single select, required.

**Step 2 — What's your level?**
Three options with descriptions:
- "Complete Beginner" — I've never written code before
- "Some Experience" — I know some HTML/CSS or basic programming
- "Intermediate" — I'm comfortable with the basics, want to go deeper

**Step 3 — Set your daily goal:**
Four XP targets as cards: Casual (10 XP/day), Regular (20 XP/day), Serious (30 XP/day), Intense (50 XP/day). Each shows an estimated "~X minutes/day."

**Step 4 — 3-question placement quiz:**
Show 3 short questions matching their chosen track and level. For Web Dev beginner: "What does HTML stand for?", "Which tag creates a link?", "What does CSS stand for?". For DSA: similar basic questions.

Track correct answers. At the end:
- 3/3 correct → "You're a Code Veteran! Starting at Module 2"
- 1-2/3 → "Smart start! Beginning at Module 1"
- 0/3 → "Perfect place to start! Beginning at the very beginning"

Show a placement result screen: large Loopy (celebrating), placement title, which module they're starting at. Then redirect to `/roadmap`.

Save to profile: update `role` with their self-reported level, save their daily XP goal to `active_powers` as `{ daily_xp_goal: 20 }`.

Each step should use the same slide-in/slide-out Framer Motion transitions from the existing setup page. Keep the step indicator dots at the top.

---

### 📱 FEATURE 8 — Streak protection & daily reminder banner

**Files to modify:** `app/(app)/dashboard/page.tsx`, `components/notifications/NotificationListener.tsx`, create `app/api/daily-reminder/route.ts`

**What to build:**

**1. Daily reminder API route** (`app/api/daily-reminder/route.ts`):

A GET endpoint (to be called by a Vercel cron or Supabase cron) that inserts notifications for users who haven't had any `activity_logs` entry today:
```ts
export async function GET(req: Request) {
    // Verify cron secret header: req.headers.get('x-cron-secret') === process.env.CRON_SECRET
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]

    // Find users with a streak > 0 who have NO activity_log for today
    const { data: atRiskUsers } = await supabase
        .from('profiles')
        .select('id, streak')
        .gt('streak', 0)
        // subquery: no activity_logs today

    for (const user of atRiskUsers ?? []) {
        await supabase.from('notifications').insert({
            user_id: user.id,
            title: `🔥 Your ${user.streak}-day streak is at risk!`,
            content: 'Complete a lesson or daily quest before midnight to protect it.',
            type: 'streak_warning'
        })
    }
    return Response.json({ notified: atRiskUsers?.length ?? 0 })
}
```

Add to `vercel.json` (create if it doesn't exist):
```json
{
    "crons": [{
        "path": "/api/daily-reminder",
        "schedule": "0 19 * * *"
    }]
}
```

**2. In-app reminder:** Already handled in Feature 4's streak-at-risk banner.

**3. NotificationListener enhancement:**

When a `streak_warning` notification arrives via realtime, don't just toast it — trigger the pulsing flame animation in `DashboardHeader` by emitting a custom event:
```ts
// In NotificationListener, when type === 'streak_warning':
window.dispatchEvent(new CustomEvent('streak-warning'))

// In DashboardHeader:
useEffect(() => {
    const handler = () => setStreakAtRisk(true)
    window.addEventListener('streak-warning', handler)
    return () => window.removeEventListener('streak-warning', handler)
}, [])
```

---

### 💎 FEATURE 9 — Weekly XP Leagues

**Files to modify:** `app/(app)/peer/leaderboard/page.tsx`, `components/peer/LeaderboardTable.tsx`, create `components/peer/LeagueWidget.tsx`, add `actions/league-actions.ts`

**What to build:**

Create a league system where users compete in groups of ~30 for weekly XP.

**`actions/league-actions.ts`** (new file):
```ts
'use server'
import { createClient } from '@/utils/supabase/server'

function getWeekKey(date = new Date()) {
    // returns e.g. '2026-W12'
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + 3 - (d.getDay() + 6) % 7)
    const week1 = new Date(d.getFullYear(), 0, 4)
    const weekNum = 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7)
    return `${d.getFullYear()}-W${String(weekNum).padStart(2, '0')}`
}

export async function getOrJoinLeague(userId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Unauthorized' }

    const weekKey = getWeekKey()

    // Check if already in a league this week
    const { data: existing } = await supabase
        .from('league_members')
        .select('*')
        .eq('user_id', user.id)
        .eq('league_week', weekKey)
        .maybeSingle()

    if (existing) return { success: true, member: existing }

    // Join or create a league: find a group with < 30 members this week in same division
    // Use user's current level to determine starting division
    const { data: profile } = await supabase.from('profiles').select('level').eq('id', user.id).single()
    const division = (profile?.level ?? 1) >= 10 ? 'gold' : (profile?.level ?? 1) >= 5 ? 'silver' : 'bronze'

    const { data: newMember } = await supabase
        .from('league_members')
        .insert({ user_id: user.id, league_week: weekKey, division, weekly_xp: 0 })
        .select().single()

    return { success: true, member: newMember }
}

export async function getLeagueStandings(userId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const weekKey = getWeekKey()

    const { data } = await supabase
        .from('league_members')
        .select('*, profiles(username, avatar_url, level)')
        .eq('league_week', weekKey)
        .order('weekly_xp', { ascending: false })
        .limit(30)

    return data ?? []
}

export async function incrementLeagueXp(userId: string, xpAmount: number) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const weekKey = getWeekKey()
    await supabase.rpc('increment_league_xp', { 
        x_user_id: user.id, 
        x_week_key: weekKey,
        x_xp: xpAmount 
    })
}
```

Add a migration comment for the RPC:
```sql
-- CREATE OR REPLACE FUNCTION increment_league_xp(x_user_id uuid, x_week_key text, x_xp integer)
-- RETURNS void LANGUAGE plpgsql AS $$
-- BEGIN
--   UPDATE league_members SET weekly_xp = weekly_xp + x_xp
--   WHERE user_id = x_user_id AND league_week = x_week_key;
-- END; $$;
```

**`components/peer/LeagueWidget.tsx`** (new component):

A card showing the user's current league standing:
- Division badge (Bronze/Silver/Gold/Diamond with appropriate colors)
- "Week ends in X days" countdown
- Top 5 of their group with XP bars
- User's own rank highlighted
- "Top 10 get promoted" / "Bottom 5 get demoted" info line

Add this widget to the leaderboard page as a tab alongside the existing global leaderboard.

Also call `incrementLeagueXp` from `claimQuestProgress` in `actions/quest-actions.ts` whenever XP is awarded — just after the `increment_profile_stats` RPC call.

---

### 👥 FEATURE 10 — Friend activity feed on dashboard

**Files to modify:** `app/(app)/dashboard/page.tsx`, `components/dashboard/DashboardHeader.tsx`, create `components/dashboard/FriendActivityFeed.tsx`, add fetcher to `lib/swr-fetchers.ts`

**What to build:**

**Add to `lib/swr-fetchers.ts`:**
```ts
export const fetchFriendActivity = async ([key, userId]: [string, string]) => {
    const supabase = createClient()

    // Get accepted connection IDs
    const { data: connections } = await supabase
        .from('connections')
        .select('requester_id, recipient_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`)
        .limit(50)

    if (!connections?.length) return []

    const friendIds = connections.map(c => c.requester_id === userId ? c.recipient_id : c.requester_id)

    // Get their recent timeline events
    const { data: events } = await supabase
        .from('user_timeline')
        .select('*, profiles(username, avatar_url)')
        .in('user_id', friendIds)
        .order('created_at', { ascending: false })
        .limit(8)

    return events ?? []
}
```

**`components/dashboard/FriendActivityFeed.tsx`** (new component):

A compact feed card for the dashboard sidebar showing up to 5 recent friend activities:
```tsx
// Each item:
<div className="flex items-center gap-3 py-2">
    <Avatar src={event.profiles.avatar_url} size="sm" />
    <div className="flex-1 min-w-0">
        <span className="font-bold text-sm">{event.profiles.username}</span>
        <span className="text-zinc-500 text-sm"> {event.title.toLowerCase()}</span>
    </div>
    <span className="text-xs text-zinc-400 shrink-0">{timeAgo(event.created_at)}</span>
</div>
```

If no friends yet, show: "Connect with peers to see their activity here →" with a link to `/peer/my-peers`.

Add to the dashboard sidebar alongside the existing `LeaderboardWidget` and `ActivityChart`.

---

### 🏅 FEATURE 11 — Badge award ceremony (intercept navigation)

**Files to modify:** `actions/quest-actions.ts`, `context/UserContext.tsx`, create `components/ui/BadgeAwardModal.tsx`

**What to build:**

**`components/ui/BadgeAwardModal.tsx`** (new component):

A full-screen celebratory overlay triggered when a badge is earned:

```tsx
interface BadgeAwardModalProps {
    badge: { name: string; description: string; icon: string; rarity: string }
    onDismiss: () => void
}
```

Layout: dark overlay, centered card with:
- Large badge icon (80px)
- "Achievement Unlocked!" headline
- Badge name (large, bold)
- Badge description
- Rarity pill (Common/Rare/Legendary with appropriate colors)
- Confetti burst on mount (use `canvas-confetti`)
- Loopy (celebrating, hasCrown for rare/legendary)
- "Awesome!" button to dismiss
- Auto-dismiss after 5s with a countdown ring

**Trigger points** — add badge checks in these places:

In `actions/quest-actions.ts`, after a quest is completed, check for badge conditions and return them in the response:
```ts
// Check badge conditions (examples):
const badges = []
if (questKey === 'login' && /* first ever login quest */) badges.push('first_login')
if (type === 'daily' && /* check if 7 consecutive days */) badges.push('week_warrior')
// Return badges: [...result, badges]
```

In `context/UserContext.tsx`, when `processDailyLogin` response includes badges, store them in a `pendingBadges` state. Render `BadgeAwardModal` for each pending badge one at a time (queue them).

Define the initial badge set in a new `lib/badges.ts` file:
```ts
export const BADGES = {
    first_login: { name: 'First Steps', description: 'Completed your first login quest', icon: '👟', rarity: 'common' },
    week_warrior: { name: 'Week Warrior', description: 'Maintained a 7-day streak', icon: '🗡️', rarity: 'rare' },
    first_chest: { name: 'Treasure Hunter', description: 'Opened your first chest', icon: '📦', rarity: 'common' },
    perfect_lesson: { name: 'Flawless', description: 'Completed a lesson with no mistakes', icon: '💎', rarity: 'rare' },
    first_challenge: { name: 'Code Warrior', description: 'Completed your first coding challenge', icon: '⚔️', rarity: 'common' },
}
```

---

## STEP 4 — Verification checklist

After implementing all features, verify:

- [ ] QuizView has hearts (3 lives), full-width animated feedback banner, correct/wrong sounds
- [ ] LessonLayout has a 4px progress bar at the very top of the screen
- [ ] LessonLayout shows Loopy in bottom-right corner, mood changes on correct/wrong/complete
- [ ] Defeated screen shows when hearts reach 0 (with Loopy screaming)
- [ ] Perfect lesson awards +50% XP and shows "PERFECT!" on completion screen
- [ ] `LessonComplete` component exists and is shown after every lesson type finishes
- [ ] XP particles fly to the XP bar in the header (not off-screen)
- [ ] Level-up overlay triggers when the user crosses a level threshold
- [ ] Streak flame pulses red on dashboard when streak is at risk today
- [ ] Dismissible streak-at-risk banner appears on dashboard when no activity today
- [ ] Streak-break modal shows when user returns after losing a streak
- [ ] GamifiedPath nodes are large (80px) bubbles with type icons and XP labels
- [ ] Active node has a bouncing "START" indicator
- [ ] Setup page has 4 steps: track picker, level picker, daily goal, placement quiz
- [ ] Placement quiz shows a result screen and saves track + level to profile
- [ ] `vercel.json` has daily cron at 7pm UTC for reminder notifications
- [ ] League standings page/widget exists and shows weekly XP competition
- [ ] `incrementLeagueXp` is called whenever XP is awarded
- [ ] Friend activity feed shows on dashboard sidebar
- [ ] `BadgeAwardModal` exists and triggers on first_login, 7-day streak, first chest, perfect lesson
- [ ] `lib/badges.ts` exists with badge definitions

---

## Important notes

- Stack: Next.js 16, React 19, Supabase SSR, TypeScript, Tailwind CSS 4, Framer Motion 12
- `LoopyMascot` already has all 8 moods including `celebrating`, `screaming`, `huddled`, `annoyed` — use them, don't recreate the component
- `SoundManager` is at `lib/sound.ts` — use `soundManager.playMetalSnap()` for correct, play a descending tone for wrong (add `playError()` method using Web Audio API oscillator)
- `RewardBurst` already exists at `components/ui/RewardBurst.tsx` — extend it, don't replace it
- Do not touch any of the bug fixes from the previous prompt — these are purely additive features
- Do not change the DB schema column names — only add new tables/columns as specified with migration comments
- All new server actions must call `supabase.auth.getUser()` at the top and use the verified `user.id`
- Keep all existing page layouts intact — add new UI elements as overlays or additional sections