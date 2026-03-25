"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef, memo } from "react";
import { cn } from "@/lib/utils";

interface MathVisualizerProps {
    algorithmId: string;
    isPlaying: boolean;
    speed: number;
    onSimulationComplete?: () => void;
    isThumbnail?: boolean;
}

export const MathVisualizer = memo(function MathVisualizer({ algorithmId, isPlaying, speed, onSimulationComplete, isThumbnail }: MathVisualizerProps) {
    const [cells, setCells] = useState<{ value: number | string; state: 'idle' | 'active' | 'prime' | 'composite' | 'visited' }[]>([]);
    const [operation, setOperation] = useState<string>("");
    const [phase, setPhase] = useState<string>("");

    type CellState = 'idle' | 'active' | 'prime' | 'composite' | 'visited';

    const isPlayingRef = useRef(isPlaying);
    const speedRef = useRef(speed);
    const isSortingRef = useRef(false);
    const isMounted = useRef(false);

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
        setOperation("");
        setPhase("");
        setCells([]);
    };

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    const getDelay = () => isThumbnail ? 300 : Math.max(200, 1400 - speedRef.current * 12);
    const checkStop = () => !isSortingRef.current || !isMounted.current;

    const runSimulation = async () => {
        reset();
        await sleep(300);

        if (algorithmId === 'sieve-of-eratosthenes' || algorithmId === 'sieve') {
            await runSieve();
        } else if (algorithmId === 'euclidean-algorithm' || algorithmId === 'gcd') {
            await runGCD();
        } else if (algorithmId === 'fast-exponentiation' || algorithmId === 'fast-exp') {
            await runFastExp();
        } else {
            await runSieve(); // default
        }

        if (isThumbnail && isMounted.current && isPlayingRef.current) {
            await sleep(2000);
            reset();
            isSortingRef.current = true;
            runSimulation();
        }
    };

    const runSieve = async () => {
        const N = isThumbnail ? 25 : 50;
        setPhase(`Sieve of Eratosthenes (N=${N})`);
        const isPrime = Array(N + 1).fill(true);
        isPrime[0] = isPrime[1] = false;

        const initCells: { value: number; state: 'idle' | 'active' | 'prime' | 'composite' | 'visited' }[] =
            Array.from({ length: N + 1 }, (_, i) => ({ value: i, state: 'idle' as 'idle' | 'active' | 'prime' | 'composite' | 'visited' }));
        initCells[0].state = 'composite';
        initCells[1].state = 'composite';
        setCells(initCells);
        await sleep(400);

        for (let p = 2; p * p <= N; p++) {
            if (!isPrime[p]) continue;
            if (checkStop()) return;

            setOperation(`Marking multiples of ${p}...`);
            // Highlight p as prime first
            setCells(prev => prev.map((c, i) => i === p ? { ...c, state: 'active' } : c));
            await sleep(getDelay() * 0.5);

            for (let j = p * p; j <= N; j += p) {
                if (checkStop()) return;
                isPrime[j] = false;
                setCells(prev => prev.map((c, i) => i === j ? { ...c, state: 'composite' } : c));
                await sleep(getDelay() * 0.2);
            }

            // Mark p as prime
            setCells(prev => prev.map((c, i) => i === p ? { ...c, state: 'prime' } : c));
        }

        // Mark remaining primes
        for (let i = 2; i <= N; i++) {
            if (isPrime[i]) {
                setCells(prev => prev.map((c, idx) => idx === i ? { ...c, state: 'prime' } : c));
            }
        }
        const primes = Array.from({ length: N + 1 }, (_, i) => i).filter(i => isPrime[i]);
        setOperation(`Primes ≤ ${N}: ${primes.join(', ')}`);
        if (onSimulationComplete) onSimulationComplete();
    };

    const runGCD = async () => {
        let a = 48, b = 18;
        if (isThumbnail) { a = 48; b = 18; }
        setPhase(`GCD(${a}, ${b})`);

        const steps: { a: number, b: number, rem: number }[] = [];
        let ta = a, tb = b;
        while (tb !== 0) {
            steps.push({ a: ta, b: tb, rem: ta % tb });
            [ta, tb] = [tb, ta % tb];
        }

        // Show as a column of step calculations
        setCells(steps.map((s, i) => ({
            value: `${s.a} = ${Math.floor(s.a / s.b)} × ${s.b} + ${s.rem}`,
            state: i === 0 ? 'active' : 'idle'
        })));

        for (let i = 0; i < steps.length; i++) {
            if (checkStop()) return;
            const s = steps[i];
            setOperation(`GCD(${s.a}, ${s.b}) -> remainder = ${s.rem}`);
            setCells(prev => prev.map((c, idx) => ({ ...c, state: idx === i ? 'active' : idx < i ? 'visited' : 'idle' })));
            await sleep(getDelay());
        }
        setOperation(`GCD(${a}, ${b}) = ${ta}`);
        setCells(prev => prev.map((c, idx) => ({ ...c, state: 'prime' })));
        if (onSimulationComplete) onSimulationComplete();
    };

    const runFastExp = async () => {
        const base = 2, exp = isThumbnail ? 8 : 10;
        setPhase(`Fast Exp: ${base}^${exp}`);

        let result = 1, b = base, e = exp;
        const steps: { e: number, b: number, result: number, action: string }[] = [];

        while (e > 0) {
            if (e % 2 === 1) {
                steps.push({ e, b, result: result * b, action: `e is odd: result × ${b}` });
                result *= b;
            } else {
                steps.push({ e, b, result, action: `e is even: square base` });
            }
            b = b * b;
            e = Math.floor(e / 2);
        }

        setCells(steps.map((s, i) => ({ value: s.action, state: 'idle' as const })));

        for (let i = 0; i < steps.length; i++) {
            if (checkStop()) return;
            setCells(prev => prev.map((c, idx) => ({ ...c, state: idx === i ? 'active' : idx < i ? 'visited' : 'idle' })));
            setOperation(`exp=${steps[i].e}, base=${steps[i].b}, result=${steps[i].result}`);
            await sleep(getDelay());
        }
        setOperation(`${base}^${exp} = ${result}`);
        if (onSimulationComplete) onSimulationComplete();
    };

    const isSieve = algorithmId === 'sieve-of-eratosthenes' || algorithmId === 'sieve' || (!algorithmId.includes('gcd') && !algorithmId.includes('euclidean') && !algorithmId.includes('exp'));

    return (
        <div className={cn("w-full h-full flex flex-col items-center justify-center gap-4", isThumbnail ? "p-2" : "p-6")}>
            {!isThumbnail && phase && (
                <div className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">{phase}</div>
            )}

            {isSieve ? (
                <div className={cn("flex flex-wrap gap-0.5 justify-center", isThumbnail ? "gap-[2px]" : "gap-1")}>
                    {cells.filter(c => Number(c.value) >= 2).map((cell, i) => (
                        <motion.div
                            key={i}
                            layout
                            animate={cell.state === 'active' ? { scale: 1.2, y: -4 } : { scale: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                            className={cn(
                                "flex items-center justify-center rounded font-mono font-bold border",
                                isThumbnail ? "w-6 h-6 text-[9px]" : "w-8 h-8 text-xs",
                                cell.state === 'prime' && "bg-primary border-primary text-black",
                                cell.state === 'composite' && "bg-zinc-100 border-zinc-200 text-zinc-300 line-through",
                                cell.state === 'active' && "bg-blue-400 border-blue-400 text-white shadow-lg",
                                cell.state === 'idle' && "bg-white border-zinc-200 text-zinc-600",
                            )}
                        >
                            {cell.value}
                        </motion.div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col gap-2 w-full max-w-md">
                    {cells.map((cell, i) => (
                        <motion.div
                            key={i}
                            layout
                            animate={cell.state === 'active' ? { scale: 1.03, x: 8 } : { scale: 1, x: 0 }}
                            className={cn(
                                "px-4 py-2 rounded-xl font-mono text-sm font-bold border",
                                isThumbnail ? "text-[10px] py-1 px-2" : "",
                                cell.state === 'prime' && "bg-primary border-primary text-black",
                                cell.state === 'active' && "bg-blue-400 border-blue-400 text-white shadow-md",
                                cell.state === 'visited' && "bg-lime-50 border-lime-300 text-lime-800",
                                cell.state === 'idle' && "bg-white border-zinc-200 text-zinc-600",
                            )}
                        >
                            {cell.value}
                        </motion.div>
                    ))}
                </div>
            )}

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

            {!isThumbnail && isSieve && (
                <div className="flex gap-6">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary"/><span className="text-xs text-zinc-400">Prime</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-400"/><span className="text-xs text-zinc-400">Active</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-zinc-200"/><span className="text-xs text-zinc-400">Composite</span></div>
                </div>
            )}
        </div>
    );
});
