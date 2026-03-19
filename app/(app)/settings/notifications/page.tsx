"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";
import {
    Flame, Gift, Trophy, BookOpen, MessageSquare, Video, Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NotifPrefs {
    streak_reminders: boolean;
    quest_completions: boolean;
    chest_ready: boolean;
    lesson_unlocked: boolean;
    new_message: boolean;
    mentor_updates: boolean;
}

const DEFAULT_PREFS: NotifPrefs = {
    streak_reminders: true,
    quest_completions: true,
    chest_ready: true,
    lesson_unlocked: false,
    new_message: true,
    mentor_updates: true,
};

const NOTIF_ITEMS = [
    {
        key: "streak_reminders" as keyof NotifPrefs,
        icon: Flame,
        iconBg: "bg-orange-50",
        iconColor: "text-orange-500",
        label: "Streak Reminders",
        description: "Get notified when your streak is at risk of breaking",
    },
    {
        key: "quest_completions" as keyof NotifPrefs,
        icon: Trophy,
        iconBg: "bg-amber-50",
        iconColor: "text-amber-500",
        label: "Quest Completions",
        description: "Alerts when daily, weekly, and monthly quests are ready to claim",
    },
    {
        key: "chest_ready" as keyof NotifPrefs,
        icon: Gift,
        iconBg: "bg-purple-50",
        iconColor: "text-purple-500",
        label: "Chest Ready to Open",
        description: "Notify when you have a loot chest waiting in your loadout",
    },
    {
        key: "lesson_unlocked" as keyof NotifPrefs,
        icon: BookOpen,
        iconBg: "bg-blue-50",
        iconColor: "text-blue-500",
        label: "Lesson Unlocked",
        description: "When new course content becomes available on your track",
    },
    {
        key: "new_message" as keyof NotifPrefs,
        icon: MessageSquare,
        iconBg: "bg-green-50",
        iconColor: "text-green-500",
        label: "New Message",
        description: "Direct messages and peer chat notifications",
    },
    {
        key: "mentor_updates" as keyof NotifPrefs,
        icon: Video,
        iconBg: "bg-indigo-50",
        iconColor: "text-indigo-500",
        label: "Mentor Session Updates",
        description: "Reminders and status changes for your mentorship sessions",
    },
];

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
    return (
        <button
            onClick={() => onChange(!checked)}
            className={cn(
                "w-12 h-7 rounded-full transition-colors relative shrink-0",
                checked ? "bg-primary" : "bg-zinc-200"
            )}
        >
            <div className={cn(
                "h-5 w-5 bg-white rounded-full shadow-sm absolute top-1 transition-all duration-200",
                checked ? "left-6" : "left-1"
            )} />
        </button>
    );
}

export default function NotificationsSettingsPage() {
    const { user } = useUser();
    const { toast } = useToast();
    const supabase = createClient();
    const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
    const [isSaving, setIsSaving] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (!user) return;
        supabase
            .from("profiles")
            .select("notification_preferences")
            .eq("id", user.id)
            .single()
            .then(({ data }) => {
                if (data?.notification_preferences && Object.keys(data.notification_preferences).length > 0) {
                    setPrefs({ ...DEFAULT_PREFS, ...data.notification_preferences });
                }
                setLoaded(true);
            });
    }, [user]);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from("profiles")
                .update({ notification_preferences: prefs })
                .eq("id", user.id);
            if (error) throw error;
            toast("Notification preferences saved!", "success");
        } catch (err: any) {
            toast(err.message || "Failed to save.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Notifications</h1>
                <p className="text-zinc-500 font-medium mt-1">Control which events send you in-app alerts.</p>
            </div>

            <div className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm space-y-1 mb-6">
                <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4">In-App Notifications</h2>
                {NOTIF_ITEMS.map((item, i) => {
                    const Icon = item.icon;
                    return (
                        <div key={item.key}>
                            <div className="flex items-center gap-4 py-3.5">
                                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", item.iconBg)}>
                                    <Icon size={16} className={item.iconColor} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-zinc-900">{item.label}</p>
                                    <p className="text-xs text-zinc-400 mt-0.5">{item.description}</p>
                                </div>
                                <Toggle
                                    checked={prefs[item.key]}
                                    onChange={(v) => setPrefs((p) => ({ ...p, [item.key]: v }))}
                                />
                            </div>
                            {i < NOTIF_ITEMS.length - 1 && <div className="h-px bg-zinc-50 ml-13" />}
                        </div>
                    );
                })}
            </div>

            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={isSaving || !loaded}
                    className="bg-primary text-black font-black rounded-xl px-8 h-12 shadow-lg shadow-primary/20"
                >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Save Preferences"}
                </Button>
            </div>
        </div>
    );
}
