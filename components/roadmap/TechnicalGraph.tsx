"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Send, Loader2, ZoomIn, ZoomOut, Maximize2, X, ChevronRight, CodeXml, LayoutGrid, Terminal, Database, Server, Smartphone, Cpu, Box, Network } from "lucide-react";
import { useState, useMemo } from "react";

interface GraphNode {
    id: string;
    label: string;
    description: string;
    // Raw AI coords (we ignore these and auto-layout)
    x?: number;
    y?: number;
    // Computed coords for constellation layout
    cx?: number;
    cy?: number;
}

interface GraphEdge {
    from: string;
    to: string;
}

interface RoadmapData {
    nodes: GraphNode[];
    edges: GraphEdge[];
}

// Initial empty state
const MOCK_ROADMAP: RoadmapData = {
    nodes: [],
    edges: [],
};

const getNodeIcon = (label: string) => {
    const l = label.toLowerCase();
    if (l.includes('react') || l.includes('vue') || l.includes('front')) return <LayoutGrid size={18} />;
    if (l.includes('node') || l.includes('back') || l.includes('api')) return <Server size={18} />;
    if (l.includes('sql') || l.includes('data') || l.includes('mongo')) return <Database size={18} />;
    if (l.includes('devops') || l.includes('docker') || l.includes('deploy') || l.includes('cloud')) return <Terminal size={18} />;
    if (l.includes('mobile') || l.includes('app') || l.includes('ios')) return <Smartphone size={18} />;
    if (l.includes('ai') || l.includes('ml') || l.includes('python')) return <Cpu size={18} />;
    if (l.includes('html') || l.includes('css') || l.includes('js')) return <CodeXml size={18} />;
    return <Box size={18} />;
};

export default function TechnicalGraph() {
    const [prompt, setPrompt] = useState("");
    const [roadmap, setRoadmap] = useState<RoadmapData>(MOCK_ROADMAP);
    const [isGenerating, setIsGenerating] = useState(false);
    const [zoom, setZoom] = useState(1);
    const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;

        setIsGenerating(true);

        try {
            const response = await fetch('/api/generate-roadmap', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate roadmap');
            }

            const data = await response.json();
            setRoadmap(data);
        } catch (error) {
            console.error('Error:', error);
            // Keep mock data on error
            alert('Failed to generate roadmap. Showing example.');
        } finally {
            setIsGenerating(false);
        }
    };

    // --- Constellation Auto-Layout Engine ---
    const { processedNodes, processedEdges, graphWidth, graphHeight } = useMemo(() => {
        if (!roadmap.nodes.length) return { processedNodes: [], processedEdges: [], graphWidth: 600, graphHeight: 500 };

        // 1. Calculate depths (longest path from roots) to assign columns
        const nodeDepths: Record<string, number> = {};
        const incomingEdges: Record<string, string[]> = {};
        const outgoingEdges: Record<string, string[]> = {};

        roadmap.nodes.forEach(n => {
            incomingEdges[n.id] = [];
            outgoingEdges[n.id] = [];
        });

        roadmap.edges.forEach(e => {
            if (incomingEdges[e.to]) incomingEdges[e.to].push(e.from);
            if (outgoingEdges[e.from]) outgoingEdges[e.from].push(e.to);
        });

        const calculateDepth = (nodeId: string, visited = new Set<string>()): number => {
            if (visited.has(nodeId)) return 0; // Prevent cycle loops
            visited.add(nodeId);

            const reqs = incomingEdges[nodeId] || [];
            if (reqs.length === 0) return 0;
            return 1 + Math.max(...reqs.map(reqId => calculateDepth(reqId, new Set(visited))));
        };

        roadmap.nodes.forEach(n => {
            nodeDepths[n.id] = calculateDepth(n.id);
        });

        // 2. Group by column (depth)
        const columns: Record<number, GraphNode[]> = {};
        let maxDepth = 0;
        roadmap.nodes.forEach(n => {
            const d = nodeDepths[n.id];
            if (!columns[d]) columns[d] = [];
            columns[d].push(n);
            if (d > maxDepth) maxDepth = d;
        });

        // 3. Assign Coordinates (Left to Right Constellation)
        const X_SPACING = 360;
        const Y_SPACING = 160;
        const PADDING_X = 180; // Increased padding to prevent left-side clipping
        const PADDING_Y = 120;

        const maxNodesInColumn = Math.max(...Object.values(columns).map(c => c.length));
        const totalHeight = Math.max(500, maxNodesInColumn * Y_SPACING + PADDING_Y * 2);
        const totalWidth = Math.max(600, (maxDepth + 1) * X_SPACING + PADDING_X * 2);

        const newNodes = roadmap.nodes.map(node => {
            const depth = nodeDepths[node.id];
            const colNodes = columns[depth];
            const colIdx = colNodes.findIndex(n => n.id === node.id);

            // Center the column vertically
            const colHeight = colNodes.length * Y_SPACING;
            const startY = (totalHeight - colHeight) / 2 + (Y_SPACING / 2);

            return {
                ...node,
                cx: PADDING_X + (depth * X_SPACING),
                cy: startY + (colIdx * Y_SPACING)
            };
        });

        return {
            processedNodes: newNodes,
            processedEdges: roadmap.edges,
            graphWidth: totalWidth,
            graphHeight: totalHeight
        };
    }, [roadmap]);

    const getNodePosition = (nodeId: string) => {
        const node = processedNodes.find(n => n.id === nodeId);
        return node ? { x: node.cx || 0, y: node.cy || 0 } : { x: 0, y: 0 };
    };

    return (
        <div className="space-y-6">
            {/* AI Input */}
            <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 p-4 md:p-6">
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 md:p-3 bg-gradient-to-br from-violet-100 to-purple-100 rounded-xl md:rounded-2xl">
                        <Sparkles size={20} className="text-violet-600 md:w-6 md:h-6" />
                    </div>
                    <div>
                        <h3 className="text-base md:text-lg font-bold text-zinc-900">AI Roadmap Generator</h3>
                        <p className="text-xs md:text-sm text-zinc-500">Describe what you want to learn</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                        placeholder="e.g., Learn React from scratch..."
                        className="flex-1 px-4 py-3 md:px-6 md:py-4 bg-zinc-50 border border-zinc-200 rounded-xl md:rounded-2xl text-sm md:text-base font-medium text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent"
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !prompt.trim()}
                        className="px-6 py-3 md:px-8 md:py-4 bg-zinc-900 text-white rounded-xl md:rounded-2xl font-bold text-sm md:text-base hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg active:scale-95"
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span className="hidden md:inline">Generating...</span>
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                <span className="hidden md:inline">Generate</span>
                                <span className="md:hidden">Go</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Interest Filters */}
                <div className="mt-4 flex flex-wrap gap-2">
                    {["Frontend", "Backend", "Fullstack", "DevOps", "Mobile", "AI/ML"].map((interest) => (
                        <button
                            key={interest}
                            onClick={() => setPrompt(`I want a detailed ${interest} roadmap`)}
                            className="px-3 py-1.5 rounded-lg bg-zinc-100/50 hover:bg-zinc-100 border border-zinc-200/50 text-xs font-bold text-zinc-600 transition-colors"
                        >
                            {interest}
                        </button>
                    ))}
                </div>
            </div>

            {/* Graph Visualization */}
            <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 p-4 md:p-6">
                {/* Controls */}
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-zinc-900">Technical Roadmap</h3>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setZoom(z => Math.min(z + 0.2, 2))}
                            className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors active:scale-95"
                        >
                            <ZoomIn size={18} />
                        </button>
                        <button
                            onClick={() => setZoom(z => Math.max(z - 0.2, 0.5))}
                            className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors active:scale-95"
                        >
                            <ZoomOut size={18} />
                        </button>
                    </div>
                </div>

                {/* SVG Graph wrapper for responsive scaling */}
                <div className="relative bg-[#FDFCF8] rounded-3xl overflow-hidden border border-zinc-200/60 shadow-[inset_0_2px_20px_rgba(0,0,0,0.02)] min-h-[400px] md:min-h-[600px] w-full max-w-full h-full">

                    {/* Premium Grid Pattern Background */}
                    <div className="absolute inset-0 opacity-[0.4] pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(#d4d4d8 1px, transparent 1px)',
                            backgroundSize: '24px 24px'
                        }}
                    />

                    {/* Auto-scroll container for the zooming SVG */}
                    <div className="w-full h-full overflow-auto touch-pan-x touch-pan-y no-scrollbar relative custom-cursor-grab">
                        <motion.div
                            className="absolute origin-top-left"
                            animate={{ scale: zoom }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            style={{ width: graphWidth, height: graphHeight, minWidth: '100%', minHeight: '100%' }}
                        >
                            <svg width="100%" height="100%" viewBox={`0 0 ${graphWidth} ${graphHeight}`}>

                                {/* Definitions */}
                                <defs>
                                    <linearGradient id="edgeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#d9f99d" stopOpacity="0.4" />
                                        <stop offset="100%" stopColor="#a3e635" stopOpacity="0.8" />
                                    </linearGradient>
                                    <linearGradient id="edgeGradientActive" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#bef264" stopOpacity="0.8" />
                                        <stop offset="100%" stopColor="#84cc16" stopOpacity="1" />
                                    </linearGradient>
                                    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="8" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>

                                {/* Edges (Smooth Bezier) */}
                                <g>
                                    {processedEdges.map((edge, i) => {
                                        const from = getNodePosition(edge.from);
                                        const to = getNodePosition(edge.to);
                                        const isSelected = selectedNode?.id === edge.from || selectedNode?.id === edge.to;
                                        const opacity = selectedNode ? (isSelected ? 1 : 0.1) : 0.6;

                                        // Smooth Horizontal S-Curve connecting nodes
                                        const tension = 0.5;
                                        const dx = to.x - from.x;
                                        const cp1x = from.x + dx * tension;
                                        const cp2x = to.x - dx * tension;

                                        const d = `M ${from.x} ${from.y} C ${cp1x} ${from.y}, ${cp2x} ${to.y}, ${to.x} ${to.y}`;

                                        return (
                                            <g key={`${edge.from}-${edge.to}`}>
                                                {/* Thick interaction/glow area */}
                                                <motion.path
                                                    initial={{ pathLength: 0, opacity: 0 }}
                                                    animate={{ pathLength: 1, opacity: isSelected ? 0.2 : 0 }}
                                                    transition={{ delay: i * 0.05, duration: 1, ease: "easeInOut" }}
                                                    d={d}
                                                    fill="none"
                                                    stroke="#bef264"
                                                    strokeWidth="16"
                                                    strokeLinecap="round"
                                                    className="pointer-events-none"
                                                />

                                                {/* Visible Flow Line */}
                                                <motion.path
                                                    initial={{ pathLength: 0, opacity: 0 }}
                                                    animate={{ pathLength: 1, opacity }}
                                                    transition={{ delay: i * 0.05, duration: 1, ease: "easeInOut" }}
                                                    d={d}
                                                    fill="none"
                                                    stroke={isSelected ? "url(#edgeGradientActive)" : "#e4e4e7"}
                                                    strokeWidth={isSelected ? "3" : "2"}
                                                    strokeLinecap="round"
                                                    style={{ filter: isSelected ? "url(#glow)" : "none" }}
                                                />

                                                {/* Data packets flowing on active connections */}
                                                {(isSelected || !selectedNode) && (
                                                    <motion.path
                                                        d={d}
                                                        fill="none"
                                                        stroke={isSelected ? "#ffffff" : "#a3e635"}
                                                        strokeWidth={isSelected ? "4" : "3"}
                                                        strokeDasharray="2 24"
                                                        strokeLinecap="round"
                                                        className="pointer-events-none opacity-60"
                                                        animate={{ strokeDashoffset: -104 }}
                                                        transition={{ repeat: Infinity, ease: "linear", duration: 3 }}
                                                    />
                                                )}
                                            </g>
                                        );
                                    })}
                                </g>

                                {/* Nodes (Glassmorphic React components over SVG foreignObject) */}
                                <g>
                                    {processedNodes.map((node, i) => {
                                        const isSelected = selectedNode?.id === node.id;
                                        const isDimmed = selectedNode && !isSelected &&
                                            !processedEdges.some(e => (e.from === selectedNode.id && e.to === node.id) || (e.to === selectedNode.id && e.from === node.id));

                                        return (
                                            <motion.foreignObject
                                                key={`fo-${node.id}`}
                                                x={node.cx! - 120}
                                                y={node.cy! - 40}
                                                width="240"
                                                height="80"
                                                initial={{ scale: 0, opacity: 0, y: 20 }}
                                                animate={{
                                                    scale: 1,
                                                    opacity: isDimmed ? 0.3 : 1,
                                                    y: 0,
                                                    zIndex: isSelected ? 50 : 10
                                                }}
                                                transition={{ delay: i * 0.05, type: "spring", stiffness: 200, damping: 20 }}
                                                className={`overflow-visible ${isDimmed ? 'pointer-events-none' : ''}`}
                                            >
                                                <div
                                                    onClick={() => setSelectedNode(node)}
                                                    className={`
                                                        group relative flex items-center justify-center p-3 w-full h-full cursor-pointer transition-all duration-300
                                                        ${isSelected ? 'scale-105' : 'hover:-translate-y-1'}
                                                    `}
                                                >
                                                    {/* Top-tier SaaS Card Background */}
                                                    <div className={`
                                                        absolute inset-0 rounded-[18px] backdrop-blur-xl border transition-all duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.03)]
                                                        ${isSelected
                                                            ? 'bg-white border-lime-500 shadow-[0_8px_30px_rgba(132,204,22,0.2)] ring-[4px] ring-lime-500/10'
                                                            : 'bg-white/90 border-zinc-200/80 hover:bg-white hover:border-lime-300 hover:shadow-[0_8px_30px_rgba(163,230,53,0.15)]'
                                                        }
                                                    `} />

                                                    {/* Connection "Ports" (Left and Right dots) */}
                                                    <div className={`absolute left-[-4px] top-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full transition-all duration-300 z-20 ${isSelected ? 'bg-lime-500 shadow-[0_0_12px_#bef264]' : 'bg-zinc-200 border border-white group-hover:bg-lime-400'}`} />
                                                    <div className={`absolute right-[-4px] top-1/2 -translate-y-1/2 w-[8px] h-[8px] rounded-full transition-all duration-300 z-20 ${isSelected ? 'bg-lime-500 shadow-[0_0_12px_#bef264]' : 'bg-zinc-200 border border-white group-hover:bg-lime-400'}`} />

                                                    {/* Content */}
                                                    <div className="relative z-10 flex items-center gap-3.5 w-full pl-1 pr-2">
                                                        <div className={`
                                                            w-12 h-12 rounded-[14px] flex items-center justify-center shrink-0 transition-all duration-300
                                                            ${isSelected ? 'bg-lime-500 text-white shadow-[0_4px_16px_rgba(132,204,22,0.4)]' : 'bg-zinc-100 text-zinc-500 group-hover:bg-lime-100 group-hover:text-lime-600 group-hover:shadow-sm'}
                                                        `}>
                                                            {getNodeIcon(node.label)}
                                                        </div>
                                                        <div className="flex-1 text-left overflow-hidden pt-0.5">
                                                            <div className={`text-[9px] uppercase font-bold tracking-[0.2em] mb-1 transition-colors ${isSelected ? 'text-lime-600' : 'text-zinc-400 group-hover:text-lime-500'}`}>Step {i + 1}</div>
                                                            <div className="font-bold text-[15px] leading-tight text-zinc-900 truncate">{node.label}</div>
                                                        </div>

                                                        <ChevronRight size={18} className={`shrink-0 transition-transform ${isSelected ? 'text-lime-500 translate-x-1' : 'text-zinc-300 group-hover:text-lime-400 group-hover:translate-x-0.5'}`} />
                                                    </div>
                                                </div>
                                            </motion.foreignObject>
                                        );
                                    })}
                                </g>
                            </svg>
                        </motion.div>
                    </div>

                    {/* Node Detail Tooltip */}
                    {selectedNode && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className="absolute top-4 right-4 left-4 md:left-auto md:w-80 bg-white/90 backdrop-blur-xl p-5 rounded-2xl shadow-xl border border-white/50 ring-1 ring-black/5"
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); setSelectedNode(null); }}
                                className="absolute top-3 right-3 p-1 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 18 18" /></svg>
                            </button>
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-xl bg-lime-100 flex items-center justify-center text-lime-700 font-bold border border-lime-200">
                                    {selectedNode.label.substring(0, 1)}
                                </div>
                                <h4 className="font-bold text-lg text-zinc-900 leading-tight">{selectedNode.label}</h4>
                            </div>
                            <p className="text-sm text-zinc-500 leading-relaxed font-medium mb-4">{selectedNode.description}</p>

                            {/* Dependencies Visualization */}
                            {(processedEdges.some(e => e.to === selectedNode.id) || processedEdges.some(e => e.from === selectedNode.id)) && (
                                <div className="mb-4 bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                                    <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Network</div>
                                    <div className="space-y-1">
                                        {processedEdges.filter(e => e.to === selectedNode.id).length > 0 && (
                                            <div className="text-xs flex gap-2"><span className="text-zinc-400 w-16">Requires:</span><span className="font-medium text-zinc-700"> {processedEdges.filter(e => e.to === selectedNode.id).length} topics</span></div>
                                        )}
                                        {processedEdges.filter(e => e.from === selectedNode.id).length > 0 && (
                                            <div className="text-xs flex gap-2"><span className="text-zinc-400 w-16">Unlocks:</span><span className="font-medium text-zinc-700"> {processedEdges.filter(e => e.from === selectedNode.id).length} topics</span></div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="mt-4 flex gap-2">
                                <button className="flex-1 bg-zinc-900 text-white text-xs font-bold py-2.5 rounded-xl hover:bg-zinc-800 transition-colors shadow-lg shadow-zinc-900/10">
                                    Start Learning
                                </button>
                                <button className="px-3 bg-zinc-100 text-zinc-600 rounded-xl hover:bg-zinc-200 transition-colors font-bold text-xs">
                                    Mark Done
                                </button>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Info */}
                <div className="mt-4 text-xs font-medium text-zinc-400 flex items-center gap-2 justify-center">
                    <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse"></span>
                    AI generated path • Pinch to zoom • Tap nodes for details
                </div>
            </div>
        </div>
    );
}
