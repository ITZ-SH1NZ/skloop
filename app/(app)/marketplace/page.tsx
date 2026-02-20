"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Search, Filter, Star, ArrowRightLeft } from "lucide-react";
import { motion } from "framer-motion";

// TODO: Fetch listings from backend
const MOCK_LISTINGS: any[] = [];

const CATEGORIES = ["All", "Coding", "Design", "Language", "Creative", "Lifestyle", "Business"];

export default function MarketplacePage() {
    const [selectedCategory, setSelectedCategory] = useState("All");

    const filteredListings =
        selectedCategory === "All"
            ? MOCK_LISTINGS
            : MOCK_LISTINGS.filter((item) => item.category === selectedCategory);

    return (
        <div className="container mx-auto p-4 md:p-6 xl:p-8">
            {/* Header & Search */}
            <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold">Skill Marketplace</h1>
                    <p className="text-muted">Discover people willing to trade their skills.</p>
                </div>
                <div className="flex gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                        <input
                            type="text"
                            placeholder="Search skills..."
                            className="h-10 rounded-full border border-white/10 bg-surface pl-10 pr-4 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                        />
                    </div>
                    <Button variant="outline" size="md">
                        <Filter className="mr-2 h-4 w-4" />
                        Filter
                    </Button>
                </div>
            </div>

            {/* Categories */}
            <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${selectedCategory === cat
                            ? "bg-white text-black"
                            : "bg-surface text-muted hover:bg-surface/80 hover:text-foreground"
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredListings.length > 0 ? (
                    filteredListings.map((listing, index) => (
                        <motion.div
                            key={listing.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card className="group relative h-full overflow-hidden border-white/5 bg-surface/40 hover:border-primary/50">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <Avatar fallback={listing.avatar} />
                                        <div>
                                            <div className="font-semibold">{listing.user}</div>
                                            <div className="flex items-center text-xs text-muted">
                                                <Star className="mr-1 h-3 w-3 fill-yellow-500 text-yellow-500" />
                                                {listing.rating}
                                            </div>
                                        </div>
                                    </div>
                                    <Badge variant="outline">{listing.category}</Badge>
                                </div>

                                <div className="mt-6 space-y-4">
                                    <div className="rounded-lg bg-background/50 p-3">
                                        <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1">Teaches</div>
                                        <div className="font-medium">{listing.offer}</div>
                                        <div className="text-xs text-muted mt-1">{listing.level}</div>
                                    </div>

                                    <div className="flex justify-center">
                                        <ArrowRightLeft className="h-4 w-4 text-muted/50" />
                                    </div>

                                    <div className="rounded-lg bg-background/50 p-3">
                                        <div className="text-xs font-bold text-secondary uppercase tracking-wider mb-1">Wants to Learn</div>
                                        <div className="font-medium text-muted-foreground">{listing.want}</div>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <Button className="w-full" variant="secondary">Request Loop</Button>
                                </div>
                            </Card>
                        </motion.div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-20">
                        <div className="bg-surface w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/10">
                            <Search className="text-muted" size={32} />
                        </div>
                        <h3 className="text-lg font-bold">No listings found</h3>
                        <p className="text-muted">Try adjusting your filters or search terms.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
