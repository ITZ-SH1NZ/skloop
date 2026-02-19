"use client";

import { Bell, Check, Clock, MessageSquare, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";

// TODO: Fetch notifications from backend
const INITIAL_NOTIFICATIONS: any[] = [];

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS);
    const router = useRouter();
    const { toast } = useToast();

    const handleMarkAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
        toast("All notifications marked as read.", "success");
    };

    const handleNotificationClick = (id: number, link: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
        router.push(link);
    };

    const unreadCount = notifications.filter(n => n.unread).length;

    return (
        <div className="p-4 md:p-6 xl:p-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-baseline gap-4">
                    <h1 className="text-3xl md:text-4xl font-black">Notifications</h1>
                    {unreadCount > 0 && (
                        <span className="bg-primary text-black font-bold px-2 py-0.5 rounded-full text-sm">{unreadCount} new</span>
                    )}
                </div>
                <Button
                    onClick={handleMarkAllRead}
                    disabled={unreadCount === 0}
                    className="text-xs font-bold text-gray-500 hover:text-black disabled:opacity-50"
                >
                    Mark all as read
                </Button>
            </div>

            <div className="space-y-4">
                {notifications.map((notif) => (
                    <div
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif.id, notif.link)}
                        className={cn(
                            "p-4 rounded-[1.5rem] flex gap-4 items-center transition-all cursor-pointer border relative group",
                            notif.unread
                                ? "bg-white border-primary/20 shadow-md hover:scale-[1.01]"
                                : "bg-gray-50 border-transparent opacity-70 hover:opacity-100"
                        )}
                    >
                        <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${notif.color}`}>
                            <notif.icon size={20} />
                        </div>
                        <div className="flex-1">
                            <p className={cn("text-sm transition-colors", notif.unread ? "font-bold text-black" : "font-medium text-gray-600")}>
                                {notif.title}
                            </p>
                            <span className="text-xs font-bold text-gray-400 mt-1 block">{notif.time}</span>
                        </div>

                        {notif.unread && (
                            <div className="h-3 w-3 rounded-full bg-primary mt-2 shadow-[0_0_10px_rgba(255,255,255,0.5)] animate-pulse" />
                        )}

                        {/* Hover hint */}
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400">
                            <Check size={16} />
                        </div>
                    </div>
                ))}

                {notifications.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                        No notifications to show.
                    </div>
                )}
            </div>
        </div>
    );
}
