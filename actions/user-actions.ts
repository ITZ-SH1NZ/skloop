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

    // 1. Check for existing activity today (idempotency guard)
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

    // 2. Fetch profile
    const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("xp, coins, streak")
        .eq("id", userId)
        .single();

    if (!profile || profileError) return { success: false, error: "Profile not found" };

    // 3. Check if user logged in YESTERDAY to decide streak continuation vs reset
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    const { data: yesterdayActivity } = await supabase
        .from("activity_logs")
        .select("id")
        .eq("user_id", userId)
        .eq("activity_date", yesterdayStr)
        .eq("focus_area", "Daily Login")
        .maybeSingle();

    // If they logged in yesterday, continue streak. Otherwise reset to 1.
    const newStreak = yesterdayActivity ? (profile.streak || 0) + 1 : 1;
    const newXp = (profile.xp || 0) + 10;
    const newCoins = (profile.coins || 0) + 5;
    const newLevel = calculateLevel(newXp);

    // 4. Insert activity log (serves as the idempotency lock)
    const { error: logError } = await supabase.from("activity_logs").insert({
        user_id: userId,
        activity_date: todayStr,
        hours_spent: 0.1,
        focus_area: "Daily Login"
    });

    if (logError && logError.code !== '23505') {
        console.error("processDailyLogin: Failed to insert activity log:", logError.message, logError.code);
        return { success: false, error: `Failed to log activity: ${logError.message}` };
    }

    // 5. Update profile stats
    const { error: updateError } = await supabase.from("profiles").update({
        xp: newXp,
        coins: newCoins,
        streak: newStreak,
        level: newLevel
    }).eq("id", userId);

    if (updateError) {
        console.error("processDailyLogin: Failed to update profile:", updateError.message);
        return { success: false, error: "Failed to update profile" };
    }

    revalidatePath("/dashboard");
    revalidatePath("/profile");

    return { success: true, grantedRewards: { xp: 10, coins: 5, streak: newStreak } };
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
