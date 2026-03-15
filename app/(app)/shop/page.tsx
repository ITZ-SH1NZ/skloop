"use client";

import { useEffect, useState, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ShoppingBag, Shield, CreditCard, Palette, Tag, Zap,
    CheckCircle, HelpCircle, Crown, Circle, Diamond, GitBranch
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { ShopItem, ShopItemCategory } from "@/lib/shop-items";
import { CurrencyCoin } from "@/components/ui/CurrencyCoin";
import { useToast } from "@/components/ui/ToastProvider";
import useSWR from "swr";
import { fetchShopData } from "@/lib/swr-fetchers";
import { useUser } from "@/context/UserContext";
import { useLoading } from "@/components/LoadingProvider";

const ICON_MAP: Record<string, any> = {
    Shield, Crown, Zap, Circle, Diamond, CreditCard, GitBranch, ShoppingBag, Palette, Tag
};

const getIcon = (name: string | null) => {
    if (!name) return HelpCircle;
    return ICON_MAP[name] || HelpCircle;
};

const RARITY_CONFIG = {
    common: { label: "Common", cls: "bg-zinc-100 text-zinc-600 border-zinc-200" },
    rare: { label: "Rare", cls: "bg-blue-50 text-blue-700 border-blue-200" },
    epic: { label: "Epic", cls: "bg-purple-50 text-purple-700 border-purple-200" },
    legendary: { label: "Legendary", cls: "bg-amber-50 text-amber-700 border-amber-200" },
};

const ShopItemCard = memo(({ 
    item, 
    idx, 
    owned, 
    processing, 
    coins, 
    handlePurchase 
}: { 
    item: ShopItem, 
    idx: number, 
    owned: boolean, 
    processing: boolean, 
    coins: number,
    handlePurchase: (item: ShopItem) => void
}) => {
    const [isHovered, setIsHovered] = useState(false);
    const canAfford = coins >= item.price;
    const rarity = RARITY_CONFIG[item.rarity as keyof typeof RARITY_CONFIG];
    const Icon = item.icon || getIcon(item.icon_name || null);

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: Math.min(idx * 0.04, 0.25), type: "spring", stiffness: 300, damping: 25 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group bg-white border border-zinc-100 rounded-3xl overflow-hidden flex flex-col hover:shadow-xl hover:border-zinc-200 transition-all duration-300"
        >
            {/* Visual block */}
            <div className={`relative h-44 bg-gradient-to-br ${item.gradient} overflow-hidden flex items-center justify-center`}>
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
                    animate={isHovered ? { scale: 1.15, rotate: -6 } : { scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative z-10"
                >
                    <Icon size={52} className="text-white drop-shadow-[0_8px_24px_rgba(0,0,0,0.5)]" strokeWidth={1.5} />
                </motion.div>

                {/* Glow behind icon */}
                <div
                    className="absolute inset-0 flex items-center justify-center pointer-events-none"
                    style={{ filter: "blur(40px)", opacity: isHovered ? 0.5 : 0.2, transition: "opacity 0.3s" }}
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
                        disabled={!canAfford || processing}
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
});

ShopItemCard.displayName = "ShopItemCard";

export default function ShopPage() {
    const { toast } = useToast();
    const { user } = useUser();
    const { isLoading: isGlobalLoading } = useLoading();
    const currentUserId = user?.id || null;

    const [activeCategory, setActiveCategory] = useState<ShopItemCategory | "all">("all");
    const [processingId, setProcessingId] = useState<string | null>(null);

    const { data: shopData, mutate } = useSWR(
        currentUserId ? ['shopData', currentUserId] : null,
        fetchShopData as any,
        { revalidateOnFocus: false }
    );

    const items = shopData?.items || [];
    const coins = shopData?.coins || 0;
    const inventory = shopData?.inventory || [];
    const streakShields = shopData?.streakShields || 0;

    const handlePurchase = async (item: ShopItem) => {
        if (coins < item.price) { 
            toast("Not enough coins. Need " + (item.price - coins).toLocaleString() + " more.", "error");
            return; 
        }
        if (item.category !== "consumable" && inventory.includes(item.id)) { 
            toast("You already have this item in your collection.", "info");
            return; 
        }
        setProcessingId(item.id);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not logged in");
            const newCoins = coins - item.price;
            const newInventory = [...inventory, item.id]; 
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
            mutate();

            toast(`${item.name} acquired. Check your collection!`, "success");
        } catch {
            toast("Something went wrong. Please try again.", "error");
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

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={isGlobalLoading ? { opacity: 0, y: 20 } : { opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.4, duration: 0.8 }}
            className="min-h-screen bg-zinc-50"
        >
            {/* ───── Hero Header ───── */}
            <div className="relative overflow-hidden bg-zinc-900 pb-28 pt-14 px-6">
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
                        {filtered.map((item: ShopItem, idx: number) => (
                            <ShopItemCard 
                                key={item.id}
                                item={item}
                                idx={idx}
                                owned={item.category !== "consumable" && inventory.includes(item.id)}
                                processing={processingId === item.id}
                                coins={coins}
                                handlePurchase={handlePurchase}
                            />
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
