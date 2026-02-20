"use client";

import AuthCard, { AuthInput, AuthButton } from "@/components/auth/AuthCard";
import { User, Mail, Lock, Check, AtSign, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type TrackChoice = "web-dev" | "dsa";
type DifficultyChoice = "easy" | "standard" | "challenge";
type MentorIntent = "goal" | "maybe" | "no";

export default function SignupPage() {
    const [step, setStep] = useState(1);
    const router = useRouter();

    const [authMethod, setAuthMethod] = useState<"email" | "google" | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        handle: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const supabase = createClient();

    const [tracks, setTracks] = useState<TrackChoice[]>([]);
    const [difficulty, setDifficulty] = useState<DifficultyChoice | null>(null);
    const [timeCommitment, setTimeCommitment] = useState<string | null>(null);
    const [mentorIntent, setMentorIntent] = useState<MentorIntent>("maybe");
    const [mentorDream, setMentorDream] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isChecking, setIsChecking] = useState(false);

    const updateForm = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const toggleTrack = (track: TrackChoice) => {
        setTracks((prev) =>
            prev.includes(track) ? prev.filter((t) => t !== track) : [...prev, track]
        );
    };

    const validateStepAsync = async () => {
        if (step === 1) {
            if (!authMethod) {
                return "Choose an authentication method.";
            }
            if (authMethod === "email") {
                if (!formData.email.trim() || !formData.password.trim()) {
                    return "Complete all fields to lock in your pilot.";
                }
                if (!formData.email.includes("@")) {
                    return "Signal weak — enter a valid email.";
                }
                if (formData.password.length < 6) {
                    return "Access key must be at least 6 characters.";
                }
                if (formData.password !== formData.confirmPassword) {
                    return "Access keys don't match.";
                }
            }
        }
        if (step === 2) {
            if (!formData.name.trim() || !formData.handle.trim()) {
                return "Complete all fields to lock in your pilot.";
            }

            // Check if handle is taken
            const { data: existingProcess } = await supabase
                .from('profiles')
                .select('username')
                .eq('username', formData.handle.trim())
                .single();

            if (existingProcess) {
                return "Handle already in use. Please select another.";
            }
        }
        if (step === 3) {
            if (tracks.length === 0) {
                return "Choose at least one track to start your run.";
            }
        }
        if (step === 4) {
            if (!difficulty) {
                return "Pick a difficulty so we can calibrate your sessions.";
            }
        }
        return null;
    };

    const isStepValid = () => {
        // Basic synchronous checks to enable/disable button before async click
        if (step === 1) {
            return authMethod === "google" || (formData.email.trim() && formData.password.trim() && formData.password === formData.confirmPassword);
        }
        if (step === 2) return formData.name.trim() && formData.handle.trim();
        if (step === 3) return tracks.length > 0;
        if (step === 4) return !!difficulty;
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

        if (step < 6) {
            setStep(step + 1);
        } else {
            setIsSubmitting(true);

            // Execute Supabase Signup
            supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: {
                        username: formData.handle,
                        full_name: formData.name,
                        tracks: tracks,
                        difficulty: difficulty,
                        time_commitment: timeCommitment,
                        mentor_intent: mentorIntent,
                        mentor_dream: mentorDream
                    }
                }
            }).then(({ data, error }) => {
                if (error) {
                    setError(error.message);
                    setIsSubmitting(false);
                } else if (data.user && !data.session) {
                    router.push(`/verify-email?email=${encodeURIComponent(formData.email)}`);
                } else {
                    router.push("/dashboard");
                }
            });
        }
    };

    const handleBack = () => {
        if (step > 1 && !isSubmitting) {
            setError(null);
            setStep(step - 1);
        }
    };

    const filledFields =
        Number(Boolean(formData.name.trim())) +
        Number(Boolean(formData.handle.trim()));
    const accountProgress = (filledFields / 2) * 100;

    const difficultyLabel =
        difficulty === "easy"
            ? "Gentle ramp-up with shorter dailies."
            : difficulty === "standard"
                ? "Balanced mix of theory, practice, and reviews."
                : difficulty === "challenge"
                    ? "Aggressive pacing, harder quests, mentor work earlier."
                    : "";

    const handleGoogleSignup = () => {
        setAuthMethod("google");
        setStep(2);
    };

    const stepSubtitles = {
        1: "Secure Access",
        2: "Create Your Pilot",
        3: "Pick Your Path",
        4: "Calibrate Difficulty",
        5: "Mentor Trajectory",
        6: "Launch Sequence",
    };

    return (
        <AuthCard
            subtitle={stepSubtitles[step as keyof typeof stepSubtitles] || "Ready"}
            showProgress={true}
            currentStep={step}
            totalSteps={6}
        >
            <div className="min-h-[300px] flex flex-col">
                <AnimatePresence mode="wait">
                    {/* Step 1: Secure Access */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 space-y-4"
                        >
                            <div className="text-center mb-6">
                                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                                    Choose how you want to access your account.
                                </h3>
                            </div>

                            <div className="space-y-4">
                                <AuthInput
                                    value={formData.email}
                                    onChange={(e) => {
                                        updateForm("email", e.target.value);
                                        if (!authMethod) setAuthMethod("email");
                                    }}
                                    type="email"
                                    placeholder="Contact frequency (email)"
                                    icon={<Mail size={20} />}
                                    autoFocus
                                />
                                <AuthInput
                                    value={formData.password}
                                    onChange={(e) => {
                                        updateForm("password", e.target.value);
                                        if (!authMethod) setAuthMethod("email");
                                    }}
                                    type="password"
                                    placeholder="Access key (password)"
                                    icon={<Lock size={20} />}
                                />
                                <AnimatePresence>
                                    {formData.password && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0, y: -10 }}
                                            animate={{ opacity: 1, height: "auto", y: 0 }}
                                            exit={{ opacity: 0, height: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <AuthInput
                                                value={formData.confirmPassword}
                                                onChange={(e) => updateForm("confirmPassword", e.target.value)}
                                                type="password"
                                                placeholder="Confirm access key"
                                                icon={<Lock size={20} />}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="relative py-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-zinc-200"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-white px-4 text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                                        Or Link
                                    </span>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={handleGoogleSignup}
                                className="w-full h-14 bg-white text-zinc-900 border-2 border-zinc-100 rounded-2xl flex items-center justify-center gap-3 hover:border-zinc-300 hover:shadow-lg transition-all duration-200 group font-bold"
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC04" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span>Continue with Google</span>
                            </button>
                        </motion.div>
                    )}

                    {/* Step 2: Create Your Pilot */}
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
                                    This is your identity across runs, tracks, and mentor reviews.
                                </h3>
                            </div>
                            <AuthInput
                                value={formData.name}
                                onChange={(e) => updateForm("name", e.target.value)}
                                type="text"
                                placeholder="Callsign (display name)"
                                icon={<User size={20} />}
                                autoFocus
                            />
                            <AuthInput
                                value={formData.handle}
                                onChange={(e) => updateForm("handle", e.target.value)}
                                type="text"
                                placeholder="Pilot ID (@handle)"
                                icon={<AtSign size={20} />}
                            />
                            <div className="mt-2">
                                <div className="flex justify-between text-xs font-bold text-zinc-400 mb-1">
                                    <span>Profile completion</span>
                                    <span>{Math.round(accountProgress)}%</span>
                                </div>
                                <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden relative">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-lime-400 via-lime-500 to-lime-600 rounded-full relative"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${accountProgress}%` }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                    >
                                        <motion.div
                                            className="absolute inset-0 bg-white/30"
                                            animate={{
                                                x: ["-100%", "100%"],
                                            }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 1.5,
                                                ease: "linear",
                                            }}
                                        />
                                        <motion.div
                                            className="absolute top-0 right-0 h-full w-1 bg-white/50"
                                            animate={{
                                                opacity: [0.5, 1, 0.5],
                                            }}
                                            transition={{
                                                repeat: Infinity,
                                                duration: 0.8,
                                            }}
                                        />
                                    </motion.div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 3: Pick Your Path */}
                    {step === 3 && (
                        <motion.div
                            key="step2"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 space-y-4"
                        >
                            <div className="text-center mb-6">
                                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                                    Choose where your first run starts. You can add more tracks later.
                                </h3>
                            </div>
                            <div className="grid grid-cols-1 gap-3">
                                <button
                                    type="button"
                                    onClick={() => toggleTrack("web-dev")}
                                    className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all ${tracks.includes("web-dev")
                                        ? "border-zinc-900 bg-zinc-900 text-white shadow-lg"
                                        : "border-zinc-100 bg-zinc-50 text-zinc-500 hover:border-zinc-300 hover:bg-white"
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-bold uppercase tracking-widest">
                                            Web Dev Track
                                        </span>
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                            Frontend • Fullstack
                                        </span>
                                    </div>
                                    <p className="text-sm opacity-80 mt-1">
                                        Ship real interfaces, learn modern React/Next patterns, and
                                        build portfolio-ready projects.
                                    </p>
                                    <div className="mt-3 flex gap-2 text-[10px] font-black uppercase tracking-widest opacity-70">
                                        <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20">
                                            Medium
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20">
                                            Project-heavy
                                        </span>
                                    </div>
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
                                        <span className="text-sm font-bold uppercase tracking-widest">
                                            DSA Track
                                        </span>
                                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">
                                            Algorithms • Patterns
                                        </span>
                                    </div>
                                    <p className="text-sm opacity-80 mt-1">
                                        Master the core patterns for interviews and advanced problem
                                        solving.
                                    </p>
                                    <div className="mt-3 flex gap-2 text-[10px] font-black uppercase tracking-widest opacity-70">
                                        <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20">
                                            Hard
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full bg-white/10 border border-white/20">
                                            XP Dense
                                        </span>
                                    </div>
                                </button>
                            </div>
                            <p className="text-xs text-zinc-400 mt-2">
                                You can unlock new tracks and switch focus any time from your dashboard.
                            </p>
                        </motion.div>
                    )}

                    {/* Step 4: Calibrate Difficulty */}
                    {step === 4 && (
                        <motion.div
                            key="step3"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 space-y-5"
                        >
                            <div className="text-center mb-6">
                                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                                    Tell us how hard you want your runs to hit.
                                </h3>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { id: "easy", label: "Warmup", caption: "Gentle intro" },
                                    { id: "standard", label: "Standard", caption: "Balanced" },
                                    { id: "challenge", label: "Challenge", caption: "Spicy" },
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setDifficulty(opt.id as DifficultyChoice)}
                                        className={`flex flex-col items-center justify-center px-3 py-3 rounded-2xl border-2 text-xs font-bold uppercase tracking-widest transition-all ${difficulty === opt.id
                                            ? "border-zinc-900 bg-zinc-900 text-white shadow-lg"
                                            : "border-zinc-100 bg-zinc-50 text-zinc-500 hover:border-zinc-300 hover:bg-white"
                                            }`}
                                    >
                                        <span>{opt.label}</span>
                                        <span className="mt-1 text-[9px] opacity-70">{opt.caption}</span>
                                    </button>
                                ))}
                            </div>

                            <div>
                                <p className="text-xs font-bold text-zinc-500 mb-2 uppercase tracking-widest">
                                    Time Commitment
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        "Casual (2h / week)",
                                        "Standard (4h / week)",
                                        "Grind (8h+ / week)",
                                    ].map((label) => (
                                        <button
                                            key={label}
                                            type="button"
                                            onClick={() =>
                                                setTimeCommitment(
                                                    timeCommitment === label ? null : label
                                                )
                                            }
                                            className={`px-3 py-2 rounded-full border-2 text-[11px] font-bold uppercase tracking-widest transition-all ${timeCommitment === label
                                                ? "border-zinc-900 bg-zinc-900 text-white"
                                                : "border-zinc-100 bg-zinc-50 text-zinc-500 hover:border-zinc-300 hover:bg-white"
                                                }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                {difficulty && (
                                    <p className="mt-3 text-xs text-zinc-500">{difficultyLabel}</p>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* Step 5: Mentor Trajectory */}
                    {step === 5 && (
                        <motion.div
                            key="step4"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="flex-1 space-y-5"
                        >
                            <div className="text-center mb-6">
                                <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">
                                    Skloop mentors unlock special tools once they hit certain levels or get vouched. Where do you see yourself?
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

                            <div>
                                <p className="text-xs font-bold text-zinc-500 mb-2 uppercase tracking-widest">
                                    One day I'd like to mentor in...
                                </p>
                                <AuthInput
                                    value={mentorDream}
                                    onChange={(e) => setMentorDream(e.target.value)}
                                    type="text"
                                    placeholder="e.g. React, Systems Design, DSA, Career"
                                />
                                <p className="mt-2 text-[11px] text-zinc-400">
                                    Optional, but it helps us shape quests and mentor reviews.
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {/* Step 6: Launch Sequence */}
                    {step === 6 && (
                        <motion.div
                            key="step5"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex-1 flex flex-col items-center justify-center text-center py-6"
                        >
                            <div className="w-24 h-24 bg-lime-400 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-lime-200 animate-pulse">
                                <Check className="w-10 h-10 text-black" strokeWidth={4} />
                            </div>
                            <h2 className="text-3xl font-black text-zinc-900 mb-2 tracking-tight">
                                Launch Sequence Ready.
                            </h2>
                            <p className="text-zinc-500 font-medium mb-4">
                                Here's your starting run. You can tweak any of this later in settings.
                            </p>

                            <div className="w-full text-left text-sm bg-zinc-50 rounded-2xl border border-zinc-100 px-4 py-3 space-y-2">
                                <div className="flex justify-between">
                                    <span className="font-semibold text-zinc-700">Callsign</span>
                                    <span className="font-medium text-zinc-900 truncate max-w-[55%]">
                                        {formData.name || "Not set"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-zinc-700">Track</span>
                                    <span className="font-medium text-zinc-900 truncate max-w-[55%]">
                                        {tracks.length === 0
                                            ? "Not set"
                                            : tracks
                                                .map((t) => (t === "web-dev" ? "Web Dev" : "DSA"))
                                                .join(" • ")}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-zinc-700">Mode</span>
                                    <span className="font-medium text-zinc-900 truncate max-w-[55%]">
                                        {difficulty
                                            ? difficulty === "easy"
                                                ? "Warmup"
                                                : difficulty === "standard"
                                                    ? "Standard"
                                                    : "Challenge"
                                            : "Standard"}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-semibold text-zinc-700">Time</span>
                                    <span className="font-medium text-zinc-900 truncate max-w-[55%]">
                                        {timeCommitment || "Flexible"}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {error && (
                    <p className="w-full text-xs font-medium text-red-500 mt-3 text-left">
                        {error}
                    </p>
                )}

                <div className="pt-8 mt-auto flex items-center gap-3">
                    {step > 1 && (
                        <button
                            type="button"
                            onClick={handleBack}
                            disabled={isSubmitting}
                            className="h-12 px-4 rounded-2xl border-2 border-zinc-100 bg-zinc-50 text-zinc-500 hover:bg-white hover:border-zinc-300 transition-all font-bold text-xs uppercase tracking-widest disabled:opacity-40 flex items-center justify-center"
                        >
                            <ArrowLeft size={16} className="mr-1" />
                            Back
                        </button>
                    )}
                    <AuthButton
                        onClick={handleNext}
                        disabled={(!isStepValid() && step < 6) || isSubmitting || isChecking}
                        className="flex-1"
                    >
                        {step === 6
                            ? isSubmitting
                                ? "Calibrating..."
                                : "Begin First Run"
                            : isChecking
                                ? "Verifying..."
                                : step === 1 && authMethod === null
                                    ? "Continue with Email"
                                    : "Continue"}
                    </AuthButton>
                </div>
            </div>

            <div className="mt-8 text-center">
                <p className="text-zinc-400 text-xs font-medium">
                    Already calibrated?
                    <Link
                        href="/login"
                        className="text-zinc-900 hover:text-lime-600 transition-colors ml-1 font-black underline decoration-2 decoration-lime-300 underline-offset-2"
                    >
                        Resume Session
                    </Link>
                </p>
            </div>
        </AuthCard>
    );
}
