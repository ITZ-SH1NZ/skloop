"use server";

import { createClient } from "@/utils/supabase/server";

export async function getCodeleStats() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return null;

    const { data: attempts } = await supabase
        .from('user_puzzle_attempts')
        .select('*')
        .eq('user_id', user.id);

    if (!attempts || attempts.length === 0) {
        return {
            winRate: 0,
            currentStreak: 0,
            played: 0,
            wins: 0,
            distribution: [
                { guess: 1, count: 0, percentage: 0 },
                { guess: 2, count: 0, percentage: 0 },
                { guess: 3, count: 0, percentage: 0 },
                { guess: 4, count: 0, percentage: 0 },
                { guess: 5, count: 0, percentage: 0 },
                { guess: 6, count: 0, percentage: 0 }
            ]
        };
    }

    const played = attempts.filter(a => a.status === 'won' || a.status === 'lost');
    const wins = played.filter(a => a.status === 'won');
    const winRate = played.length > 0 ? Math.round((wins.length / played.length) * 100) : 0;

    // Calculate Distribution
    const distCounts = [0, 0, 0, 0, 0, 0];
    wins.forEach(w => {
        if (w.attempts >= 1 && w.attempts <= 6) {
            distCounts[w.attempts - 1]++;
        }
    });

    const distribution = distCounts.map((count, index) => ({
        guess: index + 1,
        count,
        percentage: wins.length > 0 ? Math.round((count / wins.length) * 100) : 0
    }));

    // Dummy streak logic for now since we don't track historical dates cleanly without puzzling join
    const currentStreak = wins.length;

    return {
        winRate,
        currentStreak,
        played: played.length,
        wins: wins.length,
        distribution
    };
}

export async function getCodeleHistory() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return [];

    const { data: attempts } = await supabase
        .from('user_puzzle_attempts')
        .select(`
            status,
            attempts,
            puzzle_id,
            daily_puzzles (
                puzzle_date,
                word
            )
        `)
        .eq('user_id', user.id)
        .order('id', { ascending: false });

    if (!attempts) return [];

    return attempts.map((a: any) => {
        const puzzle = Array.isArray(a.daily_puzzles) ? a.daily_puzzles[0] : a.daily_puzzles;
        return {
            date: puzzle?.puzzle_date,
            word: puzzle?.word,
            status: a.status,
            guesses: a.attempts
        };
    });
}

export async function getCodeleLeaderboard(type: 'global' | 'friends' = 'global') {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    let targetUserIds: string[] | null = null;

    if (type === 'friends' && user) {
        const { data: connections } = await supabase
            .from('connections')
            .select('requester_id, recipient_id')
            .eq('status', 'accepted')
            .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

        const friendIds = new Set(connections?.map(c => c.requester_id === user.id ? c.recipient_id : c.requester_id) || []);
        friendIds.add(user.id);
        targetUserIds = Array.from(friendIds);
    }

    // Since we don't have codele_wins in profile, we will just fetch everyone's attempts who have won at least once.
    // Given prototype constraints, we fetch top players by their total wins.

    // 1. Fetch all winning attempts
    let query = supabase.from('user_puzzle_attempts').select('user_id, status').eq('status', 'won');
    if (targetUserIds) {
        query = query.in('user_id', targetUserIds);
    }

    const { data: wonAttempts } = await query;

    if (!wonAttempts || wonAttempts.length === 0) return [];

    // Group by user_id
    const winCounts: Record<string, number> = {};
    wonAttempts.forEach(a => {
        winCounts[a.user_id] = (winCounts[a.user_id] || 0) + 1;
    });

    // Sort top 50 user ids by wins
    const topUserIds = Object.entries(winCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 50)
        .map(entry => entry[0]);

    if (topUserIds.length === 0) return [];

    // Fetch their profiles
    const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', topUserIds);

    if (!profiles) return [];

    const usersList = profiles.map(p => ({
        id: p.id,
        name: p.full_name || p.username || 'User',
        username: p.username || '',
        avatarUrl: p.avatar_url,
        wins: winCounts[p.id] || 0
    }));

    // Re-sort profiles based on wins
    usersList.sort((a, b) => b.wins - a.wins);

    return usersList.map((u, i) => ({
        ...u,
        rank: i + 1,
        trend: 'same' as const
    }));
}
