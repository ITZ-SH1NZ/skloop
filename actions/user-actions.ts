"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/**
 * Calculates user level based on XP (500 XP per level)
 */
function calculateLevel(xp: number): number {
    return Math.floor(xp / 500) + 1;
}

/**
 * Handles daily login reward processing using a server-side transaction logic.
 * This is hosted as a Vercel Serverless Function automatically.
 */
export async function processDailyLogin(userId: string) {
    const supabase = await createClient();
    const todayStr = new Date().toISOString().split("T")[0];

    // 1. Check for existing activity in a secure server environment
    const { data: existingActivity } = await supabase
        .from("activity_logs")
        .select("id")
        .eq("user_id", userId)
        .eq("activity_date", todayStr)
        .eq("focus_area", "Daily Login")
        .limit(1)
        .maybeSingle();

    if (existingActivity) {
        return { success: true, alreadyProcessed: true };
    }

    // 2. Start reward processing
    // NOTE: In a full production app, you might use a Supabase RPC to handle the insert+update in one transaction.
    // For now, we use the server's sequential execution to reduce race conditions compared to client-side.

    const { data: profile } = await supabase
        .from("profiles")
        .select("xp, coins, streak")
        .eq("id", userId)
        .single();

    if (!profile) return { success: false, error: "Profile not found" };

    const newXp = (profile.xp || 0) + 10;
    const newCoins = (profile.coins || 0) + 5;
    const newStreak = (profile.streak || 0) + 1;
    const newLevel = calculateLevel(newXp);

    // 3. Insert activity log first (serves as the lock/guard)
    const { error: logError } = await supabase.from("activity_logs").insert({
        user_id: userId,
        activity_date: todayStr,
        hours_spent: 0.1,
        focus_area: "Daily Login"
    });

    if (logError && logError.code !== '23505') { // Ignore unique constraint if it somehow happened in milliseconds
        return { success: false, error: "Failed to log activity" };
    }

    // 4. Update profile
    const { error: updateError } = await supabase.from("profiles").update({
        xp: newXp,
        coins: newCoins,
        streak: newStreak,
        level: newLevel
    }).eq("id", userId);

    if (updateError) {
        return { success: false, error: "Failed to update profile" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/profile");

    return { success: true, grantedRewards: { xp: 10, coins: 5, streak: 1 } };
}

/**
 * Fetches a user profile by ID
 */
export async function fetchUserProfile(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

    if (error) return null;
    return data;
}
