# Skloop Codebase Fix Prompt — Full Analysis & Repair (Schema-Verified)

You are working on **Skloop** — a Next.js 16 + Supabase gamified coding education platform.
Read every file listed in Step 1 before touching any code. Do not guess — the issues below are confirmed against the actual DB schema.

---

## STEP 1 — Read these files first (required)

```
actions/quest-actions.ts
actions/task-actions.ts
actions/user-actions.ts
actions/course-actions.ts
context/UserContext.tsx
hooks/usePresence.ts
lib/swr-fetchers.ts
components/dashboard/DailyQuestsWidget.tsx
components/ui/ChestUnboxingModal.tsx
components/lesson/FlowchartBuilder.tsx
utils/supabase/server.ts
utils/supabase/client.ts
next.config.ts
app/api/loopy/route.ts
app/api/loopy-chat/route.ts
app/api/generate-roadmap/route.ts
app/(app)/layout.tsx
app/(app)/notifications/page.tsx
app/(app)/marketplace/page.tsx
app/(app)/calendar/page.tsx
app/(app)/contacts/page.tsx
components/course/challenges/WebIDEChallenge.tsx
components/providers/SWRProvider.tsx
components/providers/AppPreloader.tsx
components/providers/MasterScrollProvider.tsx
components/GamifiedLoader.tsx
components/LoadingProvider.tsx
components/shell/AppShell.tsx
components/shell/Sidebar.tsx
components/notifications/NotificationListener.tsx
```

---

## STEP 2 — DB Schema Reference (actual, confirmed)

Key tables and their relevant columns — verified against the real schema:

**`profiles`**: `id`, `inventory jsonb DEFAULT '[]'` ← jsonb NOT text[], `equipped_title`, `equipped_ring` ← NO `equipped_frame` column, `active_powers jsonb`, `coins bigint`, `xp bigint`, `streak_shields integer`

**`user_chests`**: `id`, `user_id`, `chest_type` (common/rare/legendary), `cycle_key`, `status` (sealed/opened) ← only TWO statuses, `reward_product_id uuid` ← FK to `products`, NOT `reward_exclusive_id`, `earned_at`, `opened_at`

**`daily_quest_completions`**: `id`, `user_id`, `quest_id` (stores quest key string), `cycle_key`, `quest_type`, `auto_progress`, `xp_awarded`, `coins_awarded` ← NO unique constraint on `(user_id, quest_id, cycle_key)` — the upsert in code will FAIL silently

**`quests`**: `id`, `key` (unique), `title`, `description`, `type`, `xp_reward`, `coins_reward`, `icon`, `sort_order` ← NO `target_amount` column

**`quest_exclusives`**: `id text`, `name`, `type` (avatar_frame/ring/title/badge), `rarity`, `icon_name`, `gradient`, `visual_data`

**`products`**: `id uuid`, `name`, `type` (avatar_frame/badge/theme/boost), `rarity` ← separate from quest_exclusives

---

## STEP 3 — Fix all issues IN ORDER

---

### 🔴 FIX 1 — `openChest` writes to a column that doesn't exist

**File:** `actions/quest-actions.ts` — `openChest` function, line ~500

**Problem (schema-confirmed):** The code does:
```ts
await supabase.from('user_chests').update({
    status: 'opened',
    reward_exclusive_id: reward.id,  // ❌ THIS COLUMN DOES NOT EXIST
    opened_at: new Date().toISOString()
}).eq('id', chestId)
```
The actual column is `reward_product_id uuid` (FK to `products`). But chest rewards come from `quest_exclusives` which has a text `id`, not a uuid. This means:
1. The update silently fails or errors — chest never gets marked as opened properly
2. The reward is never recorded on the chest row
3. Users can re-open the same chest repeatedly

**Fix:**
- Change `reward_exclusive_id: reward.id` → `reward_product_id: null` for now (quest_exclusives aren't products — see FIX 2 for the proper solution)
- To prevent re-opening: add an atomic update pattern — update `status = 'opened'` only WHERE `status = 'sealed'` and check that exactly 1 row was affected:
```ts
const { data: updated, error } = await supabase
    .from('user_chests')
    .update({ status: 'opened', opened_at: new Date().toISOString() })
    .eq('id', chestId)
    .eq('user_id', userId)
    .eq('status', 'sealed')  // atomic guard
    .select()
    .single()

if (error || !updated) {
    return { success: false, error: 'Chest already opened or not found' }
}
```
- Remove the manual inventory fallback block entirely (lines ~484–493) — it uses `inv.push()` on a jsonb field that the DB stores as jsonb, which could corrupt data. The RPC should be the only write path.

---

### 🔴 FIX 2 — `quest_exclusives` rewards are stored in `profiles.inventory` as string IDs, but `openChest` tries to use the `products` FK

**File:** `actions/quest-actions.ts` — `openChest` function

**Problem (schema-confirmed):** 
- `user_chests.reward_product_id` is a FK to `products(id)` (uuid)
- `quest_exclusives.id` is text (e.g. `'frame_neon_ring'`)
- These are two completely separate tables — one for shop items, one for quest chest drops
- The code queries `quest_exclusives` for the reward, then tries to save it to `reward_product_id` — type mismatch, wrong table

The actual inventory system stores string IDs in `profiles.inventory jsonb` (confirmed from code: `inventory.includes('item_daily_skip')`, `inventory.filter(...)`). Quest exclusive rewards should go into `profiles.inventory` as string IDs, not into `user_chests.reward_product_id`.

**Fix:**
- In `openChest`, after rolling the reward from `quest_exclusives`:
  1. Add the reward's string id to `profiles.inventory` using a safe jsonb append (not array push):
  ```ts
  // Safe jsonb append that avoids duplicates
  await supabase.rpc('append_to_inventory', {
      x_user_id: userId,
      item_id: reward.id
  })
  ```
  2. Also award the bonus coins via `increment_profile_stats` RPC.
  3. Update `user_chests` with `status: 'opened', opened_at: now()` — leave `reward_product_id` as null since quest exclusives aren't shop products.
  4. Add a migration comment: create a `append_to_inventory(x_user_id uuid, item_id text)` RPC that does: `UPDATE profiles SET inventory = inventory || jsonb_build_array(item_id::text) WHERE id = x_user_id AND NOT (inventory @> jsonb_build_array(item_id::text))`

- If the `award_chest_rewards` RPC already exists in Supabase, check what it actually does — if it tries to write to `reward_product_id` it will fail. Replace it with the pattern above.

---

### 🔴 FIX 3 — `daily_quest_completions` upsert will fail: missing unique constraint

**File:** `actions/quest-actions.ts` — `claimQuestProgress` function, line ~152

**Problem (schema-confirmed):** The code does:
```ts
.upsert({ ... }, { onConflict: 'user_id, quest_id, cycle_key' })
```
But the `daily_quest_completions` table has NO unique constraint on `(user_id, quest_id, cycle_key)`. Supabase requires the conflict target to match an actual unique constraint. Without it, the upsert behaves as an insert every time — creating duplicate rows instead of updating progress. This means:
- Quest progress is never updated, only appended
- `claimQuestProgress` will keep inserting new rows
- The `existing` check above the upsert reads one row, but subsequent calls insert more rows, so the same quest can be "completed" multiple times

**Fix:**
Add a migration to create the missing constraint. Add this as a comment block at the top of `quest-actions.ts` so the developer knows to run it:
```sql
-- REQUIRED MIGRATION: Run in Supabase SQL editor before deploying
-- ALTER TABLE public.daily_quest_completions 
--   ADD CONSTRAINT daily_quest_completions_user_quest_cycle_unique 
--   UNIQUE (user_id, quest_id, cycle_key);
```
Until the migration runs, replace the upsert with an explicit insert-or-update pattern:
```ts
if (existing) {
    await supabase
        .from('daily_quest_completions')
        .update({ auto_progress: finalProgressToSave, xp_awarded: ..., coins_awarded: ... })
        .eq('user_id', userId)
        .eq('quest_id', questKey)
        .eq('cycle_key', cycleKey)
} else {
    await supabase
        .from('daily_quest_completions')
        .insert({ user_id: userId, quest_id: questKey, cycle_key: cycleKey, ... })
}
```

---

### 🔴 FIX 4 — `profiles.equipped_frame` does not exist in DB

**Files:** `context/UserContext.tsx`, `lib/swr-fetchers.ts`, `components/profile/modules/CollectionModule.tsx`, `components/profile/ProfileHeader.tsx`

**Problem (schema-confirmed):** The `profiles` table has `equipped_title` and `equipped_ring` but NO `equipped_frame` column. The code in multiple files reads/writes `equipped_frame` — this silently fails on every profile update that includes it, and the UI will always show no frame equipped.

**Fix option A (quick):** Add migration:
```sql
-- REQUIRED MIGRATION:
-- ALTER TABLE public.profiles ADD COLUMN equipped_frame text;
```
Add this comment at the top of `UserContext.tsx`.

**Fix option B (no migration):** Repurpose `equipped_ring` to serve both ring and frame cosmetics, or use `active_powers jsonb` to store equipped_frame. Update `CollectionModule.tsx` accordingly.

**Recommended:** Option A. Add the migration comment. Remove `equipped_frame` from the `UserProfile` interface in `UserContext.tsx` with a `// TODO: add migration` note so TypeScript catches any writes until the migration runs, then restore it after.

---

### 🔴 FIX 5 — Server actions trust client-passed userId (no auth verification)

**Files:** All `actions/*.ts` files

**Problem:** Every destructive action (`processDailyLogin`, `claimQuestProgress`, `openChest`, `awardTopicCompletion`, `activateBoostItem`, etc.) accepts `userId: string` from the caller without verifying the session. A logged-in user can manipulate any other user's data.

**Fix:** In every action that writes to the DB using a userId:
```ts
const supabase = await createClient()
const { data: { user }, error: authError } = await supabase.auth.getUser()
if (!user || authError) return { success: false, error: 'Unauthorized' }
// Use user.id instead of the passed userId for all writes
```
For public read-only actions (e.g. `fetchUserProfile(userId)` to view someone else's profile), the passed userId is fine — only restrict writes.

---

### 🔴 FIX 6 — AI API routes are unprotected public endpoints

**Files:** `app/api/loopy/route.ts`, `app/api/loopy-chat/route.ts`, `app/api/generate-roadmap/route.ts`

**Problem:** No auth check, no rate limiting, no input length cap. Anyone can drain the Groq API key.

**Fix for each route:**
```ts
// At the top of each POST handler:
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

// Input length check:
if (!message || message.length > 2000) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
}
```
Add a simple module-level rate limiter:
```ts
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
function checkRateLimit(userId: string): boolean {
    const now = Date.now()
    const entry = rateLimitMap.get(userId)
    if (!entry || entry.resetAt < now) {
        rateLimitMap.set(userId, { count: 1, resetAt: now + 60000 })
        return true
    }
    if (entry.count >= 20) return false
    entry.count++
    return true
}
// In handler: if (!checkRateLimit(user.id)) return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
```
Remove the `|| "dummy_key_for_build"` Groq fallback — throw a clear error if key is missing.

---

### 🔴 FIX 7 — No Next.js middleware: sessions go stale

**File:** Create `middleware.ts` at project root

**Problem:** No middleware file exists. Supabase SSR requires it to refresh JWT tokens on every request. Without it, sessions silently expire mid-session.

**Fix:** Create `/middleware.ts`:
```ts
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({ request: { headers: request.headers } })
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name) { return request.cookies.get(name)?.value },
                set(name, value, options: CookieOptions) {
                    request.cookies.set({ name, value, ...options })
                    response = NextResponse.next({ request: { headers: request.headers } })
                    response.cookies.set({ name, value, ...options })
                },
                remove(name, options: CookieOptions) {
                    request.cookies.set({ name, value: '', ...options })
                    response = NextResponse.next({ request: { headers: request.headers } })
                    response.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )
    await supabase.auth.getUser()
    return response
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
```
Also fix `utils/supabase/server.ts`: remove the stale outer `const cookieStore = cookies()` on line 8 — the inner `await cookies()` calls inside each method are sufficient.

---

### 🔴 FIX 8 — FlowchartBuilder executes unsandboxed user code

**File:** `components/lesson/FlowchartBuilder.tsx`

**Problem:** User node content executes via `new Function('ctx', \`with(ctx) { ${code} }\`)` — no sanitization.

**Fix:** Add a `isSafeCode(code: string): boolean` validator before every `new Function` call:
```ts
const BLOCKED_PATTERNS = [
    /fetch\s*\(/i, /XMLHttpRequest/i, /import\s*\(/i,
    /\bdocument\b/, /\bwindow\b/, /\blocalStorage\b/, /\bsessionStorage\b/,
    /\beval\s*\(/, /new\s+Function/i, /:\/\//
]
function isSafeCode(code: string): boolean {
    return !BLOCKED_PATTERNS.some(p => p.test(code))
}
```
In `evaluateCondition` and every `new Function` instantiation, check `isSafeCode(code)` first — if it fails, call `addLog('⚠️ Unsafe code blocked')` and skip execution without crashing.

---

### 🟡 FIX 9 — Chest double-award: `checkAndAwardChest` + `saveChestAction` both insert

**File:** `actions/quest-actions.ts`

**Problem:** Two separate code paths both INSERT chests:
1. `checkAndAwardChest()` — fires automatically after every quest completion
2. `saveChestAction()` — fires when user clicks "Claim"

`checkAndAwardChest` relies on a comment saying "unique constraint protects against duplicates" but there is NO such constraint on `user_chests`. Both inserts go through, creating two chest rows.

Also: `saveChestAction` queries `user_chests` for an existing chest but does NOT filter by `chest_type` — if a user has both a daily and weekly chest in the same cycle period, this query returns the wrong one.

**Fix:**
1. Delete `checkAndAwardChest` entirely. Chests are claimed explicitly by the user — no silent background creation.
2. Fix `saveChestAction` existing check:
```ts
const { data: existing } = await supabase
    .from('user_chests')
    .select('*')
    .eq('user_id', userId)
    .eq('cycle_key', cycleKey)
    .eq('chest_type', chestType)  // ← ADD THIS
    .maybeSingle()
```
3. Add migration comment:
```sql
-- RECOMMENDED MIGRATION:
-- ALTER TABLE public.user_chests 
--   ADD CONSTRAINT user_chests_unique_cycle 
--   UNIQUE (user_id, cycle_key, chest_type);
```

---

### 🟡 FIX 10 — Duplicate `awardTopicCompletion` — one version skips progression lock

**Files:** `actions/quest-actions.ts`, `actions/course-actions.ts`, `components/course/TopicViewer.tsx`

**Problem:** Two functions with the same name in different files:
- `course-actions.ts`: enforces sequential topic order before awarding XP
- `quest-actions.ts`: directly upserts with no order check

`TopicViewer.tsx` imports from `quest-actions` — bypassing the lock entirely.

**Fix:**
1. Delete `awardTopicCompletion` from `quest-actions.ts`
2. Update `components/course/TopicViewer.tsx` import from `quest-actions` → `course-actions`
3. The `course-actions` version is the only one that should exist

---

### 🟡 FIX 11 — `claimDailyQuest` for `type_race` increments quiz quest keys

**File:** `actions/task-actions.ts`

**Problem:** The `type_race` branch calls:
```ts
claimQuestProgress(userId, 'quiz_3w', 'weekly', 1, 3)
claimQuestProgress(userId, 'quiz_10m', 'monthly', 1, 10)
```
These are DSA quiz quest keys. Completing a typing race incorrectly advances the quiz quest counter.

**Fix:** The quests table needs dedicated typing game entries. Add migration comment:
```sql
-- REQUIRED: Insert typing quest rows if they don't exist:
-- INSERT INTO public.quests (key, title, description, type, xp_reward, coins_reward, icon, sort_order)
-- VALUES 
--   ('type_race_3w', 'Speed Demon', 'Complete 3 typing races this week', 'weekly', 75, 30, '⌨️', 5),
--   ('type_race_10m', 'Keystroke Legend', 'Complete 10 typing races this month', 'monthly', 200, 100, '⌨️', 5)
-- ON CONFLICT (key) DO NOTHING;
```
Then update the `type_race` branch:
```ts
claimQuestProgress(userId, 'type_race_3w', 'weekly', 1, 3),
claimQuestProgress(userId, 'type_race_10m', 'monthly', 1, 10),
```

---

### 🟡 FIX 12 — `skipQuestWithConsumable` hardcodes `targetAmount = 1` for all quests

**File:** `actions/quest-actions.ts`

**Problem:** `claimQuestProgress(userId, questKey, type, 999, 1)` — forces completion with `targetAmount = 1`. Multi-step quests (e.g. `lessons_5w` needs 5) will show as "completed" but with wrong progress.

**The `quests` table has no `target_amount` column** — so we can't look it up.

**Fix:** Add a hardcoded target map (since there's no DB column):
```ts
const QUEST_TARGETS: Record<string, number> = {
    'login': 1, 'codele': 1, 'type_race': 1,
    'streak_7': 7, 'streak_20m': 20,
    'codele_3w': 3, 'codele_15m': 15,
    'type_race_3w': 3, 'type_race_10m': 10,
    'lesson': 1, 'lessons_5w': 5, 'lessons_20m': 20,
    'quiz_3w': 3, 'quiz_10m': 10,
}
const target = QUEST_TARGETS[questKey] ?? 1
const result = await claimQuestProgress(userId, questKey, type, target, target)
```

---

### 🟠 FIX 13 — `UserContext` creates a new Supabase client on every render

**File:** `context/UserContext.tsx`

**Problem:** `const supabase = createClient()` is called at component top level without `useMemo`. Every re-render creates a new client and re-triggers subscriptions.

**Fix:**
```ts
const supabase = useMemo(() => createClient(), [])
```

---

### 🟠 FIX 14 — Remove stale `cookieStore` call in server Supabase client

**File:** `utils/supabase/server.ts`

**Problem:** `const cookieStore = cookies()` on line 8 is a synchronous call that is immediately stale. The inner `await cookies()` calls inside each method are correct and sufficient.

**Fix:** Delete line 8 (`const cookieStore = cookies()`). The inner calls handle everything.

---

### 🟠 FIX 15 — Remove `bodySizeLimit: '50mb'` from next.config.ts

**File:** `next.config.ts`

**Problem:** 50x the default limit. No reason for this unless specific actions upload large files.

**Fix:** Remove the `serverActions.bodySizeLimit` override entirely. Default 1MB is appropriate.

---

### 🟠 FIX 16 — 72 console.log calls in production

**Files:** All `actions/*.ts`, `context/UserContext.tsx`

**Fix:** 
- `console.log` calls inside server actions → delete or wrap in `if (process.env.NODE_ENV === 'development')`
- `console.error` in catch blocks → keep
- Any log that prints a userId, profile data, or auth event → delete

---

### 🟠 FIX 17 — Empty pages need a "Coming Soon" state

**Files:** `app/(app)/notifications/page.tsx`, `app/(app)/marketplace/page.tsx`, `app/(app)/calendar/page.tsx`, `app/(app)/contacts/page.tsx`

**Problem:** All four pages render blank. Users think the app is broken.

**Fix:** Replace the empty state in each with a centered component:
```tsx
<div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
    <span className="text-5xl">🔒</span>
    <h2 className="text-2xl font-bold">[Feature Name] — Coming Soon</h2>
    <p className="text-muted max-w-sm">[Brief description of what this will do]</p>
</div>
```
Keep all existing state and component structure intact below it — just add the early return if data is empty.

---

### 🟠 FIX 18 — Monaco Editor CDN version mismatch

**File:** `components/course/challenges/WebIDEChallenge.tsx`

**Problem:** CDN loads `monaco-editor@0.43.0`, package.json has `0.55.1`.

**Fix:**
```ts
loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs' } })
```

---

## STEP 3b — Verification checklist for bug fixes (run before moving to Step 4)

Run through this checklist before marking done:

- [ ] `npx tsc --noEmit` — zero TypeScript errors
- [ ] No server action does a DB write with an unverified `userId` parameter
- [ ] `middleware.ts` exists at project root and is exported with `config.matcher`
- [ ] `openChest` uses atomic update (`WHERE status = 'sealed'`), not read-then-write
- [ ] `openChest` does NOT reference `reward_exclusive_id` (column doesn't exist)
- [ ] `checkAndAwardChest` is deleted
- [ ] `awardTopicCompletion` exists in only `course-actions.ts`
- [ ] `TopicViewer.tsx` imports `awardTopicCompletion` from `course-actions`
- [ ] All three AI routes return 401 for unauthenticated requests
- [ ] `daily_quest_completions` upsert is replaced with explicit insert/update pattern with migration comment
- [ ] `saveChestAction` filters by `chest_type` in existing check
- [ ] `equipped_frame` has a migration comment noting it's missing from DB
- [ ] `UserContext` wraps `createClient()` in `useMemo`
- [ ] Outer `cookieStore` call removed from `utils/supabase/server.ts`
- [ ] `bodySizeLimit: '50mb'` removed from `next.config.ts`
- [ ] All four empty pages have a coming-soon UI

---

## Important notes

- Stack: Next.js 16, React 19, Supabase SSR `@supabase/ssr ^0.8.0`, TypeScript, Tailwind CSS 4
- `profiles.inventory` is `jsonb` in the DB — treat it as a JSON array of strings, never use raw array methods that assume it's a native JS array. Always parse and re-serialize.
- `quest_exclusives.id` is `text` (e.g. `'frame_neon_ring'`), NOT a uuid. Do not try to store it in any uuid FK column.
- `user_chests.status` only has two valid values: `'sealed'` and `'opened'` — do NOT add `'opening'` without a schema migration.
- Do not change any UI/visual code unless a fix explicitly requires it.
- Do not add new npm dependencies unless strictly necessary.
- Preserve all existing function signatures called from UI components — only change internals.

---

## STEP 4 — Performance & Loading Fixes (Navigation & Perceived Speed)

These are the reasons pages feel slow on first login, after idle, and when switching between routes. Fix them in order — the first two have the highest impact.

---

### ⚡ PERF 1 — SWR cache initialises too late: all data fetches fire simultaneously on every page

**File:** `components/providers/SWRProvider.tsx`

**Problem:** `provider` starts as `null`:
```ts
const [provider, setProvider] = useState<Map<any, any> | null>(null)
```
`useEffect` runs *after* the first render, setting it from localStorage. During that first render, SWR has no cache provider — every hook on the page (`useSWR`) fires a fresh network request simultaneously. On the dashboard alone that's 6+ parallel Supabase queries all starting at once, with nothing to show while they run. Users see blank → spinners → data, every single navigation.

**Fix:** Use a lazy initialiser so the cache is ready synchronously before first render:
```ts
const [provider] = useState<Map<any, any>>(() => {
    if (typeof window === 'undefined') return new Map()
    try {
        return new Map(JSON.parse(localStorage.getItem('skloop-swr-cache') || '[]'))
    } catch {
        return new Map()
    }
})
```
Remove the `useEffect` that sets provider. Keep only the `beforeunload` save handler.
Also change `provider: provider ? () => provider : undefined` → `provider: () => provider` since it's never null now.

This single change means cached data from the previous session shows instantly on navigation, with SWR revalidating in the background silently.

---

### ⚡ PERF 2 — GamifiedLoader has too-long hardcoded delays and waits up to 6s for heavy assets

**File:** `components/GamifiedLoader.tsx`

**Problem:** The animation sequence has hardcoded waits: 600ms → 1200ms → 1800ms → 2600ms before even starting to check preloads. Then `Promise.race([Promise.allSettled(preloadTasks), new Promise(resolve => setTimeout(resolve, 6000))])` means the loader can sit for 6 full seconds if Monaco (2MB) or React Flow are slow. Worst case total: ~10 seconds before the user sees anything.

**Fix:**
1. Cut the animation sequence delays in half:
   - `t1`: 300ms (was 600)
   - `t2`: 600ms (was 1200)
   - `t3`: 900ms (was 1800)
   - `t4`: 1300ms (was 2600)
2. Drop the preload timeout from 6000ms → 2000ms:
   ```ts
   new Promise(resolve => setTimeout(resolve, 2000)) // was 6000
   ```
3. After `t4` fires, `proceedToBlastoff` immediately without waiting for preloads at all — preloads should be background optimisations, not gates. Change the logic so blastoff always happens at `t4 + 800ms` regardless of preload status:
   ```ts
   t4 = setTimeout(() => {
       setStep(4)
       setProgress(80)
       soundManager.playRocketLaunch(0.8)
       proceedToBlastoff() // always, immediately
   }, 1300)
   ```
4. Keep `registerPreloadTasks` and the preloading — just decouple it from the loader gate. Preloads still warm the cache, they just don't block the UI anymore.

Total loader time after fix: ~2.1 seconds maximum.

---

### ⚡ PERF 3 — AppPreloader loads Monaco and React Flow for all users at boot

**File:** `components/providers/AppPreloader.tsx`

**Problem:** Monaco Editor (~2MB) and `@xyflow/react` are preloaded at app boot for every user on every page. These are only needed on lesson/track pages (`/lesson/[lessonId]`, `/course/[id]`). Monaco's preload was also the primary contributor to the 6-second gate in the old loader.

**Fix:** Remove Monaco and React Flow from the preload list entirely:
```ts
// DELETE these two entries:
import('@monaco-editor/react').then(async (mod) => { ... })
import('@xyflow/react').catch(...)
```

Instead, preload them lazily when the user is in a course context. Add this to `app/(app)/course/[id]/page.tsx` and `app/(app)/lesson/[lessonId]/page.tsx`:
```ts
// At the top of the component, after mount:
useEffect(() => {
    import('@monaco-editor/react')
    import('@xyflow/react')
}, [])
```

Also remove `canvas-confetti` and `@tsparticles/react` from the preloader — these are decorative and shouldn't be in the critical boot path.

Keep in the preloader: GSAP, Framer Motion, `fetchHeroCourse`, `fetchUserTasks` — these are used on the dashboard immediately.

---

### ⚡ PERF 4 — No middleware: sessions go stale causing slow re-auth on return visits

*(Already covered as FIX 7 above — but note it also directly causes the "slow on return visit" symptom. Prioritise it.)*

Without `middleware.ts`, JWT tokens expire while the user is away. When they come back, `app/(app)/layout.tsx` calls `supabase.auth.getUser()` which hits an expired token and must do a silent refresh — adding 300–800ms to every navigation after a long idle. The middleware fix resolves this by keeping tokens refreshed proactively on every request.

---

### ⚡ PERF 5 — AppShell applies the initial-load animation on every navigation

**File:** `components/shell/AppShell.tsx`

**Problem:**
```tsx
animate={isLoading ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
```
`isLoading` comes from `LoadingProvider.isInitialLoad`. While this correctly resolves to `false` after the rocket loader, the `motion.div` still re-evaluates this on every re-render triggered by navigation, causing a subtle opacity/translate flash on route changes.

**Fix:** Add a `hasLoaded` ref to skip the animation entirely after first load:
```tsx
const { isLoading } = useLoading()
const hasLoadedRef = useRef(false)
if (!isLoading) hasLoadedRef.current = true

// In JSX:
<motion.div
    initial={hasLoadedRef.current ? false : { opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ type: 'spring', bounce: 0.4, duration: 0.8 }}
    ...
>
```
Setting `initial={false}` when already loaded tells Framer Motion to skip the enter animation entirely, so navigating between pages has zero opacity delay.

---

### ⚡ PERF 6 — ReactLenis remounts on every navigation causing scroll jank

**File:** `components/shell/AppShell.tsx`

**Problem:** `AppShell` conditionally renders `<ReactLenis>` or a plain div based on `isFullHeight`. Every route change that crosses this boundary (e.g. navigating from `/dashboard` to `/peer/chat` and back) unmounts and remounts the entire Lenis instance — re-initialising the GSAP ticker sync, ScrollTrigger bindings, and RAF loop each time.

**Fix:** Always render `<ReactLenis>` as the outer wrapper. For full-height pages like chat, use `lenis.stop()` on mount and `lenis.start()` on unmount instead of removing Lenis from the tree:
```tsx
// In AppShell, always wrap with ReactLenis
<ReactLenis root={false} autoRaf={true} options={{ lerp: 0.1, duration: 1.2, smoothWheel: true }}>
    <AppScrollProvider>
        {children}
    </AppScrollProvider>
</ReactLenis>
```

In chat/full-height pages, add a `useMasterScroll` call to pause Lenis:
```tsx
// In app/(app)/peer/chat/layout.tsx
const { lenis } = useMasterScroll()
useEffect(() => {
    lenis?.stop()
    return () => lenis?.start()
}, [lenis])
```

---

### ⚡ PERF 7 — NotificationListener creates a new Supabase client on every render

**File:** `components/notifications/NotificationListener.tsx`

**Problem:** `const supabase = createClient()` is called at the top level of the component without `useMemo`. `NotificationListener` lives in `AppShell` and re-renders on every route change, creating a new client instance each time. The old realtime channel may not be cleaned up before the new subscription opens.

**Fix:**
```ts
const supabase = useMemo(() => createClient(), [])
```
Also remove the `supabase` dependency from the `useEffect` dep array since it's now stable:
```ts
useEffect(() => {
    ...
}, [profile?.id]) // remove supabase and toast from deps
```
Move `toast` usage inside the callback to avoid it being a dep (capture the ref).

---

### ⚡ PERF 8 — Add loading.tsx skeleton files for key routes

**Files:** Create these new files

**Problem:** Next.js App Router shows nothing during page data fetching unless a `loading.tsx` file exists. Without one, the old page unmounts and users see a white flash while the new page loads. There are zero `loading.tsx` files in the app routes.

**Fix:** Create minimal skeleton loading files for the highest-traffic pages:

**`app/(app)/dashboard/loading.tsx`:**
```tsx
export default function DashboardLoading() {
    return (
        <div className="p-4 md:p-6 xl:p-8 space-y-4 animate-pulse">
            <div className="h-24 bg-gray-100 rounded-[1.5rem]" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-40 bg-gray-100 rounded-[1.5rem] md:col-span-2" />
                <div className="h-40 bg-gray-100 rounded-[1.5rem]" />
            </div>
            <div className="h-64 bg-gray-100 rounded-[1.5rem]" />
        </div>
    )
}
```

**`app/(app)/profile/loading.tsx`:**
```tsx
export default function ProfileLoading() {
    return (
        <div className="animate-pulse">
            <div className="h-48 bg-gray-100" />
            <div className="max-w-4xl mx-auto px-4 mt-4 space-y-4">
                <div className="h-20 bg-gray-100 rounded-[1.5rem]" />
                <div className="h-10 bg-gray-100 rounded-[1.5rem]" />
                <div className="h-64 bg-gray-100 rounded-[1.5rem]" />
            </div>
        </div>
    )
}
```

**`app/(app)/roadmap/loading.tsx`:**
```tsx
export default function RoadmapLoading() {
    return (
        <div className="p-4 md:p-6 animate-pulse space-y-4">
            <div className="h-16 bg-gray-100 rounded-[1.5rem]" />
            <div className="h-[60vh] bg-gray-100 rounded-[1.5rem]" />
        </div>
    )
}
```

Apply the same pattern to `/practice`, `/peer/leaderboard`, and `/mentorship/find`.

---

### ⚡ PERF 9 — Sidebar prefetch doesn't work on mobile (no hover events)

**File:** `components/shell/Sidebar.tsx`

**Problem:** `handlePrefetch` is only called on `onMouseEnter`. On mobile devices there is no hover — users tap directly, which navigates without any prefetch. This is the primary reason mobile navigation feels slower than desktop.

**Fix:** Add `onTouchStart` to trigger prefetch on mobile:
```tsx
<Link
    href={item.href}
    onMouseEnter={() => handlePrefetch(item.href)}
    onTouchStart={() => handlePrefetch(item.href)}  // ← ADD THIS
    onClick={() => setMobileOpen?.(false)}
    ...
>
```
Apply the same change to sub-item links.

---

### ⚡ PERF 10 — SWR revalidation is fully disabled: stale data persists indefinitely

**File:** `components/providers/SWRProvider.tsx`

**Problem:** `revalidateOnFocus: false` is set globally. Combined with the localStorage cache, data fetched at login can stay stale for the entire session — quest progress, XP, coins won't update if changed on another device or after a long session. Users may see outdated profile stats.

**Fix:** Set a focused throttle instead of disabling revalidation entirely:
```ts
revalidateOnFocus: true,
focusThrottleInterval: 300000, // only re-fetch on focus if 5 minutes have passed
revalidateOnReconnect: true,
dedupingInterval: 10000, // increase from 5s to 10s to reduce duplicate requests
```
This means data refreshes when you come back to the browser tab after 5+ minutes — covering the "stale after idle" case — but doesn't hammer the DB on every tab switch during active use.

---

## STEP 5 — Updated verification checklist

Add these to the existing checklist from Step 4:

- [ ] `SWRProvider` initialises `provider` with a lazy `useState` initialiser, not `null`
- [ ] `GamifiedLoader` total time ≤ 2.1 seconds (check `t1`–`t4` timeout values)
- [ ] `GamifiedLoader` calls `proceedToBlastoff()` immediately at `t4` without waiting for preloads
- [ ] Monaco and React Flow are NOT in `AppPreloader` preload list
- [ ] `AppShell` uses `initial={false}` after first load (no opacity flash on navigation)
- [ ] `ReactLenis` is always rendered in `AppShell` — no conditional mount/unmount
- [ ] Full-height pages (chat) use `lenis.stop()` / `lenis.start()` instead of removing Lenis
- [ ] `NotificationListener` wraps `createClient()` in `useMemo`
- [ ] `loading.tsx` exists in `/dashboard`, `/profile`, `/roadmap`
- [ ] Sidebar links have `onTouchStart` prefetch handler
- [ ] `SWRProvider` has `revalidateOnFocus: true` with `focusThrottleInterval: 300000`