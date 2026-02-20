"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, User, CreditCard, Shield, Moon, Monitor, LogOut } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";

const tabs = [
    { id: "general", label: "General", icon: User },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "billing", label: "Billing", icon: CreditCard },
    { id: "security", label: "Security", icon: Shield },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general");
    const { toast } = useToast();

    return (
        <div className="p-4 md:p-6 xl:p-8 max-w-5xl mx-auto">
            <h1 className="text-3xl md:text-4xl font-black mb-2">Settings</h1>
            <p className="text-gray-500 mb-8 font-medium">Manage your account preferences and workspace settings.</p>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Navigation */}
                <div className="w-full md:w-64 flex flex-col gap-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-200 font-bold text-sm text-left",
                                activeTab === tab.id
                                    ? "bg-black text-white shadow-lg scale-105"
                                    : "text-gray-500 hover:bg-gray-100 hover:text-black"
                            )}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}

                    <div className="h-px bg-gray-100 my-4" />

                    <button className="flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-50 font-bold text-sm transition-colors">
                        <LogOut size={18} />
                        Log Out
                    </button>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100"
                    >
                        {activeTab === "general" && <GeneralSettings toast={toast} />}
                        {activeTab === "notifications" && <NotificationSettings toast={toast} />}
                        {activeTab === "billing" && <BillingSettings toast={toast} />}
                        {activeTab === "security" && <SecuritySettings toast={toast} />}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

function GeneralSettings({ toast }: { toast: any }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-6 mb-8">
                <div className="h-24 w-24 rounded-full bg-gray-100 relative overflow-hidden group cursor-pointer">
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity">
                        Change
                    </div>
                </div>
                <div>
                    <h3 className="font-bold text-lg">Your Profile</h3>
                    <p className="text-gray-500 text-sm">Manage your personal details</p>
                </div>
            </div>

            <div className="grid gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Display Name</label>
                    <input type="text" placeholder="Your Name" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Email Address</label>
                    <input type="email" placeholder="you@example.com" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-primary/20" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Bio</label>
                    <textarea rows={3} placeholder="Tell us about yourself..." className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-medium outline-none focus:ring-2 focus:ring-primary/20 resize-none" />
                </div>
            </div>

            <div className="pt-4 flex justify-end">
                <Button onClick={() => toast("Profile updated!", "success")} className="bg-primary text-black font-bold rounded-xl px-8">
                    Save Changes
                </Button>
            </div>
        </div>
    );
}

function NotificationSettings({ toast }: { toast: any }) {
    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold mb-4">Email Notifications</h3>
            {["New comments", "Project invites", "Weekly digest", "Product updates"].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                    <span className="font-medium text-gray-700">{item}</span>
                    <Toggle />
                </div>
            ))}

            <h3 className="text-xl font-bold mt-8 mb-4">Push Notifications</h3>
            {["Direct messages", "Mentions", "Reminders"].map((item, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                    <span className="font-medium text-gray-700">{item}</span>
                    <Toggle defaultChecked />
                </div>
            ))}
        </div>
    );
}

function BillingSettings({ toast }: { toast: any }) {
    return (
        <div className="space-y-6">
            <div className="bg-primary/10 p-6 rounded-2xl border border-primary/20 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-primary text-lg">Free Plan</h3>
                    <p className="text-sm text-primary/70 font-medium">Upgrade to Pro for more features</p>
                </div>
                <span className="bg-primary text-black text-xs font-bold px-3 py-1 rounded-full">Active</span>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-gray-700">Payment Method</h3>
                <div className="flex items-center gap-4 p-4 border border-gray-100 rounded-2xl">
                    <div className="h-10 w-16 bg-gray-100 rounded-lg flex items-center justify-center font-bold text-xs text-gray-400">VISA</div>
                    <div>
                        <p className="font-bold text-sm">•••• •••• •••• ••••</p>
                        <p className="text-xs text-gray-400">Expires --/--</p>
                    </div>
                    <Button className="ml-auto text-xs font-bold bg-gray-100 text-black hover:bg-gray-200">Edit</Button>
                </div>
            </div>
        </div>
    );
}

function SecuritySettings({ toast }: { toast: any }) {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Current Password</label>
                <input type="password" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-medium outline-none" />
            </div>
            <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">New Password</label>
                <input type="password" className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 font-medium outline-none" />
            </div>
            <div className="pt-4">
                <Button onClick={() => toast("Password updated!", "success")} className="w-full bg-black text-white font-bold rounded-xl">
                    Update Password
                </Button>
            </div>
        </div>
    );
}

function Toggle({ defaultChecked = false }: { defaultChecked?: boolean }) {
    const [checked, setChecked] = useState(defaultChecked);
    return (
        <button
            onClick={() => setChecked(!checked)}
            className={cn(
                "w-12 h-7 rounded-full transition-colors relative",
                checked ? "bg-primary" : "bg-gray-200"
            )}
        >
            <div className={cn(
                "h-5 w-5 bg-white rounded-full shadow-sm absolute top-1 transition-all",
                checked ? "left-6" : "left-1"
            )} />
        </button>
    )
}
