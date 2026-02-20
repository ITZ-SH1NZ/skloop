import { useState, useEffect, useRef } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Send, Plus, Image as ImageIcon, Smile, X, Search, ArrowLeft, Info, Users as UsersIcon, Camera, FileText } from "lucide-react";
import { PeerProfile } from "./PeerCard";
import { CircleInfoPanel } from "./CircleInfoPanel";
import { motion, AnimatePresence } from "framer-motion";
import data from '@emoji-mart/data';
import dynamic from 'next/dynamic';

const Picker = dynamic(() => import('@emoji-mart/react'), { ssr: false });

interface ChatWindowProps {
    peer: PeerProfile | null;
    onBack?: () => void;
}

interface Message {
    id: string;
    senderId: string;
    text?: string;
    mediaUrl?: string;
    type: "text" | "image" | "sticker" | "gif";
    timestamp: Date;
}

// TODO: Fetch messages from backend
const MOCK_MESSAGES: Message[] = [];

export function ChatWindow({ peer, onBack }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
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

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (!isSearching) scrollToBottom();
    }, [messages, peer, isSearching]);

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
                const data = await res.json();
                setGifs(data.data || []);
            } catch (error) { console.error("Failed to fetch GIFs", error); } finally { setIsLoadingGifs(false); }
        };
        const timeoutId = setTimeout(fetchGifs, 500);
        return () => clearTimeout(timeoutId);
    }, [showGifPicker, gifSearch]);

    const handleSend = (text: string = inputValue, type: "text" | "image" | "sticker" | "gif" = "text", mediaUrl?: string) => {
        if (!text && !mediaUrl) return;
        const newMessage: Message = { id: Date.now().toString(), senderId: "me", text, type, mediaUrl, timestamp: new Date() };
        setMessages(prev => [...prev, newMessage]);
        setInputValue("");
        setShowEmojiPicker(false);
        setShowAttachments(false);
        setShowGifPicker(false);
        if (type === "text") {
            setTimeout(() => {
                const reply: Message = { id: (Date.now() + 1).toString(), senderId: "peer", text: "That sounds awesome! Keep it up! 🚀", type: "text", timestamp: new Date() };
                setMessages(prev => [...prev, reply]);
            }, 1000);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            handleSend("", "image", url);
        }
    };

    const handleEmojiSelect = (emoji: any) => {
        setInputValue(prev => prev + emoji.native);
    };

    const filteredMessages = messages.filter(msg => {
        if (!msgSearchTerm) return true;
        if (msg.type === "text" && msg.text?.toLowerCase().includes(msgSearchTerm.toLowerCase())) return true;
        return false;
    });

    if (!peer) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center bg-zinc-50/50 h-full relative overflow-hidden">
                <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, rgba(200, 200, 255, 0.1) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(255, 200, 200, 0.1) 0%, transparent 40%)' }} />
                <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mb-6 rotate-3">
                    <Send className="text-zinc-800 ml-1 mt-1" size={40} />
                </div>
                <h3 className="text-xl font-bold text-zinc-900">Your Messages</h3>
                <p className="text-zinc-400 mt-2 text-sm max-w-xs text-center">Select a chat from the sidebar to start messaging your peers.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-zinc-50/30 relative">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

            {/* Header - Enhanced for Circles */}
            <div className={`flex items-center justify-between px-4 md:px-6 py-3 md:py-4 border-b border-zinc-100 sticky top-0 flex-shrink-0 min-h-[60px] md:backdrop-blur-md relative overflow-hidden pt-[calc(env(safe-area-inset-top)+0.75rem)] md:pt-4 rounded-t-3xl md:rounded-none ${peer.id.startsWith("g") ? "bg-gradient-to-r from-lime-400 to-emerald-400" : "bg-white md:bg-white/80"}`}>
                {/* Gradient overlay for circles (subtle) */}
                {peer.id.startsWith("g") && (
                    <div className="absolute inset-0 bg-gradient-to-r from-lime-400 to-emerald-400 opacity-100" />
                )}

                <div className="flex items-center gap-3 flex-1 relative z-10">
                    {onBack && (
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={onBack}
                            className={`md:hidden -ml-2 ${peer.id.startsWith("g") ? "text-zinc-900 hover:bg-white/20" : "text-zinc-500"}`}
                        >
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
                            <Avatar
                                src={peer.avatarUrl}
                                fallback={peer.name.charAt(0)}
                                className={`w-10 h-10 md:w-11 md:h-11 rounded-full border-2 shadow-sm ${peer.id.startsWith("g") ? "border-white/40 bg-white/20" : "border-white"}`}
                            />
                            <div className="flex-1 min-w-0">
                                <div className={`font-bold text-base md:text-lg leading-tight flex items-center gap-2 ${peer.id.startsWith("g") ? "text-zinc-900" : "text-zinc-900"}`}>
                                    {peer.name}
                                    {/* Circle Topic Badge */}
                                    {peer.id.startsWith("g") && (
                                        <span className="px-2 py-0.5 rounded-full bg-white/30 text-zinc-800 text-[10px] font-bold uppercase tracking-wide border border-white/20">
                                            Frontend
                                        </span>
                                    )}
                                </div>
                                <div className={`text-xs font-medium flex items-center gap-1.5 ${peer.id.startsWith("g") ? "text-zinc-800/80" : "text-zinc-500"}`}>
                                    {peer.id.startsWith("g") ? (
                                        <>
                                            <UsersIcon size={12} />
                                            <span>{peer.track}</span>
                                        </>
                                    ) : (
                                        <>
                                            {peer.isOnline && <span className="w-2 h-2 bg-green-500 rounded-full" />}
                                            <span>{peer.isOnline ? "Active now" : "Offline"}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-1 md:gap-2 relative z-10">
                    {!isSearching && (
                        <>
                            <Button
                                size="icon"
                                variant="ghost"
                                className={`rounded-full ${peer.id.startsWith("g") ? "text-zinc-900 hover:bg-white/20" : "text-zinc-400 hover:text-zinc-900"}`}
                                onClick={() => setIsSearching(true)}
                            >
                                <Search size={20} />
                            </Button>
                            {/* Info button for circles */}
                            {peer.id.startsWith("g") && (
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className={`rounded-full transition-colors ${showInfoPanel ? "text-zinc-900 bg-white/20" : "text-zinc-900 hover:bg-white/20"}`}
                                    onClick={() => setShowInfoPanel(!showInfoPanel)}
                                >
                                    <Info size={20} />
                                </Button>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Main Content Area - Split View */}
            <div className="flex-1 flex overflow-hidden relative z-0">
                {/* Chat Column */}
                <div className="flex-1 flex flex-col min-w-0 relative">
                    {/* Pinned Message */}
                    {peer.id.startsWith("g") && (
                        <div className="bg-lime-50/90 border-b border-lime-100 p-2 flex items-center justify-between text-xs px-4 md:px-6 backdrop-blur-sm sticky top-0 z-10 shadow-sm rounded-b-2xl md:rounded-none">
                            <div className="flex items-center gap-2 text-lime-900 font-medium truncate min-w-0 flex-1">
                                <span className="bg-lime-200 text-lime-800 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide flex-shrink-0">Pin</span>
                                <span className="truncate">Welcome to the React group! Please read the guidelines. 📌</span>
                            </div>
                        </div>
                    )}

                    {/* Messages List */}
                    <div className="flex-1 overflow-y-auto px-3 md:px-8 py-4 md:py-6 space-y-4 md:space-y-6 scroll-smooth pb-20 md:pb-6">
                        {filteredMessages.map((msg, index) => {
                            const isMe = msg.senderId === "me";
                            const showAvatar = !isMe && (index === filteredMessages.length - 1 || filteredMessages[index + 1]?.senderId !== msg.senderId);

                            return (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ duration: 0.2 }}
                                    className={`flex ${isMe ? "justify-end" : "justify-start"} group mb-1`}
                                >
                                    {!isMe && (
                                        <div className="w-8 md:w-9 flex-shrink-0 mr-2 flex flex-col justify-end">
                                            {showAvatar && <Avatar src={peer.avatarUrl} fallback={peer.name.charAt(0)} className="w-8 h-8 md:w-9 md:h-9 rounded-full border border-zinc-100 shadow-sm" />}
                                        </div>
                                    )}

                                    <div className={`max-w-[75%] md:max-w-[70%] relative ${isMe ? "items-end" : "items-start"} flex flex-col`}>
                                        {msg.text && (
                                            <div className={`px-4 py-2 md:py-3 rounded-2xl shadow-sm text-[15px] md:text-base leading-relaxed break-words relative group/bubble transition-all duration-200 ${isMe
                                                ? "bg-zinc-900 text-white rounded-br-sm hover:bg-zinc-800"
                                                : "bg-white text-zinc-800 border border-zinc-100 rounded-bl-sm hover:border-zinc-200 hover:shadow-md"
                                                }`}>
                                                {msg.text}
                                            </div>
                                        )}
                                        {msg.type === "image" && msg.mediaUrl && (
                                            <div className="relative rounded-2xl overflow-hidden border border-zinc-100 shadow-sm mt-1">
                                                <img src={msg.mediaUrl} alt="Attachment" className="max-w-full w-64 h-auto object-cover" />
                                            </div>
                                        )}
                                        {msg.type === "gif" && msg.mediaUrl && (
                                            <div className="relative rounded-2xl overflow-hidden border border-zinc-100 shadow-sm mt-1">
                                                <img src={msg.mediaUrl} alt="GIF" className="max-w-full w-64 h-auto object-cover" />
                                            </div>
                                        )}
                                        <span className={`text-[10px] mt-1 font-medium opacity-0 group-hover:opacity-100 transition-opacity ${isMe ? "text-zinc-400 mr-1" : "text-zinc-400 ml-1"}`}>
                                            10:42 AM
                                        </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area - Desktop only (in flex flow) */}
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
                                        {isLoadingGifs ? <div className="col-span-full text-center p-4">Loading...</div> : gifs.map((gif) => (
                                            <div key={gif.id} onClick={() => handleSend("", "gif", gif.images.downsized_medium.url)} className="cursor-pointer rounded-xl overflow-hidden h-28 relative bg-zinc-100"><img src={gif.images.fixed_width_small.url} alt={gif.title} className="w-full h-full object-cover" loading="lazy" decoding="async" /></div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                            {showAttachments && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                    className="absolute bottom-full left-0 mb-3 ml-2 bg-white rounded-3xl shadow-xl border border-zinc-100 p-3 w-64 z-50 overflow-hidden"
                                >
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => {
                                                setShowAttachments(false);
                                                fileInputRef.current?.click();
                                            }}
                                            className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-colors group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <ImageIcon size={20} />
                                            </div>
                                            <span className="text-[10px] font-bold text-zinc-600">Photos</span>
                                        </button>

                                        {/* Camera - Mobile Only */}
                                        <button
                                            className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-colors group md:hidden"
                                            onClick={() => {
                                                setShowAttachments(false);
                                                // Trigger camera input if implemented, or fallback to file input with capture
                                                if (fileInputRef.current) {
                                                    fileInputRef.current.setAttribute("capture", "environment");
                                                    fileInputRef.current.click();
                                                    // Reset after a delay to avoid affecting normal photo upload
                                                    setTimeout(() => fileInputRef.current?.removeAttribute("capture"), 1000);
                                                }
                                            }}
                                        >
                                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Camera size={20} />
                                            </div>
                                            <span className="text-[10px] font-bold text-zinc-600">Camera</span>
                                        </button>

                                        <button
                                            onClick={() => {
                                                setShowAttachments(false);
                                                // Trigger document upload
                                                const docInput = document.createElement('input');
                                                docInput.type = 'file';
                                                docInput.accept = '.pdf,.doc,.docx,.txt';
                                                docInput.onchange = (e) => handleFileUpload(e as any);
                                                docInput.click();
                                            }}
                                            className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-zinc-50 hover:bg-zinc-100 transition-colors group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <FileText size={20} />
                                            </div>
                                            <span className="text-[10px] font-bold text-zinc-600">Files</span>
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2 p-1.5 pl-3 bg-white rounded-[2rem] shadow-lg border border-zinc-100 focus-within:ring-2 focus-within:ring-zinc-900/5 transition-all">
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*,video/*" onChange={handleFileUpload} />

                            <Button size="icon" type="button" className={`rounded-full w-9 h-9 shrink-0 transition-colors ${showAttachments ? "bg-zinc-900 text-white rotate-45" : "bg-zinc-50 text-zinc-400 hover:text-zinc-600"}`} onClick={() => setShowAttachments(!showAttachments)}>
                                <Plus size={20} className="transition-transform duration-300" />
                            </Button>

                            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Message..." className="flex-1 bg-transparent border-0 py-3 text-[15px] outline-none placeholder:text-zinc-400 font-medium text-zinc-800" />

                            <div className="flex items-center gap-1">
                                <Button size="icon" type="button" className={`bg-transparent hover:text-pink-500 rounded-full w-9 h-9 shrink-0 transition-colors ${showGifPicker ? "text-pink-500 bg-pink-50" : "text-zinc-400"}`} onClick={() => { setShowGifPicker(!showGifPicker); setShowEmojiPicker(false); }}>
                                    <div className="font-bold text-[10px] border-2 border-current rounded-md px-1 pt-0.5 pb-0">GIF</div>
                                </Button>

                                <Button size="icon" type="button" className={`bg-transparent hover:text-amber-500 rounded-full w-9 h-9 shrink-0 transition-colors ${showEmojiPicker ? "text-amber-500 bg-amber-50" : "text-zinc-400"}`} onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowGifPicker(false); }}>
                                    <Smile size={20} />
                                </Button>
                            </div>

                            <Button size="icon" type="submit" className={`rounded-full w-10 h-10 shrink-0 transition-all flex items-center justify-center ${inputValue.trim() ? "bg-zinc-900 text-white shadow-md" : "bg-zinc-100 text-zinc-300"}`} disabled={!inputValue.trim()}>
                                <Send size={18} className={inputValue.trim() ? "translate-x-0.5 ml-0.5" : ""} />
                            </Button>
                        </form>
                    </div>
                </div>

                {/* Input Area - Mobile only (fixed at bottom) */}
                <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 p-3 bg-white border-t border-zinc-100">
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
                                    {isLoadingGifs ? <div className="col-span-full text-center p-4">Loading...</div> : gifs.map((gif) => (
                                        <div key={gif.id} onClick={() => handleSend("", "gif", gif.images.downsized_medium.url)} className="cursor-pointer rounded-xl overflow-hidden h-28 relative bg-zinc-100"><img src={gif.images.fixed_width_small.url} alt={gif.title} className="w-full h-full object-cover" loading="lazy" decoding="async" /></div>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {showAttachments && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                className="absolute bottom-20 left-4 bg-[#1A1A1A] border border-white/10 rounded-xl shadow-2xl p-2 min-w-[160px] z-50 flex flex-col gap-1"
                            >
                                <button
                                    onClick={() => { setShowAttachments(false); fileInputRef.current?.click(); }}
                                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-lg text-sm text-gray-300 transition-colors w-full text-left"
                                >
                                    <ImageIcon size={16} className="text-blue-400" />
                                    <span>Photo</span>
                                </button>
                                <button
                                    onClick={() => { setShowAttachments(false); setShowGifPicker(true); }}
                                    className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-lg text-sm text-gray-300 transition-colors w-full text-left"
                                >
                                    <FileText size={16} className="text-purple-400" />
                                    <span>GIF</span>
                                </button>
                                <button className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 rounded-lg text-sm text-gray-300 transition-colors w-full text-left">
                                    <Camera size={16} className="text-green-400" />
                                    <span>Camera</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2 p-1.5 pl-3 bg-white rounded-[2rem] shadow-lg border border-zinc-100 focus-within:ring-2 focus-within:ring-zinc-900/5 transition-all">
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

                        <Button size="icon" type="button" className={`bg-zinc-50 text-zinc-400 hover:text-zinc-600 rounded-full w-9 h-9 shrink-0 transition-colors ${showAttachments ? "rotate-45 text-zinc-900 bg-zinc-200" : ""}`} onClick={() => setShowAttachments(!showAttachments)}>
                            <Plus size={20} className="transition-transform duration-300" />
                        </Button>

                        <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Message..." className="flex-1 bg-transparent border-0 py-3 text-[15px] outline-none placeholder:text-zinc-400 font-medium text-zinc-800" />

                        <Button size="icon" type="button" className={`bg-transparent text-zinc-400 hover:text-pink-500 rounded-full w-9 h-9 shrink-0 transition-colors ${showGifPicker ? "text-pink-500 bg-pink-50" : ""}`} onClick={() => { setShowGifPicker(!showGifPicker); setShowEmojiPicker(false); setShowAttachments(false); }}>
                            <div className="font-bold text-[10px] border-2 border-current rounded-md px-1 pt-0.5 pb-0">GIF</div>
                        </Button>

                        <Button size="icon" type="button" className={`bg-transparent text-zinc-400 hover:text-amber-500 rounded-full w-9 h-9 shrink-0 transition-colors ${showEmojiPicker ? "text-amber-500 bg-amber-50" : ""}`} onClick={() => { setShowEmojiPicker(!showEmojiPicker); setShowGifPicker(false); setShowAttachments(false); }}>
                            <Smile size={20} />
                        </Button>

                        <Button size="icon" type="submit" className={`rounded-full w-10 h-10 shrink-0 transition-all flex items-center justify-center ${inputValue.trim() ? "bg-zinc-900 text-white shadow-md" : "bg-zinc-100 text-zinc-300"}`} disabled={!inputValue.trim()}>
                            <Send size={18} className={inputValue.trim() ? "translate-x-0.5 ml-0.5" : ""} />
                        </Button>
                    </form>
                </div>

                {/* Circle Info Panel */}
                <CircleInfoPanel
                    peer={peer}
                    isOpen={showInfoPanel}
                    onClose={() => setShowInfoPanel(false)}
                />
            </div>
        </div>
    );
}
