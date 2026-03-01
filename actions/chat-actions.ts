"use server";

import { createClient } from "@/utils/supabase/server";

export interface MessageRow {
    id: string;
    senderId: string;
    senderName?: string;
    senderAvatar?: string;
    text?: string;
    mediaUrl?: string;
    type: "text" | "image" | "sticker" | "gif";
    timestamp: Date;
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
            type,
            created_at,
            profiles (
                id,
                full_name,
                username,
                avatar_url
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
        return {
            id: m.id,
            senderId: m.sender_id,
            senderName: profile?.full_name || profile?.username || 'User',
            senderAvatar: profile?.avatar_url,
            text: !isUrl ? m.content : undefined,
            type: isGif ? 'gif' : isUrl ? 'image' : 'text',
            mediaUrl: isUrl ? m.content : undefined,
            timestamp: new Date(m.created_at),
        } as MessageRow;
    });
}

/**
 * Sends a new message to a conversation.
 * Uses the authenticated user's identity from the server session.
 */
export async function sendMessage(conversationId: string, senderId: string, content: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            sender_id: senderId,
            content: content,
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
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    // Try the RPC first (fast path)
    const { data: existingId, error: rpcError } = await supabase
        .rpc('get_direct_conversation', {
            user1_id: user.id,
            user2_id: targetUserId,
        });

    if (!rpcError && existingId) {
        return existingId as string;
    }

    // RPC missing or no result — do it manually:
    // Find conversations we're in
    const { data: myConvos } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id);

    if (myConvos && myConvos.length > 0) {
        const myConvoIds = myConvos.map((c: any) => c.conversation_id);

        // Find ones the target is also in
        const { data: sharedConvos } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', targetUserId)
            .in('conversation_id', myConvoIds);

        if (sharedConvos && sharedConvos.length > 0) {
            const sharedIds = sharedConvos.map((c: any) => c.conversation_id);
            // Verify at least one is a 'direct' type
            const { data: directConvo } = await supabase
                .from('conversations')
                .select('id')
                .eq('type', 'direct')
                .in('id', sharedIds)
                .limit(1)
                .single();

            if (directConvo) return directConvo.id;
        }
    }

    // No existing DM — create one.
    const { data: newConvo, error: convoError } = await supabase
        .from('conversations')
        .insert({ type: 'direct' })
        .select()
        .single();

    if (convoError || !newConvo) {
        console.error("Error creating conversation:", convoError);
        return null;
    }

    // CRITICAL: Insert OUR participant row FIRST.
    // Old RLS policy: user_id = auth.uid() OR is_participant(conversation_id)
    // If we insert both at once, targetUserId row fails (neither condition holds yet).
    // By inserting ourselves first, is_participant() becomes true for the second insert.
    const { error: selfError } = await supabase
        .from('conversation_participants')
        .insert({ conversation_id: newConvo.id, user_id: user.id });

    if (selfError) {
        console.error("Error adding self to conversation:", selfError);
        return null;
    }

    // Now insert the target — is_participant() is now true for this conversation
    const { error: targetError } = await supabase
        .from('conversation_participants')
        .insert({ conversation_id: newConvo.id, user_id: targetUserId });

    if (targetError) {
        console.error("Error adding target to conversation:", targetError);
        // We're still in the convo, just without the other person — return it anyway
    }

    return newConvo.id;
}

/**
 * Fetches all conversations the current user is part of, with last-message previews.
 */
export async function getUserConversations() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { dms: [], groups: [] };

    // Get all conversation IDs for this user
    const { data: myConvos, error } = await supabase
        .from('conversation_participants')
        .select(`
            conversation_id,
            conversations (
                id, type, title, tags, description, updated_at
            )
        `)
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false });

    if (error || !myConvos || myConvos.length === 0) {
        return { dms: [], groups: [] };
    }

    const convoIds = myConvos.map((mc: any) => mc.conversation_id);

    // Pull all participants for these convos (to find the 'other' person in DMs)
    const { data: allParticipants } = await supabase
        .from('conversation_participants')
        .select(`
            conversation_id,
            user_id,
            profiles (
                id, username, full_name, avatar_url, role
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
                    name: profile?.full_name || profile?.username || 'User',
                    username: profile?.username || '',
                    avatarUrl: profile?.avatar_url,
                    track: profile?.role || 'Learner',
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
