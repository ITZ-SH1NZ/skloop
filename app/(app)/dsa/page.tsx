"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Search, Filter } from "lucide-react";
import { DSA_DATA, Category, Difficulty, DIFFICULTIES, CATEGORIES, difficultyColors, categoryColors } from "@/lib/dsa-data";
import { cn } from "@/lib/utils";
import { AlgorithmPreviewCard } from "@/components/dsa/AlgorithmPreviewCard";

// Color mappings imported from lib/dsa-data.ts

export default function DSALandingPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeDifficulties, setActiveDifficulties] = useState<Difficulty[]>([]);
    const [activeCategories, setActiveCategories] = useState<Category[]>([]);

    const toggleDifficulty = (diff: Difficulty | "All") => {
        if (diff === "All") return setActiveDifficulties([]);
        if (activeDifficulties.includes(diff as Difficulty)) {
            setActiveDifficulties([]);
        } else {
            setActiveDifficulties([diff as Difficulty]);
        }
    };

    const toggleCategory = (cat: Category | "All") => {
        if (cat === "All") return setActiveCategories([]);
        if (activeCategories.includes(cat as Category)) {
            setActiveCategories([]);
        } else {
            setActiveCategories([cat as Category]);
        }
    };

    // Filter logic
    const filteredData = DSA_DATA.filter((algo) => {
        const matchesSearch = algo.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                              algo.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesDifficulty = activeDifficulties.length === 0 || activeDifficulties.includes(algo.difficulty);
        const matchesCategory = activeCategories.length === 0 || activeCategories.includes(algo.category);
        
        return matchesSearch && matchesDifficulty && matchesCategory;
    });

    // Stagger animation for grid cards
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20, scale: 0.97 },
        show: { 
            opacity: 1, 
            y: 0,
            scale: 1,
            transition: { type: "spring" as const, stiffness: 300, damping: 24 }
        },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
    };

    // Stable filter key so the grid re-animates when filters change
    const filterKey = `${activeDifficulties.join('-')}__${activeCategories.join('-')}__${searchQuery}`;

    return (
        <div className="min-h-screen bg-background p-4 md:p-8 lg:p-12">
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <Link href="/dashboard" className="inline-flex items-center text-zinc-500 hover:text-zinc-900 transition-colors mb-6 group">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </Link>
                    
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-foreground mb-4">
                        DSA Reference <span className="text-primary">Library</span>
                    </h1>
                    <p className="text-lg md:text-xl text-zinc-600 max-w-2xl text-balance">
                        Interactive visualizations for data structures and algorithms. 
                        Understand the code, visualize the execution, and master the concepts.
                    </p>
                </motion.div>

                {/* Filters & Search Section */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col gap-6 mb-10 bg-surface p-6 rounded-[2rem] shadow-sm border border-zinc-100"
                >
                    {/* Top Row: Search */}
                    <div className="relative w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                        <input 
                            type="text"
                            placeholder="Search algorithms..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow text-base shadow-inner"
                        />
                    </div>

                    <div className="flex flex-col xl:flex-row gap-6 xl:items-center border-t border-zinc-100 pt-6">
                        {/* Difficulty Filters */}
                        <div className="flex flex-col gap-3 w-full xl:w-auto shrink-0">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center">
                                <Filter className="w-3 h-3 mr-1" /> Difficulty
                            </span>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    onClick={() => toggleDifficulty("All")}
                                    className={cn(
                                        "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
                                        activeDifficulties.length === 0 ? "bg-zinc-900 border-zinc-900 text-white" : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                                    )}
                                >
                                    All
                                </button>
                                {DIFFICULTIES.map(diff => (
                                    <button
                                        key={diff}
                                        onClick={() => toggleDifficulty(diff)}
                                        className={cn(
                                            "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
                                            activeDifficulties.includes(diff) 
                                                ? difficultyColors[diff] + " shadow-sm border-transparent" 
                                                : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                                        )}
                                    >
                                        {diff}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Divider */}
                        <div className="hidden xl:block w-px h-16 bg-zinc-200" />

                        {/* Category Filters */}
                        <div className="flex flex-col gap-3 w-full min-w-0">
                            <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center">
                                <Filter className="w-3 h-3 mr-1" /> Category
                            </span>
                            <div className="w-full overflow-x-auto pb-2 hide-scrollbar">
                                <div className="flex items-center gap-2 min-w-max">
                                    <button
                                        onClick={() => toggleCategory("All")}
                                        className={cn(
                                            "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
                                            activeCategories.length === 0 ? "bg-zinc-900 border-zinc-900 text-white" : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                                        )}
                                    >
                                        All Types
                                    </button>
                                    {CATEGORIES.map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => toggleCategory(cat)}
                                            className={cn(
                                                "px-4 py-1.5 rounded-full text-sm font-medium transition-all border",
                                                activeCategories.includes(cat) 
                                                    ? categoryColors[cat] + " shadow-sm border-transparent"
                                                    : "bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50"
                                            )}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Grid Section */}
                <motion.div 
                    key={filterKey}
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                >
                    <AnimatePresence mode="popLayout">
                    {filteredData.length > 0 ? (
                        filteredData.map((algo) => (
                            <motion.div key={algo.id} variants={itemVariants} layout className="h-full" exit={itemVariants.exit}>
                                <AlgorithmPreviewCard algo={algo} />
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="col-span-full py-20 text-center"
                        >
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-zinc-100 text-zinc-400 mb-4">
                                <Search className="w-8 h-8" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-2">No algorithms found</h3>
                            <p className="text-zinc-500">Try adjusting your search or filters to find what you're looking for.</p>
                            <button 
                                onClick={() => { setSearchQuery(""); setActiveDifficulties([]); setActiveCategories([]); }}
                                className="mt-6 px-6 py-2 bg-zinc-900 text-white rounded-full font-medium hover:bg-zinc-800 transition-colors"
                            >
                                Clear Filters
                            </button>
                        </motion.div>
                    )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}

// Add ArrowRight icon locally since I forgot it up top
const ArrowRight = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
    </svg>
);
