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

export function UserProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
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

        // Check if logic already ran today (idempotent check)
        const { data: activity } = await supabase
            .from("activity_logs")
            .select("id")
            .eq("user_id", userId)
            .eq("activity_date", todayStr)
            .eq("focus_area", "Daily Login")
            .limit(1)
            .single();

        if (!activity) {
            // First login today!
            await supabase.from("activity_logs").insert({
                user_id: userId,
                activity_date: todayStr,
                hours_spent: 0.1,
                focus_area: "Daily Login"
            });

            // Grant rewards
            await supabase.from("profiles").update({
                xp: (currentProfile.xp || 0) + 10,
                coins: (currentProfile.coins || 0) + 5,
                streak: (currentProfile.streak || 0) + 1
            }).eq("id", userId);

            // Note: The Realtime subscription will handle the UI update for the profile state
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
                    if (fetchedProfile) {
                        await handleDailyLogin(session.user.id, fetchedProfile);
                    }
                }
                setIsLoading(false);
            }

            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                if (mounted) {
                    const newUser = session?.user || null;

                    // If user is same as before, don't trigger a full reload flash
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
                        if (fetchedProfile) {
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

        const cleanupPromise = initAuth();

        return () => {
            mounted = false;
        };
    }, [supabase, fetchProfile, handleDailyLogin]);

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
                    setProfile(payload.new as UserProfile);
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
