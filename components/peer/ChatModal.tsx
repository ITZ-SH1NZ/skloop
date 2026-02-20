import { useState, useEffect, useRef } from "react";
import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Send, Plus, Image as ImageIcon, Smile, X, Sticker, Gift, Search } from "lucide-react";
import { PeerProfile } from "./PeerCard";
import { motion, AnimatePresence } from "framer-motion";
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface ChatModalProps {
    peer: PeerProfile | null;
    isOpen: boolean;
    onClose: () => void;
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



export function ChatModal({ peer, isOpen, onClose }: ChatModalProps) {
    const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
    const [inputValue, setInputValue] = useState("");
    const [showAttachments, setShowAttachments] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // GIF Picker State
    const [showGifPicker, setShowGifPicker] = useState(false);
    const [gifs, setGifs] = useState<any[]>([]);
    const [gifSearch, setGifSearch] = useState("");
    const [isLoadingGifs, setIsLoadingGifs] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    // Fetch GIFs (Trending or Search)
    useEffect(() => {
        if (!showGifPicker) return;

        const fetchGifs = async () => {
            setIsLoadingGifs(true);
            try {
                const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY;
                if (!apiKey) {
                    console.error("Giphy API Key missing");
                    return;
                }
                const endpoint = gifSearch
                    ? `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${gifSearch}&limit=10`
                    : `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=10`;

                const res = await fetch(endpoint);
                const data = await res.json();
                setGifs(data.data || []);
            } catch (error) {
                console.error("Failed to fetch GIFs", error);
            } finally {
                setIsLoadingGifs(false);
            }
        };

        const timeoutId = setTimeout(fetchGifs, 500); // Debounce
        return () => clearTimeout(timeoutId);
    }, [showGifPicker, gifSearch]);

    const handleSend = (text: string = inputValue, type: "text" | "image" | "sticker" | "gif" = "text", mediaUrl?: string) => {
        if (!text && !mediaUrl) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            senderId: "me",
            text,
            type,
            mediaUrl,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, newMessage]);
        setInputValue("");
        setShowEmojiPicker(false);
        setShowAttachments(false);
        setShowGifPicker(false);

        // Mock reply
        if (type === "text") {
            setTimeout(() => {
                const reply: Message = {
                    id: (Date.now() + 1).toString(),
                    senderId: "peer",
                    text: "That sounds awesome! Keep it up! 🚀",
                    type: "text",
                    timestamp: new Date(),
                };
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

    if (!peer) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={peer.name}
            footer={
                <div className="flex flex-col w-full relative">
                    {/* Attachments Menu */}
                    <AnimatePresence>
                        {showAttachments && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute bottom-full left-0 mb-3 bg-white rounded-2xl shadow-xl border border-zinc-200 p-2 z-50 flex gap-2"
                            >
                                <button className="flex flex-col items-center gap-1 p-3 hover:bg-zinc-50 rounded-xl transition-colors" onClick={() => fileInputRef.current?.click()}>
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <ImageIcon size={20} />
                                    </div>
                                    <span className="text-xs font-medium text-zinc-600">Photos</span>
                                </button>
                                <button className="flex flex-col items-center gap-1 p-3 hover:bg-zinc-50 rounded-xl transition-colors" onClick={() => { setShowGifPicker(true); setShowAttachments(false); }}>
                                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                                        <Gift size={20} />
                                    </div>
                                    <span className="text-xs font-medium text-zinc-600">GIFs</span>
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Emoji Picker */}
                    <AnimatePresence>
                        {showEmojiPicker && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                className="absolute bottom-full right-0 mb-3 z-50 shadow-2xl rounded-2xl overflow-hidden"
                            >
                                <Picker
                                    data={data}
                                    onEmojiSelect={handleEmojiSelect}
                                    theme="light"
                                    previewPosition="none"
                                    skinTonePosition="none"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* GIF Picker Modal/Overlay */}
                    <AnimatePresence>
                        {showGifPicker && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 350 }}
                                exit={{ opacity: 0, height: 0 }}
                                className="absolute bottom-0 left-0 right-0 bg-white z-50 rounded-t-2xl border-t border-zinc-200 shadow-2xl flex flex-col"
                            >
                                <div className="p-3 border-b flex gap-2 items-center bg-zinc-50 rounded-t-2xl">
                                    <div className="relative flex-1">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                                        <input
                                            type="text"
                                            placeholder="Search GIPHY..."
                                            value={gifSearch}
                                            onChange={(e) => setGifSearch(e.target.value)}
                                            className="w-full bg-white border border-zinc-200 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/20"
                                            autoFocus
                                        />
                                    </div>
                                    <Button size="icon" className="h-8 w-8 rounded-full hover:bg-zinc-200" onClick={() => setShowGifPicker(false)}>
                                        <X size={16} />
                                    </Button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-2 grid grid-cols-2 gap-2">
                                    {isLoadingGifs ? (
                                        <div className="col-span-2 flex justify-center py-10 text-zinc-400 text-xs">Loading GIFs...</div>
                                    ) : (
                                        gifs.map((gif) => (
                                            <div
                                                key={gif.id}
                                                onClick={() => handleSend("", "gif", gif.images.fixed_height.url)}
                                                className="cursor-pointer rounded-xl overflow-hidden h-28 relative group bg-zinc-100"
                                            >
                                                <img
                                                    src={gif.images.fixed_height_small.url}
                                                    alt={gif.title}
                                                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                                    loading="lazy"
                                                />
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="text-[9px] text-center py-1 text-zinc-300 bg-white">Powered by GIPHY</div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Input Bar */}
                    <form
                        onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                        className="flex items-end gap-2 p-2 bg-zinc-50/50 rounded-3xl border border-zinc-200"
                    >
                        {/* Hidden File Input */}
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

                        <Button
                            size="icon"
                            type="button"
                            className="bg-transparent text-zinc-400 hover:bg-zinc-100 rounded-full w-10 h-10 shrink-0"
                            onClick={() => setShowAttachments(!showAttachments)}
                        >
                            <Plus size={22} className={showAttachments ? "rotate-45 transition-transform" : "transition-transform"} />
                        </Button>

                        <input
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-transparent border-0 py-2.5 text-sm outline-none placeholder:text-zinc-400 font-medium max-h-32"
                            autoFocus
                        />

                        <Button
                            size="icon"
                            type="button"
                            className="bg-transparent text-zinc-400 hover:text-amber-500 hover:bg-zinc-100 rounded-full w-10 h-10 shrink-0"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        >
                            <Smile size={22} />
                        </Button>

                        <Button
                            size="icon"
                            type="submit"
                            className={`rounded-full w-10 h-10 shrink-0 transition-all ${inputValue.trim() ? "bg-zinc-900 text-white shadow-md hover:scale-105" : "bg-transparent text-zinc-300"}`}
                            disabled={!inputValue.trim()}
                        >
                            <Send size={20} className={inputValue.trim() ? "translate-x-0.5" : ""} />
                        </Button>
                    </form>
                </div>
            }
        >
            <div className="flex flex-col h-[65vh] md:h-[550px]">
                {/* Chat Header Details - Rounded & Clean */}
                <div className="flex items-center justify-between pb-4 border-b border-zinc-100 mb-4 px-2">
                    <div className="flex items-center gap-3">
                        <Avatar
                            src={peer.avatarUrl}
                            fallback={peer.name.charAt(0)}
                            className="w-10 h-10 rounded-2xl border border-zinc-200 shadow-sm"
                        />
                        <div>
                            <div className="font-bold text-zinc-900 leading-tight">{peer.name}</div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className={`w-1.5 h-1.5 rounded-full ${peer.isOnline ? "bg-green-500" : "bg-zinc-300"}`} />
                                <span className="text-xs text-zinc-500 font-medium">{peer.isOnline ? "Online" : "Last seen recently"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-2 space-y-4 pb-4 scroll-smooth">
                    {messages.map((msg, index) => {
                        const isMe = msg.senderId === "me";

                        return (
                            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                {!isMe && (
                                    <Avatar
                                        src={peer.avatarUrl}
                                        fallback={peer.name.charAt(0)}
                                        className="w-8 h-8 mr-2 self-end mb-4 rounded-xl shadow-sm border border-zinc-100"
                                    />
                                )}
                                <div className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[80%]`}>

                                    {/* Message Content - Rounded 2XL */}
                                    <div
                                        className={`
                                            px-4 py-2.5 shadow-sm text-sm font-medium
                                            ${msg.type === "sticker" ? "bg-transparent shadow-none p-0 text-5xl" : ""}
                                            ${msg.type === "image" || msg.type === "gif" ? "p-0 overflow-hidden bg-transparent border-0 shadow-none" : ""}
                                            ${msg.type === "text" && isMe ? "bg-zinc-900 text-white rounded-2xl rounded-tr-md" : ""}
                                            ${msg.type === "text" && !isMe ? "bg-white border border-zinc-200 text-zinc-800 rounded-2xl rounded-tl-md" : ""}
                                        `}
                                    >
                                        {msg.type === "text" && msg.text}
                                        {msg.type === "sticker" && msg.text}
                                        {(msg.type === "image" || msg.type === "gif") && (
                                            <img src={msg.mediaUrl} alt="attachment" className="rounded-2xl max-w-full max-h-60 object-cover" />
                                        )}
                                    </div>

                                    {/* Timestamp */}
                                    <span className="text-[10px] text-zinc-400 mt-1 px-1">
                                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
            </div>
        </Modal>
    );
}
