"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface StepInfo {
    line: number;          // index into pseudocode lines array
    description: string;  // human-readable description e.g. "Comparing arr[2]=5 and arr[3]=3"
    comparisons: number;
    swaps: number;
}

interface SortingVisualizerProps {
    algorithmId: string;
    isPlaying: boolean;
    speed: number;
    onSimulationComplete?: () => void;
    onStep?: (info: StepInfo) => void;
    stepSignal?: number;    // bump this to trigger next step in step mode
    stepMode?: boolean;
    soundOn?: boolean;
    isThumbnail?: boolean;
}

export function SortingVisualizer({
    algorithmId, isPlaying, speed, onSimulationComplete,
    onStep, stepSignal, stepMode, soundOn, isThumbnail
}: SortingVisualizerProps) {
    const [array, setArray] = useState<number[]>([]);
    const [rawValues, setRawValues] = useState<number[]>([]);
    const [comparing, setComparing] = useState<[number, number] | null>(null);
    const [swapping, setSwapping] = useState<[number, number] | null>(null);
    const [sorted, setSorted] = useState<number[]>([]);
    const [customInput, setCustomInput] = useState<string>("");
    const [stepDescription, setStepDescription] = useState<string>("");
    // Playback scrubber
    const [history, setHistory] = useState<number[][]>([]);
    const [scrubIdx, setScrubIdx] = useState<number>(-1);
    const [isDone, setIsDone] = useState(false);

    const arrayRef = useRef(array);
    const rawValuesRef = useRef(rawValues);
    const isPlayingRef = useRef(isPlaying);
    const speedRef = useRef(speed);
    const isSortingRef = useRef(false);
    const isMounted = useRef(false);
    const comparisonsRef = useRef(0);
    const swapsRef = useRef(0);
    const historyRef = useRef<number[][]>([]);
    // Step mode: resolve when user clicks Next
    const stepResolverRef = useRef<(() => void) | null>(null);
    const stepSignalRef = useRef(stepSignal ?? 0);
    const stepModeRef = useRef(stepMode ?? false);
    const soundOnRef = useRef(soundOn ?? false);
    const audioCtxRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        isMounted.current = true;
        resetArray();
        return () => { isMounted.current = false; };
    }, []);

    useEffect(() => {
        arrayRef.current = array;
        rawValuesRef.current = rawValues;
        isPlayingRef.current = isPlaying;
        speedRef.current = speed;
        stepModeRef.current = stepMode ?? false;
        soundOnRef.current = soundOn ?? false;
    }, [array, rawValues, isPlaying, speed, stepMode, soundOn]);

    // When stepSignal bumps, resolve the pending step promise
    useEffect(() => {
        if ((stepSignal ?? 0) > stepSignalRef.current) {
            stepSignalRef.current = stepSignal ?? 0;
            if (stepResolverRef.current) {
                stepResolverRef.current();
                stepResolverRef.current = null;
            }
        }
    }, [stepSignal]);

    useEffect(() => {
        if (isPlaying) {
            isSortingRef.current = true;
            comparisonsRef.current = 0;
            swapsRef.current = 0;
            historyRef.current = [];
            setHistory([]);
            setScrubIdx(-1);
            setIsDone(false);
            if (sorted.length === array.length && array.length > 0) {
                resetArray();
                setTimeout(() => runSort(), 300);
            } else {
                runSort();
            }
        } else {
            isSortingRef.current = false;
        }
    }, [isPlaying]);

    const resetArray = (customArray?: number[], customRaw?: number[]) => {
        const length = isThumbnail ? 8 : 15;
        const rawArr = customRaw || Array.from({ length }, () => Math.floor(Math.random() * 80) + 10);
        const newArr = customArray || [...rawArr];
        setArray(newArr);
        setRawValues(rawArr);
        arrayRef.current = newArr;
        rawValuesRef.current = rawArr;
        setComparing(null);
        setSwapping(null);
        setSorted([]);
        setStepDescription("");
        comparisonsRef.current = 0;
        swapsRef.current = 0;
        historyRef.current = [];
        setHistory([]);
        setScrubIdx(-1);
        setIsDone(false);
    };

    const handleCustomInputSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const parsed = customInput.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        if (parsed.length > 0) {
            const max = Math.max(...parsed);
            const normalized = parsed.map(n => (n / max) * 90 + 10);
            resetArray(normalized, parsed);
        }
    };

    const getDelay = () => {
        if (isThumbnail) return 150;
        return Math.max(10, 1000 - (speedRef.current * 9.9));
    };

    const sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms));

    // In step mode, pause here until stepSignal bumps
    const waitForStep = () => {
        if (!stepModeRef.current || isThumbnail) return Promise.resolve();
        return new Promise<void>(resolve => {
            stepResolverRef.current = resolve;
        });
    };

    const checkShouldStop = () => !isSortingRef.current || !isMounted.current;

    // Record snapshot to history
    const snapshot = (arr: number[]) => {
        historyRef.current.push([...arr]);
    };

    // Play a tone based on bar height (for sound mode)
    const playTone = (height: number, type: "compare" | "swap") => {
        if (!soundOnRef.current || isThumbnail) return;
        try {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            }
            const ctx = audioCtxRef.current;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 200 + (height / 100) * 600;
            osc.type = type === "swap" ? "sawtooth" : "sine";
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.12);
        } catch {}
    };

    const emitStep = (line: number, description: string) => {
        setStepDescription(description);
        onStep?.({ line, description, comparisons: comparisonsRef.current, swaps: swapsRef.current });
    };

    const runSort = async () => {
        if (algorithmId === 'selection-sort') await runSelectionSort();
        else if (algorithmId === 'insertion-sort') await runInsertionSort();
        else if (algorithmId === 'quick-sort') await runQuickSort(0, arrayRef.current.length - 1);
        else if (algorithmId === 'merge-sort') await runMergeSort(0, arrayRef.current.length - 1);
        else if (algorithmId === 'heap-sort') await runHeapSort();
        else if (algorithmId === 'shell-sort') await runShellSort();
        else if (algorithmId === 'radix-sort' || algorithmId === 'counting-sort') await runCountingSort();
        else await runBubbleSort();

        if (isSortingRef.current && isMounted.current) {
            setSorted(arrayRef.current.map((_, i) => i));
            setComparing(null);
            setSwapping(null);
            setIsDone(true);
            setHistory([...historyRef.current]);
            setScrubIdx(historyRef.current.length - 1);
            isSortingRef.current = false;
            emitStep(-1, "Sort complete!");
            await sleep(80);
            if (onSimulationComplete) onSimulationComplete();

            if (isThumbnail && isMounted.current && isPlayingRef.current) {
                await sleep(2000);
                isSortingRef.current = true;
                resetArray();
                runSort();
            }
        }
    };

    // ---- Sorting algorithms ----

    const runBubbleSort = async () => {
        const arr = [...arrayRef.current];
        const n = arr.length;
        const newSorted: number[] = [];
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n - i - 1; j++) {
                if (checkShouldStop()) return;
                comparisonsRef.current++;
                setComparing([j, j + 1]);
                playTone(arr[j], "compare");
                emitStep(1, `Comparing arr[${j}]=${rawValuesRef.current[j]} and arr[${j+1}]=${rawValuesRef.current[j+1]}`);
                await waitForStep();
                await sleep(getDelay());
                if (checkShouldStop()) return;
                if (arr[j] > arr[j + 1]) {
                    swapsRef.current++;
                    setSwapping([j, j + 1]);
                    playTone(arr[j + 1], "swap");
                    [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                    setArray([...arr]);
                    arrayRef.current = [...arr];
                    snapshot(arr);
                    emitStep(3, `Swapped arr[${j}] and arr[${j+1}]`);
                    await waitForStep();
                    await sleep(getDelay());
                    if (checkShouldStop()) return;
                }
            }
            newSorted.push(n - 1 - i);
            setSorted([...newSorted]);
        }
    };

    const runSelectionSort = async () => {
        const arr = [...arrayRef.current];
        const n = arr.length;
        const newSorted: number[] = [];
        for (let i = 0; i < n; i++) {
            let minIdx = i;
            for (let j = i + 1; j < n; j++) {
                if (checkShouldStop()) return;
                comparisonsRef.current++;
                setComparing([minIdx, j]);
                playTone(arr[j], "compare");
                emitStep(2, `Finding min: comparing arr[${j}]=${rawValuesRef.current[j]} with current min arr[${minIdx}]=${rawValuesRef.current[minIdx]}`);
                await waitForStep();
                await sleep(getDelay());
                if (checkShouldStop()) return;
                if (arr[j] < arr[minIdx]) minIdx = j;
            }
            if (minIdx !== i) {
                swapsRef.current++;
                setSwapping([i, minIdx]);
                playTone(arr[minIdx], "swap");
                [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
                setArray([...arr]);
                arrayRef.current = [...arr];
                snapshot(arr);
                emitStep(4, `Placed min value ${rawValuesRef.current[minIdx]} at position ${i}`);
                await waitForStep();
                await sleep(getDelay());
                if (checkShouldStop()) return;
            }
            newSorted.push(i);
            setSorted([...newSorted]);
        }
        setComparing(null); setSwapping(null);
    };

    const runInsertionSort = async () => {
        const arr = [...arrayRef.current];
        const n = arr.length;
        for (let i = 1; i < n; i++) {
            let key = arr[i];
            let j = i - 1;
            emitStep(1, `Inserting arr[${i}]=${rawValuesRef.current[i]} into sorted portion`);
            while (j >= 0) {
                if (checkShouldStop()) return;
                comparisonsRef.current++;
                setComparing([j, j + 1]);
                playTone(arr[j], "compare");
                emitStep(2, `Comparing arr[${j}]=${rawValuesRef.current[j]} > key ${rawValuesRef.current[i]}`);
                await waitForStep();
                await sleep(getDelay());
                if (checkShouldStop()) return;
                if (arr[j] > key) {
                    swapsRef.current++;
                    setSwapping([j, j + 1]);
                    arr[j + 1] = arr[j]; arr[j] = key;
                    setArray([...arr]); arrayRef.current = [...arr];
                    snapshot(arr);
                    playTone(arr[j], "swap");
                    await waitForStep(); await sleep(getDelay());
                    if (checkShouldStop()) return;
                    j--;
                } else break;
            }
        }
    };

    const runQuickSort = async (low: number, high: number) => {
        if (low < high) {
            const pivotIdx = await partition(low, high);
            if (checkShouldStop()) return;
            await runQuickSort(low, pivotIdx - 1);
            await runQuickSort(pivotIdx + 1, high);
        }
    };

    const partition = async (low: number, high: number) => {
        const arr = [...arrayRef.current];
        const pivot = arr[high];
        let i = low - 1;
        emitStep(1, `Pivot = arr[${high}]=${rawValuesRef.current[high]}`);
        for (let j = low; j < high; j++) {
            if (checkShouldStop()) return i;
            comparisonsRef.current++;
            setComparing([j, high]);
            playTone(arr[j], "compare");
            emitStep(2, `Comparing arr[${j}]=${rawValuesRef.current[j]} with pivot`);
            await waitForStep(); await sleep(getDelay());
            if (arr[j] < pivot) {
                i++;
                swapsRef.current++;
                [arr[i], arr[j]] = [arr[j], arr[i]];
                setSwapping([i, j]);
                setArray([...arr]); arrayRef.current = [...arr];
                snapshot(arr);
                playTone(arr[i], "swap");
                emitStep(3, `Moved arr[${j}] to left partition`);
                await waitForStep(); await sleep(getDelay());
            }
        }
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        setArray([...arr]); arrayRef.current = [...arr];
        return i + 1;
    };

    const runMergeSort = async (l: number, r: number) => {
        if (l < r) {
            const m = Math.floor((l + r) / 2);
            await runMergeSort(l, m);
            await runMergeSort(m + 1, r);
            await merge(l, m, r);
        }
    };

    const merge = async (l: number, m: number, r: number) => {
        const arr = [...arrayRef.current];
        let i = l, j = m + 1;
        while (i <= m && j <= r) {
            if (checkShouldStop()) return;
            comparisonsRef.current++;
            setComparing([i, j]);
            playTone(arr[i], "compare");
            emitStep(3, `Merging: comparing arr[${i}]=${rawValuesRef.current[i]} and arr[${j}]=${rawValuesRef.current[j]}`);
            await waitForStep(); await sleep(getDelay());
            if (arr[i] <= arr[j]) { i++; }
            else {
                swapsRef.current++;
                const value = arr[j]; let index = j;
                while (index !== i) { arr[index] = arr[index - 1]; index--; }
                arr[i] = value;
                setArray([...arr]); arrayRef.current = [...arr];
                snapshot(arr);
                setSwapping([i, j]);
                playTone(value, "swap");
                await waitForStep(); await sleep(getDelay());
                i++; m++; j++;
            }
        }
    };

    const runHeapSort = async () => {
        const arr = [...arrayRef.current];
        const n = arr.length;
        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) await heapify(arr, n, i);
        for (let i = n - 1; i > 0; i--) {
            if (checkShouldStop()) return;
            swapsRef.current++;
            [arr[0], arr[i]] = [arr[i], arr[0]];
            setArray([...arr]); arrayRef.current = [...arr];
            snapshot(arr);
            setSwapping([0, i]); playTone(arr[i], "swap");
            emitStep(5, `Extracted max to position ${i}`);
            await waitForStep(); await sleep(getDelay());
            await heapify(arr, i, 0);
        }
    };

    const heapify = async (arr: number[], n: number, i: number) => {
        let largest = i; const l = 2 * i + 1; const r = 2 * i + 2;
        if (l < n && arr[l] > arr[largest]) largest = l;
        if (r < n && arr[r] > arr[largest]) largest = r;
        if (largest !== i) {
            if (checkShouldStop()) return;
            comparisonsRef.current++;
            setComparing([i, largest]);
            playTone(arr[i], "compare");
            await waitForStep(); await sleep(getDelay());
            swapsRef.current++;
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            setArray([...arr]); arrayRef.current = [...arr];
            snapshot(arr);
            setSwapping([i, largest]);
            await waitForStep(); await sleep(getDelay());
            await heapify(arr, n, largest);
        }
    };

    const runShellSort = async () => {
        const arr = [...arrayRef.current];
        const n = arr.length;
        for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
            emitStep(1, `Shell Sort: gap = ${gap}`);
            for (let i = gap; i < n; i++) {
                let temp = arr[i]; let j = i;
                while (j >= gap && arr[j - gap] > temp) {
                    if (checkShouldStop()) return;
                    comparisonsRef.current++;
                    setComparing([j, j - gap]);
                    playTone(arr[j], "compare");
                    emitStep(3, `Comparing arr[${j-gap}]=${rawValuesRef.current[j-gap]} with arr[${j}]=${rawValuesRef.current[j]}`);
                    await waitForStep(); await sleep(getDelay());
                    swapsRef.current++;
                    arr[j] = arr[j - gap];
                    setArray([...arr]); arrayRef.current = [...arr];
                    snapshot(arr);
                    setSwapping([j, j - gap]);
                    playTone(arr[j - gap], "swap");
                    await waitForStep(); await sleep(getDelay());
                    j -= gap;
                }
                arr[j] = temp;
                setArray([...arr]);
            }
        }
    };

    const runCountingSort = async () => {
        const arr = [...arrayRef.current];
        const sortedArr = [...arr].sort((a, b) => a - b);
        for (let i = 0; i < arr.length; i++) {
            if (checkShouldStop()) return;
            setComparing([i, i]);
            arr[i] = sortedArr[i];
            setArray([...arr]); arrayRef.current = [...arr];
            snapshot(arr);
            setSwapping([i, i]);
            playTone(arr[i], "swap");
            emitStep(2, `Placing sorted value ${sortedArr[i]} at index ${i}`);
            await waitForStep(); await sleep(getDelay() * 2);
        }
    };

    // Scrubber: display a frozen snapshot
    const displayArray = scrubIdx >= 0 && scrubIdx < history.length ? history[scrubIdx] : array;

    return (
        <div className={cn("w-full h-full flex flex-col items-center justify-end relative", isThumbnail ? "p-0" : "px-4 md:px-12 pb-4 pt-8")}>

            {/* Custom Input Overlay */}
            {!isThumbnail && (
                <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm p-3 rounded-xl border border-zinc-200 shadow-sm">
                    <form onSubmit={handleCustomInputSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            placeholder="e.g. 5, 2, 9, 1"
                            className="w-36 md:w-48 px-3 py-1.5 text-sm bg-zinc-100 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button type="submit" className="px-3 py-1.5 bg-black text-primary text-sm font-bold rounded-lg hover:bg-zinc-800 transition-colors">
                            Set
                        </button>
                    </form>
                </div>
            )}

            {/* Step description badge */}
            {!isThumbnail && stepDescription && (
                <div className="absolute top-4 right-4 z-10 bg-zinc-900 text-white text-xs font-mono px-3 py-2 rounded-xl shadow-lg max-w-[200px] md:max-w-xs text-right">
                    {stepDescription}
                </div>
            )}

            {/* Bars */}
            <div className={cn("w-full flex-1 min-h-[200px] flex items-end justify-center gap-1 sm:gap-2 max-w-4xl mx-auto", isThumbnail ? "mt-0" : "mt-12")}>
                {displayArray.map((value, idx) => {
                    const isComparing = !isDone && comparing?.includes(idx);
                    const isSwapping = !isDone && swapping?.includes(idx);
                    const isSorted = sorted.includes(idx);

                    return (
                        <motion.div
                            key={idx}
                            layout
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.8 }}
                            className={cn(
                                "flex-1 rounded-t-lg sm:rounded-t-xl transition-colors duration-200 relative group cursor-default",
                                !isThumbnail && "shadow-sm",
                                isSwapping ? "bg-red-500" :
                                isComparing ? "bg-blue-400" :
                                isSorted ? "bg-primary" :
                                "bg-zinc-200"
                            )}
                            style={{ height: `${value}%` }}
                        >
                            {!isThumbnail && (
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black text-white text-xs font-bold py-1 px-2 rounded-md pointer-events-none transition-opacity whitespace-nowrap">
                                    {rawValues[idx] !== undefined ? rawValues[idx] : Math.round(value)}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>

            {/* Scrubber (shown after sort completes) */}
            {!isThumbnail && isDone && history.length > 1 && (
                <div className="w-full max-w-4xl mx-auto mt-4 px-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-zinc-400 w-14">Frame {scrubIdx + 1}/{history.length}</span>
                        <input
                            type="range"
                            min={0}
                            max={history.length - 1}
                            value={scrubIdx}
                            onChange={(e) => setScrubIdx(Number(e.target.value))}
                            className="flex-1 h-1.5 accent-primary"
                        />
                        <span className="text-[10px] font-mono text-zinc-400 w-10 text-right">Replay</span>
                    </div>
                </div>
            )}

            {/* Legend */}
            {!isThumbnail && (
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-400"/><span className="text-xs font-semibold text-zinc-500">Comparing</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"/><span className="text-xs font-semibold text-zinc-500">Swapping</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary"/><span className="text-xs font-semibold text-zinc-500">Sorted</span></div>
                </div>
            )}
        </div>
    );
}
