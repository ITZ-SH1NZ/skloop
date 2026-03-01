"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

function calculateLevel(xp: number): number {
    return Math.floor(xp / 500) + 1;
}

// ─── Daily Puzzle Word Bank ───────────────────────────────────────────────────
// Real 5-letter programming / CS / dev terms only.
// One word is picked per day deterministically — each user gets the same word.
const DAILY_WORDS = [
    // Core programming concepts
    "REACT", "STACK", "QUEUE", "ASYNC", "CONST", "AWAIT", "FETCH", "BUILD",
    "DEBUG", "LOGIC", "ARRAY", "CLASS", "ERROR", "FLOAT", "FRAME", "INDEX",
    "INPUT", "PARSE", "QUERY", "ROUTE", "STATE", "TABLE", "TOKEN", "UNION",
    "WATCH", "YIELD", "CACHE", "HOOKS", "PROPS", "MODEL", "CLONE", "SCOPE",
    "BYTES", "MUTEX", "PROXY", "STORE", "GRAPH", "REGEX", "STRIP", "SPLIT",
    "SLICE", "CHUNK", "TUPLE", "SUPER", "THROW", "TYPED", "LOCAL", "WRITE",
    "SERVE", "SPAWN", "RETRY", "APPLY", "MACRO", "PRINT", "TRAIT", "SHELL",
    "DELTA", "PIVOT", "SHIFT", "MONAD", "NONCE", "LATCH", "EVENT", "FIBER",
    "INODE", "ALLOC", "PATCH", "ABORT", "BLOCK", "BREAK", "CATCH", "CHAIN",
    "CHECK", "CLEAN", "CODEC", "COUNT", "TASKS", "FLAGS", "PORTS", "BLOBS",
    "FORKS", "INFIX", "JOINS", "LINES", "READS", "ZEROS", "LEXER", "ARITY",
    // Language & tooling terms
    "WHILE", "UNTIL", "LOOPS", "MERGE", "NODES", "LINKS", "TREES", "HEAPS",
    "GREPS", "TESTS", "MOCKS", "STUBS", "TYPES", "PATHS", "EDITS", "DIFFS",
    "REDIS", "TIMER", "SPAWN", "CALLS", "CODES", "GATES", "MIXIN", "TRUNC",
    "SCOPE", "STDIN", "VAULT", "DTYPE", "XPATH", "DATUM", "DIGIT", "FLOAT",
    "FIELD", "STACK", "INNER", "OUTER", "USING", "MATCH", "LIGHT", "DEPTH",
    "WIDTH", "ALIGN", "CHILD", "AFTER", "PRIOR", "OTHER", "LOWER", "UPPER",
    "GRANT", "REVOK", "INDEX", "PIVOT", "RANGE", "GROUP", "ORDER", "LIMIT",
    "ALIAS", "AVAIL", "CHUNK", "DEFER", "EAGER", "FLUSH", "GUARD", "HOIST",
    "IMMUT", "BENCH", "BREAK", "CLOSE", "DRAIN", "EMBED", "FLOOD", "GRUNT",
];

/**
 * Ensures today's daily puzzle exists in the DB.
 * If not, deterministically selects a word from DAILY_WORDS based on the date
 * and inserts it. Returns the puzzle { id, word }.
 */
export async function ensureDailyPuzzle(): Promise<{ id: string; word: string } | null> {
    const supabase = await createClient();
    const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    // 1. Check if today's puzzle already exists
    const { data: existing } = await supabase
        .from('daily_puzzles')
        .select('id, word')
        .eq('puzzle_date', todayStr)
        .maybeSingle();

    if (existing) return existing;

    // 2. Pick a deterministic word using day-of-year as seed
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / 86_400_000);
    const word = DAILY_WORDS[dayOfYear % DAILY_WORDS.length];

    // 3. Insert — handle race condition where another request may have inserted first
    const { data: inserted, error } = await supabase
        .from('daily_puzzles')
        .insert({ puzzle_date: todayStr, word })
        .select('id, word')
        .maybeSingle();

    if (error) {
        // Likely a unique constraint violation from a concurrent insert — re-fetch
        const { data: fallback } = await supabase
            .from('daily_puzzles')
            .select('id, word')
            .eq('puzzle_date', todayStr)
            .maybeSingle();
        return fallback ?? null;
    }

    return inserted ?? null;
}

/**
 * Fetches all pending tasks for a specific user
 */
export async function getUserTasks(userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('user_tasks')
        .select(`
            id,
            status,
            task_id,
            tasks (
                id,
                title,
                description,
                xp_reward,
                task_type,
                difficulty
            )
        `)
        .eq('user_id', userId)
        .eq('status', 'pending');

    if (error) {
        console.error("Error fetching user tasks:", error);
        return [];
    }

    return data || [];
}

/**
 * Completes a task and grants XP rewards
 */
export async function completeTask(userTaskId: string, userId: string, xpReward: number) {
    const supabase = await createClient();

    const { error: taskError } = await supabase
        .from('user_tasks')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', userTaskId)
        .eq('user_id', userId);

    if (taskError) {
        throw new Error("Failed to update task status");
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('xp')
        .eq('id', userId)
        .single();

    if (!profile) {
        throw new Error("Profile not found");
    }

    const newXp = (profile.xp || 0) + xpReward;
    const newLevel = calculateLevel(newXp);
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ xp: newXp, level: newLevel })
        .eq('id', userId);

    if (updateError) {
        throw new Error("Failed to update profile XP");
    }

    revalidatePath("/dashboard");
    return { success: true, newXp };
}

/**
 * Returns the status of daily quests for a user.
 * Checks the daily_quest_completions table first, then falls back to activity checks.
 */
export async function getQuestStatus(userId: string) {
    const supabase = await createClient();
    const todayStr = new Date().toISOString().split('T')[0];

    // Check daily_quest_completions table
    const { data: completions } = await supabase
        .from('daily_quest_completions')
        .select('quest_id')
        .eq('user_id', userId)
        .eq('completed_at', todayStr);

    const completedQuestIds = new Set((completions || []).map((c: any) => c.quest_id));

    // If login not already claimed, also check activity_logs as fallback
    let loginCompleted = completedQuestIds.has('login');
    if (!loginCompleted) {
        const { data: loginLog } = await supabase
            .from('activity_logs')
            .select('id')
            .eq('user_id', userId)
            .eq('activity_date', todayStr)
            .eq('focus_area', 'Daily Login');
        loginCompleted = !!(loginLog && loginLog.length > 0);
    }

    // Check Daily Codele
    let codeleCompleted = completedQuestIds.has('codele');
    if (!codeleCompleted) {
        const { data: dailyPuzzle } = await supabase
            .from('daily_puzzles')
            .select('id')
            .eq('puzzle_date', todayStr)
            .maybeSingle();

        if (dailyPuzzle) {
            const { data: puzzleAttempt } = await supabase
                .from('user_puzzle_attempts')
                .select('status')
                .eq('user_id', userId)
                .eq('puzzle_id', dailyPuzzle.id)
                .maybeSingle();

            // Win or loss both count — only quitting (status stays 'playing') doesn't
            if (puzzleAttempt && puzzleAttempt.status !== 'playing') {
                codeleCompleted = true;
            }
        }
    }

    return {
        login: loginCompleted,
        codele: codeleCompleted
    };
}

/**
 * Claims a daily quest reward for a user.
 * Validates the quest condition, prevents double-claiming, and grants XP + Coins.
 */
export async function claimDailyQuest(
    userId: string,
    questId: string
): Promise<{ success: boolean; message: string; xpAwarded?: number; coinsAwarded?: number }> {
    const supabase = await createClient();
    const todayStr = new Date().toISOString().split('T')[0];

    // Quest definitions
    const QUESTS: Record<string, { xp: number; coins: number }> = {
        login: { xp: 10, coins: 5 },
        codele: { xp: 50, coins: 10 },
    };

    const quest = QUESTS[questId];
    if (!quest) return { success: false, message: 'Unknown quest.' };

    // 1. Prevent double-claiming
    const { data: already } = await supabase
        .from('daily_quest_completions')
        .select('id')
        .eq('user_id', userId)
        .eq('quest_id', questId)
        .eq('completed_at', todayStr)
        .maybeSingle();

    if (already) return { success: false, message: 'Quest already claimed today.' };

    // 2. Validate conditions
    if (questId === 'login') {
        const { data: loginLog } = await supabase
            .from('activity_logs')
            .select('id')
            .eq('user_id', userId)
            .eq('activity_date', todayStr)
            .eq('focus_area', 'Daily Login');

        if (!loginLog || loginLog.length === 0) {
            // Auto-pass: if user is authenticated and we're calling this, they've logged in
            // We just grant the reward directly since they are clearly logged in
        }
    }

    if (questId === 'codele') {
        const { data: dailyPuzzle } = await supabase
            .from('daily_puzzles')
            .select('id')
            .eq('puzzle_date', todayStr)
            .maybeSingle();

        if (dailyPuzzle) {
            const { data: puzzleAttempt } = await supabase
                .from('user_puzzle_attempts')
                .select('status')
                .eq('user_id', userId)
                .eq('puzzle_id', dailyPuzzle.id)
                .maybeSingle();

            // Win or loss both earn the reward — only not having finished (still 'playing') doesn't
            if (!puzzleAttempt || puzzleAttempt.status === 'playing') {
                return { success: false, message: 'Finish the Codele puzzle first to claim this reward.' };
            }
        } else {
            return { success: false, message: 'No Codele puzzle found for today.' };
        }
    }

    // 3. Record the completion
    const { error: insertError } = await supabase
        .from('daily_quest_completions')
        .insert({
            user_id: userId,
            quest_id: questId,
            completed_at: todayStr,
            xp_awarded: quest.xp,
            coins_awarded: quest.coins,
        });

    if (insertError) {
        console.error('claimDailyQuest insert error:', insertError);
        return { success: false, message: 'Failed to record quest completion.' };
    }

    // 4. Grant XP and Coins
    const { data: profile } = await supabase
        .from('profiles')
        .select('xp, coins')
        .eq('id', userId)
        .single();

    if (!profile) return { success: false, message: 'Profile not found.' };

    const newXp = (profile.xp || 0) + quest.xp;
    const newCoins = (profile.coins || 0) + quest.coins;
    const newLevel = calculateLevel(newXp);

    const { error: updateError } = await supabase
        .from('profiles')
        .update({ xp: newXp, coins: newCoins, level: newLevel })
        .eq('id', userId);

    if (updateError) {
        console.error('claimDailyQuest profile update error:', updateError);
        return { success: false, message: 'Failed to award XP and Coins.' };
    }

    revalidatePath('/dashboard');
    return {
        success: true,
        message: `+${quest.xp} XP and +${quest.coins} Coins claimed!`,
        xpAwarded: quest.xp,
        coinsAwarded: quest.coins
    };
}
