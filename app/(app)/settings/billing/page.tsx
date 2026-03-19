"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/ui/ToastProvider";
import { Button } from "@/components/ui/Button";
import { Check, Minus, Zap, Star, Crown, Rocket, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PLAN_CONFIG, type Plan } from "@/lib/plans";

type Billing = "monthly" | "yearly";

const FREE_FEATURES = [
    { label: "All courses and lessons", included: true },
    { label: "All quests, chests, streaks", included: true },
    { label: "Peer chat & study circles (up to 3)", included: true },
    { label: "Daily games (Codele, typing, quiz)", included: true },
    { label: "20 AI hints per day", included: true },
    { label: "Leaderboards and leagues", included: true },
    { label: "Unlimited AI hints", included: false },
    { label: "Live mentor sessions", included: false },
    { label: "Completion certificates", included: false },
];

const PLUS_FEATURES = [
    { label: "Everything in Free", included: true },
    { label: "Unlimited AI hints", included: true },
    { label: "AI Code Reviewer", included: true },
    { label: "AI Interview Prep Mode", included: true },
    { label: "Plus badge on profile", included: true },
    { label: "Early access to new features", included: true },
    { label: "Live mentor sessions", included: false },
    { label: "Completion certificates", included: false },
];

const PRO_FEATURES = [
    { label: "Everything in Plus", included: true },
    { label: "Book live mentor sessions", included: true },
    { label: "1-on-1 video/voice/text calls", included: true },
    { label: "Completion certificates", included: true },
    { label: "Private study circles (unlimited)", included: true },
    { label: "Analytics export", included: true },
];

const FAQ = [
    {
        q: "Can I cancel anytime?",
        a: "Yes, cancel from your account settings at any time. No questions asked. You keep access until the end of your billing period.",
    },
    {
        q: "What happens to my progress if I downgrade?",
        a: "Nothing. All your XP, streaks, badges, and progress stay forever. You'll just lose access to Plus/Pro features.",
    },
    {
        q: "Is the free tier actually limited?",
        a: "No content is locked behind payment. Every lesson, course, quest, and game is free forever. Plus and Pro add convenience — not content.",
    },
    {
        q: "Do you have student discounts?",
        a: "Yes — join via a friend's referral link for 50% off Plus forever. Ask a friend who's already on Skloop for their link.",
    },
];

export default function BillingSettingsPage() {
    const { profile } = useUser();
    const { toast } = useToast();
    const [billing, setBilling] = useState<Billing>("monthly");
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
    const [openFaq, setOpenFaq] = useState<number | null>(null);

    const currentPlan: Plan = (profile as any)?.plan ?? "free";

    const handleUpgrade = async (plan: "plus" | "pro") => {
        setLoadingPlan(plan);
        try {
            const res = await fetch("/api/create-checkout-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan, billing }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                toast(data.error || "Payments are coming soon — stay tuned!", "success");
            }
        } catch {
            toast("Payments are coming soon — stay tuned!", "success");
        } finally {
            setLoadingPlan(null);
        }
    };

    const plusMonthly = PLAN_CONFIG.plus.price_monthly;
    const plusYearly = PLAN_CONFIG.plus.price_yearly;
    const proMonthly = PLAN_CONFIG.pro.price_monthly;
    const proYearly = PLAN_CONFIG.pro.price_yearly;

    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.1 }
        }
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 400, damping: 25 } }
    };

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div variants={itemVariants} className="mb-8">
                <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Plans & Billing</h1>
                <p className="text-zinc-500 font-medium mt-1">
                    Currently on{" "}
                    <span className="font-black text-zinc-900 capitalize">{currentPlan} plan</span>.
                </p>
            </motion.div>

            <div className="space-y-8">
                {/* Coming Soon banner */}
                <motion.div variants={itemVariants} className="flex items-center gap-4 bg-zinc-900 text-white rounded-2xl px-6 py-4">
                    <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
                        <Rocket size={20} className="text-black" />
                    </div>
                    <div>
                        <p className="font-black text-sm">Payments coming soon</p>
                        <p className="text-zinc-400 text-xs font-medium mt-0.5">
                            We're setting up our payment infrastructure. Upgrade will be available shortly!
                        </p>
                    </div>
                </motion.div>

                {/* Billing toggle */}
                <motion.div variants={itemVariants} className="flex items-center justify-center">
                    <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-2xl">
                        <button
                            onClick={() => setBilling("monthly")}
                            className={cn(
                                "px-5 py-2 rounded-xl text-sm font-black transition-all",
                                billing === "monthly"
                                    ? "bg-white text-zinc-900 shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-700"
                            )}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBilling("yearly")}
                            className={cn(
                                "px-5 py-2 rounded-xl text-sm font-black transition-all flex items-center gap-2",
                                billing === "yearly"
                                    ? "bg-white text-zinc-900 shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-700"
                            )}
                        >
                            Yearly
                            <span className="bg-primary text-black text-[10px] font-black px-2 py-0.5 rounded-full">
                                Save 2 months
                            </span>
                        </button>
                    </div>
                </motion.div>

                {/* Plan cards */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Free */}
                    <PlanCard
                        name="Free"
                        tagline="Learn everything, always free"
                        icon={<Zap size={20} className="text-zinc-500" />}
                        iconBg="bg-zinc-100"
                        price="₹0"
                        period=""
                        badge={null}
                        isCurrent={currentPlan === "free"}
                        features={FREE_FEATURES}
                        onUpgrade={undefined}
                        loading={false}
                    />
                    {/* Plus */}
                    <PlanCard
                        name="Plus"
                        tagline="Unlimited AI, no distractions"
                        icon={<Star size={20} className="text-amber-500" />}
                        iconBg="bg-amber-50"
                        price={billing === "monthly" ? `₹${plusMonthly}` : `₹${plusYearly}`}
                        period={billing === "monthly" ? "/mo" : "/yr"}
                        badge="Most Popular"
                        isCurrent={currentPlan === "plus"}
                        features={PLUS_FEATURES}
                        onUpgrade={() => handleUpgrade("plus")}
                        loading={loadingPlan === "plus"}
                    />
                    {/* Pro */}
                    <PlanCard
                        name="Pro"
                        tagline="For serious learners"
                        icon={<Crown size={20} className="text-purple-500" />}
                        iconBg="bg-purple-50"
                        price={billing === "monthly" ? `₹${proMonthly}` : `₹${proYearly}`}
                        period={billing === "monthly" ? "/mo" : "/yr"}
                        badge="For Serious Learners"
                        isCurrent={currentPlan === "pro"}
                        features={PRO_FEATURES}
                        onUpgrade={() => handleUpgrade("pro")}
                        loading={loadingPlan === "pro"}
                    />
                </motion.div>

                {/* FAQ */}
                <motion.div variants={itemVariants}>
                    <h2 className="text-xl font-black text-zinc-900 mb-4">Frequently Asked Questions</h2>
                    <div className="space-y-2">
                        {FAQ.map((item, i) => (
                            <div
                                key={i}
                                className="bg-white rounded-2xl border border-zinc-100 shadow-sm overflow-hidden"
                            >
                                <button
                                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                                    className="w-full flex items-center justify-between px-5 py-4 text-left"
                                >
                                    <span className="text-sm font-bold text-zinc-900">{item.q}</span>
                                    <ChevronDown
                                        size={16}
                                        className={cn(
                                            "text-zinc-400 shrink-0 transition-transform duration-200",
                                            openFaq === i && "rotate-180"
                                        )}
                                    />
                                </button>
                                <AnimatePresence initial={false}>
                                    {openFaq === i && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-5 pb-4 pt-1">
                                                <p className="text-sm text-zinc-500 font-medium">{item.a}</p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Billing history */}
                <motion.div variants={itemVariants} className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm">
                    <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4">
                        Billing History
                    </h2>
                    <div className="py-8 text-center">
                        <p className="text-sm font-bold text-zinc-400">No invoices yet.</p>
                    </div>
                </motion.div>
            </div>
        </motion.div>
    );
}

function PlanCard({
    name,
    tagline,
    icon,
    iconBg,
    price,
    period,
    badge,
    isCurrent,
    features,
    onUpgrade,
    loading,
}: {
    name: string;
    tagline: string;
    icon: React.ReactNode;
    iconBg: string;
    price: string;
    period: string;
    badge: string | null;
    isCurrent: boolean;
    features: { label: string; included: boolean }[];
    onUpgrade?: () => void;
    loading: boolean;
}) {
    const isHighlighted = badge === "Most Popular";

    return (
        <div
            className={cn(
                "bg-white rounded-[2rem] p-6 border shadow-sm flex flex-col gap-5 relative",
                isHighlighted ? "border-primary shadow-primary/10 shadow-xl" : "border-zinc-100",
                isCurrent ? "ring-2 ring-zinc-900" : ""
            )}
        >
            {badge && (
                <div
                    className={cn(
                        "absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black px-3 py-1 rounded-full whitespace-nowrap",
                        isHighlighted ? "bg-primary text-black" : "bg-zinc-800 text-white"
                    )}
                >
                    {isHighlighted ? "★ " : ""}{badge}
                </div>
            )}
            {isCurrent && (
                <div className="absolute -top-3 right-4 bg-zinc-900 text-white text-[10px] font-black px-3 py-1 rounded-full">
                    CURRENT
                </div>
            )}

            <div className="flex items-center gap-3">
                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", iconBg)}>
                    {icon}
                </div>
                <div>
                    <h3 className="font-black text-zinc-900 leading-none">{name}</h3>
                    <p className="text-xs text-zinc-400 font-medium mt-0.5">{tagline}</p>
                </div>
            </div>

            <div>
                <span className="text-3xl font-black text-zinc-900">{price}</span>
                {period && <span className="text-sm font-bold text-zinc-400 ml-1">{period}</span>}
            </div>

            <div className="space-y-2.5 flex-1">
                {features.map((f) => (
                    <div key={f.label} className="flex items-center gap-2.5">
                        <div className="w-4 shrink-0">
                            {f.included ? (
                                <Check size={14} className="text-primary" strokeWidth={3} />
                            ) : (
                                <Minus size={12} className="text-zinc-300" strokeWidth={2.5} />
                            )}
                        </div>
                        <span
                            className={cn(
                                "text-xs font-semibold",
                                f.included ? "text-zinc-600" : "text-zinc-300"
                            )}
                        >
                            {f.label}
                        </span>
                    </div>
                ))}
            </div>

            <Button
                onClick={onUpgrade}
                disabled={isCurrent || !onUpgrade || loading}
                className={cn(
                    "w-full font-black rounded-xl h-12",
                    isCurrent
                        ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                        : isHighlighted
                        ? "bg-primary text-black shadow-lg shadow-primary/20 hover:shadow-primary/30"
                        : "bg-zinc-900 text-white"
                )}
            >
                {loading ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : isCurrent ? (
                    "Current Plan"
                ) : !onUpgrade ? (
                    "Current Plan"
                ) : (
                    "Start 7-day trial"
                )}
            </Button>
        </div>
    );
}
