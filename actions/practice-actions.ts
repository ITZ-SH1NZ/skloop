"use server";

import { createClient } from "@/utils/supabase/server";

export async function getPracticeStats() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return null;
    }

    // Fetch profile
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, username, avatar_url, role, xp, level, streak')
        .eq('id', user.id)
        .single();

    // Fetch highest WPM
    const { data: typingScores } = await supabase
        .from('typing_scores')
        .select('wpm')
        .eq('user_id', user.id)
        .order('wpm', { ascending: false })
        .limit(1);

    const bestWpm = typingScores && typingScores.length > 0 ? typingScores[0].wpm : 0;

    return {
        profile,
        bestWpm
    };
}
