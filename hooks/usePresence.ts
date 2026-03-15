"use client";

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';

/**
 * Hook to track global presence of users.
 * Uses Supabase Presence to find out who is currently online.
 */
export function usePresence(currentUserId?: string | null) {
    const supabase = useMemo(() => createClient(), []);
    const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (!currentUserId) return;

        const channel = supabase.channel('presence:global', {
            config: { presence: { key: currentUserId } }
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const ids = new Set<string>();
                Object.keys(state).forEach(key => ids.add(key));
                setOnlineUserIds(ids);
            })
            .on('presence', { event: 'join' }, ({ key, newPresences }) => {
                setOnlineUserIds(prev => {
                    const next = new Set(prev);
                    next.add(key);
                    return next;
                });
            })
            .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
                setOnlineUserIds(prev => {
                    const next = new Set(prev);
                    next.delete(key);
                    return next;
                });
            })
            .subscribe(async (status) => {
                if (status === 'SUBSCRIBED') {
                    await channel.track({ online_at: new Date().toISOString() });
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [currentUserId, supabase]);

    return onlineUserIds;
}
