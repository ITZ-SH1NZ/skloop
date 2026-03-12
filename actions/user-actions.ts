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
        .select("xp, coins, streak, streak_shields")
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

    // Streak Logic:
    let newStreak = 1;
    let shieldsUsed = 0;

    if (yesterdayActivity) {
        // Logged in yesterday? Simple increment.
        newStreak = (profile.streak || 0) + 1;
    } else if (profile.streak_shields > 0 && (profile.streak || 0) > 0) {
        // Missed yesterday but has a SHIELD? Maintain streak and use shield.
        newStreak = profile.streak;
        shieldsUsed = 1;
    } else {
        // Missed yesterday and no shields? Reset.
        newStreak = 1;
    }

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
        level: newLevel,
        streak_shields: profile.streak_shields - shieldsUsed
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
 * Activates a consumable boost (e.g., XP Booster) from the user's inventory.
 */
export async function activateBoostItem(userId: string, itemId: string) {
    const supabase = await createClient();

    // 1. Fetch profile to check inventory
    const { data: profile, error } = await supabase
        .from("profiles")
        .select("inventory, active_powers")
        .eq("id", userId)
        .single();

    if (error || !profile) return { success: false, error: "Profile not found" };

    const inventory = profile.inventory || [];
    if (!inventory.includes(itemId)) return { success: false, error: "Item not in inventory" };

    // 2. Determine boost effects based on itemId
    const now = new Date();
    const expires = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // Default 1 hour

    let powers = { ...(profile.active_powers || {}) };

    if (itemId === 'item_xp_booster') {
        powers.xp_multiplier = 2;
        powers.xp_expires = expires;
    } else if (itemId === 'item_coin_magnet') {
        powers.coins_multiplier = 2;
        powers.coins_expires = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
    } else {
        return { success: false, error: "Unknown boost item" };
    }

    // 3. Remove from inventory and update active_powers
    const newInventory = inventory.filter((id: string) => id !== itemId);
    const { error: updateError } = await supabase
        .from("profiles")
        .update({
            inventory: newInventory,
            active_powers: powers
        })
        .eq("id", userId);

    if (updateError) return { success: false, error: updateError.message };

    revalidatePath("/profile");
    revalidatePath("/shop");
    return { success: true, message: "Boost activated!", expires };
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
