"use client";

import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";

interface AvatarStackProps {
    members: { id: string; name: string; avatarUrl: string }[];
    maxDisplay?: number;
}

export function AvatarStack({ members, maxDisplay = 4 }: AvatarStackProps) {
    const displayMembers = members.slice(0, maxDisplay);
    const remainingCount = members.length - maxDisplay;

    return (
        <div className="flex items-center -space-x-2">
            {displayMembers.map((member, index) => (
                <motion.div
                    key={member.id}
                    initial={{ scale: 0, x: -10 }}
                    animate={{ scale: 1, x: 0 }}
                    transition={{ delay: index * 0.05, type: "spring", stiffness: 300, damping: 20 }}
                    className="relative group"
                    whileHover={{ scale: 1.1, zIndex: 10 }}
                >
                    <Avatar
                        src={member.avatarUrl}
                        fallback={member.name[0]}
                        className="w-7 h-7 border-2 border-white ring-1 ring-zinc-100 transition-all"
                    />
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                        {member.name}
                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-zinc-900" />
                    </div>
                </motion.div>
            ))}
            {remainingCount > 0 && (
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: maxDisplay * 0.05 }}
                    className="w-7 h-7 rounded-full bg-zinc-100 border-2 border-white ring-1 ring-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-600"
                >
                    +{remainingCount}
                </motion.div>
            )}
        </div>
    );
}
