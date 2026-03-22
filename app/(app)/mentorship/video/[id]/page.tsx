"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, Star, ThumbsUp, ThumbsDown, Trash2, Send, Loader2, Eye, Calendar,
    MessageSquare, Play, Video as VideoIcon, CheckCircle, ChevronDown, Sparkles, Flag, X, Upload, Link,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
    getVideoDetails, getVideoComments, getCommentReplies, submitVideoComment, submitReply,
    deleteVideoComment, voteOnComment, submitVideoRating, incrementVideoView, submitMentorReport,
    type VideoDetailData, type VideoComment,
} from "@/actions/mentorship-actions";
import { useUser } from "@/context/UserContext";
import { createClient } from "@/utils/supabase/client";
import dynamic from "next/dynamic";

const UserProfileModal = dynamic(() => import("@/components/profile/UserProfileModal"), { ssr: false });

// ─── Helpers ─────────────────────────────────────────────────────────────────

function extractYouTubeId(url: string): string | null {
    const regex = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    return url.match(regex)?.[1] ?? null;
}

function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const s = Math.floor(diff / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    const d = Math.floor(h / 24);
    if (d < 30) return `${d}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

// ─── Star components ──────────────────────────────────────────────────────────

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
    const [hover, setHover] = useState(0);
    const labels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];
    return (
        <div>
            <div className="flex gap-2 mb-2">
                {[1, 2, 3, 4, 5].map(star => (
                    <motion.button
                        key={star}
                        type="button"
                        whileHover={{ scale: 1.2 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={() => onChange(star)}
                        onMouseEnter={() => setHover(star)}
                        onMouseLeave={() => setHover(0)}
                    >
                        <Star
                            size={32}
                            className={`transition-all duration-100 ${
                                (hover || value) >= star
                                    ? "text-[#D4F268] fill-[#D4F268] drop-shadow-[0_0_8px_rgba(212,242,104,0.6)]"
                                    : "text-zinc-200 fill-zinc-200"
                            }`}
                        />
                    </motion.button>
                ))}
            </div>
            <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest h-4">
                {labels[hover || value]}
            </p>
        </div>
    );
}

function StarDisplay({ value, size = 14 }: { value: number; size?: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(star => (
                <Star
                    key={star}
                    size={size}
                    className={value >= star ? "text-[#D4F268] fill-[#D4F268]" : "text-zinc-200 fill-zinc-200"}
                />
            ))}
        </div>
    );
}

// ─── Auto-resize textarea ─────────────────────────────────────────────────────

function AutoResizeTextarea({ value, onChange, placeholder, maxLength, className, onKeyDown, autoFocus }: {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    maxLength?: number;
    className?: string;
    onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
    autoFocus?: boolean;
}) {
    const ref = useRef<HTMLTextAreaElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        el.style.height = "auto";
        const capped = el.scrollHeight > 180;
        el.style.height = Math.min(el.scrollHeight, 180) + "px";
        el.style.overflowY = capped ? "auto" : "hidden";
    }, [value]);
    return (
        <textarea
            ref={ref}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            maxLength={maxLength}
            rows={1}
            onKeyDown={onKeyDown}
            autoFocus={autoFocus}
            className={className}
            style={{ resize: "none" }}
            data-lenis-prevent
        />
    );
}

// ─── CommentItem (handles votes, reply thread, delete) ───────────────────────

function CommentItem({
    comment, sessionId, currentUserId, currentUserAvatar, currentUserName,
    onDelete, onVote, isReply = false,
}: {
    comment: VideoComment;
    sessionId: string;
    currentUserId?: string;
    currentUserAvatar?: string | null;
    currentUserName?: string;
    onDelete: (id: string) => void;
    onVote: (id: string, type: "like" | "dislike") => void;
    isReply?: boolean;
}) {
    const [replyOpen, setReplyOpen] = useState(false);
    const [repliesExpanded, setRepliesExpanded] = useState(false);
    const [replies, setReplies] = useState<VideoComment[]>([]);
    const [repliesLoading, setRepliesLoading] = useState(false);
    const [replyText, setReplyText] = useState("");
    const [isPosting, setIsPosting] = useState(false);

    const applyVoteOptimistic = (prev: VideoComment[], id: string, type: "like" | "dislike") =>
        prev.map(c => {
            if (c.id !== id) return c;
            const toggling = c.userVote === type;
            const switching = c.userVote !== null && c.userVote !== type;
            return {
                ...c,
                userVote: (toggling ? null : type) as "like" | "dislike" | null,
                likesCount: type === "like"
                    ? toggling ? c.likesCount - 1 : c.likesCount + 1
                    : switching ? c.likesCount - 1 : c.likesCount,
                dislikesCount: type === "dislike"
                    ? toggling ? c.dislikesCount - 1 : c.dislikesCount + 1
                    : switching ? c.dislikesCount - 1 : c.dislikesCount,
            };
        });

    const handleReplyVote = (id: string, type: "like" | "dislike") => {
        if (!currentUserId) return;
        setReplies(prev => applyVoteOptimistic(prev, id, type));
        voteOnComment(id, type);
    };

    const handleLoadReplies = async () => {
        if (repliesExpanded) { setRepliesExpanded(false); return; }
        setRepliesLoading(true);
        setReplies(await getCommentReplies(comment.id));
        setRepliesExpanded(true);
        setRepliesLoading(false);
    };

    const handlePostReply = async () => {
        if (!replyText.trim() || isPosting || !currentUserId) return;
        setIsPosting(true);
        const result = await submitReply(sessionId, replyText.trim(), comment.id);
        if (result.success) {
            setReplyText("");
            setReplyOpen(false);
            setReplies(await getCommentReplies(comment.id));
            setRepliesExpanded(true);
        }
        setIsPosting(false);
    };

    return (
        <div className="flex gap-3 group/comment">
            <Avatar
                src={comment.authorAvatar}
                fallback={comment.authorName.slice(0, 2).toUpperCase()}
                className={`rounded-[10px] shrink-0 mt-0.5 ${isReply ? "w-8 h-8" : "w-10 h-10"}`}
            />
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="font-black text-zinc-900 text-sm">{comment.authorName}</span>
                    <span className="bg-zinc-100 text-zinc-500 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wide">
                        Lv.{comment.authorLevel}
                    </span>
                    <span className="text-zinc-400 text-xs font-medium">{timeAgo(comment.createdAt)}</span>
                </div>

                <p className="text-zinc-600 text-sm font-medium leading-relaxed mb-2.5 break-words whitespace-pre-wrap">{comment.content}</p>

                {/* Action bar */}
                <div className="flex items-center gap-4">
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => onVote(comment.id, "like")} disabled={!currentUserId}
                        className={`flex items-center gap-1.5 text-xs font-bold transition-colors disabled:opacity-40 ${comment.userVote === "like" ? "text-[#5a6d1a]" : "text-zinc-400 hover:text-zinc-600"}`}
                    >
                        <ThumbsUp size={13} className={comment.userVote === "like" ? "fill-[#D4F268] text-[#D4F268]" : ""} />
                        {comment.likesCount > 0 && <span>{comment.likesCount}</span>}
                    </motion.button>

                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => onVote(comment.id, "dislike")} disabled={!currentUserId}
                        className={`flex items-center gap-1.5 text-xs font-bold transition-colors disabled:opacity-40 ${comment.userVote === "dislike" ? "text-red-500" : "text-zinc-400 hover:text-zinc-600"}`}
                    >
                        <ThumbsDown size={13} className={comment.userVote === "dislike" ? "fill-red-100 text-red-500" : ""} />
                        {comment.dislikesCount > 0 && <span>{comment.dislikesCount}</span>}
                    </motion.button>

                    {!isReply && currentUserId && (
                        <button onClick={() => setReplyOpen(v => !v)}
                            className="text-xs font-bold text-zinc-400 hover:text-zinc-700 transition-colors">
                            Reply
                        </button>
                    )}

                    {currentUserId === comment.authorId && (
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            onClick={() => onDelete(comment.id)}
                            className="opacity-0 group-hover/comment:opacity-100 transition-opacity flex items-center gap-1 text-xs font-bold text-zinc-300 hover:text-red-400"
                        >
                            <Trash2 size={12} /> Delete
                        </motion.button>
                    )}
                </div>

                {/* Inline reply form */}
                <AnimatePresence>
                    {replyOpen && (
                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }} className="overflow-hidden mt-3">
                            <div className="flex gap-2">
                                <Avatar src={currentUserAvatar ?? undefined} fallback={(currentUserName || "U").slice(0, 2).toUpperCase()}
                                    className="w-8 h-8 rounded-[10px] shrink-0 mt-1" />
                                <div className="flex-1">
                                    <AutoResizeTextarea value={replyText} onChange={e => setReplyText(e.target.value)}
                                        placeholder={`Reply to ${comment.authorName}...`}
                                        maxLength={2000} autoFocus
                                        className="w-full bg-zinc-50 border-2 border-zinc-200 focus:border-[#D4F268] rounded-xl px-4 py-2.5 text-zinc-900 text-sm font-medium outline-none transition-colors placeholder:text-zinc-400"
                                    />
                                    <div className="flex items-center justify-end gap-2 mt-1.5">
                                        <button onClick={() => { setReplyOpen(false); setReplyText(""); }}
                                            className="text-xs font-bold text-zinc-400 hover:text-zinc-600 px-3 py-1.5 transition-colors">
                                            Cancel
                                        </button>
                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            onClick={handlePostReply} disabled={!replyText.trim() || isPosting}
                                            className="flex items-center gap-1.5 bg-zinc-900 text-white px-4 py-1.5 rounded-lg font-black text-xs disabled:opacity-40 hover:bg-[#D4F268] hover:text-zinc-900 transition-all"
                                        >
                                            {isPosting ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
                                            Reply
                                        </motion.button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* View replies toggle */}
                {!isReply && comment.replyCount > 0 && (
                    <button onClick={handleLoadReplies}
                        className="mt-3 flex items-center gap-1.5 text-xs font-black text-[#5a6d1a] hover:text-zinc-600 transition-colors">
                        {repliesLoading
                            ? <Loader2 size={13} className="animate-spin" />
                            : <motion.span animate={{ rotate: repliesExpanded ? 180 : 0 }} transition={{ duration: 0.2 }} className="inline-flex">
                                <ChevronDown size={13} />
                              </motion.span>
                        }
                        {repliesExpanded
                            ? "Hide replies"
                            : `View ${comment.replyCount} repl${comment.replyCount > 1 ? "ies" : "y"}`}
                    </button>
                )}

                {/* Replies */}
                <AnimatePresence>
                    {repliesExpanded && replies.length > 0 && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="mt-4 space-y-4 border-l-2 border-zinc-100 pl-4">
                            {replies.map(reply => (
                                <CommentItem key={reply.id} comment={reply} sessionId={sessionId}
                                    currentUserId={currentUserId} currentUserAvatar={currentUserAvatar}
                                    currentUserName={currentUserName}
                                    onDelete={onDelete} onVote={handleReplyVote} isReply />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

// ─── Report Modal ─────────────────────────────────────────────────────────────

const REPORT_REASONS = [
    { value: "inappropriate_content", label: "Inappropriate Content" },
    { value: "misinformation",        label: "Misinformation" },
    { value: "harassment",            label: "Harassment" },
    { value: "spam",                  label: "Spam" },
    { value: "misleading_credentials", label: "Misleading Credentials" },
    { value: "other",                 label: "Other" },
] as const;

function ReportModal({
    sessionId, mentorId, mentorName,
    isOpen, onClose,
}: {
    sessionId: string; mentorId: string; mentorName: string;
    isOpen: boolean; onClose: () => void;
}) {
    const [reason, setReason] = useState("");
    const [description, setDescription] = useState("");
    const [evidenceMode, setEvidenceMode] = useState<"url" | "file">("url");
    const [evidenceUrl, setEvidenceUrl] = useState("");
    const [evidenceFile, setEvidenceFile] = useState<File | null>(null);
    const [evidencePreview, setEvidencePreview] = useState<string | null>(null);
    const [uploading, setUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 10 * 1024 * 1024) { setError("File must be under 10 MB"); return; }
        setEvidenceFile(file);
        setEvidenceUrl("");
        setError("");
        const reader = new FileReader();
        reader.onloadend = () => setEvidencePreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async () => {
        if (!reason) { setError("Please select a reason"); return; }
        if (description.length < 20) { setError("Description must be at least 20 characters"); return; }
        setIsSubmitting(true);
        setError("");

        let finalEvidenceUrl = evidenceMode === "url" ? evidenceUrl.trim() || undefined : undefined;

        if (evidenceMode === "file" && evidenceFile) {
            setUploading(true);
            const { createClient: createBrowserClient } = await import("@/utils/supabase/client");
            const supabase = createBrowserClient();
            const { data: { user: currentUser } } = await supabase.auth.getUser();
            const ext = evidenceFile.name.split(".").pop() || "png";
            const path = `${currentUser?.id ?? "anon"}/${sessionId}/${Date.now()}.${ext}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from("report-evidence")
                .upload(path, evidenceFile, { upsert: false });
            setUploading(false);
            if (uploadError) {
                setError("Upload failed: " + uploadError.message);
                setIsSubmitting(false);
                return;
            }
            const { data: { publicUrl } } = supabase.storage.from("report-evidence").getPublicUrl(uploadData.path);
            finalEvidenceUrl = publicUrl;
        }

        const result = await submitMentorReport({
            reportedMentorId: mentorId,
            sessionId,
            reason,
            description,
            evidenceUrl: finalEvidenceUrl,
        });

        if (result.success) {
            setSuccess(true);
        } else {
            setError(result.error || "Failed to submit report");
        }
        setIsSubmitting(false);
    };

    const resetAndClose = () => {
        setReason(""); setDescription(""); setEvidenceUrl(""); setEvidenceFile(null);
        setEvidencePreview(null); setError(""); setSuccess(false); setEvidenceMode("url");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4"
                    onClick={e => { if (e.target === e.currentTarget) resetAndClose(); }}
                >
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 16 }}
                        transition={{ type: "spring", bounce: 0.25, duration: 0.35 }}
                        className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        data-lenis-prevent
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-7 pt-7 pb-5 border-b border-zinc-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-[12px] bg-red-50 border border-red-100 flex items-center justify-center">
                                    <Flag size={18} className="text-red-500" />
                                </div>
                                <div>
                                    <h2 className="font-black text-zinc-900 text-lg leading-none">Report Mentor</h2>
                                    <p className="text-zinc-400 text-xs font-medium mt-0.5">{mentorName}</p>
                                </div>
                            </div>
                            <button onClick={resetAndClose} className="w-9 h-9 rounded-xl hover:bg-zinc-100 flex items-center justify-center transition-colors">
                                <X size={18} className="text-zinc-400" />
                            </button>
                        </div>

                        <div className="px-7 py-6 space-y-5">
                            {success ? (
                                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-8">
                                    <div className="w-16 h-16 rounded-full bg-[#D4F268]/20 border-2 border-[#D4F268] flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle size={30} className="text-[#5a6d1a] fill-[#D4F268]" />
                                    </div>
                                    <h3 className="font-black text-zinc-900 text-xl mb-2">Report Submitted</h3>
                                    <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-6">
                                        Our team will review your report and take appropriate action. Thank you for helping keep Skloop safe.
                                    </p>
                                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                        onClick={resetAndClose}
                                        className="bg-zinc-900 text-white px-8 py-2.5 rounded-xl font-black text-sm hover:bg-[#D4F268] hover:text-zinc-900 transition-all"
                                    >
                                        Done
                                    </motion.button>
                                </motion.div>
                            ) : (
                                <>
                                    {/* Reason */}
                                    <div>
                                        <label className="block text-xs font-black text-zinc-700 uppercase tracking-widest mb-2">
                                            Reason <span className="text-red-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {REPORT_REASONS.map(r => (
                                                <button key={r.value} type="button"
                                                    onClick={() => setReason(r.value)}
                                                    className={`px-3 py-2.5 rounded-xl text-xs font-bold text-left border-2 transition-all ${
                                                        reason === r.value
                                                            ? "border-red-400 bg-red-50 text-red-700"
                                                            : "border-zinc-200 bg-zinc-50 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-100"
                                                    }`}
                                                >
                                                    {r.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-xs font-black text-zinc-700 uppercase tracking-widest mb-2">
                                            Description <span className="text-red-500">*</span>
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            placeholder="Describe what happened in detail. Minimum 20 characters..."
                                            rows={4}
                                            maxLength={2000}
                                            data-lenis-prevent
                                            className="w-full bg-zinc-50 border-2 border-zinc-200 focus:border-red-400 rounded-xl px-4 py-3 text-zinc-900 text-sm font-medium outline-none resize-none transition-colors placeholder:text-zinc-400"
                                        />
                                        <p className={`text-xs font-bold mt-1 ${description.length < 20 && description.length > 0 ? "text-red-400" : "text-zinc-400"}`}>
                                            {description.length}/2000 {description.length < 20 && description.length > 0 ? `(${20 - description.length} more needed)` : ""}
                                        </p>
                                    </div>

                                    {/* Evidence */}
                                    <div>
                                        <label className="block text-xs font-black text-zinc-700 uppercase tracking-widest mb-2">
                                            Evidence <span className="text-zinc-400 font-medium normal-case tracking-normal">(optional but recommended)</span>
                                        </label>

                                        {/* Mode toggle */}
                                        <div className="flex gap-2 mb-3">
                                            <button type="button" onClick={() => { setEvidenceMode("url"); setEvidenceFile(null); setEvidencePreview(null); }}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                                    evidenceMode === "url"
                                                        ? "border-zinc-400 bg-zinc-900 text-white"
                                                        : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
                                                }`}>
                                                <Link size={12} /> URL Link
                                            </button>
                                            <button type="button" onClick={() => { setEvidenceMode("file"); setEvidenceUrl(""); }}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                                                    evidenceMode === "file"
                                                        ? "border-zinc-400 bg-zinc-900 text-white"
                                                        : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
                                                }`}>
                                                <Upload size={12} /> Upload Screenshot
                                            </button>
                                        </div>

                                        {evidenceMode === "url" ? (
                                            <input
                                                type="url"
                                                value={evidenceUrl}
                                                onChange={e => setEvidenceUrl(e.target.value)}
                                                placeholder="https://imgur.com/... or any screenshot URL"
                                                className="w-full bg-zinc-50 border-2 border-zinc-200 focus:border-zinc-400 rounded-xl px-4 py-3 text-zinc-900 text-sm font-medium outline-none transition-colors placeholder:text-zinc-400"
                                            />
                                        ) : (
                                            <div>
                                                <input ref={fileInputRef} type="file" accept="image/*,.pdf" onChange={handleFileChange} className="hidden" />
                                                {evidencePreview ? (
                                                    <div className="relative rounded-xl overflow-hidden border-2 border-zinc-200">
                                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                                        <img src={evidencePreview} alt="Evidence preview" className="w-full max-h-40 object-contain bg-zinc-50" />
                                                        <button
                                                            type="button"
                                                            onClick={() => { setEvidenceFile(null); setEvidencePreview(null); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                                                            className="absolute top-2 right-2 w-7 h-7 rounded-lg bg-white/90 flex items-center justify-center shadow border border-zinc-200 hover:bg-red-50"
                                                        >
                                                            <X size={13} className="text-zinc-500" />
                                                        </button>
                                                        <div className="absolute bottom-0 left-0 right-0 bg-white/90 px-3 py-1.5">
                                                            <p className="text-xs font-bold text-zinc-600 truncate">{evidenceFile?.name}</p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <motion.button type="button" whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="w-full border-2 border-dashed border-zinc-300 hover:border-zinc-400 rounded-xl py-8 flex flex-col items-center gap-2 transition-colors group"
                                                    >
                                                        <Upload size={22} className="text-zinc-300 group-hover:text-zinc-400 transition-colors" />
                                                        <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-500">Click to upload a screenshot</span>
                                                        <span className="text-[10px] text-zinc-300 font-medium">PNG, JPG, GIF, PDF · max 10 MB</span>
                                                    </motion.button>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {error && (
                                        <p className="text-red-500 text-xs font-bold bg-red-50 border border-red-100 rounded-xl px-4 py-3">{error}</p>
                                    )}

                                    <div className="flex gap-3 pt-1">
                                        <button onClick={resetAndClose}
                                            className="flex-1 h-12 rounded-xl font-bold text-sm text-zinc-500 hover:bg-zinc-100 transition-colors border-2 border-zinc-200">
                                            Cancel
                                        </button>
                                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                            onClick={handleSubmit}
                                            disabled={!reason || description.length < 20 || isSubmitting}
                                            className="flex-1 h-12 rounded-xl font-black text-sm bg-red-500 text-white hover:bg-red-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                                        >
                                            {(isSubmitting || uploading) && <Loader2 size={15} className="animate-spin" />}
                                            {uploading ? "Uploading..." : isSubmitting ? "Submitting..." : "Submit Report"}
                                        </motion.button>
                                    </div>
                                </>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VideoDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { profile } = useUser();
    const sessionId = params.id as string;

    // Data
    const [data, setData] = useState<VideoDetailData | null>(null);
    const [comments, setComments] = useState<VideoComment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [commentsLoading, setCommentsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    // Video player
    const [showPlayer, setShowPlayer] = useState(false);

    // Rating
    const [myRating, setMyRating] = useState(0);
    const [myRatingComment, setMyRatingComment] = useState("");
    const [isSubmittingRating, setIsSubmittingRating] = useState(false);
    const [ratingSubmitted, setRatingSubmitted] = useState(false);
    const [ratingError, setRatingError] = useState("");

    // Comments
    const [commentText, setCommentText] = useState("");
    const [isPostingComment, setIsPostingComment] = useState(false);
    const [commentPage, setCommentPage] = useState(0);
    const [hasMoreComments, setHasMoreComments] = useState(false);

    // Profile modal
    const [profileUserId, setProfileUserId] = useState<string | null>(null);

    // Report modal
    const [reportModalOpen, setReportModalOpen] = useState(false);

    // Loopy AI
    const [loopyMessages, setLoopyMessages] = useState<Array<{ role: "user" | "assistant"; content: string; mood?: string }>>([]);
    const [loopyInput, setLoopyInput] = useState("");
    const [loopyLoading, setLoopyLoading] = useState(false);
    const loopyBottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsLoading(true);
        getVideoDetails(sessionId).then(result => {
            if (!result) {
                setNotFound(true);
            } else {
                setData(result);
                if (result.userReview) {
                    setMyRating(result.userReview.rating);
                    setMyRatingComment(result.userReview.comment || "");
                    setRatingSubmitted(true);
                }
            }
            setIsLoading(false);
        });

        // Only count one view per browser session per video
        const key = `viewed:${sessionId}`;
        if (!sessionStorage.getItem(key)) {
            sessionStorage.setItem(key, "1");
            incrementVideoView(sessionId);
        }
    }, [sessionId]);

    useEffect(() => {
        setCommentsLoading(true);
        getVideoComments(sessionId, 0).then(result => {
            setComments(result);
            setHasMoreComments(result.length === 20);
            setCommentsLoading(false);
        });

        // Realtime: subscribe to new/deleted comments on this video
        const supabase = createClient();
        const channel = supabase
            .channel(`video_comments:${sessionId}`)
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "video_comments", filter: `session_id=eq.${sessionId}` },
                () => {
                    // Re-fetch from page 0 to keep comment list in sync
                    getVideoComments(sessionId, 0).then(fresh => {
                        setComments(fresh);
                        setCommentPage(0);
                        setHasMoreComments(fresh.length === 20);
                    });
                    // Also refresh total count in session data
                    setData(prev => prev ? { ...prev, totalComments: prev.totalComments } : prev);
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [sessionId]);

    const handleSubmitRating = async () => {
        if (myRating === 0) return;
        setIsSubmittingRating(true);
        setRatingError("");
        const result = await submitVideoRating(sessionId, myRating, myRatingComment || undefined);
        if (result.success) {
            setRatingSubmitted(true);
            const refreshed = await getVideoDetails(sessionId);
            if (refreshed) setData(refreshed);
        } else {
            setRatingError(result.error || "Failed to submit rating.");
        }
        setIsSubmittingRating(false);
    };

    const handlePostComment = async () => {
        if (!commentText.trim() || isPostingComment) return;
        setIsPostingComment(true);
        const result = await submitVideoComment(sessionId, commentText);
        if (result.success) {
            setCommentText("");
            const refreshed = await getVideoComments(sessionId, 0);
            setComments(refreshed);
            setCommentPage(0);
            if (data) setData({ ...data, totalComments: data.totalComments + 1 });
        }
        setIsPostingComment(false);
    };

    const handleDeleteComment = async (commentId: string) => {
        const result = await deleteVideoComment(commentId);
        if (result.success) {
            setComments(prev => prev.filter(c => c.id !== commentId));
            if (data) setData({ ...data, totalComments: Math.max(0, data.totalComments - 1) });
        }
    };

    const handleVote = async (commentId: string, type: "like" | "dislike") => {
        if (!profile) return;
        setComments(prev => prev.map(c => {
            if (c.id !== commentId) return c;
            const toggling = c.userVote === type;
            const switching = c.userVote !== null && c.userVote !== type;
            return {
                ...c,
                userVote: (toggling ? null : type) as "like" | "dislike" | null,
                likesCount: type === "like"
                    ? toggling ? c.likesCount - 1 : c.likesCount + 1
                    : switching ? c.likesCount - 1 : c.likesCount,
                dislikesCount: type === "dislike"
                    ? toggling ? c.dislikesCount - 1 : c.dislikesCount + 1
                    : switching ? c.dislikesCount - 1 : c.dislikesCount,
            };
        }));
        await voteOnComment(commentId, type);
    };

    const askLoopy = async (message: string) => {
        if (!message.trim() || loopyLoading || !data) return;
        const userMsg = { role: "user" as const, content: message };
        setLoopyMessages(prev => [...prev, userMsg]);
        setLoopyInput("");
        setLoopyLoading(true);
        try {
            const res = await fetch("/api/loopy-video", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message,
                    history: loopyMessages,
                    videoContext: {
                        title: data.session.title,
                        topic: data.session.topic,
                        description: data.session.description,
                        mentorName: data.mentor.name,
                    },
                }),
            });
            const json = await res.json();
            if (json.error) throw new Error(json.error);
            setLoopyMessages(prev => [...prev, { role: "assistant", content: json.content, mood: json.mood }]);
        } catch (err: any) {
            setLoopyMessages(prev => [...prev, { role: "assistant", content: "Oops — something went wrong. Try again!", mood: "annoyed" }]);
        }
        setLoopyLoading(false);
        setTimeout(() => loopyBottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    };

    const loadMoreComments = async () => {
        const nextPage = commentPage + 1;
        const more = await getVideoComments(sessionId, nextPage);
        setComments(prev => [...prev, ...more]);
        setCommentPage(nextPage);
        setHasMoreComments(more.length === 20);
    };

    // ── Loading / Not Found states ──────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-[#D4F268]" />
            </div>
        );
    }

    if (notFound || !data) {
        return (
            <div className="min-h-screen bg-[#FAFAFA] flex flex-col items-center justify-center gap-6">
                <VideoIcon size={64} className="text-zinc-200" />
                <h1 className="text-3xl font-black text-zinc-900">Video not found</h1>
                <Button
                    onClick={() => router.push("/mentorship/find")}
                    className="bg-zinc-900 text-white rounded-2xl px-8 h-12 font-bold"
                >
                    Back to Library
                </Button>
            </div>
        );
    }

    const { session, mentor, userReview, ratingDistribution, recentReviews, totalComments } = data;
    const ytId = extractYouTubeId(session.videoUrl || "");
    const isPremiering = session.premiereAt && new Date(session.premiereAt) > new Date();

    return (
        <div className="min-h-screen bg-[#FAFAFA] font-sans">

            {/* ── Sticky top nav bar ──────────────────────────────────────────── */}
            <div className="bg-zinc-900 px-6 md:px-10 py-5 flex items-center gap-3 sticky top-0 z-40 border-b border-white/5 backdrop-blur-xl">
                <motion.button
                    whileHover={{ scale: 1.05, x: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-zinc-400 hover:text-[#D4F268] transition-colors font-bold text-sm group shrink-0"
                >
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back
                </motion.button>
                <div className="w-px h-5 bg-zinc-700 shrink-0" />
                <span className="text-zinc-500 text-sm font-medium shrink-0">Video Library</span>
                <span className="text-zinc-700 shrink-0">/</span>
                <span className="text-white text-sm font-bold truncate">{session.title}</span>
            </div>

            {/* ── Main content ───────────────────────────────────────────────── */}
            <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-10">
                <div className="flex flex-col lg:flex-row gap-10">

                    {/* ══════════════════════════════════════════
                        LEFT COLUMN — video, info, reviews, comments
                    ══════════════════════════════════════════ */}
                    <div className="flex-1 min-w-0">

                        {/* Video Player */}
                        <div className="aspect-video bg-zinc-950 rounded-[2rem] overflow-hidden relative shadow-2xl mb-8 group">
                            {showPlayer && ytId ? (
                                <iframe
                                    src={`https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                                    className="absolute inset-0 w-full h-full border-0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    sandbox="allow-scripts allow-same-origin allow-presentation"
                                />
                            ) : (
                                <>
                                    {session.thumbnailUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={session.thumbnailUrl}
                                            alt={session.title}
                                            className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-zinc-800 flex items-center justify-center">
                                            <VideoIcon size={64} className="text-zinc-600" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-zinc-950/10 to-transparent" />

                                    {/* Play / Premiere overlay */}
                                    {isPremiering ? (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="bg-[#D4F268] text-zinc-900 px-8 py-4 rounded-2xl font-black text-lg shadow-2xl animate-pulse">
                                                Premieres {new Date(session.premiereAt!).toLocaleDateString()}
                                            </div>
                                        </div>
                                    ) : ytId ? (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                onClick={() => setShowPlayer(true)}
                                                className="w-24 h-24 rounded-full bg-[#D4F268] flex items-center justify-center shadow-[0_20px_60px_rgba(212,242,104,0.5)] hover:shadow-[0_20px_80px_rgba(212,242,104,0.7)] transition-shadow"
                                            >
                                                <Play size={36} className="text-zinc-900 fill-zinc-900 ml-1" />
                                            </motion.button>
                                        </div>
                                    ) : session.videoUrl ? (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <motion.a
                                                href={session.videoUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="w-24 h-24 rounded-full bg-[#D4F268] flex items-center justify-center shadow-[0_20px_60px_rgba(212,242,104,0.5)]"
                                            >
                                                <Play size={36} className="text-zinc-900 fill-zinc-900 ml-1" />
                                            </motion.a>
                                        </div>
                                    ) : null}

                                    {/* Bottom meta overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {session.topic && (
                                                <span className="bg-white/15 backdrop-blur-sm text-white/90 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border border-white/20">
                                                    {session.topic}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-4 text-white/60 text-xs font-bold">
                                            <span className="flex items-center gap-1.5">
                                                <Eye size={13} /> {session.viewCount.toLocaleString()}
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <Calendar size={13} />
                                                {new Date(session.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Title + quick stats */}
                        <div className="mb-8">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                {session.avgRating !== null && (
                                    <div className="flex items-center gap-1.5 bg-[#D4F268]/15 border border-[#D4F268]/30 px-3 py-1.5 rounded-xl">
                                        <Star size={13} className="text-[#D4F268] fill-[#D4F268]" />
                                        <span className="text-sm font-black text-zinc-800">{session.avgRating}</span>
                                        <span className="text-xs font-bold text-zinc-500">({session.reviewCount})</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-bold">
                                    <MessageSquare size={13} />
                                    <span>{totalComments} comment{totalComments !== 1 ? "s" : ""}</span>
                                </div>
                            </div>
                            <h1 className="text-3xl md:text-4xl font-black text-zinc-900 tracking-tighter leading-tight mb-4">
                                {session.title}
                            </h1>
                            {session.description && (
                                <p className="text-zinc-500 text-base font-medium leading-relaxed max-w-3xl">
                                    {session.description}
                                </p>
                            )}
                        </div>

                        {/* ── Loopy AI Panel ─────────────────────────────── */}
                        <div className="bg-white rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-zinc-100/60 mb-6 overflow-hidden">
                            {/* Header */}
                            <div className="bg-zinc-900 px-7 py-5 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-[10px] bg-[#D4F268] flex items-center justify-center shrink-0">
                                    <Sparkles size={18} className="text-zinc-900" />
                                </div>
                                <div>
                                    <h2 className="font-black text-white text-base tracking-tight">Ask Loopy</h2>
                                    <p className="text-zinc-400 text-xs font-medium">AI assistant for this video</p>
                                </div>
                            </div>

                            <div className="p-7">
                                {/* Messages */}
                                {loopyMessages.length === 0 ? (
                                    <div className="text-center py-6">
                                        <p className="text-zinc-400 text-sm font-medium mb-5">
                                            Get a quick summary, ask questions about the topic, or dive deeper into anything covered.
                                        </p>
                                        <div className="flex flex-wrap gap-2 justify-center">
                                            {[
                                                "Summarize this video for me",
                                                `What do I need to know before watching?`,
                                                `What should I study after this?`,
                                            ].map(q => (
                                                <motion.button key={q} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                                                    onClick={() => askLoopy(q)} disabled={!profile || loopyLoading}
                                                    className="bg-zinc-50 border border-zinc-200 text-zinc-700 px-4 py-2 rounded-xl text-xs font-bold hover:border-[#D4F268] hover:bg-[#D4F268]/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed text-left"
                                                >
                                                    {q}
                                                </motion.button>
                                            ))}
                                        </div>
                                        {!profile && <p className="text-zinc-400 text-xs font-medium mt-4">Sign in to use Loopy</p>}
                                    </div>
                                ) : (
                                    <div className="max-h-[360px] overflow-y-auto space-y-4 mb-4 pr-1" data-lenis-prevent>
                                        {loopyMessages.map((msg, i) => (
                                            <div key={i} className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                                                {msg.role === "assistant" && (
                                                    <div className="w-8 h-8 rounded-[10px] bg-zinc-900 flex items-center justify-center shrink-0 mt-0.5">
                                                        <Sparkles size={14} className="text-[#D4F268]" />
                                                    </div>
                                                )}
                                                <div className={`max-w-[82%] rounded-2xl px-4 py-3 text-sm font-medium leading-relaxed whitespace-pre-wrap ${
                                                    msg.role === "user"
                                                        ? "bg-zinc-900 text-white rounded-tr-sm"
                                                        : "bg-zinc-50 text-zinc-700 border border-zinc-100 rounded-tl-sm"
                                                }`}>
                                                    {msg.content}
                                                </div>
                                            </div>
                                        ))}
                                        {loopyLoading && (
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 rounded-[10px] bg-zinc-900 flex items-center justify-center shrink-0">
                                                    <Sparkles size={14} className="text-[#D4F268]" />
                                                </div>
                                                <div className="bg-zinc-50 border border-zinc-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                                                    {[0, 1, 2].map(i => (
                                                        <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-zinc-300"
                                                            animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, delay: i * 0.15, repeat: Infinity }} />
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        <div ref={loopyBottomRef} />
                                    </div>
                                )}

                                {/* Input */}
                                {profile && (
                                    <div className="flex gap-2 mt-2">
                                        <AutoResizeTextarea
                                            value={loopyInput}
                                            onChange={e => setLoopyInput(e.target.value)}
                                            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); askLoopy(loopyInput); } }}
                                            placeholder="Ask anything about this video…"
                                            maxLength={500}
                                            className="flex-1 bg-zinc-50 border-2 border-zinc-200 focus:border-[#D4F268] rounded-xl px-4 py-2.5 text-zinc-900 text-sm font-medium outline-none transition-colors placeholder:text-zinc-400"
                                        />
                                        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                            onClick={() => askLoopy(loopyInput)}
                                            disabled={!loopyInput.trim() || loopyLoading}
                                            className="shrink-0 w-11 h-11 rounded-xl bg-zinc-900 text-white flex items-center justify-center hover:bg-[#D4F268] hover:text-zinc-900 transition-all disabled:opacity-40 disabled:cursor-not-allowed self-end"
                                        >
                                            {loopyLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={15} />}
                                        </motion.button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Ratings breakdown */}
                        {session.reviewCount > 0 && (
                            <div className="bg-white rounded-[2rem] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-zinc-100/60 mb-6">
                                <h2 className="text-xl font-black text-zinc-900 mb-6 tracking-tight">Ratings Breakdown</h2>
                                <div className="flex gap-8 items-center">
                                    <div className="text-center shrink-0">
                                        <div className="text-6xl font-black text-zinc-900 leading-none mb-2">
                                            {session.avgRating}
                                        </div>
                                        <StarDisplay value={Math.round(session.avgRating || 0)} size={18} />
                                        <div className="text-zinc-400 text-sm font-bold mt-2">
                                            {session.reviewCount} review{session.reviewCount !== 1 ? "s" : ""}
                                        </div>
                                    </div>
                                    <div className="flex-1 space-y-2.5">
                                        {[5, 4, 3, 2, 1].map(star => {
                                            const count = ratingDistribution[star as keyof typeof ratingDistribution] ?? 0;
                                            const pct = session.reviewCount > 0
                                                ? Math.round((count / session.reviewCount) * 100)
                                                : 0;
                                            return (
                                                <div key={star} className="flex items-center gap-3">
                                                    <div className="flex items-center gap-1 w-12 shrink-0">
                                                        <span className="text-xs font-black text-zinc-700">{star}</span>
                                                        <Star size={11} className="text-[#D4F268] fill-[#D4F268]" />
                                                    </div>
                                                    <div className="flex-1 h-2.5 bg-zinc-100 rounded-full overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${pct}%` }}
                                                            transition={{ duration: 0.8, delay: (5 - star) * 0.08, ease: "easeOut" }}
                                                            className="h-full bg-[#D4F268] rounded-full"
                                                        />
                                                    </div>
                                                    <span className="text-xs font-bold text-zinc-400 w-8 text-right shrink-0">
                                                        {pct}%
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Review snippets */}
                        {recentReviews.filter(r => r.comment).length > 0 && (
                            <div className="bg-white rounded-[2rem] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-zinc-100/60 mb-6">
                                <h2 className="text-xl font-black text-zinc-900 mb-6 tracking-tight">What people are saying</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {recentReviews.filter(r => r.comment).map((review, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="bg-zinc-50 rounded-2xl p-5 border border-zinc-100"
                                        >
                                            <div className="flex items-center gap-3 mb-3">
                                                <Avatar
                                                    src={review.reviewerAvatar}
                                                    fallback={(review.reviewerName || "U").slice(0, 2).toUpperCase()}
                                                    className="w-9 h-9 rounded-[10px]"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-black text-zinc-900 truncate">{review.reviewerName}</div>
                                                    <div className="text-[10px] text-zinc-400 font-bold">{timeAgo(review.createdAt)}</div>
                                                </div>
                                                <StarDisplay value={review.rating} size={12} />
                                            </div>
                                            <p className="text-zinc-600 text-sm font-medium leading-relaxed line-clamp-3">
                                                &ldquo;{review.comment}&rdquo;
                                            </p>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Comments section */}
                        <div className="bg-white rounded-[2rem] p-8 shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-zinc-100/60">
                            <h2 className="text-xl font-black text-zinc-900 mb-6 tracking-tight flex items-center gap-2">
                                <MessageSquare size={20} className="text-zinc-400" />
                                {totalComments} Comment{totalComments !== 1 ? "s" : ""}
                            </h2>

                            {/* Comment input */}
                            {profile ? (
                                <div className="flex gap-3 mb-8">
                                    <Avatar
                                        src={profile.avatar_url ?? undefined}
                                        fallback={(profile.full_name || profile.username || "U").slice(0, 2).toUpperCase()}
                                        className="w-10 h-10 rounded-[10px] shrink-0 mt-1"
                                    />
                                    <div className="flex-1">
                                        <AutoResizeTextarea
                                            value={commentText}
                                            onChange={e => setCommentText(e.target.value)}
                                            placeholder="Share your thoughts..."
                                            maxLength={2000}
                                            className="w-full bg-zinc-50 border-2 border-zinc-200 focus:border-[#D4F268] rounded-xl px-5 py-4 text-zinc-900 font-medium text-sm outline-none transition-colors placeholder:text-zinc-400"
                                        />
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-zinc-400 font-medium">{commentText.length}/2000</span>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={handlePostComment}
                                                disabled={!commentText.trim() || isPostingComment}
                                                className="flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-xl font-black text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#D4F268] hover:text-zinc-900 transition-all"
                                            >
                                                {isPostingComment
                                                    ? <Loader2 size={15} className="animate-spin" />
                                                    : <Send size={15} />
                                                }
                                                Post
                                            </motion.button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-zinc-50 rounded-2xl p-5 mb-8 text-center border border-zinc-200">
                                    <p className="text-zinc-500 font-medium text-sm">Sign in to leave a comment</p>
                                </div>
                            )}

                            {/* Comment list */}
                            {commentsLoading ? (
                                <div className="flex justify-center py-10">
                                    <Loader2 className="w-8 h-8 animate-spin text-zinc-200" />
                                </div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-12">
                                    <MessageSquare size={40} className="text-zinc-200 mx-auto mb-3" />
                                    <p className="text-zinc-400 font-medium text-sm">No comments yet. Be the first!</p>
                                </div>
                            ) : (
                                <div className="max-h-[560px] overflow-y-auto pr-1 space-y-6 scrollbar-thin scrollbar-thumb-zinc-200 scrollbar-track-transparent" data-lenis-prevent>
                                    {comments.map((comment, i) => (
                                        <motion.div key={comment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}>
                                            <CommentItem
                                                comment={comment}
                                                sessionId={sessionId}
                                                currentUserId={profile?.id}
                                                currentUserAvatar={profile?.avatar_url}
                                                currentUserName={profile?.full_name || profile?.username || ""}
                                                onDelete={handleDeleteComment}
                                                onVote={handleVote}
                                            />
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {hasMoreComments && (
                                <div className="mt-8 flex justify-center">
                                    <Button
                                        onClick={loadMoreComments}
                                        variant="ghost"
                                        className="text-zinc-500 font-bold hover:bg-zinc-100 rounded-xl px-6 h-11 flex items-center gap-2"
                                    >
                                        <ChevronDown size={16} /> Load more comments
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ══════════════════════════════════════════
                        RIGHT SIDEBAR — mentor card + rating form
                    ══════════════════════════════════════════ */}
                    <div className="lg:w-[380px] shrink-0 space-y-6 lg:sticky lg:top-[80px] lg:h-fit">

                        {/* Mentor card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ type: "spring", bounce: 0.3, delay: 0.1 }}
                            className="bg-white rounded-[2rem] p-7 shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-zinc-100/60 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-[#D4F268]/20 to-transparent rounded-full blur-[50px] pointer-events-none" />

                            <div className="flex items-start gap-4 mb-5 relative z-10">
                                <div className="relative shrink-0">
                                    <Avatar
                                        src={mentor.avatarUrl}
                                        fallback={mentor.name.slice(0, 2).toUpperCase()}
                                        className="w-16 h-16 rounded-[16px] border-4 border-white shadow-lg"
                                    />
                                    <div className="absolute -bottom-1 -right-1 bg-zinc-900 rounded-full p-1 border-2 border-white">
                                        <CheckCircle size={12} className="text-[#D4F268] fill-[#D4F268]" />
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <h3 className="font-black text-zinc-900 text-lg leading-tight">{mentor.name}</h3>
                                    {mentor.headline && (
                                        <p className="text-[#5a6d1a] text-xs font-black uppercase tracking-widest bg-[#D4F268]/15 inline-block px-2.5 py-1 rounded-full mt-1">
                                            {mentor.headline}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {mentor.bio && (
                                <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-5 relative z-10 line-clamp-3">
                                    {mentor.bio}
                                </p>
                            )}

                            <div className="flex items-center gap-6 mb-5 relative z-10">
                                <div>
                                    <div className="text-xl font-black text-zinc-900 flex items-center gap-1">
                                        <Star size={15} className="text-[#D4F268] fill-[#D4F268]" />
                                        {mentor.avgRating !== null ? mentor.avgRating : "New"}
                                    </div>
                                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Avg Rating</div>
                                </div>
                                <div className="w-px h-8 bg-zinc-100" />
                                <div>
                                    <div className="text-xl font-black text-zinc-900">{mentor.reviewCount}</div>
                                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Reviews</div>
                                </div>
                            </div>

                            {mentor.skills.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-6 relative z-10">
                                    {mentor.skills.slice(0, 4).map(skill => (
                                        <span
                                            key={skill}
                                            className="bg-zinc-50 text-zinc-600 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-zinc-200 uppercase tracking-widest"
                                        >
                                            {skill}
                                        </span>
                                    ))}
                                    {mentor.skills.length > 4 && (
                                        <span className="bg-zinc-50 text-zinc-400 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-zinc-200">
                                            +{mentor.skills.length - 4}
                                        </span>
                                    )}
                                </div>
                            )}

                            <Button
                                onClick={() => setProfileUserId(mentor.id)}
                                className="w-full h-11 rounded-xl font-black text-sm bg-zinc-900 text-white hover:bg-[#D4F268] hover:text-zinc-900 transition-all relative z-10"
                            >
                                View Full Profile
                            </Button>

                            {profile && (
                                <button
                                    onClick={() => setReportModalOpen(true)}
                                    className="w-full mt-2 flex items-center justify-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-red-500 transition-colors py-1.5 relative z-10"
                                >
                                    <Flag size={11} />
                                    Report this video
                                </button>
                            )}
                        </motion.div>

                        {/* Rate this video */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ type: "spring", bounce: 0.3, delay: 0.2 }}
                            className="bg-white rounded-[2rem] p-7 shadow-[0_8px_30px_rgba(0,0,0,0.05)] border border-zinc-100/60"
                        >
                            <h3 className="font-black text-zinc-900 text-lg mb-1">
                                {userReview ? "Your Rating" : "Rate This Video"}
                            </h3>
                            <p className="text-zinc-400 text-xs font-medium mb-5">
                                {userReview
                                    ? "You can update your rating at any time."
                                    : "Help others discover great content."}
                            </p>

                            {!profile ? (
                                <div className="bg-zinc-50 rounded-2xl p-4 text-center border border-zinc-100">
                                    <p className="text-zinc-500 text-sm font-medium">Sign in to rate this video</p>
                                </div>
                            ) : (
                                <AnimatePresence mode="wait">
                                    {ratingSubmitted && myRating > 0 ? (
                                        <motion.div
                                            key="success"
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="text-center"
                                        >
                                            <div className="flex justify-center mb-3">
                                                <StarDisplay value={myRating} size={24} />
                                            </div>
                                            {myRatingComment && (
                                                <p className="text-zinc-500 text-sm font-medium mb-4 italic line-clamp-2">
                                                    &ldquo;{myRatingComment}&rdquo;
                                                </p>
                                            )}
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ type: "spring", bounce: 0.6 }}
                                                className="flex items-center justify-center gap-2 text-[#5a6d1a] font-black text-sm mb-4"
                                            >
                                                <CheckCircle size={18} className="text-[#D4F268] fill-[#D4F268]" />
                                                Rating submitted!
                                            </motion.div>
                                            <button
                                                onClick={() => setRatingSubmitted(false)}
                                                className="text-zinc-400 text-xs font-bold hover:text-zinc-600 transition-colors underline underline-offset-2"
                                            >
                                                Edit rating
                                            </button>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="form"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <div className="mb-5">
                                                <StarPicker value={myRating} onChange={setMyRating} />
                                            </div>
                                            <textarea
                                                value={myRatingComment}
                                                onChange={e => setMyRatingComment(e.target.value)}
                                                placeholder="Leave a written review (optional)..."
                                                rows={3}
                                                maxLength={500}
                                                data-lenis-prevent
                                                className="w-full bg-zinc-50 border-2 border-zinc-200 focus:border-[#D4F268] rounded-xl px-4 py-3 text-zinc-900 text-sm font-medium outline-none resize-none mb-2 transition-colors placeholder:text-zinc-400"
                                            />
                                            {ratingError && (
                                                <p className="text-red-500 text-xs font-bold mb-3">{ratingError}</p>
                                            )}
                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleSubmitRating}
                                                disabled={myRating === 0 || isSubmittingRating}
                                                className="w-full h-12 rounded-xl font-black text-sm bg-zinc-900 text-white hover:bg-[#D4F268] hover:text-zinc-900 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                                            >
                                                {isSubmittingRating && <Loader2 size={16} className="animate-spin" />}
                                                {userReview ? "Update Rating" : "Submit Rating"}
                                            </motion.button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>

            <UserProfileModal
                userId={profileUserId}
                isOpen={!!profileUserId}
                onClose={() => setProfileUserId(null)}
            />

            <ReportModal
                sessionId={sessionId}
                mentorId={mentor.id}
                mentorName={mentor.name}
                isOpen={reportModalOpen}
                onClose={() => setReportModalOpen(false)}
            />
        </div>
    );
}
