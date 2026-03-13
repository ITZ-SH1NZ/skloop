"use client";

import { useState, useRef, ChangeEvent, useEffect } from "react";
import { motion } from "framer-motion";
import { Edit2, MapPin, Link as LinkIcon, Calendar, Camera, Shield } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { CurrencyCoin } from "@/components/ui/CurrencyCoin";
import { LevelRing } from "@/components/profile/gamification/LevelRing";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { ImageCropper } from "@/components/ui/ImageCropper";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/ToastProvider";

import { useUser } from "@/context/UserContext";
import { uploadProfileImage } from "@/utils/supabase/storage";
import * as LucideIcons from "lucide-react";

const getIcon = (name: string | null) => {
    if (!name) return LucideIcons.HelpCircle;
    return (LucideIcons as any)[name] || LucideIcons.HelpCircle;
};

// Theme Configuration (Fixed)
const THEME = { name: "Gold", bg: "bg-amber-50", text: "text-amber-900", border: "border-amber-100", ring: "text-amber-500", solid: "bg-amber-500" };

// Mock User Data
const DEFAULT_USER = {
    name: "User",
    username: "user",
    bio: "",
    location: "--",
    website: "",
    joined: "--",
    level: 1,
    xp: 0,
    nextLevelXp: 100,
    coins: 0,
    avatar: "https://github.com/shadcn.png",
    banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
};

export function GamifiedHeader() {
    const supabase = createClient();
    const { toast } = useToast();
    const { profile: globalProfile, isLoading: isUserLoading, refreshProfile } = useUser();

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Default values for rendering
    const user = {
        name: globalProfile?.full_name || "User",
        username: globalProfile?.username || "user",
        bio: globalProfile?.bio || "",
        location: globalProfile?.location || "--",
        website: globalProfile?.website || "",
        joined: globalProfile?.joined_at ? new Date(globalProfile.joined_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : "--",
        level: globalProfile?.level || 1,
        xp: globalProfile?.xp || 0,
        nextLevelXp: (globalProfile?.level || 1) * 500,
        coins: globalProfile?.coins || 0,
        streak_shields: globalProfile?.streak_shields || 0,
        avatar: globalProfile?.avatar_url || "https://github.com/shadcn.png",
        banner: globalProfile?.banner_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
    };

    const [equippedRingData, setEquippedRingData] = useState<any>(null);
    const [equippedTitleData, setEquippedTitleData] = useState<any>(null);

    const [formData, setFormData] = useState(user);

    // Update formData and fetch cosmetics when globalProfile becomes available
    useEffect(() => {
        if (globalProfile) {
            setFormData({
                name: globalProfile.full_name || "User",
                username: globalProfile.username || "user",
                bio: globalProfile.bio || "",
                location: globalProfile.location || "--",
                website: globalProfile.website || "",
                joined: globalProfile.joined_at ? new Date(globalProfile.joined_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }) : "--",
                level: globalProfile.level || 1,
                xp: globalProfile.xp || 0,
                nextLevelXp: (globalProfile.level || 1) * 500,
                coins: globalProfile.coins || 0,
                streak_shields: globalProfile.streak_shields || 0,
                avatar: globalProfile.avatar_url || "https://github.com/shadcn.png",
                banner: globalProfile.banner_url || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop"
            } as any);

            // Fetch Cosmetic Details Dynamically
            const fetchCosmetics = async () => {
                const ids = [];
                if (globalProfile.equipped_ring) ids.push(globalProfile.equipped_ring);
                if (globalProfile.equipped_title) ids.push(globalProfile.equipped_title);

                if (ids.length === 0) {
                    setEquippedRingData(null);
                    setEquippedTitleData(null);
                    return;
                }

                const { data } = await supabase
                    .from("shop_items")
                    .select("*")
                    .in("id", ids);

                if (data) {
                    const ring = data.find(i => i.id === globalProfile.equipped_ring);
                    const title = data.find(i => i.id === globalProfile.equipped_title);
                    setEquippedRingData(ring ? { ...ring, icon: getIcon(ring.icon_name) } : null);
                    setEquippedTitleData(title ? { ...title, icon: getIcon(title.icon_name) } : null);
                }
            };
            fetchCosmetics();
        }
    }, [globalProfile]);

    // Cropping State
    const [croppingImage, setCroppingImage] = useState<string | null>(null);
    const [cropAspectRatio, setCropAspectRatio] = useState(1); // 1 = Avatar, 16/9 = Banner
    const [activeField, setActiveField] = useState<"avatar" | "banner" | null>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    const theme = THEME;

    const handleSave = async () => {
        if (isSaving) return;

        setIsSaving(true);
        try {
            const { data: { user: authUser } } = await supabase.auth.getUser();

            if (!authUser) {
                toast("You must be logged in to save changes.", "error");
                return;
            }

            let avatarUrl = formData.avatar;
            let bannerUrl = formData.banner;

            // 1. Upload Avatar if it's a new file (data or blob URL)
            if (avatarUrl.startsWith("data:") || avatarUrl.startsWith("blob:")) {
                toast("Uploading avatar...", "info");
                const uploadedUrl = await uploadProfileImage(
                    "avatars",
                    `${authUser.id}/avatar_${Date.now()}.jpg`,
                    avatarUrl
                );
                if (uploadedUrl) avatarUrl = uploadedUrl;
            }

            // 2. Upload Banner if it's a new file
            if (bannerUrl.startsWith("data:") || bannerUrl.startsWith("blob:")) {
                toast("Uploading banner...", "info");
                const uploadedUrl = await uploadProfileImage(
                    "banners",
                    `${authUser.id}/banner_${Date.now()}.jpg`,
                    bannerUrl
                );
                if (uploadedUrl) bannerUrl = uploadedUrl;
            }

            // 3. Update Profile with new URLs and text fields
            toast("Saving profile changes...", "info");
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.name,
                    username: formData.username,
                    bio: formData.bio,
                    location: formData.location,
                    website: formData.website,
                    avatar_url: avatarUrl,
                    banner_url: bannerUrl,
                    updated_at: new Date().toISOString()
                })
                .eq('id', authUser.id);

            if (error) throw error;

            // Success
            await refreshProfile();
            setIsEditModalOpen(false);
            toast("Profile updated successfully!", "success");

        } catch (error: any) {
            console.error("Error saving profile:", error);
            toast(`Failed to update profile: ${error.message || "Unknown error"}`, "error");
        } finally {
            setIsSaving(false);
        }
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>, field: "avatar" | "banner") => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = () => {
                setCroppingImage(reader.result as string);
                setCropAspectRatio(field === "avatar" ? 1 : 16 / 5); // Banner is wide
                setActiveField(field);
            };
            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = (croppedImage: string) => {
        if (activeField === "avatar" || activeField === "banner") {
            setFormData({ ...formData, [activeField]: croppedImage });
        }
        setCroppingImage(null);
        setActiveField(null);
    };

    const xpProgress = (user.xp / user.nextLevelXp) * 100;

    if (isUserLoading) {
        return (
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden relative h-64 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-amber-200 border-t-amber-500 animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden relative">
            {/* Banner */}
            <div className="h-48 md:h-64 bg-gray-100 relative group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={user.banner}
                    alt="Cover"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60" />
            </div>

            <div className="px-6 md:px-10 pb-8 relative">
                <div className="flex flex-col md:flex-row gap-6 md:items-end -mt-16 md:-mt-20">

                    <div className="relative mx-auto md:mx-0">
                        {(() => {
                            const visualData = equippedRingData?.visual_data || {
                                colorClass: THEME.ring,
                                secondaryColorClass: undefined,
                                badgeColorClass: THEME.solid,
                                badgeTextColorClass: undefined
                            };

                            return (
                                <LevelRing
                                    level={user.level}
                                    progress={xpProgress}
                                    size={140}
                                    colorClass={visualData.colorClass}
                                    secondaryColorClass={visualData.secondaryColorClass}
                                    badgeColorClass={visualData.badgeColorClass}
                                    badgeTextColorClass={visualData.badgeTextColorClass}
                                >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                </LevelRing>
                            );
                        })()}
                    </div>

                    {/* Middle: User Info & Stats */}
                    <div className="flex-1 text-center md:text-left space-y-4 pt-2">
                        {/* Identity */}
                        <div className="space-y-1">
                            <h1 className="text-3xl md:text-4xl font-black tracking-tight">{user.name}</h1>
                            <div className="flex items-center gap-3 justify-center md:justify-start flex-wrap">
                                <p className="text-lg text-muted-foreground font-medium">@{user.username}</p>
                                {equippedTitleData && (
                                    <span className="inline-flex items-center gap-1.5 bg-zinc-900 text-[#D4F268] text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
                                        <equippedTitleData.icon size={10} />
                                        {equippedTitleData.name}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Bio & Links */}
                        <div className="text-sm text-muted-foreground space-y-3">
                            <p className="max-w-lg mx-auto md:mx-0 leading-relaxed">{user.bio}</p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4 pt-1">
                                <span className="flex items-center gap-1.5"><MapPin size={14} /> {user.location}</span>
                                {user.website ? (
                                    <a
                                        href={user.website.startsWith('http') ? user.website : `https://${user.website}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1.5 hover:text-amber-500 hover:underline transition-colors"
                                    >
                                        <LinkIcon size={14} /> {user.website}
                                    </a>
                                ) : (
                                    <span className="flex items-center gap-1.5"><LinkIcon size={14} /> --</span>
                                )}
                                <span className="flex items-center gap-1.5"><Calendar size={14} /> Joined {user.joined}</span>
                            </div>
                        </div>
                    </div>

                    {/* Right: Gamification Stats & Actions */}
                    <div className="flex flex-col items-center md:items-end gap-4 min-w-[200px] mt-6 md:mt-24">
                        {/* Streak Shields + Coin Wallet */}
                        <div className="flex items-center gap-2">
                            {/* Streak Shield Badge */}
                            {(user as any).streak_shields > 0 && (
                                <div className="px-3 py-1 rounded-full flex items-center gap-1.5 font-bold border bg-blue-50 border-blue-100 text-blue-700 shadow-sm">
                                    <Shield size={14} className="fill-blue-400 text-blue-700" />
                                    <span className="text-sm">{(user as any).streak_shields}</span>
                                </div>
                            )}
                            {/* Loop Coin Wallet */}
                            <div className={cn("px-3 py-1 rounded-full flex items-center gap-1.5 font-bold shadow-sm hover:shadow-md transition-shadow cursor-pointer border", theme.bg, theme.border, theme.text)}>
                                <CurrencyCoin size="sm" className="w-5 h-5" />
                                <span className="text-sm">{user.coins.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* XP Progress */}
                        <div className="w-full max-w-[180px] space-y-1">
                            <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                <span>XP</span>
                                <span>{user.xp} / {user.nextLevelXp}</span>
                            </div>
                            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${xpProgress}%` }}
                                    className={cn("h-full rounded-full", theme.ring.replace("text-", "bg-"))}
                                />
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-2">
                            <Button size="sm" variant="outline" onClick={() => {
                                setFormData(user);
                                setIsEditModalOpen(true);
                            }}>
                                <Edit2 size={14} className="mr-2" /> Edit Profile
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title="Edit Profile"
            >
                <div className="space-y-6">
                    {/* Images Section */}
                    <div className="space-y-4">
                        <div className="h-32 rounded-xl bg-gray-100 overflow-hidden relative group">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={formData.banner} className="w-full h-full object-cover opacity-70" alt="Banner Preview" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Button variant="secondary" size="sm" className="gap-2" onClick={() => bannerInputRef.current?.click()}>
                                    <Camera size={14} /> Change Cover
                                </Button>
                                <input
                                    type="file"
                                    ref={bannerInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={(e) => handleFileSelect(e, "banner")}
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={formData.avatar} className="w-full h-full object-cover" alt="Avatar Preview" />
                            </div>
                            <Button variant="outline" size="sm" onClick={() => avatarInputRef.current?.click()}>Change Avatar</Button>
                            <input
                                type="file"
                                ref={avatarInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleFileSelect(e, "avatar")}
                            />
                        </div>
                    </div>

                    {/* Images Section */}

                    {/* Form Fields */}
                    <div className="grid gap-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-gray-500">Display Name</label>
                                <Input
                                    value={formData.name}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-gray-500">Handle</label>
                                <Input
                                    value={formData.username === "user" ? formData.username : `@${formData.username}`}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                                        let val = e.target.value;
                                        if (val.startsWith('@')) val = val.substring(1);
                                        setFormData({ ...formData, username: val });
                                    }}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase text-gray-500">Bio</label>
                            <Textarea
                                value={formData.bio}
                                onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setFormData({ ...formData, bio: e.target.value })}
                                className="resize-none h-24"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-gray-500">Location</label>
                                <Input
                                    value={formData.location}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, location: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase text-gray-500">Website</label>
                                <Input
                                    value={formData.website}
                                    onChange={(e: ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, website: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <Button variant="ghost" disabled={isSaving} onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                        <Button disabled={isSaving} onClick={handleSave}>{isSaving ? "Saving..." : "Save Changes"}</Button>
                    </div>
                </div>
            </Modal>

            {/* Image Cropper Modal */}
            <ImageCropper
                isOpen={!!croppingImage}
                imageSrc={croppingImage || ""}
                aspectRatio={cropAspectRatio}
                onCropComplete={onCropComplete}
                onCancel={() => setCroppingImage(null)}
            />
        </div>
    );
}
