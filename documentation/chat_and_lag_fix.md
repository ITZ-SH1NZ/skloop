# Skloop — Three Fix Prompts for Kiro

---

## PROMPT 1 — Performance: Next.js Compile Lag + Loader Timeout

**Files to read first:**
```
components/providers/AppPreloader.tsx
components/GamifiedLoader.tsx
next.config.ts
```

---

### The problem

Two issues causing the "running running running → compiling" lag in dev and slow first loads in production:

1. `AppPreloader.tsx` imports Monaco Editor, ReactFlow, GSAP, tsParticles, and canvas-confetti at app startup — before the user has navigated anywhere. These are heavy libraries (Monaco alone is 300KB+) that are only needed on specific pages. Loading them all on the dashboard on every page load causes the compile burst you see.

2. `GamifiedLoader.tsx` has a `6000ms` fallback timeout — if any preload hangs, users wait a full 6 seconds before seeing the app.

---

### Fixes

**Fix 1 — `components/providers/AppPreloader.tsx`**

Remove Monaco, ReactFlow, GSAP, and tsParticles from the preload list entirely. These should be lazily loaded only when the user navigates to a page that needs them (Next.js dynamic imports handle this automatically). Keep only the things actually used on the dashboard:

```ts
const preloadTasks: Promise<any>[] = [
    // Only preload what the dashboard actually needs
    import('framer-motion').catch(e => console.warn("Framer Motion preload failed", e)),
    import('canvas-confetti').catch(e => console.warn("Confetti preload failed", e)),

    // Warm up the API
    fetch('/api/user/stats').catch(() => {}),

    // Pre-import SWR fetchers
    import('@/lib/swr-fetchers').then(mod => mod),
];
```

Remove these imports completely from AppPreloader — do NOT just comment them out:
- `import('@monaco-editor/react')`
- `import('@xyflow/react')`
- `import('gsap')`
- `import('@tsparticles/react')`
- `import('@/components/mentorship/SessionVideoCard')`
- `import('@/components/profile/UserProfileModal')`

**Fix 2 — `components/GamifiedLoader.tsx`**

Find the line:
```ts
new Promise(resolve => setTimeout(resolve, 6000))
```

Change `6000` to `2000`. This cuts the maximum wait from 6 seconds to 2 seconds if any preload hangs.

**Fix 3 — `next.config.ts`**

Remove the `bodySizeLimit: '50mb'` from serverActions. This is extremely large and causes Next.js to allocate unnecessary memory buffers on every server action call. The default (1mb) is fine for all server actions except file uploads, which should use a dedicated upload endpoint anyway:

```ts
// Before:
const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

// After:
const nextConfig: NextConfig = {};

export default nextConfig;
```

---

### Verification checklist
- [ ] `AppPreloader.tsx` no longer imports Monaco, ReactFlow, GSAP, or tsParticles
- [ ] Dashboard loads without triggering Monaco/ReactFlow compilation
- [ ] GamifiedLoader fallback timeout is `2000`, not `6000`
- [ ] `next.config.ts` has no `bodySizeLimit`
- [ ] Monaco still loads correctly when navigating to a lesson (lazy load on demand)
- [ ] ReactFlow still loads correctly when navigating to a flowchart challenge

---

---

## PROMPT 2 — Supabase Idle: Keep-Alive Cron + Visibility Refresh

**Files to read first:**
```
context/UserContext.tsx
app/(app)/layout.tsx
```

**Files to create:**
```
app/api/health/route.ts
vercel.json (create if it doesn't exist, or add to existing)
```

---

### Background

Supabase free tier pauses projects after 7 days of zero API requests. When paused, the first request takes 5–30 seconds to wake the database. This causes the cold-start lag users notice when returning to the app after several days.

Additionally, when a user backgrounds the tab and returns, the Supabase Realtime WebSocket may have disconnected and the profile data may be stale.

---

### Fixes

**Fix 1 — Health endpoint to prevent Supabase project pause**

Create `app/api/health/route.ts`:

```ts
import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ ok: true, ts: Date.now() })
}
```

**Fix 2 — Vercel cron to ping the health endpoint every 5 days**

Create or update `vercel.json` in the project root:

```json
{
  "crons": [
    {
      "path": "/api/health",
      "schedule": "0 9 */5 * *"
    }
  ]
}
```

This pings `/api/health` every 5 days at 9am UTC, which keeps the Supabase project active and prevents the pause. The schedule `0 9 */5 * *` means "at 09:00, every 5 days".

**Fix 3 — Visibility-change refresh in `context/UserContext.tsx`**

When a user returns to a backgrounded tab, refresh the profile and let Supabase Realtime re-establish. Add this `useEffect` inside `UserProvider`, after the existing realtime subscription `useEffect`:

```ts
// Refresh profile when user returns to the tab after backgrounding
useEffect(() => {
    if (!user) return;

    const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
            fetchProfile(user.id);
        }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
}, [user, fetchProfile]);
```

**Fix 4 — Remove the 60-second polling interval from `context/UserContext.tsx`**

Find this block (the `setInterval` for 60000ms):
```ts
}, 60000); // 60 seconds
```

The 60-second polling interval is redundant now that we have the visibility-change handler AND the Supabase Realtime subscription for profile updates. Polling every 60 seconds while the user is actively using the app is unnecessary DB load. Remove the entire `useEffect` that contains this interval.

If there is a legitimate reason for periodic refresh (e.g. syncing streak data that isn't in the realtime subscription), change the interval from `60000` to `300000` (5 minutes) and add a guard so it only fires when `document.visibilityState === 'visible'`:

```ts
useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
        if (document.visibilityState === 'visible') {
            fetchProfile(user.id);
        }
    }, 300000); // 5 minutes, only when tab is visible

    return () => clearInterval(interval);
}, [user, fetchProfile]);
```

---

### Verification checklist
- [ ] `app/api/health/route.ts` exists and returns `{ ok: true }`
- [ ] `vercel.json` has cron entry for `/api/health` every 5 days
- [ ] `UserContext.tsx` has `visibilitychange` listener that calls `fetchProfile` on return
- [ ] The 60-second interval is either removed or changed to 5 minutes with visibility guard
- [ ] Navigate away from the browser tab for 10 seconds, return — profile data refreshes without a full page reload

---

---

## PROMPT 3 — Chat Implementation: Bug Fixes and Issues

**Files to read first:**
```
components/peer/ChatWindow.tsx
actions/chat-actions.ts
```

This file is 2,697 lines. Read it carefully before making any changes. All issues are in `ChatWindow.tsx` unless noted otherwise.

---

### Issue 1 — `fetchInitialStatus` called twice (duplicate DB query)

**Location:** The `useEffect` that fetches `last_seen` from the profiles table.

**Bug:** `fetchInitialStatus()` is called twice in the same `useEffect`:
```ts
fetchInitialStatus();

fetchInitialStatus(); // ← this is a duplicate, called twice
```

**Fix:** Remove the second `fetchInitialStatus()` call. Only one call is needed.

---

### Issue 2 — Supabase client created without `useMemo` dependency being stable

**Location:** Top of `ChatWindow` component:
```ts
const supabase = useMemo(() => createClient(), []);
```

This is correct — the `useMemo` is there. However, `supabase` is used as a dependency in multiple `useEffect` hooks (e.g. `[peer?.id, currentUserId, supabase]`). Since `useMemo` with an empty dependency array creates the client once, this is fine. **No change needed here** — this is already correct. Just verify it's not being passed to child components and recreated.

---

### Issue 3 — Per-poll Supabase Realtime channel never cleaned up on message scroll

**Location:** `PollMessage` component, the `useEffect` that subscribes to `poll_votes` changes.

**Bug:** `PollMessage` is rendered inside a scrollable message list. Each poll message creates its own Supabase Realtime channel (`poll:${pollId}`). If the user scrolls through a conversation with 10 polls, 10 channels are created. The cleanup runs on unmount, but in a virtualized or long list context, unmounting may not happen reliably.

Additionally, the `fetchPoll` function is defined inside the component and used in both `useEffect` hooks — but it's not wrapped in `useCallback`, so it re-creates on every render and could cause the Realtime subscription `useEffect` to re-subscribe unnecessarily. The dependency array is `[pollId, supabase]` but `fetchPoll` itself is also used inside it and is not in the array.

**Fix:** Wrap `fetchPoll` in `useCallback`:
```ts
const fetchPoll = useCallback(async () => {
    const data = await getPoll(pollId);
    if (data) {
        setPoll(data);
        const userVote = data.poll_votes?.find((v: any) => v.user_id === currentUserId);
        setMyVote(userVote ? userVote.option_index : null);
    }
    setLoading(false);
}, [pollId, currentUserId]);
```

Add `fetchPoll` to the Realtime `useEffect` dependency array:
```ts
}, [pollId, supabase, fetchPoll]);
```

---

### Issue 4 — GIF picker uses hardcoded public beta Giphy API key

**Location:** `useEffect` for fetching GIFs:
```ts
const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY || "dc6zaTOxFJmzC"; // Default public beta key if missing
```

**Bug:** The hardcoded `dc6zaTOxFJmzC` is Giphy's public beta key. It is rate-limited, shared by thousands of apps, and can stop working without notice. If `NEXT_PUBLIC_GIPHY_API_KEY` is not set in `.env.local`, the fallback silently uses the public key.

**Fix:** Remove the hardcoded fallback. If the env var is not set, show a "GIF search unavailable" message instead of silently trying a broken key:

```ts
const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;
if (!apiKey) {
    setGifs([]);
    setIsLoadingGifs(false);
    return;
}
```

Also add `NEXT_PUBLIC_GIPHY_API_KEY=` as a comment reminder in the `.env.local` template (or `.env.example` if one exists).

---

### Issue 5 — Message deduplication logic is fragile for media messages

**Location:** The Realtime `INSERT` handler in the main `useEffect` for messages:

```ts
const tempMatch = prev.find(m => 
    m.id.startsWith('temp-') && 
    m.type === newMessage.type &&
    (
        (m.type === 'text' && m.text === newMessage.content) ||
        (m.type !== 'text' && (
            !newMessage.content ||
            m.text === newMessage.content ||
            (m.attachments && newMessage.attachments && m.attachments.length === newMessage.attachments.length)
        ))
    )
);
```

**Bug:** For media messages, deduplication relies on `attachments.length` being equal. If a user sends two images at the same time (both have `attachments.length === 1`), the second message's Realtime event will match the first temp message and swap its ID, making one message disappear permanently.

**Fix:** Use a `tempId` reference approach instead of content matching. Store temp IDs in the `sentMessageIds` ref and use those for deduplication. The `handleSend` function already does:
```ts
sentMessageIds.current.add(savedMsg.id);
```

Add the tempId→realId mapping to the ref at send time:
```ts
// In handleSend, right after the optimistic update:
const tempId = `temp-${Date.now()}`;
// ... existing code ...
// After savedMsg comes back:
sentMessageIds.current.add(savedMsg.id);
// Map tempId so Realtime dedup can find it
(sentMessageIds.current as any).tempMap = (sentMessageIds.current as any).tempMap || {};
(sentMessageIds.current as any).tempMap[savedMsg.id] = tempId;
```

Then in the Realtime INSERT handler, check the tempMap first before falling back to content matching:
```ts
const tempMap = (sentMessageIds.current as any).tempMap || {};
const knownTempId = tempMap[newMessage.id];
if (knownTempId) {
    return prev.map(m => m.id === knownTempId ? { 
        ...m, 
        id: newMessage.id,
        attachments: newMessage.attachments || m.attachments,
        status: newMessage.status || 'sent'
    } : m);
}
```

---

### Issue 6 — `confirm()` used for delete confirmation

**Location:** `handleDelete` function:
```ts
if (!confirm("Are you sure you want to delete this message?")) return;
```

**Bug:** `confirm()` is a blocking browser dialog that cannot be styled, blocks the event loop, and is disabled in some environments (iframes, certain browser settings). It's also a jarring UX break in an otherwise smooth animated UI.

**Fix:** Replace `confirm()` with an inline confirmation state. Add a `deletingId` state:
```ts
const [deletingId, setDeletingId] = useState<string | null>(null);
```

In the message context menu, replace the Delete button with a two-step confirmation:
```tsx
{isMe && (
    deletingId === msg.id ? (
        <div className="flex gap-1 px-3 py-2">
            <button
                onClick={() => { handleDelete(msg.id); setDeletingId(null); setActiveMenuId(null); }}
                className="flex-1 text-xs font-bold text-white bg-red-500 rounded-lg py-1.5 hover:bg-red-600 transition-colors"
            >
                Delete
            </button>
            <button
                onClick={() => setDeletingId(null)}
                className="flex-1 text-xs font-bold text-zinc-600 bg-zinc-100 rounded-lg py-1.5 hover:bg-zinc-200 transition-colors"
            >
                Cancel
            </button>
        </div>
    ) : (
        <button
            onClick={() => setDeletingId(msg.id)}
            className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-xl text-sm font-semibold text-red-600 transition-colors text-left border-t border-zinc-50 mt-1"
        >
            <X size={16} className="text-red-400" /> Delete
        </button>
    )
)}
```

Remove the `confirm()` call from `handleDelete`:
```ts
const handleDelete = async (messageId: string) => {
    const { deleteMessage } = await import("@/actions/chat-actions");
    try {
        await deleteMessage(messageId);
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isDeleted: true, text: "Message deleted" } : m));
        soundManager.playClick(0.3);
    } catch (err) {
        console.error("Delete failed:", err);
    }
};
```

---

### Issue 7 — Video compression creates an `AudioContext` that is never closed on error

**Location:** `compressVideo` function:
```ts
const audioCtx = new AudioContext();
const source = audioCtx.createMediaElementSource(video);
```

**Bug:** If any error occurs after this point (video decode error, MediaRecorder failure, etc.), the `AudioContext` is never closed. Each failed compression call leaks an AudioContext. Browsers allow a maximum of ~6 AudioContexts per page — exceed this and audio breaks globally (affects the voice note player, sound effects, everything).

**Fix:** Wrap the entire compression logic in a try/finally block and ensure `audioCtx.close()` is always called:

```ts
const audioCtx = new AudioContext();
try {
    const source = audioCtx.createMediaElementSource(video);
    const dest = audioCtx.createMediaStreamDestination();
    source.connect(dest);
    source.connect(audioCtx.destination);
    // ... rest of compression ...
    
    recorder.onstop = () => {
        audioCtx.close(); // Close here on success
        // ... rest of onstop ...
    };
} catch (err) {
    audioCtx.close(); // Close here on error
    resolve(file);
}
```

---

### Issue 8 — Forward modal fetches all conversations on every `forwardMsg` state change

**Location:** The `useEffect` for `fetchRecentPeers`:
```ts
useEffect(() => {
    const fetchRecentPeers = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        // ... N+1 query: one query per conversation participant ...
    };
    if (forwardMsg) fetchRecentPeers();
}, [forwardMsg, peer?.id]);
```

**Bug:** Every time `forwardMsg` changes (i.e. every time the user opens the forward modal), this fires `N+1` Supabase queries — one to get all conversation participants, then one per conversation to get the other participant's profile. In a user with 20 conversations, this is 21 simultaneous queries.

**Fix:** This is acceptable for now given the feature usage frequency, but add a cache so it only runs once per chat session:

```ts
const recentPeersCacheRef = useRef<PeerProfile[] | null>(null);

useEffect(() => {
    const fetchRecentPeers = async () => {
        // Use cache if available
        if (recentPeersCacheRef.current) {
            setRecentPeers(recentPeersCacheRef.current.filter(p => p.id !== peer?.id));
            return;
        }
        // ... existing fetch logic ...
        recentPeersCacheRef.current = peers;
        setRecentPeers(peers.filter(p => p.id !== peer?.id));
    };
    if (forwardMsg) fetchRecentPeers();
}, [forwardMsg, peer?.id]);
```

---

### Issue 9 — `typingUsers` never times out for the local user's own typing state

**Location:** The typing broadcast `useEffect`.

**Bug:** When the current user stops typing, a `isTyping: false` broadcast is sent after 3000ms of inactivity. But if the recipient receives the `isTyping: true` broadcast and then the connection drops before receiving `isTyping: false`, the typing indicator stays visible forever.

**Fix:** In the typing channel subscription handler, add a timeout that automatically clears a user from `typingUsers` after 5 seconds if no new typing event is received:

```ts
const typingTimeoutsRef = useRef<Record<string, NodeJS.Timeout>>({});

typingChannel
    .on('broadcast', { event: 'typing' }, ({ payload }) => {
        const { userId, isTyping } = payload;
        if (userId === currentUserId) return;

        // Clear any existing timeout for this user
        if (typingTimeoutsRef.current[userId]) {
            clearTimeout(typingTimeoutsRef.current[userId]);
        }

        setTypingUsers(prev => {
            const next = new Set(prev);
            if (isTyping) {
                next.add(userId);
                // Auto-clear after 5 seconds if no further typing event
                typingTimeoutsRef.current[userId] = setTimeout(() => {
                    setTypingUsers(p => {
                        const n = new Set(p);
                        n.delete(userId);
                        return n;
                    });
                }, 5000);
            } else {
                next.delete(userId);
            }
            return next;
        });
    })
```

Clean up in the return:
```ts
return () => {
    supabase.removeChannel(typingChannel);
    typingChannelRef.current = null;
    Object.values(typingTimeoutsRef.current).forEach(clearTimeout);
    typingTimeoutsRef.current = {};
};
```

---

### Issue 10 — Scheduled message polling is incomplete

**Location:** `handleScheduleAction` and the overdue messages check in `loadMessages`.

**Bug:** When a scheduled message becomes due, the logic fetches overdue messages on chat load:
```ts
const overdue = await getOverdueScheduledMessages(peer.id, currentUserId);
for (const msg of overdue) {
    await sendMessage(peer.id, currentUserId, msg.content, msg.type);
    await markScheduledMessageSent(msg.id);
}
```

This only fires when the chat is opened. If the user has the chat open when a scheduled message becomes due, it never gets sent until they close and reopen the chat. The `pendingScheduledMsgs` state is also only in local memory — it resets on page reload.

**Fix:** Add a periodic check for overdue scheduled messages while the chat is open. Add this inside the main `useEffect` (alongside the message loading), or as a separate `useEffect`:

```ts
useEffect(() => {
    if (!peer || !currentUserId) return;

    const checkScheduled = async () => {
        const overdue = await getOverdueScheduledMessages(peer.id, currentUserId);
        for (const msg of overdue) {
            await sendMessage(peer.id, currentUserId, msg.content, msg.type);
            await markScheduledMessageSent(msg.id);
        }
        // Update local pending list to remove sent ones
        if (overdue.length > 0) {
            const sentIds = new Set(overdue.map(m => m.id));
            setPendingScheduledMsgs(prev => prev.filter(m => !sentIds.has(m.id)));
        }
    };

    // Check every 30 seconds while chat is open
    const interval = setInterval(checkScheduled, 30000);
    return () => clearInterval(interval);
}, [peer?.id, currentUserId]);
```

---

### Verification checklist
- [ ] `fetchInitialStatus()` called only once in its `useEffect`
- [ ] `PollMessage.fetchPoll` wrapped in `useCallback`, in the Realtime effect dependency array
- [ ] GIF picker shows "unavailable" if `NEXT_PUBLIC_GIPHY_API_KEY` is not set (no hardcoded key)
- [ ] Two images sent simultaneously both appear correctly (no deduplication collision)
- [ ] Message delete uses inline two-step confirmation, no `confirm()` dialog
- [ ] `compressVideo` closes `AudioContext` in both success and error paths
- [ ] Forward modal uses `recentPeersCacheRef` — does not re-fetch on every open
- [ ] Typing indicator auto-clears after 5 seconds for disconnected users
- [ ] Scheduled messages are checked every 30 seconds while chat is open