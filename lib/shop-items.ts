import { Shield, Crown, Zap, Circle, Diamond, CreditCard, GitBranch } from "lucide-react";

export type ShopItemCategory = "cosmetic" | "consumable" | "title" | "card";

export interface ShopItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: ShopItemCategory;
    rarity: "common" | "rare" | "epic" | "legendary";
    icon: any; // Lucide icon component
    icon_name?: string; // Column from Supabase
    imageUrl?: string;
    gradient: string; // Tailwind gradient for card bg
    accentColor: string; // for border/glow
    visualData?: {
        colorClass: string;
        badgeColorClass: string;
        badgeTextColorClass?: string;
        secondaryColorClass?: string;
    };
}

export const SHOP_ITEMS: ShopItem[] = [
    // Consumables
    {
        id: "item_streak_shield",
        name: "Streak Shield",
        description: "Protects your daily streak automatically if you miss a day. Consumed on use.",
        price: 50,
        category: "consumable",
        rarity: "rare",
        icon: Shield,
        gradient: "from-blue-600 via-indigo-700 to-blue-900",
        accentColor: "#6366f1",
    },

    // Titles
    {
        id: "title_pixel_pusher",
        name: "Pixel Pusher",
        description: "For those who obsessed over 1px paddings. Displayed on your profile.",
        price: 150,
        category: "title",
        rarity: "rare",
        icon: Zap,
        gradient: "from-rose-500 via-pink-600 to-rose-900",
        accentColor: "#f43f5e",
    },
    {
        id: "title_algo_lord",
        name: "Algo Lord",
        description: "A prestigious rank. O(1) in the streets, legendary in the loop.",
        price: 500,
        category: "title",
        rarity: "legendary",
        icon: Crown,
        gradient: "from-amber-400 via-yellow-600 to-amber-900",
        accentColor: "#f59e0b",
    },

    // Rings (Cosmetics)
    {
        id: "ring_obsidian",
        name: "Obsidian Ring",
        description: "A sleek dark ring for your avatar level indicator. Radiates power.",
        price: 300,
        category: "cosmetic",
        rarity: "epic",
        icon: Circle,
        gradient: "from-zinc-700 via-zinc-800 to-black",
        accentColor: "#a1a1aa",
        visualData: {
            colorClass: "text-zinc-800",
            badgeColorClass: "bg-zinc-800",
            badgeTextColorClass: "text-white"
        },
    },
    {
        id: "ring_neon",
        name: "Neon Loop",
        description: "A vibrant cyan ring for your avatar. Pulsing glow effect while browsing.",
        price: 250,
        category: "cosmetic",
        rarity: "epic",
        icon: Circle,
        gradient: "from-cyan-500 via-sky-600 to-blue-800",
        accentColor: "#06b6d4",
        visualData: { colorClass: "text-cyan-400", badgeColorClass: "bg-cyan-500" },
    },

    // Trading Cards
    {
        id: "card_flexbox",
        name: "Flexbox Master",
        description: "A holographic collectible card honoring CSS Flexbox mastery. Features refraction effects.",
        price: 800,
        category: "card",
        rarity: "legendary",
        icon: CreditCard,
        imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2000&auto=format&fit=crop",
        gradient: "from-emerald-400 via-teal-600 to-green-900",
        accentColor: "#10b981",
    },
    {
        id: "card_binary_tree",
        name: "Inverted Binary Tree",
        description: "A cursed artifact. The original trading card of algorithm mastery.",
        price: 600,
        category: "card",
        rarity: "epic",
        icon: GitBranch,
        imageUrl: "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2000&auto=format&fit=crop",
        gradient: "from-purple-600 via-violet-700 to-indigo-900",
        accentColor: "#8b5cf6",
    }
];
