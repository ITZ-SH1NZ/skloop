"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import {
    Send, Plus, Image as ImageIcon, Smile, X, Search,
    ArrowLeft, Info, Users as UsersIcon, FileText,
    Mic, Square, Check, Video, Reply, Share2,
    Play, Pause, FastForward, ChevronDown, Copy, Star, Pin, Gift, Trash2,
    Bot, BarChart2, Calendar, Palette, PinOff, Zap, Sparkles, Clock, AlertCircle, MoreVertical, Link,
    Quote, HelpCircle, ListChecks, Brain
} from "lucide-react";
import { PeerProfile } from "./PeerCard";
import { CircleInfoPanel } from "./CircleInfoPanel";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { LoopyMascot, LoopyMood } from "../loopy/LoopyMascot";
import data from '@emoji-mart/data';
import dynamic from 'next/dynamic';
import { createClient } from "@/utils/supabase/client";
import {
    getConversationMessages, sendMessage, MessageRow, uploadChatFile,
    markMessagesAsRead, markMessagesAsDelivered, deleteMessage, toggleReaction,
    pinMessage, unpinMessage, getPinnedMessage,
    createPoll, getPoll, votePoll,
    scheduleMessage, getOverdueScheduledMessages, markScheduledMessageSent,
    type MessageAttachment
} from "@/actions/chat-actions";
import { markNotificationsAsRead } from "@/actions/notification-actions";
import { soundManager } from "@/lib/sound";

const Picker = dynamic(() => import('@emoji-mart/react'), { ssr: false });

/**
 * Rich Open Graph Link Preview Card.
 * Fetches OG data from /api/og-preview endpoint.
 */
const ogCache: Record<string, any> = {};

const LinkPreview = ({ url, isMe }: { url: string; isMe?: boolean }) => {
    const [og, setOg] = useState<{ title?: string; description?: string; image?: string; domain?: string; siteName?: string } | null>(ogCache[url] || null);
    const [loading, setLoading] = useState(!ogCache[url]);

    useEffect(() => {
        if (ogCache[url]) return;
        let cancelled = false;
        fetch(`/api/og-preview?url=${encodeURIComponent(url)}`)
            .then(r => r.json())
            .then(d => {
                if (!cancelled) {
                    ogCache[url] = d;
                    setOg(d);
                    setLoading(false);
                }
            })
            .catch(() => { if (!cancelled) { setLoading(false); } });
        return () => { cancelled = true; };
    }, [url]);

    if (loading) {
        return (
            <div className={`mt-2 rounded-lg overflow-hidden border animate-pulse ${isMe ? 'border-black/10 bg-black/5' : 'border-zinc-200 bg-zinc-50'}`}>
                <div className={`h-28 ${isMe ? 'bg-black/5' : 'bg-zinc-100'}`} />
                <div className="p-2.5 space-y-1">
                    <div className={`h-2.5 rounded-full w-1/3 ${isMe ? 'bg-black/10' : 'bg-zinc-200'}`} />
                    <div className={`h-2 rounded-full w-2/3 ${isMe ? 'bg-black/10' : 'bg-zinc-200'}`} />
                </div>
            </div>
        );
    }

    return (
        <motion.a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-2 rounded-lg overflow-hidden border block no-underline hover:opacity-90 transition-opacity ${isMe ? 'border-black/10' : 'border-zinc-200'}`}
        >
            {og?.image && (
                <img src={og.image} alt="" className="w-full h-28 object-cover" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            )}
            <div className={`p-2.5 ${isMe ? 'bg-black/5' : 'bg-zinc-50'}`}>
                <p className={`text-[9px] font-black uppercase tracking-widest mb-0.5 ${isMe ? 'text-black/40' : 'text-[#84cc16]'}`}>{og?.siteName || og?.domain}</p>
                <p className={`text-xs font-bold truncate ${isMe ? 'text-black/80' : 'text-zinc-900'}`}>{og?.title || url}</p>
                {og?.description && <p className={`text-[10px] line-clamp-1 mt-0.5 ${isMe ? 'text-black/50' : 'text-zinc-500'}`}>{og.description}</p>}
            </div>
        </motion.a>
    );
};

/**
 * Animated Poll Message Renderer.
 */
const PollMessage = ({ pollId, currentUserId, supabase }: { pollId: string; currentUserId: string | null, supabase: any }) => {
    const [poll, setPoll] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [myVote, setMyVote] = useState<number | null>(null);
    const [voting, setVoting] = useState(false);

    const fetchPoll = async () => {
        const data = await getPoll(pollId);
        if (data) {
            setPoll(data);
            const userVote = data.poll_votes?.find((v: any) => v.user_id === currentUserId);
            setMyVote(userVote ? userVote.option_index : null);
        }
        setLoading(false);
    };

    useEffect(() => { fetchPoll(); }, [pollId]);

    const handleVote = async (idx: number) => {
        if (voting) return;
        setVoting(true);
        try {
            await votePoll(pollId, idx);
            // fetchPoll is technically redundant if RT works, but good as fallback
            await fetchPoll();
        } finally {
            setVoting(false);
            soundManager.playClick(0.5);
        }
    };

    useEffect(() => {
        const channel = supabase
            .channel(`poll:${pollId}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'poll_votes',
                filter: `poll_id=eq.${pollId}`
            }, () => {
                fetchPoll();
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [pollId, supabase]);

    if (loading || !poll) return <div className="p-3 text-xs text-zinc-400 animate-pulse">Loading poll...</div>;

    const totalVotes = poll.poll_votes?.length || 0;
    const options: { text: string }[] = poll.options || [];

    return (
        <div className="p-3 space-y-2 min-w-[220px] max-w-full">
            <p className="text-[10px] font-black uppercase tracking-widest text-[#84cc16] flex items-center gap-1.5">
                <BarChart2 size={12} /> Poll
            </p>
            <p className="text-sm font-black text-zinc-900 leading-snug">{poll.question}</p>
            <div className="space-y-2 mt-3">
                {options.map((opt, i) => {
                    const votes = poll.poll_votes?.filter((v: any) => v.option_index === i).length || 0;
                    const pct = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
                    const isMyVote = myVote === i;
                    return (
                        <button
                            key={i}
                            type="button"
                            onClick={() => handleVote(i)}
                            disabled={voting}
                            className={`w-full text-left relative rounded-lg overflow-hidden border transition-all active:scale-[0.98] ${isMyVote ? 'border-[#84cc16] bg-lime-50' : 'border-zinc-200 bg-zinc-50 hover:bg-zinc-100'}`}
                        >
                            <motion.div
                                className={`absolute inset-y-0 left-0 ${isMyVote ? 'bg-lime-200/60' : 'bg-zinc-200/50'}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                            />
                            <div className="relative flex items-center justify-between px-3 py-2">
                                <span className={`text-xs font-bold ${isMyVote ? 'text-lime-700' : 'text-zinc-700'}`}>{opt.text}</span>
                                <span className={`text-[10px] font-black ${isMyVote ? 'text-lime-600' : 'text-zinc-400'}`}>{pct}%</span>
                            </div>
                        </button>
                    );
                })}
            </div>
            <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">{totalVotes} vote{totalVotes !== 1 ? 's' : ''}</p>
        </div>
    );
};
/**
 * Premium Voice Note Player with Waveform and Speed Control
 */
const VoicePlayer = ({ url }: { url: string }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const waveform = useMemo(() => {
        const hash = url.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
        return Array.from({ length: 35 }).map((_, i) => 2 + Math.abs(Math.sin(hash + i * 0.5) * 20));
    }, [url]);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            soundManager.playClick(0.4);
        } else {
            audioRef.current.play();
            soundManager.playClick(0.6);
        }
        setIsPlaying(!isPlaying);
    };

    const cycleSpeed = () => {
        const speeds = [1, 1.5, 2];
        const nextSpeed = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
        setPlaybackSpeed(nextSpeed);
        if (audioRef.current) audioRef.current.playbackRate = nextSpeed;
    };

    const formatTime = (time: number) => {
        const mins = Math.floor(time / 60);
        const secs = Math.floor(time % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-3 bg-zinc-900/5 backdrop-blur-sm p-3 rounded-xl min-w-[260px] border border-black/5 group/voice">
            <audio ref={audioRef} src={url} onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime || 0)} onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)} onEnded={() => setIsPlaying(false)} />
            <button type="button" onClick={togglePlay} className="w-10 h-10 rounded-full bg-[#D4F268] text-[#1A1A1A] flex items-center justify-center shadow-lg shadow-lime-500/20 active:scale-90 transition-all">
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} className="ml-0.5" fill="currentColor" />}
            </button>
            <div className="flex-1 flex flex-col gap-1.5">
                <div className="h-8 flex items-end gap-[3px] px-1">
                    {waveform.map((h, i) => {
                        const progress = (currentTime / (duration || 1)) * 100;
                        const isPlayed = (i / waveform.length) * 100 < progress;
                        return (
                            <motion.div
                                key={i}
                                animate={{ height: isPlaying ? [h, h * 1.5, h] : h }}
                                transition={{ duration: 0.5, repeat: isPlaying ? Infinity : 0, delay: i * 0.05 }}
                                className={`w-[3px] rounded-full transition-colors duration-300 ${isPlayed ? 'bg-[#84cc16]' : 'bg-zinc-300'}`}
                                style={{ height: `${h}px` }}
                            />
                        );
                    })}
                </div>
                <div className="flex justify-between items-center text-[10px] font-black text-zinc-400 uppercase tracking-widest px-0.5">
                    <span>{formatTime(currentTime)}</span>
                    <div className="flex items-center gap-2">
                        <button type="button" onClick={cycleSpeed} className="hover:text-zinc-900 transition-colors bg-white/50 px-1.5 py-0.5 rounded-md border border-zinc-100">{playbackSpeed}x</button>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const renderReplyContent = (msg: MessageRow) => {
    if (msg.isDeleted) return <span className="text-zinc-400 italic">Message deleted</span>;

    // Check for media first
    const hasImage = msg.mediaUrl || msg.attachments?.some(a => a.type === 'image');
    const hasVideo = msg.attachments?.some(a => a.type === 'video');
    const hasAudio = msg.attachments?.some(a => a.type === 'audio');

    if (hasImage) return <div className="flex items-center gap-1.5"><ImageIcon size={10} className="text-zinc-400" /> <span>Photo</span></div>;
    if (hasVideo) return <div className="flex items-center gap-1.5"><Video size={10} className="text-zinc-400" /> <span>Video</span></div>;
    if (hasAudio) return <div className="flex items-center gap-1.5"><Mic size={10} className="text-zinc-400" /> <span>Voice Note</span></div>;
    if (msg.type === 'poll') return <div className="flex items-center gap-1.5"><BarChart2 size={10} className="text-zinc-400" /> <span>Poll</span></div>;

    // Check for raw URLs in text
    if (msg.text?.trim().startsWith('http') && !msg.text.includes(' ')) {
        return <div className="flex items-center gap-1.5"><Link size={10} className="text-zinc-400" /> <span>Link</span></div>;
    }

    return <span className="truncate">{msg.text || 'Attachment'}</span>;
};

// Helper: Group messages by date
const groupMessagesByDate = (messages: MessageRow[]) => {
    const groups: { date: string, messages: MessageRow[] }[] = [];
    messages.forEach(msg => {
        const date = new Date(msg.timestamp);
        const today = new Date();
        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);

        let dateStr = "";
        if (date.toDateString() === today.toDateString()) {
            dateStr = "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            dateStr = "Yesterday";
        } else {
            dateStr = date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined });
        }

        const existingGroup = groups.find(g => g.date === dateStr);
        if (existingGroup) {
            existingGroup.messages.push(msg);
        } else {
            groups.push({ date: dateStr, messages: [msg] });
        }
    });
    return groups;
};

/**
 * In-Theme Premium Schedule Picker.
 */
const SchedulePicker = ({ onSelect, onCancel }: { onSelect: (isoDate: string) => void; onCancel: () => void }) => {
    const [date, setDate] = useState(new Date());
    const [hours, setHours] = useState(new Date().getHours());
    const [mins, setMins] = useState(new Date().getMinutes());

    const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    const days = Array.from({ length: daysInMonth(date.getFullYear(), date.getMonth()) }, (_, i) => i + 1);

    const handleConfirm = () => {
        const selected = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, mins);
        onSelect(selected.toISOString());
    };

    return (
        <div className="flex flex-col gap-6 p-4">
            <div className="flex items-center justify-between mb-2">
                <Button variant="ghost" size="sm" onClick={() => setDate(new Date(date.setMonth(date.getMonth() - 1)))} className="hover:bg-zinc-100 rounded-lg">
                    <ArrowLeft size={16} />
                </Button>
                <span className="text-sm font-black uppercase tracking-widest text-[#1A1A1A]">
                    {date.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setDate(new Date(date.setMonth(date.getMonth() + 1)))} className="hover:bg-zinc-100 rounded-lg">
                    <ArrowLeft size={16} className="rotate-180" />
                </Button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                    <div key={`${d}-${i}`} className="text-[10px] font-black text-zinc-300 py-1">{d}</div>
                ))}
                {Array(firstDay).fill(0).map((_, i) => <div key={`empty-${i}`} />)}
                {days.map(d => {
                    const isToday = new Date().toDateString() === new Date(date.getFullYear(), date.getMonth(), d).toDateString();
                    const isSelected = date.getDate() === d;
                    return (
                        <button
                            key={d}
                            onClick={() => setDate(new Date(date.setDate(d)))}
                            className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center
                                ${isSelected ? 'bg-zinc-900 text-white shadow-lg' : isToday ? 'text-[#84cc16] bg-lime-50 border border-lime-100' : 'text-zinc-600 hover:bg-zinc-50'}`}
                        >
                            {d}
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center justify-center gap-4 bg-zinc-50 rounded-2xl p-4 border border-zinc-100 shadow-inner">
                <div className="flex flex-col items-center">
                    <input type="number" value={hours} onChange={(e) => setHours(Math.max(0, Math.min(23, parseInt(e.target.value) || 0)))} className="w-12 h-10 bg-white border border-zinc-200 rounded-xl text-center font-black text-sm shadow-sm" />
                    <span className="text-[8px] font-bold text-zinc-400 mt-1 uppercase">Hours</span>
                </div>
                <span className="font-black text-zinc-300">:</span>
                <div className="flex flex-col items-center">
                    <input type="number" value={mins} onChange={(e) => setMins(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))} className="w-12 h-10 bg-white border border-zinc-200 rounded-xl text-center font-black text-sm shadow-sm" />
                    <span className="text-[8px] font-bold text-zinc-400 mt-1 uppercase">Mins</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
                <Button variant="outline" className="rounded-xl font-bold py-6 border-2" onClick={onCancel}>Cancel</Button>
                <Button className="rounded-xl font-black bg-[#84cc16] hover:bg-lime-500 text-black py-6 shadow-[0_10px_20px_rgba(132,204,22,0.3)]" onClick={handleConfirm}>Confirm</Button>
            </div>
        </div>
    );
};

interface ChatWindowProps {
    peer: PeerProfile | null;
    currentUserId: string | null;
    currentUserName?: string | null;
    onBack?: () => void;
    onPeerUpdate?: (updatedPeer: Partial<PeerProfile> & { id: string }) => void;
}

export function ChatWindow({ peer, currentUserId, currentUserName, onBack, onPeerUpdate }: ChatWindowProps) {
    const supabase = useMemo(() => createClient(), []);
    const [messages, setMessages] = useState<MessageRow[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [showAttachments, setShowAttachments] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [msgSearchTerm, setMsgSearchTerm] = useState("");
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [gifs, setGifs] = useState<any[]>([]);
    const [gifSearch, setGifSearch] = useState("");
    const [isLoadingGifs, setIsLoadingGifs] = useState(false);
    const [showInfoPanel, setShowInfoPanel] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<{ file: File; previewUrl: string, type: 'image' | 'video' | 'audio' | 'file' }[]>([]);
    const [replyTo, setReplyTo] = useState<MessageRow | null>(null);
    const [forwardMsg, setForwardMsg] = useState<MessageRow | null>(null);
    const [recentPeers, setRecentPeers] = useState<PeerProfile[]>([]);
    const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
    const [editingMsg, setEditingMsg] = useState<MessageRow | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
    const { onlineUserIds } = useUser();
    const [lastSeenText, setLastSeenText] = useState<string | null>(null);
    const [localPeer, setLocalPeer] = useState<PeerProfile | null>(peer);
    const [showMediaGallery, setShowMediaGallery] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [lastReadId, setLastReadId] = useState<string | null>(null);

    // --- NEW FEATURE STATES ---
    const [pinnedMsg, setPinnedMsg] = useState<{ messageId: string; text: string; senderName: string } | null>(null);
    const [showLoopyPanel, setShowLoopyPanel] = useState(false);
    const [loopyResponse, setLoopyResponse] = useState<any>(null);
    const [isLoopyTyping, setIsLoopyTyping] = useState(false);
    const [chatTheme, setChatTheme] = useState<'default' | 'grasslands' | 'crystal' | 'mystic'>('default');
    const [showThemePicker, setShowThemePicker] = useState(false);
    const [showPollCreator, setShowPollCreator] = useState(false);
    const [pollQuestion, setPollQuestion] = useState("");
    const [pollOptions, setPollOptions] = useState(["", ""]);
    const [showSchedulePicker, setShowSchedulePicker] = useState(false);
    const [scheduledTime, setScheduledTime] = useState("");
    const [pendingScheduledMsgs, setPendingScheduledMsgs] = useState<any[]>([]);
    const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
    const [showMoreMenu, setShowMoreMenu] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const scrollContentRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const sentMessageIds = useRef<Set<string>>(new Set());
    const typingChannelRef = useRef<any>(null);
    const [audioLevels, setAudioLevels] = useState<number[]>(Array(30).fill(2));
    const [recordedAudio, setRecordedAudio] = useState<{ blob: Blob; url: string } | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const isGroup = peer?.type === 'group';
    const initialLoadRef = useRef(true);

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        if (messagesEndRef.current) {
            // Using a slight delay to ensure all dynamic content (images, etc.) has rendered
            setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior });
            }, 50);
        }
    };

    const handleScroll = () => {
        if (!scrollContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = scrollContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setIsAtBottom(isNearBottom);

        // If at bottom, mark last message as read locally
        if (isNearBottom && messages.length > 0) {
            setLastReadId(messages[messages.length - 1].id);
        }
    };

    useEffect(() => {
        if (initialLoadRef.current && messages.length > 0) {
            // Use requestAnimationFrame to ensure DOM is ready
            requestAnimationFrame(() => {
                scrollToBottom("auto");
                initialLoadRef.current = false;
                if (messages.length > 0) setLastReadId(messages[messages.length - 1].id);
            });
        } else if (isAtBottom) {
            scrollToBottom();
            if (messages.length > 0) setLastReadId(messages[messages.length - 1].id);
        }
    }, [messages, isAtBottom]);


    useEffect(() => {
        if (!peer || !currentUserId) return;
        const loadMessages = async () => {
            const [history, pinned] = await Promise.all([
                getConversationMessages(peer.id),
                getPinnedMessage(peer.id)
            ]);
            setMessages(history);
            setPinnedMsg(pinned);

            // Mark as read and delivered when loading history
            await markMessagesAsRead(peer.id, peer.peerId || peer.id);
            await markMessagesAsDelivered(peer.id, peer.peerId || peer.id);
            await markNotificationsAsRead(currentUserId, { conversationId: peer.id });

            // Check for overdue scheduled messages
            const overdue = await getOverdueScheduledMessages(peer.id, currentUserId);
            for (const msg of overdue) {
                await sendMessage(peer.id, currentUserId, msg.content, msg.type);
                await markScheduledMessageSent(msg.id);
            }
        };
        loadMessages();

        const channel = supabase
            .channel(`chat:messages:${peer.id}`)
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'messages',
                filter: `conversation_id=eq.${peer.id}`
            }, async (payload) => {
                if (payload.eventType === 'INSERT') {
                    const newMessage = payload.new as any;
                    setMessages(prev => {
                        // 1. Check if the message is already in the list
                        if (prev.some(m => m.id === newMessage.id)) return prev;

                        // 2. Deduplication logic: If it's from me, check for an existing temp message
                        if (newMessage.sender_id === currentUserId) {
                            const tempMatch = prev.find(m => 
                                m.id.startsWith('temp-') && 
                                m.type === newMessage.type &&
                                (
                                    // For text messages
                                    (m.type === 'text' && m.text === newMessage.content) ||
                                    // For media messages (check if any attachment matches name or if it's the only temporary media message of this type)
                                    (m.type !== 'text' && (
                                        !newMessage.content || // If content is empty (common for media)
                                        m.text === newMessage.content ||
                                        (m.attachments && newMessage.attachments && m.attachments.length === newMessage.attachments.length)
                                    ))
                                )
                            );
                            if (tempMatch) {
                                // Match found! Swap the ID and update attachments with real URLs
                                return prev.map(m => m.id === tempMatch.id ? { 
                                    ...m, 
                                    id: newMessage.id,
                                    attachments: newMessage.attachments || m.attachments,
                                    text: newMessage.content || m.text
                                } : m);
                            }
                        }

                        const mapped: MessageRow = {
                            id: newMessage.id,
                            senderId: newMessage.sender_id,
                            senderName: newMessage.sender_id === currentUserId ? 'You' : (peer.name || 'User'),
                            text: newMessage.content,
                            type: newMessage.type,
                            timestamp: new Date(newMessage.created_at),
                            status: newMessage.status,
                            replyToId: newMessage.reply_to_id,
                            attachments: newMessage.attachments || [],
                            isDeleted: newMessage.is_deleted,
                            pollId: newMessage.poll_id
                        };
                        return [...prev, mapped];
                    });
                    if (newMessage.sender_id !== currentUserId) {
                        await markMessagesAsRead(peer.id, peer.peerId || peer.id);
                        await markNotificationsAsRead(currentUserId, { conversationId: peer.id });
                    }
                    // Mark as delivered if from peer
                    if (newMessage.sender_id !== currentUserId) {
                        await markMessagesAsDelivered(peer.id, peer.peerId || peer.id);
                    }
                    // Ensure auto-bottom on new messages (including polls)
                    if (isAtBottom || newMessage.sender_id === currentUserId) {
                        setTimeout(() => scrollToBottom("smooth"), 100);
                    }
                } else if (payload.eventType === 'UPDATE') {
                    const updated = payload.new as any;
                    setMessages(prev => prev.map(m => m.id === updated.id ? {
                        ...m,
                        isDeleted: updated.is_deleted,
                        text: updated.is_deleted ? "Message deleted" : updated.content,
                        status: updated.status,
                        isEdited: updated.is_edited,
                        pollId: updated.poll_id
                    } : m));
                } else if (payload.eventType === 'DELETE') {
                    setMessages(prev => prev.filter(m => m.id !== payload.old.id));
                }
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'message_reactions'
            }, async (payload) => {
                const reaction = (payload.new || payload.old) as any;
                const msgId = reaction.message_id;

                setMessages(prev => {
                    return prev.map(m => {
                        if (m.id !== msgId) return m;
                        let nextReactions = [...(m.reactions || [])];
                        if (payload.eventType === 'INSERT') {
                            const existing = nextReactions.find(r => r.emoji === reaction.emoji);
                            if (existing) {
                                if (!existing.userIds.includes(reaction.user_id)) {
                                    nextReactions = nextReactions.map(r =>
                                        r.emoji === reaction.emoji
                                            ? { ...r, count: r.count + 1, userIds: [...r.userIds, reaction.user_id] }
                                            : r
                                    );
                                }
                            } else {
                                nextReactions.push({ emoji: reaction.emoji, count: 1, userIds: [reaction.user_id] });
                            }
                        } else if (payload.eventType === 'DELETE') {
                            const existing = nextReactions.find(r => r.emoji === reaction.emoji);
                            if (existing) {
                                if (existing.count > 1) {
                                    nextReactions = nextReactions.map(r =>
                                        r.emoji === reaction.emoji
                                            ? { ...r, count: r.count - 1, userIds: r.userIds.filter(id => id !== reaction.user_id) }
                                            : r
                                    );
                                } else {
                                    nextReactions = nextReactions.filter(r => r.emoji !== reaction.emoji);
                                }
                            }
                        }
                        return { ...m, reactions: nextReactions };
                    });
                });
            })
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'pinned_messages',
                filter: `conversation_id=eq.${peer.id}`
            }, async (payload) => {
                // Fetch the actual message and profile when a pin changes
                const pinned = await getPinnedMessage(peer.id);
                setPinnedMsg(pinned);
                soundManager.playClick(0.5);
            })
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [peer?.id, currentUserId, supabase]);

    useEffect(() => {
        if (!scrollContentRef.current) return;
        const observer = new ResizeObserver(() => {
            // Only auto-scroll if we were already "near" the bottom
            // This prevents jumping if user is scrolling up history
            if (isNearBottomRef.current) {
                scrollToBottom("smooth");
            }
        });
        observer.observe(scrollContentRef.current);
        return () => observer.disconnect();
    }, []);

    const isPeerOnline = useMemo(() => {
        if (!peer || isGroup) return false;
        return onlineUserIds.has(peer.peerId || peer.id);
    }, [onlineUserIds, peer, isGroup]);

    useEffect(() => {
        if (!peer || isGroup || isPeerOnline) {
            if (isPeerOnline) setLastSeenText(null);
            return;
        }

        const fetchInitialStatus = async () => {
            const { data: profile } = await supabase
                .from('profiles')
                .select('last_seen')
                .eq('id', peer.peerId || peer.id)
                .single();

            if (profile?.last_seen) {
                const lastSeen = new Date(profile.last_seen);
                const diff = (new Date().getTime() - lastSeen.getTime()) / 1000;

                if (diff < 120) {
                    // isPeerOnline will be true via useMemo if they are currently online
                } else {
                    const formatLastSeen = (date: Date) => {
                        const now = new Date();
                        const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
                        if (diffSec < 60) return 'Just now';
                        const diffMin = Math.floor(diffSec / 60);
                        if (diffMin < 60) return `${diffMin}m ago`;
                        const diffHr = Math.floor(diffMin / 60);
                        if (diffHr < 24) return `${diffHr}h ago`;
                        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                    };
                    setLastSeenText(`Last seen ${formatLastSeen(lastSeen)}`);
                }
            }
        };
        fetchInitialStatus();

        fetchInitialStatus();
    }, [peer?.id, peer?.peerId, isGroup, isPeerOnline, supabase]);

    // 3. Typing Indicators (Realtime Broadcast)
    useEffect(() => {
        if (!peer || !currentUserId) return;

        const typingChannel = supabase.channel(`chat:typing:${peer.id}`);
        typingChannelRef.current = typingChannel;

        typingChannel
            .on('broadcast', { event: 'typing' }, ({ payload }) => {
                const { userId, isTyping } = payload;
                if (userId === currentUserId) return;

                setTypingUsers(prev => {
                    const next = new Set(prev);
                    if (isTyping) next.add(userId);
                    else next.delete(userId);
                    return next;
                });
            })
            .subscribe((status) => {
                if (status === 'SUBSCRIBED') {
                    console.log(`Subscribed to typing indicators for ${peer.id}`);
                }
            });

        return () => {
            supabase.removeChannel(typingChannel);
            typingChannelRef.current = null;
        };
    }, [peer?.id, currentUserId, supabase]);

    // Broadcast typing status
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (!peer || !currentUserId || !typingChannelRef.current) return;

        if (!inputValue) {
            // If input is empty, immediately stop typing indicator
            typingChannelRef.current.send({
                type: 'broadcast',
                event: 'typing',
                payload: { userId: currentUserId, isTyping: false }
            });
            return;
        }

        // Broadcast that we are typing
        typingChannelRef.current.send({
            type: 'broadcast',
            event: 'typing',
            payload: { 
                userId: currentUserId, 
                userName: currentUserName || 'Someone',
                isTyping: true 
            }
        });

        // Set a timeout to stop typing indicator after inactivity
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            if (typingChannelRef.current) {
                typingChannelRef.current.send({
                    type: 'broadcast',
                    event: 'typing',
                    payload: { userId: currentUserId, isTyping: false }
                });
            }
        }, 3000);

        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [inputValue, peer?.id, currentUserId]);

    useEffect(() => {
        const fetchRecentPeers = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data: participants } = await supabase.from('conversation_participants').select('conversation_id, conversations (id, type, name, avatar_url)').eq('user_id', user.id);
            if (participants) {
                const peers = await Promise.all(participants.map(async (p: any) => {
                    const conv = p.conversations;
                    if (conv.type === 'direct') {
                        const { data: other } = await supabase.from('conversation_participants').select('profiles (id, full_name, username, avatar_url)').eq('conversation_id', conv.id).neq('user_id', user.id).single();
                        const profile = other?.profiles as any;
                        return { id: conv.id, name: profile?.full_name || profile?.username || 'User', avatarUrl: profile?.avatar_url, type: 'direct', peerId: profile?.id } as PeerProfile;
                    }
                    return { id: conv.id, name: conv.name, avatarUrl: conv.avatar_url, type: 'group' } as PeerProfile;
                }));
                setRecentPeers(peers.filter(p => p.id !== peer?.id));
            }
        };
        if (forwardMsg) fetchRecentPeers();
    }, [forwardMsg, peer?.id]);

    // Fetch GIFs (Trending or Search)
    useEffect(() => {
        if (!showGifPicker) return;

        const fetchGifs = async () => {
            setIsLoadingGifs(true);
            try {
                const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY || "dc6zaTOxFJmzC"; // Default public beta key if missing
                const endpoint = gifSearch
                    ? `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(gifSearch)}&limit=20`
                    : `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=20`;

                const res = await fetch(endpoint);
                const result = await res.json();
                setGifs(result.data || []);
            } catch (error) {
                console.error("Failed to fetch GIFs", error);
            } finally {
                setIsLoadingGifs(false);
            }
        };

        const timeoutId = setTimeout(fetchGifs, 500); // Debounce
        return () => clearTimeout(timeoutId);
    }, [showGifPicker, gifSearch]);

    const handleLoopyAction = async (mode: 'explain' | 'summarize') => {
        if (!peer || !currentUserId) return;
        setIsLoopyTyping(true);
        setShowLoopyPanel(true);
        setLoopyResponse(null);

        try {
            const res = await fetch('/api/loopy-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode, messages: messages.slice(-20) })
            });
            const data = await res.json();
            setLoopyResponse(data.content);
            soundManager.playClick(0.5);
        } catch (err) {
            setLoopyResponse("Oops! I hit a glitch in the Source. Try again later! 🦉");
        } finally {
            setIsLoopyTyping(false);
        }
    };

    const handlePinMessage = async (msg: MessageRow) => {
        if (!peer) return;
        try {
            await pinMessage(peer.id, msg.id);
            soundManager.playClick(0.6);
        } catch (err) {
            console.error("Pin failed", err);
        }
    };

    const handleUnpinMessage = async () => {
        if (!peer) return;
        try {
            await unpinMessage(peer.id);
            setPinnedMsg(null);
            soundManager.playClick(0.4);
        } catch (err) {
            console.error("Unpin failed", err);
        }
    };

    const handleCreatePollAction = async () => {
        if (!peer || !currentUserId || !pollQuestion || pollOptions.filter(o => o.trim()).length < 2) return;

        const options = pollOptions.filter(o => o.trim()).map(o => ({ text: o }));
        const tempId = `temp-poll-${Date.now()}`;

        // Optimistic update
        const optimisticPollMsg: MessageRow = {
            id: tempId,
            senderId: currentUserId,
            senderName: 'You',
            text: `📊 Poll: ${pollQuestion}`,
            type: 'poll',
            timestamp: new Date(),
            status: 'sent',
            pollId: 'temp' // Temporary indicator
        };

        setMessages(prev => [...prev, optimisticPollMsg]);
        setShowPollCreator(false);
        setPollQuestion("");
        setPollOptions(["", ""]);
        soundManager.playClick(0.8);
        scrollToBottom();

        try {
            const { message: savedMsg, poll: savedPoll } = await createPoll(peer.id, currentUserId, pollQuestion, options);
            // Update the optimistic message with real IDs
            setMessages(prev => prev.map(m => m.id === tempId ? {
                ...m,
                id: savedMsg.id,
                pollId: savedPoll.id
            } : m));
        } catch (err) {
            console.error("Poll creation failed", err);
            // Revert on failure
            setMessages(prev => prev.filter(m => m.id !== tempId));
        }
    };

    const handleScheduleAction = async (isoTime?: string) => {
        const targetTime = isoTime || scheduledTime;
        if (!peer || !currentUserId || !inputValue || !targetTime) return;
        try {
            await scheduleMessage(peer.id, currentUserId, inputValue, targetTime);
            setInputValue("");
            setShowSchedulePicker(false);
            setScheduledTime("");
            soundManager.playClick(0.7);

            // Fetch future scheduled messages (simplified)
            // In a real app, you'd have getPendingScheduledMessages(peer.id, currentUserId)
            setPendingScheduledMsgs(prev => [...prev, { id: 'temp-' + Date.now(), content: inputValue, scheduled_at: targetTime }]);
        } catch (err) {
            console.error("Schedule failed", err);
        }
    };

    const handleLongPressStart = () => {
        const timer = setTimeout(() => {
            setShowSchedulePicker(true);
            soundManager.playClick(0.8);
        }, 600);
        setLongPressTimer(timer);
    };

    const handleLongPressEnd = () => {
        if (longPressTimer) {
            clearTimeout(longPressTimer);
            setLongPressTimer(null);
        }
    };

    const isNearBottomRef = useRef(true);
    useEffect(() => { isNearBottomRef.current = isAtBottom; }, [isAtBottom]);

    const handleSend = async (customText?: string, customType?: MessageRow['type'], customUrl?: string) => {
        if (!peer || !currentUserId) return;
        const text = customText || inputValue;
        const type = customType || 'text';

        if (!text.trim() && !pendingFiles.length && !customUrl) return;

        // Optimistic update
        const tempId = `temp-${Date.now()}`;
        const optimisticMsg: MessageRow = {
            id: tempId,
            senderId: currentUserId,
            senderName: 'You',
            text: text,
            type: type as any,
            timestamp: new Date(),
            status: 'sent',
            attachments: pendingFiles.map(pf => ({ url: pf.previewUrl || "", type: pf.type, name: pf.file.name }))
        };

        if (customUrl) optimisticMsg.text = customUrl; // For GIFs

        setMessages(prev => [...prev, optimisticMsg]);
        setInputValue("");
        setReplyTo(null);
        setEditingMsg(null);
        if (isNearBottomRef.current) setTimeout(() => scrollToBottom("smooth"), 50);

        try {
            const uploadPromises = pendingFiles.map(async (pf) => {
                try {
                    const formData = new FormData();
                    formData.append('file', pf.file);
                    const publicUrl = await uploadChatFile(formData);
                    return publicUrl ? { url: publicUrl, type: pf.type, name: pf.file.name } : null;
                } catch (uploadErr) {
                    console.error("Upload failed for file:", pf.file.name, uploadErr);
                    return null;
                }
            });

            const uploaded = (await Promise.all(uploadPromises)).filter((a): a is { url: string; type: 'image' | 'video' | 'audio' | 'file'; name: string } => a !== null);

            if (pendingFiles.length > 0 && uploaded.length === 0) {
                // All uploads failed - downgrade to error state
                setMessages(prev => prev.map(m => m.id === tempId ? { ...m, text: "⚠️ Upload failed. Please try a smaller file!", type: 'text' } : m));
                setPendingFiles([]);
                return;
            }

            const finalUrl = customUrl || text;
            const savedMsg = await sendMessage(peer.id, currentUserId, finalUrl, type as any, undefined, uploaded, replyTo?.id);

            // Link local ID to server ID
            if (savedMsg) {
                setMessages(prev => prev.map(m => m.id === tempId ? { 
                    ...m, 
                    id: savedMsg.id,
                    attachments: savedMsg.attachments || m.attachments, // Use server URLs
                    status: savedMsg.status || 'sent'
                } : m));
                sentMessageIds.current.add(savedMsg.id);
            }

            setPendingFiles([]);
            setShowAttachments(false);
            setShowEmojiPicker(false);
            setShowGifPicker(false);
            soundManager.playClick(0.4);
        } catch (err) {
            console.error("Send failed:", err);
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, text: "❌ Failed to send. Check your connection.", type: 'text' } : m));
        }
    };

    const [highlightedId, setHighlightedId] = useState<string | null>(null);

    const scrollToMessage = useCallback((messageId: string) => {
        const el = document.getElementById(`msg-${messageId}`);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightedId(messageId);
            setTimeout(() => setHighlightedId(null), 2000);
        }
    }, []);

    const compressImage = async (file: File): Promise<File> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    const maxDim = 1280;
                    if (width > maxDim || height > maxDim) {
                        if (width > height) {
                            height = (height / width) * maxDim;
                            width = maxDim;
                        } else {
                            width = (width / height) * maxDim;
                            height = maxDim;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        if (blob) resolve(new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' }));
                        else resolve(file);
                    }, 'image/jpeg', 0.8);
                };
                img.src = e.target?.result as string;
            };
            reader.readAsDataURL(file);
        });
    };

    const compressVideo = async (file: File): Promise<File> => {
        // Simple size check - if less than 10MB, don't bother compressing too much
        if (file.size < 10 * 1024 * 1024) return file;
        
        console.log(`[Video] Input size: ${(file.size / 1024 / 1024).toFixed(2)}MB. Attempting 20MB target optimization...`);
        
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.muted = true;
            video.playsInline = true;

            video.onloadedmetadata = () => {
                const targetWidth = video.videoWidth > 1280 ? 1280 : video.videoWidth;
                const targetHeight = (targetWidth / video.videoWidth) * video.videoHeight;
                
                const canvas = document.createElement('canvas');
                canvas.width = targetWidth;
                canvas.height = targetHeight;
                const ctx = canvas.getContext('2d');
                
                if (!ctx) {
                    resolve(file);
                    return;
                }

                const stream = canvas.captureStream(30);
                // Add audio track from original video
                const audioCtx = new AudioContext();
                const source = audioCtx.createMediaElementSource(video);
                const dest = audioCtx.createMediaStreamDestination();
                source.connect(dest);
                source.connect(audioCtx.destination);
                
                dest.stream.getAudioTracks().forEach(track => stream.addTrack(track));

                const recorder = new MediaRecorder(stream, {
                    mimeType: 'video/webm;codecs=vp8,opus',
                    videoBitsPerSecond: 2500000 // ~2.5 Mbps to aim for ~20MB for 1 min
                });

                const chunks: Blob[] = [];
                recorder.ondataavailable = (e) => chunks.push(e.data);
                recorder.onstop = () => {
                    const blob = new Blob(chunks, { type: 'video/webm' });
                    const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webm", { type: 'video/webm' });
                    console.log(`[Video] Output size: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
                    resolve(compressedFile.size < file.size ? compressedFile : file);
                    URL.revokeObjectURL(video.src);
                };

                video.play();
                recorder.start();

                const draw = () => {
                    if (video.paused || video.ended) {
                        recorder.stop();
                        return;
                    }
                    ctx.drawImage(video, 0, 0, targetWidth, targetHeight);
                    requestAnimationFrame(draw);
                };
                draw();
            };

            video.onerror = () => resolve(file);
        });
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const compressedFiles = await Promise.all(files.map(async (file) => {
            if (file.type.startsWith('image/')) return await compressImage(file);
            if (file.type.startsWith('video/')) return await compressVideo(file);
            return file;
        }));

        const newPending = compressedFiles.map(file => ({
            file,
            previewUrl: URL.createObjectURL(file),
            type: (file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'file') as 'image' | 'video' | 'audio' | 'file'
        }));

        setPendingFiles(prev => [...prev, ...newPending].slice(0, 10));
        setShowAttachments(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Audio Logic for Visualizer
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const analyser = audioCtx.createAnalyser();
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            analyser.fftSize = 64;
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            analyserRef.current = analyser;
            audioCtxRef.current = audioCtx;

            const updateLevels = () => {
                if (!analyserRef.current) return;
                analyserRef.current.getByteFrequencyData(dataArray);
                const levels = Array.from(dataArray).slice(0, 30).map(v => Math.max(2, v / 4));
                setAudioLevels(levels);
                animationFrameRef.current = requestAnimationFrame(updateLevels);
            };
            updateLevels();

            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];
            mediaRecorder.ondataavailable = (event) => { if (event.data.size > 0) audioChunksRef.current.push(event.data); };
            mediaRecorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setRecordedAudio({ blob: audioBlob, url: URL.createObjectURL(audioBlob) });
                stream.getTracks().forEach(track => track.stop());
                if (audioCtxRef.current) audioCtxRef.current.close();
                if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            };
            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            recordingTimerRef.current = setInterval(() => setRecordingTime(prev => prev + 1), 1000);
            soundManager.playClick(0.6);
        } catch (err) {
            console.error(err);
            alert("Microphone access is required to send voice notes.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
            soundManager.playClick(0.4);
        }
    };

    const handleSendVoice = async () => {
        // Auto-scroll to bottom on send
        scrollToBottom();
        if (!recordedAudio || !peer || !currentUserId) return;

        const tempId = `temp-${Date.now()}`;
        const optimisticAttachments: MessageAttachment[] = [{ url: recordedAudio.url, type: 'audio', name: 'voice-note.webm' }];
        const optimisticMsg: MessageRow = { id: tempId, senderId: currentUserId, attachments: optimisticAttachments, type: "audio", status: "sent", timestamp: new Date() };

        setMessages(prev => [...prev, optimisticMsg]);
        setRecordedAudio(null);

        try {
            const formData = new FormData();
            formData.append('file', new File([recordedAudio.blob], 'voice-note.webm', { type: 'audio/webm' }));
            const publicUrl = await uploadChatFile(formData);
            if (publicUrl) {
                const saved = await sendMessage(peer.id, currentUserId, "", "audio", undefined, [{ url: publicUrl, type: 'audio', name: 'voice-note.webm' }]);
                if (saved) {
                    setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: saved.id, attachments: [{ url: publicUrl, type: 'audio', name: 'voice-note.webm' }] } : m));
                    sentMessageIds.current.add(saved.id);
                }
            }
        } catch (err) {
            console.error("Voice send failed:", err);
            setMessages(prev => prev.filter(m => m.id !== tempId));
        }
    };

    const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;
    const handleEmojiSelect = (emoji: any) => setInputValue(prev => prev + emoji.native);

    const filteredMessages = messages.filter(msg => !msgSearchTerm || msg.text?.toLowerCase().includes(msgSearchTerm.toLowerCase()));

    const handleForward = async (targetPeer: PeerProfile) => {
        if (!forwardMsg || !currentUserId) return;
        await sendMessage(targetPeer.id, currentUserId, forwardMsg.text || "", forwardMsg.type, forwardMsg.caption, forwardMsg.attachments);
        setForwardMsg(null);
        soundManager.playClick(0.5);
    };

    const handleEdit = async (messageId: string, newText: string) => {
        const { editMessage } = await import("@/actions/chat-actions");
        try {
            await editMessage(messageId, newText);
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, text: newText, isEdited: true } : m));
            setEditingMsg(null);
            setInputValue("");
        } catch (err) {
            console.error("Edit failed:", err);
        }
    };

    const handleDelete = async (messageId: string) => {
        const { deleteMessage } = await import("@/actions/chat-actions");
        if (!confirm("Are you sure you want to delete this message?")) return;
        try {
            await deleteMessage(messageId);
            setMessages(prev => prev.map(m => m.id === messageId ? { ...m, isDeleted: true, text: "Message deleted" } : m));
            soundManager.playClick(0.3);
        } catch (err) {
            console.error("Delete failed:", err);
        }
    };

    return (
        <div className={`flex flex-col h-full min-w-0 relative overflow-hidden ${chatTheme === 'grasslands' ? 'bg-gradient-to-br from-lime-50 via-lime-20 to-emerald-50' : chatTheme === 'mystic' ? 'bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50' : chatTheme === 'crystal' ? 'bg-gradient-to-br from-cyan-50 via-sky-50 to-blue-50' : 'bg-zinc-50'}`}>
            {/* Header */}
            <header className={`h-20 flex items-center justify-between px-4 md:px-6 border-b border-zinc-200 sticky top-0 z-40 transition-colors duration-500 ${chatTheme === 'grasslands' ? 'bg-lime-50/90' : chatTheme === 'mystic' ? 'bg-purple-50/90' : chatTheme === 'crystal' ? 'bg-cyan-50/90' : 'bg-white/80'} backdrop-blur-xl`}>
                <div className="flex items-center gap-3">
                    {onBack && (
                        <Button variant="ghost" size="icon" className="md:hidden" onClick={onBack}>
                            <ArrowLeft size={20} />
                        </Button>
                    )}
                    <div className={`relative ${isGroup ? 'cursor-pointer group' : ''}`} onClick={() => isGroup && setShowInfoPanel(true)}>
                        <Avatar src={peer?.avatarUrl} fallback={peer?.name?.[0] || "?"} className="w-10 h-10 md:w-12 md:h-12 border-2 border-white shadow-sm group-hover:scale-105 transition-transform" />
                        {isPeerOnline && !isGroup && (
                            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-lime-500 border-2 border-white rounded-full shadow-sm" />
                        )}
                    </div>
                    <div className={`min-w-0 flex flex-col ${isGroup ? 'cursor-pointer' : ''}`} onClick={() => isGroup && setShowInfoPanel(true)}>
                        <h3 className={`text-sm md:text-base font-black truncate leading-tight flex items-center gap-1.5 ${isGroup ? 'text-zinc-900' : ''}`}>
                            {peer?.name}
                            {!isGroup && <span className={`w-1.5 h-1.5 rounded-full ${isPeerOnline ? 'bg-lime-500 shadow-[0_0_8px_rgba(132,204,22,0.5)]' : 'bg-zinc-300'}`} />}
                        </h3>
                        {typingUsers.size > 0 ? (
                            <p className="text-[10px] font-bold text-lime-600 animate-pulse">Typing...</p>
                        ) : (
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate">
                                {isPeerOnline && !isGroup ? 'Active Now' : (lastSeenText || (isGroup ? `${messages.length} messages` : 'Offline'))}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-1 md:gap-2">
                    <Button variant="ghost" size="icon" className="text-zinc-500 hover:text-zinc-900 transition-all" onClick={() => setIsSearching(!isSearching)}>
                        <Search size={18} />
                    </Button>

                    {/* Unified Actions Menu - Structural Three Dots */}
                    <div className="relative">
                        <button
                            onClick={() => setShowMoreMenu(!showMoreMenu)}
                            className={`p-2 rounded-xl transition-all duration-300 ${showMoreMenu ? 'bg-zinc-100 text-[#84cc16] shadow-inner' : 'hover:bg-zinc-50 text-zinc-400'}`}
                        >
                            <MoreVertical size={18} strokeWidth={2.5} />
                        </button>

                        <AnimatePresence>
                            {showMoreMenu && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowMoreMenu(false)} />
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98, y: 5, x: 0 }}
                                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                        exit={{ opacity: 0, scale: 0.98, y: 5 }}
                                        transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
                                        className="absolute right-0 top-full mt-2 w-56 bg-white/80 backdrop-blur-2xl border border-zinc-300/50 rounded-lg shadow-[0_20px_50px_rgba(0,0,0,0.1)] z-50 p-1.5 overflow-hidden origin-top-right ring-1 ring-black/5"
                                    >
                                        <div className="text-[8px] font-black text-zinc-400 px-3 py-2 uppercase tracking-[0.2em] border-b border-zinc-100/50 mb-1">Architectural Tools</div>

                                        <div className="grid gap-1">
                                            {[
                                                { icon: Sparkles, label: 'Summarize', color: 'text-lime-600', bg: 'bg-lime-50', action: () => handleLoopyAction('summarize') },
                                                { icon: BarChart2, label: 'Create Poll', color: 'text-sky-600', bg: 'bg-sky-50', action: () => setShowPollCreator(true) },
                                                { icon: Palette, label: 'Chat Themes', color: 'text-purple-600', bg: 'bg-purple-50', action: () => setShowThemePicker(true) },
                                                ...(isGroup ? [{ icon: Info, label: 'Circle Info', color: 'text-zinc-600', bg: 'bg-zinc-100', action: () => setShowInfoPanel(true) }] : [])
                                            ].map((item, i) => (
                                                <motion.button
                                                    key={item.label}
                                                    initial={{ opacity: 0, x: -5 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.04 }}
                                                    onClick={() => { item.action(); setShowMoreMenu(false); }}
                                                    className={`w-full flex items-center gap-3 px-3 py-2.5 hover:${item.bg} rounded-md text-[13px] font-bold text-zinc-700 transition-all group/item active:scale-[0.98]`}
                                                >
                                                    <div className={`w-8 h-8 rounded-md ${item.bg} border border-black/5 flex items-center justify-center ${item.color} group-hover/item:shadow-sm group-hover/item:scale-105 transition-all`}>
                                                        <item.icon size={16} />
                                                    </div>
                                                    <span className="flex-1 text-left">{item.label}</span>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Search Bar Overlay */}
                <AnimatePresence>
                    {isSearching && (
                        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute inset-0 bg-white/95 backdrop-blur-xl flex items-center px-4 md:px-6 gap-3 z-50">
                            <Search size={18} className="text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Search conversation..."
                                value={msgSearchTerm}
                                onChange={(e) => setMsgSearchTerm(e.target.value)}
                                autoFocus
                                className="flex-1 bg-transparent border-none outline-none text-sm font-bold placeholder:text-zinc-300"
                            />
                            <Button variant="ghost" size="sm" className="font-black uppercase tracking-widest text-[10px]" onClick={() => { setIsSearching(false); setMsgSearchTerm(""); }}>Close</Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </header>

            {/* Pinned Message Bar */}
            <AnimatePresence>
                {pinnedMsg && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="bg-zinc-50/80 backdrop-blur-md border-b border-zinc-200/50 px-4 md:px-6 py-2.5 flex items-center justify-between z-30 relative overflow-hidden">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-lime-500" />
                        <div className="flex items-center gap-3 min-w-0 cursor-pointer group" onClick={() => scrollToMessage(pinnedMsg.messageId)}>
                            <div className="w-8 h-8 rounded-lg bg-lime-100 flex items-center justify-center shrink-0 text-lime-600 group-hover:scale-110 transition-transform">
                                <Pin size={14} className="fill-current" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[9px] font-black uppercase tracking-widest text-lime-600 leading-none mb-1">Pinned Message</p>
                                <p className="text-xs font-bold text-zinc-900 truncate max-w-[200px] md:max-w-md">{pinnedMsg.text || "View attachment"}</p>
                            </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-300 hover:text-red-500 hover:bg-red-50" onClick={handleUnpinMessage}>
                            <PinOff size={14} />
                        </Button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Chat Content Area */}
            <div className="flex-1 flex overflow-hidden relative">
                <div className="flex-1 flex flex-col h-full min-w-0">
                    {/* Messages Area */}
                    <div className="flex-1 overflow-hidden flex flex-col relative">
                        {/* Browsing Banner - Moved OUTSIDE scroll container for fixed visibility */}
                        <AnimatePresence>
                            {!isAtBottom && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20, x: '-50%' }}
                                    animate={{ opacity: 1, y: 0, x: '-50%' }}
                                    exit={{ opacity: 0, y: 20, x: '-50%' }}
                                    className="absolute bottom-6 left-1/2 z-50 pointer-events-none"
                                >
                                    <div className="pointer-events-auto">
                                        <Button
                                            onClick={() => scrollToBottom()}
                                            className="bg-zinc-900/95 backdrop-blur-md text-white border border-white/10 shadow-2xl rounded-xl px-5 py-2.5 flex items-center gap-2 hover:bg-black transition-all active:scale-95 group"
                                        >
                                            <div className="flex flex-col items-start leading-tight">
                                                <span className="text-[8px] font-black uppercase tracking-widest text-zinc-400">Browsing History</span>
                                                <span className="text-[10px] font-black uppercase tracking-tight text-[#D4F268]">Jump to Latest</span>
                                            </div>
                                            <div className="h-6 w-px bg-white/10 mx-1" />
                                            <ChevronDown size={14} className="group-hover:translate-y-0.5 transition-transform text-[#D4F268]" />
                                        </Button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div
                            ref={scrollContainerRef}
                            onScroll={handleScroll}
                            className="flex-1 overflow-y-auto p-4 md:p-8 space-y-2 relative scroll-smooth custom-scrollbar"
                        >
                            <div ref={scrollContentRef} className="space-y-2">
                                {groupMessagesByDate(filteredMessages).map((group, groupIdx) => (
                                    <div key={`group-${String(group.date)}-${groupIdx}`} className="space-y-2 pb-8">
                                        <div className="flex justify-center my-8 sticky top-2 z-20">
                                            <div className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-zinc-200/50 shadow-sm">
                                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{group.date}</span>
                                            </div>
                                        </div>

                                        {group.messages.map((msg, msgIndex) => {
                                            const isMe = msg.senderId === currentUserId;
                                            const isMenuOpen = activeMenuId === msg.id;
                                            const repliedMsg = msg.replyToId ? messages.find(m => m.id === msg.replyToId) : null;
                                            const nextMsg = group.messages[msgIndex + 1];
                                            const isSameAuthorAsNext = nextMsg?.senderId === msg.senderId;

                                            // Check for unread line
                                            const isFirstUnread = lastReadId && group.messages[msgIndex - 1]?.id === lastReadId;

                                            const isHighlighted = msg.id === highlightedId;

                                            return (
                                                <motion.div
                                                    key={String(msg.id) || `msg-${msgIndex}`}
                                                    id={`msg-${msg.id}`}
                                                    className="rounded-xl transition-all duration-500"
                                                >
                                                    {isFirstUnread && (
                                                        <div className="flex items-center gap-4 my-8">
                                                            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-red-100" />
                                                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest px-3 py-1 bg-red-50 rounded-full border border-red-100 shadow-sm">New Messages</span>
                                                            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-red-100" />
                                                        </div>
                                                    )}
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        className={`flex ${isMe ? "justify-end" : "justify-start"} group ${isSameAuthorAsNext ? 'mb-0.5' : 'mb-4'}`}
                                                    >
                                                        {!isMe && (
                                                            <div className="w-8 md:w-10 flex-shrink-0 mr-2 flex flex-col justify-start">
                                                                {(msgIndex === 0 || group.messages[msgIndex - 1]?.senderId !== msg.senderId) && (
                                                                    <Avatar
                                                                        src={msg.senderAvatar || peer?.avatarUrl}
                                                                        fallback={(msg.senderName || peer?.name || 'U').charAt(0)}
                                                                        className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-zinc-100 shadow-sm"
                                                                    />
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className={`max-w-[85%] md:max-w-[70%] relative ${isMe ? "items-end ml-auto" : "items-start"} flex flex-col group/msg`}>
                                                            <div className="relative flex items-start group">
                                                                <button
                                                                    onClick={(e) => { e.stopPropagation(); setActiveMenuId(isMenuOpen ? null : msg.id); }}
                                                                    className={`absolute top-0 ${isMe ? 'right-full mr-1' : 'left-full ml-1'} p-1.5 rounded-full bg-white shadow-md text-zinc-400 hover:text-zinc-900 transition-all opacity-0 group-hover/msg:opacity-100 z-30 border border-zinc-100`}
                                                                >
                                                                    <ChevronDown size={14} className={isMenuOpen ? 'rotate-180' : ''} />
                                                                </button>

                                                                <AnimatePresence mode="popLayout">
                                                                    {isMenuOpen && (
                                                                        <>
                                                                            <div key="menu-overlay" className="fixed inset-0 z-40" onClick={() => setActiveMenuId(null)} />
                                                                            <motion.div
                                                                                key={`menu-${msg.id}`}
                                                                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                                                className={`absolute top-8 ${isMe ? 'right-0' : 'left-0'} w-56 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-zinc-200/50 p-1.5 z-50 overflow-hidden shadow-zinc-300/20`}
                                                                            >
                                                                                {/* Reaction Bar */}
                                                                                <div className="flex justify-between items-center px-2 py-1.5 bg-zinc-50/50 rounded-xl mb-1.5 border border-zinc-100">
                                                                                    {['❤️', '👍', '🔥', '😂', '😮', '😢'].map(emoji => {
                                                                                        const hasReacted = currentUserId && msg.reactions?.some(r => r.emoji === emoji && r.userIds.includes(currentUserId));
                                                                                        return (
                                                                                            <motion.button
                                                                                                key={emoji}
                                                                                                whileHover={{ scale: 1.3 }}
                                                                                                whileTap={{ scale: 0.8 }}
                                                                                                onClick={() => { toggleReaction(msg.id, emoji); setActiveMenuId(null); soundManager.playClick(0.7); }}
                                                                                                className={`text-xl transition-all ${hasReacted ? 'grayscale-0' : 'grayscale-[0.3] hover:grayscale-0'}`}
                                                                                            >
                                                                                                {emoji}
                                                                                            </motion.button>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                                <button onClick={() => { setReplyTo(msg); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 rounded-xl text-sm font-semibold text-zinc-700 transition-colors text-left"><Reply size={16} className="text-zinc-400" /> Reply</button>
                                                                                {isMe && !msg.isDeleted && <button onClick={() => { setEditingMsg(msg); setInputValue(msg.text || ""); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 rounded-xl text-sm font-semibold text-zinc-700 transition-colors text-left"><FileText size={16} className="text-blue-400" /> Edit</button>}
                                                                                <button onClick={() => { handlePinMessage(msg); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 rounded-xl text-sm font-semibold text-amber-600 transition-colors text-left"><Pin size={16} className="fill-current" /> Pin Message</button>
                                                                                <button onClick={() => { setForwardMsg(msg); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 rounded-xl text-sm font-semibold text-zinc-700 transition-colors text-left"><Share2 size={16} className="text-zinc-400" /> Forward</button>
                                                                                {msg.text && <button onClick={() => { navigator.clipboard.writeText(msg.text!); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 rounded-xl text-sm font-semibold text-zinc-700 transition-colors text-left"><Copy size={16} className="text-zinc-400" /> Copy</button>}
                                                                                <button onClick={() => setActiveMenuId(null)} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 rounded-xl text-sm font-semibold text-zinc-700 transition-colors text-left"><Star size={16} className="text-amber-400" /> Star</button>
                                                                                {isMe && <button onClick={() => { handleDelete(msg.id); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-xl text-sm font-semibold text-red-600 transition-colors text-left border-t border-zinc-50 mt-1"><X size={16} className="text-red-400" /> Delete</button>}
                                                                            </motion.div>
                                                                        </>
                                                                    )}
                                                                </AnimatePresence>

                                                                <motion.div
                                                                    animate={isHighlighted ? {
                                                                        boxShadow: isMe ? "0 0 25px rgba(212, 242, 104, 0.8)" : "0 0 25px rgba(132, 204, 22, 0.6)",
                                                                        border: isMe ? "2px solid rgba(0,0,0,0.1)" : "2px solid #D4F268"
                                                                    } : {
                                                                        boxShadow: isMe ? "0 1px 2px rgba(212, 242, 104, 0.05)" : "0 1px 2px rgba(229, 229, 224, 0.5)",
                                                                        border: isMe ? "0px solid transparent" : "1px solid #E5E5E0"
                                                                    }}
                                                                    className={`min-w-[80px] max-w-full flex flex-col rounded-lg overflow-hidden transition-all duration-300 z-10 ${isMe ? "bg-[#D4F268] text-[#1A1A1A] rounded-br-none shadow-sm shadow-[#D4F268]/5" : "bg-white text-[#1A1A1A] rounded-bl-none shadow-sm shadow-zinc-200/5"}`}
                                                                >
                                                                    {repliedMsg && (
                                                                        <div
                                                                            className="relative cursor-pointer group/reply"
                                                                            onClick={() => scrollToMessage(repliedMsg.id)}
                                                                        >
                                                                            <div className={`absolute -left-3 top-4 w-3 h-8 border-l-2 border-t-2 border-zinc-200 rounded-tl-lg pointer-events-none opacity-50 group-hover/reply:border-lime-400 group-hover/reply:opacity-100 transition-all`} />
                                                                            <div className={`px-2 py-1.5 border-l-[3px] m-1 rounded-md mb-0 text-xs ${isMe ? 'bg-black/5 border-black/20' : 'bg-zinc-50 border-zinc-300'} opacity-80 line-clamp-2 group-hover/reply:bg-lime-50/50 group-hover/reply:border-lime-500 transition-all`}>
                                                                                <span className="font-bold block text-[9px] uppercase tracking-tight mb-0.5">{repliedMsg.senderId === currentUserId ? 'You' : repliedMsg.senderName}</span>
                                                                                <div className="italic font-medium text-zinc-600">
                                                                                    {renderReplyContent(repliedMsg)}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    <div className="px-3 py-2">
                                                                        {msg.isDeleted ? (
                                                                            <p className="italic text-xs opacity-50 flex items-center gap-1.5 px-0.5 py-1">
                                                                                <X size={12} className="opacity-40" /> Message deleted
                                                                            </p>
                                                                        ) : msg.type === 'poll' && msg.pollId ? (
                                                                            <PollMessage pollId={msg.pollId} currentUserId={currentUserId} supabase={supabase} />
                                                                        ) : (
                                                                            <>
                                                                                {msg.text && msg.type === 'text' && (
                                                                                    <div className="relative">
                                                                                        {msg.text.includes('https://') && <LinkPreview url={msg.text.match(/https?:\/\/[^\s]+/)?.[0] || ""} isMe={isMe} />}
                                                                                        <p className="font-semibold leading-snug whitespace-pre-wrap text-sm">{msg.text}</p>
                                                                                        {msg.isEdited && (
                                                                                            <span className="text-[8px] font-bold uppercase tracking-tighter opacity-40 mt-0.5 block">Edited</span>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                                {(msg.mediaUrl || (msg.attachments && msg.attachments.length > 0)) && (
                                                                                    <div className={`mt-1.5 grid gap-1 ${(msg.attachments?.length || 1) === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                                                                        {msg.mediaUrl && (!msg.attachments || msg.attachments.length === 0) && (
                                                                                            <button key="legacy-media" type="button" className="relative rounded-lg overflow-hidden bg-zinc-100" onClick={() => setLightboxUrl(msg.mediaUrl!)}>
                                                                                                <img src={msg.mediaUrl} alt="" loading="lazy" className="w-full h-auto max-h-72 object-cover cursor-zoom-in" />
                                                                                            </button>
                                                                                        )}
                                                                                        {msg.attachments?.map((att, i) => (
                                                                                            <div key={`att-${i}-${att.url}`} className="rounded-lg overflow-hidden bg-zinc-100 relative">
                                                                                                {att.type === 'image' && <img src={att.url} alt="" loading="lazy" className="w-full h-48 object-cover cursor-zoom-in" onClick={() => setLightboxUrl(att.url)} />}
                                                                                                {att.type === 'video' && <video src={att.url} controls className="w-full h-48 object-cover" preload="metadata" />}
                                                                                                {att.type === 'audio' && <VoicePlayer url={att.url} />}
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                )}
                                                                                {msg.caption && <p className="mt-1.5 text-xs font-bold opacity-70 border-t border-black/5 pt-1 whitespace-pre-wrap">{msg.caption}</p>}
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </motion.div>
                                                            </div>
                                                            {msg.reactions && msg.reactions.length > 0 && (
                                                                <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                                    {msg.reactions.map(react => (
                                                                        <motion.button
                                                                            key={react.emoji}
                                                                            initial={{ scale: 0, y: 10 }}
                                                                            animate={{ scale: 1, y: 0 }}
                                                                            whileHover={{ scale: 1.2, rotate: [0, -5, 5, 0] }}
                                                                            whileTap={{ scale: 0.8 }}
                                                                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                                                                            onClick={() => toggleReaction(msg.id, react.emoji)}
                                                                            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[11px] font-bold border shadow-sm transition-all ${currentUserId && react.userIds.includes(currentUserId) ? 'bg-lime-400 border-lime-500 text-black' : 'bg-white border-zinc-100 text-zinc-500 hover:border-zinc-200'}`}
                                                                        >
                                                                            <span>{react.emoji}</span>
                                                                            {react.count > 1 && <span>{react.count}</span>}
                                                                        </motion.button>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            <div className={`flex items-center gap-1.5 mt-1 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                                <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                {isMe && (
                                                                    <div className="flex text-zinc-300">
                                                                        {msg.status === 'read' ? (
                                                                            <><Check size={10} className="text-[#3b82f6]" /><Check size={10} className="text-[#3b82f6] -ml-1" /></>
                                                                        ) : msg.status === 'delivered' ? (
                                                                            <><Check size={10} className="text-zinc-400" /><Check size={10} className="text-zinc-400 -ml-1" /></>
                                                                        ) : (
                                                                            <Check size={10} />
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                            <div ref={messagesEndRef} />
                            {/* Mobile Spacer */}
                            <div className="h-24 md:hidden" />
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="w-full bg-white/95 backdrop-blur-xl border-t border-zinc-200 z-40 shrink-0 transition-all duration-300 md:static fixed bottom-0 left-0 right-0 p-3 md:p-6 pb-[env(safe-area-inset-bottom)] md:pb-6">
                        <AnimatePresence mode="popLayout">
                            {showEmojiPicker && (
                                <motion.div
                                    key="emoji-picker"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="absolute bottom-full right-4 mb-4 z-50 shadow-2xl rounded-xl overflow-hidden border border-zinc-200 max-h-[80vh] flex flex-col"
                                >
                                    <div className="overflow-auto">
                                        <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="light" previewPosition="none" skinTonePosition="none" />
                                    </div>
                                </motion.div>
                            )}

                            {showAttachments && (
                                <motion.div
                                    key="attachment-menu"
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute bottom-full left-4 mb-4 z-50 bg-white/90 backdrop-blur-2xl rounded-xl shadow-2xl border border-zinc-200/50 p-2 w-52 overflow-hidden"
                                >
                                    <button key="att-photo" type="button" onClick={() => {
                                        if (fileInputRef.current) {
                                            fileInputRef.current.accept = "image/*";
                                            fileInputRef.current.click();
                                        }
                                        setShowAttachments(false);
                                    }} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-[#84cc16]/10 rounded-xl text-sm font-semibold text-zinc-700 transition-colors group/att">
                                        <ImageIcon size={18} className="text-blue-500 group-hover/att:scale-110 transition-transform" /> 
                                        Photos
                                    </button>
                                    <button key="att-video" type="button" onClick={() => {
                                        if (fileInputRef.current) {
                                            fileInputRef.current.accept = "video/*";
                                            fileInputRef.current.click();
                                        }
                                        setShowAttachments(false);
                                    }} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-[#84cc16]/10 rounded-xl text-sm font-semibold text-zinc-700 transition-colors group/att">
                                        <Video size={18} className="text-[#84cc16] group-hover/att:scale-110 transition-transform" /> 
                                        Videos
                                    </button>
                                    <button key="att-gif" type="button" onClick={() => { setShowGifPicker(true); setShowAttachments(false); }} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-[#84cc16]/10 rounded-xl text-sm font-semibold text-zinc-700 transition-colors group/att">
                                        <Gift size={18} className="text-purple-600 group-hover/att:scale-110 transition-transform" /> 
                                        GIFs & Stickers
                                    </button>
                                </motion.div>
                            )}

                            {showGifPicker && (
                                <motion.div
                                    key="gif-picker"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    className="absolute bottom-full left-4 right-4 mb-4 z-50 bg-white rounded-xl border border-zinc-200 shadow-2xl flex flex-col max-h-[400px] overflow-hidden"
                                >
                                    <div className="p-3 border-b flex gap-2 items-center bg-zinc-50">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                                            <input
                                                type="text"
                                                placeholder="Search GIPHY..."
                                                value={gifSearch}
                                                onChange={(e) => setGifSearch(e.target.value)}
                                                className="w-full bg-white border border-zinc-200 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-zinc-900/5"
                                                autoFocus
                                            />
                                        </div>
                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full" onClick={() => setShowGifPicker(false)}>
                                            <X size={16} />
                                        </Button>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 p-2 overflow-y-auto max-h-[300px] custom-scrollbar">
                                        {isLoadingGifs ? (
                                            <div key="loading-gifs" className="col-span-2 py-8 text-center text-xs font-bold text-zinc-400 uppercase tracking-widest">Finding GIFs...</div>
                                        ) : gifs.length > 0 ? (
                                            gifs.map((gif) => (
                                                <button
                                                    key={`gif-${gif.id}`}
                                                    type="button"
                                                    onClick={() => { handleSend("", "gif", gif.images.fixed_height.url); scrollToBottom(); }}
                                                    className="relative aspect-video rounded-lg overflow-hidden bg-zinc-100 group"
                                                >
                                                    <img src={gif.images.fixed_height_small.url} alt="" className="w-full h-full object-cover transition-transform group-hover:scale-110" loading="lazy" />
                                                </button>
                                            ))
                                        ) : (
                                            <div key="no-gifs" className="col-span-2 py-8 text-center text-xs text-zinc-400">No GIFs found</div>
                                        )}
                                    </div>
                                    <div className="text-[8px] text-center py-1 opacity-40 font-bold uppercase tracking-widest border-t">Powered by GIPHY</div>
                                </motion.div>
                            )}

                            {editingMsg && (
                                <motion.div key="edit-bar" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-blue-50 border-l-4 border-blue-500 mx-1 mb-4 rounded-r-2xl p-3 relative shadow-inner">
                                    <div className="pr-10">
                                        <span className="text-[10px] font-bold text-blue-800 uppercase block mb-1">Editing message</span>
                                        <p className="text-sm text-blue-600 truncate">{editingMsg.text}</p>
                                    </div>
                                    <button type="button" onClick={() => { setEditingMsg(null); setInputValue(""); }} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-blue-100 transition-colors text-blue-400"><X size={14} /></button>
                                </motion.div>
                            )}

                            {replyTo && (
                                <motion.div key="reply-bar" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-zinc-100 border-l-4 border-zinc-900 mx-1 mb-4 rounded-r-2xl p-3 relative shadow-inner">
                                    <div className="pr-10">
                                        <span className="text-[10px] font-bold text-zinc-900 uppercase block mb-1">Replying to {replyTo.senderName}</span>
                                        <div className="text-sm text-zinc-500 italic font-medium">
                                            {renderReplyContent(replyTo)}
                                        </div>
                                    </div>
                                    <button type="button" onClick={() => setReplyTo(null)} className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full hover:bg-zinc-200 transition-colors"><X size={14} /></button>
                                </motion.div>
                            )}
                            {pendingFiles.length > 0 && (
                                <motion.div key="pending-files-container" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mb-4 mx-1 flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                                    {pendingFiles.map((pf, i) => (
                                        <div key={`pending-${i}-${pf.previewUrl}`} className="relative inline-block flex-shrink-0 group">
                                            {pf.type === 'image' ? <img src={pf.previewUrl} alt="" className="h-24 w-24 rounded-lg object-cover border-2 border-zinc-900" /> : pf.type === 'video' ? <video src={pf.previewUrl} className="h-24 w-24 rounded-lg object-cover border-2 border-zinc-900" /> : <div className="h-24 w-24 rounded-lg border-2 border-zinc-900 bg-zinc-50 flex items-center justify-center text-zinc-500"><FileText size={24} /></div>}
                                            <button type="button" onClick={() => setPendingFiles(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-2 -right-2 w-6 h-6 bg-zinc-900 text-white rounded-full flex items-center justify-center shadow-lg"><X size={12} /></button>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (isRecording) { stopRecording(); return; }
                                if (recordedAudio) { handleSendVoice(); return; }
                                editingMsg ? handleEdit(editingMsg.id, inputValue) : handleSend();
                            }}
                            className="flex items-center gap-2 p-2 pl-4 bg-zinc-100/80 backdrop-blur-md rounded-xl border border-zinc-200/60 focus-within:border-zinc-400 focus-within:bg-white transition-all"
                        >
                            {isRecording ? (
                                <div key="recording-strip" className="flex-1 flex items-center gap-3 px-2 h-12 text-zinc-900 overflow-hidden">
                                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                                    <span className="font-black text-[10px] uppercase tracking-widest text-zinc-400 shrink-0">{formatTime(recordingTime)}</span>

                                    <div className="flex-1 h-8 flex items-center justify-center gap-[3px]">
                                        {audioLevels.map((level, i) => (
                                            <motion.div
                                                key={i}
                                                animate={{ height: level }}
                                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                                className="w-[2px] bg-[#D4F268] rounded-full"
                                                style={{ height: '4px' }}
                                            />
                                        ))}
                                    </div>

                                    <Button size="icon" type="button" variant="ghost" className="text-zinc-400 hover:text-red-500 rounded-full shrink-0" onClick={() => { stopRecording(); audioChunksRef.current = []; setRecordedAudio(null); }}><Trash2 size={18} /></Button>
                                    <Button size="icon" type="button" className="bg-zinc-900 text-white rounded-full w-10 h-10 shadow-lg shrink-0" onClick={stopRecording}><Square size={16} fill="currentColor" /></Button>
                                </div>
                            ) : recordedAudio ? (
                                <div key="preview-strip" className="flex-1 flex items-center gap-4 px-2 h-12">
                                    <div className="flex-1 overflow-hidden">
                                        <VoicePlayer url={recordedAudio.url} />
                                    </div>
                                    <Button size="icon" type="button" variant="ghost" className="text-zinc-400 hover:text-zinc-900 rounded-full" onClick={() => setRecordedAudio(null)}><Trash2 size={20} /></Button>
                                    <Button size="icon" type="submit" className="bg-[#D4F268] text-zinc-900 rounded-full w-12 h-12 shadow-xl shadow-lime-500/20 active:scale-95 transition-all"><Send size={22} /></Button>
                                </div>
                            ) : (
                                <>
                                    <input type="file" multiple ref={fileInputRef} className="hidden" accept="image/*,video/*,audio/*" onChange={handleFileUpload} />
                                    <Button size="icon" type="button" variant="ghost" className={`rounded-full w-10 h-10 shrink-0 transition-transform ${showAttachments ? "rotate-45 bg-zinc-200/50 text-zinc-900" : "text-zinc-500"}`} onClick={() => setShowAttachments(!showAttachments)} aria-label="Attachments"><Plus size={22} /></Button>
                                    <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={editingMsg ? "Edit message..." : "Message..."} className="flex-1 bg-transparent border-0 py-3 outline-none font-semibold text-zinc-900 placeholder:text-zinc-400" />
                                    <Button size="icon" type="button" variant="ghost" className="text-zinc-400 hover:text-zinc-600 transition-colors" onClick={() => setShowEmojiPicker(!showEmojiPicker)} aria-label="Emoji Picker"><Smile size={24} /></Button>
                                    {(inputValue.trim() || pendingFiles.length > 0) ? (
                                        <Button
                                            key="send-btn"
                                            size="icon"
                                            type="submit"
                                            onMouseDown={handleLongPressStart}
                                            onMouseUp={handleLongPressEnd}
                                            onMouseLeave={handleLongPressEnd}
                                            onTouchStart={handleLongPressStart}
                                            onTouchEnd={handleLongPressEnd}
                                            className={`rounded-full shadow-xl transition-all active:scale-95 ${editingMsg ? 'bg-blue-600 w-12 h-12' : 'bg-zinc-900 w-12 h-12'}`}
                                        >
                                            {editingMsg ? <Check size={20} className="text-white" /> : <Send size={20} className="text-white" />}
                                        </Button>
                                    ) : (
                                        <Button key="mic-btn" size="icon" type="button" variant="ghost" onClick={startRecording} className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded-full w-12 h-12 transition-all" aria-label="Voice Note"><Mic size={20} /></Button>
                                    )}
                                </>
                            )}
                        </form>
                    </div>
                </div>

                {/* Side Info Panel */}
                {localPeer && isGroup && (
                    <div className={`${showInfoPanel ? 'w-80 border-l border-zinc-200' : 'w-0'} transition-all duration-300 overflow-hidden hidden md:block shrink-0 h-full bg-white`}>
                        <CircleInfoPanel
                            peer={localPeer}
                            isOpen={showInfoPanel}
                            onClose={() => setShowInfoPanel(false)}
                            supabase={supabase}
                            onUpdate={(newDetails) => setLocalPeer(prev => prev ? { ...prev, ...newDetails } : null)}
                        />
                    </div>
                )}

                {/* Mobile Info Panel Overlay */}
                {localPeer && isGroup && (
                    <div className="md:hidden">
                        <CircleInfoPanel
                            peer={localPeer}
                            isOpen={showInfoPanel}
                            onClose={() => setShowInfoPanel(false)}
                            supabase={supabase}
                            onUpdate={(newDetails) => setLocalPeer(prev => prev ? { ...prev, ...newDetails } : null)}
                        />
                    </div>
                )}
            </div>

            {/* Forward Modal */}
            <AnimatePresence>
                {forwardMsg && (
                    <div key="forward-overlay" className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-md" onClick={() => setForwardMsg(null)}>
                        <motion.div key="forward-card" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl border border-zinc-100" onClick={e => e.stopPropagation()}>
                            <div className="p-6 border-b border-zinc-100 flex items-center justify-between"><h3 className="text-lg font-bold text-zinc-900 uppercase tracking-tight">Forward to...</h3><button onClick={() => setForwardMsg(null)} className="p-2 hover:bg-zinc-50 rounded-full transition-colors"><X size={20} /></button></div>
                            <div className="max-h-[400px] overflow-y-auto p-2">
                                {recentPeers.map(p => (
                                    <button key={`peer-${p.id}`} onClick={() => handleForward(p)} className="w-full flex items-center gap-3 p-3 hover:bg-zinc-50 rounded-xl text-left"><Avatar src={p.avatarUrl} fallback={p.name.charAt(0)} className="w-10 h-10 rounded-full" /><div className="flex-1 min-w-0"><p className="font-bold text-zinc-900 truncate">{p.name}</p><p className="text-xs text-zinc-400 uppercase font-bold">{p.type}</p></div><div className="w-8 h-8 rounded-full bg-zinc-900 text-white flex items-center justify-center"><Send size={14} /></div></button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxUrl && (
                    <motion.div key="lightbox-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightboxUrl(null)}>
                        <img src={lightboxUrl} alt="" className="max-w-full max-h-[90vh] rounded-lg object-contain shadow-2xl" />
                        <button onClick={() => setLightboxUrl(null)} className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-xl"><X size={24} /></button>
                    </motion.div>
                )}
            </AnimatePresence>
            {/* Media Gallery Modal */}
            <AnimatePresence>
                {showMediaGallery && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-white/95 backdrop-blur-2xl flex flex-col p-6"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-zinc-900 tracking-tighter">Media Gallery</h2>
                                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Shared in this conversation</p>
                            </div>
                            <Button size="icon" variant="ghost" className="rounded-full bg-zinc-100" onClick={() => setShowMediaGallery(false)}><X size={20} /></Button>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                                {messages.filter(m => !m.isDeleted && (m.mediaUrl || (m.attachments && m.attachments.length > 0))).flatMap(m => {
                                    const allMedia = [];
                                    if (m.mediaUrl) allMedia.push({ url: m.mediaUrl, type: 'image' });
                                    if (m.attachments) {
                                        m.attachments.forEach(att => {
                                            if (att.type === 'image' || att.type === 'video') allMedia.push(att);
                                        });
                                    }
                                    return allMedia;
                                }).map((media, i) => (
                                    <motion.button
                                        key={`${media.url}-${i}`}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.02 }}
                                        onClick={() => { setLightboxUrl(media.url); setShowMediaGallery(false); }}
                                        className="aspect-square rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 hover:scale-[1.02] transition-transform relative group/media"
                                    >
                                        {media.type === 'image' ? (
                                            <img src={media.url} alt="" className="w-full h-full object-cover" loading="lazy" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-zinc-200">
                                                <Video size={24} className="text-zinc-500" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/0 group-hover/media:bg-black/10 transition-colors" />
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- NEW FEATURE OVERLAYS --- */}

            {/* Loopy AI Panel */}
            <AnimatePresence>
                {showLoopyPanel && (
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="absolute inset-x-0 bottom-0 z-[60] bg-white rounded-t-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.15)] border-t border-zinc-100 overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Fixed Header */}
                        <div className="px-6 md:px-8 pt-6 pb-2 shrink-0 flex flex-col items-center border-b border-zinc-100/50">
                            <div className="w-12 h-1.5 bg-zinc-200 rounded-full mb-6 cursor-pointer hover:bg-zinc-300 transition-colors" onClick={() => setShowLoopyPanel(false)} />
                            
                            <div className="flex w-full items-start gap-4 md:gap-6 mb-4">
                                <div className="relative flex-shrink-0">
                                    <div className="md:hidden">
                                        <LoopyMascot size={60} mood={isLoopyTyping ? "thinking" : loopyResponse ? "happy" : "surprised"} />
                                    </div>
                                    <div className="hidden md:block">
                                        <LoopyMascot size={80} mood={isLoopyTyping ? "thinking" : loopyResponse ? "happy" : "surprised"} />
                                    </div>
                                    <motion.div 
                                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="absolute -top-1 -right-1 w-3 h-3 md:w-4 md:h-4 bg-[#84cc16] rounded-full border-2 border-white shadow-sm"
                                    />
                                </div>
                                <div className="flex-1 pt-1 md:pt-2">
                                    <h2 className="text-xl md:text-2xl font-black text-zinc-900 leading-tight">Loopy AI</h2>
                                    <p className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-[0.2em]">Contextual Mastery Assistant</p>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Content Container */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 md:px-8 py-6 w-full max-w-2xl mx-auto">

                            <div className="w-full min-h-[160px] mb-8 relative">
                                {isLoopyTyping ? (
                                    <div className="flex flex-col items-center justify-center gap-4 py-8">
                                        <div className="flex gap-2">
                                            {[0, 1, 2].map((i) => (
                                                <motion.div 
                                                    key={i}
                                                    animate={{ y: [0, -8, 0], opacity: [0.3, 1, 0.3] }} 
                                                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} 
                                                    className="w-2.5 h-2.5 bg-[#84cc16] rounded-full shadow-[0_0_10px_rgba(132,204,22,0.3)]" 
                                                />
                                            ))}
                                        </div>
                                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Mastering Context...</span>
                                    </div>
                                ) : loopyResponse ? (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.98 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="w-full space-y-5"
                                    >
                                        {(typeof loopyResponse === 'string' || !loopyResponse.type) ? (
                                            <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 shadow-sm">
                                                <p className="text-sm font-semibold text-zinc-800 leading-relaxed italic">
                                                    "{typeof loopyResponse === 'string' ? loopyResponse : 'Wait, I lost my train of thought! 🦉'}"
                                                </p>
                                            </div>
                                        ) : loopyResponse.type === 'summary' ? (
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                                                    {loopyResponse.highlights?.map((h: any, i: number) => (
                                                        <motion.div 
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            transition={{ delay: i * 0.1 }}
                                                            key={i} 
                                                            className="flex items-center gap-2.5 md:gap-3.5 p-3 md:p-4 bg-white rounded-2xl border border-zinc-100 shadow-sm hover:border-lime-200 transition-all group"
                                                        >
                                                            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-lime-50 flex items-center justify-center text-lg md:text-xl group-hover:scale-110 transition-transform">{h.icon}</div>
                                                            <span className="text-[10px] md:text-[11px] font-black text-zinc-800 leading-tight uppercase tracking-tight">{h.text}</span>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                                <div className="p-6 bg-zinc-950 rounded-3xl border border-zinc-900 shadow-2xl relative overflow-hidden group">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#84cc16]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[#84cc16]/10 transition-colors" />
                                                    <p className="relative text-[15px] font-medium text-white/90 leading-relaxed italic">
                                                        "{loopyResponse.summary}"
                                                    </p>
                                                </div>
                                                <div className="flex items-center justify-center gap-4">
                                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
                                                    <div className="flex flex-col items-center">
                                                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-1">Conclusion</span>
                                                        <span className="font-black text-[#84cc16] text-[13px] uppercase tracking-tighter">
                                                            {loopyResponse.conclusion}
                                                        </span>
                                                    </div>
                                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-zinc-200 to-transparent" />
                                                </div>
                                            </div>
                                        ) : loopyResponse.type === 'explanation' ? (
                                            <div className="space-y-6">
                                                <div className="flex items-center justify-between">
                                                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#84cc16] text-black rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-lime-500/20">
                                                        <Sparkles size={12} /> {loopyResponse.concept}
                                                    </div>
                                                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Scientific Breakdown</div>
                                                </div>
                                                
                                                <div className="p-6 bg-zinc-50 rounded-3xl border border-zinc-100 relative group">
                                                    <Quote size={24} className="absolute -top-3 -left-2 text-lime-400 opacity-30 group-hover:opacity-100 transition-opacity" />
                                                    <p className="text-[15px] font-semibold text-zinc-800 leading-relaxed">
                                                        {loopyResponse.explanation}
                                                    </p>
                                                </div>

                                                {loopyResponse.code && (
                                                    <div className="relative group">
                                                        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button 
                                                                onClick={() => {
                                                                    navigator.clipboard.writeText(loopyResponse.code);
                                                                    soundManager.playClick(0.5);
                                                                }}
                                                                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white/50 hover:text-white transition-all backdrop-blur-md"
                                                                title="Copy Code"
                                                            >
                                                                <Copy size={14} />
                                                            </button>
                                                        </div>
                                                        <div className="bg-zinc-950 rounded-3xl p-6 border border-zinc-800 shadow-2xl overflow-hidden">
                                                            <div className="flex gap-1.5 mb-4">
                                                                <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                                                                <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                                                                <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                                                            </div>
                                                            <div className="overflow-x-auto max-h-[250px] custom-scrollbar">
                                                                <code className="text-[11px] font-mono text-lime-300/80 whitespace-pre">
                                                                    {loopyResponse.code}
                                                                </code>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                                <motion.div 
                                                    whileHover={{ scale: 1.02 }}
                                                    className="p-4 md:p-5 bg-lime-400/10 rounded-3xl border-2 border-lime-400/20 flex gap-4 md:gap-5 items-center group/quest shadow-sm"
                                                >
                                                    <div className="w-12 h-12 md:w-14 md:h-14 bg-black rounded-2xl flex items-center justify-center text-lime-400 shadow-xl group-hover/quest:rotate-12 transition-transform flex-shrink-0">
                                                        <HelpCircle size={24} className="md:size-28" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-[8px] md:text-[9px] font-black text-[#84cc16] uppercase tracking-widest mb-1 md:mb-1.5">Socratic Inquiry</p>
                                                        <p className="text-xs md:text-sm font-black text-zinc-900 leading-tight">
                                                            {loopyResponse.question}
                                                        </p>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        ) : (
                                            <div className="p-6 bg-zinc-50 rounded-2xl border border-zinc-100 text-sm font-semibold text-zinc-500 text-center">
                                                {typeof loopyResponse === 'string' ? loopyResponse : "Got a bit confused by the source's wisdom. Check back soon!"}
                                            </div>
                                        )}
                                    </motion.div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <Button 
                                            variant="outline" 
                                            className="h-auto flex-row sm:flex-col p-6 border-2 border-zinc-100 hover:border-[#84cc16] hover:bg-lime-50/50 gap-4 rounded-3xl transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 group" 
                                            onClick={() => handleLoopyAction('explain')}
                                        >
                                            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                                <Brain size={28} className="text-[#3b82f6]" />
                                            </div>
                                            <div className="text-left sm:text-center">
                                                <span className="block text-xs font-black uppercase tracking-widest text-zinc-900">Explain Mastery</span>
                                                <span className="block text-[10px] text-zinc-400 font-bold mt-1">Deep dives into patterns</span>
                                            </div>
                                        </Button>
                                        <Button 
                                            variant="outline" 
                                            className="h-auto flex-row sm:flex-col p-6 border-2 border-zinc-100 hover:border-[#84cc16] hover:bg-lime-50/50 gap-4 rounded-3xl transition-all shadow-sm hover:shadow-xl hover:-translate-y-1 group" 
                                            onClick={() => handleLoopyAction('summarize')}
                                        >
                                            <div className="w-12 h-12 bg-lime-50 rounded-2xl flex items-center justify-center group-hover:bg-lime-100 transition-colors">
                                                <ListChecks size={28} className="text-[#84cc16]" />
                                            </div>
                                            <div className="text-left sm:text-center">
                                                <span className="block text-xs font-black uppercase tracking-widest text-zinc-900">Summarize Log</span>
                                                <span className="block text-[10px] text-zinc-400 font-bold mt-1">Atomic key highlights</span>
                                            </div>
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Fixed Footer Action */}
                        <div className="px-6 pb-8 pt-4 bg-white flex justify-center shrink-0 border-t border-zinc-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-20">
                            <Button 
                                className="w-full max-w-sm bg-zinc-900 hover:bg-black text-white rounded-3xl py-6 md:py-7 font-black uppercase tracking-[0.2em] text-[10px] md:text-[11px] shadow-2xl shadow-zinc-950/20 active:scale-95 transition-all shrink-0" 
                                onClick={() => { setShowLoopyPanel(false); setLoopyResponse(null); }}
                            >
                                Wisdom Received
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
