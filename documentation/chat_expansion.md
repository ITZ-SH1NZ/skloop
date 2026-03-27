# Skloop — Chat Expansion Prompts

---

## PROMPT 1 — Unread Counts, Pagination & Real-Time Read Receipts

**Read these files first:**
```
actions/chat-actions.ts
components/peer/ChatWindow.tsx
app/(app)/peer/chat/page.tsx
```

---

### Part A — Unread count badges in the sidebar

**The problem:** The sidebar shows conversation previews but zero unread count indicators. The `markMessagesAsRead` action exists and works, but the sidebar never queries how many unread messages exist per conversation.

**DB migration (run in Supabase SQL editor):**
```sql
-- Add unread count to conversation query (no schema change needed)
-- The unread count is computed as: messages where sender_id != current_user AND status != 'read'
-- We'll add a helper function to make this efficient

CREATE OR REPLACE FUNCTION get_unread_count(p_conversation_id uuid, p_user_id uuid)
RETURNS integer AS $$
  SELECT COUNT(*)::integer
  FROM messages
  WHERE conversation_id = p_conversation_id
    AND sender_id != p_user_id
    AND status != 'read'
    AND is_deleted = false;
$$ LANGUAGE sql STABLE;
```

**Fix 1 — `actions/chat-actions.ts`: Add unread count to `getUserConversations`**

In the `getUserConversations` function, after building `lastMsgMap`, add an unread count query:

```ts
// After building lastMsgMap, before the dms/groups loop:
const { data: unreadCounts } = await supabase
    .rpc('get_unread_count_batch', { p_user_id: user.id, p_conversation_ids: convoIds });

// Build a map: conversation_id -> unread count
const unreadMap = new Map<string, number>();
for (const row of (unreadCounts ?? [])) {
    unreadMap.set(row.conversation_id, row.count);
}
```

If the RPC approach is complex, use a simpler inline count instead:

```ts
// Get unread counts for all conversations in one query
const { data: unreadRows } = await supabase
    .from('messages')
    .select('conversation_id')
    .in('conversation_id', convoIds)
    .neq('sender_id', user.id)
    .neq('status', 'read')
    .eq('is_deleted', false);

const unreadMap = new Map<string, number>();
for (const row of (unreadRows ?? [])) {
    unreadMap.set(row.conversation_id, (unreadMap.get(row.conversation_id) || 0) + 1);
}
```

Then pass `unreadCount` into each DM and group object:
```ts
dms.push({
    // ...existing fields
    unreadCount: unreadMap.get(convo.id) || 0,
});
groups.push({
    // ...existing fields  
    unreadCount: unreadMap.get(convo.id) || 0,
});
```

Add `unreadCount?: number` to the `PeerProfile` interface in `components/peer/PeerCard.tsx`.

**Fix 2 — `app/(app)/peer/chat/page.tsx`: Render unread badge on each conversation row**

In both the DM and group conversation `motion.button` elements, inside the `!isSidebarCollapsed` block, add after the timestamp:

```tsx
{(chat.unreadCount || 0) > 0 && (
    <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="shrink-0 min-w-[20px] h-5 bg-[#D4F268] text-black text-[10px] font-black rounded-full flex items-center justify-center px-1.5 shadow-sm"
    >
        {chat.unreadCount! > 99 ? '99+' : chat.unreadCount}
    </motion.span>
)}
```

When a conversation is selected (clicked), immediately reset its unread count to 0 in the SWR cache via optimistic update:

```ts
// In the onClick handler where setSelectedPeerId is called:
onClick={() => {
    setSelectedPeerId(chat.id);
    // Optimistically clear unread count in sidebar
    if (convosData && (chat.unreadCount || 0) > 0) {
        const clearUnread = (list: PeerProfile[]) =>
            list.map(c => c.id === chat.id ? { ...c, unreadCount: 0 } : c);
        mutate({
            dms: clearUnread(convosData.dms),
            groups: clearUnread(convosData.groups)
        }, false);
    }
}}
```

Also add a total unread count to the sidebar header — above the search bar, show "Chats" with a total badge if there are any unread:

```tsx
<h2 className="text-2xl font-bold tracking-tight text-zinc-900">
    Chats
    {totalUnread > 0 && (
        <span className="ml-2 text-sm font-black bg-[#D4F268] text-black px-2 py-0.5 rounded-full">
            {totalUnread}
        </span>
    )}
</h2>
```

Where `totalUnread` = `[...dms, ...groups].reduce((sum, c) => sum + (c.unreadCount || 0), 0)`.

---

### Part B — Message pagination (infinite scroll upward)

**The problem:** `getConversationMessages` fetches `.limit(100)`. Conversations longer than 100 messages permanently lose older history.

**Fix 1 — `actions/chat-actions.ts`: Add cursor-based pagination to `getConversationMessages`**

Change the function signature to accept optional pagination params:

```ts
export async function getConversationMessages(
    conversationId: string,
    options?: { before?: string; limit?: number } // before = ISO timestamp of oldest loaded message
): Promise<MessageRow[]> {
```

Add cursor condition to the query:
```ts
let query = supabase
    .from('messages')
    .select(`...`) // same select as now
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(options?.limit ?? 50);

// If a cursor is provided, only fetch messages older than that timestamp
if (options?.before) {
    query = query.lt('created_at', options.before);
}
```

Change `.limit(100)` to `.limit(50)` (50 is the right default — loads fast, gives context).

**Fix 2 — `components/peer/ChatWindow.tsx`: Add "load more" on scroll to top**

Add state for pagination:
```ts
const [hasMore, setHasMore] = useState(true);
const [isLoadingMore, setIsLoadingMore] = useState(false);
const oldestTimestampRef = useRef<string | null>(null);
```

After initial message load, set the oldest timestamp:
```ts
// In loadMessages(), after setMessages(history):
if (history.length > 0) {
    oldestTimestampRef.current = history[0].timestamp.toISOString();
}
setHasMore(history.length >= 50); // if we got fewer than 50, there's no more
```

Add a `loadMoreMessages` function:
```ts
const loadMoreMessages = async () => {
    if (!peer || isLoadingMore || !hasMore || !oldestTimestampRef.current) return;
    setIsLoadingMore(true);

    // Save current scroll position before prepending
    const container = scrollContainerRef.current;
    const scrollHeightBefore = container?.scrollHeight || 0;

    try {
        const older = await getConversationMessages(peer.id, { 
            before: oldestTimestampRef.current,
            limit: 50 
        });
        
        if (older.length === 0) {
            setHasMore(false);
            return;
        }

        // Update oldest timestamp cursor
        oldestTimestampRef.current = older[0].timestamp.toISOString();
        setHasMore(older.length >= 50);

        // Prepend older messages WITHOUT jumping scroll position
        setMessages(prev => [...older, ...prev]);

        // Restore scroll position after prepend
        requestAnimationFrame(() => {
            if (container) {
                const scrollHeightAfter = container.scrollHeight;
                container.scrollTop = scrollHeightAfter - scrollHeightBefore;
            }
        });
    } finally {
        setIsLoadingMore(false);
    }
};
```

Add a scroll listener to trigger loading when the user scrolls near the top:
```ts
const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
    setIsAtBottom(isNearBottom);

    if (isNearBottom && messages.length > 0) {
        setLastReadId(messages[messages.length - 1].id);
    }

    // Load more when near the top
    if (scrollTop < 200 && hasMore && !isLoadingMore) {
        loadMoreMessages();
    }
};
```

Add a loading indicator at the top of the messages list, inside the scroll container, before the date groups:
```tsx
{/* Load more indicator at top */}
{isLoadingMore && (
    <div className="flex justify-center py-4">
        <div className="flex items-center gap-2 text-xs font-bold text-zinc-400 uppercase tracking-widest">
            <Loader2 size={14} className="animate-spin" />
            Loading older messages...
        </div>
    </div>
)}
{!hasMore && messages.length >= 50 && (
    <div className="flex justify-center py-4">
        <div className="text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
            Beginning of conversation
        </div>
    </div>
)}
```

---

### Part C — Real-time read receipts back to sender

**The problem:** When the recipient reads messages, `markMessagesAsRead` updates the DB but the sender never sees their tick marks update from grey (delivered) to blue (read) without closing and reopening the chat.

**Fix — `components/peer/ChatWindow.tsx`: Subscribe to status changes on sent messages**

In the main Realtime `useEffect` (the one subscribing to `chat:messages:${peer.id}`), add a second `postgres_changes` listener for message status updates:

```ts
.on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'messages',
    filter: `conversation_id=eq.${peer.id}`
}, (payload) => {
    const updated = payload.new as any;
    // Only update status changes on OUR messages (so the sender sees their tick change)
    if (updated.sender_id === currentUserId) {
        setMessages(prev => prev.map(m => 
            m.id === updated.id 
                ? { ...m, status: updated.status }
                : m
        ));
    }
    // Also handle content edits and deletes (existing logic already covers this,
    // but merge them here to avoid duplicate handlers)
})
```

This is already partially handled by the existing UPDATE handler, but the current handler doesn't specifically update status for messages sent by the current user — it maps by `m.id === updated.id` for all updates but the status field may be getting skipped. Verify the existing UPDATE handler explicitly includes `status: updated.status` in the mapping, and if not, add it.

---

### Verification checklist
- [ ] Sidebar conversation rows show lime green unread count badge
- [ ] Badge disappears immediately when conversation is clicked (optimistic update)
- [ ] "Chats" header shows total unread count badge
- [ ] `getConversationMessages` accepts `before` cursor and `limit` params
- [ ] Initial load is 50 messages, not 100
- [ ] Scrolling to the top of a long conversation triggers loading older messages
- [ ] Scroll position is preserved after prepending older messages (doesn't jump)
- [ ] "Beginning of conversation" indicator shows when all messages are loaded
- [ ] Sender's message tick marks update to blue (✓✓) in real time when recipient reads

---

---

## PROMPT 2 — @Mentions, Message Drafts & File Sharing

**Read these files first:**
```
components/peer/ChatWindow.tsx
actions/chat-actions.ts
actions/notification-actions.ts
```

---

### Part A — @mention in group chats

**The problem:** Study circles (group chats) have no @mention support. Users can't directly notify someone in a group.

**Fix 1 — `actions/chat-actions.ts`: Add `getConversationMembers` usage for mention lookup**

The `getConversationMembers` function already exists — it fetches all participants with their profiles. No backend changes needed. The work is entirely in the UI.

**Fix 2 — `components/peer/ChatWindow.tsx`: Mention autocomplete**

Add mention state:
```ts
const [mentionQuery, setMentionQuery] = useState<string | null>(null); // null = not in mention mode
const [mentionResults, setMentionResults] = useState<{ id: string; name: string; username: string; avatarUrl?: string }[]>([]);
const [mentionAnchor, setMentionAnchor] = useState(0); // cursor position of the @ sign
const [groupMembers, setGroupMembers] = useState<{ id: string; name: string; username: string; avatarUrl?: string }[]>([]);
```

Load group members when a group chat opens (only for groups):
```ts
useEffect(() => {
    if (!peer || peer.type !== 'group') return;
    getConversationMembers(peer.id).then(members => {
        setGroupMembers(members.map(m => ({
            id: m.userId,
            name: m.name,
            username: m.username,
            avatarUrl: m.avatarUrl
        })));
    });
}, [peer?.id, peer?.type]);
```

Update the input `onChange` handler to detect `@` triggers:
```ts
const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);

    if (!isGroup) return;

    // Detect @ mention trigger
    const cursorPos = e.target.selectionStart || 0;
    const textBeforeCursor = value.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
        const query = mentionMatch[1].toLowerCase();
        setMentionQuery(query);
        setMentionAnchor(cursorPos - mentionMatch[0].length);
        
        const filtered = groupMembers.filter(m =>
            m.name.toLowerCase().includes(query) ||
            m.username.toLowerCase().includes(query)
        );
        setMentionResults(filtered.slice(0, 5));
    } else {
        setMentionQuery(null);
        setMentionResults([]);
    }
};
```

Replace the input `onChange={e => setInputValue(e.target.value)}` with `onChange={handleInputChange}`.

Add the mention dropdown above the input (inside the `AnimatePresence` block in the input area):
```tsx
{isGroup && mentionQuery !== null && mentionResults.length > 0 && (
    <motion.div
        key="mention-dropdown"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        className="absolute bottom-full left-4 mb-2 z-50 bg-white border border-zinc-200 rounded-2xl shadow-xl overflow-hidden min-w-[220px]"
    >
        {mentionResults.map((member, i) => (
            <button
                key={member.id}
                type="button"
                onClick={() => insertMention(member)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors text-left"
            >
                <Avatar src={member.avatarUrl} fallback={member.name[0]} className="w-8 h-8 rounded-full" />
                <div>
                    <div className="text-sm font-bold text-zinc-900">{member.name}</div>
                    <div className="text-xs text-zinc-400">@{member.username}</div>
                </div>
            </button>
        ))}
    </motion.div>
)}
```

Add `insertMention` function:
```ts
const insertMention = (member: { id: string; username: string }) => {
    const before = inputValue.slice(0, mentionAnchor);
    const after = inputValue.slice(inputValue.indexOf(' ', mentionAnchor) === -1 
        ? inputValue.length 
        : inputValue.indexOf(' ', mentionAnchor));
    
    setInputValue(`${before}@${member.username} ${after}`.trimEnd() + ' ');
    setMentionQuery(null);
    setMentionResults([]);
};
```

Handle keyboard navigation in the mention dropdown — on `ArrowDown`, `ArrowUp`, `Enter`, `Escape` in the input `onKeyDown`:
```ts
const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (mentionQuery !== null && mentionResults.length > 0) {
        if (e.key === 'Escape') {
            setMentionQuery(null);
            setMentionResults([]);
            e.preventDefault();
        }
        // Enter selects the first result
        if (e.key === 'Enter' && mentionResults.length > 0) {
            e.preventDefault();
            insertMention(mentionResults[0]);
            return;
        }
    }
    // Existing Enter-to-send logic (only when not in mention mode)
    if (e.key === 'Enter' && !e.shiftKey && mentionQuery === null) {
        e.preventDefault();
        editingMsg ? handleEdit(editingMsg.id, inputValue) : handleSend();
    }
};
```

Add `onKeyDown={handleKeyDown}` to the text input.

**Fix 3 — Render @mentions highlighted in messages**

In the message text rendering block (where `msg.text` is rendered as a `<p>`), replace the plain text with a mention-aware renderer:

```tsx
// Replace:
<p className="font-semibold leading-snug whitespace-pre-wrap text-sm">{msg.text}</p>

// With:
<p className="font-semibold leading-snug whitespace-pre-wrap text-sm">
    {msg.text?.split(/(@\w+)/).map((part, i) =>
        part.startsWith('@') ? (
            <span key={i} className={`font-black ${isMe ? 'text-black/70 bg-black/10' : 'text-[#4d7c0f] bg-lime-100'} px-1 rounded`}>
                {part}
            </span>
        ) : part
    )}
</p>
```

**Fix 4 — `actions/chat-actions.ts`: Notify mentioned users**

In `sendMessage`, after creating notifications for all participants, add mention-specific notifications:

```ts
// After the existing participant notification block, add:
// Detect @mentions in content and send priority notifications
const mentionMatches = content.match(/@(\w+)/g);
if (mentionMatches && participants) {
    for (const mention of mentionMatches) {
        const username = mention.slice(1);
        // Find the mentioned user among participants
        const { data: mentionedProfile } = await supabase
            .from('profiles')
            .select('id')
            .eq('username', username)
            .single();
        
        if (mentionedProfile && mentionedProfile.id !== senderId) {
            // Create a higher-priority mention notification (overwrites the regular message notification)
            await createNotification({
                user_id: mentionedProfile.id,
                actor_id: senderId,
                type: 'mention',
                title: `${senderName} mentioned you`,
                content: content.slice(0, 100),
                metadata: { conversation_id: conversationId, message_id: data.id }
            });
        }
    }
}
```

---

### Part B — Message draft persistence

**The problem:** Switching between conversations loses any text you were typing. This is a 10-line fix with outsized UX impact.

**Fix — `components/peer/ChatWindow.tsx`**

On mount, restore the draft from localStorage:
```ts
// At the start of ChatWindow, after state declarations, add:
useEffect(() => {
    if (!peer) return;
    const draft = localStorage.getItem(`skloop:chat:draft:${peer.id}`);
    if (draft) setInputValue(draft);
    
    // Cleanup: clear draft on unmount if input is empty
    return () => {
        const currentInput = inputValue;
        if (currentInput.trim()) {
            localStorage.setItem(`skloop:chat:draft:${peer.id}`, currentInput);
        } else {
            localStorage.removeItem(`skloop:chat:draft:${peer.id}`);
        }
    };
}, [peer?.id]); // Only runs when peer changes, not on every inputValue change
```

Save draft on input change (debounced):
```ts
// Add a ref for the draft save timeout
const draftSaveRef = useRef<NodeJS.Timeout | null>(null);

// In the input onChange (alongside the existing setInputValue call):
if (draftSaveRef.current) clearTimeout(draftSaveRef.current);
draftSaveRef.current = setTimeout(() => {
    if (peer) {
        if (inputValue.trim()) {
            localStorage.setItem(`skloop:chat:draft:${peer.id}`, inputValue);
        } else {
            localStorage.removeItem(`skloop:chat:draft:${peer.id}`);
        }
    }
}, 500);
```

Clear draft after successful send:
```ts
// In handleSend(), after setInputValue(""):
localStorage.removeItem(`skloop:chat:draft:${peer.id}`);
```

Show a subtle "Draft" indicator in the sidebar for conversations with a saved draft. In `app/(app)/peer/chat/page.tsx`, in the conversation row's last message preview:
```tsx
// Before rendering chat.lastMessage, check for a draft:
const hasDraft = typeof window !== 'undefined' && 
    !!localStorage.getItem(`skloop:chat:draft:${chat.id}`);

// In the last message preview span:
{hasDraft ? (
    <span className="text-[13px] truncate text-amber-600 font-bold">
        Draft: {localStorage.getItem(`skloop:chat:draft:${chat.id}`)?.slice(0, 30)}...
    </span>
) : getTypingSummary(chat.id) ? (
    // ... existing typing indicator
) : (
    // ... existing last message
)}
```

---

### Part C — File / document sharing

**The problem:** The attachment menu only offers Photos. For a coding platform, sharing PDFs, zip files, and generic files is expected.

**Fix 1 — `components/peer/ChatWindow.tsx`: Add File option to attachment menu**

Add a second file input ref for non-media files:
```ts
const fileInputRef = useRef<HTMLInputElement>(null);        // existing — images/video/audio
const docInputRef = useRef<HTMLInputElement>(null);         // new — any file type
```

Add a "File" button to the attachment menu (inside the `showAttachments` AnimatePresence block, after the Code Snippet button):
```tsx
<button
    key="att-file"
    type="button"
    onClick={() => {
        if (docInputRef.current) {
            docInputRef.current.accept = "*/*";
            docInputRef.current.click();
        }
        setShowAttachments(false);
    }}
    className="w-full flex items-center gap-3 px-3 py-3 hover:bg-[#84cc16]/10 rounded-xl text-sm font-semibold text-zinc-700 transition-colors group/att"
>
    <FileText size={18} className="text-orange-500 group-hover/att:scale-110 transition-transform" />
    File
</button>
```

Add the hidden input for document files (alongside the existing `fileInputRef` input):
```tsx
<input
    type="file"
    ref={docInputRef}
    className="hidden"
    accept="*/*"
    multiple
    onChange={handleDocUpload}
/>
```

Add `handleDocUpload` function — similar to `handleFileUpload` but skips compression and sets type to `'file'`:
```ts
const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Size check — 50MB limit
    const oversized = files.filter(f => f.size > 50 * 1024 * 1024);
    if (oversized.length > 0) {
        alert(`${oversized[0].name} is too large. Max file size is 50MB.`);
        return;
    }

    const newPending = files.map(file => ({
        file,
        previewUrl: '',  // No preview for generic files
        type: 'file' as const
    }));

    setPendingFiles(prev => [...prev, ...newPending].slice(0, 10));
    if (docInputRef.current) docInputRef.current.value = '';
};
```

**Fix 2 — Render file messages properly**

In the attachment rendering block (inside the `msg.attachments?.map()` loop), add a file renderer:

```tsx
{att.type === 'file' && (
    <a
        href={att.url}
        download={att.name}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-3 p-3 rounded-xl border transition-colors hover:opacity-80 ${
            isMe ? 'bg-black/10 border-black/10' : 'bg-zinc-50 border-zinc-100'
        }`}
    >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            isMe ? 'bg-black/10' : 'bg-zinc-100'
        }`}>
            <FileText size={20} className={isMe ? 'text-black/60' : 'text-zinc-500'} />
        </div>
        <div className="min-w-0 flex-1">
            <p className={`text-sm font-bold truncate ${isMe ? 'text-black/90' : 'text-zinc-900'}`}>
                {att.name || 'File'}
            </p>
            <p className={`text-[10px] uppercase tracking-widest font-bold ${isMe ? 'text-black/40' : 'text-zinc-400'}`}>
                {att.name?.split('.').pop()?.toUpperCase() || 'FILE'} · Download
            </p>
        </div>
        <div className={`shrink-0 ${isMe ? 'text-black/40' : 'text-zinc-400'}`}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 2v8M4 7l4 4 4-4M2 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
        </div>
    </a>
)}
```

**Fix 3 — Update the pending file preview for generic files**

In the `pendingFiles.map()` rendering block, add a case for `type === 'file'` (it currently falls through to `<FileText>` already — verify this renders correctly with the file name):

```tsx
{pf.type === 'file' && (
    <div className="h-24 w-24 rounded-lg border-2 border-zinc-900 bg-zinc-50 flex flex-col items-center justify-center gap-1 px-2">
        <FileText size={22} className="text-zinc-500" />
        <p className="text-[9px] font-bold text-zinc-500 text-center truncate w-full">{pf.file.name}</p>
    </div>
)}
```

---

### Verification checklist

**Mentions:**
- [ ] Typing `@` in a group chat triggers a dropdown of members
- [ ] Typing `@jo` filters members whose name/username contains "jo"
- [ ] Pressing Enter or clicking a member inserts `@username ` into the input
- [ ] Pressing Escape closes the mention dropdown
- [ ] Sent messages show @mentions highlighted in lime/black
- [ ] Mentioned user receives a "mentioned you" notification

**Drafts:**
- [ ] Typing in a conversation and switching to another preserves the text
- [ ] Returning to the conversation restores the draft text in the input
- [ ] Sending a message clears the draft from localStorage
- [ ] Sidebar shows "Draft: ..." preview for conversations with unsent drafts

**File sharing:**
- [ ] Attachment menu has a "File" button
- [ ] Clicking "File" opens file picker accepting any file type
- [ ] File appears as a styled download card in the message (not as a broken image)
- [ ] File name, extension badge, and download arrow are visible
- [ ] Files over 50MB show an error instead of attempting upload
- [ ] Pending file preview shows filename, not a blank card