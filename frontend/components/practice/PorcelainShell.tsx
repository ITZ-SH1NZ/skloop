"use client";

import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";

interface PorcelainShellProps {
    title: string;
    description?: string;
    children: ReactNode;
    headerContent?: ReactNode;
    backPath?: string;
}

export default function PorcelainShell({
    title,
    description,
    children,
    headerContent,
    backPath = "/practice"
}: PorcelainShellProps) {
    return (
        <div className="w-full min-h-screen bg-[#FDFCF8] text-zinc-900 relative overflow-x-hidden font-sans selection:bg-lime-200 selection:text-lime-900">

            {/* Soft Background Gradients */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
                <div className="absolute -top-[20%] -right-[10%] w-[800px] h-[800px] bg-lime-100/40 rounded-full blur-[100px]" />
                <div className="absolute top-[40%] -left-[10%] w-[600px] h-[600px] bg-zinc-100/40 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-lime-50/40 rounded-full blur-[80px]" />
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-8 pb-4 md:px-12 md:pt-10 md:pb-6 flex flex-col min-h-screen">

                {/* Header */}
                <header className="flex items-center justify-between mb-12">
                    <div className="flex items-center gap-6">
                        <Link
                            href={backPath}
                            className="group flex items-center justify-center w-12 h-12 rounded-2xl bg-white border border-zinc-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                        >
                            <ArrowLeft size={20} className="text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                        </Link>
                        <div>
                            <motion.h1
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl font-extrabold tracking-tight text-zinc-900"
                            >
                                {title}
                            </motion.h1>
                            {description && (
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-zinc-500 font-medium mt-1 text-lg"
                                >
                                    {description}
                                </motion.p>
                            )}
                        </div>
                    </div>

                    <div className="hidden md:block">
                        {headerContent}
                    </div>
                </header>

                {/* Main Content Area */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 100 }}
                    className="flex-1 relative"
                >
                    {children}
                </motion.div>
            </div>
        </div>
    );
}
