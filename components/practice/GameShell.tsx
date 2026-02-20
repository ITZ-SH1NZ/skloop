import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

interface GameShellProps {
    title: string;
    description: string;
    icon: ReactNode;
    children: ReactNode;
    color?: string;
}

export default function GameShell({ title, description, icon, children, color = "bg-primary" }: GameShellProps) {
    return (
        <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto space-y-8">
            <header className="flex items-center gap-4">
                <Link href="/practice" className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
                    <ArrowLeft size={24} className="text-slate-600" />
                </Link>
                <div>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg text-slate-900 ${color}`}>
                            {icon}
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
                    </div>
                    <p className="text-slate-500 text-sm mt-1 ml-1">{description}</p>
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden min-h-[600px] relative"
            >
                {children}
            </motion.div>
        </div>
    );
}
