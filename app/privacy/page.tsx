"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, CheckCircle2 } from "lucide-react";
import MarketingNavbar from "@/components/marketing/MarketingNavbar";
import MarketingFooter from "@/components/marketing/MarketingFooter";

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-[#FCF9F1] selection:bg-lime-400 selection:text-black font-sans relative overflow-x-hidden">
            <MarketingNavbar />

            {/* Background Decorations */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[10%] right-[5%] w-96 h-96 bg-lime-200/20 rounded-full blur-3xl" />
                <div className="absolute bottom-[20%] left-[5%] w-72 h-72 bg-lime-300/10 rounded-full blur-3xl" />
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
                            <Shield className="w-6 h-6 text-black" />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-black tracking-tight uppercase">
                            Privacy Policy
                        </h1>
                    </div>
                    
                    <p className="text-zinc-500 font-medium mb-12">
                        Last Updated: March 17, 2026
                    </p>

                    <div className="space-y-12">
                        {/* Section 1 */}
                        <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0_0_#000] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
                                <Eye className="w-24 h-24" />
                            </div>
                            <h2 className="text-2xl font-black text-black mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-lime-300 border-2 border-black flex items-center justify-center text-sm">1</span>
                                Introduction
                            </h2>
                            <div className="prose prose-zinc max-w-none text-zinc-700 font-medium leading-relaxed">
                                <p>
                                    Welcome to Skloop ("we," "our," or "us"). We are committed to protecting your privacy and ensuring that your personal information is handled in a safe and responsible manner. This Privacy Policy outlines how we collect, use, and safeguard your information when you use our platform, skloop.online.
                                </p>
                                <p className="mt-4">
                                    By accessing or using Skloop, you agree to the terms of this Privacy Policy. If you do not agree with these terms, please do not use our services.
                                </p>
                            </div>
                        </section>

                        {/* Section 2 */}
                        <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0_0_#000]">
                            <h2 className="text-2xl font-black text-black mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-lime-300 border-2 border-black flex items-center justify-center text-sm">2</span>
                                Information We Collect
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 rounded-2xl bg-zinc-50 border-2 border-zinc-200">
                                    <h3 className="font-black text-lg mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-lime-500" />
                                        Personal Data
                                    </h3>
                                    <p className="text-zinc-600 font-medium text-sm">
                                        Email address, username, profile picture, and any information provided during account creation via Supabase Auth.
                                    </p>
                                </div>
                                <div className="p-6 rounded-2xl bg-zinc-50 border-2 border-zinc-200">
                                    <h3 className="font-black text-lg mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-lime-500" />
                                        Activity Data
                                    </h3>
                                    <p className="text-zinc-600 font-medium text-sm">
                                        Quest progress, XP earned, leaderboard rankings, and interactions within the Monaco Editor and daily arcade.
                                    </p>
                                </div>
                                <div className="p-6 rounded-2xl bg-zinc-50 border-2 border-zinc-200">
                                    <h3 className="font-black text-lg mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-lime-500" />
                                        Communication
                                    </h3>
                                    <p className="text-zinc-600 font-medium text-sm">
                                        Messages sent via our real-time chat features and notifications delivered through the platform.
                                    </p>
                                </div>
                                <div className="p-6 rounded-2xl bg-zinc-50 border-2 border-zinc-200">
                                    <h3 className="font-black text-lg mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="w-5 h-5 text-lime-500" />
                                        Technical Data
                                    </h3>
                                    <p className="text-zinc-600 font-medium text-sm">
                                        IP address, browser type, device information, and usage logs to help optimize performance and security.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Section 3 */}
                        <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0_0_#A3E635]">
                            <h2 className="text-2xl font-black text-black mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-lime-300 border-2 border-black flex items-center justify-center text-sm">3</span>
                                How We Use Information
                            </h2>
                            <ul className="space-y-4 text-zinc-700 font-medium">
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-lime-100 flex-shrink-0 flex items-center justify-center mt-0.5">
                                        <div className="w-2 h-2 rounded-full bg-lime-500" />
                                    </div>
                                    <p>To provide and maintain the Skloop experience, including personalized tracks and gamified progress tracking.</p>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-lime-100 flex-shrink-0 flex items-center justify-center mt-0.5">
                                        <div className="w-2 h-2 rounded-full bg-lime-500" />
                                    </div>
                                    <p>To facilitate social features like leaderboards, mentee-mentor connections, and study circles.</p>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-lime-100 flex-shrink-0 flex items-center justify-center mt-0.5">
                                        <div className="w-2 h-2 rounded-full bg-lime-500" />
                                    </div>
                                    <p>To analyze usage patterns and improve our curriculum, AI engines (Groq), and UI/UX animations.</p>
                                </li>
                                <li className="flex gap-4">
                                    <div className="w-6 h-6 rounded-full bg-lime-100 flex-shrink-0 flex items-center justify-center mt-0.5">
                                        <div className="w-2 h-2 rounded-full bg-lime-500" />
                                    </div>
                                    <p>To communicate important updates, security alerts, and support messages.</p>
                                </li>
                            </ul>
                        </section>

                        {/* Section 4 */}
                        <section className="bg-zinc-900 text-white p-8 md:p-10 rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0_0_#e5e5e5]">
                            <h2 className="text-2xl font-black text-lime-400 mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-sm">4</span>
                                Data Security
                            </h2>
                            <div className="flex flex-col md:flex-row gap-8 items-start">
                                <div className="space-y-4 font-medium text-zinc-300">
                                    <p>
                                        We leverage Supabase's secure infrastructure to store and manage your data. All sensitive information is encrypted at rest and in transit.
                                    </p>
                                    <p>
                                        While we strive to use commercially acceptable means to protect your personal information, remember that no method of transmission over the Internet is 100% secure.
                                    </p>
                                </div>
                                <div className="w-full md:w-64 flex-shrink-0 p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
                                    <Lock className="w-12 h-12 text-lime-400 mx-auto mb-4" />
                                    <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Vault Security</p>
                                    <p className="text-lg font-bold">Encrypted</p>
                                </div>
                            </div>
                        </section>

                        {/* Section 5 */}
                        <section className="bg-white p-8 md:p-10 rounded-[2.5rem] border-4 border-black shadow-[8px_8px_0_0_#000]">
                            <h2 className="text-2xl font-black text-black mb-6 flex items-center gap-3">
                                <span className="w-8 h-8 rounded-full bg-lime-300 border-2 border-black flex items-center justify-center text-sm">5</span>
                                Contact Us
                            </h2>
                            <p className="text-zinc-700 font-medium mb-6">
                                If you have any questions about this Privacy Policy, please contact our legal team:
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
