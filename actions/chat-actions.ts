"use server";

import { createClient } from "@/utils/supabase/server";

export interface MessageAttachment {
    url: string;
    type: 'image' | 'video' | 'audio' | 'file';
    name?: string;
}

export interface MessageRow {
    id: string;
    senderId: string;
    senderName?: string;
    senderAvatar?: string;
    text?: string;
    caption?: string;
    mediaUrl?: string; // Legacy support
    attachments?: MessageAttachment[];
    type: "text" | "image" | "video" | "audio" | "sticker" | "gif" | "file" | "poll";
    status?: 'sent' | 'delivered' | 'read';
    replyToId?: string;
    isEdited?: boolean;
    editedAt?: Date;
    isDeleted?: boolean;
    reactions?: { emoji: string; count: number; userIds: string[] }[];
    timestamp: Date;
    pollId?: string; // Link to polls table for type === 'poll'
}

/**
 * Fetches message history for a specific conversation with sender profiles joined.
 */
export async function getConversationMessages(conversationId: string): Promise<MessageRow[]> {
    const supabase = await createClient();

    const { data: dbMessages, error } = await supabase
        .from('messages')
        .select(`
            id,
            sender_id,
            content,
            caption,
            type,
            status,
            reply_to_id,
            attachments,
            is_edited,
            edited_at,
            is_deleted,
            poll_id,
            created_at,
            profiles (
                id,
                full_name,
                username,
                avatar_url
            ),
            message_reactions (
                emoji,
                user_id
            )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(100);

    if (error) {
        console.error("Error fetching messages:", error);
        return [];
    }

    return (dbMessages ?? []).map((m: any) => {
        const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
        const isUrl = typeof m.content === 'string' && m.content.startsWith('https://');
        const isGif = isUrl && m.content.includes('giphy.com');

        const msgType = m.type || (isGif ? 'gif' : isUrl ? 'image' : 'text');

        return {
            id: m.id,
            senderId: m.sender_id,
            senderName: profile?.full_name || profile?.username || 'User',
            senderAvatar: profile?.avatar_url,
            text: m.content || undefined,
            caption: m.caption || undefined,
            type: msgType as any,
            mediaUrl: isUrl ? m.content : undefined,
            attachments: m.attachments || [],
            status: m.status || 'sent',
            replyToId: m.reply_to_id || undefined,
            isEdited: m.is_edited || false,
            editedAt: m.edited_at ? new Date(m.edited_at) : undefined,
            isDeleted: m.is_deleted || false,
            pollId: m.poll_id || undefined,
            reactions: m.message_reactions ? (m.message_reactions as any[]).reduce((acc: any[], r) => {
                const existing = acc.find(a => a.emoji === r.emoji);
                if (existing) {
                    existing.count++;
                    existing.userIds.push(r.user_id);
                } else {
                    acc.push({ emoji: r.emoji, count: 1, userIds: [r.user_id] });
                }
                return acc;
            }, []) : [],
            timestamp: new Date(m.created_at),
        } as MessageRow;
    });
}

/**
 * Sends a new message to a conversation.
 * Uses the authenticated user's identity from the server session.
 */
export async function sendMessage(
    conversationId: string,
    senderId: string,
    content: string,
    type: MessageRow['type'] = 'text',
    caption?: string,
    attachments: MessageAttachment[] = [],
    replyToId?: string
) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            sender_id: senderId,
            content: content,
            type: type,
            attachments: attachments,
            ...(caption ? { caption } : {}),
            ...(replyToId ? { reply_to_id: replyToId } : {}),
            status: 'sent'
        })
        .select()
        .single();

    if (error) {
        console.error("Error sending message:", error);
        throw new Error(error.message);
    }

    return data;
}

/**
 * Finds an existing direct conversation between two users, or creates one.
 * Returns the conversation ID.
 */
export async function getOrCreateDirectConversation(targetUserId: string): Promise<string | null> {
    console.log("[Chat Action] getOrCreateDirectConversation called for target:", targetUserId);
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.log("[Chat Action] No authenticated user found");
        return null;
    }
    console.log("[Chat Action] Authenticated user:", user.id);

    // Call the "God Mode" RPC to handle the entire creation flow atomically
    console.log("[Chat Action] Calling initiate_direct_chat RPC...");
    const { data: convoId, error: rpcError } = await supabase
        .rpc('initiate_direct_chat', {
            target_user_id: targetUserId,
        });

    if (rpcError) {
        console.error("[Chat Action] initiate_direct_chat RPC failed:", rpcError);
        console.error("Make sure you have run the new SQL script in the Supabase SQL Editor.");
        return null;
    }

    console.log("[Chat Action] initiate_direct_chat success! Convo ID:", convoId);
    return convoId as string;
}

/**
 * Fetches all conversations the current user is part of, with last-message previews.
 */
export async function getUserConversations() {
    console.log("[Chat Action] getUserConversations called");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        console.log("[Chat Action] getUserConversations: No user found");
        return { dms: [], groups: [] };
    }
    console.log("[Chat Action] getUserConversations for user:", user.id);

    // Get all conversation IDs for this user
    const { data: myConvos, error } = await supabase
        .from('conversation_participants')
        .select(`
            conversation_id,
            conversations (
                id, type, title, tags, description, avatar_url, updated_at
            )
        `)
        .eq('user_id', user.id);
    
    if (error || !myConvos || myConvos.length === 0) {
        console.log("[Chat Action] getUserConversations: No conversations found", error);
        return { dms: [], groups: [] };
    }

    // Sort by updated_at manually since we're joining
    myConvos.sort((a, b) => {
        const timeA = new Date((a.conversations as any)?.updated_at || 0).getTime();
        const timeB = new Date((b.conversations as any)?.updated_at || 0).getTime();
        return timeB - timeA;
    });
    console.log("[Chat Action] getUserConversations: Found", myConvos.length, "participants/convo links");

    const convoIds = myConvos.map((mc: any) => mc.conversation_id);

    // Pull all participants for these convos (to find the 'other' person in DMs)
    const { data: allParticipants } = await supabase
        .from('conversation_participants')
        .select(`
            conversation_id,
            user_id,
            profiles (
                id, username, full_name, avatar_url, role, last_seen
            )
        `)
        .in('conversation_id', convoIds)
        .neq('user_id', user.id);

    // Pull last messages for preview
    const { data: lastMessages } = await supabase
        .from('messages')
        .select('conversation_id, content, created_at, sender_id')
        .in('conversation_id', convoIds)
        .order('created_at', { ascending: false });

    // Build a map: conversation_id -> last message
    const lastMsgMap = new Map<string, { content: string; created_at: string; sender_id: string }>();
    for (const msg of (lastMessages ?? [])) {
        if (!lastMsgMap.has(msg.conversation_id)) {
            lastMsgMap.set(msg.conversation_id, msg);
        }
    }

    const dms: any[] = [];
    const groups: any[] = [];

    for (const mc of myConvos) {
        const convo = (mc as any).conversations;
        if (!convo) continue;

        const lastMsg = lastMsgMap.get(convo.id);
        const lastMessage = lastMsg?.content;
        const lastMessageAt = lastMsg?.created_at;

        if (convo.type === 'group') {
            groups.push({
                id: convo.id,
                name: convo.title || 'Study Circle',
                username: 'group',
                description: convo.description,
                avatarUrl: convo.avatar_url,
                track: convo.tags?.[0] || 'Study Circle',
                type: 'group',
                level: 0, xp: 0, streak: 0, status: 'none',
                lastMessage,
                lastMessageAt,
            });
        } else if (convo.type === 'direct') {
            const peer = allParticipants?.find((p: any) => p.conversation_id === convo.id);
            if (peer && peer.profiles) {
                const profile = Array.isArray(peer.profiles) ? peer.profiles[0] : peer.profiles as any;
                dms.push({
                    id: convo.id,
                    peerId: peer.user_id, // actual user ID for presence tracking
                    name: profile?.full_name || profile?.username || 'User',
                    username: profile?.username || '',
                    avatarUrl: profile?.avatar_url,
                    track: profile?.role || 'Learner',
                    lastSeen: profile?.last_seen,
                    type: 'direct',
                    level: 0, xp: 0, streak: 0, status: 'none',
                    lastMessage,
                    lastMessageAt,
                });
            }
        }
    }

    return { dms, groups };
}

/**
 * Fetches real members of a group conversation.
 */
export async function getConversationMembers(conversationId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('conversation_participants')
        .select(`
            user_id,
            role,
            joined_at,
            profiles (
                id, full_name, username, avatar_url
            )
        `)
        .eq('conversation_id', conversationId);

    if (error) {
        console.error("Error fetching members:", error);
        return [];
    }

    return (data ?? []).map((p: any) => {
        const profile = Array.isArray(p.profiles) ? p.profiles[0] : p.profiles as any;
        return {
            id: p.user_id,
            name: profile?.full_name || profile?.username || 'User',
            username: profile?.username || '',
            avatarUrl: profile?.avatar_url,
            role: p.role,
            joinedAt: p.joined_at,
        };
    });
}

/**
 * Returns accepted friends (connections) with profile info.
 * Used to populate the New Chat picker.
 */
export async function getFriendsList(): Promise<{
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
}[]> {
    console.log("[Chat Action] getFriendsList called");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: connections } = await supabase
        .from('connections')
        .select('requester_id, recipient_id')
        .eq('status', 'accepted')
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

    if (!connections || connections.length === 0) {
        console.log("[Chat Action] getFriendsList: No accepted connections found");
        return [];
    }
    console.log("[Chat Action] getFriendsList: Found", connections.length, "connections");

    const peerIds = connections.map((c: any) =>
        c.requester_id === user.id ? c.recipient_id : c.requester_id
    );

    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, username, avatar_url')
        .in('id', peerIds);

    return (profiles ?? []).map((p: any) => ({
        id: p.id,
        name: p.full_name || p.username || 'User',
        username: p.username || '',
        avatarUrl: p.avatar_url,
    }));
}

/**
 * Uploads a file to Supabase Storage and returns the public URL.
 */
export async function uploadChatFile(formData: FormData): Promise<string | null> {
    const file = formData.get('file') as File;
    if (!file) return null;

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from('message_attachments')
        .upload(filePath, file);

    if (uploadError) {
        console.error("Error uploading file:", uploadError);
        throw new Error("Failed to upload file");
    }

    const { data: { publicUrl } } = supabase.storage
        .from('message_attachments')
        .getPublicUrl(filePath);

    return publicUrl;
}

/**
 * Edits an existing message.
 */
export async function editMessage(messageId: string, content: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
        .from('messages')
        .update({
            content: content,
            is_edited: true,
            edited_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', user.id) // Security check
        .select()
        .single();

    if (error) throw new Error(error.message);
    return data;
}

/**
 * Marks a message as deleted.
 */
export async function deleteMessage(messageId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data, error } = await supabase
        .from('messages')
        .update({
            is_deleted: true,
            content: "Message deleted" // Wipe content for safety
        })
        .eq('id', messageId)
        .eq('sender_id', user.id) // Security check
        .select()
        .maybeSingle();

    if (error) throw new Error(error.message);
    return data;
}

/**
 * Marks all unread messages from a specific sender in a conversation as read.
 */
export async function markMessagesAsRead(conversationId: string, peerId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase
        .from('messages')
        .update({ status: 'read' })
        .eq('conversation_id', conversationId)
        .eq('sender_id', peerId)
        .neq('status', 'read');

    if (error) throw new Error(error.message);
    return { success: true };
}

/**
 * Toggles an emoji reaction on a message.
 */
export async function toggleReaction(messageId: string, emoji: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Check if reaction exists
    const { data: existing } = await supabase
        .from('message_reactions')
        .select('id')
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .maybeSingle();

    if (existing) {
        // Remove it
        await supabase.from('message_reactions').delete().eq('id', existing.id);
        return { action: 'removed' };
    } else {
        // Add it
        await supabase.from('message_reactions').insert({
            message_id: messageId,
            user_id: user.id,
            emoji
        });
        return { action: 'added' };
    }
}

// ============================================================
// PINNED MESSAGES
// ============================================================

/**
 * Pins a message in a conversation (overwrites any existing pin).
 */
export async function pinMessage(conversationId: string, messageId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Upsert: remove existing pin and add new one
    await supabase.from('pinned_messages').delete().eq('conversation_id', conversationId);
    const { data, error } = await supabase.from('pinned_messages').insert({
        conversation_id: conversationId,
        message_id: messageId,
        pinned_by: user.id,
    }).select().single();

    if (error) throw new Error(error.message);
    return data;
}

/**
 * Unpins the current pinned message in a conversation.
 */
export async function unpinMessage(conversationId: string) {
    const supabase = await createClient();
    const { error } = await supabase
        .from('pinned_messages')
        .delete()
        .eq('conversation_id', conversationId);

    if (error) throw new Error(error.message);
    return { success: true };
}

/**
 * Fetches the current pinned message for a conversation.
 */
export async function getPinnedMessage(conversationId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('pinned_messages')
        .select(`
            message_id,
            messages (
                id,
                content,
                sender_id,
                type,
                profiles ( full_name, username )
            )
        `)
        .eq('conversation_id', conversationId)
        .maybeSingle();

    if (error) return null;
    if (!data) return null;

    const msg = Array.isArray(data.messages) ? data.messages[0] : data.messages as any;
    const profile = Array.isArray(msg?.profiles) ? msg?.profiles[0] : msg?.profiles;
    return {
        messageId: data.message_id,
        text: msg?.content,
        senderName: profile?.full_name || profile?.username || 'User',
    };
}

// ============================================================
// POLLS
// ============================================================

export interface PollOption { text: string; }

/**
 * Creates a poll and sends it as a message in the conversation.
 */
export async function createPoll(
    conversationId: string,
    senderId: string,
    question: string,
    options: PollOption[]
) {
    const supabase = await createClient();

    // First create the message placeholder
    const { data: msgData, error: msgError } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            sender_id: senderId,
            content: `📊 Poll: ${question}`,
            type: 'poll',
            status: 'sent',
        })
        .select()
        .single();

    if (msgError) throw new Error(msgError.message);

    // Create the poll
    const { data: pollData, error: pollError } = await supabase
        .from('polls')
        .insert({
            conversation_id: conversationId,
            created_by: senderId,
            message_id: msgData.id,
            question,
            options: options,
        })
        .select()
        .single();

    if (pollError) throw new Error(pollError.message);

    // Link poll_id back to message
    await supabase.from('messages').update({ poll_id: pollData.id }).eq('id', msgData.id);

    return { message: msgData, poll: pollData };
}

/**
 * Fetches a poll and its vote counts.
 */
export async function getPoll(pollId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('polls')
        .select(`*, poll_votes ( option_index, user_id )`)
        .eq('id', pollId)
        .single();

    if (error) return null;
    return data;
}

/**
 * Records a user's vote on a poll (replaces existing vote).
 */
export async function votePoll(pollId: string, optionIndex: number) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Delete existing vote
    await supabase.from('poll_votes').delete().eq('poll_id', pollId).eq('user_id', user.id);

    // Insert new vote
    const { data, error } = await supabase.from('poll_votes').insert({
        poll_id: pollId,
        user_id: user.id,
        option_index: optionIndex,
    }).select().single();

    if (error) throw new Error(error.message);
    return data;
}

// ============================================================
// SCHEDULED MESSAGES
// ============================================================

/**
 * Creates a scheduled message to send at a future time.
 */
export async function scheduleMessage(
    conversationId: string,
    senderId: string,
    content: string,
    sendAt: string // ISO string
) {
    const supabase = await createClient();
    const { data, error } = await supabase.from('scheduled_messages').insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content,
        type: 'text',
        send_at: sendAt,
    }).select().single();

    if (error) throw new Error(error.message);
    return data;
}

/**
 * Fetches all pending scheduled messages for a conversation
 * that are overdue (past send_at time).
 */
export async function getOverdueScheduledMessages(conversationId: string, userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('scheduled_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('sender_id', userId)
        .eq('is_sent', false)
        .lte('send_at', new Date().toISOString())
        .order('send_at', { ascending: true });

    if (error) return [];
    return data || [];
}

/**
 * Marks a scheduled message as sent.
 */
export async function markScheduledMessageSent(scheduledId: string) {
    const supabase = await createClient();
    await supabase.from('scheduled_messages').update({ is_sent: true }).eq('id', scheduledId);
}

/**
 * Fetches all pending (future) scheduled messages for the current user in a conversation.
 */
export async function getPendingScheduledMessages(conversationId: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
        .from('scheduled_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('sender_id', user.id)
        .eq('is_sent', false)
        .gt('send_at', new Date().toISOString())
        .order('send_at', { ascending: true });

    return data || [];
}

