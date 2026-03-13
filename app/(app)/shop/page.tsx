"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShoppingBag, Shield, CreditCard, Palette, Tag, Zap,
    CheckCircle, Loader2, HelpCircle
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { ShopItem, ShopItemCategory } from "@/lib/shop-items";
import { CurrencyCoin } from "@/components/ui/CurrencyCoin";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import useSWR from "swr";
import { fetchShopData } from "@/lib/swr-fetchers";
import { useUser } from "@/context/UserContext";

const getIcon = (name: string | null) => {
    if (!name) return HelpCircle;
    return (LucideIcons as any)[name] || HelpCircle;
};

const RARITY_CONFIG = {
    common: { label: "Common", cls: "bg-zinc-100 text-zinc-600 border-zinc-200" },
    rare: { label: "Rare", cls: "bg-blue-50 text-blue-700 border-blue-200" },
    epic: { label: "Epic", cls: "bg-purple-50 text-purple-700 border-purple-200" },
    legendary: { label: "Legendary", cls: "bg-amber-50 text-amber-700 border-amber-200" },
};

export default function ShopPage() {
    const { toast } = useToast();
    const { user } = useUser();
    const currentUserId = user?.id || null;

    const [activeCategory, setActiveCategory] = useState<ShopItemCategory | "all">("all");
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    const { data: shopData, isLoading: isShopLoading, mutate } = useSWR(
        currentUserId ? ['shopData', currentUserId] : null,
        fetchShopData as any
    );

    const items = shopData?.items?.map((item: any) => ({
        ...item,
        icon: getIcon(item.icon_name)
    })) || [];
    
    const coins = shopData?.coins || 0;
    const inventory = shopData?.inventory || [];
    const streakShields = shopData?.streakShields || 0;

    const isLoading = isShopLoading || (currentUserId && !shopData);

    const handlePurchase = async (item: ShopItem) => {
        if (coins < item.price) { toast(`Need ${(item.price - coins).toLocaleString()} more coins.`, "error"); return; }
        if (item.category !== "consumable" && inventory.includes(item.id)) { toast("Already owned.", "info"); return; }
        setProcessingId(item.id);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not logged in");
            const newCoins = coins - item.price;
            const newInventory = [...inventory, item.id]; // ALWAYS add to inventory so it shows in collection
            const newShields = item.id === "item_streak_shield" ? streakShields + 1 : streakShields;

            const { error } = await supabase.from("profiles")
                .update({
                    coins: newCoins,
                    inventory: newInventory,
                    streak_shields: newShields
                })
                .eq("id", user.id);

            if (error) throw error;

            mutate({
                ...shopData,
                coins: newCoins,
                inventory: newInventory,
                streakShields: newShields,
            }, false);
            mutate(); // Revalidate background

            toast(`${item.name} unlocked. Check your collection!`, "success");
        } catch {
            toast("Purchase failed. Try again.", "error");
        } finally {
            setProcessingId(null);
        }
    };

    const CATEGORIES: { id: ShopItemCategory | "all"; label: string; Icon: any }[] = [
        { id: "all", label: "All", Icon: ShoppingBag },
        { id: "card", label: "Cards", Icon: CreditCard },
        { id: "cosmetic", label: "Cosmetics", Icon: Palette },
        { id: "title", label: "Titles", Icon: Tag },
        { id: "consumable", label: "Consumables", Icon: Shield },
    ];

    const filtered = items.filter((i: ShopItem) => activeCategory === "all" || i.category === activeCategory);

    if (isLoading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="w-7 h-7 animate-spin text-zinc-400" />
        </div>
    );

    return (
        <div className="min-h-screen bg-zinc-50">

            {/* ───── Hero Header ───── */}
            <div className="relative overflow-hidden bg-zinc-900 pb-28 pt-14 px-6">
                {/* Mesh gradient glows */}
                <div className="pointer-events-none absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-[#D4F268]/10 blur-[100px]" />
                <div className="pointer-events-none absolute -bottom-20 right-0 w-[400px] h-[400px] rounded-full bg-violet-500/10 blur-[100px]" />

                <div className="relative z-10 max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div>
                        <p className="text-[#D4F268] text-xs font-black uppercase tracking-[0.25em] mb-3">Loopy Economy</p>
                        <h1 className="text-5xl md:text-6xl font-black text-white tracking-tight leading-none mb-3">
                            The Shop
                        </h1>
                        <p className="text-zinc-400 max-w-md text-base font-medium leading-relaxed">
                            Trade your hard-earned coins for cosmetics, titles, and holographic collectibles.
                        </p>
                    </div>

                    {/* Balance card */}
                    <div className="flex-shrink-0 bg-white/5 border border-white/10 backdrop-blur-md rounded-3xl px-8 py-5 flex flex-col gap-1">
                        <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">Your Balance</span>
                        <div className="flex items-center gap-3 mt-1">
                            <CurrencyCoin size="md" className="w-7 h-7 drop-shadow-[0_0_12px_rgba(212,242,104,0.4)]" />
                            <span className="text-4xl font-black text-[#D4F268]">{coins.toLocaleString()}</span>
                        </div>
                        {streakShields > 0 && (
                            <div className="flex items-center gap-2 mt-2">
                                <Shield size={13} className="text-blue-400 fill-blue-400" />
                                <span className="text-blue-400 text-xs font-bold">{streakShields} streak shield{streakShields > 1 ? "s" : ""} active</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ───── Content ───── */}
            <div className="max-w-6xl mx-auto px-6 -mt-14 relative z-20">

                {/* Filter pill bar */}
                <div className="w-full relative px-2 md:px-0 mb-10">
                    <div className="flex justify-start md:justify-center overflow-x-auto no-scrollbar py-2 -my-2">
                        <div className="flex items-center p-1 bg-white border border-gray-200 rounded-full shadow-sm min-w-max mx-auto md:mx-0">
                            {CATEGORIES.map(({ id, label, Icon }) => {
                                const active = activeCategory === id;
                                return (
                                    <button
                                        key={id}
                                        onClick={() => setActiveCategory(id)}
                                        className={`
                                            relative px-6 py-2.5 text-sm font-bold transition-colors rounded-full z-10 whitespace-nowrap flex items-center gap-2
                                            ${active ? "text-primary-foreground" : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"}
                                        `}
                                    >
                                        {active && (
                                            <motion.div
                                                layoutId="shop-filter-bg"
                                                className="absolute inset-0 bg-primary rounded-full -z-10 shadow-sm"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        <Icon size={15} className={active ? "text-primary-foreground" : ""} />
                                        {label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Item Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pb-20">
                    <AnimatePresence mode="popLayout">
                        {filtered.map((item: ShopItem, idx: number) => {
                            const owned = item.category !== "consumable" && inventory.includes(item.id);
                            const processing = processingId === item.id;
                            const canAfford = coins >= item.price;
                            const rarity = RARITY_CONFIG[item.rarity as keyof typeof RARITY_CONFIG];
                            const Icon = (item as any).icon;

                            return (
                                <motion.div
                                    layout
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: Math.min(idx * 0.04, 0.25), type: "spring", stiffness: 300, damping: 25 }}
                                    onMouseEnter={() => setHoveredId(item.id)}
                                    onMouseLeave={() => setHoveredId(null)}
                                    className="group bg-white border border-zinc-100 rounded-3xl overflow-hidden flex flex-col hover:shadow-xl hover:border-zinc-200 transition-all duration-300"
                                >
                                    {/* Visual block */}
                                    <div className={`relative h-44 bg-gradient-to-br ${item.gradient} overflow-hidden flex items-center justify-center`}>
                                        {/* Texture overlay for rarity */}
                                        {item.rarity === "legendary" && (
                                            <div className="absolute inset-0 opacity-20 mix-blend-overlay"
                                                style={{ backgroundImage: "repeating-linear-gradient(45deg, rgba(255,255,255,.15) 0, rgba(255,255,255,.15) 1px, transparent 0, transparent 50%)", backgroundSize: "12px 12px" }}
                                            />
                                        )}
                                        {item.imageUrl && (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img src={item.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                                        )}

                                        {/* Centered Icon */}
                                        <motion.div
                                            animate={hoveredId === item.id ? { scale: 1.15, rotate: -6 } : { scale: 1, rotate: 0 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                            className="relative z-10"
                                        >
                                            <Icon size={52} className="text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]" strokeWidth={1.5} />
                                        </motion.div>

                                        {/* Glow behind icon */}
                                        <div
                                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                            style={{ filter: "blur(40px)", opacity: hoveredId === item.id ? 0.5 : 0.2, transition: "opacity 0.3s" }}
                                        >
                                            <div className="w-16 h-16 rounded-full bg-white" />
                                        </div>

                                        {/* Badges */}
                                        <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${rarity.cls}`}>
                                                {rarity.label}
                                            </span>
                                            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-black/30 text-white border border-white/10 backdrop-blur-sm">
                                                {item.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Info block */}
                                    <div className="p-5 flex-1 flex flex-col gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-base font-black text-zinc-900 tracking-tight mb-1">{item.name}</h3>
                                            <p className="text-zinc-500 text-xs leading-relaxed font-medium">{item.description}</p>
                                        </div>

                                        {owned ? (
                                            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3">
                                                <CheckCircle size={15} className="text-zinc-400 shrink-0" />
                                                <span className="text-xs font-bold text-zinc-400">Owned</span>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handlePurchase(item)}
                                                disabled={!canAfford || !!processing}
                                                className={`
                                                    w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold text-sm transition-all
                                                    ${canAfford
                                                        ? "bg-zinc-900 text-white hover:bg-zinc-800 hover:shadow-lg hover:shadow-zinc-900/15 hover:-translate-y-0.5"
                                                        : "bg-zinc-100 text-zinc-400 cursor-not-allowed"}
                                                `}
                                            >
                                                <span>{processing ? "Processing..." : canAfford ? "Purchase" : "Not enough coins"}</span>
                                                <div className="flex items-center gap-1.5">
                                                    <span className={canAfford ? "text-[#D4F268]" : ""}>{item.price.toLocaleString()}</span>
                                                    <CurrencyCoin size="sm" className="w-4 h-4" />
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
