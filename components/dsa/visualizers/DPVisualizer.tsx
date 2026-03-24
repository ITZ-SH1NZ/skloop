"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface DPVisualizerProps {
    algorithmId: string;
    isPlaying: boolean;
    speed: number;
    onSimulationComplete?: () => void;
    isThumbnail?: boolean;
}

export function DPVisualizer({ algorithmId, isPlaying, speed, onSimulationComplete, isThumbnail }: DPVisualizerProps) {
    const [cells, setCells] = useState<(number | string)[][]>([]);
    const [activeCell, setActiveCell] = useState<[number, number] | null>(null);
    const [visitedCells, setVisitedCells] = useState<Set<string>>(new Set());
    const [operation, setOperation] = useState<string>("");
    const [phase, setPhase] = useState<string>("");

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
        setActiveCell(null);
        setVisitedCells(new Set());
        setOperation("");
        setPhase("");
        setCells([]);
    };

    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    const getDelay = () => isThumbnail ? 300 : Math.max(200, 1200 - speedRef.current * 10);
    const checkStop = () => !isSortingRef.current || !isMounted.current;

    const complete = () => {
        if (!isSortingRef.current || !isMounted.current) return;
        isSortingRef.current = false;
        complete();
    };

    const runSimulation = async () => {
        reset();
        await sleep(300);

        if (algorithmId === 'fibonacci-dp' || algorithmId === 'fibonacci') {
            await runFibonacci();
        } else if (algorithmId === 'longest-common-subsequence' || algorithmId === 'lcs') {
            await runLCS();
        } else if (algorithmId === 'coin-change') {
            await runCoinChange();
        } else if (algorithmId === 'edit-distance') {
            await runEditDistance();
        } else if (algorithmId === '0-1-knapsack' || algorithmId === 'knapsack') {
            await runKnapsack();
        } else {
            await runGenericDP();
        }

        if (isThumbnail && isMounted.current && isPlayingRef.current) {
            await sleep(2000);
            reset();
            runSimulation();
        }
    };

    const runFibonacci = async () => {
        const n = isThumbnail ? 7 : 10;
        const dp: number[] = Array(n).fill(0);
        dp[0] = 0; dp[1] = 1;
        setCells([[...dp]]);
        setPhase("Fibonacci DP");
        for (let i = 2; i < n; i++) {
            if (checkStop()) return;
            dp[i] = dp[i-1] + dp[i-2];
            setActiveCell([0, i]);
            setOperation(`F(${i}) = F(${i-1}) + F(${i-2}) = ${dp[i-1]} + ${dp[i-2]} = ${dp[i]}`);
            setCells([[...dp]]);
            setVisitedCells(v => new Set([...v, `0-${i}`]));
            await sleep(getDelay());
        }
        setActiveCell(null);
        setOperation("Complete ✓");
        complete();
    };

    const runLCS = async () => {
        const s1 = isThumbnail ? "ABC" : "ABCDE";
        const s2 = isThumbnail ? "AC" : "ACE";
        setPhase(`LCS("${s1}", "${s2}")`);
        const m = s1.length, n = s2.length;
        const dp: number[][] = Array.from({length: m+1}, () => Array(n+1).fill(0));
        // Build header
        const grid: (string | number)[][] = [
            ['', '', ...s2.split('')],
            ...dp.map((row, i) => [i === 0 ? '' : s1[i-1], ...row])
        ];
        setCells(grid);
        await sleep(300);

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (checkStop()) return;
                dp[i][j] = s1[i-1] === s2[j-1] ? dp[i-1][j-1]+1 : Math.max(dp[i-1][j], dp[i][j-1]);
                setActiveCell([i+1, j+1]);
                setOperation(`Match? ${s1[i-1]} == ${s2[j-1]}: ${s1[i-1]===s2[j-1] ? '✓ +1' : '✗ take max'} = ${dp[i][j]}`);
                const updated = [['', '', ...s2.split('')], ...dp.map((row, ri) => [ri===0?'':s1[ri-1], ...row])];
                setCells(updated);
                setVisitedCells(v => new Set([...v, `${i+1}-${j+1}`]));
                await sleep(getDelay() * 0.6);
            }
        }
        setActiveCell(null);
        setOperation(`LCS length: ${dp[m][n]}`);
        complete();
    };

    const runCoinChange = async () => {
        const coins = [1, 3, 4];
        const amount = isThumbnail ? 5 : 6;
        setPhase(`Coins: [${coins}], Amount: ${amount}`);
        const dp: number[] = Array(amount+1).fill(Infinity);
        dp[0] = 0;
        setCells([[...dp.map(v => v === Infinity ? '∞' : v)]]);

        for (let i = 1; i <= amount; i++) {
            if (checkStop()) return;
            for (const c of coins) {
                if (c <= i && dp[i-c] + 1 < dp[i]) {
                    dp[i] = dp[i-c] + 1;
                }
            }
            setActiveCell([0, i]);
            setOperation(`Amount ${i}: min coins = ${dp[i]}`);
            setCells([[...dp.map(v => v === Infinity ? '∞' : v)]]);
            setVisitedCells(v => new Set([...v, `0-${i}`]));
            await sleep(getDelay());
        }
        setActiveCell(null);
        setOperation(`Min coins for ${amount}: ${dp[amount]}`);
        complete();
    };

    const runEditDistance = async () => {
        const s1 = "KITTEN"; const s2 = "SITTING";
        setPhase(`Edit Distance: "${s1}" → "${s2}"`);
        const m = s1.length, n = s2.length;
        const dp: number[][] = Array.from({length: m+1}, (_, i) => Array(n+1).fill(0).map((_,j) => i===0?j:j===0?i:0));
        const grid = [
            ['', '', ...s2.split('')],
            ...dp.map((row, i) => [i===0?'':s1[i-1], ...row])
        ];
        setCells(grid);
        await sleep(400);

        for (let i = 1; i <= m; i++) {
            for (let j = 1; j <= n; j++) {
                if (checkStop()) return;
                dp[i][j] = s1[i-1]===s2[j-1] ? dp[i-1][j-1] :
                    1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
                setActiveCell([i+1, j+1]);
                const updated = [['', '', ...s2.split('')], ...dp.map((row, ri) => [ri===0?'':s1[ri-1], ...row])];
                setCells(updated);
                setVisitedCells(v => new Set([...v, `${i+1}-${j+1}`]));
                setOperation(`ops("${s1.slice(0,i)}", "${s2.slice(0,j)}") = ${dp[i][j]}`);
                await sleep(getDelay() * 0.4);
            }
        }
        setActiveCell(null);
        setOperation(`Edit distance: ${dp[m][n]}`);
        complete();
    };

    const runKnapsack = async () => {
        const weights = [2, 3, 4];
        const values  = [3, 4, 5];
        const W = isThumbnail ? 5 : 6;
        setPhase(`0/1 Knapsack, W=${W}`);
        const n = weights.length;
        const dp: number[][] = Array.from({length: n+1}, () => Array(W+1).fill(0));
        const header = ['Item\\W', ...Array.from({length: W+1}, (_, j) => j.toString())];
        setCells([header, ...dp.map((row, i) => [i===0?'0':String(i), ...row])]);
        await sleep(300);

        for (let i = 1; i <= n; i++) {
            for (let w = 0; w <= W; w++) {
                if (checkStop()) return;
                dp[i][w] = weights[i-1] <= w 
                    ? Math.max(dp[i-1][w], values[i-1] + dp[i-1][w-weights[i-1]])
                    : dp[i-1][w];
                setActiveCell([i+1, w+1]);
                setOperation(`Item ${i} (w=${weights[i-1]}, v=${values[i-1]}), cap ${w}: ${dp[i][w]}`);
                const updated = [header, ...dp.map((row, ri) => [ri===0?'0':String(ri), ...row])];
                setCells(updated);
                setVisitedCells(v => new Set([...v, `${i+1}-${w+1}`]));
                await sleep(getDelay() * 0.3);
            }
        }
        setActiveCell(null);
        setOperation(`Max value: ${dp[n][W]}`);
        complete();
    };

    const runGenericDP = async () => {
        const n = isThumbnail ? 6 : 10;
        const dp = Array(n).fill(0);
        dp[0] = 1; dp[1] = 1;
        setCells([[...dp]]);
        setPhase("DP Table");
        for (let i = 2; i < n; i++) {
            if (checkStop()) return;
            dp[i] = dp[i-1] + dp[i-2];
            setActiveCell([0, i]);
            setCells([[...dp]]);
            setVisitedCells(v => new Set([...v, `0-${i}`]));
            await sleep(getDelay());
        }
        setActiveCell(null);
        complete();
    };

    const maxCols = cells.reduce((m, r) => Math.max(m, r.length), 0);

    return (
        <div className={cn("w-full h-full flex flex-col items-center justify-center gap-4", isThumbnail ? "p-2" : "p-6")}>
            {!isThumbnail && phase && (
                <div className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">{phase}</div>
            )}

            {/* DP Table */}
            <div className={cn("overflow-auto", isThumbnail ? "w-full" : "max-w-full")}>
                <table className="text-xs font-mono border-collapse">
                    <tbody>
                        {cells.map((row, ri) => (
                            <tr key={ri}>
                                {row.map((cell, ci) => {
                                    const key = `${ri}-${ci}`;
                                    const isActive = activeCell?.[0] === ri && activeCell?.[1] === ci;
                                    const isVisited = visitedCells.has(key);
                                    const isHeader = ri === 0 || ci === 0;
                                    return (
                                        <motion.td
                                            key={ci}
                                            layout
                                            animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                                            transition={{ duration: 0.15 }}
                                            className={cn(
                                                "border text-center font-bold transition-colors",
                                                isThumbnail ? "w-7 h-7 text-[10px]" : "w-10 h-10 text-sm",
                                                isHeader && !isActive && !isVisited && "bg-zinc-100 text-zinc-500 border-zinc-200",
                                                !isHeader && !isActive && !isVisited && "bg-white text-zinc-700 border-zinc-200",
                                                isVisited && !isActive && !isHeader && "bg-lime-100 border-lime-300 text-lime-800",
                                                isActive && "bg-blue-400 border-blue-400 text-white shadow-lg z-10 relative"
                                            )}
                                        >
                                            {cell === Infinity ? '∞' : cell}
                                        </motion.td>
                                    );
                                })}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {!isThumbnail && operation && (
                <div className="bg-white px-5 py-2 rounded-full shadow-sm border border-zinc-200 font-mono text-sm font-bold text-zinc-700 max-w-xl text-center">
                    {operation}
                </div>
            )}
        </div>
    );
}
