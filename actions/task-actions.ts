"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

function calculateLevel(xp: number): number {
    return Math.floor(xp / 500) + 1;
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

    // 1. Update user_tasks status
    const { error: taskError } = await supabase
        .from('user_tasks')
        .update({ status: 'completed', completed_at: new Date().toISOString() })
        .eq('id', userTaskId)
        .eq('user_id', userId);

    if (taskError) {
        throw new Error("Failed to update task status");
    }

    // 2. Fetch current profile XP
    const { data: profile } = await supabase
        .from('profiles')
        .select('xp')
        .eq('id', userId)
        .single();

    if (!profile) {
        throw new Error("Profile not found");
    }

    // 3. Update profile XP and recalculate level
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
 * Returns the status of daily quests for a user
 */
export async function getQuestStatus(userId: string) {
    const supabase = await createClient();
    const todayStr = new Date().toISOString().split('T')[0];

    // Check Daily Login (handled by activity_logs)
    const { data: loginLog } = await supabase
        .from('activity_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('activity_date', todayStr)
        .eq('focus_area', 'Daily Login');

    // Check Daily Codele (handled by daily_puzzles and attempts)
    let codeleCompleted = false;
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

        if (puzzleAttempt && puzzleAttempt.status !== 'playing') {
            codeleCompleted = true;
        }
    }

    return {
        login: !!loginLog && loginLog.length > 0,
        codele: codeleCompleted
    };
}
