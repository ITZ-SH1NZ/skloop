"use client";

import AuthCard, { AuthButton, AuthInput } from "@/components/auth/AuthCard";
import { CheckCircle2, Zap, ArrowRight, ShieldCheck, User, AtSign, Check, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, Suspense } from "react";
import confetti from "canvas-confetti";
import { useSearchParams, useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

type TrackChoice = "web-development" | "dsa";
type DifficultyChoice = "easy" | "standard" | "challenge";
type MentorIntent = "goal" | "maybe" | "no";

function ConfirmedPageContent() {
    const [step, setStep] = useState(1);
    const [isRedirecting, setIsRedirecting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isChecking, setIsChecking] = useState(false);

    // Form Data (replicated from signup)
    const [formData, setFormData] = useState({ name: "", handle: "" });
    const [tracks, setTracks] = useState<TrackChoice[]>([]);
    const [difficulty, setDifficulty] = useState<DifficultyChoice | null>(null);
    const [timeCommitment, setTimeCommitment] = useState<string | null>(null);
    const [mentorIntent, setMentorIntent] = useState<MentorIntent>("maybe");
    const [mentorDream, setMentorDream] = useState("");

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

    const toggleTrack = (track: TrackChoice) => {
        setTracks((prev) =>
            prev.includes(track) ? prev.filter((t) => t !== track) : [...prev, track]
        );
    };

    const validateStepAsync = async () => {
        const supabase = createClient();
        if (step === 1) {
            if (!formData.name.trim() || !formData.handle.trim()) {
                return "Complete all fields to lock in your pilot.";
            }

            // Check if handle is taken
            const { data: existing } = await supabase
                .from('profiles')
                .select('username')
                .eq('username', formData.handle.trim())
                .maybeSingle();

            if (existing) {
                return "Handle already in use. Please select another.";
            }
        }
        if (step === 2) {
            if (tracks.length === 0) {
                return "Choose at least one track to start your run.";
            }
        }
        if (step === 3) {
            if (!difficulty) {
                return "Pick a difficulty so we can calibrate your sessions.";
            }
        }
        return null;
    };

    const isStepValid = () => {
        if (step === 1) return formData.name.trim() && formData.handle.trim();
        if (step === 2) return tracks.length > 0;
        if (step === 3) return !!difficulty;
        return true;
    };

    const handleNext = async () => {
        setIsChecking(true);
        const validationError = await validateStepAsync();
        setIsChecking(false);

        if (validationError) {
            setError(validationError);
            return;
        }
        setError(null);

        if (step < 5) {
            setStep(step + 1);
        } else {
            handleCompleteSetup();
        }
    };

    const handleBack = () => {
        if (step > 1 && !isSaving) {
            setError(null);
            setStep(step - 1);
        }
    };

    const handleCompleteSetup = async () => {
        setIsSaving(true);
        setError(null);

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            setError("Session expired. Please log in again.");
            setIsSaving(false);
            return;
        }

        try {
            // 1. Update Profiles table
            const { error: profileError } = await supabase
                .from("profiles")
                .update({
                    full_name: formData.name.trim(),
                    username: formData.handle.trim(),
                })
                .eq("id", user.id);

            if (profileError) throw profileError;

            // 2. Update user metadata to match manual signup structure
            await supabase.auth.updateUser({
                data: {
                    username: formData.handle.trim(),
                    full_name: formData.name.trim(),
                    tracks: tracks,
                    difficulty: difficulty,
                    time_commitment: timeCommitment,
                    mentor_intent: mentorIntent,
                    mentor_dream: mentorDream
                }
            });

            router.push("/dashboard");
        } catch (err: any) {
            console.error("Setup error:", err);
            setError(err.message || "Failed to save profile. Please try again.");
            setIsSaving(false);
        }
    };

    const difficultyLabel =
        difficulty === "easy"
            ? "Gentle ramp-up with shorter dailies."
            : difficulty === "standard"
                ? "Balanced mix of theory, practice, and reviews."
                : difficulty === "challenge"
                    ? "Aggressive pacing, harder quests, mentor work earlier."
                    : "";

    const stepSubtitles = {
        1: "Create Your Pilot",
        2: "Pick Your Path",
        3: "Calibrate Difficulty",
        4: "Mentor Trajectory",
        5: "Launch Sequence",
    };

    // New Google user — show multi-step onboarding
    if (isNewGoogleUser) {
        return (
            <AuthCard
                subtitle={stepSubtitles[step as keyof typeof stepSubtitles] || "Ready"}
                showProgress={true}
                currentStep={step}
                totalSteps={5}
            >
                <div className="min-h-[350px] flex flex-col">
                    <AnimatePresence mode="wait">
                        {/* Step 1: Pilot Details */}
                        {step === 1 && (
                            <motion.div
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex-1 space-y-4"
                            >
                                <div className="flex flex-col items-center text-center mb-6">
                                    <motion.div
                                        initial={{ scale: 0.5, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="w-16 h-16 bg-white border-2 border-zinc-900 rounded-full flex items-center justify-center shadow-lg mb-4"
                                    >
                                        <CheckCircle2 className="w-8 h-8 text-lime-500" strokeWidth={3} />
                                    </motion.div>
                                    <h2 className="text-xl font-black text-zinc-900 tracking-tight">Google Connected!</h2>
                                    <p className="text-xs font-medium text-zinc-500 max-w-xs mx-auto mt-1">
                                        Choose your identity. These are your permanent credentials on the network.
                                    </p>
                                </div>

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
                            </motion.div>
                        )}

                        {/* Step 2: Pick Your Path (from signup) */}
                        {step === 2 && (
                            <motion.div
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex-1 space-y-4"
                            >
                                <div className="text-center mb-6">
                                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                                        Choose where your first run starts.
                                    </h3>
                                </div>
                                <div className="grid grid-cols-1 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => toggleTrack("web-development")}
                                        className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all ${tracks.includes("web-development")
                                            ? "border-zinc-900 bg-zinc-900 text-white shadow-lg"
                                            : "border-zinc-100 bg-zinc-50 text-zinc-500 hover:border-zinc-300 hover:bg-white"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-bold uppercase tracking-widest">Web Dev Track</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Frontend • Fullstack</span>
                                        </div>
                                        <p className="text-sm opacity-80 mt-1">Ship real interfaces, learn modern React/Next patterns.</p>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => toggleTrack("dsa")}
                                        className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all ${tracks.includes("dsa")
                                            ? "border-zinc-900 bg-zinc-900 text-white shadow-lg"
                                            : "border-zinc-100 bg-zinc-50 text-zinc-500 hover:border-zinc-300 hover:bg-white"
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm font-bold uppercase tracking-widest">DSA Track</span>
                                            <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Algorithms • Patterns</span>
                                        </div>
                                        <p className="text-sm opacity-80 mt-1">Master core patterns for interviews and problem solving.</p>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {/* Step 3: Difficulty (from signup) */}
                        {step === 3 && (
                            <motion.div
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex-1 space-y-5"
                            >
                                <div className="text-center mb-6">
                                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                                        How hard should your runs hit?
                                    </h3>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                    {["easy", "standard", "challenge"].map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => setDifficulty(opt as DifficultyChoice)}
                                            className={`flex flex-col items-center justify-center px-3 py-3 rounded-2xl border-2 text-xs font-bold uppercase tracking-widest transition-all ${difficulty === opt
                                                ? "border-zinc-900 bg-zinc-900 text-white shadow-lg"
                                                : "border-zinc-100 bg-zinc-50 text-zinc-500 hover:border-zinc-300 hover:bg-white"
                                                }`}
                                        >
                                            <span>{opt === 'easy' ? 'Warmup' : opt === 'standard' ? 'Standard' : 'Challenge'}</span>
                                        </button>
                                    ))}
                                </div>
                                <div className="space-y-4">
                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Time Commitment</p>
                                    <div className="flex flex-wrap gap-2">
                                        {["Casual (2h / week)", "Standard (4h / week)", "Grind (8h+ / week)"].map((label) => (
                                            <button
                                                key={label}
                                                type="button"
                                                onClick={() => setTimeCommitment(timeCommitment === label ? null : label)}
                                                className={`px-3 py-2 rounded-full border-2 text-[11px] font-bold uppercase tracking-widest transition-all ${timeCommitment === label
                                                    ? "border-zinc-900 bg-zinc-900 text-white"
                                                    : "border-zinc-100 bg-zinc-50 text-zinc-500 hover:border-zinc-300 hover:bg-white"
                                                    }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                    {difficulty && <p className="text-xs text-zinc-500 italic">{difficultyLabel}</p>}
                                </div>
                            </motion.div>
                        )}

                        {/* Step 4: Mentor (from signup) */}
                        {step === 4 && (
                            <motion.div
                                key="step4"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="flex-1 space-y-5"
                            >
                                <div className="text-center mb-6">
                                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                                        Future Mentor Trajectory
                                    </h3>
                                </div>
                                <div className="flex gap-2">
                                    {[
                                        { id: "goal", label: "That's the goal" },
                                        { id: "maybe", label: "Maybe later" },
                                        { id: "no", label: "Just here to learn" },
                                    ].map((opt) => (
                                        <button
                                            key={opt.id}
                                            type="button"
                                            onClick={() => setMentorIntent(opt.id as MentorIntent)}
                                            className={`flex-1 px-3 py-3 rounded-2xl border-2 text-[11px] font-bold uppercase tracking-widest transition-all ${mentorIntent === opt.id
                                                ? "border-zinc-900 bg-zinc-900 text-white"
                                                : "border-zinc-100 bg-zinc-50 text-zinc-500 hover:border-zinc-300 hover:bg-white"
                                                }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                                <AuthInput
                                    value={mentorDream}
                                    onChange={(e) => setMentorDream(e.target.value)}
                                    type="text"
                                    placeholder="One day I'd like to mentor in..."
                                    icon={<Zap size={18} />}
                                />
                            </motion.div>
                        )}

                        {/* Step 5: Summary & Launch */}
                        {step === 5 && (
                            <motion.div
                                key="step5"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex-1 flex flex-col items-center justify-center text-center py-6"
                            >
                                <div className="w-20 h-20 bg-lime-400 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-lime-200 animate-pulse">
                                    <Check className="w-10 h-10 text-black" strokeWidth={4} />
                                </div>
                                <h2 className="text-2xl font-black text-zinc-900 mb-2 mt-4 tracking-tight">Launch Ready.</h2>
                                <div className="w-full text-left text-xs bg-zinc-50 rounded-2xl border border-zinc-100 px-4 py-4 space-y-3 mt-4">
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-zinc-700 uppercase tracking-widest text-[10px]">Callsign</span>
                                        <span className="font-bold text-zinc-900">{formData.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-zinc-700 uppercase tracking-widest text-[10px]">Handle</span>
                                        <span className="font-bold text-zinc-900">@{formData.handle}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="font-semibold text-zinc-700 uppercase tracking-widest text-[10px]">Track</span>
                                        <span className="font-bold text-zinc-900">{tracks.map(t => t === 'web-development' ? 'Web Dev' : 'DSA').join(' • ')}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {error && <p className="text-xs font-bold text-red-500 mt-4 text-center">{error}</p>}

                    <div className="pt-8 mt-auto flex items-center gap-3">
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={handleBack}
                                disabled={isSaving}
                                className="h-12 px-4 rounded-2xl border-2 border-zinc-100 bg-zinc-50 text-zinc-500 hover:bg-white hover:border-zinc-300 transition-all font-bold text-xs uppercase tracking-widest flex items-center justify-center"
                            >
                                <ArrowLeft size={16} className="mr-1" /> Back
                            </button>
                        )}
                        <AuthButton
                            onClick={handleNext}
                            disabled={!isStepValid() || isSaving || isChecking}
                            className="flex-1"
                        >
                            {step === 5 ? (isSaving ? "Calibrating..." : "Begin First Run") : (isChecking ? "Verifying..." : "Continue")}
                        </AuthButton>
                    </div>
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
                    <div className="w-10 h-10 border-4 border-zinc-100 border-t-lime-500 rounded-full animate-spin" />
                </div>
            </AuthCard>
        }>
            <ConfirmedPageContent />
        </Suspense>
    );
}
