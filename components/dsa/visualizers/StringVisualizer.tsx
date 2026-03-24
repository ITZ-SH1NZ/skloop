"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface StringVisualizerProps {
    algorithmId: string;
    isPlaying: boolean;
    speed: number;
    onSimulationComplete?: () => void;
    isThumbnail?: boolean;
}

export function StringVisualizer({ algorithmId, isPlaying, speed, onSimulationComplete, isThumbnail }: StringVisualizerProps) {
    const [operation, setOperation] = useState<string>("");
    const [textChars, setTextChars] = useState<string[]>([]);
    const [patternChars, setPatternChars] = useState<string[]>([]);
    const [textHighlight, setTextHighlight] = useState<number[]>([]);
    const [patHighlight, setPatHighlight] = useState<number[]>([]);
    const [matchIndices, setMatchIndices] = useState<number[]>([]);
    const [windowStart, setWindowStart] = useState<number>(-1);
    const [phase, setPhase] = useState<string>("");

    const isPlayingRef = useRef(isPlaying);
    const speedRef = useRef(speed);
    const isSortingRef = useRef(false);
    const isMounted = useRef(false);

    const TEXT    = isThumbnail ? "AABAAC" : "AABAACAADAAB";
    const PATTERN = isThumbnail ? "ABA"    : "AABA";

    useEffect(() => {
        isMounted.current = true;
        reset();
        return () => { isMounted.current = false; };
    }, [algorithmId]);

    useEffect(() => { isPlayingRef.current = isPlaying; speedRef.current = speed; }, [isPlaying, speed]);
    useEffect(() => {
        if (isPlaying) { isSortingRef.current = true; runSimulation(); }
        else { isSortingRef.current = false; }
    }, [isPlaying]);

    const reset = () => {
        setTextChars(TEXT.split(''));
        setPatternChars(PATTERN.split(''));
        setTextHighlight([]);
        setPatHighlight([]);
        setMatchIndices([]);
        setWindowStart(-1);
        setOperation("");
        setPhase("");
    };

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    const getDelay = () => isThumbnail ? 350 : Math.max(250, 1300 - speedRef.current * 11);
    const checkStop = () => !isSortingRef.current || !isMounted.current;

    const runSimulation = async () => {
        reset();
        await sleep(300);
        if (algorithmId === 'kmp-algorithm' || algorithmId === 'kmp') {
            await runKMP();
        } else if (algorithmId === 'rabin-karp') {
            await runRabinKarp();
        } else {
            await runNaive();
        }
        if (isThumbnail && isMounted.current && isPlayingRef.current) {
            await sleep(2000);
            reset();
            isSortingRef.current = true;
            runSimulation();
        }
    };

    const buildLPS = (pat: string): number[] => {
        const lps = Array(pat.length).fill(0);
        let j = 0;
        for (let i = 1; i < pat.length; i++) {
            while (j > 0 && pat[i] !== pat[j]) j = lps[j-1];
            if (pat[i] === pat[j]) j++;
            lps[i] = j;
        }
        return lps;
    };

    const runKMP = async () => {
        setPhase("KMP: Building LPS array");
        const lps = buildLPS(PATTERN);

        // Show LPS phase
        setOperation(`LPS: [${lps.join(', ')}]`);
        await sleep(getDelay());

        setPhase("KMP: Matching");
        const found: number[] = [];
        let i = 0, j = 0;

        while (i < TEXT.length) {
            if (checkStop()) return;
            setWindowStart(i - j);
            setTextHighlight([i]);
            setPatHighlight([j]);
            setOperation(`Comparing T[${i}]='${TEXT[i]}' with P[${j}]='${PATTERN[j]}'`);
            await sleep(getDelay());

            if (TEXT[i] === PATTERN[j]) {
                i++; j++;
                if (j === PATTERN.length) {
                    const start = i - j;
                    found.push(...Array.from({length: PATTERN.length}, (_,k) => start+k));
                    setMatchIndices([...found]);
                    setOperation(`✓ Match at index ${start}!`);
                    await sleep(getDelay() * 1.5);
                    j = lps[j-1];
                }
            } else {
                setOperation(`Mismatch → jump using LPS[${j-1}] = ${j > 0 ? lps[j-1] : 0}`);
                await sleep(getDelay());
                j = j > 0 ? lps[j-1] : 0;
                if (j === 0) i++;
            }
        }

        setTextHighlight([]);
        setPatHighlight([]);
        setWindowStart(-1);
        setOperation(found.length > 0 ? `Pattern found at ${found[0] / 1 | 0} matches` : "Pattern not found");
        if (onSimulationComplete) onSimulationComplete();
    };

    const runRabinKarp = async () => {
        setPhase("Rabin-Karp: Rolling Hash");
        const n = TEXT.length, m = PATTERN.length;
        const d = 256, q = 101;
        let ph = 0, th = 0, h = 1;
        const found: number[] = [];

        for (let i = 0; i < m-1; i++) h = (h * d) % q;
        for (let i = 0; i < m; i++) {
            ph = (d * ph + PATTERN.charCodeAt(i)) % q;
            th = (d * th + TEXT.charCodeAt(i)) % q;
        }
        setOperation(`Pattern hash: ${ph}`);
        await sleep(getDelay());

        for (let i = 0; i <= n - m; i++) {
            if (checkStop()) return;
            setWindowStart(i);
            setTextHighlight(Array.from({length: m}, (_,k) => i+k));
            setOperation(`Window [${i}..${i+m-1}] hash=${th} ${th === ph ? '== pattern hash!' : '≠ pattern hash'}`);
            await sleep(getDelay());

            if (ph === th) {
                // Verify character by character
                let match = true;
                for (let j = 0; j < m; j++) {
                    setPatHighlight([j]);
                    if (TEXT[i+j] !== PATTERN[j]) { match = false; break; }
                }
                if (match) {
                    const f = Array.from({length: m}, (_,k) => i+k);
                    found.push(...f);
                    setMatchIndices([...found]);
                    setOperation(`✓ Match at ${i}!`);
                    await sleep(getDelay() * 1.5);
                }
            }

            if (i < n - m) {
                th = (d * (th - TEXT.charCodeAt(i) * h) + TEXT.charCodeAt(i + m)) % q;
                if (th < 0) th += q;
            }
        }

        setTextHighlight([]);
        setPatHighlight([]);
        setWindowStart(-1);
        setOperation(found.length > 0 ? `Found ${found.length / m} match(es)` : "Pattern not found");
        if (onSimulationComplete) onSimulationComplete();
    };

    const runNaive = async () => {
        setPhase("Naive String Matching");
        const found: number[] = [];
        for (let i = 0; i <= TEXT.length - PATTERN.length; i++) {
            if (checkStop()) return;
            setWindowStart(i);
            setTextHighlight(Array.from({length: PATTERN.length}, (_,k) => i+k));
            setOperation(`Checking prefix at index ${i}...`);
            await sleep(getDelay() / 2);

            let match = true;
            for (let j = 0; j < PATTERN.length; j++) {
                if (checkStop()) return;
                setPatHighlight([j]);
                if (TEXT[i+j] !== PATTERN[j]) { match = false; break; }
            }
            if (match) {
                found.push(...Array.from({length: PATTERN.length}, (_,k) => i+k));
                setMatchIndices([...found]);
                setOperation(`✓ Match at ${i}!`);
                await sleep(getDelay());
            }
        }
        setTextHighlight([]);
        setWindowStart(-1);
        setOperation(`Done. ${found.length > 0 ? 'Pattern found!' : 'No match.'}`);
        if (onSimulationComplete) onSimulationComplete();
    };

    return (
        <div className={cn("w-full h-full flex flex-col items-center justify-center gap-4", isThumbnail ? "p-2" : "p-8")}>
            {!isThumbnail && phase && (
                <div className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">{phase}</div>
            )}

            {/* Text string */}
            <div className="flex flex-col items-center gap-2 w-full">
                <span className={cn("font-bold text-zinc-400 uppercase tracking-wider", isThumbnail ? "text-[9px]" : "text-xs")}>Text</span>
                <div className="flex flex-wrap justify-center gap-0.5">
                    {textChars.map((ch, i) => {
                        const isMatch = matchIndices.includes(i);
                        const isActive = textHighlight.includes(i);
                        return (
                            <motion.div
                                key={i}
                                layout
                                animate={isActive ? { scale: 1.15, y: -3 } : { scale: 1, y: 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                className={cn(
                                    "flex items-center justify-center rounded font-mono font-bold border",
                                    isThumbnail ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-sm",
                                    isActive && !isMatch && "bg-blue-400 border-blue-400 text-white shadow-md",
                                    isMatch && "bg-primary border-primary text-black",
                                    !isActive && !isMatch && "bg-zinc-50 border-zinc-200 text-zinc-600"
                                )}
                            >
                                {ch}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {/* Pattern */}
            <div className="flex flex-col items-center gap-2">
                <span className={cn("font-bold text-zinc-400 uppercase tracking-wider", isThumbnail ? "text-[9px]" : "text-xs")}>Pattern</span>
                <div className={cn("flex gap-0.5", windowStart >= 0 ? `ml-[calc(${windowStart}*(${isThumbnail ? 26 : 34}px))]` : '')}>
                    {patternChars.map((ch, i) => {
                        const isActive = patHighlight.includes(i);
                        return (
                            <motion.div
                                key={i}
                                layout
                                animate={isActive ? { scale: 1.15, y: -3 } : { scale: 1, y: 0 }}
                                className={cn(
                                    "flex items-center justify-center rounded font-mono font-bold border",
                                    isThumbnail ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-sm",
                                    isActive ? "bg-orange-400 border-orange-400 text-white shadow-md" : "bg-violet-50 border-violet-300 text-violet-700"
                                )}
                            >
                                {ch}
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            {!isThumbnail && operation && (
                <motion.div
                    key={operation}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white px-5 py-2 rounded-full shadow-sm border border-zinc-200 font-mono text-sm font-bold text-zinc-700 max-w-xl text-center"
                >
                    {operation}
                </motion.div>
            )}

            {!isThumbnail && (
                <div className="flex gap-6 mt-2">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-400"/><span className="text-xs text-zinc-400">Active window</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary"/><span className="text-xs text-zinc-400">Match found</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-orange-400"/><span className="text-xs text-zinc-400">Pattern char</span></div>
                </div>
            )}
        </div>
    );
}
