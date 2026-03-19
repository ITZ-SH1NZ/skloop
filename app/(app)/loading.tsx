"use client";

import { motion } from "framer-motion";

export default function Loading() {
    return (
        <div className="flex-1 flex flex-col p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
            {/* Header Skeleton */}
            <div className="flex justify-between items-center">
                <div className="space-y-2">
                    <div className="h-10 w-48 bg-gray-100 rounded-2xl" />
                    <div className="h-4 w-32 bg-gray-50 rounded-lg" />
                </div>
                <div className="h-12 w-12 bg-gray-100 rounded-full" />
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-[2.5rem] p-6 border border-gray-50 space-y-4 shadow-sm">
                        <div className="flex gap-4 items-center">
                            <div className="h-12 w-12 bg-gray-100 rounded-2xl" />
                            <div className="space-y-2 flex-1">
                                <div className="h-4 w-3/4 bg-gray-100 rounded-lg" />
                                <div className="h-3 w-1/2 bg-gray-50 rounded-lg" />
                            </div>
                        </div>
                        <div className="h-32 w-full bg-gray-50 rounded-2xl mt-4" />
                    </div>
                ))}
            </div>
        </div>
    );
}
