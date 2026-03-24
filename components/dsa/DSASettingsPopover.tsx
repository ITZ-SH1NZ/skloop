"use client";

import { useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Volume2, VolumeX, Footprints } from "lucide-react";
import { cn } from "@/lib/utils";

interface DSASettingsPopoverProps {
    stepMode: boolean;
    soundOn: boolean;
    onStepModeToggle: () => void;
    onSoundToggle: () => void;
    isOpen: boolean;
    onClose: () => void;
}

const SHORTCUTS = [
    { key: "Space", action: "Play / Pause" },
    { key: "R", action: "Reset" },
    { key: "S", action: "Toggle step mode" },
    { key: "N", action: "Next step" },
    { key: "M", action: "Toggle sound" },
];

export function DSASettingsPopover({
    stepMode, soundOn, onStepModeToggle, onSoundToggle, isOpen, onClose
}: DSASettingsPopoverProps) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) onClose();
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isOpen, onClose]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={ref}
                    initial={{ opacity: 0, scale: 0.95, y: -8 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-zinc-200 shadow-xl z-50 overflow-hidden"
                >
                    <div className="p-4 border-b border-zinc-100">
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Visualizer Settings</p>
                    </div>

                    <div className="p-3 space-y-1">
                        {/* Step mode toggle */}
                        <button
                            onClick={onStepModeToggle}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left",
                                stepMode ? "bg-primary/10 text-zinc-900" : "hover:bg-zinc-50 text-zinc-700"
                            )}
                        >
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", stepMode ? "bg-primary" : "bg-zinc-100")}>
                                <Footprints className={cn("w-4 h-4", stepMode ? "text-black" : "text-zinc-500")} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold">Step-by-step mode</p>
                                <p className="text-xs text-zinc-400 truncate">{stepMode ? "Press N to advance" : "Continuous animation"}</p>
                            </div>
                            <div className={cn("w-9 h-5 rounded-full transition-colors relative", stepMode ? "bg-primary" : "bg-zinc-200")}>
                                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all", stepMode ? "left-4" : "left-0.5")} />
                            </div>
                        </button>

                        {/* Sound toggle */}
                        <button
                            onClick={onSoundToggle}
                            className={cn(
                                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left",
                                soundOn ? "bg-primary/10 text-zinc-900" : "hover:bg-zinc-50 text-zinc-700"
                            )}
                        >
                            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", soundOn ? "bg-primary" : "bg-zinc-100")}>
                                {soundOn ? <Volume2 className="w-4 h-4 text-black" /> : <VolumeX className="w-4 h-4 text-zinc-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold">Sound mode</p>
                                <p className="text-xs text-zinc-400 truncate">{soundOn ? "Audio tones enabled" : "Silent"}</p>
                            </div>
                            <div className={cn("w-9 h-5 rounded-full transition-colors relative", soundOn ? "bg-primary" : "bg-zinc-200")}>
                                <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all", soundOn ? "left-4" : "left-0.5")} />
                            </div>
                        </button>
                    </div>

                    {/* Keyboard shortcuts */}
                    <div className="p-4 border-t border-zinc-100">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Keyboard Shortcuts</p>
                        <div className="space-y-1">
                            {SHORTCUTS.map(s => (
                                <div key={s.key} className="flex items-center justify-between">
                                    <span className="text-xs text-zinc-500">{s.action}</span>
                                    <kbd className="text-[10px] font-mono font-bold bg-zinc-100 border border-zinc-200 text-zinc-700 px-1.5 py-0.5 rounded">{s.key}</kbd>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
