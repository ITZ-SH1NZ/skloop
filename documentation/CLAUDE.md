# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm run lint     # Run ESLint
npm run start    # Start production server
```

No test framework is configured. There are no test files.

## What This App Is

**Skloop** is a gamified habit-engineering platform for learning to code. The core philosophy is "Consistency Beats Intensity" — transforming technical learning into a game with XP, streaks, daily quests, cosmetics, loot chests, and real-time social features.

Users progress through two visual learning paths:
1. **Level Map** — 3D isometric nodes with biomes (Grasslands → Forest → Crystal Caves)
2. **AI Technical Graph (Constellation)** — Dynamically generated prerequisite graphs via Groq AI

## Architecture

### Stack
- **Next.js 16 App Router** with React 19, TypeScript (strict)
- **Supabase** — Auth (JWT/cookies), PostgreSQL, Realtime subscriptions
- **Groq SDK** (Llama 3.3 70B) — AI companion (Loopy) and roadmap generation
- **SWR** — Client-side data fetching/caching with localStorage persistence
- **Framer Motion + GSAP** — Animations; Lenis for smooth scrolling
- **Tailwind CSS 4**
- Path alias: `@/` maps to root

### Route Structure
- `app/(app)/` — Protected pages (auth-gated in layout)
- `app/(auth)/` — Login, signup, password reset flows
- `app/api/` — API routes: `loopy/`, `loopy-chat/`, `generate-roadmap/`, `og-preview/`
- `app/manifesto/`, `app/terms/`, `app/privacy/` — Public pages

### State Management
Three-layer approach:
1. **UserContext** (`context/UserContext.tsx`) — Global user/profile state. Fetches profile server-side (as `initialProfile`) to avoid flash. Subscribes to Supabase Realtime `postgres_changes` on the `profiles` table for live updates. Runs a 60s heartbeat for presence. Handles daily login processing.
2. **SWR** (`components/providers/SWRProvider.tsx`, `lib/swr-fetchers.ts`) — Client-side caching for quests, courses, leaderboards, tasks. Persists to localStorage, revalidates on focus.
3. **Local `useState`** — Component-level UI state (modals, tabs, animations).

### Server Actions (`actions/`)
All DB mutations use Next.js server actions ("use server"). They return `{ success: boolean, error?: string }`. Key actions:
- `user-actions.ts` — `processDailyLogin` (idempotent, uses `cycle_key` like `daily:2026-03-19`)
- `quest-actions.ts` — Quest completion/claiming
- `course-actions.ts` — `awardTopicCompletion` (grants XP/coins on lesson finish)
- `task-actions.ts`, `chat-actions.ts`, `mentorship-actions.ts`, `leaderboard-actions.ts`

Idempotency pattern: DB operations use unique `cycle_key` constraints to prevent double-processing of daily rewards, quest claims, etc.

### Supabase Setup
- Browser client: `utils/supabase/client.ts`
- Server client: `utils/supabase/server.ts` (reads cookies for SSR)
- Key tables: `profiles`, `courses`, `lessons`, `user_lesson_progress`, `quests`, `daily_quest_completions`, `activity_logs`, `user_chests`, `chat_messages`, `user_presence`, `leaderboard_snapshots`, `mentorship_sessions`

### Required Environment Variables
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
GROQ_API_KEY
NEXT_PUBLIC_GIPHY_API_KEY
```

### Key Components
- `components/shell/AppShell.tsx` + `Sidebar.tsx` — Main app chrome
- `components/providers/` — Provider nesting order: Toast → Loading → User → SWR → AppShell
- `components/course/TopicViewer.tsx` — Renders lesson content by type (video/article/quiz/challenge)
- `components/lesson/FlowchartBuilder.tsx` — Interactive flowchart editor with sandboxed code execution (blocks `fetch`, `eval`, `document`)
- `components/course/challenges/WebIDEChallenge.tsx` — Monaco-based in-browser IDE
- `components/notifications/NotificationListener.tsx` — Real-time notification subscriptions
- `lib/swr-fetchers.ts` — All SWR data fetcher functions
- `lib/loopy-prompts.ts` — AI system prompts for Loopy (Helpful Mode vs Story Mode)

### Gamification System
- **XP/Level:** 500 XP per level
- **Streaks:** Daily login required; streak shields protect from breaks
- **Quests:** Daily/weekly/monthly with configurable targets
- **Inventory:** Cosmetics (titles, rings, frames) + consumables (boosts/powers)
- **Chests:** Loot boxes from milestone rewards, opened via `ChestUnboxingModal`

### Lenis Smooth Scroll
Lenis is disabled on `/peer/chat` and `/messages` routes (fixed-height chat layouts). Check `AppShell.tsx` for the exclusion logic.

### SQL Migrations
Ad-hoc `.sql` files in the root (e.g., `20260317_fixes.sql`, `award_chest_rewards.sql`) are run manually against the Supabase project — there is no migration runner configured.
