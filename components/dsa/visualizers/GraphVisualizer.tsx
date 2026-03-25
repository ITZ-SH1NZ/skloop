"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef, memo } from "react";
import { cn } from "@/lib/utils";

interface VisualizerProps {
    algorithmId: string;
    isPlaying: boolean;
    speed: number;
    onSimulationComplete?: () => void;
    isThumbnail?: boolean;
}

const TREE_NODES = [
    { id: 0, x: 50, y: 15, val: 1 },
    { id: 1, x: 30, y: 45, val: 2 },
    { id: 2, x: 70, y: 45, val: 3 },
    { id: 3, x: 15, y: 80, val: 4 },
    { id: 4, x: 45, y: 80, val: 5 },
    { id: 5, x: 85, y: 80, val: 6 },
];

const TREE_EDGES = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5]];
const BFS_ORDER = [0, 1, 2, 3, 4, 5];
const DFS_ORDER = [0, 1, 3, 4, 2, 5];

export const GraphVisualizer = memo(function GraphVisualizer({ algorithmId, isPlaying, speed, onSimulationComplete, isThumbnail }: VisualizerProps) {
    const [activeNode, setActiveNode] = useState<number | null>(null);
    const [visitedNodes, setVisitedNodes] = useState<number[]>([]);
    const [targetNode, setTargetNode] = useState<number | null>(null);
    const [customInput, setCustomInput] = useState<string>("");

    const isPlayingRef = useRef(isPlaying);
    const speedRef = useRef(speed);
    const isSortingRef = useRef(false);
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;
        reset();
        return () => { isMounted.current = false; };
    }, [algorithmId]);

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

    const reset = () => { setActiveNode(null); setVisitedNodes([]); };

    const handleCustomInputSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const num = parseInt(customInput.trim());
        if (!isNaN(num)) setTargetNode(num);
    };

    const getDelay = () => isThumbnail ? 300 : Math.max(300, 1500 - (speedRef.current * 12));
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    const checkShouldStop = () => !isSortingRef.current || !isMounted.current;

    const runSimulation = async () => {
        reset();
        await sleep(500);

        const isDFS = algorithmId.includes('depth') || algorithmId.includes('dfs') || algorithmId.includes('order');
        const order = isDFS ? DFS_ORDER : BFS_ORDER;
        const currentVisited: number[] = [];

        for (let nodeId of order) {
            if (checkShouldStop()) return;
            setActiveNode(nodeId);
            await sleep(getDelay() / 2);
            if (checkShouldStop()) return;
            currentVisited.push(nodeId);
            setVisitedNodes([...currentVisited]);
            await sleep(getDelay() / 2);
        }

        setActiveNode(null);
        if (isSortingRef.current && isMounted.current) {
            isSortingRef.current = false;
            if (onSimulationComplete) onSimulationComplete();
        }

        if (isThumbnail && isMounted.current && isPlayingRef.current) {
            await sleep(2000);
            isSortingRef.current = true;
            runSimulation();
        }
    };

    return (
        <div className={cn("w-full h-full flex flex-col items-center justify-center relative", isThumbnail ? "p-2" : "p-8")}>

            {!isThumbnail && !isPlaying && (
                <div className="absolute top-4 left-4 z-30 bg-white/80 backdrop-blur-sm p-3 rounded-xl border border-zinc-200 shadow-sm w-[300px]">
                    <form onSubmit={handleCustomInputSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={customInput}
                            onChange={(e) => setCustomInput(e.target.value)}
                            placeholder="e.g. 37 (Find Node)"
                            className="flex-1 px-3 py-1.5 text-sm bg-zinc-100 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button type="submit" className="px-3 py-1.5 bg-black text-primary text-sm font-bold rounded-lg hover:bg-zinc-800 transition-colors">
                            Find
                        </button>
                    </form>
                    {targetNode !== null && (
                        <div className="mt-2 text-xs font-semibold text-zinc-500">
                            Target: <span className="text-zinc-900 bg-primary/20 px-1 py-0.5 rounded">{targetNode}</span>
                            <button onClick={() => setTargetNode(null)} className="ml-2 text-red-500 hover:underline">Clear</button>
                        </div>
                    )}
                </div>
            )}

            <div className={cn(
                "relative w-full bg-zinc-50 overflow-hidden",
                isThumbnail ? "h-full border-0" : "aspect-square max-w-lg rounded-3xl border border-zinc-200 shadow-inner"
            )}>
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {TREE_EDGES.map(([u, v], idx) => {
                        const n1 = TREE_NODES[u];
                        const n2 = TREE_NODES[v];
                        const isVisited = visitedNodes.includes(u) && visitedNodes.includes(v);
                        return (
                            <motion.line
                                key={idx}
                                x1={`${n1.x}%`} y1={`${n1.y}%`}
                                x2={`${n2.x}%`} y2={`${n2.y}%`}
                                strokeWidth={isThumbnail ? "2" : "4"}
                                className={isVisited ? "stroke-primary" : "stroke-zinc-200"}
                                transition={{ duration: 0.5 }}
                            />
                        );
                    })}
                </svg>

                {TREE_NODES.map((node) => {
                    const isActive = activeNode === node.id;
                    const isVisited = visitedNodes.includes(node.id);
                    const isTarget = targetNode === node.val;
                    return (
                        <motion.div
                            key={node.id}
                            className={cn(
                                "absolute rounded-full flex items-center justify-center font-bold transition-colors z-10",
                                isThumbnail ? "w-8 h-8 -ml-4 -mt-4 text-xs border-2" : "w-12 h-12 -ml-6 -mt-6 text-lg border-4",
                                isActive ? "bg-white border-blue-500 scale-125 shadow-lg text-blue-500" :
                                    isTarget && !isPlaying ? "bg-primary border-primary animate-pulse shadow-xl shadow-primary/30" :
                                        isVisited ? "bg-primary border-primary text-black" :
                                            "bg-white border-zinc-200 text-zinc-400"
                            )}
                            style={{ left: `${node.x}%`, top: `${node.y}%` }}
                            layout
                        >
                            {node.val}
                        </motion.div>
                    );
                })}
            </div>

            {!isThumbnail && (
                <div className="mt-6 flex gap-6">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-400" /><span className="text-xs font-semibold text-zinc-400">Active</span></div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-primary" /><span className="text-xs font-semibold text-zinc-400">Visited</span></div>
                </div>
            )}
        </div>
    );
});
