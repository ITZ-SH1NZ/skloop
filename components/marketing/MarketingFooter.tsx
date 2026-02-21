import React from "react";
import Link from "next/link";
import { Github, Twitter, Mail, ArrowUpRight } from "lucide-react";

export default function MarketingFooter() {
    return (
        <footer className="relative bg-zinc-900 text-white z-10 pt-20 pb-10 px-6 border-t-8 border-black">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">

                    {/* Brand Column */}
                    <div className="md:col-span-5 flex flex-col gap-6">
                        <Link href="/onboarding" className="flex items-center gap-3 w-max group">
                            <div className="w-12 h-12 rounded-xl bg-lime-400 border-4 border-black flex items-center justify-center text-black font-black rotate-[-6deg] group-hover:rotate-0 transition-transform shadow-[4px_4px_0_0_#A3E635]">
                                S
                            </div>
                            <span className="font-black text-4xl tracking-tighter">SKLOOP</span>
                        </Link>
                        <p className="text-zinc-400 font-semibold max-w-sm text-balance">
                            The ultimate gamified platform for mastering Web Development and DSA. Level up your skills, conquer quests, and build with peers.
                        </p>

                        {/* Social Links */}
                        <div className="flex items-center gap-4 mt-2">
                            <SocialButton icon={<Twitter className="w-5 h-5" />} href="#" />
                            <SocialButton icon={<Github className="w-5 h-5" />} href="#" />
                            <SocialButton icon={<Mail className="w-5 h-5" />} href="#" />
                        </div>
                    </div>

                    {/* Navigation Columns */}
                    <div className="md:col-span-3 flex flex-col gap-4">
                        <h4 className="text-lime-400 font-black uppercase tracking-widest text-sm mb-2">The Game</h4>
                        <FooterLink href="/login">Dashboard</FooterLink>
                        <FooterLink href="/login">Tracks (Web & DSA)</FooterLink>
                        <FooterLink href="/login">Daily Arcade</FooterLink>
                        <FooterLink href="/login">Leaderboards</FooterLink>
                    </div>

                    <div className="md:col-span-2 flex flex-col gap-4">
                        <h4 className="text-lime-400 font-black uppercase tracking-widest text-sm mb-2">Resources</h4>
                        <FooterLink href="/docs">Strategy Guide (Docs)</FooterLink>
                        <FooterLink href="/login">Find Mentors</FooterLink>
                        <FooterLink href="/login">Study Circles</FooterLink>
                    </div>

                    <div className="md:col-span-2 flex flex-col gap-4">
                        <h4 className="text-lime-400 font-black uppercase tracking-widest text-sm mb-2">Legal</h4>
                        <FooterLink href="#">Terms of Service</FooterLink>
                        <FooterLink href="#">Privacy Policy</FooterLink>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t-2 border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-zinc-500 font-semibold text-sm">
                        © {new Date().getFullYear()} Skloop Inc. All rights reserved.
                    </p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                        <span className="text-zinc-400 font-bold tracking-wider text-xs uppercase">Systems Online</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function FooterLink({ href, children }: { href: string, children: React.ReactNode }) {
    return (
        <Link href={href} className="text-zinc-300 hover:text-white hover:translate-x-1 transition-transform flex items-center gap-1 font-semibold group w-max">
            {children}
            <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-lime-400" />
        </Link>
    );
}

function SocialButton({ icon, href }: { icon: React.ReactNode, href: string }) {
    return (
        <a
            href={href}
            className="w-12 h-12 rounded-xl bg-zinc-800 border-2 border-zinc-700 hover:border-lime-400 hover:bg-zinc-700 flex items-center justify-center text-white transition-colors group"
        >
            <div className="group-hover:scale-110 group-hover:text-lime-400 transition-transform">
                {icon}
            </div>
        </a>
    );
}
