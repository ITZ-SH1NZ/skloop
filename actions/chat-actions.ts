"use server";

import { createClient } from "@/utils/supabase/server";

interface Message {
    id: string;
    senderId: string;
    text?: string;
    mediaUrl?: string;
    type: "text" | "image" | "sticker" | "gif";
    timestamp: Date;
}

/**
 * Fetches message history for a specific conversation (peer)
 */
export async function getConversationMessages(conversationId: string): Promise<Message[]> {
    const supabase = await createClient();

    const { data: dbMessages, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Error fetching messages:", error);
        return [];
    }

    return dbMessages.map(m => ({
        id: m.id,
        senderId: m.sender_id,
        text: m.content,
        type: (m.content.startsWith('https://') && m.content.includes('giphy.com') ? 'gif'
            : m.content.startsWith('https://') ? 'image'
                : 'text') as "text" | "image" | "sticker" | "gif",
        mediaUrl: m.content.startsWith('https://') ? m.content : undefined,
        timestamp: new Date(m.created_at)
    }));
}

/**
 * Sends a new message to a conversation
 */
export async function sendMessage(conversationId: string, senderId: string, content: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('messages')
        .insert({
            conversation_id: conversationId,
            sender_id: senderId,
            content: content
        })
        .select()
        .single();

    if (error) {
        console.error("Error sending message:", error);
        throw new Error(error.message);
    }

    return data;
}
