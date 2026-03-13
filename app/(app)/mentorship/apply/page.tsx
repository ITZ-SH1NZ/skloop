"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, CheckCircle, Shield, Award, Zap, Star, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { getMyMentorStatus, applyVeteranPath, redeemVouchCode } from "@/actions/mentorship-actions";
import useSWR from "swr";
import { fetchMentorStatus } from "@/lib/swr-fetchers";

export default function BecomeMentorPage() {
    const router = useRouter();

    const { data: status, isLoading, error: fetchError } = useSWR(
        ['mentorStatus'],
        fetchMentorStatus as any,
        {
            revalidateOnFocus: false
        }
    );

    const [vouchCode, setVouchCode] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);



    const handleVeteranApply = async () => {
        setIsSubmitting(true);
        setError(null);
        try {
            const res = await applyVeteranPath();
            if (res.success) {
                router.push("/mentorship/dashboard");
            } else {
                setError(res.error || "Failed to apply");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred");
        }
        setIsSubmitting(false);
    };

    const handleVouchRedeem = async () => {
        if (!vouchCode.trim()) return;
        setIsSubmitting(true);
        setError(null);
        try {
            const res = await redeemVouchCode(vouchCode);
            if (res.success) {
                router.push("/mentorship/dashboard");
            } else {
                setError(res.error || "Invalid vouch code");
            }
        } catch (err: any) {
            setError(err.message || "An error occurred");
        }
        setIsSubmitting(false);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-900" />
            </div>
        );
    }

    if (status?.isMentor) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-[#D4F268] flex items-center justify-center mb-6 shadow-lg shadow-[#D4F268]/20">
                    <CheckCircle size={40} className="text-black" />
                </div>
                <h1 className="text-3xl font-black text-zinc-900 mb-2">You're already a Mentor!</h1>
                <p className="text-zinc-500 font-medium mb-8 max-w-sm">
                    Your account is certified. You can now manage your sessions and generate vouch codes from your dashboard.
                </p>
                <Button onClick={() => router.push("/mentorship/dashboard")} className="h-14 px-10 rounded-2xl bg-zinc-900 text-white font-bold text-lg hover:scale-105 transition-transform">
                    Go to Dashboard
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-[#FAFAFA] min-h-full pb-20">
            {/* Hero Section */}
            <div className="bg-zinc-900 relative overflow-hidden text-white pt-16 pb-24 md:pt-24 md:pb-32 px-6">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4F268]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />

                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md mb-8">
                            <Sparkles className="w-4 h-4 text-[#D4F268] fill-[#D4F268]" />
                            <span className="text-xs font-black text-[#D4F268] tracking-widest uppercase">Skloop Elite</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight">
                            Share your craft.<br />
                            <span className="text-[#D4F268]">Inspire the next gen.</span>
                        </h1>

                        <p className="text-xl text-zinc-400 font-medium max-w-2xl mx-auto leading-relaxed">
                            Become a certified mentor. Help others grow, build your reputation, and unlock exclusive rewards.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Path Selection */}
            <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Path A: Veteran */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                        className="bg-white p-10 rounded-[3rem] border-2 border-zinc-100 shadow-xl shadow-zinc-900/5 relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12">
                            <Shield size={180} />
                        </div>

                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-500 text-[10px] font-black uppercase tracking-wider mb-6 w-fit">
                            Path A
                        </div>

                        <h3 className="text-3xl font-black text-zinc-900 mb-3">The Veteran</h3>
                        <p className="text-zinc-500 font-medium mb-10">Proof of contribution through community activity.</p>

                        <div className="space-y-6 mb-10 flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-zinc-900">Reach Level 10</span>
                                <span className="text-sm font-black text-zinc-900">{status?.level ?? 1} / 10</span>
                            </div>
                            <div className="h-3 bg-zinc-100 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.max(0, Math.min((((status?.level ?? 1) - 1) / 9) * 100, 100))}%` }}
                                    className="h-full bg-[#D4F268] shadow-[0_0_10px_rgba(212,242,104,0.5)]" />
                            </div>

                            <ul className="space-y-4 pt-4">
                                <li className="flex items-center gap-3 text-zinc-700 font-bold text-sm">
                                    <CheckCircle size={18} className={(status?.level ?? 1) >= 10 ? "text-[#D4F268]" : "text-zinc-200"} />
                                    <span className={(status?.level ?? 1) >= 10 ? "text-zinc-900" : "text-zinc-400"}>Level 10 Achievement</span>
                                </li>
                                <li className="flex items-center gap-3 text-zinc-700 font-bold text-sm">
                                    <CheckCircle size={18} className="text-[#D4F268]" />
                                    <span>Verified Profile</span>
                                </li>
                            </ul>
                        </div>

                        <Button onClick={handleVeteranApply} disabled={(status?.level ?? 1) < 10 || isSubmitting}
                            className={`h-16 rounded-[1.5rem] font-black text-lg transition-all shadow-lg ${(status?.level ?? 1) >= 10
                                ? "bg-zinc-900 text-white hover:bg-black hover:scale-[1.02]"
                                : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                                }`}>
                            {isSubmitting ? <Loader2 className="animate-spin" /> : (status?.level ?? 1) >= 10 ? "Apply Now" : "Level Locked"}
                        </Button>
                    </motion.div>

                    {/* Path B: Vouch */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                        className="bg-[#D4F268] p-10 rounded-[3rem] border-2 border-[#D4F268] shadow-xl shadow-[#D4F268]/20 relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.08] -rotate-12 text-black">
                            <Award size={180} />
                        </div>

                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-black/10 text-black/60 text-[10px] font-black uppercase tracking-wider mb-6 w-fit">
                            Path B
                        </div>

                        <h3 className="text-3xl font-black text-zinc-900 mb-3">The Chosen</h3>
                        <p className="text-zinc-800 font-medium mb-10">Fast-track with a referral from a verified mentor.</p>

                        <div className="space-y-6 mb-10 flex-1">
                            <div className="group relative">
                                <input type="text" value={vouchCode} onChange={e => setVouchCode(e.target.value.toUpperCase())}
                                    placeholder="ENTER VOUCH CODE"
                                    className="w-full h-16 bg-white/50 border-2 border-black/10 rounded-[1.5rem] px-6 text-xl font-black placeholder:text-black/30 outline-none focus:border-black transition-all" />
                            </div>

                            <ul className="space-y-4">
                                <li className="flex items-center gap-3 text-zinc-900 font-bold text-sm">
                                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                                        <CheckCircle size={12} className="text-[#D4F268]" />
                                    </div>
                                    <span>Instant Access</span>
                                </li>
                                <li className="flex items-center gap-3 text-zinc-900 font-bold text-sm">
                                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                                        <CheckCircle size={12} className="text-[#D4F268]" />
                                    </div>
                                    <span>No Level Restriction</span>
                                </li>
                            </ul>
                        </div>

                        <Button onClick={handleVouchRedeem} disabled={!vouchCode.trim() || isSubmitting}
                            className="h-16 rounded-[1.5rem] bg-black text-[#D4F268] font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-black/10">
                            {isSubmitting ? <Loader2 className="animate-spin" /> : "Redeem Code"}
                        </Button>
                    </motion.div>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            className="mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-center font-bold text-sm">
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Benefits Stats */}
            <div className="max-w-4xl mx-auto px-6 mt-20 text-center">
                <h2 className="text-2xl font-black text-zinc-900 mb-12">The Perks of Mentoring</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { icon: Award, label: "Profile Badge", desc: "Show off your verified status." },
                        { icon: Zap, label: "Reputation", desc: "Earn credibility across Skloop." },
                        { icon: Star, label: "Impact", desc: "Shape the next generation." }
                    ].map((item, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div className="w-16 h-16 rounded-[1.5rem] bg-white border border-zinc-100 flex items-center justify-center mb-4 shadow-sm">
                                <item.icon size={28} className="text-zinc-900" />
                            </div>
                            <h4 className="font-bold text-zinc-900 mb-1">{item.label}</h4>
                            <p className="text-zinc-500 text-xs font-medium leading-relaxed">{item.desc}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
