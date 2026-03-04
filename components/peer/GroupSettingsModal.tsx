// This will hold the Group Settings Modal component
"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Lock, Unlock, Loader2, ShieldCheck, ShieldAlert, UserMinus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PeerProfile } from "./PeerCard";
import { createClient } from "@/utils/supabase/client";
import { uploadChatFile } from "@/actions/chat-actions";

interface GroupSettingsModalProps {
    peer: PeerProfile;
    isOpen: boolean;
    onClose: () => void;
    currentUserRole: string; // 'owner', 'admin', 'moderator'
    onUpdate?: (updatedData: any) => void;
}

export function GroupSettingsModal({ peer, isOpen, onClose, currentUserRole, onUpdate }: GroupSettingsModalProps) {
    const [activeTab, setActiveTab] = useState<"general" | "members">("general");
    const [name, setName] = useState(peer.name);
    const [description, setDescription] = useState(peer.description || "");
    const [privacy, setPrivacy] = useState<"public" | "private">("public");
    const [avatarUrl, setAvatarUrl] = useState(peer.avatarUrl || "");
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Ensure portal only runs client-side
    useEffect(() => { setMounted(true); }, []);

    // Member management state
    const [members, setMembers] = useState<any[]>([]);
    const [isLoadingMembers, setIsLoadingMembers] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setName(peer.name);
            setDescription(peer.description || "");
            setAvatarUrl(peer.avatarUrl || "");

            // Fetch group privacy and members if opened
            const fetchDetails = async () => {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (user) setCurrentUserId(user.id);

                const { data: convo } = await supabase
                    .from('conversations')
                    .select('privacy')
                    .eq('id', peer.id)
                    .single();

                if (convo && convo.privacy) setPrivacy(convo.privacy as "public" | "private");

                if (activeTab === "members") {
                    loadMembers();
                }
            };
            fetchDetails();
        }
    }, [isOpen, peer, activeTab]);

    const loadMembers = async () => {
        setIsLoadingMembers(true);
        const supabase = createClient();
        const { data, error } = await supabase
            .from('conversation_participants')
            .select(`
                user_id,
                role,
                profiles ( id, full_name, username, avatar_url )
            `)
            .eq('conversation_id', peer.id);

        if (!error && data) {
            setMembers(data.map((m: any) => ({
                id: m.profiles.id,
                name: m.profiles.full_name || m.profiles.username,
                username: m.profiles.username,
                avatarUrl: m.profiles.avatar_url,
                role: m.role
            })));
        }
        setIsLoadingMembers(false);
    };

    const handleSaveGeneral = async () => {
        setIsSaving(true);
        const supabase = createClient();

        // We use the RPC function we created earlier
        const { data, error } = await supabase.rpc('update_group_settings', {
            convo_id: peer.id,
            new_title: name,
            new_description: description,
            new_avatar_url: avatarUrl,
            new_privacy: privacy
        });

        setIsSaving(false);
        if (!error && data) {
            onUpdate?.({ name, description, avatarUrl, privacy });
            onClose();
        }
    };

    const handleRoleChange = async (targetUserId: string, newRole: string) => {
        const supabase = createClient();
        const { data, error } = await supabase.rpc('set_participant_role', {
            convo_id: peer.id,
            target_user_id: targetUserId,
            new_role: newRole
        });

        if (!error && data) {
            // Update local state
            setMembers(prev => prev.map(m => m.id === targetUserId ? { ...m, role: newRole } : m));
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            const url = await uploadChatFile(formData);
            if (url) {
                setAvatarUrl(url);
            }
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setIsUploading(false);
        }
    };

    const canEditRoles = currentUserRole === 'owner' || currentUserRole === 'admin';

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-md"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-lg bg-[#FDFCF8] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-[#E5E5E0] flex justify-between items-center bg-white">
                            <h2 className="text-xl font-black text-[#1A1A1A]">Group Settings</h2>
                            <button onClick={onClose} className="p-2 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-[#E5E5E0] bg-white px-6">
                            <button
                                onClick={() => setActiveTab("general")}
                                className={`py-4 px-2 font-bold text-sm border-b-2 transition-colors ${activeTab === "general" ? "border-[#D4F268] text-black" : "border-transparent text-zinc-500 hover:text-black"}`}
                            >
                                General Details
                            </button>
                            <button
                                onClick={() => setActiveTab("members")}
                                className={`py-4 px-2 font-bold text-sm border-b-2 transition-colors ml-6 ${activeTab === "members" ? "border-[#D4F268] text-black" : "border-transparent text-zinc-500 hover:text-black"}`}
                            >
                                Member Roles
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 bg-[#FDFCF8]">
                            {activeTab === "general" && (
                                <div className="space-y-6">
                                    {/* Avatar/Emoji */}
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Group Icon (Emoji / URL)</label>
                                        <div className="flex items-center gap-4">
                                            <div className="relative group">
                                                <div className="w-16 h-16 rounded-2xl bg-white border border-[#E5E5E0] shadow-sm flex items-center justify-center text-3xl shrink-0 overflow-hidden">
                                                    {isUploading ? (
                                                        <Loader2 size={24} className="animate-spin text-zinc-400" />
                                                    ) : avatarUrl.startsWith('http') ? (
                                                        <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                                                    ) : avatarUrl ? (
                                                        avatarUrl
                                                    ) : (
                                                        <Camera className="text-zinc-300" />
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="absolute -bottom-1 -right-1 p-1.5 bg-black text-white rounded-lg shadow-lg hover:scale-105 transition-transform"
                                                >
                                                    <Camera size={12} />
                                                </button>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    onChange={handleFileChange}
                                                    accept="image/*"
                                                    className="hidden"
                                                />
                                            </div>
                                            <div className="flex-1 space-y-2">
                                                <input
                                                    type="text"
                                                    value={avatarUrl}
                                                    onChange={(e) => setAvatarUrl(e.target.value)}
                                                    placeholder="Enter an emoji or image URL"
                                                    className="w-full px-4 py-3 bg-white border border-[#E5E5E0] rounded-xl text-sm font-medium focus:outline-none focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-all"
                                                />
                                                <p className="text-[10px] text-zinc-400">You can also upload an image using the button</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Name */}
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Group Name</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-3 bg-white border border-[#E5E5E0] rounded-xl text-sm font-bold text-black focus:outline-none focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-all"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Description</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={3}
                                            className="w-full px-4 py-3 bg-white border border-[#E5E5E0] rounded-xl text-sm font-medium text-zinc-700 focus:outline-none focus:border-[#1A1A1A] focus:ring-1 focus:ring-[#1A1A1A] transition-all resize-none"
                                        />
                                    </div>

                                    {/* Privacy */}
                                    <div>
                                        <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Privacy Settings</label>
                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => setPrivacy("public")}
                                                className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${privacy === "public" ? "bg-[#D4F268]/20 border-[#D4F268] text-black font-bold" : "bg-white border-[#E5E5E0] text-zinc-500 hover:border-black font-medium"}`}
                                            >
                                                <Unlock size={16} /> Public
                                            </button>
                                            <button
                                                onClick={() => setPrivacy("private")}
                                                className={`flex-1 p-3 rounded-xl border flex items-center justify-center gap-2 transition-all ${privacy === "private" ? "bg-black border-black text-white font-bold" : "bg-white border-[#E5E5E0] text-zinc-500 hover:border-black font-medium"}`}
                                            >
                                                <Lock size={16} /> Private
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === "members" && (
                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                                    {isLoadingMembers ? (
                                        <div className="flex justify-center p-8"><Loader2 className="animate-spin text-zinc-400" /></div>
                                    ) : (
                                        members.map(member => (
                                            <div key={member.id} className="flex items-center justify-between p-3 bg-white border border-[#E5E5E0] rounded-xl shadow-sm hover:border-zinc-300 transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-zinc-100 overflow-hidden flex items-center justify-center border border-zinc-200">
                                                        {member.avatarUrl ? <img src={member.avatarUrl} alt="" className="w-full h-full object-cover" /> : <span className="font-bold text-zinc-500">{member.name[0]}</span>}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-bold text-black truncate">{member.name}</div>
                                                        <div className="text-[10px] font-medium text-zinc-500">@{member.username}</div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    {/* Role Badge */}
                                                    <span className={`px-2 py-1 text-[10px] font-black uppercase rounded-md border ${member.role === 'owner' ? 'bg-black text-[#D4F268] border-black' :
                                                        member.role === 'admin' ? 'bg-[#D4F268]/20 text-black border-[#D4F268]' :
                                                            member.role === 'moderator' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                                                'bg-zinc-50 text-zinc-600 border-zinc-200'
                                                        }`}>
                                                        {member.role}
                                                    </span>

                                                    {/* Role Actions */}
                                                    {canEditRoles && member.role !== 'owner' && member.id !== currentUserId && (
                                                        <div className="flex items-center gap-1 ml-2 border-l border-zinc-100 pl-2">
                                                            {currentUserRole === 'owner' && member.role !== 'admin' && (
                                                                <button
                                                                    onClick={() => handleRoleChange(member.id, 'admin')}
                                                                    className="p-1.5 text-zinc-400 hover:text-black hover:bg-zinc-100 rounded-lg transition-all"
                                                                    title="Promote to Admin"
                                                                >
                                                                    <ShieldCheck size={14} />
                                                                </button>
                                                            )}
                                                            {(currentUserRole === 'owner' || currentUserRole === 'admin') && member.role !== 'moderator' && (
                                                                <button
                                                                    onClick={() => handleRoleChange(member.id, 'moderator')}
                                                                    className="p-1.5 text-zinc-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                                    title="Promote to Moderator"
                                                                >
                                                                    <ShieldAlert size={14} />
                                                                </button>
                                                            )}
                                                            {member.role !== 'member' && (
                                                                <button
                                                                    onClick={() => handleRoleChange(member.id, 'member')}
                                                                    className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                                    title="Demote to Member"
                                                                >
                                                                    <UserMinus size={14} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {activeTab === "general" && (
                            <div className="p-4 border-t border-[#E5E5E0] bg-white">
                                <Button
                                    onClick={handleSaveGeneral}
                                    disabled={isSaving || isUploading}
                                    className="w-full h-12 rounded-xl bg-[#1A1A1A] hover:bg-black text-[#D4F268] font-black text-sm"
                                >
                                    {isSaving ? <Loader2 className="animate-spin mr-2" /> : null}
                                    {isSaving ? "Saving..." : "Save Settings"}
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    if (!mounted) return null;
    return createPortal(modalContent, document.body);
}
