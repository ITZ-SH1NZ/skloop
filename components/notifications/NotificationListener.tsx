"use client";

import { useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/ToastProvider";
import { useUser } from "@/context/UserContext";

export function NotificationListener() {
    const { profile } = useUser();
    const { toast } = useToast();
    const supabase = useMemo(() => createClient(), []);

    useEffect(() => {
        if (!profile?.id) return;

        const channel = supabase
            .channel(`global_notifications_${profile.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'notifications',
                    filter: `user_id=eq.${profile.id}`
                },
                (payload) => {
                    const newNotif = payload.new as any;
                    toast(newNotif.title, "success");
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [profile?.id]); // supabase is stable (useMemo), toast is stable

    return null; // This component doesn't render anything visible
}
