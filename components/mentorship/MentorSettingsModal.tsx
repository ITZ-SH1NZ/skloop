"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Loader2, Save } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useUser } from "@/context/UserContext";

interface MentorSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentProfile: any;
    onSave: () => void;
}

export function MentorSettingsModal({ isOpen, onClose, currentProfile, onSave }: MentorSettingsModalProps) {
    const { user } = useUser();
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [headline, setHeadline] = useState("");
    const [bio, setBio] = useState("");
    const [isAccepting, setIsAccepting] = useState(true);
    const [hourlyRate, setHourlyRate] = useState(0);

    // Initialize state when modal opens
    useEffect(() => {
        if (isOpen && currentProfile) {
            setHeadline(currentProfile.headline || "");
            setBio(currentProfile.bio || "");
            setIsAccepting(currentProfile.isAccepting ?? true);
            setHourlyRate(currentProfile.hourlyRate || 0);
        }
    }, [isOpen, currentProfile]);

    // Handle body scroll locking
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const handleSave = async () => {
        if (!user) return;
        setIsLoading(true);
        const supabase = createClient();

        // Update mentor_profiles
        const { error: mpError } = await supabase
            .from("mentor_profiles")
            .update({
                headline,
                bio,
                is_accepting: isAccepting,
                // Note: hourly_rate would go here if added to schema
            })
            .eq("id", user.id);

        setIsLoading(false);
        if (!mpError) {
            onSave();
            onClose();
        } else {
            alert("Error saving settings: " + mpError.message);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Layer 1: Backdrop */}
            <div
                className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm"
                aria-hidden="true"
                onClick={onClose}
            />

            {/* Layer 2: Scroll layer (data-lenis-prevent fixes scroll hijacking) */}
            <div
                className="fixed inset-0 z-[101] overflow-y-auto"
                data-lenis-prevent
                onClick={onClose}
            >
                {/* Layer 3: Centering wrapper */}
                <div
                    className="flex min-h-full items-center justify-center p-4 py-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl relative overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-zinc-100 bg-zinc-50/50">
                            <h2 className="text-2xl font-black text-zinc-900">Mentor Settings</h2>
                            <button
                                onClick={onClose}
                                className="p-2 text-zinc-400 hover:bg-zinc-200 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Form Body */}
                        <div className="p-8 space-y-6">
                            {/* Availability Toggle */}
                            <div className="flex items-center justify-between p-5 rounded-2xl border border-zinc-100 bg-zinc-50">
                                <div>
                                    <h3 className="font-bold text-zinc-900 mb-1">Accepting Sessions</h3>
                                    <p className="text-xs font-medium text-zinc-500">
                                        Toggle whether users can request new 1-on-1 sessions with you.
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={isAccepting}
                                        onChange={(e) => setIsAccepting(e.target.checked)}
                                    />
                                    <div className="w-14 h-7 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-[#D4F268]"></div>
                                </label>
                            </div>

                            {/* Headline */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">
                                    Headline <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={headline}
                                    onChange={(e) => setHeadline(e.target.value)}
                                    placeholder="e.g. Senior Software Engineer @ Google"
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium text-zinc-900 outline-none focus:ring-2 focus:ring-[#D4F268]"
                                />
                            </div>

                            {/* Bio */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block">
                                    Bio
                                </label>
                                <textarea
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Share your experience, what you like to mentor about, etc..."
                                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 h-32 text-sm font-medium text-zinc-900 outline-none focus:ring-2 focus:ring-[#D4F268] resize-none"
                                />
                            </div>

                            {/* Hourly Rate (UI Placeholder for now) */}
                            <div className="space-y-2">
                                <label className="text-xs font-black text-zinc-500 uppercase tracking-widest block flex items-center justify-between">
                                    <span>Hourly Rate (SKLOOP Coins)</span>
                                    <span className="text-zinc-400 font-medium normal-case tracking-normal">Optional</span>
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-zinc-400 font-bold">🟡</span>
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        step="100"
                                        value={hourlyRate}
                                        onChange={(e) => setHourlyRate(parseInt(e.target.value) || 0)}
                                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-10 pr-4 py-3 text-sm font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-[#D4F268]"
                                    />
                                </div>
                                <p className="text-[10px] text-zinc-500 font-medium">Set to 0 cases for free sessions.</p>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-3">
                            <button
                                onClick={onClose}
                                disabled={isLoading}
                                className="px-6 py-3 rounded-xl font-bold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={isLoading || !headline.trim()}
                                className="px-6 py-3 rounded-xl font-black bg-[#D4F268] text-black hover:bg-[#c1df5c] transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                                Save Changes
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
}
