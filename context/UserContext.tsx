"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";

interface UserProfile {
    id: string;
    full_name: string | null;
    username: string | null;
    bio: string | null;
    location: string | null;
    website: string | null;
    avatar_url: string | null;
    banner_url: string | null;
    xp: number;
    coins: number;
    level: number;
    streak: number;
    role: string | null;
    company: string | null;
    skills: string[];
    is_mentor: boolean;
    hourly_rate: number;
    joined_at: string | null;
}

interface UserContextType {
    user: User | null;
    profile: UserProfile | null;
    isLoading: boolean;
    refreshProfile: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// 500 XP per level — keep in sync with GamifiedHeader nextLevelXp formula
function calculateLevel(xp: number): number {
    return Math.floor(xp / 500) + 1;
}

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const processedRef = React.useRef<string | null>(null); // Track processed user for today to prevent duplication
    const supabase = createClient();

    const fetchProfile = useCallback(async (userId: string) => {
        const { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single();

        if (!error) {
            const profile = data as UserProfile;
            setProfile(profile);
            return profile;
        }
        return null;
    }, [supabase]);

    const handleDailyLogin = useCallback(async (userId: string, currentProfile: any) => {
        const todayStr = new Date().toISOString().split("T")[0];

        const { data: activity } = await supabase
            .from("activity_logs")
            .select("id")
            .eq("user_id", userId)
            .eq("activity_date", todayStr)
            .eq("focus_area", "Daily Login")
            .limit(1)
            .single();

        if (!activity) {
            await supabase.from("activity_logs").insert({
                user_id: userId,
                activity_date: todayStr,
                hours_spent: 0.1,
                focus_area: "Daily Login"
            });

            const newXp = (currentProfile.xp || 0) + 10;
            const newCoins = (currentProfile.coins || 0) + 5;
            const newStreak = (currentProfile.streak || 0) + 1;
            const newLevel = calculateLevel(newXp);

            await supabase.from("profiles").update({
                xp: newXp,
                coins: newCoins,
                streak: newStreak,
                level: newLevel
            }).eq("id", userId);
        }
    }, [supabase]);

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession();

            if (mounted) {
                if (session?.user) {
                    setUser(session.user);
                    const fetchedProfile = await fetchProfile(session.user.id);
                    const todayStr = new Date().toISOString().split("T")[0];
                    const processedKey = `${session.user.id}_${todayStr}`;

                    if (fetchedProfile && processedRef.current !== processedKey) {
                        processedRef.current = processedKey;
                        await handleDailyLogin(session.user.id, fetchedProfile);
                    }
                }
                setIsLoading(false);
            }

            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                if (mounted) {
                    const newUser = session?.user || null;

                    if (newUser?.id === user?.id && profile) {
                        if (newUser === null && user !== null) {
                            setUser(null);
                            setProfile(null);
                        }
                        return;
                    }

                    if (newUser) {
                        setUser(newUser);
                        const fetchedProfile = await fetchProfile(newUser.id);
                        const todayStr = new Date().toISOString().split("T")[0];
                        const processedKey = `${newUser.id}_${todayStr}`;

                        if (fetchedProfile && processedRef.current !== processedKey) {
                            processedRef.current = processedKey;
                            await handleDailyLogin(newUser.id, fetchedProfile);
                        }
                    } else {
                        setUser(null);
                        setProfile(null);
                    }
                    setIsLoading(false);
                }
            });

            return () => {
                subscription.unsubscribe();
            };
        };

        initAuth();

        return () => {
            mounted = false;
        };
    }, [supabase, fetchProfile, handleDailyLogin]);

    // Re-fetch profile when user returns to the tab (catches missed real-time events)
    useEffect(() => {
        if (!user) return;

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                fetchProfile(user.id);
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [user, fetchProfile]);

    // Supabase Realtime Subscription for Profile updates
    useEffect(() => {
        if (!user) return;

        const channel = supabase
            .channel(`profile_updates_${user.id}`)
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "profiles",
                    filter: `id=eq.${user.id}`
                },
                (payload) => {
                    if (payload.new && Object.keys(payload.new).length > 0) {
                        const newProfile = payload.new as UserProfile;
                        // Always recalculate level from XP to keep them in sync
                        newProfile.level = calculateLevel(newProfile.xp);
                        setProfile(newProfile);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, supabase]);

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    };

    return (
        <UserContext.Provider value={{ user, profile, isLoading, refreshProfile }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}
