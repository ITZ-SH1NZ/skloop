"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MessageSquare, Plus, PanelLeftClose, PanelLeft, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ChatSidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [collapsed, setCollapsed] = useState(false);
    const [chats, setChats] = useState<{id: string, title: string}[]>([]); 
    
    const loadChats = () => {
        try {
            const saved = localStorage.getItem("loopy_chats_list");
            if (saved) setChats(JSON.parse(saved));
        } catch (e) {
            console.error("Failed to load chats", e);
        }
    };

    useEffect(() => {
        if (window.innerWidth < 768) setCollapsed(true);
        loadChats();
        
        window.addEventListener("storage", loadChats);
        window.addEventListener("loopy_chats_updated", loadChats);
        return () => {
            window.removeEventListener("storage", loadChats);
            window.removeEventListener("loopy_chats_updated", loadChats);
        };
    }, []);

    const handleNewChat = () => {
        const newId = Date.now().toString();
        const newChats = [{ id: newId, title: "Untitled Chat" }, ...chats];
        setChats(newChats);
        try {
            localStorage.setItem("loopy_chats_list", JSON.stringify(newChats));
            window.dispatchEvent(new Event("loopy_chats_updated"));
        } catch (e) {}

        router.push(`/loopy/chat/${newId}`);
        if (window.innerWidth < 768) setCollapsed(true);
    };

    const handleDeleteChat = (e: React.MouseEvent, idToDelete: string) => {
        e.preventDefault();
        e.stopPropagation();
        const updatedChats = chats.filter(c => c.id !== idToDelete);
        setChats(updatedChats);
        try {
            localStorage.setItem("loopy_chats_list", JSON.stringify(updatedChats));
            localStorage.removeItem(`loopy_chat_${idToDelete}`);
            window.dispatchEvent(new Event("loopy_chats_updated"));
        } catch (error) {}
        
        if (pathname.includes(`/chat/${idToDelete}`)) {
            router.push('/loopy/chat/new');
        }
    };

    return (
        <motion.div 
            initial={false}
            animate={{ width: collapsed ? 80 : 300 }}
            className="h-full bg-[#FAFAF8] border-r-2 border-slate-200 flex flex-col shrink-0 overflow-hidden relative z-40 transition-shadow shadow-[20px_0_40px_rgba(0,0,0,0.03)]"
        >
            <div className="p-5 flex items-center justify-between">
                <AnimatePresence>
                    {!collapsed && (
                        <motion.span 
                            initial={{ opacity: 0 }} 
                            animate={{ opacity: 1 }} 
                            exit={{ opacity: 0 }} 
                            className="font-black text-[#050505] tracking-wide text-sm flex items-center gap-2"
                        >
                            Loopy Guide
                        </motion.span>
                    )}
                </AnimatePresence>
                <button 
                    onClick={() => setCollapsed(!collapsed)}
                    className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 hover:text-black transition-all active:scale-95 border-2 border-transparent hover:border-slate-200"
                >
                    {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
                </button>
            </div>

            <div className="px-4 pb-6">
                <button 
                    onClick={handleNewChat}
                    className={`flex items-center gap-3 w-full bg-[#D4F268] hover:bg-[#bef264] border-b-4 border-r-2 border-t-2 border-l-2 border-[#b5db3b] text-[#050505] py-3 rounded-2xl transition-all active:translate-y-1 active:border-b-2 shadow-sm
                        ${collapsed ? 'justify-center px-0' : 'px-4'}`}
                >
                    <Plus size={18} strokeWidth={3} className="transition-transform duration-300" />
                    {!collapsed && <span className="font-extrabold text-sm">New Session</span>}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-2 no-scrollbar scroll-smooth">
                {!collapsed && chats.length > 0 && (
                    <div className="px-2 pt-2 pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Recent History
                    </div>
                )}
                
                {chats.length === 0 && !collapsed && (
                    <div className="text-center p-4 text-slate-400 text-xs font-bold mt-10 opacity-60">
                        No recent chats. Start a new session!
                    </div>
                )}

                {chats.map((chat) => {
                    const isActive = pathname.includes(`/chat/${chat.id}`) || (chat.id === "new" && pathname.endsWith("/chat/new"));
                    return (
                        <Link 
                            key={chat.id} 
                            href={`/loopy/chat/${chat.id}`}
                            className={`flex items-center gap-3 w-full py-3.5 rounded-2xl transition-all group relative overflow-hidden font-bold border-2
                                ${collapsed ? 'justify-center px-0' : 'px-4'}
                                ${isActive 
                                    ? 'bg-white border-slate-200 text-black shadow-sm' 
                                    : 'border-transparent text-slate-500 hover:bg-slate-100 hover:text-black hover:border-slate-200'
                                }
                            `}
                        >
                            {isActive && !collapsed && (
                                <motion.div layoutId="activeChat" className="absolute left-0 top-0 w-1.5 h-full bg-[#D4F268] rounded-r-md" />
                            )}
                            <MessageSquare size={18} strokeWidth={2.5} className={`shrink-0 transition-colors ${isActive ? 'text-[#050505]' : 'text-slate-400 group-hover:text-black'}`} />
                            {!collapsed && (
                                <>
                                    <div className="flex flex-col items-start truncate overflow-hidden flex-1">
                                        <span className="text-sm truncate w-full">{chat.title}</span>
                                    </div>
                                    <button 
                                        onClick={(e) => handleDeleteChat(e, chat.id)}
                                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-200 rounded-lg transition-all"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </>
                            )}
                        </Link>
                    );
                })}
            </div>

            <div className="p-4 mt-auto border-t-2 border-slate-200 bg-slate-50">
                <Link href="/loopy" className={`flex items-center gap-3 w-full text-slate-600 hover:text-black hover:bg-slate-200 border-2 border-transparent hover:border-slate-300 py-3 rounded-2xl transition-all font-bold ${collapsed ? 'justify-center px-0' : 'px-4'}`}>
                    <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                    </svg>
                    {!collapsed && <span className="text-sm tracking-wide">Exit to Dial</span>}
                </Link>
            </div>
        </motion.div>
    );
}
