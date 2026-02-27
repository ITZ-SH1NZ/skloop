"use client";

import AuthCard, { AuthButton, AuthInput } from "@/components/auth/AuthCard";
import { CheckCircle2, Zap, ArrowRight, ShieldCheck, User, AtSign } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect, useState, Suspense } from "react";
import confetti from "canvas-confetti";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

function ConfirmedPageContent() {
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: "", handle: "" });
    const searchParams = useSearchParams();
    const router = useRouter();
    const isNewGoogleUser = searchParams.get("new") === "true";

    useEffect(() => {
        confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ['#a3e635', '#18181b', '#ffffff']
        });
    }, []);

    const handleProfileSetup = async () => {
        if (!formData.name.trim() || !formData.handle.trim()) {
            setError("Please fill in both your display name and handle.");
            return;
        }
        setIsSaving(true);
        setError(null);

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            setError("Session expired. Please log in again.");
            setIsSaving(false);
            return;
        }

        // Check if handle is taken
        const { data: existing } = await supabase
            .from("profiles")
            .select("username")
            .eq("username", formData.handle.trim())
            .maybeSingle();

        if (existing) {
            setError("That handle is already taken. Please choose another.");
            setIsSaving(false);
            return;
        }

        const { error: updateError } = await supabase
            .from("profiles")
            .update({
                full_name: formData.name.trim(),
                username: formData.handle.trim(),
            })
            .eq("id", user.id);

        if (updateError) {
            setError("Failed to save profile. Please try again.");
            setIsSaving(false);
            return;
        }

        router.push("/dashboard");
    };

    // New Google user — show profile setup form
    if (isNewGoogleUser) {
        return (
            <AuthCard subtitle="Set Up Your Pilot">
                <div className="flex flex-col items-center text-center mb-8">
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", damping: 12 }}
                        className="w-20 h-20 bg-white border-4 border-zinc-900 rounded-full flex items-center justify-center shadow-2xl mb-4"
                    >
                        <CheckCircle2 className="w-10 h-10 text-lime-500" strokeWidth={3} />
                    </motion.div>
                    <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Google Connected!</h2>
                    <p className="text-sm font-medium text-zinc-500 max-w-xs mx-auto mt-2">
                        Now choose your Pilot ID and callsign. These are your permanent identity on Skloop.
                    </p>
                </div>

                <div className="space-y-4">
                    <AuthInput
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        type="text"
                        placeholder="Callsign (display name)"
                        icon={<User size={20} />}
                        autoFocus
                    />
                    <AuthInput
                        value={formData.handle}
                        onChange={(e) => setFormData(prev => ({ ...prev, handle: e.target.value }))}
                        type="text"
                        placeholder="Pilot ID (@handle)"
                        icon={<AtSign size={20} />}
                    />
                    {error && <p className="text-sm font-bold text-red-500 text-center">{error}</p>}
                    <AuthButton
                        onClick={handleProfileSetup}
                        disabled={isSaving || !formData.name.trim() || !formData.handle.trim()}
                        className="w-full"
                    >
                        {isSaving ? "Saving..." : "Lock In & Begin First Run"}
                    </AuthButton>
                </div>
            </AuthCard>
        );
    }

    // Standard email-verified user — celebration screen
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

export default function AuthConfirmedPage() {
    return (
        <Suspense fallback={
            <AuthCard subtitle="Loading...">
                <div className="h-64 flex items-center justify-center">
                    <div className="w-10 h-10 border-4 border-zinc-100 border-t-primary rounded-full animate-spin" />
                </div>
            </AuthCard>
        }>
            <ConfirmedPageContent />
        </Suspense>
    );
}
