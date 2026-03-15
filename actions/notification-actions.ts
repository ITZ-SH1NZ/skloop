"use server";

import { createClient } from "@/utils/supabase/server";

export interface NotificationPayload {
    user_id: string;
    actor_id?: string;
    type: 'message' | 'achievement' | 'system';
    title: string;
    content?: string;
    metadata?: any;
}

/**
 * Creates a new notification for a specific user.
 */
export async function createNotification(payload: NotificationPayload) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('notifications')
        .insert({
            user_id: payload.user_id,
            actor_id: payload.actor_id,
            type: payload.type,
            title: payload.title,
            content: payload.content,
            metadata: payload.metadata || {},
            is_read: false
        })
        .select()
        .single();

    if (error) {
        console.error("Error creating notification:", error);
        return null;
    }

    return data;
}

/**
 * Marks notifications as read. 
 * Can be filtered by type and metadata (e.g. conversation_id).
 */
export async function markNotificationsAsRead(userId: string, filter?: { type?: string; conversationId?: string }) {
    const supabase = await createClient();

    let query = supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', userId)
        .eq('is_read', false);

    if (filter?.type) {
        query = query.eq('type', filter.type);
    }

    if (filter?.conversationId) {
        // Use the containment operator for JSONB to check metadata
        query = query.contains('metadata', { conversation_id: filter.conversationId });
    }

    const { error } = await query;

    if (error) {
        console.error("Error marking notifications as read:", error);
        return { success: false, error };
    }

    return { success: true };
}
