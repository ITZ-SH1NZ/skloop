import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MessageCircle, Trophy, Zap, MapPin, Calendar, Github } from "lucide-react";
import { PeerProfile } from "./PeerCard";

interface PeerProfileModalProps {
    peer: PeerProfile | null;
    isOpen: boolean;
    onClose: () => void;
    onMessage: (id: string) => void;
}

export function PeerProfileModal({ peer, isOpen, onClose, onMessage }: PeerProfileModalProps) {
    if (!peer) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Profile">
            <div className="flex flex-col items-center pb-6">
                {/* Header Profile */}
                <div className="relative mb-4">
                    <div className="absolute -inset-1 bg-gradient-to-br from-lime-400 to-emerald-400 rounded-full blur opacity-50" />
                    <Avatar
                        src={peer.avatarUrl}
                        fallback={peer.name.charAt(0)}
                        className="w-24 h-24 border-4 border-white shadow-xl bg-zinc-100 text-3xl"
                    />
                    <div className="absolute bottom-0 right-0 bg-zinc-900 text-white text-xs font-black px-2 py-0.5 rounded-full border-2 border-white shadow-sm">
                        LVL {peer.level}
                    </div>
                </div>

                <h2 className="text-2xl font-black text-zinc-900 text-center">{peer.name}</h2>
                <p className="text-zinc-500 font-medium">@{peer.username}</p>

                <div className="flex items-center gap-2 mt-3 mb-6">
                    <Badge variant="secondary" className="bg-zinc-100 text-zinc-600 px-3 py-1 text-xs">
                        {peer.track} Track
                    </Badge>
                    {peer.isOnline && (
                        <Badge variant="secondary" className="bg-green-100 text-green-700 px-3 py-1 text-xs">
                            Online
                        </Badge>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 w-full max-w-xs mb-8">
                    <Button
                        className="flex-1 bg-zinc-900 text-white shadow-lg shadow-zinc-900/20"
                        onClick={() => onMessage(peer.id)}
                    >
                        <MessageCircle size={18} className="mr-2" />
                        Message
                    </Button>
                    <Button variant="outline" className="flex-1 border-zinc-200">
                        View Stats
                    </Button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 w-full mb-8">
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-100 flex flex-col items-center">
                        <Trophy className="text-amber-500 mb-2" size={24} />
                        <span className="text-2xl font-black text-amber-900">{peer.xp.toLocaleString()}</span>
                        <span className="text-xs font-bold text-amber-500 uppercase tracking-wide">Total XP</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-orange-50 border border-orange-100 flex flex-col items-center">
                        <Zap className="text-orange-500 mb-2" size={24} />
                        <span className="text-2xl font-black text-orange-900">{peer.streak}</span>
                        <span className="text-xs font-bold text-orange-500 uppercase tracking-wide">Day Streak</span>
                    </div>
                </div>

                {/* Additional Info / Mock Data */}
                <div className="w-full space-y-4">
                    <div className="flex items-center gap-3 text-sm text-zinc-600 p-3 rounded-xl hover:bg-zinc-50 transition-colors">
                        <MapPin size={18} className="text-zinc-400" />
                        <span>San Francisco, CA</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-zinc-600 p-3 rounded-xl hover:bg-zinc-50 transition-colors">
                        <Calendar size={18} className="text-zinc-400" />
                        <span>Joined January 2024</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-zinc-600 p-3 rounded-xl hover:bg-zinc-50 transition-colors">
                        <Github size={18} className="text-zinc-400" />
                        <span>github.com/{peer.username}</span>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
