"use client";

import { useEffect, useRef, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/ToastProvider";
import { useUser } from "@/context/UserContext";

export function NotificationListener() {
    const { profile } = useUser();
    const { toast } = useToast();
    const supabase = useMemo(() => createClient(), []);
    // Track IDs we've already toasted so replayed realtime events don't double-fire
    const shownIds = useRef<Set<string>>(new Set());

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
                    const notif = payload.new as any;
                    // Skip notifications for other users (RLS filter may not be enforced)
                    if (notif.user_id !== profile.id) return;
                    // Skip already-read notifications (e.g. marked read before this session)
                    if (notif.is_read) return;
                    // Skip if we already showed this notification (replay on reconnect)
                    if (shownIds.current.has(notif.id)) return;
                    shownIds.current.add(notif.id);
                    toast(notif.title, "success");
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [profile?.id]);

    return null;
}
