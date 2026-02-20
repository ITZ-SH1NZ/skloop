"use client";

import AuthCard, { AuthButton } from "@/components/auth/AuthCard";
import { Mail, ArrowRight, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";

export default function VerifyEmailPage() {
    const searchParams = useSearchParams();
    const email = searchParams.get("email");
    const [isResending, setIsResending] = useState(false);
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
    const supabase = createClient();

    const handleResend = async () => {
        if (!email) {
            setMessage({ text: "No email address found to resend to.", type: "error" });
            return;
        }

        setIsResending(true);
        setMessage(null);

        const { error } = await supabase.auth.resend({
            type: 'signup',
            email: email,
        });

        if (error) {
            setMessage({ text: error.message, type: "error" });
        } else {
            setMessage({ text: "Verification link resent successfully!", type: "success" });
        }
        setIsResending(false);
    };

    return (
        <AuthCard subtitle="Authorization Required">
            <div className="flex flex-col items-center justify-center text-center space-y-6 py-4">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-20 h-20 bg-lime-100 rounded-full flex items-center justify-center shadow-lg mb-2"
                >
                    <Mail className="w-10 h-10 text-lime-600" strokeWidth={2.5} />
                </motion.div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Check Your Inbox</h2>
                    <p className="text-sm font-medium text-zinc-500 max-w-sm mx-auto">
                        We've sent a secure launch link to <strong className="text-zinc-900">{email || "your email"}</strong>.
                        Click the link inside to authorize your pilot account and initialize the dashboard.
                    </p>
                </div>

                {message && (
                    <motion.div
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-xs font-bold px-4 py-3 rounded-xl w-full ${message.type === "success" ? "bg-lime-50 text-lime-700 border border-lime-200" : "bg-red-50 text-red-600 border border-red-200"}`}
                    >
                        {message.text}
                    </motion.div>
                )}

                <div className="w-full space-y-3 pt-4">
                    <Link href="/login" className="block w-full">
                        <AuthButton className="w-full group">
                            Return to Login
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                        </AuthButton>
                    </Link>

                    <button
                        onClick={handleResend}
                        disabled={isResending || !email}
                        className="w-full h-12 flex items-center justify-center gap-2 text-xs font-bold text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest"
                    >
                        <RefreshCcw className={`w-4 h-4 ${isResending ? "animate-spin" : ""}`} />
                        {isResending ? "Resending..." : "Resend Link"}
                    </button>
                </div>
            </div>
        </AuthCard>
    );
}
