"use client";

import { useState, useEffect, useRef } from "react";
import useSWR from "swr";
import { motion, Variants } from "framer-motion";
import { fetchUserProfile } from "@/lib/swr-fetchers";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/ui/ToastProvider";
import { createClient } from "@/utils/supabase/client";
import { Button } from "@/components/ui/Button";
import { User, Camera, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfileSettingsPage() {
    const { user, refreshProfile } = useUser();
    const { toast } = useToast();
    const supabase = createClient();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: profile, isLoading, mutate } = useSWR(
        user?.id ? ["userProfile", user.id] : null,
        fetchUserProfile as any
    );

    const [formData, setFormData] = useState({
        full_name: "",
        username: "",
        bio: "",
        avatar_url: "",
    });
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (profile && user && !initialized) {
            const meta = user.user_metadata || {};
            const data = {
                full_name: profile.full_name || meta.full_name || "",
                username: profile.username || meta.username || "",
                bio: profile.bio || "",
                avatar_url: profile.avatar_url || meta.avatar_url || "",
            };
            setFormData(data);
            setCharCount(data.bio.length);
            setInitialized(true);
        }
    }, [profile, user, initialized]);

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user) return;
        setIsUploading(true);
        try {
            const ext = file.name.split(".").pop();
            const path = `${user.id}/avatar.${ext}`;
            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(path, file, { upsert: true });
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
            setFormData((prev) => ({ ...prev, avatar_url: publicUrl }));
            toast("Avatar updated!", "success");
        } catch (err: any) {
            toast(err.message || "Failed to upload avatar.", "error");
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        try {
            const { error } = await supabase.from("profiles").upsert({
                id: user.id,
                full_name: formData.full_name,
                bio: formData.bio,
                avatar_url: formData.avatar_url,
                updated_at: new Date().toISOString(),
            });
            if (error) throw error;
            mutate({ ...profile, ...formData }, false);
            mutate();
            await refreshProfile(); // Force global context update!
            toast("Profile saved!", "success");
        } catch (err: any) {
            toast(err.message || "Failed to save profile.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading && !initialized) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="animate-spin text-zinc-400" size={28} />
            </div>
        );
    }

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 25 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="mb-8">
                <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Profile</h1>
                <p className="text-zinc-500 font-medium mt-1">How others see you on Skloop.</p>
            </motion.div>

            <div className="space-y-6">
                {/* Avatar */}
                <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm">
                    <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4">Avatar</h2>
                    <div className="flex items-center gap-6">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="relative w-20 h-20 rounded-full bg-zinc-100 border-2 border-zinc-200 cursor-pointer overflow-hidden group shrink-0"
                        >
                            {formData.avatar_url ? (
                                <img src={formData.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <User size={28} className="text-zinc-400" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                {isUploading ? (
                                    <Loader2 size={20} className="text-white animate-spin" />
                                ) : (
                                    <Camera size={20} className="text-white" />
                                )}
                            </div>
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                        <div>
                            <p className="font-bold text-zinc-900 text-sm">Profile picture</p>
                            <p className="text-xs text-zinc-400 mt-0.5">Click to upload. JPG, PNG or WebP. Max 2MB.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Personal info */}
                <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm space-y-5">
                    <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400">Personal Info</h2>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-700">Display Name</label>
                        <input
                            type="text"
                            value={formData.full_name}
                            onChange={(e) => setFormData((p) => ({ ...p, full_name: e.target.value }))}
                            placeholder="Your Name"
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-700">Handle</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-sm">@</span>
                            <input
                                type="text"
                                value={formData.username}
                                disabled
                                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 pl-8 text-sm font-medium outline-none opacity-60 cursor-not-allowed"
                            />
                        </div>
                        <p className="text-xs text-zinc-400">Your handle is unique and cannot be changed.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-zinc-700">Email</label>
                        <input
                            type="email"
                            value={user?.email || ""}
                            disabled
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm font-medium outline-none opacity-60 cursor-not-allowed"
                        />
                        <p className="text-xs text-zinc-400">Change your email in <a href="/settings/account" className="text-primary font-bold hover:underline">Account & Security</a>.</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-bold text-zinc-700">Bio</label>
                            <span className={cn("text-xs font-bold", charCount > 150 ? "text-red-400" : "text-zinc-400")}>
                                {charCount}/160
                            </span>
                        </div>
                        <textarea
                            rows={3}
                            value={formData.bio}
                            onChange={(e) => {
                                if (e.target.value.length <= 160) {
                                    setFormData((p) => ({ ...p, bio: e.target.value }));
                                    setCharCount(e.target.value.length);
                                }
                            }}
                            placeholder="Tell the community about yourself..."
                            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30 resize-none transition-all"
                        />
                    </div>
                </motion.div>

                <motion.div variants={itemVariants} className="flex justify-end">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-primary text-black font-black rounded-xl px-8 h-12 shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5"
                    >
                        {isSaving ? <Loader2 size={16} className="animate-spin" /> : "Save Changes"}
                    </Button>
                </motion.div>
            </div>
        </motion.div>
    );
}
