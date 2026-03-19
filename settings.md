# Skloop — Settings Overhaul Implementation Plan

## Overview

The settings page needs to break out of the main AppShell (sidebar + content layout) and become a standalone, full-screen experience — like macOS System Preferences or Vercel's dashboard settings. It should feel intentional and separate from the main app, with its own navigation sidebar.

**Read these files first before writing any code:**
```
components/shell/AppShell.tsx
components/shell/Sidebar.tsx
app/(app)/settings/page.tsx
app/(app)/layout.tsx
context/UserContext.tsx
lib/shop-items.ts
```

---

## STEP 1 — Architecture: How Settings bypasses AppShell

The settings page lives inside `app/(app)/settings/` which is wrapped by the `(app)` layout. The `(app)` layout renders AppShell which includes the main sidebar. We want settings to have a completely different layout.

**Approach: Route group isolation using `layout.tsx` override**

Create `app/(app)/settings/layout.tsx`. In Next.js App Router, a nested layout renders INSIDE the parent layout, so we still get auth/providers from `(app)/layout.tsx` — but by detecting the `/settings` path in AppShell, we skip the sidebar and render a passthrough instead.

**Modify `components/shell/AppShell.tsx`:**

Add `/settings` to a new `SETTINGS_ROUTES` constant:
```tsx
const SETTINGS_ROUTES = ["/settings"];

export function AppShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isSettingsRoute = SETTINGS_ROUTES.some(r => pathname.startsWith(r));

    // For settings routes, skip the sidebar entirely — settings has its own layout
    if (isSettingsRoute) {
        return (
            <>
                <NotificationListener />
                {children}
            </>
        );
    }

    // ... rest of existing AppShell JSX unchanged
}
```

This means `app/(app)/settings/layout.tsx` receives `children` with no wrapper — it can render the full SettingsShell directly.

---

## STEP 2 — Sidebar entry point (Settings icon)

**Modify `components/shell/Sidebar.tsx`:**

Add a Settings button in the bottom actions area, **above** the existing collapse toggle button. It must show in both collapsed and expanded states.

Import `Settings` from lucide-react at the top:
```ts
import { Settings } from "lucide-react";
```

In the bottom actions `<div>` (currently has just the collapse toggle), add before the collapse button:

```tsx
{/* Settings Link */}
<TooltipProvider delayDuration={300}>
    <Tooltip>
        <TooltipTrigger asChild>
            <Link
                href="/settings"
                className={cn(
                    "w-full flex items-center gap-4 px-5 py-3 rounded-[1.5rem] transition-all duration-200 font-medium text-sm",
                    pathname.startsWith('/settings')
                        ? "bg-primary text-primary-foreground"
                        : "text-gray-500 hover:bg-gray-50 hover:text-foreground",
                    isCollapsed ? "justify-center px-0" : ""
                )}
            >
                <Settings size={20} strokeWidth={2} className="shrink-0" />
                {!isCollapsed && <span>Settings</span>}
            </Link>
        </TooltipTrigger>
        {isCollapsed && isDesktop && (
            <TooltipContent side="right">
                <p>Settings</p>
            </TooltipContent>
        )}
    </Tooltip>
</TooltipProvider>
```

`pathname` is already available via `usePathname()` in `SidebarContent` — pass it down to the bottom area or read it directly.

---

## STEP 3 — SettingsShell component

**Create `components/shell/SettingsShell.tsx`:**

A two-column layout: settings sidebar (left) + scrollable content (right).

```tsx
"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import { useUser } from "@/context/UserContext";
import {
    User, Bell, Shield, CreditCard, Palette, Keyboard,
    Bot, ArrowLeft, LogOut, Zap, Lock
} from "lucide-react";

const SETTINGS_SECTIONS = [
    {
        group: "Account",
        items: [
            { id: "profile",       label: "Profile",           icon: User,       href: "/settings/profile" },
            { id: "account",       label: "Account & Security", icon: Lock,       href: "/settings/account" },
            { id: "notifications", label: "Notifications",      icon: Bell,       href: "/settings/notifications" },
        ]
    },
    {
        group: "Personalisation",
        items: [
            { id: "appearance",    label: "Appearance",         icon: Palette,    href: "/settings/appearance" },
            { id: "shortcuts",     label: "Keyboard Shortcuts", icon: Keyboard,   href: "/settings/shortcuts" },
        ]
    },
    {
        group: "AI & Plans",
        items: [
            { id: "ai",            label: "Loopy AI",           icon: Bot,        href: "/settings/ai" },
            { id: "billing",       label: "Plans & Billing",    icon: CreditCard, href: "/settings/billing" },
        ]
    },
];
```

**Layout structure:**
```tsx
<div className="flex h-[100dvh] bg-zinc-50">
    {/* Left Settings Sidebar — fixed 260px */}
    <aside className="w-64 shrink-0 bg-white border-r border-zinc-100 flex flex-col h-full">
        {/* Back to app */}
        <div className="p-6 border-b border-zinc-100">
            <Link href="/dashboard" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 text-sm font-bold transition-colors mb-4">
                <ArrowLeft size={16} />
                Back to App
            </Link>
            <div className="flex items-center gap-3">
                <Logo className="w-8 h-8" />
                <span className="font-black text-lg tracking-tight">Settings</span>
            </div>
        </div>

        {/* Sections */}
        <nav className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
            {SETTINGS_SECTIONS.map(section => (
                <div key={section.group}>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-3 mb-2">
                        {section.group}
                    </p>
                    <div className="space-y-0.5">
                        {section.items.map(item => {
                            const isActive = pathname === item.href || pathname.startsWith(item.href);
                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all",
                                        isActive
                                            ? "bg-zinc-900 text-white"
                                            : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                                    )}
                                >
                                    <item.icon size={16} strokeWidth={isActive ? 2.5 : 2} />
                                    {item.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}
        </nav>

        {/* Bottom: user info + sign out */}
        <div className="p-4 border-t border-zinc-100">
            <UserRow />
            <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-colors mt-1"
            >
                <LogOut size={16} />
                Sign Out
            </button>
        </div>
    </aside>

    {/* Right content area */}
    <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-8 py-10">
            {children}
        </div>
    </main>
</div>
```

`UserRow` is a small component showing the user's avatar, name, and plan badge.

---

## STEP 4 — Settings layout file

**Create `app/(app)/settings/layout.tsx`:**

```tsx
import { SettingsShell } from "@/components/shell/SettingsShell";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    return <SettingsShell>{children}</SettingsShell>;
}
```

---

## STEP 5 — Restructure settings routes (file-based pages)

Move from the current single `page.tsx` with `activeTab` state to individual route-based pages. This allows deep linking, back/forward navigation, and keeps each section isolated.

**File structure:**
```
app/(app)/settings/
├── layout.tsx                ← SettingsShell wrapper
├── page.tsx                  ← redirects to /settings/profile
├── profile/
│   └── page.tsx
├── account/
│   └── page.tsx
├── notifications/
│   └── page.tsx
├── appearance/
│   └── page.tsx
├── shortcuts/
│   └── page.tsx
├── ai/
│   └── page.tsx
└── billing/
    └── page.tsx
```

**`app/(app)/settings/page.tsx`** (root redirect):
```tsx
import { redirect } from "next/navigation";
export default function SettingsRoot() {
    redirect("/settings/profile");
}
```

---

## STEP 6 — Page content for each section

---

### `/settings/profile` — Profile settings

Port the existing `GeneralSettings` component here. Keep all existing logic (SWR fetch, avatar upload, username/bio save). No changes to the save logic.

**Header:** `<h1>Profile</h1>` with subtext "How others see you on Skloop."

**Sections:**
1. **Avatar** — circular avatar with hover-to-change overlay. Clicking opens file picker and uploads to Supabase Storage `avatars` bucket.
2. **Display name** — text input
3. **Username** — text input with `@` prefix visual
4. **Bio** — textarea, 160 char limit with counter
5. **Email** — read-only (shows current email, directs to Account for changes)
6. **Save** button — uses existing `profiles` upsert logic

---

### `/settings/account` — Account & Security

**Header:** `<h1>Account & Security</h1>`

**Sections:**

1. **Email address**
   - Shows current email
   - "Change Email" button → Supabase `updateUser({ email: newEmail })` with confirmation message

2. **Password**
   - "Change Password" button → Supabase `resetPasswordForEmail(user.email)` (sends reset link)
   - Shows: "A reset link will be sent to your email"

3. **Connected accounts** (future)
   - Google OAuth status — "Connected" badge or "Connect" button
   - GitHub OAuth status

4. **Danger Zone** — red bordered section
   - "Delete Account" button → shows a confirmation modal requiring user to type their username
   - On confirm: calls a `deleteAccount` server action (soft-delete: sets `profiles.deleted_at`)

---

### `/settings/notifications` — Notifications

Port the existing `NotificationSettings` component.

**Header:** `<h1>Notifications</h1>`

**Section: In-app notifications**
Toggle rows (saved to `profiles.notification_preferences` jsonb):
- Streak reminders
- Quest completions
- Chest ready to open
- Lesson unlocked
- New message
- Mentor session updates

**Section: Email notifications** (future)
- Weekly progress digest
- Streak at-risk warning
- Platform announcements

Each row: icon + label + description + toggle switch.

---

### `/settings/appearance` — Appearance

**Header:** `<h1>Appearance</h1>`

**Section: Theme**

Three large cards: Light / Dark / System.
- Clicking saves `skloop-theme` to localStorage and immediately updates `document.documentElement.classList`
- Inline script in `app/layout.tsx` applies theme before paint (prevents flash):
```html
<script dangerouslySetInnerHTML={{ __html: `
  (function() {
    var t = localStorage.getItem('skloop-theme') || 'system';
    var d = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (t === 'dark' || (t === 'system' && d)) document.documentElement.classList.add('dark');
  })();
` }} />
```

**Section: Sidebar**

Toggle: "Auto-collapse sidebar on small screens" — saves to localStorage.

**Section: Reduce motion**

Toggle: "Reduce animations" — stores in localStorage, conditionally removes Framer Motion transitions.

---

### `/settings/shortcuts` — Keyboard Shortcuts

**Header:** `<h1>Keyboard Shortcuts</h1>`

Static reference table of all shortcuts in the app:

| Context | Shortcut | Action |
|---------|----------|--------|
| Global | `⌘K` | Open command palette |
| IDE | `⌘↵` | Run code |
| IDE | `⌘S` | Save |
| IDE | `⌘Shift F` | Format |
| IDE | `⌘K` | Ask Loopy AI |
| Chat | `↵` | Send message |
| Chat | `Shift↵` | New line |
| Any page | `Escape` | Close panel/modal |

No interactivity — read-only reference.

---

### `/settings/ai` — Loopy AI

**Header:** `<h1>Loopy AI</h1>`

**Section: AI usage today**
- Progress bar showing `ai_queries_today / plan_limit` (e.g. "3 / 10 queries used today")
- Resets at midnight UTC
- Upgrade link if on free plan

**Section: Loopy personality**
Two radio cards:
- **Helpful Mode** — Socratic tutor, guides you to answers
- **Story Mode** — RPG narrative, Boss Fight format
Saves to `profiles.active_powers.loopy_mode`.

**Section: Context memory**
- Toggle: "Remember my recent lessons as context" — saves to `profiles.active_powers.ai_context_memory`

---

### `/settings/billing` — Plans & Billing

This is the most complex section. Implements `ignore_monetisation.md` MON 1 and MON 3.

**Header:** `<h1>Plans & Billing</h1>` with subtext showing current plan and renewal date.

---

#### Part A — Plan cards

Three columns (stack to single column on mobile):

```
┌──────────────┐  ┌──────────────────────┐  ┌──────────────────────┐
│   Free       │  │   Pro         ★ BEST │  │  Mentor Pro          │
│   Current    │  │   ₹999/mo            │  │  ₹1,999/mo           │
│              │  │                      │  │                      │
│ ✓ 10 AI/day  │  │ ✓ 100 AI/day         │  │ ✓ 200 AI/day         │
│ ✗ Mentor     │  │ ✓ Book Mentors       │  │ ✓ Book Mentors       │
│ ✗ Leagues    │  │ ✓ Leagues            │  │ ✓ Leagues            │
│ ✗ Downloads  │  │ ✓ Downloads          │  │ ✓ 10 Study Circles   │
│ 1 circle     │  │ 10 Study Circles     │  │ ✓ Unlimited Circles  │
│              │  │                      │  │ ✓ Mentor Analytics   │
│  [Current]   │  │  [Upgrade]           │  │  [Upgrade]           │
└──────────────┘  └──────────────────────┘  └──────────────────────┘
```

Above the cards: a **Monthly / Yearly toggle** (`useState`).
- Monthly: shows monthly price
- Yearly: shows yearly price with "Save 33%" green pill

Feature checklist uses: `✓` (lime green) for included, `✗` (zinc) for excluded.

Plan card for current plan shows a "Current Plan" badge and greyed out button. Other plans show "Upgrade" button.

"Upgrade" button: `POST /api/create-checkout-session` with `{ plan, billing }` → redirects to Stripe URL.

**Create `lib/plans.ts`** (single source of truth):
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
  pro:        { monthly: 999,  yearly: 7999  }, // in paise
  mentor_pro: { monthly: 1999, yearly: 15999 },
} as const

export function isPro(plan: Plan) {
  return plan === 'pro' || plan === 'mentor_pro'
}
```

---

#### Part B — Coin pack cards

Below the plan cards, a "Top Up Coins" section:

Four cards in a 2×2 (or 4-col on desktop) grid:

| Pack | Coins | Price | Badge |
|------|-------|-------|-------|
| Starter | 500 | ₹99 | — |
| Popular | 1,500 | ₹249 | Best Value |
| Power | 4,000 | ₹599 | — |
| Mega | 10,000 | ₹999 | — |

Each card: coin icon stack, amount, price, "Buy Now" button.
"Buy Now" → `POST /api/create-coin-purchase` with `{ pack }` → Stripe one-time payment.

---

#### Part C — Billing history

Simple table of past invoices (from Stripe or `profiles.payment_history` if stored):
- Date | Plan | Amount | Status | Download link

If no history: "No invoices yet."

---

#### API routes needed

**`app/api/create-checkout-session/route.ts`** (POST):
- Auth check via `supabase.auth.getUser()`
- Reads `{ plan, billing }` from body
- Creates Stripe subscription checkout session
- Returns `{ url: session.url }`

**`app/api/stripe-webhook/route.ts`** (POST):
- Verifies Stripe webhook signature
- On `checkout.session.completed`: updates `profiles.plan`, `stripe_customer_id`, `plan_expires_at`
- On `customer.subscription.deleted`: resets `profiles.plan = 'free'`

**`app/api/create-coin-purchase/route.ts`** (POST):
- Mode: `payment` (not subscription)
- On `payment_intent.succeeded` webhook: awards coins via `increment_profile_stats` RPC

**Required env vars** (add to `.env.local`):
```
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...
STRIPE_MENTOR_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_MENTOR_PRO_YEARLY_PRICE_ID=price_...
NEXT_PUBLIC_APP_URL=https://skloop.com
```

Install: `npm install stripe`

---

## STEP 7 — DB migrations

```sql
-- Add plan tracking columns to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free'
    CHECK (plan = ANY (ARRAY['free','pro','mentor_pro'])),
  ADD COLUMN IF NOT EXISTS plan_expires_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text,
  ADD COLUMN IF NOT EXISTS ai_queries_today integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS ai_queries_reset_at date DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS notification_preferences jsonb DEFAULT '{}'::jsonb;
```

Add `plan` to the `UserProfile` interface in `context/UserContext.tsx` and include it in the profile `select()` query.

---

## STEP 8 — Mobile responsiveness

On mobile (`< 768px`), the SettingsShell renders differently:
- No left sidebar
- Instead: a sticky header row with a `<select>` or pill scroll of sections
- OR: dedicated mobile nav at the top with horizontal scroll of section pills

Simplest approach: on mobile, the settings sidebar collapses to a sticky horizontal pill bar (like `ProfileTabs` — reuse the same pattern).

---

## STEP 9 — Verification checklist

**Navigation:**
- [ ] Settings icon visible in main sidebar (expanded: icon + "Settings" label; collapsed: icon only with tooltip)
- [ ] Clicking Settings from any page goes to `/settings/profile`
- [ ] Settings page has NO main app sidebar
- [ ] Settings has its own left sidebar with sections grouped by Account / Personalisation / AI & Plans
- [ ] "Back to App" arrow link returns to `/dashboard`
- [ ] URL changes per section (e.g. `/settings/billing`) — browser back/forward works
- [ ] Active section in settings sidebar is highlighted

**Profile section:**
- [ ] Shows current avatar, name, username, bio pre-filled
- [ ] Saving updates `profiles` table and shows success toast
- [ ] Avatar upload works (file picker → Supabase Storage)

**Account section:**
- [ ] Change email sends Supabase confirmation
- [ ] Change password sends reset link email
- [ ] Delete account modal requires typing username to confirm

**Appearance section:**
- [ ] Light / Dark / System theme selection updates immediately
- [ ] Theme persists across page reloads (via localStorage script in `<head>`)

**Notifications section:**
- [ ] Toggle states saved to `profiles.notification_preferences`
- [ ] Toggles reflect current preferences on load

**Billing section:**
- [ ] Three plan cards render correctly with feature checklists
- [ ] Monthly/Yearly toggle changes displayed prices
- [ ] Current plan is highlighted with "Current Plan" badge
- [ ] "Upgrade" buttons POST to `/api/create-checkout-session` and redirect to Stripe
- [ ] Four coin pack cards render with correct prices
- [ ] `lib/plans.ts` created with `PLAN_LIMITS`, `PLAN_PRICES`, `isPro()`
- [ ] `app/api/create-checkout-session/route.ts` exists and returns Stripe URL
- [ ] `app/api/stripe-webhook/route.ts` handles subscription events
- [ ] `stripe` package installed

**AI section:**
- [ ] AI usage bar reflects `ai_queries_today` from profile
- [ ] Loopy mode toggle saves to `profiles.active_powers`

---

## Important notes

- Stack: Next.js 16, React 19, Supabase SSR, TypeScript, Tailwind CSS 4, Framer Motion 12
- The AppShell detection approach (`isSettingsRoute`) keeps the change minimal — no route restructuring needed
- The `SettingsShell` does NOT use Lenis scroll — it's just a standard `overflow-y-auto` layout
- Settings pages do NOT need the `NotificationListener` inside them (it stays in the main AppShell flow — already added outside the `isSettingsRoute` branch)
- All server actions in settings must call `supabase.auth.getUser()` first
- `lib/plans.ts` is the single source of truth — never hardcode plan checks inline
- Mobile: if sidebar is too narrow, use a horizontal scroll pill tab bar (same pattern as `ProfileTabs`)
- Do not change the existing `GeneralSettings` and `NotificationSettings` logic — just migrate them to their new route files
