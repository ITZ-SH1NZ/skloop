import { motion } from "framer-motion";
import { MessageCircle, UserPlus, Check, X, Clock } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export interface PeerProfile {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    track: string;
    level: number;
    xp: number;
    streak: number;
    status: "friend" | "pending_incoming" | "pending_outgoing" | "none";
    isOnline?: boolean;
}

export interface PeerCardProps {
    peer: PeerProfile;
    onAction: (action: "add" | "message" | "accept" | "reject" | "remove") => void;
    onClick?: () => void;
}

export function PeerCard({ peer, onAction, onClick }: PeerCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.01 }}
            onClick={onClick}
            className={`group relative bg-white rounded-2xl p-3 md:p-4 border border-zinc-200 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between gap-3 md:gap-4 overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
        >
            {/* Online Indicator (moved to avatar wrapper) */}

            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0 pointer-events-none">
                {/* Avatar */}
                <div className="relative shrink-0">
                    <Avatar
                        src={peer.avatarUrl}
                        fallback={peer.name.charAt(0)}
                        className="w-12 h-12 md:w-14 md:h-14 border-2 border-white shadow-sm bg-zinc-100 text-zinc-400 text-lg font-bold"
                    />

                    {/* Level Badge */}
                    <div className="absolute -bottom-1 -right-1 bg-zinc-900 text-white text-[9px] font-black px-1.5 py-px rounded-full border border-white">
                        L{peer.level}
                    </div>

                    {/* Online Dot */}
                    {peer.isOnline && (
                        <div className="absolute top-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white z-10" />
                    )}
                </div>

                {/* Info */}
                <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm md:text-base text-zinc-900 truncate">{peer.name}</h3>
                        <Badge variant="secondary" className="hidden md:inline-flex bg-zinc-100 text-zinc-500 text-[10px] h-5 px-1.5">
                            {peer.track}
                        </Badge>
                    </div>
                    <p className="text-[10px] md:text-xs text-zinc-500 font-medium truncate">@{peer.username}</p>

                    {/* Mobile Track Badge */}
                    <div className="mt-1 md:hidden">
                        <Badge variant="secondary" className="bg-zinc-100 text-zinc-500 text-[9px] h-4 px-1.5">
                            {peer.track}
                        </Badge>
                    </div>
                </div>
            </div>

            {/* Stats Row (Desktop Only or Compact) */}
            <div className="hidden md:flex items-center gap-3 mr-4 pointer-events-none">
                <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-amber-900">{peer.xp} XP</span>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Total</span>
                </div>
                <div className="w-px h-6 bg-zinc-100" />
                <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-orange-600">{peer.streak}🔥</span>
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider">Day</span>
                </div>
            </div>

            {/* Action Button */}
            <div className="shrink-0" onClick={(e) => e.stopPropagation()}>
                {peer.status === "friend" ? (
                    <Button
                        size="icon"
                        variant="ghost"
                        className="rounded-full w-9 h-9 md:w-auto md:px-4 md:h-9 bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                        onClick={() => onAction("message")}
                    >
                        <MessageCircle size={18} className="md:mr-2" />
                        <span className="hidden md:inline">Chat</span>
                    </Button>
                ) : peer.status === "pending_incoming" ? (
                    <div className="flex gap-2">
                        <Button size="icon" className="w-9 h-9 rounded-full bg-lime-500 hover:bg-lime-600 text-white" onClick={() => onAction("accept")}>
                            <Check size={16} />
                        </Button>
                        <Button size="icon" variant="ghost" className="w-9 h-9 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-500" onClick={() => onAction("reject")}>
                            <X size={16} />
                        </Button>
                    </div>
                ) : peer.status === "pending_outgoing" ? (
                    <Button disabled size="sm" className="bg-zinc-50 text-zinc-400 border border-zinc-200">
                        <Clock size={16} className="mr-2" />
                        <span className="hidden md:inline">Pending</span>
                    </Button>
                ) : (
                    <Button
                        size="icon"
                        className="rounded-full w-9 h-9 md:w-auto md:px-4 md:h-9 bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm"
                        onClick={() => onAction("add")}
                    >
                        <UserPlus size={18} className="md:mr-2" />
                        <span className="hidden md:inline">Add</span>
                    </Button>
                )}
            </div>
        </motion.div>
    );
}
