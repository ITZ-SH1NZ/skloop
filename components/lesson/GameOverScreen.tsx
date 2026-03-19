import { motion } from "framer-motion";
import { LoopyMascot } from "@/components/loopy/LoopyMascot";
import { useEffect } from "react";
import { soundManager } from "@/lib/sound";

interface GameOverScreenProps {
    onRetry?: () => void;
}

export function GameOverScreen({ onRetry }: GameOverScreenProps) {
    useEffect(() => {
        soundManager.playGameOver();
    }, []);

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-zinc-950 p-6 md:p-8"
        >
            {/* Intense Red Flash Effect */}
            <motion.div 
                initial={{ opacity: 0.8 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="absolute inset-0 bg-red-600 pointer-events-none"
            />

            <motion.div 
                animate={{ x: [-15, 15, -10, 10, -5, 5, 0], y: [10, -10, 8, -8, 4, -4, 0] }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center gap-6 w-full max-w-md text-center"
            >
                <motion.div
                    initial={{ scale: 0, y: -100 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                >
                    <motion.div
                        animate={{ x: [-4, 4, -4] }}
                        transition={{ duration: 0.1, repeat: Infinity, ease: "linear" }}
                    >
                        <LoopyMascot size={220} mood="screaming" isStatic={true} />
                    </motion.div>
                </motion.div>
                
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mt-4 drop-shadow-lg">GAME OVER</h2>
                <p className="text-zinc-400 text-lg font-medium">You ran out of hearts. Dust yourself off.</p>
                
                <div className="flex flex-col w-full mt-8 gap-4">
                    <button 
                        onClick={onRetry} 
                        className="w-full bg-red-500 text-white font-black px-8 py-5 rounded-2xl text-lg hover:brightness-110 active:translate-y-1 active:border-b-0 uppercase tracking-widest shadow-xl border-b-4 border-red-700 transition-all"
                    >
                        Try Again
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
}
