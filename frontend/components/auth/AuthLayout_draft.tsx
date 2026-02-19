"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/components/ui/Button";

interface AuthLayoutProps {
    children: React.ReactNode; // Will contain the forms
}

export default function AuthLayout({ children }: AuthLayoutProps) {
    const [isSignUp, setIsSignUp] = useState(false);

    // Provide context or props to children?
    // Actually, maybe better to put the forms directly here or pass state down.
    // For simplicity, let's expose specific slots or just manage state here.

    // Better pattern: Clone children and pass props, or context.
    // Simplifying: Let's export the state hook or component parts.

    return (
        <div className="min-h-screen w-full flex items-center justify-center bg-[#f0f0f0] pattern-grid-lg overflow-hidden relative">

            {/* Main Container */}
            <div className="relative bg-white rounded-[2rem] shadow-2xl overflow-hidden w-full max-w-[1000px] min-h-[600px] flex">

                {/* Sign In Form Container (Left Side) */}
                <div className={cn(
                    "absolute top-0 h-full transition-all duration-700 ease-in-out w-1/2 left-0 flex flex-col items-center justify-center p-12 z-20",
                    isSignUp ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100"
                )}>
                    {/* Used for Sign In Form Content */}
                    <slot name="signin" />
                </div>

                {/* Sign Up Form Container (Right Side - initially overlaid or hidden) */}
                <div className={cn(
                    "absolute top-0 h-full transition-all duration-700 ease-in-out w-1/2 left-0 flex flex-col items-center justify-center p-12 z-10",
                    isSignUp ? "translate-x-full opacity-100 z-30" : "opacity-0 z-10"
                    // Wait, standard sliding logic:
                    // Sign Up is usually on the Right.
                )}>
                    {/* This layout logic is tricky for "One Overlay, Two Forms". Let's stick to the "Overlay Moves" pattern. */}
                </div>

            </div>
        </div>
    )
}
