"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Send, MoreVertical, Paperclip, Smile, User, Check, CheckCheck, Plus, X, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/ToastProvider";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface Message {
    id: string;
    text: string;
    sender: "me" | "them";
    time: string;
    type: "text" | "file";
}

interface Conversation {
    id: string;
    name: string;
    color: string;
    lastMessage: string;
    timestamp: string;
    unread: number;
    online: boolean;
}

const EMOJIS = ["😀", "😂", "😍", "👍", "🔥", "✨", "🙌", "🎉", "🚀", "💡", "🎨", "📱"];

export default function MessagesPage() {
    const [selectedId, setSelectedId] = useState<string>("1");
    const [messageInput, setMessageInput] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false);
    const [isNewMessageModalOpen, setIsNewMessageModalOpen] = useState(false);
    const [newContactName, setNewContactName] = useState("");

    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Mock Data
    // Mock Data -> TODO: Fetch from backend
    const [conversations, setConversations] = useState<Conversation[]>([]);

    const [messages, setMessages] = useState<Record<string, Message[]>>({});

    const activeConversation = conversations.find(c => c.id === selectedId) || null;
    const activeMessages = messages[selectedId] || [];

    const filteredConversations = conversations.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSend = () => {
        if (!messageInput.trim()) return;
        const newMessage: Message = {
            id: Date.now().toString(),
            text: messageInput,
            sender: "me",
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            type: "text"
        };
        setMessages(prev => ({
            ...prev,
            [selectedId]: [...(prev[selectedId] || []), newMessage]
        }));

        // Update last message in conversation list
        setConversations(prev => prev.map(c =>
            c.id === selectedId ? { ...c, lastMessage: messageInput, timestamp: "Just now" } : c
        ));

        setMessageInput("");
        setIsEmojiPickerOpen(false);
    };

    const handleNewConversation = () => {
        if (newContactName.trim()) {
            const id = Date.now().toString();
            const newConv: Conversation = {
                id,
                name: newContactName,
                color: "bg-purple-100 text-purple-600",
                lastMessage: "Started a new conversation",
                timestamp: "Just now",
                unread: 0,
                online: true
            };
            setConversations([newConv, ...conversations]);
            setMessages(prev => ({ ...prev, [id]: [] }));
            setSelectedId(id);

            setNewContactName("");
            setIsNewMessageModalOpen(false);
            toast(`Chat with ${newContactName} started.`, "success");
        }
    };

    const handleAttach = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            toast(`File Attaching: ${file.name}`, "info");

            // Mock sending file
            const newMessage: Message = {
                id: Date.now().toString(),
                text: `Sent file: ${file.name}`,
                sender: "me",
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: "file"
            };
            setMessages(prev => ({
                ...prev,
                [selectedId]: [...(prev[selectedId] || []), newMessage]
            }));

            // Reset input
            e.target.value = "";
        }
    };

    const addEmoji = (emoji: string) => {
        setMessageInput(prev => prev + emoji);
        setIsEmojiPickerOpen(false);
    };

    return (
        <div className="h-[calc(100vh-2rem)] flex gap-4 md:gap-6 p-2 md:p-4 xl:p-6 overflow-hidden flex-col md:flex-row">
            {/* Conversations List (Left Panel) */}
            <div className="w-full md:w-80 flex flex-col gap-4 bg-white/50 backdrop-blur-sm rounded-[2.5rem] p-4 border border-white/20 shadow-sm flex-shrink-0">
                <div className="flex items-center justify-between px-2 pt-2">
                    <h2 className="text-2xl font-black">Messages</h2>
                    <button
                        onClick={() => setIsNewMessageModalOpen(true)}
                        className="h-8 w-8 rounded-full bg-black text-white flex items-center justify-center cursor-pointer shadow-lg hover:scale-105 transition-transform"
                    >
                        <Plus size={16} />
                    </button>
                </div>

                <div className="bg-white rounded-full px-4 py-3 flex items-center gap-2 shadow-sm border-none ring-black/5 focus-within:ring-primary/20 transition-all">
                    <Search size={18} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search chats..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-transparent outline-none text-sm w-full font-medium placeholder:text-gray-300"
                    />
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {filteredConversations.map(conv => (
                        <div
                            key={conv.id}
                            onClick={() => setSelectedId(conv.id)}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-[1.5rem] cursor-pointer transition-all duration-200",
                                selectedId === conv.id ? "bg-white shadow-md scale-[1.02]" : "hover:bg-white/60"
                            )}
                        >
                            <div className="relative">
                                <div className={cn("h-12 w-12 rounded-full flex items-center justify-center text-xl shadow-inner", conv.color)}>
                                    <User size={20} />
                                </div>
                                {conv.online && (
                                    <div className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 rounded-full border-2 border-white" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-0.5">
                                    <h4 className={cn("font-bold text-sm truncate", selectedId === conv.id ? "text-black" : "text-gray-700")}>{conv.name}</h4>
                                    <span className="text-[10px] text-gray-400 font-medium">{conv.timestamp}</span>
                                </div>
                                <p className={cn("text-xs truncate", conv.unread > 0 ? "font-bold text-gray-800" : "text-gray-400")}>
                                    {conv.lastMessage}
                                </p>
                            </div>
                            {conv.unread > 0 && selectedId !== conv.id && (
                                <div className="h-5 w-5 rounded-full bg-primary text-[10px] font-bold flex items-center justify-center shadow-sm">
                                    {conv.unread}
                                </div>
                            )}
                        </div>
                    ))}
                    {filteredConversations.length === 0 && (
                        <div className="p-8 text-center text-gray-400 text-sm font-medium">No chats found.</div>
                    )}
                </div>
            </div>

            {/* Chat Area (Right Panel) */}
            <div className="flex-1 bg-white rounded-[2.5rem] shadow-xl flex flex-col overflow-hidden relative">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white z-10 relative">
                    {activeConversation ? (
                        <>
                            <div className="flex items-center gap-4">
                                <div className={cn("h-12 w-12 rounded-full flex items-center justify-center text-xl", activeConversation.color)}>
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg leading-tight">{activeConversation.name}</h3>
                                    <span className="text-xs text-green-500 font-bold flex items-center gap-1">
                                        {activeConversation.online ? "● Online" : "Offline"}
                                    </span>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="h-10 w-10 rounded-full hover:bg-gray-50 text-gray-400 hover:text-black transition-colors flex items-center justify-center">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="font-bold text-gray-400">Select a conversation</div>
                    )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50 custom-scrollbar">
                    {activeConversation ? (
                        activeMessages.length > 0 ? (
                            activeMessages.map((msg) => (
                                <div key={msg.id} className={cn("flex w-full", msg.sender === "me" ? "justify-end" : "justify-start")}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        className={cn(
                                            "max-w-[70%] p-4 rounded-[1.5rem] shadow-sm relative group mb-2",
                                            msg.sender === "me"
                                                ? "bg-black text-white rounded-br-sm"
                                                : "bg-white text-gray-800 rounded-bl-sm"
                                        )}
                                    >
                                        <p className="text-sm font-medium leading-relaxed">
                                            {msg.type === "file" && <Paperclip size={14} className="inline mr-2" />}
                                            {msg.text}
                                        </p>
                                        <span className={cn(
                                            "text-[10px] absolute -bottom-5 min-w-max font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1",
                                            msg.sender === "me" ? "right-0 text-gray-400" : "left-0 text-gray-400"
                                        )}>
                                            {msg.time}
                                            {msg.sender === "me" && <CheckCheck size={12} />}
                                        </span>
                                    </motion.div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-inner mb-4">
                                    <Send size={24} className="opacity-20" />
                                </div>
                                <p className="font-bold">Say hi to {activeConversation.name}!</p>
                            </div>
                        )
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                            <div className="h-16 w-16 rounded-full bg-white flex items-center justify-center shadow-inner mb-4">
                                <MessageSquare size={24} className="opacity-20" />
                            </div>
                            <p className="font-bold">Select a chat to start messaging</p>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-4 m-4 bg-gray-100 rounded-[2rem] flex items-center gap-2 relative">
                    {/* Emoji Picker Popover */}
                    <AnimatePresence>
                        {isEmojiPickerOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                className="absolute bottom-full mb-4 right-20 bg-white border border-gray-100 rounded-2xl shadow-2xl p-4 z-20 grid grid-cols-4 gap-2"
                            >
                                {EMOJIS.map(e => (
                                    <button
                                        key={e}
                                        onClick={() => addEmoji(e)}
                                        className="h-10 w-10 flex items-center justify-center rounded-xl hover:bg-gray-50 text-xl transition-all active:scale-90"
                                    >
                                        {e}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <button
                        onClick={handleAttach}
                        className="h-10 w-10 rounded-full hover:bg-gray-200 text-gray-500 transition-colors flex items-center justify-center"
                    >
                        <Paperclip size={20} />
                    </button>

                    <input
                        type="text"
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent outline-none font-medium text-gray-800 placeholder:text-gray-400"
                    />

                    <button
                        onClick={() => setIsEmojiPickerOpen(!isEmojiPickerOpen)}
                        className={cn("h-10 w-10 rounded-full transition-colors flex items-center justify-center", isEmojiPickerOpen ? "bg-black text-white" : "hover:bg-gray-200 text-gray-500")}
                    >
                        <Smile size={20} />
                    </button>

                    <button
                        onClick={handleSend}
                        disabled={!messageInput.trim()}
                        className="h-12 w-12 rounded-full bg-primary text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 disabled:opacity-50 disabled:scale-100 transition-all font-bold"
                    >
                        <Send size={20} className="ml-0.5" />
                    </button>
                </div>
            </div>

            {/* New Message Modal */}
            <Modal
                isOpen={isNewMessageModalOpen}
                onClose={() => setIsNewMessageModalOpen(false)}
                title="New Conversation"
                footer={
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsNewMessageModalOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                        <Button onClick={handleNewConversation} className="rounded-xl font-bold bg-black text-white px-6" disabled={!newContactName.trim()}>Start Chat</Button>
                    </div>
                }
            >
                <div>
                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Type recipient name</label>
                    <input
                        type="text"
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                        placeholder="e.g. Andy Bernard"
                        className="w-full px-5 py-4 rounded-2xl bg-gray-50 border-none focus:ring-2 ring-primary outline-none transition-all font-bold placeholder:text-gray-300"
                        autoFocus
                    />
                </div>
            </Modal>
        </div>
    );
}
