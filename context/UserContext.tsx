"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import { User } from "@supabase/supabase-js";
import { processDailyLogin, fetchUserProfile } from "@/actions/user-actions";

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

export function UserProvider({
    children,
    initialUser = null,
    initialProfile = null
}: {
    children: React.ReactNode;
    initialUser?: User | null;
    initialProfile?: UserProfile | null;
}) {
    const [user, setUser] = useState<User | null>(initialUser);
    const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
    const [isLoading, setIsLoading] = useState(!initialUser);
    const processedRef = React.useRef<string | null>(null);
    const supabase = createClient();

    const fetchProfile = useCallback(async (userId: string) => {
        const data = await fetchUserProfile(userId);
        if (data) {
            const newProfile = data as UserProfile;
            setProfile(prev => {
                if (JSON.stringify(prev) === JSON.stringify(newProfile)) return prev;
                return newProfile;
            });
            return newProfile;
        }
        return null;
    }, []);

    // handleDailyLogin is now handled via the processDailyLogin Server Action to ensure idempotency

    useEffect(() => {
        let mounted = true;

        const initAuth = async () => {
            // Re-verify auth state on mount even with SSR to catch stale sessions
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (mounted) {
                if (authUser) {
                    setUser(authUser);
                    const fetchedProfile = await fetchProfile(authUser.id);
                    const todayStr = new Date().toISOString().split("T")[0];
                    const processedKey = `${authUser.id}_${todayStr}`;

                    if (fetchedProfile && processedRef.current !== processedKey) {
                        processedRef.current = processedKey;
                        await processDailyLogin(authUser.id);
                    }
                } else if (!initialUser) {
                    // Only clear if we didn't have an initial SSR user
                    setUser(null);
                    setProfile(null);
                }
                setIsLoading(false);
            }

            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                if (!mounted) return;

                const newUser = session?.user || null;

                // Only skip if it's a neutral non-change event (INITIAL_SESSION with same user)
                if (event === 'INITIAL_SESSION' && newUser) {
                    return; // initAuth already handled the initial load
                }

                if (newUser) {
                    setUser(newUser);
                    const fetchedProfile = await fetchProfile(newUser.id);
                    const todayStr = new Date().toISOString().split("T")[0];
                    const processedKey = `${newUser.id}_${todayStr}`;

                    if (fetchedProfile && processedRef.current !== processedKey) {
                        processedRef.current = processedKey;
                        await processDailyLogin(newUser.id);
                    }
                } else {
                    setUser(null);
                    setProfile(null);
                }
                setIsLoading(false);
            });

            return subscription;
        };

        let subscription: any;
        initAuth().then(sub => { subscription = sub; });

        return () => {
            mounted = false;
            subscription?.unsubscribe();
        };
    }, [supabase, fetchProfile, initialUser]);

    // Optimized visibility change: prevents full app refresh if data is same
    useEffect(() => {
        if (!user) return;

        let lastCheck = Date.now();
        const MIN_CHECK_INTERVAL = 30000; // 30 seconds

        const handleVisibilityChange = async () => {
            if (document.visibilityState === "visible") {
                const now = Date.now();
                // Only re-fetch if it's been a while to avoid aggressive refreshes
                if (now - lastCheck < MIN_CHECK_INTERVAL) return;

                lastCheck = now;
                const { data: { user: authUser } } = await supabase.auth.getUser();
                if (authUser) {
                    fetchProfile(authUser.id);
                } else {
                    setUser(null);
                    setProfile(null);
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);
        return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
    }, [user, fetchProfile, supabase]);

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
                        newProfile.level = calculateLevel(newProfile.xp);

                        setProfile(prev => {
                            if (JSON.stringify(prev) === JSON.stringify(newProfile)) return prev;
                            return newProfile;
                        });
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
