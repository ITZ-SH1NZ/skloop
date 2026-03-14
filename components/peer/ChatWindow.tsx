import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { 
    Send, Plus, Image as ImageIcon, Smile, X, Search, 
    ArrowLeft, Info, Users as UsersIcon, Camera, FileText, 
    ZoomIn, Mic, Square, Check, Video, Reply, Share2, 
    Play, Pause, FastForward, Clock, ChevronDown, Copy, Star, Pin, Gift, Trash2
} from "lucide-react";
import { PeerProfile } from "./PeerCard";
import { CircleInfoPanel } from "./CircleInfoPanel";
import { motion, AnimatePresence } from "framer-motion";
import data from '@emoji-mart/data';
import dynamic from 'next/dynamic';
import { createClient } from "@/utils/supabase/client";
import { getConversationMessages, sendMessage, MessageRow, uploadChatFile, markMessagesAsRead, deleteMessage, toggleReaction } from "@/actions/chat-actions";
import { soundManager } from "@/lib/sound";

const Picker = dynamic(() => import('@emoji-mart/react'), { ssr: false });

/**
 * Link Preview / Spotlight Component
 */
const LinkPreview = ({ url }: { url: string }) => {
    const domain = new URL(url).hostname;
    return (
        <motion.a 
            href={url} 
            target="_blank" 
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-3 bg-zinc-50 rounded-xl border border-zinc-200 hover:bg-zinc-100 transition-colors my-2 no-underline"
        >
            <div className="w-10 h-10 bg-zinc-200 rounded-lg flex items-center justify-center text-zinc-500">
                <Share2 size={20} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-[#84cc16] mb-0.5">{domain}</p>
                <p className="text-sm font-bold text-zinc-900 truncate">{url}</p>
            </div>
            <ArrowLeft className="rotate-180 text-zinc-300" size={16} />
        </motion.a>
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

interface ChatWindowProps {
    peer: PeerProfile | null;
    currentUserId: string | null;
    onBack?: () => void;
    onPeerUpdate?: (updatedPeer: Partial<PeerProfile> & { id: string }) => void;
}

export function ChatWindow({ peer, currentUserId, onBack, onPeerUpdate }: ChatWindowProps) {
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
    const [isPeerOnline, setIsPeerOnline] = useState(false);
    const [lastSeenText, setLastSeenText] = useState<string | null>(null);
    const [localPeer, setLocalPeer] = useState<PeerProfile | null>(peer);
    const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
    const [showMediaGallery, setShowMediaGallery] = useState(false);
    const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [lastReadId, setLastReadId] = useState<string | null>(null);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const sentMessageIds = useRef<Set<string>>(new Set());
    const [audioLevels, setAudioLevels] = useState<number[]>(Array(30).fill(2));
    const [recordedAudio, setRecordedAudio] = useState<{ blob: Blob; url: string } | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const animationFrameRef = useRef<number | null>(null);

    const isGroup = peer?.type === 'group';
    const initialLoadRef = useRef(true);

    const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior });
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
            scrollToBottom("auto");
            initialLoadRef.current = false;
            if (messages.length > 0) setLastReadId(messages[messages.length - 1].id);
        } else if (isAtBottom) {
            scrollToBottom();
            if (messages.length > 0) setLastReadId(messages[messages.length - 1].id);
        }
    }, [messages, isAtBottom]);


    useEffect(() => {
        if (!peer || !currentUserId) return;
        const loadMessages = async () => {
            const history = await getConversationMessages(peer.id);
            setMessages(history);
            // Mark as read when loading history
            await markMessagesAsRead(peer.id, peer.peerId || peer.id);
        };
        loadMessages();

        const supabase = createClient();
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
                        if (prev.some(m => m.id === newMessage.id)) return prev;
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
                            isDeleted: newMessage.is_deleted
                        };
                        return [...prev, mapped];
                    });
                    if (newMessage.sender_id !== currentUserId) await markMessagesAsRead(peer.id, peer.peerId || peer.id);
                } else if (payload.eventType === 'UPDATE') {
                    const updated = payload.new as any;
                    setMessages(prev => prev.map(m => m.id === updated.id ? { 
                        ...m, 
                        isDeleted: updated.is_deleted,
                        text: updated.is_deleted ? "Message deleted" : updated.content,
                        status: updated.status,
                        isEdited: updated.is_edited
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
                    // Create a deep copy to ensure re-render
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
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [peer?.id, currentUserId]);

    useEffect(() => {
        if (!peer || isGroup) {
            setIsPeerOnline(false);
            setLastSeenText(null);
            return;
        }

        const supabase = createClient();
        
        // 1. Initial State from profile
        const fetchInitialStatus = async () => {
            const { data: profile } = await supabase
                .from('profiles')
                .select('last_seen')
                .eq('id', peer.id)
                .single();
            
            if (profile?.last_seen) {
                const lastSeen = new Date(profile.last_seen);
                const diff = (new Date().getTime() - lastSeen.getTime()) / 1000;
                
                if (diff < 120) { // If last_seen within 2 minutes, consider "likely" online even before sync
                    setIsPeerOnline(true);
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
                    setIsPeerOnline(false);
                }
            }
        };
        fetchInitialStatus();

        // 2. Realtime Presence Subscription
        const channel = supabase.channel('presence:online', {
            config: { presence: { key: 'online-sync' } }
        });

        channel
            .on('presence', { event: 'sync' }, () => {
                const state = channel.presenceState();
                const isOnline = !!state[peer.id];
                setIsPeerOnline(isOnline);
                if (isOnline) setLastSeenText(null);
            })
            .subscribe();

        return () => { channel.unsubscribe(); };
    }, [peer?.id, isGroup]);

    // 3. Typing Indicators (Realtime Broadcast)
    useEffect(() => {
        if (!peer || !currentUserId) return;

        const supabase = createClient();
        const typingChannel = supabase.channel(`chat:typing:${peer.id}`);

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
            .subscribe();

        return () => { typingChannel.unsubscribe(); };
    }, [peer?.id, currentUserId]);

    // Broadcast typing status
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        if (!peer || !currentUserId || !inputValue) {
            // If input is empty, immediately stop typing indicator
            if (currentUserId && peer) {
                const supabase = createClient();
                supabase.channel(`chat:typing:${peer.id}`).send({
                    type: 'broadcast',
                    event: 'typing',
                    payload: { userId: currentUserId, isTyping: false }
                });
            }
            return;
        }

        const supabase = createClient();
        const typingChannel = supabase.channel(`chat:typing:${peer.id}`);

        // Broadcast that we are typing
        typingChannel.send({
            type: 'broadcast',
            event: 'typing',
            payload: { userId: currentUserId, isTyping: true }
        });

        // Set a timeout to stop typing indicator after inactivity
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            typingChannel.send({
                type: 'broadcast',
                event: 'typing',
                payload: { userId: currentUserId, isTyping: false }
            });
        }, 3000);

        return () => {
            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        };
    }, [inputValue, peer?.id, currentUserId]);

    useEffect(() => {
        const fetchRecentPeers = async () => {
            const supabase = createClient();
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

    const handleSend = async (text: string = inputValue, type: MessageRow['type'] = "text", mediaUrl?: string) => {
        // Auto-scroll to bottom on send
        scrollToBottom();
        if (pendingFiles.length > 0) {
            if (!peer || !currentUserId) return;
            const caption = inputValue.trim() || undefined;
            const tempId = `temp-${Date.now()}`;
            const optimisticAttachments = pendingFiles.map(pf => ({ url: pf.previewUrl, type: pf.type, name: pf.file.name }));
            const finalType: MessageRow['type'] = pendingFiles.length === 1 ? pendingFiles[0].type : "file";
            const optimisticMsg: MessageRow = { id: tempId, senderId: currentUserId, attachments: optimisticAttachments, caption, type: finalType, status: "sent", replyToId: replyTo?.id, timestamp: new Date() };
            setMessages(prev => [...prev, optimisticMsg]);
            setInputValue("");
            const filesToUpload = [...pendingFiles];
            setPendingFiles([]);
            setShowAttachments(false);
            setReplyTo(null);
            try {
                const uploadPromises = filesToUpload.map(async (pf) => {
                    const formData = new FormData();
                    formData.append('file', pf.file);
                    const publicUrl = await uploadChatFile(formData);
                    return publicUrl ? { url: publicUrl, type: pf.type, name: pf.file.name } : null;
                });
                const uploadedAttachments = (await Promise.all(uploadPromises)).filter(Boolean) as any[];
                if (uploadedAttachments.length > 0) {
                    const saved = await sendMessage(peer.id, currentUserId, "", finalType, caption, uploadedAttachments, replyTo?.id);
                    setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: saved.id, attachments: uploadedAttachments } : m));
                }
            } catch { setMessages(prev => prev.filter(m => m.id !== tempId)); }
            return;
        }
        if ((!text && !mediaUrl) || !peer || !currentUserId) return;
        const content = mediaUrl || text;
        const tempId = `temp-${Date.now()}`;
        const newMsg: MessageRow = { id: tempId, senderId: currentUserId, text: type === 'text' ? content : undefined, type, mediaUrl: type !== 'text' ? content : undefined, status: "sent", replyToId: replyTo?.id, timestamp: new Date() };
        setMessages(prev => [...prev, newMsg]);
        setInputValue("");
        setShowEmojiPicker(false);
        setShowAttachments(false);
        setShowGifPicker(false);
        setReplyTo(null);
        try {
            const saved = await sendMessage(peer.id, currentUserId, content, type, undefined, [], replyTo?.id);
            setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: saved.id, status: saved.status } : m));
        } catch { setMessages(prev => prev.filter(m => m.id !== tempId)); }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length > 0) {
            const newPending = files.map(file => ({ file, previewUrl: URL.createObjectURL(file), type: (file.type.startsWith('image/') ? 'image' : file.type.startsWith('video/') ? 'video' : file.type.startsWith('audio/') ? 'audio' : 'file') as any }));
            setPendingFiles(prev => [...prev, ...newPending].slice(0, 10));
            setShowAttachments(false);
        }
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
        const optimisticAttachments = [{ url: recordedAudio.url, type: 'audio' as const, name: 'voice-note.webm' }];
        const optimisticMsg: MessageRow = { id: tempId, senderId: currentUserId, attachments: optimisticAttachments, type: "audio", status: "sent", timestamp: new Date() };
        
        setMessages(prev => [...prev, optimisticMsg]);
        setRecordedAudio(null);
        
        try {
            const formData = new FormData();
            formData.append('file', new File([recordedAudio.blob], 'voice-note.webm', { type: 'audio/webm' }));
            const publicUrl = await uploadChatFile(formData);
            if (publicUrl) {
                const saved = await sendMessage(peer.id, currentUserId, "", "audio", undefined, [{ url: publicUrl, type: 'audio', name: 'voice-note.webm' }]);
                setMessages(prev => prev.map(m => m.id === tempId ? { ...m, id: saved.id, attachments: [{ url: publicUrl, type: 'audio', name: 'voice-note.webm' }] } : m));
            }
        } catch (err) {
            console.error(err);
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

    const headerBg = isGroup ? "bg-zinc-900 text-white" : "bg-white/80 backdrop-blur-xl";

    return (
        <div className="flex flex-col h-full bg-zinc-50 relative overflow-hidden">
            {/* Header */}
            <div className={`flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-zinc-200 sticky top-0 flex-shrink-0 min-h-[70px] z-30 overflow-hidden pt-[calc(env(safe-area-inset-top)+0.5rem)] md:pt-4 ${headerBg}`}>
                <div className="flex items-center gap-4 flex-1 relative z-10">
                    {onBack && <Button size="icon" variant="ghost" onClick={onBack} className={`md:hidden -ml-2 ${isGroup ? "text-white hover:bg-white/10" : "text-zinc-500"}`}><ArrowLeft size={20} /></Button>}
                    {isSearching ? (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex items-center gap-2">
                            <input type="text" placeholder="Search messages..." value={msgSearchTerm} onChange={(e) => setMsgSearchTerm(e.target.value)} className={`flex-1 ${isGroup ? 'bg-white/10 text-white placeholder:text-white/40' : 'bg-zinc-100 text-zinc-900'} border-none rounded-xl px-5 py-2.5 text-sm font-medium outline-none`} autoFocus />
                            <Button size="sm" variant="ghost" className={isGroup ? "text-white" : ""} onClick={() => { setIsSearching(false); setMsgSearchTerm(""); }}>Cancel</Button>
                        </motion.div>
                    ) : (
                        <div className="flex items-center gap-4 flex-1">
                            <Avatar src={peer?.avatarUrl} fallback={peer?.name.charAt(0) || 'U'} className="w-10 h-10 md:w-11 md:h-11 rounded-full border-2 border-white shadow-sm" />
                            <div className="flex-1 min-w-0">
                                <div className={`font-bold text-lg md:text-xl leading-tight flex items-center gap-2 ${isGroup ? "text-white" : "text-zinc-900"}`}>{peer?.name}</div>
                                <div className={`text-[10px] md:text-xs font-semibold uppercase tracking-widest flex items-center gap-2 ${isGroup ? "text-white/60" : "text-zinc-400"}`}>
                                    {isGroup ? <span>Circle • {peer?.track}</span> : typingUsers.size > 0 ? (
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-lime-600 animate-pulse font-bold lowercase">typing</span>
                                            <div className="flex gap-[2px]">
                                                <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} className="w-1 h-1 bg-lime-500 rounded-full" />
                                                <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} className="w-1 h-1 bg-lime-500 rounded-full" />
                                                <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} className="w-1 h-1 bg-lime-500 rounded-full" />
                                            </div>
                                        </div>
                                    ) : isPeerOnline ? <><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /><span className="text-green-600">Online now</span></> : <span>{lastSeenText || 'Last seen recently'}</span>}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-1 md:gap-2 relative z-10">
                    <Button size="icon" variant="ghost" onClick={() => setShowMediaGallery(true)} className={isGroup ? "text-white hover:bg-white/10" : "text-zinc-500"} title="Media Gallery"><ImageIcon size={20} /></Button>
                    <Button size="icon" variant="ghost" onClick={() => setIsSearching(true)} className={isGroup ? "text-white hover:bg-white/10" : "text-zinc-500"}><Search size={20} /></Button>
                    {isGroup && (
                        <Button size="icon" variant="ghost" onClick={() => setShowInfoPanel(!showInfoPanel)} className={isGroup ? "text-white hover:bg-white/10" : "text-zinc-500"} title="Circle Info">
                            <Info size={20} />
                        </Button>
                    )}
                </div>
            </div>

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
                            {groupMessagesByDate(filteredMessages).map((group, groupIdx) => (
                                <div key={`group-${group.date}-${groupIdx}`} className="space-y-2 pb-8">
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
                                        const isFirstUnread = lastReadId && group.messages[msgIndex-1]?.id === lastReadId;

                                        return (
                                            <div key={msg.id}>
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
                                                            {(msgIndex === 0 || group.messages[msgIndex-1]?.senderId !== msg.senderId) && (
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
                                                                            <button onClick={() => { setReplyTo(msg); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 rounded-xl text-sm font-semibold text-zinc-700 transition-colors text-left"><Reply size={16} className="text-zinc-400"/> Reply</button>
                                                                            {isMe && !msg.isDeleted && <button onClick={() => { setEditingMsg(msg); setInputValue(msg.text || ""); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 rounded-xl text-sm font-semibold text-zinc-700 transition-colors text-left"><FileText size={16} className="text-blue-400"/> Edit</button>}
                                                                            <button onClick={() => { setForwardMsg(msg); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 rounded-xl text-sm font-semibold text-zinc-700 transition-colors text-left"><Share2 size={16} className="text-zinc-400"/> Forward</button>
                                                                            {msg.text && <button onClick={() => { navigator.clipboard.writeText(msg.text!); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 rounded-xl text-sm font-semibold text-zinc-700 transition-colors text-left"><Copy size={16} className="text-zinc-400" /> Copy</button>}
                                                                            <button onClick={() => setActiveMenuId(null)} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-zinc-50 rounded-xl text-sm font-semibold text-zinc-700 transition-colors text-left"><Star size={16} className="text-amber-400" /> Star</button>
                                                                            {isMe && <button onClick={() => { handleDelete(msg.id); setActiveMenuId(null); }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-red-50 rounded-xl text-sm font-semibold text-red-600 transition-colors text-left border-t border-zinc-50 mt-1"><X size={16} className="text-red-400"/> Delete</button>}
                                                                        </motion.div>
                                                                    </>
                                                                )}
                                                            </AnimatePresence>

                                                            <div className={`min-w-[80px] max-w-full flex flex-col rounded-lg shadow-sm overflow-hidden transition-all duration-200 z-10 ${isMe ? "bg-[#D4F268] text-[#1A1A1A] rounded-br-none shadow-[#D4F268]/5" : "bg-white text-[#1A1A1A] border border-[#E5E5E0] rounded-bl-none shadow-sm shadow-zinc-200/5"}`}>
                                                                {repliedMsg && (
                                                                    <div className="relative">
                                                                        <div className={`absolute -left-3 top-4 w-3 h-8 border-l-2 border-t-2 border-zinc-200 rounded-tl-lg pointer-events-none opacity-50`} />
                                                                        <div className={`px-2 py-1.5 border-l-[3px] m-1 rounded-md mb-0 text-xs ${isMe ? 'bg-black/5 border-black/20' : 'bg-zinc-50 border-zinc-300'} opacity-80 line-clamp-2`}>
                                                                            <span className="font-bold block text-[9px] uppercase tracking-tight mb-0.5">{repliedMsg.senderId === currentUserId ? 'You' : repliedMsg.senderName}</span>
                                                                            <p className="truncate italic font-medium">{repliedMsg.isDeleted ? 'Message deleted' : repliedMsg.text || 'Attachment'}</p>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <div className="px-3 py-2">
                                                                    {msg.isDeleted ? (
                                                                        <p className="italic text-xs opacity-50 flex items-center gap-1.5 px-0.5 py-1">
                                                                            <X size={12} className="opacity-40" /> Message deleted
                                                                        </p>
                                                                    ) : (
                                                                        <>
                                                                            {msg.text && (
                                                                                <div className="relative">
                                                                                    <p className="font-semibold leading-snug whitespace-pre-wrap text-sm">{msg.text}</p>
                                                                                    {msg.isEdited && (
                                                                                        <span className="text-[8px] font-bold uppercase tracking-tighter opacity-40 mt-0.5 block">Edited</span>
                                                                                    )}
                                                                                    {msg.text.match(/https?:\/\/[^\s]+/) && <LinkPreview url={msg.text.match(/https?:\/\/[^\s]+/)?.[0] || ""} />}
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
                                                            </div>
                                                        </div>
                                                        {msg.reactions && msg.reactions.length > 0 && (
                                                            <div className={`flex flex-wrap gap-1 mt-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                                {msg.reactions.map(react => (
                                                                    <motion.button 
                                                                        key={react.emoji}
                                                                        initial={{ scale: 0 }}
                                                                        animate={{ scale: 1 }}
                                                                        whileHover={{ scale: 1.1 }}
                                                                        whileTap={{ scale: 0.9 }}
                                                                        onClick={() => toggleReaction(msg.id, react.emoji)}
                                                                        className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold border transition-all ${currentUserId && react.userIds.includes(currentUserId) ? 'bg-lime-50 border-lime-200 text-lime-700' : 'bg-white border-zinc-100 text-zinc-500 hover:border-zinc-200'}`}
                                                                    >
                                                                        <span>{react.emoji}</span>
                                                                        {react.count > 1 && <span>{react.count}</span>}
                                                                    </motion.button>
                                                                ))}
                                                            </div>
                                                        )}
                                                        <div className={`flex items-center gap-1.5 mt-1 px-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                                                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                            {isMe && <div className="flex text-zinc-300">{msg.status === 'read' ? <><Check size={10} className="text-[#84cc16]" /><Check size={10} className="text-[#84cc16] -ml-1" /></> : msg.status === 'delivered' ? <><Check size={10} className="text-zinc-400" /><Check size={10} className="text-zinc-400 -ml-1" /></> : <Check size={10} />}</div>}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
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
                                    className="absolute bottom-full right-4 mb-4 z-50 shadow-2xl rounded-xl overflow-hidden border border-zinc-200"
                                >
                                    <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="light" previewPosition="none" skinTonePosition="none" />
                                </motion.div>
                            )}

                            {showAttachments && (
                                <motion.div 
                                    key="attachment-menu"
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute bottom-full left-4 mb-4 z-50 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl border border-zinc-200/50 p-2 w-52 overflow-hidden"
                                >
                                    <button key="att-photo" type="button" onClick={() => {
                                        if (fileInputRef.current) {
                                            fileInputRef.current.accept = "image/*";
                                            fileInputRef.current.click();
                                        }
                                        setShowAttachments(false);
                                    }} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-zinc-50 rounded-xl text-sm font-semibold text-zinc-700 transition-colors"><ImageIcon size={18} className="text-blue-500" /> Photos</button>
                                    <button key="att-video" type="button" onClick={() => {
                                        if (fileInputRef.current) {
                                            fileInputRef.current.accept = "video/*";
                                            fileInputRef.current.click();
                                        }
                                        setShowAttachments(false);
                                    }} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-zinc-50 rounded-xl text-sm font-semibold text-zinc-700 transition-colors"><Video size={18} className="text-[#D4F268] fill-zinc-900" /> Videos</button>
                                    <button key="att-gif" type="button" onClick={() => { setShowGifPicker(true); setShowAttachments(false); }} className="w-full flex items-center gap-3 px-3 py-3 hover:bg-zinc-50 rounded-xl text-sm font-semibold text-zinc-700 transition-colors"><Gift size={18} className="text-purple-600" /> GIFs & Stickers</button>
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
                                    <div className="pr-10"><span className="text-[10px] font-bold text-zinc-900 uppercase block mb-1">Replying to {replyTo.senderName}</span><p className="text-sm text-zinc-500 truncate">{replyTo.text || 'Media'}</p></div>
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
                                        <Button key="send-btn" size="icon" type="submit" className={`rounded-full shadow-xl transition-all active:scale-95 ${editingMsg ? 'bg-blue-600 w-12 h-12' : 'bg-zinc-900 w-12 h-12'}`}>
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
        </div>
    );
}
