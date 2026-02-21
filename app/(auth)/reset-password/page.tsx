"use client";

import AuthCard, { AuthInput, AuthButton } from "@/components/auth/AuthCard";
import { Lock, ShieldCheck, ArrowRight, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

export default function ResetPasswordPage() {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [status, setStatus] = useState<"idle" | "submitting" | "success">("idle");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password || password !== confirmPassword) {
            setError("Passwords must match and meet security standards.");
            return;
        }

        setStatus("submitting");
        setError(null);

        const { error } = await supabase.auth.updateUser({
            password: password
        });

        if (error) {
            setError(error.message);
            setStatus("idle");
        } else {
            setStatus("success");
            // Auto redirect after a delay
            setTimeout(() => {
                router.push("/dashboard");
            }, 3000);
        }
    };

    return (
        <AuthCard subtitle={status === "success" ? "Access Restored" : "Calibrate New Access Key"}>
            <AnimatePresence mode="wait">
                {status !== "success" ? (
                    <motion.form
                        key="reset-form"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >
                        <div className="text-center mb-2">
                            <p className="text-sm text-zinc-500 font-medium">
                                Establish your new encrypted frequency. Ensure it is unique and resilient.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <AuthInput
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                placeholder="New Access Key"
                                icon={<Lock size={20} />}
                                required
                                autoFocus
                            />
                            <AuthInput
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                type="password"
                                placeholder="Confirm New Access Key"
                                icon={<ShieldCheck size={20} />}
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-[10px] font-bold text-red-500 uppercase tracking-widest text-center">
                                ERROR: {error}
                            </div>
                        )}

                        <div className="pt-2">
                            <AuthButton disabled={status === "submitting" || !password || password !== confirmPassword}>
                                {status === "submitting" ? "Encrypting..." : "Update Access Key"}
                            </AuthButton>
                        </div>
                    </motion.form>
                ) : (
                    <motion.div
                        key="reset-success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center space-y-6 py-4"
                    >
                        <div className="flex justify-center">
                            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center animate-bounce shadow-lg shadow-primary/20">
                                <CheckCircle className="w-10 h-10 text-primary" strokeWidth={3} />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-zinc-900 mb-2">Protocol Complete</h3>
                            <p className="text-zinc-500 text-sm font-medium">
                                Your new access key has been synchronized. Redirecting to your dashboard...
                            </p>
                        </div>

                        <div className="pt-4">
                            <Link href="/dashboard" className="block w-full">
                                <AuthButton>
                                    Enter Dashboard <ArrowRight size={18} className="ml-2" />
                                </AuthButton>
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AuthCard>
    );
}
