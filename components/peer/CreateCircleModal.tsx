"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Image as ImageIcon, Lock, Globe, Users, ArrowRight, Check, Hash } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StudyCircleCard, StudyCircle } from "@/components/peer/StudyCircleCard";

interface CreateCircleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (circle: Omit<StudyCircle, "id" | "memberCount" | "isJoined"> & { emoji: string, privacy: 'public' | 'private' }) => void;
}

const TOPIC_OPTIONS = ["Frontend", "Backend", "Design", "Data Science", "Algorithms", "Startup", "System", "Mobile"];
const POPULAR_TAGS = ["react", "javascript", "python", "ai", "dsa", "figma", "ui", "ux", "typescript", "nextjs", "rust", "go"];
const FUN_EMOJIS = ["🚀", "💡", "🎨", "💻", "🔥", "⚡️", "🧠", "🎯", "🌟", "🛠", "📈", "🎲"];

export function CreateCircleModal({ isOpen, onClose, onCreate }: CreateCircleModalProps) {
    const [name, setName] = useState("");
    const [topic, setTopic] = useState("Frontend");
    const [description, setDescription] = useState("");
    const [maxMembers, setMaxMembers] = useState(50);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [emoji, setEmoji] = useState("🚀");
    const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
    const [step, setStep] = useState(1); // 1 = Identity, 2 = Vibe, 3 = Settings & Launch

    // Reset when opened
    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setName("");
            setTopic("Frontend");
            setDescription("");
            setMaxMembers(50);
            setTags([]);
            setTagInput("");
            setEmoji("🚀");
            setPrivacy('public');
        }
    }, [isOpen]);

    const handleAddTag = (tag: string) => {
        const cleanTag = tag.toLowerCase().trim().replace(/^#/, '');
        if (cleanTag && !tags.includes(cleanTag) && tags.length < 5) {
            setTags([...tags, cleanTag]);
            setTagInput("");
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleCreate = () => {
        if (!name.trim() || !description.trim() || tags.length === 0) {
            return;
        }

        onCreate({
            name: name.trim(),
            topic,
            description: description.trim(),
            maxMembers,
            tags,
            emoji,
            privacy
        });
        onClose();
    };

    const handleRandomEmoji = () => {
        const remaining = FUN_EMOJIS.filter(e => e !== emoji);
        const random = remaining[Math.floor(Math.random() * remaining.length)];
        setEmoji(random);
    };

    // Preview circle mapping
    const previewCircle: StudyCircle = {
        id: "preview",
        name: name || "Untitled Circle",
        topic,
        description: description || "Your circle's mission will appear here...",
        memberCount: 1,
        maxMembers,
        tags: tags.length > 0 ? tags : ["tag"],
        isJoined: true,
    };

    const nextDisabled =
        (step === 1 && !name.trim()) ||
        (step === 2 && (!description.trim() || tags.length === 0));

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6" data-lenis-prevent>
                    {/* Dark Backdrop with heavy blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-xl"
                    />

                    {/* Main Modal Window */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 30, rotateX: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 30, rotateX: -10 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        style={{ perspective: 1000 }}
                        className="relative w-full max-w-6xl bg-[#FDFCF8] rounded-[2rem] sm:rounded-[2.5rem] shadow-[-10px_20px_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[90vh] border border-white"
                    >
                        {/* Interactive Background Grid */}
                        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                            style={{ backgroundImage: 'linear-gradient(#1A1A1A 1px, transparent 1px), linear-gradient(90deg, #1A1A1A 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

                        {/* Top Navigation Bar */}
                        <div className="flex-shrink-0 px-6 py-5 sm:px-10 sm:py-6 flex items-center justify-between relative z-20">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[#1A1A1A] flex items-center justify-center shadow-lg shadow-black/20">
                                    <Sparkles size={20} className="text-[#D4F268]" />
                                </div>
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-black text-[#1A1A1A] tracking-tighter">New Circle</h2>
                                    <p className="text-[10px] sm:text-xs font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                                        Step {step} of 3
                                    </p>
                                </div>
                            </div>

                            {/* Magic Progress Dots */}
                            <div className="hidden sm:flex items-center gap-3">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className={`h-2 rounded-full transition-all duration-500 ease-out ${step >= i ? 'w-10 bg-[#D4F268] shadow-[0_0_10px_rgba(212,242,104,0.5)]' : 'w-2 bg-zinc-200'}`} />
                                ))}
                            </div>

                            <button
                                onClick={onClose}
                                className="w-10 h-10 shrink-0 rounded-full bg-white border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-sm"
                            >
                                <X size={18} className="text-[#1A1A1A]" />
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 overflow-y-auto sm:overflow-hidden relative z-10" data-lenis-prevent>
                            <div className="flex flex-col lg:flex-row h-full">

                                {/* Form Left Side */}
                                <div className="w-full lg:w-7/12 p-6 justify-center sm:p-10 flex flex-col bg-white rounded-tr-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.02)] border-t lg:border-t-0 lg:border-r border-zinc-100 overflow-y-auto" data-lenis-prevent>
                                    <AnimatePresence mode="wait">

                                        {/* STEP 1: IDENTITY */}
                                        {step === 1 && (
                                            <motion.div
                                                key="step1"
                                                initial={{ opacity: 0, x: -30 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 30 }}
                                                transition={{ duration: 0.4, ease: "easeOut" }}
                                                className="space-y-8 sm:space-y-10 max-w-xl"
                                            >
                                                <div className="space-y-2">
                                                    <h3 className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight leading-none tracking-tighter">Identity & Brand</h3>
                                                    <p className="text-sm sm:text-base font-medium text-zinc-500">Give your circle a name and an icon that pops.</p>
                                                </div>

                                                <div className="flex items-center gap-6">
                                                    <div className="flex flex-col items-center gap-3">
                                                        <motion.button
                                                            whileHover={{ scale: 1.05, rotate: 5 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={handleRandomEmoji}
                                                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-[#D4F268]/20 flex items-center justify-center text-4xl sm:text-5xl border-2 border-[#D4F268] border-dashed hover:bg-[#D4F268]/30 transition-colors relative group"
                                                        >
                                                            {emoji}
                                                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#1A1A1A] text-[#D4F268] rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                                <ImageIcon size={14} />
                                                            </div>
                                                        </motion.button>
                                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Randomize</span>
                                                    </div>

                                                    <div className="flex-1 space-y-2">
                                                        <label className="block text-[11px] sm:text-xs font-black text-[#1A1A1A] uppercase tracking-widest opacity-70">Circle Name</label>
                                                        <input
                                                            autoFocus
                                                            type="text"
                                                            value={name}
                                                            onChange={(e) => setName(e.target.value)}
                                                            placeholder="e.g., Senior React Devs"
                                                            maxLength={40}
                                                            className="w-full bg-transparent border-b-2 border-zinc-200 focus:border-[#1A1A1A] py-3 outline-none transition-colors text-2xl sm:text-3xl font-black text-[#1A1A1A] placeholder:text-zinc-300"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <label className="block text-[11px] sm:text-xs font-black text-[#1A1A1A] uppercase tracking-widest opacity-70">
                                                        Primary Category
                                                    </label>
                                                    <div className="flex flex-wrap gap-2.5">
                                                        {TOPIC_OPTIONS.map((t) => (
                                                            <button
                                                                key={t}
                                                                onClick={() => setTopic(t)}
                                                                className={`px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-300 border-2 ${topic === t
                                                                    ? "border-[#1A1A1A] bg-[#1A1A1A] text-white shadow-xl shadow-black/10 scale-[1.02]"
                                                                    : "border-zinc-100 bg-white text-zinc-500 hover:border-zinc-300 hover:text-zinc-900"
                                                                    }`}
                                                            >
                                                                {t}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* STEP 2: VIBE & RULES */}
                                        {step === 2 && (
                                            <motion.div
                                                key="step2"
                                                initial={{ opacity: 0, x: -30 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 30 }}
                                                transition={{ duration: 0.4, ease: "easeOut" }}
                                                className="space-y-8 sm:space-y-10 max-w-xl"
                                            >
                                                <div className="space-y-2">
                                                    <h3 className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight leading-none tracking-tighter">Vibe & Rules</h3>
                                                    <p className="text-sm sm:text-base font-medium text-zinc-500">Define the mission and add keywords for discoverability.</p>
                                                </div>

                                                <div className="space-y-8">
                                                    {/* Description */}
                                                    <div className="group space-y-2">
                                                        <label className="block text-[11px] sm:text-xs font-black text-[#1A1A1A] uppercase tracking-widest opacity-70 group-focus-within:text-[#D4F268] group-focus-within:opacity-100 transition-colors">
                                                            Mission / Description
                                                        </label>
                                                        <div className="relative">
                                                            <textarea
                                                                autoFocus
                                                                value={description}
                                                                onChange={(e) => setDescription(e.target.value)}
                                                                placeholder="What's the goal? Who should join?"
                                                                maxLength={200}
                                                                rows={4}
                                                                className="w-full px-5 py-5 bg-zinc-50 rounded-3xl border-2 border-transparent focus:bg-white focus:border-[#D4F268] outline-none transition-all resize-none text-base sm:text-lg text-[#1A1A1A] font-bold placeholder:text-zinc-300 placeholder:font-medium shadow-inner"
                                                            />
                                                            <div className="absolute right-4 bottom-4 text-[10px] font-bold text-zinc-400">
                                                                {description.length}/200
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* Tags */}
                                                    <div className="space-y-3">
                                                        <label className="flex items-center justify-between text-[11px] sm:text-xs font-black text-[#1A1A1A] uppercase tracking-widest opacity-70">
                                                            <span>Tags ({tags.length}/5)</span>
                                                        </label>

                                                        <div className="flex gap-2 p-1.5 bg-zinc-50 border border-zinc-200 rounded-2xl focus-within:ring-4 focus-within:ring-[#D4F268]/20 focus-within:border-[#D4F268] transition-all">
                                                            <div className="flex-1 flex items-center pl-3">
                                                                <Hash size={16} className="text-zinc-400" />
                                                                <input
                                                                    type="text"
                                                                    value={tagInput}
                                                                    onChange={(e) => setTagInput(e.target.value)}
                                                                    onKeyDown={(e) => {
                                                                        if (e.key === "Enter") {
                                                                            e.preventDefault();
                                                                            handleAddTag(tagInput);
                                                                        }
                                                                    }}
                                                                    placeholder="Add keyword..."
                                                                    disabled={tags.length >= 5}
                                                                    className="w-full px-2 py-2 bg-transparent outline-none text-sm font-bold text-[#1A1A1A] placeholder:text-zinc-400 placeholder:font-medium disabled:opacity-50"
                                                                />
                                                            </div>
                                                            <Button
                                                                onClick={() => handleAddTag(tagInput)}
                                                                disabled={tags.length >= 5 || !tagInput.trim()}
                                                                className="px-6 py-2 bg-[#1A1A1A] text-white rounded-xl hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                                                            >
                                                                Add
                                                            </Button>
                                                        </div>

                                                        {/* Tag Badges */}
                                                        <div className="flex flex-wrap gap-2 min-h-[32px]">
                                                            <AnimatePresence>
                                                                {tags.map((tag) => (
                                                                    <motion.span
                                                                        key={tag}
                                                                        initial={{ scale: 0.5, opacity: 0 }}
                                                                        animate={{ scale: 1, opacity: 1 }}
                                                                        exit={{ scale: 0.8, opacity: 0 }}
                                                                        className="px-3 py-1.5 rounded-[1rem] bg-[#D4F268] text-[#1A1A1A] text-xs font-black flex items-center gap-2 shadow-sm"
                                                                    >
                                                                        #{tag}
                                                                        <button onClick={() => handleRemoveTag(tag)} className="hover:bg-black/10 rounded-full p-0.5 transition-colors">
                                                                            <X size={12} strokeWidth={3} />
                                                                        </button>
                                                                    </motion.span>
                                                                ))}
                                                            </AnimatePresence>
                                                        </div>

                                                        <div className="flex flex-wrap gap-2 pt-2 border-t border-zinc-100">
                                                            {POPULAR_TAGS.filter(t => !tags.includes(t)).slice(0, 6).map((tag) => (
                                                                <button
                                                                    key={tag}
                                                                    onClick={() => handleAddTag(tag)}
                                                                    disabled={tags.length >= 5}
                                                                    className="px-3 py-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-50 hover:border-[#1A1A1A] text-[10px] sm:text-[11px] font-bold text-zinc-500 hover:text-[#1A1A1A] disabled:opacity-30 shadow-sm transition-all"
                                                                >
                                                                    +{tag}
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* STEP 3: LOGISTICS & LAUNCH */}
                                        {step === 3 && (
                                            <motion.div
                                                key="step3"
                                                initial={{ opacity: 0, x: -30 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 30 }}
                                                transition={{ duration: 0.4, ease: "easeOut" }}
                                                className="space-y-8 sm:space-y-10 max-w-xl"
                                            >
                                                <div className="space-y-2">
                                                    <h3 className="text-3xl sm:text-4xl font-black text-[#1A1A1A] tracking-tight leading-none tracking-tighter">Final Polish</h3>
                                                    <p className="text-sm sm:text-base font-medium text-zinc-500">Who can join and how big can it get?</p>
                                                </div>

                                                <div className="space-y-8">
                                                    {/* Privacy Selector */}
                                                    <div className="space-y-3">
                                                        <label className="block text-[11px] sm:text-xs font-black text-[#1A1A1A] uppercase tracking-widest opacity-70">
                                                            Privacy & Access
                                                        </label>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                            <button
                                                                onClick={() => setPrivacy('public')}
                                                                className={`p-5 rounded-3xl text-left border-2 transition-all duration-300 relative overflow-hidden ${privacy === 'public' ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white shadow-xl scale-[1.02]' : 'border-zinc-200 bg-white hover:border-[#D4F268] hover:bg-[#D4F268]/5'}`}
                                                            >
                                                                {privacy === 'public' && <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4F268]/20 blur-2xl rounded-full" />}
                                                                <Globe size={24} className={`mb-3 ${privacy === 'public' ? 'text-[#D4F268]' : 'text-zinc-400'}`} />
                                                                <h4 className={`text-base font-black ${privacy === 'public' ? 'text-white' : 'text-[#1A1A1A]'}`}>Public Circle</h4>
                                                                <p className={`text-xs mt-1 font-medium ${privacy === 'public' ? 'text-zinc-300' : 'text-zinc-500'}`}>Anyone can discover and join instantly.</p>
                                                            </button>

                                                            <button
                                                                onClick={() => setPrivacy('private')}
                                                                className={`p-5 rounded-3xl text-left border-2 transition-all duration-300 relative overflow-hidden ${privacy === 'private' ? 'border-[#1A1A1A] bg-[#1A1A1A] text-white shadow-xl scale-[1.02]' : 'border-zinc-200 bg-white hover:border-[#D4F268] hover:bg-[#D4F268]/5'}`}
                                                            >
                                                                {privacy === 'private' && <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4F268]/20 blur-2xl rounded-full" />}
                                                                <Lock size={24} className={`mb-3 ${privacy === 'private' ? 'text-[#D4F268]' : 'text-zinc-400'}`} />
                                                                <h4 className={`text-base font-black ${privacy === 'private' ? 'text-white' : 'text-[#1A1A1A]'}`}>Invite Only</h4>
                                                                <p className={`text-xs mt-1 font-medium ${privacy === 'private' ? 'text-zinc-300' : 'text-zinc-500'}`}>Hidden from directory. Invite link required.</p>
                                                            </button>
                                                        </div>
                                                    </div>

                                                    {/* Capacity Slider */}
                                                    <div className="space-y-6 pt-4 border-t border-zinc-100">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Users size={16} className="text-[#1A1A1A]" />
                                                                <label className="block text-[11px] sm:text-xs font-black text-[#1A1A1A] uppercase tracking-widest opacity-70">
                                                                    Maximum Capacity
                                                                </label>
                                                            </div>
                                                            <motion.div
                                                                key={maxMembers}
                                                                initial={{ scale: 0.8, fill: "#D4F268" }}
                                                                animate={{ scale: 1, fill: "transparent" }}
                                                                className="text-lg sm:text-2xl font-black text-[#1A1A1A] bg-[#D4F268] px-4 py-1.5 rounded-[1rem] shadow-sm transform rotate-2"
                                                            >
                                                                {maxMembers}
                                                            </motion.div>
                                                        </div>

                                                        <div className="relative group px-1">
                                                            {/* Track background */}
                                                            <div className="absolute w-full h-4 bg-zinc-100 rounded-full top-1/2 -translate-y-1/2" />
                                                            {/* Active track */}
                                                            <div className="absolute h-4 bg-[#1A1A1A] rounded-full top-1/2 -translate-y-1/2 pointer-events-none" style={{ width: `${((maxMembers - 10) / 90) * 100}%` }} />
                                                            {/* Glow track */}
                                                            <div className="absolute h-4 bg-[#D4F268]/50 blur-md rounded-full top-1/2 -translate-y-1/2 pointer-events-none transition-all group-hover:bg-[#D4F268]" style={{ width: `${((maxMembers - 10) / 90) * 100}%` }} />

                                                            <input
                                                                type="range"
                                                                min="10"
                                                                max="100"
                                                                step="10"
                                                                value={maxMembers}
                                                                onChange={(e) => setMaxMembers(Number(e.target.value))}
                                                                className="relative w-full h-8 opacity-0 cursor-pointer z-10"
                                                            />
                                                            {/* Custom Thumb */}
                                                            <div
                                                                className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white border-4 border-[#1A1A1A] rounded-full pointer-events-none shadow-lg transition-transform group-hover:scale-110 flex items-center justify-center"
                                                                style={{ left: `calc(${((maxMembers - 10) / 90) * 100}% - 16px)` }}
                                                            >
                                                                <div className="w-2 h-2 bg-[#D4F268] rounded-full" />
                                                            </div>
                                                        </div>
                                                        <div className="flex justify-between text-[10px] font-bold text-zinc-400 px-2 uppercase tracking-widest">
                                                            <span>Cozy (10)</span>
                                                            <span>Massive (100)</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}

                                    </AnimatePresence>
                                </div>

                                {/* Preview Card Right Side */}
                                <div className="w-full lg:w-5/12 p-6 sm:p-10 flex flex-col justify-center relative overflow-hidden hidden sm:flex">
                                    {/* Spotlight Effects */}
                                    <motion.div
                                        className="absolute -top-32 -right-32 w-96 h-96 bg-[#D4F268]/30 rounded-full blur-[100px]"
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                    />

                                    <div className="relative z-10 w-full flex flex-col items-center">
                                        <h4 className="text-[10px] sm:text-xs font-black text-zinc-400 mb-8 uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-8 h-px bg-zinc-300" />
                                            Live Preview
                                            <span className="w-8 h-px bg-zinc-300" />
                                        </h4>

                                        <div className="w-full transform transition-all duration-500 hover:scale-105 hover:-rotate-1">
                                            <div className="shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] rounded-[2rem] bg-white ring-1 ring-zinc-200">
                                                <StudyCircleCard
                                                    circle={{
                                                        ...previewCircle,
                                                        name: `${emoji} ${previewCircle.name}` // Prepend emoji to name for preview since our current Card doesn't have an emoji slot
                                                    }}
                                                    onJoin={() => { }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Bottom Navigation / Actions */}
                        <div className="flex-shrink-0 px-6 py-5 sm:px-10 sm:py-6 border-t border-zinc-100 bg-white flex flex-col-reverse sm:flex-row items-center justify-between gap-4 relative z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                            <button
                                onClick={onClose}
                                className="text-sm font-bold text-zinc-400 hover:text-[#1A1A1A] transition-colors"
                            >
                                Cancel Setup
                            </button>

                            <div className="flex gap-3 w-full sm:w-auto">
                                {step > 1 && (
                                    <Button
                                        onClick={() => setStep(step - 1)}
                                        className="px-6 py-4 rounded-2xl sm:rounded-[1.5rem] bg-zinc-100 text-[#1A1A1A] hover:bg-zinc-200 font-bold text-sm sm:text-base transition-all active:scale-95"
                                    >
                                        Back
                                    </Button>
                                )}

                                {step < 3 ? (
                                    <Button
                                        onClick={() => setStep(step + 1)}
                                        disabled={nextDisabled}
                                        className="w-full sm:w-auto px-8 sm:px-12 py-4 rounded-2xl sm:rounded-[1.5rem] bg-[#1A1A1A] text-white hover:bg-black hover:shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:-translate-y-1 font-black text-sm sm:text-base disabled:opacity-50 disabled:hover:translate-y-0 disabled:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2 group"
                                    >
                                        Next
                                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleCreate}
                                        className="w-full sm:w-auto px-8 sm:px-12 py-4 rounded-2xl sm:rounded-[1.5rem] bg-[#D4F268] text-[#1A1A1A] hover:bg-[#cbf046] hover:shadow-[0_10px_40px_rgba(212,242,104,0.4)] hover:-translate-y-1 font-black text-sm sm:text-base transition-all active:scale-95 flex items-center justify-center gap-2 group border border-white/50"
                                    >
                                        <Check size={20} className="group-hover:scale-125 transition-transform" />
                                        Launch Circle
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
