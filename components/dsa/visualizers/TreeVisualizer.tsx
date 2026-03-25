"use client";

import { motion } from "framer-motion";
import { useEffect, useState, useRef, memo } from "react";
import { cn } from "@/lib/utils";

interface TreeVisualizerProps {
    algorithmId: string;
    isPlaying: boolean;
    speed: number;
    onSimulationComplete?: () => void;
    isThumbnail?: boolean;
}

// --- Preset BST tree (7 nodes) ---
const BST_NODES_FULL = [
    { id: 0, val: 50, x: 50, y: 10 },
    { id: 1, val: 30, x: 25, y: 35 },
    { id: 2, val: 70, x: 75, y: 35 },
    { id: 3, val: 20, x: 12, y: 65 },
    { id: 4, val: 40, x: 38, y: 65 },
    { id: 5, val: 60, x: 62, y: 65 },
    { id: 6, val: 80, x: 88, y: 65 },
];
const BST_NODES_THUMB = [
    { id: 0, val: 50, x: 50, y: 15 },
    { id: 1, val: 30, x: 25, y: 50 },
    { id: 2, val: 70, x: 75, y: 50 },
];
const BST_EDGES = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];
const BST_EDGES_THUMB = [[0, 1], [0, 2]];

// Inorder: 3,1,4,0,5,2,6 -> indices
const INORDER = [3, 1, 4, 0, 5, 2, 6];
const PREORDER = [0, 1, 3, 4, 2, 5, 6];
const POSTORDER = [3, 4, 1, 5, 6, 2, 0];
const BFS_ORDER = [0, 1, 2, 3, 4, 5, 6];

function getTraversalOrder(id: string): number[] {
    if (id.includes('breadth') || id.includes('bfs') || id === 'binary-heap') return BFS_ORDER;
    if (id.includes('post')) return POSTORDER;
    if (id.includes('pre')) return PREORDER;
    return INORDER; // default for BST, AVL, tree-traversals
}

// --- Heap layout (visualise as array + tree) ---
const HEAP_NODES = [
    { id: 0, val: 10, x: 50, y: 10 },
    { id: 1, val: 20, x: 25, y: 40 },
    { id: 2, val: 30, x: 75, y: 40 },
    { id: 3, val: 40, x: 12, y: 70 },
    { id: 4, val: 50, x: 38, y: 70 },
    { id: 5, val: 60, x: 62, y: 70 },
    { id: 6, val: 70, x: 88, y: 70 },
];
const HEAP_EDGES = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6]];

// --- Trie layout ---
const TRIE_NODES = [
    { id: 0, val: "root", x: 50, y: 8 },
    { id: 1, val: "c", x: 25, y: 30 },
    { id: 2, val: "t", x: 75, y: 30 },
    { id: 3, val: "a", x: 15, y: 55 },
    { id: 4, val: "o", x: 35, y: 55 },
    { id: 5, val: "r", x: 65, y: 55 },
    { id: 6, val: "r", x: 85, y: 55 },
    { id: 7, val: "t", x: 15, y: 80 },
    { id: 8, val: "de", x: 65, y: 80 },
];
const TRIE_EDGES = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5], [2, 6], [3, 7], [5, 8]];

export const TreeVisualizer = memo(function TreeVisualizer({ algorithmId, isPlaying, speed, onSimulationComplete, isThumbnail }: TreeVisualizerProps) {
    const [visitedNodes, setVisitedNodes] = useState<number[]>([]);
    const [activeNode, setActiveNode] = useState<number | null>(null);
    const [operation, setOperation] = useState<string>("");

    const isPlayingRef = useRef(isPlaying);
    const speedRef = useRef(speed);
    const isSortingRef = useRef(false);
    const isMounted = useRef(false);

    // Select dataset based on algo
    const isTrie = algorithmId === 'trie';
    const isHeap = algorithmId === 'binary-heap';

    const nodes = isTrie ? TRIE_NODES : isHeap ? HEAP_NODES : (isThumbnail ? BST_NODES_THUMB : BST_NODES_FULL);
    const edges = isTrie ? TRIE_EDGES : isHeap ? HEAP_EDGES : (isThumbnail ? BST_EDGES_THUMB : BST_EDGES);

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

    const reset = () => { setActiveNode(null); setVisitedNodes([]); setOperation(""); };
    const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));
    const getDelay = () => isThumbnail ? 400 : Math.max(300, 1500 - speedRef.current * 12);
    const checkStop = () => !isSortingRef.current || !isMounted.current;

    const runSimulation = async () => {
        reset();
        await sleep(400);

        if (isTrie) {
            // Simulate word insertion
            const words = ["cat", "car", "tree"];
            for (const word of words) {
                if (checkStop()) return;
                setOperation(`Insert: "${word}"`);
                for (let i = 0; i < TRIE_NODES.length; i++) {
                    if (checkStop()) return;
                    setActiveNode(i);
                    await sleep(getDelay() / 2);
                    setVisitedNodes(v => [...v, i]);
                }
                await sleep(getDelay());
            }
        } else if (isHeap) {
            // BFS-order heapify animation
            for (const nodeId of BFS_ORDER.slice(0, nodes.length)) {
                if (checkStop()) return;
                setOperation(`Heapify: node ${nodes[nodeId]?.val}`);
                setActiveNode(nodeId);
                await sleep(getDelay() / 2);
                setVisitedNodes(v => [...v, nodeId]);
                await sleep(getDelay() / 2);
            }
        } else {
            // BST/AVL traversal
            const order = getTraversalOrder(algorithmId);
            const validOrder = order.filter(i => i < nodes.length);
            const name = algorithmId.includes('bfs') || algorithmId.includes('breadth') ? 'BFS' :
                algorithmId.includes('post') ? 'Postorder' :
                    algorithmId.includes('pre') ? 'Preorder' : 'Inorder';

            for (const nodeId of validOrder) {
                if (checkStop()) return;
                setOperation(`${name}: visit ${nodes[nodeId]?.val}`);
                setActiveNode(nodeId);
                await sleep(getDelay() / 2);
                setVisitedNodes(v => [...v, nodeId]);
                await sleep(getDelay() / 2);
            }
        }

        setActiveNode(null);
        setOperation("Complete");
        if (isSortingRef.current && isMounted.current) {
            isSortingRef.current = false;
            if (onSimulationComplete) onSimulationComplete();
        }

        if (isThumbnail && isMounted.current && isPlayingRef.current) {
            await sleep(2000);
            reset();
            isSortingRef.current = true;
            runSimulation();
        }
    };

    return (
        <div className={cn("w-full h-full flex flex-col items-center justify-center relative", isThumbnail ? "p-2" : "p-6")}>
            {!isThumbnail && operation && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white px-4 py-2 rounded-full shadow-sm border border-zinc-200 font-mono text-sm font-bold text-zinc-700 min-w-[160px] text-center z-20">
                    {operation}
                </div>
            )}

            <div className={cn("relative w-full bg-zinc-50 overflow-hidden", isThumbnail ? "h-full border-0" : "max-w-xl h-[360px] rounded-3xl border border-zinc-200 shadow-inner")}>
                {/* SVG Edges */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    {edges.map(([u, v], idx) => {
                        const n1 = nodes[u];
                        const n2 = nodes[v];
                        if (!n1 || !n2) return null;
                        const isLit = visitedNodes.includes(u) && visitedNodes.includes(v);
                        return (
                            <motion.line
                                key={idx}
                                x1={`${n1.x}%`} y1={`${n1.y}%`}
                                x2={`${n2.x}%`} y2={`${n2.y}%`}
                                strokeWidth={isThumbnail ? "2" : "3"}
                                className={isLit ? "stroke-primary" : "stroke-zinc-200"}
                                transition={{ duration: 0.4 }}
                            />
                        );
                    })}
                </svg>

                {/* Nodes */}
                {nodes.map((node) => {
                    const isActive = activeNode === node.id;
                    const isVisited = visitedNodes.includes(node.id);
                    return (
                        <motion.div
                            key={node.id}
                            className={cn(
                                "absolute flex items-center justify-center font-bold rounded-full z-10 transition-colors",
                                isThumbnail ? "w-7 h-7 -ml-3.5 -mt-3.5 text-[10px] border-2" : "w-11 h-11 -ml-5.5 -mt-5.5 text-sm border-[3px]",
                                isActive
                                    ? "bg-blue-400 border-blue-400 text-white scale-125 shadow-lg"
                                    : isVisited
                                        ? "bg-primary border-primary text-black"
                                        : "bg-white border-zinc-300 text-zinc-500"
                            )}
                            style={{ left: `${node.x}%`, top: `${node.y}%` }}
                            layout
                            animate={isActive ? { scale: 1.25 } : { scale: 1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 20 }}
                        >
                            {isTrie ? node.val : node.val}
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
