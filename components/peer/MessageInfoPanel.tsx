"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, CheckCircle2, PlayCircle, User, MessageSquare, Info, Hash, Code2 } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { useState, useEffect } from "react";
import { getMessageStatuses, MessageRow } from "@/actions/chat-actions";
import { VoicePlayer, SnippetRenderer } from "./ChatWindow";
import { MuxVideoPlayer } from "./MuxVideoPlayer";

interface MessageInfoPanelProps {
    message: MessageRow;
    isOpen: boolean;
    onClose: () => void;
}

interface UserStatus {
    readAt: string | null;
    playedAt: string | null;
    user: {
        id: string;
        full_name: string;
        username: string;
        avatar_url?: string;
    };
}

export function MessageInfoPanel({ message, isOpen, onClose }: MessageInfoPanelProps) {
    const [statuses, setStatuses] = useState<UserStatus[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isOpen) return;
        const fetchStatuses = async () => {
            setIsLoading(true);
            try {
                const data = await getMessageStatuses(message.id);
                setStatuses(data as UserStatus[]);
            } catch (err) {
                console.error("Failed to fetch message statuses:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStatuses();
    }, [isOpen, message?.id]);

    const formatFullTime = (dateStr: string) => {
        const d = new Date(dateStr);
        return d.toLocaleString([], { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const isPlayableMedia = ['audio', 'video'].includes(message.type) || message.attachments?.some(a => ['audio', 'video'].includes(a.type));

    const playedStatuses = statuses.filter(s => s.playedAt).sort((a, b) => new Date(b.playedAt!).getTime() - new Date(a.playedAt!).getTime());
    const readStatuses = statuses.filter(s => s.readAt && !s.playedAt).sort((a, b) => new Date(b.readAt!).getTime() - new Date(a.readAt!).getTime());
    const unseenStatuses = statuses.filter(s => !s.readAt).sort((a, b) => a.user.full_name.localeCompare(b.user.full_name));

    const renderUser = (status: UserStatus, delay: number) => (
        <motion.div 
            key={status.user.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay * 0.05 }}
            className="group p-3 hover:bg-zinc-50 rounded-2xl transition-all border border-transparent hover:border-zinc-100"
        >
            <div className="flex items-start gap-3">
                <Avatar 
                    src={status.user.avatar_url} 
                    fallback={status.user.full_name[0]} 
                    className="w-10 h-10 rounded-full border border-white shadow-sm" 
                />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-zinc-900 truncate">
                        {status.user.full_name}
                    </p>
                    <div className="mt-1 space-y-1.5 flex flex-wrap gap-2">
                        {status.readAt ? (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-blue-500 bg-blue-50 w-fit px-2 py-0.5 rounded-md">
                                <CheckCircle2 size={10} />
                                <span>Read {formatFullTime(status.readAt)}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 w-fit px-2 py-0.5 border border-zinc-100 rounded-md">
                                <Clock size={10} />
                                <span>Delivered</span>
                            </div>
                        )}
                        {isPlayableMedia && status.playedAt && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-lime-600 bg-lime-50 w-fit px-2 py-0.5 rounded-md">
                                <PlayCircle size={10} />
                                <span>Played {formatFullTime(status.playedAt)}</span>
                            </div>
                        )}
                        {isPlayableMedia && status.readAt && !status.playedAt && (
                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 w-fit px-2 py-0.5 border border-zinc-100 rounded-md">
                                <PlayCircle size={10} className="opacity-50" />
                                <span>Not played yet</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop for mobile */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-[60]"
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed inset-y-0 right-0 z-[70] w-full md:w-80 bg-white/95 backdrop-blur-2xl border-l border-zinc-200 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-white/50">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-500">
                                    <Info size={18} />
                                </div>
                                <h3 className="font-bold text-zinc-900">Message Info</h3>
                            </div>
                            <Button size="icon" variant="ghost" onClick={onClose} className="rounded-full h-8 w-8 hover:bg-zinc-100">
                                <X size={18} />
                            </Button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            {/* Message Preview */}
                            <div className="p-6 border-b border-zinc-100 bg-zinc-50/30">
                                <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-3">Content Preview</h4>
                                <div className="p-4 bg-white rounded-2xl border border-zinc-200 shadow-sm">
                                    {/* Media Rendering */}
                                    {/* Legacy direct mediaUrl or Giphy Text fallbacks */}
                                    {['image', 'gif', 'sticker'].includes(message.type) && !message.attachments?.length && (message.mediaUrl || message.text) && (
                                        <div className="rounded-xl overflow-hidden mb-3 border border-zinc-100 flex items-center justify-center bg-zinc-50/50">
                                            <img src={(message.mediaUrl || message.text) as string} alt="Attachment" className="w-full h-auto max-h-48 object-contain" />
                                        </div>
                                    )}
                                    {message.type === 'video' && !message.attachments?.length && message.mediaUrl && (
                                        <div className="rounded-xl overflow-hidden mb-3 border border-zinc-100 bg-black">
                                            {(message.mediaUrl as string).startsWith('https://stream.mux.com/') ? (
                                                <MuxVideoPlayer url={message.mediaUrl as string} className="w-full max-h-48 object-contain" />
                                            ) : (
                                                <video src={message.mediaUrl as string} controls className="w-full max-h-48 object-contain" />
                                            )}
                                        </div>
                                    )}
                                    {message.type === 'audio' && !message.attachments?.length && message.mediaUrl && (
                                        <div className="mb-3 flex justify-center w-full">
                                            <VoicePlayer url={message.mediaUrl as string} compact={true} />
                                        </div>
                                    )}

                                    {/* Attachments rendering (Images, Videos, Audio, Files uploaded by users) */}
                                    {message.attachments && message.attachments.length > 0 && (
                                        <div className={`mt-1.5 mb-3 grid gap-1 ${message.attachments.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                                            {message.attachments.map((att, i) => (
                                                <div key={`info-att-${i}-${att.url}`} className="rounded-lg overflow-hidden bg-zinc-100 relative shadow-sm border border-zinc-200">
                                                    {att.type === 'image' && <img src={att.url} alt="Attachment" loading="lazy" className="w-full h-auto max-h-48 object-contain bg-zinc-50/50" />}
                                                    {att.type === 'video' && (
                                                        att.url.startsWith('https://stream.mux.com/')
                                                            ? <MuxVideoPlayer url={att.url} className="w-full bg-black max-h-48 object-contain" />
                                                            : <video src={att.url} controls className="w-full h-auto max-h-48 object-contain bg-black" />
                                                    )}
                                                    {att.type === 'audio' && <div className="p-2"><VoicePlayer url={att.url} compact={true} /></div>}
                                                    {att.type === 'file' && (
                                                        <div className="w-full flex items-center gap-3 p-3 bg-zinc-50 border-t border-zinc-100">
                                                            <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-white shadow-sm border border-zinc-200">
                                                                <Hash size={20} className="text-zinc-500" />
                                                            </div>
                                                            <div className="min-w-0 flex-1 text-left">
                                                                <p className="text-sm font-bold truncate text-zinc-900">{att.name || 'File'}</p>
                                                                <p className="text-[10px] uppercase font-bold text-zinc-400">{att.name?.split('.').pop()?.toUpperCase() || 'FILE'}</p>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Text Content */}
                                    {message.type === 'code' ? (
                                        <div className="rounded-xl overflow-hidden mb-3 border border-zinc-100 shadow-sm filter drop-shadow-sm">
                                            <SnippetRenderer message={message} />
                                        </div>
                                    ) : message.text && !['gif', 'sticker'].includes(message.type) ? (
                                        <p className="text-sm text-zinc-800 font-medium line-clamp-4 leading-relaxed whitespace-pre-wrap">
                                            {message.text}
                                        </p>
                                    ) : (!message.mediaUrl && !message.attachments?.length && !['gif', 'sticker'].includes(message.type)) ? (
                                        <div className="flex items-center gap-3 text-zinc-500">
                                            <Hash size={16} />
                                            <span className="text-sm font-bold uppercase tracking-wider">{message.type} attachment</span>
                                        </div>
                                    ) : null}
                                    
                                    <div className="mt-3 flex items-center gap-2 text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">
                                        <Clock size={10} />
                                        Sent {formatFullTime(message.timestamp.toString())}
                                    </div>
                                </div>
                            </div>

                            {/* Status List */}
                            <div className="p-4 pb-8">
                                {isLoading ? (
                                    <div className="space-y-4 px-2 mt-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex gap-3 animate-pulse">
                                                <div className="w-9 h-9 rounded-full bg-zinc-100" />
                                                <div className="flex-1 space-y-2 py-1">
                                                    <div className="h-2 bg-zinc-100 rounded w-1/2" />
                                                    <div className="h-2 bg-zinc-50 rounded w-1/3" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : statuses.length === 0 ? (
                                    <div className="text-center py-12 px-6">
                                        <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <MessageSquare size={20} className="text-zinc-300" />
                                        </div>
                                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">No participants found</p>
                                    </div>
                                ) : (
                                    <>
                                        {playedStatuses.length > 0 && (
                                            <div className="mb-6">
                                                <div className="flex items-center gap-2 px-2 mb-3">
                                                    <PlayCircle size={14} className="text-lime-500" />
                                                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Played By</h4>
                                                </div>
                                                <div className="space-y-1">
                                                    {playedStatuses.map((s, i) => renderUser(s, i))}
                                                </div>
                                            </div>
                                        )}
                                        
                                        {readStatuses.length > 0 && (
                                            <div className="mb-6">
                                                <div className="flex items-center gap-2 px-2 mb-3">
                                                    <CheckCircle2 size={14} className="text-blue-500" />
                                                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Read By</h4>
                                                </div>
                                                <div className="space-y-1">
                                                    {readStatuses.map((s, i) => renderUser(s, playedStatuses.length + i))}
                                                </div>
                                            </div>
                                        )}

                                        {unseenStatuses.length > 0 && (
                                            <div className="mb-6">
                                                <div className="flex items-center gap-2 px-2 mb-3">
                                                    <Clock size={14} className="text-zinc-400" />
                                                    <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Delivered To</h4>
                                                </div>
                                                <div className="space-y-1">
                                                    {unseenStatuses.map((s, i) => renderUser(s, playedStatuses.length + readStatuses.length + i))}
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 border-t border-zinc-100 bg-zinc-50/50">
                            <div className="flex items-center justify-between text-[10px] font-black text-zinc-400 uppercase tracking-widest px-2">
                                <span>Message UID</span>
                                <span className="font-mono bg-zinc-100 px-1.5 py-0.5 rounded text-[9px]">{message.id.slice(0, 8)}...</span>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
