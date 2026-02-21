"use client";

import AuthCard, { AuthInput, AuthButton } from "@/components/auth/AuthCard";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { createClient } from "@/utils/supabase/client";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
    const [error, setError] = useState<string | null>(null);
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        setStatus("sending");
        setError(null);

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });

        if (error) {
            setError(error.message);
            setStatus("idle");
        } else {
            setStatus("sent");
        }
    };

    return (
        <AuthCard subtitle={status === "sent" ? "Transmission Successful" : "Account Recovery"}>
            <AnimatePresence mode="wait">
                {status !== "sent" ? (
                    <motion.form
                        key="form"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        <div className="text-center mb-2">
                            <p className="text-sm text-zinc-500 font-medium">
                                Enter your registered frequency (email). We will dispatch a recovery link.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <AuthInput
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                placeholder="Email Address"
                                icon={<Mail size={20} />}
                                required
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[10px] font-bold text-red-500 uppercase tracking-widest text-center">
                                ERROR: {error}
                            </div>
                        )}

                        <div className="pt-2">
                            <AuthButton disabled={status === "sending" || !email}>
                                {status === "sending" ? "Dispatching..." : "Send Recovery Link"}
                            </AuthButton>
                        </div>

                        <div className="text-center pt-4">
                            <Link href="/login" className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-zinc-900 transition-colors group uppercase tracking-widest">
                                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                                Return to Authenticator
                            </Link>
                        </div>
                    </motion.form>
                ) : (
                    <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-6 py-4"
                    >
                        <div className="flex justify-center">
                            <div className="w-24 h-24 bg-lime-100 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-lime-200">
                                <CheckCircle className="w-10 h-10 text-lime-600" strokeWidth={3} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-zinc-900 mb-2">Link Sent</h3>
                            <p className="text-zinc-500 text-sm font-medium">
                                Check <strong className="text-zinc-900">{email}</strong> for your recovery instructions. The link will expire in 15 minutes.
                            </p>
                        </div>

                        <div className="pt-4 space-y-4">
                            <Link href="/login" className="block w-full">
                                <AuthButton>
                                    Return to Login
                                </AuthButton>
                            </Link>

                            <button
                                onClick={() => setStatus("idle")}
                                className="text-xs font-bold text-zinc-400 hover:text-lime-600 transition-colors uppercase tracking-widest"
                            >
                                Wrong email? Try again
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AuthCard>
    );
}
