"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Gavel, Scale, FileText, AlertCircle } from "lucide-react";
import MarketingNavbar from "@/components/marketing/MarketingNavbar";
import MarketingFooter from "@/components/marketing/MarketingFooter";

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-[#FCF9F1] selection:bg-lime-400 selection:text-black font-sans relative overflow-x-hidden">
            <MarketingNavbar />

            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[10%] left-[5%] w-96 h-96 bg-lime-200/20 rounded-full blur-3xl" />
                <div className="absolute bottom-[20%] right-[5%] w-72 h-72 bg-lime-300/10 rounded-full blur-3xl" />
            </div>

            <main className="relative z-10 pt-32 pb-24 px-6 max-w-4xl mx-auto">
                <Link 
                    href="/" 
                    className="inline-flex items-center gap-2 text-zinc-500 hover:text-black transition-colors mb-12 group"
                >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold uppercase tracking-wider text-xs">Return to Start</span>
                </Link>

                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", damping: 25, stiffness: 100 }}
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-lime-300 flex items-center justify-center border-2 border-black shadow-[4px_4px_0_0_#000]">
                            <Gavel className="w-6 h-6 text-black" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight uppercase">
                            Terms of Service
                        </h1>
                    </div>
                    
                    <p className="text-zinc-500 font-medium mb-12">
                        Last Updated: March 17, 2026
                    </p>

                    <div className="space-y-12">
                        {/* Section 1 */}
                        <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0_0_#000] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                <FileText className="w-24 h-24" />
                            </div>
                            <h2 className="text-2xl font-black text-black mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-lime-300 border-2 border-black flex items-center justify-center text-sm">1</span>
                                Acceptance of Terms
                            </h2>
                            <div className="prose prose-zinc max-w-none text-zinc-700 font-medium leading-relaxed">
                                <p>
                                    By using Skloop, you agree to follow these Terms of Service. Skloop is a "Habit Engineering Platform" designed to gamify technical mastery. If you do not agree to these terms, you may not use our platform.
                                </p>
                                <p className="mt-4">
                                    We reserve the right to update these terms at any time. Your continued use of the platform after changes are posted constitutes your acceptance of the new terms.
                                </p>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0_0_#000]">
                            <h2 className="text-2xl font-black text-black mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-lime-300 border-2 border-black flex items-center justify-center text-sm">2</span>
                                Use of Service
                            </h2>
                            <div className="space-y-6 text-zinc-700 font-medium">
                                <div className="p-6 rounded-2xl bg-zinc-50 border-2 border-zinc-200">
                                    <h3 className="font-black text-lg mb-3 flex items-center gap-2">
                                        <Scale className="w-5 h-5 text-lime-500" />
                                        User Conduct
                                    </h3>
                                    <p className="text-sm">
                                        You represent that you are at least 13 years old. You agree not to use the service for any illegal purpose or to violate any laws in your jurisdiction. Cheating, exploiting bugs, or using unauthorized bots to gain XP or coins is strictly prohibited.
                                    </p>
                                </div>
                                <div className="p-6 rounded-2xl bg-zinc-50 border-2 border-zinc-200">
                                    <h3 className="font-black text-lg mb-3 flex items-center gap-2">
                                        <AlertCircle className="w-5 h-5 text-lime-500" />
                                        Account Security
                                    </h3>
                                    <p className="text-sm">
                                        You are responsible for maintaining the confidentiality of your account credentials. Skloop is not liable for any loss resulting from unauthorized access to your account.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Section 3 (Gamification Specific) */}
                        <section className="bg-lime-300 p-8 md:p-10 rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0_0_#000]">
                            <h2 className="text-2xl font-black text-black mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-white border-2 border-black flex items-center justify-center text-sm">3</span>
                                Virtual Items & Economy
                            </h2>
                            <div className="prose prose-zinc max-w-none text-black font-bold leading-relaxed">
                                <p>
                                    Skloop features virtual rewards, including but not limited to Experience Points (XP), Coins, Streak Shields, and Badges.
                                </p>
                                <ul className="mt-4 list-disc pl-5">
                                    <li>These virtual items have no real-world monetary value.</li>
                                    <li>They cannot be redeemed for cash or transferred outside the platform.</li>
                                    <li>We reserve the right to modify or remove virtual items at our discretion to maintain game balance.</li>
                                </ul>
                            </div>
                        </section>

                        {/* Section 4 */}
                        <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0_0_#A3E635]">
                            <h2 className="text-2xl font-black text-black mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-lime-300 border-2 border-black flex items-center justify-center text-sm">4</span>
                                Intellectual Property
                            </h2>
                            <div className="prose prose-zinc max-w-none text-zinc-700 font-medium leading-relaxed">
                                <p>
                                    All content provided on Skloop, including the curriculum, logos (Loopy Mascot), UI designs, and animations, is the property of skloop.online. 
                                </p>
                                <p className="mt-4">
                                    Any code you write within our Monaco Editor based challenges remains your property, but by submitting it for evaluation, you grant us a non-exclusive license to use it for platform improvement and verification purposes.
                                </p>
                            </div>
                        </section>

                        {/* Section 5 */}
                        <section className="bg-zinc-900 text-white p-8 md:p-10 rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0_0_#e5e5e5]">
                            <h2 className="text-2xl font-black text-lime-400 mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-sm">5</span>
                                Limitation of Liability
                            </h2>
                            <p className="font-medium text-zinc-300 leading-relaxed">
                                Skloop is provided "as is" and "as available." To the maximum extent permitted by law, skloop.online shall not be liable for any indirect, incidental, or consequential damages resulting from your use or inability to use the service. We do not guarantee that the service will be uninterrupted or error-free.
                            </p>
                        </section>

                        {/* Section 6 */}
                        <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0_0_#000]">
                            <h2 className="text-2xl font-black text-black mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-lime-300 border-2 border-black flex items-center justify-center text-sm">6</span>
                                Contact
                            </h2>
                            <p className="text-zinc-700 font-medium mb-6">
                                For any legal inquiries or dispute resolution, please contact us at:
                            </p>
                            <a 
                                href="mailto:tejaskm2508@gmail.com" 
                                className="inline-block px-8 py-4 rounded-2xl bg-lime-300 border-2 border-black font-black text-black shadow-[4px_4px_0_0_#000] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_#000] active:translate-y-0 transition-all"
                            >
                                tejaskm2508@gmail.com
                            </a>
                        </section>
                    </div>

                    <div className="mt-20 pt-10 border-t-2 border-zinc-200 text-center">
                        <p className="text-zinc-400 font-bold text-sm uppercase tracking-widest">
                            © 2026 skloop.online. All rights reserved.
                        </p>
                    </div>
                </motion.div>
            </main>

            <MarketingFooter />
        </div>
    );
}
