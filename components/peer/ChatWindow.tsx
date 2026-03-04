import { useState, useEffect, useRef } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Send, Plus, Image as ImageIcon, Smile, X, Search, ArrowLeft, Info, Users as UsersIcon, Camera, FileText, ZoomIn } from "lucide-react";
import { PeerProfile } from "./PeerCard";
import { CircleInfoPanel } from "./CircleInfoPanel";
import { motion, AnimatePresence } from "framer-motion";
import data from '@emoji-mart/data';
import dynamic from 'next/dynamic';
import { createClient } from "@/utils/supabase/client";
import { getConversationMessages, sendMessage, MessageRow, uploadChatFile } from "@/actions/chat-actions";

const Picker = dynamic(() => import('@emoji-mart/react'), { ssr: false });

interface ChatWindowProps {
    peer: PeerProfile | null;
    onBack?: () => void;
    onPeerUpdate?: (updatedPeer: Partial<PeerProfile> & { id: string }) => void;
}

export function ChatWindow({ peer, onBack, onPeerUpdate }: ChatWindowProps) {
    const [messages, setMessages] = useState<MessageRow[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
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
    const [pendingFile, setPendingFile] = useState<{ file: File; previewUrl: string } | null>(null);
    const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

    const [localPeer, setLocalPeer] = useState<PeerProfile | null>(peer);

    useEffect(() => {
        setLocalPeer(peer);
    }, [peer]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    // Track sent message IDs to prevent realtime duplicates
    const sentMessageIds = useRef<Set<string>>(new Set());
    // Cache for sender profiles to avoid repeated fetches in realtime
    const senderProfileCache = useRef<Map<string, { name: string; avatarUrl?: string }>>(new Map());


    const isGroup = peer?.type === 'group';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!isSearching) scrollToBottom();
    }, [messages, peer, isSearching]);

    useEffect(() => {
        if (!peer) return;
        const supabase = createClient();
        let cleanup: (() => void) | undefined;

        const fetchMessages = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            setCurrentUserId(user.id);

            const msgs = await getConversationMessages(peer.id);

            // Pre-seed sender profile cache from fetched messages
            msgs.forEach(msg => {
                if (msg.senderId && msg.senderName && !senderProfileCache.current.has(msg.senderId)) {
                    senderProfileCache.current.set(msg.senderId, {
                        name: msg.senderName,
                        avatarUrl: msg.senderAvatar,
                    });
                }
            });

            setMessages(msgs);
        };

        fetchMessages();


        // Subscribe to real-time additions on this conversation
        const channel = supabase.channel(`conv:${peer.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'messages',
                    filter: `conversation_id=eq.${peer.id}`
                },
                async (payload) => {
                    const m = payload.new as any;
                    const isUrl = typeof m.content === 'string' && m.content.startsWith('http');
                    const isGif = isUrl && m.content.includes('giphy.com');

                    // Fetch sender profile if not cached
                    let senderName: string | undefined;
                    let senderAvatar: string | undefined;

                    if (senderProfileCache.current.has(m.sender_id)) {
                        const cached = senderProfileCache.current.get(m.sender_id)!;
                        senderName = cached.name;
                        senderAvatar = cached.avatarUrl;
                    } else {
                        try {
                            const { data: profile } = await supabase
                                .from('profiles')
                                .select('full_name, username, avatar_url')
                                .eq('id', m.sender_id)
                                .single();
                            if (profile) {
                                senderName = profile.full_name || profile.username || 'User';
                                senderAvatar = profile.avatar_url ?? undefined;
                                senderProfileCache.current.set(m.sender_id, {
                                    name: senderName!,
                                    avatarUrl: senderAvatar,
                                });
                            }
                        } catch {
                            // Fail silently — avatar just won't appear
                        }
                    }

                    const newMsg: MessageRow = {
                        id: m.id,
                        senderId: m.sender_id,
                        senderName,
                        senderAvatar,
                        text: !isUrl ? m.content : undefined,
                        caption: m.caption || undefined,
                        type: m.type || (isGif ? 'gif' : isUrl ? 'image' : 'text'),
                        mediaUrl: isUrl ? m.content : undefined,
                        timestamp: new Date(m.created_at),
                    };
                    setMessages(prev => {
                        // If UUID is already in list, do nothing (we might have added it optimistically or from fetch)
                        if (prev.some(existing => existing.id === m.id)) return prev;
                        // Otherwise append
                        return [...prev, newMsg];
                    });
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [peer?.id]);


    useEffect(() => {
        if (!showGifPicker) return;
        const fetchGifs = async () => {
            setIsLoadingGifs(true);
            try {
                const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;
                if (!apiKey) return;
                const endpoint = gifSearch
                    ? `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${gifSearch}&limit=10`
                    : `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=10`;
                const res = await fetch(endpoint);
                const json = await res.json();
                setGifs(json.data || []);
            } catch (err) { console.error("Failed to fetch GIFs", err); }
            finally { setIsLoadingGifs(false); }
        };
        const t = setTimeout(fetchGifs, 500);
        return () => clearTimeout(t);
    }, [showGifPicker, gifSearch]);

    const handleSend = async (text: string = inputValue, type: MessageRow['type'] = "text", mediaUrl?: string) => {
        // Special case: pending file with optional caption
        if (pendingFile) {
            if (!peer || !currentUserId) return;
            const caption = inputValue.trim() || undefined;
            const tempId = `temp-${Date.now()}`;
            const optimisticMsg: MessageRow = {
                id: tempId,
                senderId: currentUserId,
                mediaUrl: pendingFile.previewUrl, // Show local preview immediately
                caption,
                type: "image",
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, optimisticMsg]);
            setInputValue("");
            setPendingFile(null);
            setShowAttachments(false);

            try {
                const formData = new FormData();
                formData.append('file', pendingFile.file);
                const publicUrl = await uploadChatFile(formData);
                if (publicUrl) {
                    const saved = await sendMessage(peer.id, currentUserId, publicUrl, "image", caption);
                    setMessages(prev => {
                        const alreadyExists = prev.some(m => m.id === saved.id);
                        if (alreadyExists) return prev.filter(m => m.id !== tempId);
                        return prev.map(m => m.id === tempId ? { ...m, id: saved.id, mediaUrl: publicUrl } : m);
                    });
                }
            } catch {
                setMessages(prev => prev.filter(m => m.id !== tempId));
            }
            return;
        }

        if ((!text && !mediaUrl) || !peer || !currentUserId) return;
        const content = mediaUrl || text;

        // Optimistic update with a temp ID
        const tempId = `temp-${Date.now()}`;
        const newMsg: MessageRow = {
            id: tempId,
            senderId: currentUserId,
            text: type === 'text' ? content : undefined,
            type,
            mediaUrl: type !== 'text' ? content : undefined,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, newMsg]);
        setInputValue("");
        setShowEmojiPicker(false);
        setShowAttachments(false);
        setShowGifPicker(false);

        try {
            const saved = await sendMessage(peer.id, currentUserId, content, type);
            // Replace temp message with real one, ensuring no duplicates
            setMessages(prev => {
                const alreadyExists = prev.some(m => m.id === saved.id);
                if (alreadyExists) {
                    return prev.filter(m => m.id !== tempId);
                }
                return prev.map(m => m.id === tempId ? { ...m, id: saved.id } : m);
            });
        } catch {
            // Revert on error
            setMessages(prev => prev.filter(m => m.id !== tempId));
        }
    };


    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Stage file for preview instead of sending immediately
            const previewUrl = URL.createObjectURL(file);
            setPendingFile({ file, previewUrl });
            setShowAttachments(false);
        }
        // Reset input so same file can be re-selected
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleEmojiSelect = (emoji: any) => {
        setInputValue(prev => prev + emoji.native);
    };

    const filteredMessages = messages.filter(msg => {
        if (!msgSearchTerm) return true;
        return msg.type === "text" && msg.text?.toLowerCase().includes(msgSearchTerm.toLowerCase());
    });

    if (!peer) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-[#FDFCF8] h-full relative overflow-hidden">
                <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(212, 242, 104, 0.1) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(212, 242, 104, 0.1) 0%, transparent 40%)' }} />
                <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 rotate-3">
                    <Send className="text-[#1A1A1A] ml-1 mt-1" size={40} />
                </div>
                <h3 className="text-xl font-bold text-[#1A1A1A]">Your Messages</h3>
                <p className="text-zinc-500 mt-2 text-sm max-w-xs text-center">Select a chat from the sidebar to start messaging your peers.</p>
            </div>
        );
    }

    const headerBg = isGroup ? "bg-[#D4F268]" : "bg-[#FDFCF8] md:bg-[#FDFCF8]/90";

    return (
        <div className="flex flex-col h-full bg-[#FDFCF8] relative">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            {/* Header */}
            <div className={`flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-[#E5E5E0] sticky top-0 flex-shrink-0 min-h-[60px] md:backdrop-blur-md relative overflow-hidden pt-[calc(env(safe-area-inset-top)+0.75rem)] md:pt-4 rounded-t-3xl md:rounded-none ${headerBg}`}>
                {isGroup && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#D4F268] to-[#C3E055] opacity-100" />
                )}

                <div className="flex items-center gap-3 flex-1 relative z-10">
                    {onBack && (
                        <Button size="icon" variant="ghost" onClick={onBack} className={`md:hidden -ml-2 ${isGroup ? "text-zinc-900 hover:bg-white/20" : "text-zinc-500"}`}>
                            <ArrowLeft size={20} />
                        </Button>
                    )}

                    {isSearching ? (
                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex-1 flex items-center gap-2">
                            <input
                                type="text"
                                placeholder="Search..."
                                value={msgSearchTerm}
                                onChange={(e) => setMsgSearchTerm(e.target.value)}
                                className="flex-1 bg-zinc-100 border-none rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-zinc-900/10 outline-none"
                                autoFocus
                            />
                            <Button size="sm" variant="ghost" onClick={() => { setIsSearching(false); setMsgSearchTerm(""); }}>Cancel</Button>
                        </motion.div>
                    ) : (
                        <div className="flex items-center gap-3 flex-1">
                            {isGroup ? (
                                <div className="w-10 h-10 rounded-2xl bg-black/10 flex items-center justify-center text-base font-black text-[#1A1A1A] overflow-hidden">
                                    {peer.avatarUrl?.startsWith('http') ? (
                                        <img src={peer.avatarUrl} alt="" className="w-full h-full object-cover" />
                                    ) : peer.avatarUrl ? (
                                        peer.avatarUrl
                                    ) : (
                                        peer.name.charAt(0)
                                    )}
                                </div>
                            ) : (
                                <Avatar src={peer.avatarUrl} fallback={peer.name.charAt(0)} className="w-10 h-10 md:w-11 md:h-11 rounded-full border-2 shadow-sm border-white" />
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="font-bold text-base md:text-lg leading-tight flex items-center gap-2 text-[#1A1A1A]">
                                    {peer.name}
                                    {isGroup && (
                                        <span className="px-2 py-0.5 rounded-full bg-black/10 text-[#1A1A1A] text-[10px] font-bold uppercase tracking-wide border border-black/5">
                                            {peer.track}
                                        </span>
                                    )}
                                </div>
                                <div className={`text-xs font-medium flex items-center gap-1.5 ${isGroup ? "text-[#1A1A1A]/80" : "text-zinc-500"}`}>
                                    {isGroup ? (
                                        <><UsersIcon size={12} /><span>Study Circle</span></>
                                    ) : (
                                        <><span className="w-2 h-2 bg-green-500 rounded-full" /><span>Active</span></>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-1 md:gap-2 relative z-10">
                    {!isSearching && (
                        <>
                            <Button size="icon" variant="ghost" className={`rounded-full ${isGroup ? "text-zinc-900 hover:bg-white/20" : "text-zinc-400 hover:text-zinc-900"}`} onClick={() => setIsSearching(true)}>
                                <Search size={20} />
                            </Button>
                            {isGroup && (
                                <Button size="icon" variant="ghost" className={`rounded-full transition-colors ${showInfoPanel ? "text-zinc-900 bg-white/20" : "text-zinc-900 hover:bg-white/20"}`} onClick={() => setShowInfoPanel(!showInfoPanel)}>
                                    <Info size={20} />
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden relative z-0">
                <div className="flex-1 flex flex-col min-w-0 relative">
                    {/* Pinned Message for Groups */}
                    {isGroup && (
                        <div className="bg-[#D4F268]/10 border-b border-[#D4F268]/30 p-2 flex items-center justify-between text-xs px-4 md:px-6 backdrop-blur-sm sticky top-0 z-10 shadow-sm rounded-b-2xl md:rounded-none">
                            <div className="flex items-center gap-2 text-[#1A1A1A] font-medium truncate min-w-0 flex-1">
                                <span className="bg-[#D4F268] text-[#1A1A1A] px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide flex-shrink-0">Pin</span>
                                <span className="truncate">Welcome to the {peer.name} circle! 📌</span>
                            </div>
                        </div>
                    )}

                    {/* Messages List */}
                    <div className="flex-1 overflow-y-auto px-3 md:px-8 py-4 md:py-6 space-y-1 scroll-smooth pb-20 md:pb-6">
                        {filteredMessages.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-full text-center py-20 text-zinc-400">
                                <div className="w-14 h-14 bg-zinc-100 rounded-2xl flex items-center justify-center mb-3">
                                    <Send size={24} />
                                </div>
                                <p className="text-sm font-semibold text-zinc-600">No messages yet</p>
                                <p className="text-xs mt-1">Be the first to say hello! 👋</p>
                            </div>
                        )}
                        {filteredMessages.map((msg, index) => {
                            const isMe = msg.senderId === currentUserId;
                            const prevMsg = filteredMessages[index - 1];
                            const nextMsg = filteredMessages[index + 1];
                            const isSameAuthorAsPrev = prevMsg?.senderId === msg.senderId;
                            const isSameAuthorAsNext = nextMsg?.senderId === msg.senderId;
                            const showAvatar = !isMe && !isSameAuthorAsNext;
                            const showName = isGroup && !isMe && !isSameAuthorAsPrev;

                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 8, scale: 0.97 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.18 }}
                                    className={`flex ${isMe ? "justify-end" : "justify-start"} group ${isSameAuthorAsNext ? 'mb-0.5' : 'mb-3'}`}
                                >
                                    {!isMe && (
                                        <div className="w-8 md:w-9 flex-shrink-0 mr-2 flex flex-col justify-end">
                                            {showAvatar && (
                                                <Avatar
                                                    src={msg.senderAvatar || peer.avatarUrl}
                                                    fallback={(msg.senderName || peer.name).charAt(0)}
                                                    className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-zinc-100 shadow-sm"
                                                />
                                            )}
                                        </div>
                                    )}

                                    <div className={`max-w-[75%] md:max-w-[70%] relative ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                                        {showName && (
                                            <span className="text-[11px] font-semibold text-zinc-500 mb-1 ml-1">{msg.senderName}</span>
                                        )}
                                        {msg.text && (
                                            <div className={`px-4 py-2 md:py-2.5 rounded-2xl shadow-sm text-[15px] md:text-base leading-relaxed break-words relative transition-all duration-200 ${isMe
                                                ? "bg-[#D4F268] text-[#1A1A1A] font-medium rounded-br-sm hover:bg-[#C3E055]"
                                                : "bg-white text-[#1A1A1A] border border-[#E5E5E0] rounded-bl-sm hover:border-zinc-300 hover:shadow-md"
                                                }`}>
                                                {msg.text}
                                            </div>
                                        )}
                                        {(msg.type === "image" || msg.type === "gif") && msg.mediaUrl && (
                                            <div className="mt-1">
                                                <div
                                                    className="relative rounded-2xl overflow-hidden border border-zinc-100 shadow-sm cursor-zoom-in group/img"
                                                    onClick={() => msg.type === 'image' && setLightboxUrl(msg.mediaUrl!)}
                                                >
                                                    <img src={msg.mediaUrl} alt={msg.type === 'gif' ? 'GIF' : 'Attachment'} className="max-w-full w-64 h-auto object-cover" />
                                                    {msg.type === 'image' && (
                                                        <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/20 transition-all flex items-center justify-center">
                                                            <ZoomIn size={24} className="text-white opacity-0 group-hover/img:opacity-100 transition-opacity drop-shadow-lg" />
                                                        </div>
                                                    )}
                                                </div>
                                                {msg.caption && (
                                                    <div className={`px-3 py-1.5 mt-1 rounded-xl text-sm font-medium break-words ${isMe ? 'bg-[#D4F268]/80 text-[#1A1A1A]' : 'bg-white border border-[#E5E5E0] text-zinc-800'
                                                        }`}>
                                                        {msg.caption}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <span className={`text-[10px] mt-0.5 font-medium opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? "text-zinc-400 mr-1 self-end" : "text-zinc-400 ml-1"}`}>
                                            {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area - Desktop */}
                    <div className="hidden md:block p-3 md:p-4 bg-white border-t border-zinc-100 flex-shrink-0 relative z-20">
                        <AnimatePresence>
                            {showEmojiPicker && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }} className="absolute bottom-full right-0 mb-2 z-50 shadow-2xl rounded-3xl overflow-hidden border border-zinc-100">
                                    <Picker data={data} onEmojiSelect={handleEmojiSelect} theme="light" previewPosition="none" skinTonePosition="none" />
                                </motion.div>
                            )}
                            {showGifPicker && (
                                <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="absolute bottom-0 left-0 right-0 bg-white z-50 rounded-t-3xl border-t border-zinc-200 shadow-2xl flex flex-col h-[500px]">
                                    <div className="p-3 border-b border-zinc-100 flex gap-2 items-center">
                                        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} /><input type="text" placeholder="Search GIPHY..." value={gifSearch} onChange={(e) => setGifSearch(e.target.value)} className="w-full bg-zinc-100 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none" autoFocus /></div>
                                        <Button size="icon" variant="ghost" onClick={() => setShowGifPicker(false)}><X size={20} /></Button>
                                    </div>
                                    <div className="flex-1 overflow-y-auto p-2 grid grid-cols-2 gap-2">
                                        {isLoadingGifs ? <div className="col-span-full text-center p-4 text-zinc-400 text-sm">Loading...</div> : gifs.map((gif) => (
                                            <div key={gif.id} onClick={() => handleSend("", "gif", gif.images.downsized_medium.url)} className="cursor-pointer rounded-xl overflow-hidden h-28 relative bg-zinc-100">
                                                <img src={gif.images.fixed_width_small.url} alt={gif.title} className="w-full h-full object-cover" loading="lazy" />
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                            {showAttachments && (
                                <motion.div initial={{ opacity: 0, scale: 0.95, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 10 }} className="absolute bottom-full left-0 mb-3 ml-2 bg-white rounded-3xl shadow-xl border border-zinc-100 p-3 w-52 z-50">
                                    <div className="grid grid-cols-3 gap-2">
                                        <button onClick={() => { setShowAttachments(false); fileInputRef.current?.click(); }} className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"><ImageIcon size={20} /></div>
                                            <span className="text-[10px] font-bold text-zinc-600">Photos</span>
                                        </button>
                                        <button onClick={() => { setShowAttachments(false); setShowGifPicker(true); }} className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-colors">
                                            <div className="w-10 h-10 rounded-full bg-pink-100 text-pink-600 flex items-center justify-center"><FileText size={20} /></div>
                                            <span className="text-[10px] font-bold text-zinc-600">GIFs</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Pending File Preview */}
                        <AnimatePresence>
                            {pendingFile && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="mb-2 mx-1"
                                >
                                    <div className="relative inline-block">
                                        <img
                                            src={pendingFile.previewUrl}
                                            alt="Pending"
                                            className="h-24 w-auto max-w-[200px] rounded-2xl object-cover border-2 border-[#D4F268] shadow-md"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => { setPendingFile(null); }}
                                            className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                    <p className="text-[10px] text-zinc-400 mt-1 ml-1">Add a caption below and press send</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2 p-1.5 pl-3 bg-white rounded-[2rem] shadow-lg border border-[#E5E5E0] focus-within:ring-2 focus-within:ring-[#D4F268]/50 transition-all">
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />
                            <Button size="icon" type="button" className={`rounded-full w-9 h-9 shrink-0 transition-colors ${showAttachments ? "bg-[#D4F268] text-[#1A1A1A] rotate-45" : "bg-zinc-50 text-zinc-400 hover:text-[#1A1A1A]"}`} onClick={() => setShowAttachments(!showAttachments)}>
                                <Plus size={20} className="transition-transform duration-300" />
                            </Button>
                            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={pendingFile ? "Add a caption..." : `Message ${isGroup ? peer.name : peer.name.split(' ')[0]}...`} className="flex-1 bg-transparent border-0 py-3 text-[15px] outline-none placeholder:text-zinc-400 font-medium text-[#1A1A1A]" />
                            <div className="flex items-center gap-1">
                                <Button size="icon" type="button" className={`bg-transparent hover:text-pink-500 rounded-full w-9 h-9 shrink-0 transition-colors ${showGifPicker ? "text-pink-500 bg-pink-50" : "text-zinc-400"}`} onClick={() => { setShowGifPicker(!showGifPicker); setShowEmojiPicker(false); }}>
                                    <div className="font-bold text-[10px] border-2 border-current rounded-md px-1 pt-0.5 pb-0">GIF</div>
                                </Button>
                                <Button size="icon" type="button" className={`bg-transparent hover:text-amber-500 rounded-full w-9 h-9 shrink-0 transition-colors ${showEmojiPicker ? "text-amber-500 bg-amber-50" : "text-zinc-400"}`} onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowGifPicker(false); }}>
                                    <Smile size={20} />
                                </Button>
                            </div>
                            <Button size="icon" type="submit" className={`rounded-full w-10 h-10 shrink-0 transition-all flex items-center justify-center ${(inputValue.trim() || pendingFile) ? "bg-[#D4F268] text-[#1A1A1A] shadow-md hover:bg-[#C3E055]" : "bg-zinc-100 text-zinc-300"}`} disabled={!inputValue.trim() && !pendingFile}>
                                <Send size={18} className={(inputValue.trim() || pendingFile) ? "translate-x-0.5 ml-0.5" : ""} />
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Input Area - Mobile fixed */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 p-3 bg-white border-t border-zinc-100">
                    <AnimatePresence>
                        {showAttachments && (
                            <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }} className="absolute bottom-20 left-4 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl p-2 min-w-[160px] z-50 flex flex-col gap-1">
                                <button onClick={() => { setShowAttachments(false); fileInputRef.current?.click(); }} className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-lg text-sm text-gray-300 transition-colors w-full text-left">
                                    <ImageIcon size={16} className="text-blue-400" /><span>Photo</span>
                                </button>
                                <button onClick={() => { setShowAttachments(false); setShowGifPicker(true); }} className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-lg text-sm text-gray-300 transition-colors w-full text-left">
                                    <FileText size={16} className="text-purple-400" /><span>GIF</span>
                                </button>
                            </motion.div>
                        )}
                        {showGifPicker && (
                            <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 100 }} className="absolute bottom-0 left-0 right-0 bg-white z-50 rounded-t-3xl border-t border-zinc-200 shadow-2xl flex flex-col h-[400px]">
                                <div className="p-3 border-b border-zinc-100 flex gap-2 items-center">
                                    <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} /><input type="text" placeholder="Search GIPHY..." value={gifSearch} onChange={(e) => setGifSearch(e.target.value)} className="w-full bg-zinc-100 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none" autoFocus /></div>
                                    <Button size="icon" variant="ghost" onClick={() => setShowGifPicker(false)}><X size={20} /></Button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 grid grid-cols-2 gap-2">
                                    {isLoadingGifs ? <div className="col-span-full text-center p-4 text-zinc-400 text-sm">Loading...</div> : gifs.map((gif) => (
                                        <div key={gif.id} onClick={() => handleSend("", "gif", gif.images.downsized_medium.url)} className="cursor-pointer rounded-xl overflow-hidden h-28 bg-zinc-100">
                                            <img src={gif.images.fixed_width_small.url} alt={gif.title} className="w-full h-full object-cover" loading="lazy" />
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Pending File Preview - Mobile */}
                    <AnimatePresence>
                        {pendingFile && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="mb-2 mx-1"
                            >
                                <div className="relative inline-block">
                                    <img
                                        src={pendingFile.previewUrl}
                                        alt="Pending"
                                        className="h-20 w-auto max-w-[160px] rounded-2xl object-cover border-2 border-[#D4F268] shadow-md"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setPendingFile(null)}
                                        className="absolute -top-2 -right-2 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center shadow-lg"
                                    >
                                        <X size={12} />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2 p-1.5 pl-3 bg-white rounded-[2rem] shadow-lg border border-[#E5E5E0] focus-within:ring-2 focus-within:ring-[#D4F268]/50 transition-all">
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                        <Button size="icon" type="button" className={`rounded-full w-9 h-9 shrink-0 transition-colors ${showAttachments ? "bg-[#D4F268] text-[#1A1A1A] rotate-45" : "bg-zinc-50 text-zinc-400 hover:text-[#1A1A1A]"}`} onClick={() => setShowAttachments(!showAttachments)}>
                            <Plus size={20} />
                        </Button>
                        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder={pendingFile ? "Add a caption..." : "Message..."} className="flex-1 bg-transparent border-0 py-3 text-[15px] outline-none placeholder:text-zinc-400 font-medium text-[#1A1A1A]" />
                        <Button size="icon" type="button" className={`bg-transparent text-zinc-400 hover:text-pink-500 rounded-full w-9 h-9 shrink-0 transition-colors ${showGifPicker ? "text-pink-500 bg-pink-50" : ""}`} onClick={() => { setShowGifPicker(!showGifPicker); }}>
                            <div className="font-bold text-[10px] border-2 border-current rounded-md px-1 pt-0.5 pb-0">GIF</div>
                        </Button>
                        <Button size="icon" type="submit" className={`rounded-full w-10 h-10 shrink-0 transition-all flex items-center justify-center ${(inputValue.trim() || pendingFile) ? "bg-[#D4F268] text-[#1A1A1A] shadow-md hover:bg-[#C3E055]" : "bg-zinc-100 text-zinc-300"}`} disabled={!inputValue.trim() && !pendingFile}>
                            <Send size={18} className={(inputValue.trim() || pendingFile) ? "translate-x-0.5 ml-0.5" : ""} />
                        </Button>
                    </form>
                </div>

                {/* Circle Info Panel */}
                {localPeer && (
                    <CircleInfoPanel
                        peer={localPeer}
                        isOpen={showInfoPanel}
                        onClose={() => setShowInfoPanel(false)}
                        onUpdate={(newDetails: { name: string, description: string, avatarUrl: string, privacy: string }) => {
                            const updatedData = {
                                id: localPeer.id,
                                name: newDetails.name,
                                description: newDetails.description,
                                avatarUrl: newDetails.avatarUrl,
                                privacy: newDetails.privacy
                            };

                            setLocalPeer(prev => prev ? {
                                ...prev,
                                ...updatedData
                            } : null);

                            // Sync with parent state
                            onPeerUpdate?.(updatedData);
                        }}
                    />
                )}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxUrl && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-md"
                        onClick={() => setLightboxUrl(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.85, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            className="relative max-w-[90vw] max-h-[90vh]"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={lightboxUrl}
                                alt="Full view"
                                className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl"
                            />
                            <button
                                onClick={() => setLightboxUrl(null)}
                                className="absolute -top-4 -right-4 w-9 h-9 bg-white text-black rounded-full flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
                            >
                                <X size={18} />
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
