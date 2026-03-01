"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

// --- Cycle Key Helpers ---
// Generates Strings like 'daily:2026-03-01', 'weekly:2026-W09', 'monthly:2026-03'

function getDailyCycleKey(date = new Date()) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `daily:${yyyy}-${mm}-${dd}`;
}

function getWeeklyCycleKey(date = new Date()) {
    // Basic ISO week-ish calculation
    const target = new Date(date.valueOf());
    const dayNr = (date.getDay() + 6) % 7;
    target.setDate(target.getDate() - dayNr + 3);
    const firstThursday = target.valueOf();
    target.setMonth(0, 1);
    if (target.getDay() !== 4) {
        target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
    }
    const weekNumber = 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
    return `weekly:${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`;
}

function getMonthlyCycleKey(date = new Date()) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    return `monthly:${yyyy}-${mm}`;
}

function getCycleKey(type: "daily" | "weekly" | "monthly", date = new Date()) {
    if (type === "daily") return getDailyCycleKey(date);
    if (type === "weekly") return getWeeklyCycleKey(date);
    return getMonthlyCycleKey(date);
}

// --- Types ---

export type QuestType = "daily" | "weekly" | "monthly";

export interface Quest {
    id: string;
    key: string;
    title: string;
    description: string;
    type: QuestType;
    xp_reward: number;
    coins_reward: number;
    icon: string;
    sort_order: number;
}

export interface QuestProgress extends Quest {
    is_completed: boolean;
    auto_progress: number;
}

// --- Actions ---

/**
 * Fetch all quests of a specific type (e.g. 'daily') and merge with the current user's completion status for this cycle.
 */
export async function getUserQuestProgress(userId: string, type: QuestType) {
    const supabase = await createClient();
    const cycleKey = getCycleKey(type);

    // 1. Get all quests of this type
    const { data: quests, error: questsError } = await supabase
        .from('quests')
        .select('*')
        .eq('type', type)
        .order('sort_order', { ascending: true });

    if (questsError || !quests) {
        console.error(`Error fetching ${type} quests:`, questsError);
        return [];
    }

    // 2. Get user's completions for this cycle
    const { data: completions, error: compError } = await supabase
        .from('daily_quest_completions')
        .select('quest_id, auto_progress')
        .eq('user_id', userId)
        .eq('cycle_key', cycleKey);

    if (compError) {
        console.error(`Error fetching ${type} completions:`, compError);
    }

    // Map completions into a fast lookup
    const completionsMap = new Map((completions || []).map(c => [c.quest_id, c.auto_progress || 0]));

    // 3. Merge
    const progress: QuestProgress[] = quests.map(q => ({
        ...q,
        is_completed: completionsMap.has(q.key) && completionsMap.get(q.key) === -1, // -1 means fully claimed/completed
        auto_progress: completionsMap.has(q.key) ? Math.max(0, completionsMap.get(q.key)!) : 0
    }));

    // Calculate chest status here too if needed, but usually handled separately
    return progress;
}

/**
 * Marks a quest as complete (or increments progress). If the quest hits the threshold, awards XP/Coins.
 * If 3 total quests of this type are now complete, awards a Chest.
 */
export async function claimQuestProgress(userId: string, questKey: string, type: QuestType, progressAmount = 1, targetAmount = 1) {
    const supabase = await createClient();
    const cycleKey = getCycleKey(type);

    // 1. Check if already fully claimed
    const { data: existing } = await supabase
        .from('daily_quest_completions')
        .select('auto_progress')
        .eq('user_id', userId)
        .eq('quest_id', questKey)
        .eq('cycle_key', cycleKey)
        .maybeSingle();

    if (existing && existing.auto_progress === -1) {
        return { success: false, message: 'Quest already completed' };
    }

    // Calculate new progress
    const newProgress = (existing?.auto_progress || 0) + progressAmount;
    const isNowComplete = newProgress >= targetAmount;
    const finalProgressToSave = isNowComplete ? -1 : newProgress;

    // 2. Get quest details for rewards
    const { data: questDetails } = await supabase
        .from('quests')
        .select('xp_reward, coins_reward, type')
        .eq('key', questKey)
        .single();

    if (!questDetails) return { success: false, message: 'Quest not found' };

    // 3. Save progress
    const { error: upsertError } = await supabase
        .from('daily_quest_completions')
        .upsert({
            user_id: userId,
            quest_id: questKey,
            cycle_key: cycleKey,
            quest_type: questDetails.type,
            auto_progress: finalProgressToSave,
            xp_awarded: isNowComplete ? questDetails.xp_reward : 0,
            coins_awarded: isNowComplete ? questDetails.coins_reward : 0
        }, { onConflict: 'user_id, quest_id, cycle_key' });

    if (upsertError) {
        console.error('Error saving quest progress:', upsertError);
        return { success: false, error: upsertError };
    }

    // 4. If completed, award XP/Coins and check for Chest
    if (isNowComplete) {
        const { error: rpcError } = await supabase.rpc('increment_profile_stats', {
            x_user_id: userId,
            xp_amount: questDetails.xp_reward,
            coins_amount: questDetails.coins_reward
        });

        if (rpcError) {
            console.error('Error awarding quest rewards via RPC:', rpcError);
            // We don't fail the whole action, but log it
        }

        // Check if they hit exactly 3 completions for this cycle type to award a chest
        await checkAndAwardChest(userId, type, cycleKey);
    }

    return { success: true, isComplete: isNowComplete };
}

/**
 * Specifically for topics/lessons, ensures progress is recorded AND rewards are granted.
 */
export async function awardTopicCompletion(userId: string, topicId: string, xpReward: number) {
    const supabase = await createClient();

    // 1. Record progress
    const { error: progressError } = await supabase
        .from("user_topic_progress")
        .upsert({
            user_id: userId,
            topic_id: topicId,
            status: "completed",
            completed_at: new Date().toISOString()
        });

    if (progressError) {
        console.error('Error saving topic progress:', progressError);
        return { success: false, error: progressError };
    }

    // 2. Grant XP
    const { error: rpcError } = await supabase.rpc('increment_profile_stats', {
        x_user_id: userId,
        xp_amount: xpReward,
        coins_amount: 0 // Topics usually only give XP unless specified
    });

    if (rpcError) {
        console.error('Error awarding topic rewards via RPC:', rpcError);
    }

    // 3. Mark the 'lesson' daily quest as progressed if it exists
    // Note: We use the key 'lesson' which is defined in quest_expansion_schema.sql
    await claimQuestProgress(userId, 'lesson', 'daily', 1, 1);

    revalidatePath('/dashboard');
    return { success: true };
}

async function checkAndAwardChest(userId: string, type: QuestType, cycleKey: string) {
    const supabase = await createClient();

    // How many full completions (-1) exist for this cycle and type?
    const { count } = await supabase
        .from('daily_quest_completions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('cycle_key', cycleKey)
        .eq('quest_type', type)
        .eq('auto_progress', -1);

    if (count === 3) {
        const chestType = type === 'daily' ? 'common' : type === 'weekly' ? 'rare' : 'legendary';

        // Try to insert the chest (unique constraint protects against duplicates)
        await supabase.from('user_chests').insert({
            user_id: userId,
            chest_type: chestType,
            cycle_key: cycleKey,
            status: 'sealed'
        });
    }
}

// --- Chest Actions ---

/** Fetch all un-opened chests */
export async function getSealedChests(userId: string) {
    const supabase = await createClient();
    const { data } = await supabase
        .from('user_chests')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'sealed')
        .order('earned_at', { ascending: false });
    return data || [];
}

/** 
 * Admin/Dev function to manually grant a chest to a user.
 */
export async function grantAdminChest(userId: string, chestType: 'common' | 'rare' | 'legendary') {
    const supabase = await createClient();

    // Generate a unique cycle key for admin grants so it doesn't conflict with normal daily/weekly/monthly keys
    const adminCycleKey = `admin_grant:${new Date().getTime()}`;

    const { data, error } = await supabase.from('user_chests').insert({
        user_id: userId,
        chest_type: chestType,
        cycle_key: adminCycleKey,
        status: 'sealed'
    }).select().single();

    if (error) {
        console.error('Error granting admin chest:', error);
        return { success: false, error: error.message };
    }

    // Revalidate paths so UI updates if user is currently online
    revalidatePath('/profile');
    revalidatePath('/');

    return { success: true, chest: data };
}

/** Opens a chest, picks a random cosmetic reward of that rarity, and gives it to the user. */
export async function openChest(userId: string, chestId: string) {
    const supabase = await createClient();

    // 1. Verify chest is sealed
    const { data: chest } = await supabase
        .from('user_chests')
        .select('chest_type, status')
        .eq('id', chestId)
        .eq('user_id', userId)
        .single();

    if (!chest || chest.status !== 'sealed') {
        return { success: false, error: 'Chest not found or already opened' };
    }

    // 2. Draft random reward matching chest rarity
    const { data: possibleRewards } = await supabase
        .from('products')
        .select('id, name, type, image_url')
        .eq('rarity', chest.chest_type);

    if (!possibleRewards || possibleRewards.length === 0) {
        return { success: false, error: 'No rewards pool available for this chest type' };
    }

    // Pick random reward
    const reward = possibleRewards[Math.floor(Math.random() * possibleRewards.length)];

    // 3. Update Chest
    await supabase.from('user_chests').update({
        status: 'opened',
        reward_product_id: reward.id,
        opened_at: new Date().toISOString()
    }).eq('id', chestId);

    // 4. Add to Inventory
    await supabase.from('user_inventory').upsert({
        user_id: userId,
        product_id: reward.id,
        quantity: 1 // Note: in reality we might increment quantity if duplicates allowed
    }, { onConflict: 'user_id, product_id' });

    // 5. Bonus Coins based on rarity
    let bonusCoins = 0;
    if (chest.chest_type === 'common') bonusCoins = 25;
    if (chest.chest_type === 'rare') bonusCoins = 100;
    if (chest.chest_type === 'legendary') bonusCoins = 500;

    if (bonusCoins > 0) {
        await supabase.rpc('increment_profile_stats', {
            x_user_id: userId,
            xp_amount: 0,
            coins_amount: bonusCoins
        });
    }

    revalidatePath('/dashboard');
    revalidatePath('/profile');

    return { success: true, reward, bonusCoins };
}
