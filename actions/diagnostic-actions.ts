"use server";

import { createClient } from "@/utils/supabase/server";

export async function getNotificationDiagnostic() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return { error: "No user found" };

    const { data: count, error: countError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

    const { data: recent, error: recentError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

    const { data: rlsCheck, error: rlsError } = await supabase
        .from('notifications')
        .insert({
            user_id: user.id,
            type: 'system',
            title: 'Diagnostic Notification',
            content: 'This is a test notification to verify the system works.'
        })
        .select();

    return {
        userId: user.id,
        count: count || 0,
        countError,
        recent,
        recentError,
        rlsCheck,
        rlsError
    };
}
