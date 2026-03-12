"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { TradingCard } from "@/components/profile/TradingCards";
import { Loader2, ShoppingBag, Check, Zap, HelpCircle } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";
import { useUser } from "@/context/UserContext";
import { ShopItem } from "@/lib/shop-items";

const getIcon = (name: string | null) => {
    if (!name) return HelpCircle;
    return (LucideIcons as any)[name] || HelpCircle;
};

export function CollectionModule() {
    const [ownedCards, setOwnedCards] = useState<ShopItem[]>([]);
    const [ownedCosmetics, setOwnedCosmetics] = useState<ShopItem[]>([]);
    const [ownedConsumables, setOwnedConsumables] = useState<ShopItem[]>([]);
    const [equippedTitle, setEquippedTitle] = useState<string | null>(null);
    const [equippedRing, setEquippedRing] = useState<string | null>(null);
    const [activePowers, setActivePowers] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const router = useRouter();
    const { toast } = useToast();
    const { refreshProfile } = useUser();

    useEffect(() => {
        const fetchInventory = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // 1. Fetch User Profile (Inventory + Equipped)
            const { data: profile } = await supabase
                .from("profiles")
                .select("inventory, equipped_title, equipped_ring, active_powers")
                .eq("id", user.id)
                .single();

            if (profile?.inventory) {
                const ids = profile.inventory as string[];

                // 2. Fetch full item details for the inventory from the database
                const { data: allItems } = await supabase
                    .from("shop_items")
                    .select("*")
                    .in("id", ids);

                if (allItems) {
                    const mapped = allItems.map((item: any) => ({
                        ...item,
                        icon: getIcon(item.icon_name)
                    }));
                    setOwnedCards(mapped.filter(i => i.category === "card"));
                    setOwnedCosmetics(mapped.filter(i => i.category === "cosmetic" || i.category === "title"));
                    setOwnedConsumables(mapped.filter(i => i.category === "consumable"));
                }
            }
            setEquippedTitle(profile?.equipped_title || null);
            setEquippedRing(profile?.equipped_ring || null);
            setActivePowers(profile?.active_powers || {});
            setIsLoading(false);
        };

        fetchInventory();
    }, []);

    const handleUseConsumable = async (item: ShopItem) => {
        if (item.id === 'item_streak_shield') {
            toast("Streak Shields are automatically used if you miss a day!", "info");
            return;
        }

        setProcessingId(item.id);
        try {
            const { activateBoostItem } = await import("@/actions/user-actions");
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;
            const res = await activateBoostItem(user.id, item.id);

            if (res.success) {
                toast(`${item.name} activated!`, "success");
                // Remove from local state
                setOwnedConsumables(prev => prev.filter(i => i.id !== item.id));
                await refreshProfile();
            } else {
                toast(res.error || "Failed to activate.", "error");
            }
        } catch (err) {
            toast("An error occurred.", "error");
        } finally {
            setProcessingId(null);
        }
    };

    const handleEquip = async (item: ShopItem) => {
        setProcessingId(item.id);
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const isTitle = item.category === "title";
            const isRing = item.category === "cosmetic";

            const currentEquipped = isTitle ? equippedTitle : equippedRing;
            const alreadyEquipped = currentEquipped === item.id;

            const update: Record<string, string | null> = {};
            if (isTitle) update.equipped_title = alreadyEquipped ? null : item.id;
            if (isRing) update.equipped_ring = alreadyEquipped ? null : item.id;

            const { error } = await supabase.from("profiles").update(update).eq("id", user.id);
            if (error) throw error;

            if (isTitle) setEquippedTitle(alreadyEquipped ? null : item.id);
            if (isRing) setEquippedRing(alreadyEquipped ? null : item.id);

            await refreshProfile();
            toast(alreadyEquipped ? `${item.name} unequipped.` : `${item.name} equipped!`, "success");
        } catch {
            toast("Failed to equip. Try again.", "error");
        } finally {
            setProcessingId(null);
        }
    };

    if (isLoading) return (
        <div className="flex justify-center items-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-zinc-300" />
        </div>
    );

    const EmptyState = ({ label, sub }: { label: string; sub: string }) => (
        <div className="bg-zinc-50 border-2 border-dashed border-zinc-200 rounded-[2rem] p-14 text-center">
            <div className="w-12 h-12 bg-zinc-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <ShoppingBag size={22} className="text-zinc-400" />
            </div>
            <h3 className="text-lg font-black text-zinc-900 mb-1">{label}</h3>
            <p className="text-zinc-400 text-sm mb-6">{sub}</p>
            <Button onClick={() => router.push("/shop")} variant="outline" className="rounded-xl font-bold">
                Browse the Shop
            </Button>
        </div>
    );

    const isPowerActive = (id: string) => {
        const now = new Date().toISOString();
        if (id === 'item_xp_booster') {
            return activePowers.xp_multiplier > 1 && activePowers.xp_expires > now;
        }
        if (id === 'item_coin_magnet') {
            return activePowers.coins_multiplier > 1 && activePowers.coins_expires > now;
        }
        return false;
    };

    return (
        <div className="space-y-14 animate-in fade-in slide-in-from-bottom-4 duration-500">

            {/* ── Trading Cards ── */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Trading Cards</h2>
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-full">
                        {ownedCards.length} {ownedCards.length === 1 ? "card" : "cards"}
                    </span>
                </div>
                {ownedCards.length > 0 ? (
                    <div className="flex flex-wrap gap-6 justify-center md:justify-start">
                        {ownedCards.map(card => <TradingCard key={card.id} item={card} />)}
                    </div>
                ) : (
                    <EmptyState label="No cards yet" sub="Unlock holographic collectibles from the Loopy Shop." />
                )}
            </section>

            {/* ── Power-ups ── */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Power-ups</h2>
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-full">
                        {ownedConsumables.length} available
                    </span>
                </div>
                {ownedConsumables.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {ownedConsumables.map(item => {
                            const Icon = item.icon;
                            const processing = processingId === item.id;
                            const active = isPowerActive(item.id);

                            return (
                                <div
                                    key={item.id}
                                    className="bg-white border border-zinc-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm hover:border-zinc-200 transition-all"
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-sm shrink-0`}>
                                        <Icon size={22} className="text-white" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-black text-zinc-900 text-sm truncate">{item.name}</h4>
                                        <p className="text-[10px] text-zinc-400 font-bold truncate">{item.description}</p>
                                    </div>
                                    <button
                                        onClick={() => handleUseConsumable(item)}
                                        disabled={processing || active}
                                        className={`
                                            shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all
                                            ${active
                                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                : "bg-zinc-900 text-white hover:bg-zinc-700"}
                                        `}
                                    >
                                        {processing && <Loader2 size={11} className="animate-spin" />}
                                        {active ? "Active" : "Use"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <EmptyState label="Out of Power-ups" sub="Visit the shop for Streak Shields, XP Boosters, and more." />
                )}
            </section>

            {/* ── Cosmetics & Titles ── */}
            <section>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-zinc-900 tracking-tight">Cosmetics & Titles</h2>
                    <span className="text-xs font-black uppercase tracking-wider text-zinc-500 bg-zinc-100 px-3 py-1.5 rounded-full">
                        {ownedCosmetics.length} owned
                    </span>
                </div>
                {ownedCosmetics.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                        {ownedCosmetics.map(item => {
                            const Icon = item.icon;
                            const isEquipped = item.category === "title"
                                ? equippedTitle === item.id
                                : equippedRing === item.id;
                            const processing = processingId === item.id;

                            return (
                                <div
                                    key={item.id}
                                    className={`
                                        bg-white border rounded-2xl p-4 flex items-center gap-4 transition-all duration-200
                                        ${isEquipped ? "border-zinc-900 shadow-md" : "border-zinc-100 hover:border-zinc-300 hover:shadow-sm"}
                                    `}
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-sm shrink-0`}>
                                        <Icon size={22} className="text-white" strokeWidth={1.5} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-black text-zinc-900 text-sm truncate">{item.name}</h4>
                                            {isEquipped && (
                                                <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-zinc-900 text-[#D4F268] px-2 py-0.5 rounded-full">
                                                    <Zap size={9} className="fill-[#D4F268]" /> Equipped
                                                </span>
                                            )}
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                            {item.category} · {item.rarity}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleEquip(item)}
                                        disabled={processing}
                                        className={`
                                            shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all
                                            ${isEquipped
                                                ? "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
                                                : "bg-zinc-900 text-white hover:bg-zinc-700"}
                                        `}
                                    >
                                        {processing ? (
                                            <Loader2 size={11} className="animate-spin" />
                                        ) : isEquipped ? (
                                            <Check size={11} />
                                        ) : null}
                                        {isEquipped ? "Unequip" : "Equip"}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <EmptyState label="No cosmetics" sub="Stand out with exclusive avatar rings and profile titles." />
                )}
            </section>
        </div>
    );
}
