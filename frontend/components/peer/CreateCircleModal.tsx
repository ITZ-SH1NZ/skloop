"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StudyCircleCard, StudyCircle } from "@/components/peer/StudyCircleCard";

interface CreateCircleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (circle: Omit<StudyCircle, "id" | "memberCount" | "isJoined">) => void;
}

const TOPIC_OPTIONS = ["Frontend", "Backend", "Design", "Data Science", "Algorithms", "Startup", "System", "Mobile"];
const POPULAR_TAGS = ["react", "javascript", "python", "ai", "leetcode", "dsa", "figma", "ui", "ux", "typescript", "nextjs", "rust"];

export function CreateCircleModal({ isOpen, onClose, onCreate }: CreateCircleModalProps) {
    const [name, setName] = useState("");
    const [topic, setTopic] = useState("Frontend");
    const [description, setDescription] = useState("");
    const [maxMembers, setMaxMembers] = useState(50);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");

    const handleAddTag = (tag: string) => {
        const cleanTag = tag.toLowerCase().trim();
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
        });

        // Reset form
        setName("");
        setTopic("Frontend");
        setDescription("");
        setMaxMembers(50);
        setTags([]);
        setTagInput("");
        onClose();
    };

    // Preview circle
    const previewCircle: StudyCircle = {
        id: "preview",
        name: name || "Your Circle Name",
        topic,
        description: description || "Add a description to help others understand what your circle is about...",
        memberCount: 1,
        maxMembers,
        tags: tags.length > 0 ? tags : ["tag1", "tag2"],
        isJoined: true,
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl my-auto pointer-events-auto flex flex-col max-h-[95vh] sm:max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-zinc-100 flex-shrink-0">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                                        <Sparkles size={20} className="text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black text-zinc-900">Create Study Circle</h2>
                                        <p className="text-sm text-zinc-500">Build your learning community</p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-full hover:bg-zinc-100 flex items-center justify-center transition-colors"
                                >
                                    <X size={20} className="text-zinc-500" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4 sm:p-6 overflow-y-auto flex-1">
                                {/* Form */}
                                <div className="space-y-5">
                                    {/* Name */}
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-900 mb-2">Circle Name *</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="e.g., React Beginners"
                                            maxLength={50}
                                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all"
                                        />
                                        <p className="text-xs text-zinc-400 mt-1">{name.length}/50</p>
                                    </div>

                                    {/* Topic */}
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-900 mb-2">Topic *</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {TOPIC_OPTIONS.map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => setTopic(t)}
                                                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${topic === t
                                                        ? "bg-purple-500 text-white shadow-md"
                                                        : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                                                        }`}
                                                >
                                                    {t}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-900 mb-2">Description *</label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="What will members learn and do in this circle?"
                                            maxLength={200}
                                            rows={4}
                                            className="w-full px-4 py-3 rounded-xl border border-zinc-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all resize-none"
                                        />
                                        <p className="text-xs text-zinc-400 mt-1">{description.length}/200</p>
                                    </div>

                                    {/* Max Members */}
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-900 mb-2">Max Members</label>
                                        <input
                                            type="range"
                                            min="10"
                                            max="100"
                                            step="10"
                                            value={maxMembers}
                                            onChange={(e) => setMaxMembers(Number(e.target.value))}
                                            className="w-full"
                                        />
                                        <p className="text-sm text-zinc-600 mt-1">{maxMembers} members</p>
                                    </div>

                                    {/* Tags */}
                                    <div>
                                        <label className="block text-sm font-bold text-zinc-900 mb-2">Tags * (max 5)</label>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {tags.map((tag) => (
                                                <motion.span
                                                    key={tag}
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium flex items-center gap-1"
                                                >
                                                    #{tag}
                                                    <button onClick={() => handleRemoveTag(tag)} className="hover:text-purple-900">
                                                        <X size={12} />
                                                    </button>
                                                </motion.span>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
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
                                                placeholder="Add a tag..."
                                                disabled={tags.length >= 5}
                                                className="flex-1 px-4 py-2 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all text-sm disabled:bg-zinc-50"
                                            />
                                            <Button
                                                onClick={() => handleAddTag(tagInput)}
                                                disabled={tags.length >= 5 || !tagInput.trim()}
                                                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Add
                                            </Button>
                                        </div>
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            <p className="text-xs text-zinc-400 w-full mb-1">Popular:</p>
                                            {POPULAR_TAGS.filter(t => !tags.includes(t)).slice(0, 6).map((tag) => (
                                                <button
                                                    key={tag}
                                                    onClick={() => handleAddTag(tag)}
                                                    disabled={tags.length >= 5}
                                                    className="px-2 py-1 rounded-md bg-zinc-50 hover:bg-zinc-100 text-[10px] text-zinc-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    #{tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Preview */}
                                <div className="hidden lg:block lg:sticky lg:top-0">
                                    <h3 className="text-sm font-bold text-zinc-900 mb-3">Preview</h3>
                                    <StudyCircleCard
                                        circle={previewCircle}
                                        onJoin={() => { }}
                                    />
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-6 border-t border-zinc-100 bg-zinc-50/50 flex-shrink-0">
                                <p className="text-xs text-zinc-500">* Required fields</p>
                                <div className="flex gap-3 w-full sm:w-auto">
                                    <Button
                                        onClick={onClose}
                                        className="flex-1 sm:flex-none px-6 py-3 rounded-full bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-medium"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        onClick={handleCreate}
                                        disabled={!name.trim() || !description.trim() || tags.length === 0}
                                        className="flex-1 sm:flex-none px-6 py-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:shadow-purple-500/30 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <Sparkles size={16} className="mr-2" />
                                        Create Circle
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
