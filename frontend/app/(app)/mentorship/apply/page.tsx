"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle, Shield, Award, Zap, Users, Star } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export default function BecomeMentorPage() {
    const router = useRouter();

    return (
        <div className="min-h-full bg-[#FAFAFA] pb-20 overflow-y-auto no-scrollbar">
            {/* Hero Section */}
            <div className="bg-zinc-900 relative overflow-hidden text-white pt-12 pb-24 md:pt-20 md:pb-32 px-6">
                {/* Background Effects */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#D4F268]/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />

                <div className="max-w-4xl mx-auto relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md mb-6">
                            <Star className="w-4 h-4 text-[#D4F268] fill-[#D4F268]" />
                            <span className="text-sm font-bold text-[#D4F268] tracking-wide uppercase">Join the Elite</span>
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight">
                            Share your craft.<br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4F268] to-emerald-400">
                                Inspire the next gen.
                            </span>
                        </h1>

                        <p className="text-xl text-zinc-400 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
                            Become a certified mentor on Skloop. Earn reputation, unlock exclusive perks, and help peers verify their skills.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <Button
                                onClick={() => router.push("#pathways")}
                                className="h-14 px-8 rounded-full bg-[#D4F268] hover:bg-[#c3e059] text-black text-lg font-black tracking-wide hover:scale-105 active:scale-95 transition-all shadow-[0_0_20px_rgba(212,242,104,0.3)]"
                            >
                                Start Application
                            </Button>
                            <Button
                                onClick={() => router.push("/mentorship/find")}
                                variant="ghost"
                                className="h-14 px-8 rounded-full text-white hover:bg-white/10 text-lg font-bold"
                            >
                                Browse Directory
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Benefits Stats */}
            <div className="max-w-5xl mx-auto px-6 -mt-16 relative z-20 mb-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { icon: Award, label: "Earn Badges", desc: "Unlock exclusive mentor-only profile badges." },
                        { icon: Users, label: "Build Network", desc: "Connect with ambitious peers and future leaders." },
                        { icon: Zap, label: "Get Vouched", desc: "Validate skills for others and earn trust points." }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + (i * 0.1) }}
                            className="bg-white p-8 rounded-[2rem] border border-zinc-100 shadow-xl shadow-zinc-900/5 flex flex-col items-center text-center group hover:-translate-y-2 transition-transform duration-300"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-zinc-50 flex items-center justify-center mb-6 text-zinc-900 group-hover:bg-[#D4F268] group-hover:scale-110 transition-all duration-300">
                                <item.icon size={32} strokeWidth={1.5} />
                            </div>
                            <h3 className="text-xl font-black text-zinc-900 mb-2">{item.label}</h3>
                            <p className="text-zinc-500 font-medium leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Pathways Section */}
            <div id="pathways" className="max-w-4xl mx-auto px-6 mb-24">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-black text-zinc-900 mb-4">Two Ways to Qualify</h2>
                    <p className="text-zinc-500 text-lg font-medium">Choose your path to certification. Both require passing the Mentor Test.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Path A: Veteran */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-white p-8 rounded-[2.5rem] border-2 border-zinc-100 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Shield size={120} />
                        </div>

                        <div className="inline-block px-4 py-1.5 rounded-full bg-zinc-900 text-white text-xs font-bold uppercase tracking-wider mb-6">
                            Path A
                        </div>

                        <h3 className="text-2xl font-black text-zinc-900 mb-2">The Veteran</h3>
                        <p className="text-zinc-500 font-medium mb-8">For experienced community members.</p>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-zinc-700 font-bold">
                                <CheckCircle className="text-[#D4F268] fill-black" size={20} />
                                <span>Level 15+ on Skloop</span>
                            </li>
                            <li className="flex items-center gap-3 text-zinc-700 font-bold">
                                <CheckCircle className="text-[#D4F268] fill-black" size={20} />
                                <span>Complete Profile</span>
                            </li>
                            <li className="flex items-center gap-3 text-zinc-700 font-bold">
                                <CheckCircle className="text-[#D4F268] fill-black" size={20} />
                                <span>No recent bans</span>
                            </li>
                        </ul>

                        <Button onClick={() => router.push("/mentorship/test?path=veteran")} className="w-full h-14 rounded-2xl bg-zinc-900 text-white hover:bg-zinc-800 font-bold text-lg">
                            Verify & Start
                        </Button>
                    </motion.div>

                    {/* Path B: Vouch */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="bg-[#D4F268] p-8 rounded-[2.5rem] border-2 border-[#D4F268] relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Award size={120} />
                        </div>

                        <div className="inline-block px-4 py-1.5 rounded-full bg-black/10 text-black text-xs font-bold uppercase tracking-wider mb-6">
                            Path B
                        </div>

                        <h3 className="text-2xl font-black text-zinc-900 mb-2">The Prodigy</h3>
                        <p className="text-zinc-800 font-medium mb-8">Fast-track with a referral.</p>

                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-zinc-900 font-bold">
                                <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                                    <CheckCircle size={12} className="text-[#D4F268]" />
                                </div>
                                <span>Valid Vouch Code</span>
                            </li>
                            <li className="flex items-center gap-3 text-zinc-900 font-bold">
                                <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                                    <CheckCircle size={12} className="text-[#D4F268]" />
                                </div>
                                <span>Interview (Optional)</span>
                            </li>
                            <li className="flex items-center gap-3 text-zinc-900 font-bold">
                                <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                                    <CheckCircle size={12} className="text-[#D4F268]" />
                                </div>
                                <span>Any Level</span>
                            </li>
                        </ul>

                        <Button onClick={() => router.push("/mentorship/test?path=vouch")} className="w-full h-14 rounded-2xl bg-black text-[#D4F268] hover:bg-zinc-800 font-bold text-lg border-2 border-black">
                            Enter Code
                        </Button>
                    </motion.div>
                </div>
            </div>

            {/* Footer Note */}
            <div className="text-center px-6">
                <p className="text-zinc-400 font-medium text-sm">
                    Already a mentor? <button onClick={() => router.push("/mentorship/dashboard")} className="text-zinc-900 hover:underline font-bold">Go to Dashboard</button>
                </p>
            </div>
        </div>
    );
}
