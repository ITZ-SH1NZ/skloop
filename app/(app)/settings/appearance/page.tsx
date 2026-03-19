"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export default function AppearanceSettingsPage() {
    const [reduceMotion, setReduceMotion] = useState(false);
    const [autoCollapse, setAutoCollapse] = useState(false);

    useEffect(() => {
        setReduceMotion(localStorage.getItem("skloop-reduce-motion") === "true");
        setAutoCollapse(localStorage.getItem("skloop-auto-collapse") === "true");
    }, []);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Appearance</h1>
                <p className="text-zinc-500 font-medium mt-1">Customise how Skloop looks and feels.</p>
            </div>

            <div className="space-y-6">
                <div className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm">
                    <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4">Sidebar</h2>
                    <ToggleRow
                        label="Auto-collapse on small screens"
                        description="Automatically collapses the sidebar on screens smaller than 1280px"
                        checked={autoCollapse}
                        onChange={(v) => {
                            setAutoCollapse(v);
                            localStorage.setItem("skloop-auto-collapse", String(v));
                        }}
                    />
                </div>

                <div className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm">
                    <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4">Accessibility</h2>
                    <ToggleRow
                        label="Reduce animations"
                        description="Minimises motion effects across the app for a calmer experience"
                        checked={reduceMotion}
                        onChange={(v) => {
                            setReduceMotion(v);
                            localStorage.setItem("skloop-reduce-motion", String(v));
                        }}
                    />
                </div>
            </div>
        </div>
    );
}

function ToggleRow({
    label,
    description,
    checked,
    onChange,
}: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) {
    return (
        <div className="flex items-center gap-4">
            <div className="flex-1">
                <p className="text-sm font-bold text-zinc-900">{label}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{description}</p>
            </div>
            <button
                onClick={() => onChange(!checked)}
                className={cn(
                    "w-12 h-7 rounded-full transition-colors relative shrink-0",
                    checked ? "bg-primary" : "bg-zinc-200"
                )}
            >
                <div className={cn(
                    "h-5 w-5 bg-white rounded-full shadow-sm absolute top-1 transition-all duration-200",
                    checked ? "left-6" : "left-1"
                )} />
            </button>
        </div>
    );
}
