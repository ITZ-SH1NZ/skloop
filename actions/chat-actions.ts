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

        // Safety check for the 'type' column which might be added via SQL
        const msgType = m.type || (isGif ? 'gif' : isUrl ? 'image' : 'text');

        return {
            id: m.id,
            senderId: m.sender_id,
            senderName: profile?.full_name || profile?.username || 'User',
            senderAvatar: profile?.avatar_url,
            text: !isUrl ? m.content : undefined,
            type: msgType as any,
            mediaUrl: isUrl ? m.content : undefined,
            timestamp: new Date(m.created_at),
        } as MessageRow;
    });
}

/**
 * Sends a new message to a conversation.
 * Uses the authenticated user's identity from the server session.
 */
export async function sendMessage(conversationId: string, senderId: string, content: string, type: MessageRow['type'] = 'text') {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            sender_id: senderId,
            content: content,
            type: type,
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
        .eq('user_id', user.id)
        .order('joined_at', { ascending: false });

    if (error || !myConvos || myConvos.length === 0) {
        console.log("[Chat Action] getUserConversations: No conversations found", error);
        return { dms: [], groups: [] };
    }
    console.log("[Chat Action] getUserConversations: Found", myConvos.length, "participants/convo links");

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

