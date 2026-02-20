"use client";

import { motion } from "framer-motion";
import { BarChart, ShoppingBag, Package } from "lucide-react";

export function StatsTab() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-zinc-900 text-white p-8 rounded-[2.5rem] md:col-span-2 min-h-[300px] flex flex-col justify-center items-center text-center"
            >
                <BarChart size={64} className="text-zinc-700 mb-6" />
                <h2 className="scroll-m-20 text-3xl font-extrabold tracking-tight lg:text-4xl">
                    Analytics Dashboard
                </h2>
                <p className="leading-7 [&:not(:first-child)]:mt-6 text-zinc-400 max-w-md">
                    Detailed breakdowns of your learning velocity, mentorship impact, and reputation growth are coming soon.
                </p>
            </motion.div>
        </div>
    );
}

export function MarketplaceTab() {
    return (
        <div className="space-y-6">
            <div className="bg-[#f0f0f0] p-8 rounded-[2.5rem] border border-gray-200 text-center">
                <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-2xl font-black text-gray-800">Your Inventory</h3>
                <p className="text-gray-500 mt-2">You haven&apos;t listed any items yet.</p>
            </div>

            <h3 className="font-black text-xl px-2">Watchlist</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-white p-4 rounded-[2rem] border border-gray-100 aspect-square flex flex-col items-center justify-center gap-2 hover:border-black transition-colors cursor-pointer">
                        <Package size={24} className="text-gray-300" />
                        <span className="font-bold text-sm text-gray-400">Box Item {i}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
