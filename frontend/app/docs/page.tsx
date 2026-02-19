"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Book, Sparkles, Zap, Globe, Shield, Users, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/Badge";

export default function DocsPage() {
    return (
        <div className="min-h-screen bg-[#FDFCF8] text-foreground font-sans selection:bg-primary selection:text-black">
            {/* Header */}
            <header className="sticky top-0 z-50 w-full border-b border-black/5 bg-white/80 backdrop-blur-xl">
                <div className="container flex h-16 items-center justify-between px-4 max-w-screen-2xl mx-auto">
                    <div className="flex gap-6 md:gap-10">
                        <Link href="/onboarding" className="flex items-center space-x-2">
                            <div className="h-4 w-4 rounded-full bg-primary" />
                            <span className="inline-block font-bold">Skloop Manifesto</span>
                        </Link>
                    </div>
                    <div className="flex flex-1 items-center justify-end space-x-4">
                        <nav className="flex items-center space-x-2">
                            <Link href="/onboarding">
                                <Button variant="ghost" size="sm" className="h-8 px-4 text-xs font-medium">
                                    <ArrowLeft className="mr-2 h-3 w-3" />
                                    Back to App
                                </Button>
                            </Link>
                        </nav>
                    </div>
                </div>
            </header>

            <div className="container flex-1 items-start md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-10 px-4 py-8 max-w-screen-2xl mx-auto">
                {/* Fixed Sidebar */}
                <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block overflow-y-auto border-r border-black/5 py-8 pr-6">
                    <div className="w-full">
                        <div className="pb-6">
                            <h4 className="mb-2 rounded-md px-2 py-1 text-xs font-bold uppercase tracking-widest text-gray-500">Core Vision</h4>
                            <div className="grid grid-flow-row auto-rows-max text-sm gap-1">
                                <Link href="#manifesto" className="group flex w-full items-center rounded-md border border-transparent px-2 py-2 text-black font-semibold bg-black/5 transition-all">
                                    The Manifesto
                                </Link>
                                <Link href="#problem" className="group flex w-full items-center rounded-md border border-transparent px-2 py-2 text-gray-500 hover:text-black hover:bg-black/5 transition-all">
                                    The Problem
                                </Link>
                                <Link href="#solution" className="group flex w-full items-center rounded-md border border-transparent px-2 py-2 text-gray-500 hover:text-black hover:bg-black/5 transition-all">
                                    The Solution
                                </Link>
                            </div>
                        </div>
                        <div className="pb-6">
                            <h4 className="mb-2 rounded-md px-2 py-1 text-xs font-bold uppercase tracking-widest text-gray-500">Protocol</h4>
                            <div className="grid grid-flow-row auto-rows-max text-sm gap-1">
                                <Link href="#loop-mechanics" className="group flex w-full items-center rounded-md border border-transparent px-2 py-2 text-gray-500 hover:text-black hover:bg-black/5 transition-all">
                                    Loop Mechanics
                                </Link>
                                <Link href="#proof-of-skill" className="group flex w-full items-center rounded-md border border-transparent px-2 py-2 text-gray-500 hover:text-black hover:bg-black/5 transition-all">
                                    Proof of Skill
                                </Link>
                            </div>
                        </div>

                        <div className="mt-8 p-4 rounded-xl bg-gray-50 border border-black/5">
                            <p className="text-xs text-gray-500 mb-3 font-medium">Ready to start trading?</p>
                            <Link href="/login">
                                <Button size="sm" className="w-full bg-black text-white hover:bg-gray-800 rounded-lg">
                                    Launch App
                                </Button>
                            </Link>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_260px]">
                    <div className="mx-auto w-full min-w-0 max-w-3xl">

                        <div id="manifesto" className="space-y-6 border-b border-black/5 pb-10 mb-10 scroll-mt-24">
                            <Badge variant="outline" className="mb-2 border-primary text-primary bg-primary/5">v1.0.0 Public Draft</Badge>
                            <h1 className="scroll-m-20 text-4xl font-black tracking-tighter lg:text-5xl">
                                The Skill Exchange Protocol
                            </h1>
                            <p className="text-2xl text-gray-600 leading-relaxed font-medium">
                                We are building a decentralized economy for knowledge, where skills are the only currency that matters.
                            </p>
                        </div>

                        <div className="space-y-16">
                            <section id="problem" className="space-y-6 scroll-mt-24">
                                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                                    <Shield className="w-8 h-8 text-red-500" />
                                    The Gatekeeper Problem
                                </h2>
                                <p className="leading-8 text-gray-600 text-lg">
                                    Traditional education is walled off by tuition fees, geography, and institutional gatekeepers. We believe that <strong className="text-black">everyone is an expert at something</strong>, from quantum physics to sourdough baking. The problem isn't a lack of knowledge; it's a lack of connection.
                                </p>
                            </section>

                            <section id="solution" className="space-y-6 scroll-mt-24">
                                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                                    <Globe className="w-8 h-8 text-blue-500" />
                                    The Barter Solution
                                </h2>
                                <p className="leading-8 text-gray-600 text-lg">
                                    Skloop removes the financial barrier entirely. By returning to a <strong className="text-black bg-blue-50 px-1 rounded">barter economy model</strong>, we democratize access to high-quality mentorship. You pay with your time and expertise, not your wallet.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                    <div className="p-6 bg-white border border-black/5 rounded-2xl shadow-sm">
                                        <div className="font-bold text-xl mb-2">1. List</div>
                                        <p className="text-sm text-gray-500">Define what you can teach and what you need to learn.</p>
                                    </div>
                                    <div className="p-6 bg-white border border-black/5 rounded-2xl shadow-sm">
                                        <div className="font-bold text-xl mb-2">2. Match</div>
                                        <p className="text-sm text-gray-500">Our protocol finds the perfect peer who completes your loop.</p>
                                    </div>
                                    <div className="p-6 bg-white border border-black/5 rounded-2xl shadow-sm">
                                        <div className="font-bold text-xl mb-2">3. Trade</div>
                                        <p className="text-sm text-gray-500">Exchange knowledge directly. Verify and build reputation.</p>
                                    </div>
                                </div>
                            </section>

                            <section id="loop-mechanics" className="space-y-6 scroll-mt-24">
                                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                                    <Zap className="w-8 h-8 text-yellow-500" />
                                    Loop Mechanics
                                </h2>
                                <p className="leading-8 text-gray-600 text-lg">
                                    A "Loop" is a confirmed exchange session between two peers.
                                </p>
                                <div className="my-6 w-full overflow-hidden rounded-xl border border-black/5 shadow-sm">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50/50">
                                            <tr className="border-b border-black/5">
                                                <th className="px-6 py-4 text-left font-bold text-gray-900">Exchange Type</th>
                                                <th className="px-6 py-4 text-left font-bold text-gray-900">Description</th>
                                                <th className="px-6 py-4 text-right font-bold text-gray-900">Cost</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-black/5 bg-white">
                                            <tr>
                                                <td className="px-6 py-4 font-semibold text-gray-900">Direct Swap</td>
                                                <td className="px-6 py-4 text-gray-600">Person A teaches B, Person B teaches A.</td>
                                                <td className="px-6 py-4 text-right font-mono text-gray-500">0.00</td>
                                            </tr>
                                            <tr>
                                                <td className="px-6 py-4 font-semibold text-gray-900">Async Pool</td>
                                                <td className="px-6 py-4 text-gray-600">Earn credits by teaching, spend credits to learn later.</td>
                                                <td className="px-6 py-4 text-right font-mono text-gray-500">1 Credit</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </section>

                            <section id="proof-of-skill" className="space-y-6 scroll-mt-24">
                                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                                    <Sparkles className="w-8 h-8 text-primary" />
                                    Proof of Skill (PoS)
                                </h2>
                                <p className="leading-8 text-gray-600 text-lg">
                                    Reputation in Skloop is non-transferable and earned only through verified successful exchanges. Your "Score" is a mathematical proof of your helpfulness to the network.
                                </p>
                                <div className="mt-6 p-6 bg-[#1a1a1a] rounded-2xl text-white shadow-xl relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
                                    <h3 className="text-xl font-bold mb-4 relative z-10">Start Building Your Legacy</h3>
                                    <p className="text-gray-400 mb-6 max-w-lg relative z-10">
                                        The earlier you join, the more fundamental a node you become in the skill graph.
                                    </p>
                                    <Link href="/login">
                                        <Button className="bg-white text-black hover:bg-gray-100 font-bold relative z-10">
                                            Create Account <ArrowRight className="ml-2 w-4 h-4" />
                                        </Button>
                                    </Link>
                                </div>
                            </section>
                        </div>
                    </div>

                    <div className="hidden text-sm xl:block min-w-[280px]">
                        <div className="sticky top-24 pl-8 border-l border-black/5">
                            <h4 className="mb-4 text-xs font-bold text-black uppercase tracking-wider">On This Page</h4>
                            <ul className="space-y-3 text-gray-500">
                                <li><Link href="#manifesto" className="hover:text-primary transition-colors block py-1">Manifesto</Link></li>
                                <li><Link href="#problem" className="hover:text-primary transition-colors block py-1">The Problem</Link></li>
                                <li><Link href="#solution" className="hover:text-primary transition-colors block py-1">The Solution</Link></li>
                                <li><Link href="#loop-mechanics" className="hover:text-primary transition-colors block py-1">Loop Mechanics</Link></li>
                                <li><Link href="#proof-of-skill" className="hover:text-primary transition-colors block py-1">Proof of Skill</Link></li>
                            </ul>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
