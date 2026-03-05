"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { X, ExternalLink, ShieldCheck, Video, Zap, Users, Currency as CurrencyIcon } from "lucide-react";
import { CurrencyCoin } from "@/components/ui/CurrencyCoin";

interface MentorHandbookModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MentorHandbookModal({ isOpen, onClose }: MentorHandbookModalProps) {
    // Handle body scroll locking
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Layer 1: Backdrop */}
            <div
                className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm"
                aria-hidden="true"
                onClick={onClose}
            />

            {/* Layer 2: Scroll layer (data-lenis-prevent fixes scroll hijacking) */}
            <div
                className="fixed inset-0 z-[101] overflow-y-auto"
                data-lenis-prevent
                onClick={onClose}
            >
                {/* Layer 3: Centering wrapper */}
                <div
                    className="flex min-h-full items-center justify-center p-4 py-12 md:p-8"
                    onClick={(e) => e.stopPropagation()}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl relative overflow-hidden"
                    >
                        {/* Header Background */}
                        <div className="h-48 bg-zinc-900 relative overflow-hidden">
                            <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-[#D4F268]/20 rounded-full blur-[80px] -translate-y-1/2" />
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay" />

                            <div className="absolute inset-x-0 bottom-0 p-8 pt-0 flex justify-between items-end">
                                <div className="text-white relative z-10">
                                    <div className="flex items-center gap-2 mb-2 text-[#D4F268] font-bold text-sm tracking-widest uppercase">
                                        <ShieldCheck size={18} /> Official Guidelines
                                    </div>
                                    <h2 className="text-4xl font-black tracking-tight">Mentor Handbook</h2>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-md border border-white/10"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="p-8 md:p-12 space-y-12">

                            {/* Section 1: Core Principles */}
                            <section>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
                                        <Zap size={24} />
                                    </div>
                                    <h3 className="text-2xl font-black text-zinc-900">Core Principles</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100">
                                        <h4 className="font-bold text-lg mb-2 text-zinc-900">1. Actionable Advice</h4>
                                        <p className="text-zinc-600 font-medium text-sm leading-relaxed">
                                            Mentees come to SKLOOP for practical growth. Skip the fluff and give them tangible, actionable steps they can execute immediately after the session.
                                        </p>
                                    </div>
                                    <div className="bg-zinc-50 p-6 rounded-[2rem] border border-zinc-100">
                                        <h4 className="font-bold text-lg mb-2 text-zinc-900">2. Radical Candor</h4>
                                        <p className="text-zinc-600 font-medium text-sm leading-relaxed">
                                            Be kind, but be direct. If a mentee's portfolio needs serious work, tell them gracefully. Growth happens outside the comfort zone.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            {/* Section 2: Session Rules */}
                            <section>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-[#D4F268] flex items-center justify-center text-black">
                                        <Users size={24} />
                                    </div>
                                    <h3 className="text-2xl font-black text-zinc-900">Session Guidelines</h3>
                                </div>
                                <ul className="space-y-4 text-zinc-700 font-medium">
                                    <li className="flex gap-4 p-4 rounded-2xl hover:bg-zinc-50 transition-colors">
                                        <div className="bg-zinc-200 text-zinc-600 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">1</div>
                                        <div>
                                            <strong className="block text-zinc-900 mb-1">Respond within 48 hours</strong>
                                            Whether accepting or declining, respect the mentee's time by responding to requests promptly.
                                        </div>
                                    </li>
                                    <li className="flex gap-4 p-4 rounded-2xl hover:bg-zinc-50 transition-colors">
                                        <div className="bg-zinc-200 text-zinc-600 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">2</div>
                                        <div>
                                            <strong className="block text-zinc-900 mb-1">Be Punctual</strong>
                                            Join the session 2 minutes early. If you need to cancel, give at least 12 hours notice.
                                        </div>
                                    </li>
                                    <li className="flex gap-4 p-4 rounded-2xl hover:bg-zinc-50 transition-colors">
                                        <div className="bg-zinc-200 text-zinc-600 w-8 h-8 rounded-full flex items-center justify-center font-bold shrink-0">3</div>
                                        <div>
                                            <strong className="block text-zinc-900 mb-1">Keep it Professional</strong>
                                            Sessions must be strictly professional and related to career, engineering, or design growth.
                                        </div>
                                    </li>
                                </ul>
                            </section>

                            {/* Section 3: Video Content */}
                            <section>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
                                        <Video size={24} />
                                    </div>
                                    <h3 className="text-2xl font-black text-zinc-900">Publishing Content</h3>
                                </div>
                                <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white p-8 rounded-[2rem] relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
                                    <p className="font-medium text-zinc-300 leading-relaxed mb-6">
                                        As a mentor, you can publish YouTube videos directly to your SKLOOP profile. These act as asynchronous mentorship and help mentees discover your teaching style.
                                    </p>
                                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-bold">
                                        <li className="flex items-center gap-2"><CheckCircle size={16} className="text-[#D4F268]" /> System Design breakdowns</li>
                                        <li className="flex items-center gap-2"><CheckCircle size={16} className="text-[#D4F268]" /> Mock interview recordings</li>
                                        <li className="flex items-center gap-2"><CheckCircle size={16} className="text-[#D4F268]" /> Career transition stories</li>
                                        <li className="flex items-center gap-2"><CheckCircle size={16} className="text-[#D4F268]" /> Tech-stack deep dives</li>
                                    </ul>
                                </div>
                            </section>

                            {/* Section 4: Monetization */}
                            <section>
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600">
                                        <CurrencyCoin size="md" />
                                    </div>
                                    <h3 className="text-2xl font-black text-zinc-900">Earnings & Rates</h3>
                                </div>
                                <div className="bg-emerald-50 text-emerald-900 p-6 md:p-8 rounded-[2rem] border border-emerald-100 leading-relaxed font-medium text-sm space-y-4">
                                    <p>
                                        SKLOOP operates entirely on its native economy: <strong>SKLOOP Coins</strong>. You can set an hourly rate for your sessions in the <strong>Settings</strong> modal.
                                    </p>
                                    <p>
                                        Mentees pay you directly from their coin balance upon session completion. You can use these coins to buy items from the black market, unlock features, or redeem them for real-world rewards during seasonal drops.
                                    </p>
                                    <div className="p-4 bg-white rounded-2xl mt-4 flex items-center justify-between shadow-sm">
                                        <span className="font-bold">Recommended starting rate:</span>
                                        <span className="font-black text-xl flex items-center gap-1 text-emerald-600">500 <CurrencyCoin /></span>
                                    </div>
                                </div>
                            </section>

                        </div>

                        {/* Footer */}
                        <div className="p-6 md:p-8 border-t border-zinc-100 bg-zinc-50 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-8 py-4 rounded-xl font-black bg-zinc-900 text-white hover:bg-black transition-transform hover:scale-105"
                            >
                                I understand, let's go
                            </button>
                        </div>
                    </motion.div>
                </div>
            </div>
        </>
    );
}

// Inline CheckCircle since lucide-react might not be fully imported above
function CheckCircle(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    );
}
