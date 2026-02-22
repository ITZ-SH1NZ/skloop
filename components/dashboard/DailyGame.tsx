"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, RefreshCw, Trophy, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import DailyCodeleShare from "@/components/practice/DailyCodeleShare";
import confetti from "canvas-confetti";
import { useAutoScroll } from "@/hooks/use-auto-scroll";
import { useUser } from "@/context/UserContext";
import { createClient } from "@/utils/supabase/client";

const WORDS = ["REACT", "STACK", "QUEUE", "ASYNC", "CONST", "AWAIT", "FETCH", "BUILD", "DEBUG", "LOGIC"];

// Valid word list for guesses (expanded list of coding terms)
const VALID_WORDS = [
    ...WORDS,
    "ARRAY", "CLASS", "ERROR", "FLOAT", "FRAME", "INDEX", "INPUT", "JWTOK", "KEYOF",
    "LOOPS", "TIMER", "MERGE", "NODES", "OUTER", "PARSE", "QUERY", "ROUTE", "STATE",
    "TABLE", "UNION", "VALID", "WATCH", "YIELD", "CACHE", "TOKEN", "HOOKS", "PROPS",
    "MODEL", "CLONE", "SCOPE", "BYTES", "MUTEX", "REDIS", "NGINX", "PATCH", "CLOSE",
    "ABORT", "BLOCK", "BREAK", "CATCH", "CHAIN", "CHECK", "CLEAN", "CODEC", "COUNT"
];

export default function DailyGame({ isOpen, onClose, inline = false }: { isOpen: boolean; onClose: () => void; inline?: boolean }) {
    const { user } = useUser();
    const [solution, setSolution] = useState("");
    const [guesses, setGuesses] = useState<string[]>(Array(6).fill(""));
    const [currentGuess, setCurrentGuess] = useState("");
    const [currentRow, setCurrentRow] = useState(0);
    const [gameState, setGameState] = useState<"playing" | "won" | "lost">("playing");
    const [shakeRow, setShakeRow] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [letterStatuses, setLetterStatuses] = useState<Record<string, "correct" | "present" | "absent">>({});

    const [puzzleId, setPuzzleId] = useState<string | null>(null);

    useEffect(() => {
        const fetchDailyPuzzle = async () => {
            const supabase = createClient();

            // Get today's date in YYYY-MM-DD
            const today = new Date().toISOString().split('T')[0];

            const { data: puzzle, error: puzzleError } = await supabase
                .from('daily_puzzles')
                .select('id, word')
                .eq('puzzle_date', today)
                .single();

            if (puzzle && !puzzleError) {
                setSolution(puzzle.word.toUpperCase());
                setPuzzleId(puzzle.id);

                // Also check if user has already played today
                if (user) {
                    const { data: attempt } = await supabase
                        .from('user_puzzle_attempts')
                        .select('status, attempts, last_guess')
                        .eq('user_id', user.id)
                        .eq('puzzle_id', puzzle.id)
                        .single();

                    if (attempt && attempt.status !== 'playing') {
                        setGameState(attempt.status as "won" | "lost");
                        // We don't have full guess history in schema, so we just show the game is over
                    }
                }
            } else {
                setSolution("BUILD"); // Fallback
            }
        };
        fetchDailyPuzzle();
    }, [user]);

    useEffect(() => {
        if (!isOpen && !inline) return;

        const handleKey = (e: KeyboardEvent) => {
            if (gameState !== "playing") return;

            if (e.key === "Enter") {
                if (currentGuess.length !== 5) {
                    setShakeRow(true);
                    setTimeout(() => setShakeRow(false), 500);
                    return;
                }
                submitGuess();
            } else if (e.key === "Backspace") {
                setCurrentGuess((prev) => prev.slice(0, -1));
            } else if (/^[a-zA-Z]$/.test(e.key)) {
                if (currentGuess.length < 5) {
                    setCurrentGuess((prev) => (prev + e.key).toUpperCase());
                }
            }
        };

        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [isOpen, currentGuess, gameState, inline]);

    const submitGuess = () => {
        // Validate word is in the valid word list
        if (!VALID_WORDS.includes(currentGuess)) {
            setErrorMessage(`"${currentGuess}" is not part of the word list`);
            setShakeRow(true);
            setTimeout(() => {
                setShakeRow(false);
                setErrorMessage("");
            }, 2000);
            return;
        }

        const newGuesses = [...guesses];
        newGuesses[currentRow] = currentGuess;
        setGuesses(newGuesses);

        // Update letter statuses for keyboard
        const newStatuses = { ...letterStatuses };
        for (let i = 0; i < currentGuess.length; i++) {
            const letter = currentGuess[i];
            if (solution[i] === letter) {
                newStatuses[letter] = "correct";
            } else if (solution.includes(letter) && newStatuses[letter] !== "correct") {
                newStatuses[letter] = "present";
            } else if (!solution.includes(letter)) {
                newStatuses[letter] = "absent";
            }
        }
        setLetterStatuses(newStatuses);

        const checkGameEnd = async (status: "won" | "lost", finalAttempts: number, finalGuess: string) => {
            const { createClient } = await import('@/utils/supabase/client');
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (user && puzzleId) {
                // Upsert attempt
                await supabase.from('user_puzzle_attempts').upsert({
                    user_id: user.id,
                    puzzle_id: puzzleId,
                    attempts: finalAttempts,
                    status: status,
                    last_guess: finalGuess
                });

                if (status === "won") {
                    // Update XP and Coins (Streak is handled centrally by UserContext daily login/activity)
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('xp, coins')
                        .eq('id', user.id)
                        .single();

                    if (profile) {
                        await supabase.from('profiles').update({
                            xp: (profile.xp || 0) + 50,
                            coins: (profile.coins || 0) + 10
                        }).eq('id', user.id);
                    }
                }
            }
        };

        if (currentGuess === solution) {
            setGameState("won");
            checkGameEnd("won", currentRow + 1, currentGuess);
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#D4F268", "#1A1A1A", "#FFFFFF"]
            });
        } else if (currentRow === 5) {
            setGameState("lost");
            checkGameEnd("lost", 6, currentGuess);
        } else {
            setCurrentRow((prev) => prev + 1);
            setCurrentGuess("");
        }
    };

    // Handler for on-screen keyboard clicks
    const handleKeyClick = (key: string) => {
        if (gameState !== "playing") return;

        if (key === "ENTER") {
            if (currentGuess.length !== 5) {
                setShakeRow(true);
                setTimeout(() => setShakeRow(false), 500);
                return;
            }
            submitGuess();
        } else if (key === "←") {
            setCurrentGuess((prev) => prev.slice(0, -1));
        } else {
            if (currentGuess.length < 5) {
                setCurrentGuess((prev) => prev + key);
            }
        }
    };

    // Auto-scroll to result when game ends
    const resultRef = useAutoScroll<HTMLDivElement>({
        trigger: gameState !== "playing" ? gameState : undefined,
        offset: -50
    });

    if (!isOpen && !inline) return null;

    const Container = inline ? motion.div : motion.div;
    const Wrapper = inline ? "div" : "div";

    // For inline mode, we don't want the fixed overlay.
    // We treat the inner content as the main thing.

    const content = (
        <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            className={`
                p-8 w-full max-w-lg overflow-hidden relative
                ${inline ? "bg-white border text-center rounded-[2.5rem] shadow-xl shadow-slate-200/60" : "bg-white rounded-3xl shadow-2xl"}
            `}
            onClick={(e) => e.stopPropagation()}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-8">
                <div className={`px-4 py-2 rounded-full font-black text-xs uppercase tracking-[0.2em] ${inline ? "bg-zinc-100 text-zinc-500" : "bg-black text-white"}`}>
                    Codele
                </div>
                {!inline && (
                    <button onClick={onClose} className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Game Grid */}
            <div className="flex flex-col gap-3 mb-8 items-center">
                {guesses.map((guess, i) => (
                    <motion.div
                        key={i}
                        animate={shakeRow && i === currentRow ? { x: [-5, 5, -5, 5, 0] } : {}}
                        className="grid grid-cols-5 gap-3"
                    >
                        {Array(5).fill(0).map((_, j) => {
                            const letter = (i === currentRow ? currentGuess[j] : guess[j]) || "";
                            let status = "default";

                            if (i < currentRow) {
                                if (letter === solution[j]) status = "correct";
                                else if (solution.includes(letter)) status = "present";
                                else status = "absent";
                            }

                            return (
                                <motion.div
                                    key={j}
                                    initial={i < currentRow ? { rotateY: 0 } : {}}
                                    animate={i < currentRow ? {
                                        rotateY: [0, 90, 0],
                                    } : {}}
                                    transition={{
                                        duration: 0.6,
                                        delay: i < currentRow ? j * 0.1 : 0,
                                        times: [0, 0.5, 1]
                                    }}
                                    className={`
                                        w-12 h-12 md:w-14 md:h-14 flex items-center justify-center text-2xl font-black rounded-2xl border-2 transition-colors
                                        ${status === "default" && i === currentRow && letter ? "animate-pop border-zinc-400 text-zinc-900 bg-white shadow-lg" : ""}
                                        ${status === "default" && i !== currentRow ? "border-zinc-100 text-zinc-900 bg-zinc-50/50" : ""}
                                        
                                        ${status === "correct" ? "bg-lime-500 border-lime-500 text-zinc-900 shadow-md shadow-lime-200" : ""}
                                        ${status === "present" ? "bg-amber-400 border-amber-400 text-white shadow-md shadow-amber-200" : ""}
                                        ${status === "absent" ? "bg-zinc-100 border-zinc-100 text-zinc-400" : ""}
                                    `}
                                    style={{
                                        transformStyle: 'preserve-3d',
                                    }}
                                >
                                    {letter}
                                </motion.div>
                            );
                        })}
                    </motion.div>
                ))}
            </div>

            {/* Keyboard Help / Result */}
            {gameState !== "playing" ? (
                <div ref={resultRef} className="text-center space-y-6 animate-fade-in-up">
                    {gameState === "won" ? (
                        <div className={`p-6 rounded-3xl flex flex-col items-center ${inline ? "bg-lime-50 text-lime-900" : "bg-lime-50 text-lime-900"}`}>
                            <Trophy size={48} className={`mb-3 ${inline ? "text-lime-600" : "text-lime-600"}`} />
                            <h3 className="text-3xl font-black mb-1">Solved!</h3>
                            <p className="font-medium opacity-80">Streak extended +1 🔥</p>
                        </div>
                    ) : (
                        <div className={`p-6 rounded-3xl flex flex-col items-center ${inline ? "bg-rose-50 text-rose-800" : "bg-rose-50 text-rose-800"}`}>
                            <AlertCircle size={48} className={`mb-3 ${inline ? "text-rose-500" : "text-rose-600"}`} />
                            <h3 className="text-3xl font-black mb-1">Missed it.</h3>
                            <p className="font-medium opacity-80">Word was: <span className="font-mono font-bold">{solution}</span></p>
                        </div>
                    )}

                    {/* Share Component */}
                    <div className="max-w-md mx-auto">
                        <DailyCodeleShare
                            guesses={guesses.filter(g => g !== "")}
                            solution={solution}
                            won={gameState === "won"}
                            attempts={guesses.filter(g => g !== "").length}
                        />
                    </div>

                    <Button
                        onClick={() => {
                            setGuesses(Array(6).fill(""));
                            setCurrentGuess("");
                            setCurrentRow(0);
                            setGameState("playing");
                            setLetterStatuses({});
                            setSolution(WORDS[Math.floor(Math.random() * WORDS.length)]);
                        }}
                        className={`w-full font-bold py-4 text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all ${inline ? "bg-zinc-900 text-white hover:bg-zinc-800" : "bg-black text-white hover:bg-zinc-800"}`}
                    >
                        Play Again <RefreshCw size={18} className="ml-2" />
                    </Button>
                </div>
            ) : (
                <>
                    <div className="text-center space-y-2 mb-4">
                        {errorMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className="px-4 py-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 font-bold text-sm"
                            >
                                {errorMessage}
                            </motion.div>
                        )}
                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-400">
                            Type to guess • Enter to submit
                        </div>
                    </div>

                    {/* On-Screen Keyboard */}
                    <div className="space-y-2">
                        {[
                            ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
                            ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
                            ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "←"]
                        ].map((row, rowIndex) => (
                            <div key={rowIndex} className="flex gap-1 justify-center">
                                {row.map((key) => {
                                    const status = letterStatuses[key];
                                    const isSpecial = key === "ENTER" || key === "←";

                                    return (
                                        <button
                                            key={key}
                                            onClick={() => handleKeyClick(key)}
                                            className={`
                                                ${isSpecial ? "px-2 md:px-3 text-[10px] md:text-xs" : "w-7 h-10 md:w-9 md:h-12 text-sm md:text-base"}
                                                rounded-lg font-black uppercase transition-all active:scale-95
                                                ${!status && "bg-zinc-200 text-zinc-900 hover:bg-zinc-300"}
                                                ${status === "correct" && "bg-lime-500 text-zinc-900 shadow-md"}
                                                ${status === "present" && "bg-amber-400 text-white shadow-md"}
                                                ${status === "absent" && "bg-zinc-400 text-zinc-600"}
                                            `}
                                        >
                                            {key}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </motion.div>
    );

    if (inline) {
        return <div className="flex justify-center">{content}</div>;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                onClick={onClose}
            >
                {content}
            </motion.div>
        </AnimatePresence>
    );
}
