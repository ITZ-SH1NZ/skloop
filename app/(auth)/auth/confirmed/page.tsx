"use client";

import AuthCard, { AuthButton } from "@/components/auth/AuthCard";
import { CheckCircle2, Zap, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

export default function AuthConfirmedPage() {
    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        // Celebration!
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#a3e635', '#18181b', '#ffffff']
        });
    }, []);

    return (
        <AuthCard subtitle="Authorization Success">
            <div className="flex flex-col items-center justify-center text-center py-6">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", damping: 12 }}
                    className="relative mb-8"
                >
                    <div className="absolute inset-0 bg-lime-400/20 blur-3xl rounded-full scale-150 animate-pulse" />
                    <div className="w-24 h-24 bg-white border-4 border-zinc-900 rounded-full flex items-center justify-center shadow-2xl relative z-10">
                        <CheckCircle2 className="w-12 h-12 text-lime-500" strokeWidth={3} />
                    </div>
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-2 -right-2 bg-zinc-900 text-lime-400 p-2 rounded-lg shadow-xl"
                    >
                        <Zap size={16} />
                    </motion.div>
                </motion.div>

                <div className="space-y-3 mb-10">
                    <h2 className="text-3xl font-black text-zinc-900 tracking-tight leading-none">
                        PROTOCOL_ACTIVATED
                    </h2>
                    <p className="text-sm font-medium text-zinc-500 max-w-xs mx-auto">
                        Your identity has been verified. The Skloop network is now synchronized with your pilot credentials.
                    </p>
                </div>

                <div className="w-full bg-zinc-50 rounded-2xl border border-zinc-100 p-4 mb-8 flex items-center gap-4 text-left">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center border border-zinc-200 shadow-sm">
                        <ShieldCheck className="text-zinc-400" size={20} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-0.5">Status: Operational</div>
                        <div className="text-xs font-bold text-zinc-900">Handshake Complete • Redirect Ready</div>
                    </div>
                </div>

                <Link href="/dashboard" className="w-full">
                    <AuthButton
                        onClick={() => setIsRedirecting(true)}
                        className="w-full group h-14"
                    >
                        {isRedirecting ? "Syncing Workspace..." : "Begin First Run"}
                        {!isRedirecting && <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />}
                    </AuthButton>
                </Link>

                <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">
                    Transmission Encrypted • End of Handshake
                </p>
            </div>
        </AuthCard>
    );
}
