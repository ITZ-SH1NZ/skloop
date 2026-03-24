"use client";

import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";

interface VisualizerProps {
    algorithmId: string;
    isPlaying: boolean;
    speed: number;
    onSimulationComplete?: () => void;
    isThumbnail?: boolean;
}

export function StructureVisualizer({ algorithmId, isPlaying, speed, onSimulationComplete, isThumbnail }: VisualizerProps) {
    const [items, setItems] = useState<number[]>([]);
    const [activeIdx, setActiveIdx] = useState<number | null>(null);
    const [operation, setOperation] = useState<string>("");
    const [customInput, setCustomInput] = useState<string>("");
    
    const isPlayingRef = useRef(isPlaying);
    const speedRef = useRef(speed);
    const isSortingRef = useRef(false);
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        setItems(algorithmId === 'stack' || algorithmId === 'queue' ? [] : [5, 12, 8]);
        return () => { isMounted.current = false; };
    }, [algorithmId, isThumbnail]);

    const handleCustomInputSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customInput) return;
        const parsed = customInput.split(',').map(n => parseInt(n.trim())).filter(n => !isNaN(n));
        if (parsed.length > 0) setItems(parsed);
        setCustomInput("");
    };

    useEffect(() => {
        isPlayingRef.current = isPlaying;
        speedRef.current = speed;
    }, [isPlaying, speed]);

    useEffect(() => {
        if (isPlaying) {
            isSortingRef.current = true;
            runSimulation();
        } else {
            isSortingRef.current = false;
        }
    }, [isPlaying]);

    const getDelay = () => isThumbnail ? 300 : Math.max(200, 1000 - (speedRef.current * 8));
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const checkShouldStop = () => !isSortingRef.current || !isMounted.current;

    const complete = () => {
        if (!isSortingRef.current || !isMounted.current) return;
        isSortingRef.current = false;
        if (onSimulationComplete) onSimulationComplete();
    };

    const runSimulation = async () => {
        if (algorithmId === 'stack') await runStack();
        else if (algorithmId === 'queue') await runQueue();
        else if (algorithmId === 'deque') await runDeque();
        else await runTraversal();

        if (isThumbnail && isMounted.current && isPlayingRef.current) {
            await sleep(2000);
            if (isSortingRef.current) runSimulation();
        }
    };

    const runStack = async () => {
        setItems([]);
        const toPush = isThumbnail ? [10, 20, 30] : [10, 20, 30, 40, 50];
        const current: number[] = [];

        for (let num of toPush) {
            if (checkShouldStop()) return;
            setOperation(`Push(${num})`);
            current.push(num);
            setItems([...current]);
            setActiveIdx(current.length - 1);
            await sleep(getDelay());
        }

        while (current.length > 0) {
            if (checkShouldStop()) return;
            setOperation(`Pop() -> ${current[current.length - 1]}`);
            setActiveIdx(current.length - 1);
            await sleep(getDelay());
            if (checkShouldStop()) return;
            current.pop();
            setItems([...current]);
            setActiveIdx(null);
            await sleep(getDelay() / 2);
        }

        setOperation("Stack Empty");
        complete();
    };

    const runQueue = async () => {
        setItems([]);
        const toEnqueue = isThumbnail ? [10, 20, 30] : [10, 20, 30, 40, 50];
        const current: number[] = [];

        for (let num of toEnqueue) {
            if (checkShouldStop()) return;
            setOperation(`Enqueue(${num})`);
            current.push(num);
            setItems([...current]);
            setActiveIdx(current.length - 1);
            await sleep(getDelay());
        }

        while (current.length > 0) {
            if (checkShouldStop()) return;
            setOperation(`Dequeue() -> ${current[0]}`);
            setActiveIdx(0);
            await sleep(getDelay());
            if (checkShouldStop()) return;
            current.shift();
            setItems([...current]);
            setActiveIdx(null);
            await sleep(getDelay() / 2);
        }

        setOperation("Queue Empty");
        complete();
    };

    const runDeque = async () => {
        setItems([]);
        const current: number[] = [];
        const ops = [
            { op: "addBack", val: 10 },
            { op: "addFront", val: 20 },
            { op: "addBack", val: 30 },
            { op: "addFront", val: 5 },
            { op: "removeFront" },
            { op: "removeBack" },
        ];

        for (let step of ops) {
            if (checkShouldStop()) return;
            setOperation(`${step.op}(${step.val ?? ""})`);
            if (step.op === "addBack") current.push(step.val!);
            else if (step.op === "addFront") current.unshift(step.val!);
            else if (step.op === "removeFront") current.shift();
            else if (step.op === "removeBack") current.pop();
            setItems([...current]);
            await sleep(getDelay());
        }

        setOperation("Deque Simulation Finished");
        complete();
    };

    const runTraversal = async () => {
        const currentItems = items.length > 0 ? items : (isThumbnail ? [5, 12, 8] : [5, 12, 8, 3, 21]);
        setItems(currentItems);

        for (let i = 0; i < currentItems.length; i++) {
            if (checkShouldStop()) return;
            setOperation(`Accessing node ${i}: val=${currentItems[i]}`);
            setActiveIdx(i);
            await sleep(getDelay());
        }

        setOperation("Traversal Complete");
        setActiveIdx(null);
        complete();
    };

    const isVertical = algorithmId === 'stack';

    return (
        <div className={cn("w-full h-full flex flex-col items-center justify-center relative", isThumbnail ? "p-4" : "p-8")}>
            
            {!isThumbnail && !isPlaying && (
                <div className="absolute top-4 left-4 z-30 bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-zinc-200 shadow-sm w-[300px]">
                    <form onSubmit={handleCustomInputSubmit} className="flex gap-2">
                        <input 
                            type="text" 
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            placeholder="e.g. 10, 20, 30"
                            className="flex-1 px-3 py-1.5 text-sm bg-zinc-100 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button type="submit" className="px-3 py-1.5 bg-black text-primary text-sm font-bold rounded-lg hover:bg-zinc-800 transition-colors">
                            Set
                        </button>
                    </form>
                </div>
            )}

            {!isThumbnail && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-sm border border-zinc-200 font-mono text-sm font-bold text-zinc-700 min-w-[150px] text-center z-20">
                    {operation || "Ready — Press Play"}
                </div>
            )}

            <div className={cn(
                "flex gap-2 items-center justify-center p-8 rounded-2xl bg-zinc-50 min-w-[50%]",
                !isThumbnail && "border border-zinc-200 min-h-[300px]",
                isVertical ? "flex-col-reverse justify-end border-t-0 rounded-t-none" : "flex-row flex-wrap"
            )}>
                <AnimatePresence mode="popLayout">
                    {items.map((val, idx) => (
                        <React.Fragment key={`${idx}-${val}`}>
                            <motion.div
                                layout
                                initial={{ opacity: 0, scale: 0.8, y: isVertical ? -50 : 0, x: !isVertical ? -50 : 0 }}
                                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                exit={{ opacity: 0, scale: 0.5, y: isVertical ? -50 : 0, x: !isVertical ? -50 : 0 }}
                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                key={`item-${idx}-${val}`}
                                className={cn(
                                    "flex items-center justify-center font-bold text-lg shadow-sm border-2 transition-colors",
                                    isVertical ? "w-32 h-16 rounded-lg" : "w-16 h-16 rounded-2xl",
                                    activeIdx === idx ? "bg-primary border-primary text-black" : "bg-white border-zinc-200 text-zinc-700",
                                    algorithmId.includes('list') ? "rounded-full" : ""
                                )}
                            >
                                {val}
                            </motion.div>
                            {idx < items.length - 1 && algorithmId.includes('list') && (
                                <motion.div
                                    key={`arrow-${idx}`}
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    className="text-zinc-400 font-bold mx-1 text-xl"
                                >
                                    {algorithmId.includes('doubly') ? '<->' : '->'}
                                </motion.div>
                            )}
                            {idx === items.length - 1 && algorithmId === 'circular-linked-list' && items.length > 1 && (
                                <motion.div
                                    key="circular-arrow"
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-zinc-300 font-bold text-lg"
                                    style={{ width: `${(items.length - 1) * 72}px`, borderBottom: "2px dashed currentColor", borderRadius: "0 0 20px 20px", height: "20px", borderLeft: "2px dashed currentColor", borderRight: "2px dashed currentColor" }}
                                >
                                    <span className="absolute left-0 -top-2">←</span>
                                </motion.div>
                            )}
                        </React.Fragment>
                    ))}
                </AnimatePresence>
            </div>
            
            {!isThumbnail && (
                <div className="mt-8 text-zinc-400 text-sm font-semibold uppercase tracking-widest">
                    {algorithmId.replace(/-/g, ' ')} Visualizer
                </div>
            )}
        </div>
    );
}
