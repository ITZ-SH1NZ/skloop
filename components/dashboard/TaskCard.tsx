"use client";

import { Code, BookOpen, Users, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/ToastProvider";

interface TaskCardProps {
    type: 'code' | 'concept' | 'social' | 'practice';
    title: string;
    desc: string;
    xp: number;
    meta?: string;
    actionLabel?: string;
}

const VARIANTS = {
    code: { icon: Code, color: "text-blue-500", bg: "bg-blue-50", label: "Daily" },
    concept: { icon: Lightbulb, color: "text-orange-500", bg: "bg-orange-50", label: "New" },
    social: { icon: Users, color: "text-purple-500", bg: "bg-purple-50", label: "Social" },
    practice: { icon: BookOpen, color: "text-[#166534]", bg: "bg-[#F0FDF4]", label: "Practice" }
};

export default function TaskCard({ type, title, desc, xp, meta, actionLabel }: TaskCardProps) {
    const theme = VARIANTS[type];
    const Icon = theme.icon;
    const { toast } = useToast();

    const handleAction = (e: React.MouseEvent) => {
        e.stopPropagation();
        toast(`${actionLabel || 'Action'} started...`, "success");
    };

    return (
        <motion.div
            whileHover={{ y: -4, boxShadow: "0 20px 40px -12px rgba(0,0,0,0.05)" }}
            whileTap={{ scale: 0.98 }}
            className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-[0_2px_10px_-5px_rgba(0,0,0,0.02)] flex flex-col h-full cursor-pointer group"
            onClick={() => toast(`Opened details for ${title}`, "info")}
        >
            <div className="flex justify-between items-start mb-6">
                <div className={`w-12 h-12 rounded-2xl ${theme.bg} ${theme.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <Icon size={20} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">
                    {theme.label}
                </span>
            </div>

            <h3 className="font-bold text-lg text-slate-800 mb-2 leading-tight group-hover:text-[#D4F268] transition-colors">{title}</h3>
            <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">
                {desc}
            </p>

            <div className="flex justify-between items-center text-xs font-bold pt-4 border-t border-slate-50">
                {meta && (
                    <div className="flex items-center gap-1 text-slate-400">
                        {type === 'code' && <span className="w-3 h-3 rounded-full border-2 border-slate-300" />}
                        {meta}
                    </div>
                )}
                <div className="text-[#D4F268] bg-[#1A1C1E] px-2 py-1 rounded text-[10px] tracking-wide">
                    +{xp} XP
                </div>
            </div>

            {actionLabel && (
                <button
                    onClick={handleAction}
                    className="w-full mt-4 py-2 bg-slate-50 hover:bg-[#D4F268]/20 hover:text-slate-900 text-slate-600 font-bold text-xs rounded-xl transition-colors"
                >
                    {actionLabel}
                </button>
            )}
        </motion.div>
    );
}
