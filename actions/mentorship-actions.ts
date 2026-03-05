"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

/** Generate a random uppercase alphanumeric code of given length */
function randomCode(length = 12): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no confusing chars
    let result = "";
    const arr = new Uint8Array(length);
    crypto.getRandomValues(arr);
    for (const byte of arr) result += chars[byte % chars.length];
    return result;
}

/** Calculates user level based on XP (500 XP per level) - Keep in sync with UserContext */
function calculateLevel(xp: number): number {
    return Math.floor(xp / 500) + 1;
}

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────

export interface MentorCard {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    headline?: string;
    bio?: string;
    skills: string[];
    specialties: string[];
    isAccepting: boolean;
    avgRating: number | null;
    reviewCount: number;
}

export interface MentorSession {
    id: string;
    mentorId: string;
    mentorName: string;
    mentorAvatar?: string;
    menteeId?: string;
    title: string;
    topic?: string;
    description?: string;
    message?: string;
    status: "pending" | "accepted" | "declined" | "published" | "completed";
    videoUrl?: string;
    thumbnailUrl?: string;
    premiereAt?: string;
    isPublic: boolean;
    createdAt: string;
}

export interface VouchCode {
    id: string;
    code: string;
    issuedBy: string;
    usedBy?: string;
    usedAt?: string;
    expiresAt?: string;
    createdAt: string;
}

// ─────────────────────────────────────────────
// PUBLIC: Find Mentor Directory
// ─────────────────────────────────────────────

export async function getMentors(): Promise<MentorCard[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("profiles")
        .select(`
            id, full_name, username, avatar_url, skills, bio,
            mentor_profiles!mentor_profiles_id_fkey (
                headline, bio, specialties, is_accepting
            )
        `)
        .eq("is_mentor", true);

    if (error || !data) return [];

    // Get avg ratings per mentor
    const mentorIds = data.map((m: any) => m.id);
    const { data: reviews } = await supabase
        .from("session_reviews")
        .select(`
            rating,
            mentor_sessions!inner (mentor_id)
        `)
        .in("mentor_sessions.mentor_id", mentorIds);

    // Build rating map
    const ratingMap: Record<string, { sum: number; count: number }> = {};
    for (const r of (reviews ?? []) as any[]) {
        const mid = r.mentor_sessions?.mentor_id;
        if (!mid) continue;
        if (!ratingMap[mid]) ratingMap[mid] = { sum: 0, count: 0 };
        ratingMap[mid].sum += r.rating;
        ratingMap[mid].count += 1;
    }

    return data.map((p: any) => {
        const mp = Array.isArray(p.mentor_profiles) ? p.mentor_profiles[0] : p.mentor_profiles;
        const r = ratingMap[p.id];
        return {
            id: p.id,
            name: p.full_name || p.username || "Mentor",
            username: p.username || "",
            avatarUrl: p.avatar_url,
            headline: mp?.headline,
            bio: mp?.bio || p.bio,
            skills: p.skills || [],
            specialties: mp?.specialties || [],
            isAccepting: mp?.is_accepting ?? true,
            avgRating: r ? Math.round((r.sum / r.count) * 10) / 10 : null,
            reviewCount: r?.count ?? 0,
        };
    });
}

// ─────────────────────────────────────────────
// PUBLIC: Mentor Video Library (public posts)
// ─────────────────────────────────────────────

export async function getPublicSessions(mentorId?: string): Promise<MentorSession[]> {
    const supabase = await createClient();

    let query = supabase
        .from("mentor_sessions")
        .select(`
            *,
            mentor:profiles!mentor_sessions_mentor_id_fkey (full_name, username, avatar_url)
        `)
        .eq("is_public", true)
        .eq("status", "published")
        .order("created_at", { ascending: false });

    if (mentorId) query = query.eq("mentor_id", mentorId);

    const { data } = await query;
    return (data ?? []).map(formatSession);
}

// ─────────────────────────────────────────────
// MY SESSIONS: as mentee
// ─────────────────────────────────────────────

export async function getMySessionsAsMentee(): Promise<MentorSession[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
        .from("mentor_sessions")
        .select(`
            *,
            mentor:profiles!mentor_sessions_mentor_id_fkey (full_name, username, avatar_url)
        `)
        .eq("mentee_id", user.id)
        .order("created_at", { ascending: false });

    return (data ?? []).map(formatSession);
}

// ─────────────────────────────────────────────
// MENTOR DASHBOARD
// ─────────────────────────────────────────────

export async function getMySessionsAsMentor(): Promise<{
    pending: MentorSession[];
    upcoming: MentorSession[];
    history: MentorSession[];
    published: MentorSession[];
    stats: {
        sessions: number;
        avgRating: number | null;
        reviewCount: number;
        ratingDistribution: { [key: number]: number };
        recentReviews: any[];
    };
}> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { pending: [], upcoming: [], history: [], published: [], stats: { sessions: 0, avgRating: null, reviewCount: 0, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, recentReviews: [] } };

    const { data } = await supabase
        .from("mentor_sessions")
        .select(`
            *,
            mentor:profiles!mentor_sessions_mentor_id_fkey (full_name, username, avatar_url)
        `)
        .eq("mentor_id", user.id)
        .order("created_at", { ascending: false });

    const sessions = (data ?? []).map(formatSession);
    const pending = sessions.filter(s => s.status === "pending");
    const upcoming = sessions.filter(s => s.status === "accepted");
    const history = sessions.filter(s => s.status === "completed" || s.status === "declined");
    const published = sessions.filter(s => s.status === "published" && s.videoUrl);

    // Reviews for this mentor
    const sessionIds = sessions.map(s => s.id);
    const { data: reviews } = await supabase
        .from("session_reviews")
        .select(`
            rating,
            comment,
            created_at,
            reviewer:profiles(full_name, username, avatar_url)
        `)
        .in("session_id", sessionIds)
        .order("created_at", { ascending: false });

    const avgRating = reviews && reviews.length > 0
        ? Math.round(((reviews as any[]).reduce((a, r) => a + r.rating, 0) / reviews.length) * 10) / 10
        : null;

    const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (reviews) {
        reviews.forEach(r => {
            if (r.rating >= 1 && r.rating <= 5) {
                ratingDistribution[r.rating as keyof typeof ratingDistribution]++;
            }
        });
    }

    const recentReviews = (reviews || []).slice(0, 5).map(r => {
        const rev = Array.isArray(r.reviewer) ? r.reviewer[0] : r.reviewer;
        return {
            rating: r.rating,
            comment: r.comment,
            createdAt: r.created_at,
            reviewerName: rev?.full_name || rev?.username || "Anonymous",
            reviewerAvatar: rev?.avatar_url
        };
    });

    return {
        pending,
        upcoming,
        history,
        published,
        stats: {
            sessions: published.length + history.length,
            avgRating,
            reviewCount: reviews?.length ?? 0,
            ratingDistribution,
            recentReviews
        },
    };
}

export async function markSessionCompleted(sessionId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not logged in" };

    const { error } = await supabase
        .from("mentor_sessions")
        .update({ status: "completed", updated_at: new Date().toISOString() })
        .eq("id", sessionId)
        .eq("mentor_id", user.id);

    if (error) return { success: false, error: error.message };
    revalidatePath("/mentorship/dashboard");
    return { success: true };
}

export async function handleSessionRequest(sessionId: string, action: "accept" | "decline") {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const newStatus = action === "accept" ? "accepted" : "declined";
    const { error } = await supabase
        .from("mentor_sessions")
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq("id", sessionId)
        .eq("mentor_id", user.id);

    if (error) throw new Error(error.message);
}

export async function publishMentorVideo(input: {
    title: string;
    topic?: string;
    description?: string;
    videoUrl: string;
    thumbnailUrl?: string;
    premiereAt?: string;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { data: profile } = await supabase
        .from("profiles")
        .select("is_mentor")
        .eq("id", user.id)
        .single();

    if (!profile?.is_mentor) throw new Error("Only mentors can publish sessions");

    const { error } = await supabase.from("mentor_sessions").insert({
        mentor_id: user.id,
        title: input.title,
        topic: input.topic,
        description: input.description,
        video_url: input.videoUrl,
        thumbnail_url: input.thumbnailUrl,
        premiere_at: input.premiereAt || null,
        status: "published",
        is_public: true,
    });

    if (error) throw new Error(error.message);
}

export async function deleteMentorVideo(sessionId: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not logged in" };

    const { error } = await supabase
        .from("mentor_sessions")
        .delete()
        .eq("id", sessionId)
        .eq("mentor_id", user.id);

    if (error) return { success: false, error: error.message };

    revalidatePath("/mentorship/dashboard");
    revalidatePath("/mentorship/find");
    return { success: true };
}

// ─────────────────────────────────────────────
// VOUCH CODES
// ─────────────────────────────────────────────

export async function generateVouchCode(): Promise<string> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    // Verify user is a mentor
    const { data: profile } = await supabase
        .from("profiles")
        .select("is_mentor")
        .eq("id", user.id)
        .single();
    if (!profile?.is_mentor) throw new Error("Only mentors can generate vouch codes");

    // Rate limit: max 2 codes per 24h
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count } = await supabase
        .from("mentor_vouch_codes")
        .select("id", { count: "exact", head: true })
        .eq("issued_by", user.id)
        .is("used_by", null) // only count unused ones OR count all generated today
        .gte("created_at", since);

    // Count ALL codes generated (used or not) in last 24h
    const { count: todayCount } = await supabase
        .from("mentor_vouch_codes")
        .select("id", { count: "exact", head: true })
        .eq("issued_by", user.id)
        .gte("created_at", since);

    if ((todayCount ?? 0) >= 2) {
        throw new Error("Rate limit: you can generate at most 2 vouch codes per day");
    }

    const code = randomCode(12);

    const { error } = await supabase.from("mentor_vouch_codes").insert({
        code,
        issued_by: user.id,
    });

    if (error) throw new Error(error.message);
    return code;
}

export async function redeemVouchCode(code: string): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not logged in" };

    // Find the code
    const { data: vouchCode } = await supabase
        .from("mentor_vouch_codes")
        .select("id, used_by, expires_at")
        .eq("code", code.toUpperCase().trim())
        .single();

    if (!vouchCode) return { success: false, error: "Invalid code" };
    if (vouchCode.used_by) return { success: false, error: "This code has already been used" };
    if (vouchCode.expires_at && new Date(vouchCode.expires_at) < new Date()) {
        return { success: false, error: "This code has expired" };
    }

    // Mark code as used
    const { error: useError } = await supabase
        .from("mentor_vouch_codes")
        .update({ used_by: user.id, used_at: new Date().toISOString() })
        .eq("id", vouchCode.id);
    if (useError) return { success: false, error: useError.message };

    // Grant mentor status
    const { error: profileError } = await supabase
        .from("profiles")
        .update({ is_mentor: true })
        .eq("id", user.id);

    if (profileError) return { success: false, error: profileError.message };

    // Create mentor_profile entry
    const { data: existingMp } = await supabase
        .from("mentor_profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

    if (!existingMp) {
        const { error: mpError } = await supabase.from("mentor_profiles").insert({
            id: user.id,
            path: "vouch",
        });
        if (mpError) return { success: false, error: mpError.message };
    }

    revalidatePath("/mentorship/dashboard");
    revalidatePath("/mentorship/apply");
    revalidatePath("/mentorship/find");

    return { success: true };
}

/** DEBUG ONLY: Force current user to be a mentor */
export async function debugForceMentorStatus(): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not logged in" };

    console.log("DEBUG FORCE MENTOR: Updating profile for", user.id);
    const { error } = await supabase.from("profiles").update({ is_mentor: true }).eq("id", user.id);

    if (error) return { success: false, error: error.message };

    // Create mentor profile if missing
    const { data: mp } = await supabase.from("mentor_profiles").select("id").eq("id", user.id).maybeSingle();
    if (!mp) {
        await supabase.from("mentor_profiles").insert({ id: user.id, path: "vouch" });
    }

    revalidatePath("/mentorship/dashboard");
    return { success: true };
}

// ─────────────────────────────────────────────
// APPLY: Veteran Path
// ─────────────────────────────────────────────

export async function applyVeteranPath(): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: "Not logged in" };

    const { data: profile } = await supabase
        .from("profiles")
        .select("level, xp, is_mentor")
        .eq("id", user.id)
        .single();

    if (!profile) return { success: false, error: "Profile not found" };
    if (profile.is_mentor) return { success: false, error: "You are already a mentor" };

    // Prioritize DB level, fallback to XP calculation
    const level = profile.level ?? calculateLevel(profile.xp || 0);

    if (level < 10) {
        return { success: false, error: `You need to be level 10 to apply. You are level ${level}.` };
    }

    const { error: profileUpdateError } = await supabase.from("profiles").update({ is_mentor: true }).eq("id", user.id);
    if (profileUpdateError) return { success: false, error: profileUpdateError.message };

    const { data: existingMp } = await supabase
        .from("mentor_profiles")
        .select("id")
        .eq("id", user.id)
        .single();

    if (!existingMp) {
        const { error: mpError } = await supabase.from("mentor_profiles").insert({
            id: user.id,
            path: "veteran",
        });
        if (mpError) return { success: false, error: mpError.message };
    }

    revalidatePath("/mentorship/dashboard");
    revalidatePath("/mentorship/apply");
    revalidatePath("/mentorship/find");

    return { success: true };
}

export async function getMyMentorStatus(userId?: string): Promise<{
    isMentor: boolean;
    level: number;
    xp: number;
    profile?: { headline?: string; bio?: string; isAccepting: boolean; specialties: string[]; hourlyRate: number };
}> {
    const supabase = await createClient();

    // If no userId provided, try to get it server-side (may fail if auth is blocked)
    let resolvedUserId = userId;
    if (!resolvedUserId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { isMentor: false, level: 0, xp: 0 };
        resolvedUserId = user.id;
    }

    const { data, error } = await supabase
        .from("profiles")
        .select(`id, level, xp, is_mentor, mentor_profiles!mentor_profiles_id_fkey(headline, bio, is_accepting, specialties)`)
        .eq("id", resolvedUserId)
        .maybeSingle();

    // ── SERVER-SIDE DIAGNOSTICS (visible in Next.js terminal) ─────────────
    console.log("=== getMyMentorStatus DIAG ===");
    console.log("Queried user ID:", resolvedUserId);
    console.log("DB error:", error?.message ?? "none");
    console.log("DB data (raw):", JSON.stringify(data, null, 2));
    // ──────────────────────────────────────────────────────────────────────

    const mp = data?.mentor_profiles as any;
    const mpData = Array.isArray(mp) ? mp[0] : mp;

    return {
        isMentor: data?.is_mentor ?? false,
        level: data?.level ?? calculateLevel(data?.xp || 0),
        xp: data?.xp || 0,
        profile: mpData ? {
            headline: mpData.headline,
            bio: mpData.bio,
            isAccepting: mpData.is_accepting ?? true,
            specialties: mpData.specialties ?? [],
            hourlyRate: mpData.hourly_rate ?? 0,
        } : undefined,
    };
}

export async function submitReview(sessionId: string, rating: number, comment?: string) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Unauthorized");

    const { error } = await supabase.from("session_reviews").insert({
        session_id: sessionId,
        reviewer_id: user.id,
        rating,
        comment: comment || null,
    });

    if (error) throw new Error(error.message);
}

export async function getMyVouchCodes(): Promise<VouchCode[]> {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data } = await supabase
        .from("mentor_vouch_codes")
        .select("*")
        .eq("issued_by", user.id)
        .order("created_at", { ascending: false })
        .limit(20);

    return (data ?? []).map((c: any) => ({
        id: c.id,
        code: c.code,
        issuedBy: c.issued_by,
        usedBy: c.used_by,
        usedAt: c.used_at,
        expiresAt: c.expires_at,
        createdAt: c.created_at,
    }));
}

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────

function formatSession(s: any): MentorSession {
    const mentor = Array.isArray(s.mentor) ? s.mentor[0] : s.mentor;
    return {
        id: s.id,
        mentorId: s.mentor_id,
        mentorName: mentor?.full_name || mentor?.username || "Mentor",
        mentorAvatar: mentor?.avatar_url,
        menteeId: s.mentee_id,
        title: s.title,
        topic: s.topic,
        description: s.description,
        message: s.message,
        status: s.status,
        videoUrl: s.video_url,
        thumbnailUrl: s.thumbnail_url,
        premiereAt: s.premiere_at,
        isPublic: s.is_public,
        createdAt: s.created_at,
    };
}
