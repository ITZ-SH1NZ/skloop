"use client";

import { useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/ToastProvider";
import { useUser } from "@/context/UserContext";

export function NotificationListener() {
    const { profile } = useUser();
    const { toast } = useToast();
    const supabase = createClient();

    useEffect(() => {
        if (!profile?.id) return;

        console.log(`[NotificationListener] Starting listener for user: ${profile.id}`);

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
                    console.log("[NotificationListener] New notification received:", payload);
                    const newNotif = payload.new as any;
                    
                    // Show a global toast
                    toast(newNotif.title, "success");
                    
                    // Optional: We could trigger a global SWR revalidation or event here
                    // to update unread counts in the header if they aren't using SWR already.
                }
            )
            .subscribe((status) => {
                console.log(`[NotificationListener] Subscription status: ${status}`);
            });

        return () => {
            console.log("[NotificationListener] Cleaning up listener");
            supabase.removeChannel(channel);
        };
    }, [profile?.id, supabase, toast]);

    return null; // This component doesn't render anything visible
}
