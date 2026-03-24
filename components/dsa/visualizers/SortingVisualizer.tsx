"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface SortingVisualizerProps {
    algorithmId: string;
    isPlaying: boolean;
    speed: number;
    onSimulationComplete?: () => void;
    isThumbnail?: boolean;
}

export function SortingVisualizer({ algorithmId, isPlaying, speed, onSimulationComplete, isThumbnail }: SortingVisualizerProps) {
    const [array, setArray] = useState<number[]>([]);       // normalized heights (0-100)
    const [rawValues, setRawValues] = useState<number[]>([]); // original numbers for tooltip
    const [comparing, setComparing] = useState<[number, number] | null>(null);
    const [swapping, setSwapping] = useState<[number, number] | null>(null);
    const [sorted, setSorted] = useState<number[]>([]);
    const [customInput, setCustomInput] = useState<string>("");
    
    const arrayRef = useRef(array);
    const rawValuesRef = useRef(rawValues);
    const isPlayingRef = useRef(isPlaying);
    const speedRef = useRef(speed);          // always up-to-date speed for mid-sort reads
    const isSortingRef = useRef(false);      // true while async sort loop is running
    const isMounted = useRef(false);

    // Initial setup
    useEffect(() => {
        isMounted.current = true;
        resetArray();
        return () => { isMounted.current = false; };
    }, []);

    // Sync refs - speedRef syncs every render so getDelay() always reads the latest value
    useEffect(() => {
        arrayRef.current = array;
        rawValuesRef.current = rawValues;
        isPlayingRef.current = isPlaying;
        speedRef.current = speed;
    }, [array, rawValues, isPlaying, speed]);

    // Handle Play: if already fully sorted, reset then sort; otherwise (re-)sort
    useEffect(() => {
        if (isPlaying) {
            isSortingRef.current = true;
            if (sorted.length === array.length && array.length > 0) {
                resetArray();
                setTimeout(() => runSort(), 300);
            } else {
                runSort();
            }
        } else {
            // Pause/stop — the loop will see isSortingRef=false and abort at next sleep
            isSortingRef.current = false;
        }
    }, [isPlaying]);

    const resetArray = (customArray?: number[], customRaw?: number[]) => {
        const length = isThumbnail ? 8 : 15;
        // Raw values are what the user sees: integers between 10 and 90
        const rawArr = customRaw || Array.from({ length }, () => Math.floor(Math.random() * 80) + 10);
        // Normalized heights for the bars: same as raw when auto-generated (already 10-90 range)
        const newArr = customArray || [...rawArr];
        setArray(newArr);
        setRawValues(rawArr);
        arrayRef.current = newArr;
        rawValuesRef.current = rawArr;
        setComparing(null);
        setSwapping(null);
        setSorted([]);
    };

    const handleCustomInputSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const parsed = customInput.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        if (parsed.length > 0) {
            // Store originals for tooltip, normalize heights for bar display
            const max = Math.max(...parsed);
            const normalized = parsed.map(n => (n / max) * 90 + 10);
            resetArray(normalized, parsed); // pass both normalized heights and raw values
        }
    };

    // Calculate delay based on speed slider — reads speedRef so it's always fresh mid-sort
    const getDelay = () => {
        if (isThumbnail) return 150;
        return Math.max(10, 1000 - (speedRef.current * 9.9));
    };

    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    // Stop if paused, stopped, or reset was requested
    const checkShouldStop = () => !isSortingRef.current || !isMounted.current;

    const runSort = async () => {
        if (algorithmId === 'selection-sort') await runSelectionSort();
        else if (algorithmId === 'insertion-sort') await runInsertionSort();
        else if (algorithmId === 'quick-sort') await runQuickSort(0, arrayRef.current.length - 1);
        else if (algorithmId === 'merge-sort') await runMergeSort(0, arrayRef.current.length - 1);
        else if (algorithmId === 'heap-sort') await runHeapSort();
        else if (algorithmId === 'shell-sort') await runShellSort();
        else if (algorithmId === 'radix-sort' || algorithmId === 'counting-sort') await runCountingSort();
        else await runBubbleSort();
        
        // Only mark as complete if not interrupted by reset/pause
        if (isSortingRef.current && isMounted.current) {
            // Set ALL bars green FIRST, then notify parent
            setSorted(arrayRef.current.map((_, i) => i));
            setComparing(null);
            setSwapping(null);
            isSortingRef.current = false;
            // Small delay so green state renders before parent sets isPlaying=false
            await sleep(80);
            if (onSimulationComplete) onSimulationComplete();
            
            // Loop for thumbnails
            if (isThumbnail && isMounted.current && isPlayingRef.current) {
                await sleep(2000);
                isSortingRef.current = true;
                resetArray();
                runSort();
            }
        }
    }

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

        for (let j = low; j < high; j++) {
            if (checkShouldStop()) return i;
            setComparing([j, high]);
            await sleep(getDelay());
            if (arr[j] < pivot) {
                i++;
                [arr[i], arr[j]] = [arr[j], arr[i]]; // swap
                setSwapping([i, j]);
                setArray([...arr]);
                arrayRef.current = [...arr];
                await sleep(getDelay());
            }
        }
        [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
        setArray([...arr]);
        arrayRef.current = [...arr];
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
            setComparing([i, j]);
            await sleep(getDelay());
            
            if (arr[i] <= arr[j]) {
                i++;
            } else {
                const value = arr[j];
                let index = j;
                while (index !== i) {
                    arr[index] = arr[index - 1];
                    index--;
                }
                arr[i] = value;
                setArray([...arr]);
                arrayRef.current = [...arr];
                setSwapping([i, j]);
                await sleep(getDelay());
                i++; m++; j++;
            }
        }
    };

    const runHeapSort = async () => {
        const arr = [...arrayRef.current];
        const n = arr.length;

        for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
            await heapify(arr, n, i);
        }
        for (let i = n - 1; i > 0; i--) {
            if (checkShouldStop()) return;
            [arr[0], arr[i]] = [arr[i], arr[0]];
            setArray([...arr]);
            arrayRef.current = [...arr];
            setSwapping([0, i]);
            await sleep(getDelay());
            await heapify(arr, i, 0);
        }
    };

    const heapify = async (arr: number[], n: number, i: number) => {
        let largest = i;
        const l = 2 * i + 1;
        const r = 2 * i + 2;

        if (l < n && arr[l] > arr[largest]) largest = l;
        if (r < n && arr[r] > arr[largest]) largest = r;

        if (largest !== i) {
            if (checkShouldStop()) return;
            setComparing([i, largest]);
            await sleep(getDelay());
            [arr[i], arr[largest]] = [arr[largest], arr[i]];
            setArray([...arr]);
            arrayRef.current = [...arr];
            setSwapping([i, largest]);
            await sleep(getDelay());
            await heapify(arr, n, largest);
        }
    };

    const runShellSort = async () => {
        const arr = [...arrayRef.current];
        const n = arr.length;
        for (let gap = Math.floor(n / 2); gap > 0; gap = Math.floor(gap / 2)) {
            for (let i = gap; i < n; i++) {
                let temp = arr[i];
                let j = i;
                while (j >= gap && arr[j - gap] > temp) {
                    if (checkShouldStop()) return;
                    setComparing([j, j - gap]);
                    await sleep(getDelay());
                    arr[j] = arr[j - gap];
                    setArray([...arr]);
                    arrayRef.current = [...arr];
                    setSwapping([j, j - gap]);
                    await sleep(getDelay());
                    j -= gap;
                }
                arr[j] = temp;
                setArray([...arr]);
            }
        }
    };

    const runCountingSort = async () => {
        // Simple visualization for counting/radix sorts
        // We simulate the "rebuilding" phase
        const arr = [...arrayRef.current];
        const sortedArr = [...arr].sort((a, b) => a - b);
        for (let i = 0; i < arr.length; i++) {
            if (checkShouldStop()) return;
            setComparing([i, i]);
            arr[i] = sortedArr[i];
            setArray([...arr]);
            arrayRef.current = [...arr];
            setSwapping([i, i]);
            await sleep(getDelay() * 2);
        }
    };

    const runSelectionSort = async () => {
        const arr = [...arrayRef.current];
        const n = arr.length;
        const newSorted: number[] = [...sorted];

        for (let i = 0; i < n; i++) {
            if (newSorted.includes(i)) continue;
            let minIdx = i;
            
            for (let j = i + 1; j < n; j++) {
                if (checkShouldStop()) return;
                setComparing([minIdx, j]);
                await sleep(getDelay());
                if (checkShouldStop()) return;

                if (arr[j] < arr[minIdx]) {
                    minIdx = j;
                }
            }
            
            if (minIdx !== i) {
                setSwapping([i, minIdx]);
                let temp = arr[i];
                arr[i] = arr[minIdx];
                arr[minIdx] = temp;
                setArray([...arr]);
                arrayRef.current = [...arr];
                await sleep(getDelay());
                if (checkShouldStop()) return;
            }
            newSorted.push(i);
            setSorted([...newSorted]);
        }
        setComparing(null);
        setSwapping(null);
        setArray([...arr]);
    };

    const runInsertionSort = async () => {
        const arr = [...arrayRef.current];
        const n = arr.length;

        for (let i = 1; i < n; i++) {
            let key = arr[i];
            let j = i - 1;
            
            while (j >= 0) {
                if (checkShouldStop()) return;
                setComparing([j, j + 1]);
                await sleep(getDelay());
                if (checkShouldStop()) return;

                if (arr[j] > key) {
                    setSwapping([j, j + 1]);
                    arr[j + 1] = arr[j];
                    arr[j] = key; 
                    setArray([...arr]);
                    arrayRef.current = [...arr];
                    await sleep(getDelay());
                    if (checkShouldStop()) return;
                    j = j - 1;
                } else {
                    break;
                }
            }
        }
    };

    const runBubbleSort = async () => {
        const arr = [...arrayRef.current];
        const n = arr.length;
        const newSorted: number[] = [...sorted];

        for (let i = 0; i < n; i++) {
            if (newSorted.includes(n - 1 - i)) continue;

            for (let j = 0; j < n - i - 1; j++) {
                if (checkShouldStop()) return;

                setComparing([j, j + 1]);
                await sleep(getDelay());
                if (checkShouldStop()) return;

                if (arr[j] > arr[j + 1]) {
                    setSwapping([j, j + 1]);
                    
                    let temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;

                    setArray([...arr]);
                    arrayRef.current = [...arr];

                    await sleep(getDelay());
                    if (checkShouldStop()) return;
                }
            }
            newSorted.push(n - 1 - i);
            setSorted([...newSorted]);
        }
    };

    return (
        <div className={cn("w-full h-full flex flex-col items-center justify-end relative", isThumbnail ? "p-0" : "px-4 md:px-12 pb-12 pt-8")}>
            
            {/* Custom Input Overlay */}
            {!isThumbnail && (
                <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-zinc-200 shadow-sm w-[300px]">
                    <form onSubmit={handleCustomInputSubmit} className="flex gap-2">
                        <input 
                            type="text" 
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            placeholder="e.g. 5, 2, 9, 1"
                            className="flex-1 px-3 py-1.5 text-sm bg-zinc-100 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button type="submit" className="px-3 py-1.5 bg-black text-primary text-sm font-bold rounded-lg hover:bg-zinc-800 transition-colors">
                            Set
                        </button>
                    </form>
                </div>
            )}

            <div className={cn("w-full flex-1 min-h-[200px] flex items-end justify-center gap-1 sm:gap-2 max-w-4xl mx-auto", isThumbnail ? "mt-0" : "mt-12")}>
                {array.map((value, idx) => {
                    const isComparing = comparing?.includes(idx);
                    const isSwapping = swapping?.includes(idx);
                    const isSorted = sorted.includes(idx);

                    return (
                        <motion.div
                            key={idx}
                            layout
                            initial={{ opacity: 0, y: 50 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 25,
                                mass: 0.8
                            }}
                            className={cn(
                                "flex-1 rounded-t-lg sm:rounded-t-xl transition-colors duration-200 relative group",
                                !isThumbnail && "shadow-sm",
                                isSwapping ? "bg-red-500" :
                                isComparing ? "bg-blue-400" :
                                isSorted ? "bg-primary" :
                                "bg-zinc-200"
                            )}
                            // We use `value` directly as the height percentage, but the value is normalized in resetArray
                            // We can just round it for display context.
                            style={{ height: `${value}%` }}
                        >
                            {/* Value tooltip: show raw value, not the normalized height % */}
                            {!isThumbnail && (
                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-black text-white text-xs font-bold py-1 px-2 rounded-md pointer-events-none transition-opacity whitespace-nowrap">
                                    {rawValues[idx] !== undefined ? rawValues[idx] : Math.round(value)}
                                </div>
                            )}
                        </motion.div>
                    );
                })}
            </div>
            
            {/* Quick Legend */}
            {!isThumbnail && (
                <div className="flex flex-wrap justify-center gap-4 mt-8">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-400"/> <span className="text-xs font-semibold text-zinc-500">Comparing</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-500"/> <span className="text-xs font-semibold text-zinc-500">Swapping</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary"/> <span className="text-xs font-semibold text-zinc-500">Sorted</span></div>
                </div>
            )}
        </div>
    );
}
