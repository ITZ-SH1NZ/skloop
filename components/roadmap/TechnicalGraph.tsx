"use client";

import { motion } from "framer-motion";
import { Sparkles, Send, Loader2, ZoomIn, ZoomOut } from "lucide-react";
import { useState } from "react";

interface GraphNode {
    id: string;
    label: string;
    description: string;
    x: number;
    y: number;
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

    const getNodePosition = (nodeId: string) => {
        const node = roadmap.nodes.find(n => n.id === nodeId);
        return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
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
            <div className="bg-white rounded-[2rem] border border-zinc-200 shadow-xl shadow-zinc-200/50 p-4 md:p-6 overflow-hidden">
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
                <div className="relative bg-gradient-to-br from-zinc-50/50 to-white rounded-2xl overflow-hidden border border-zinc-100 shadow-inner" style={{ height: '500px' }}>

                    {/* Grid Pattern Background */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
                        style={{
                            backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }}
                    />

                    <div className="w-full h-full overflow-auto md:overflow-hidden touch-pan-x touch-pan-y">
                        <svg
                            width="100%"
                            height="100%"
                            viewBox="0 0 600 500"
                            preserveAspectRatio="xMidYMid meet"
                            style={{ transform: `scale(${zoom})`, transition: 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)', transformOrigin: 'center' }}
                        >
                            {/* Edges */}
                            <g>
                                {roadmap.edges.map((edge, i) => {
                                    const from = getNodePosition(edge.from);
                                    const to = getNodePosition(edge.to);
                                    return (
                                        <motion.path
                                            key={`${edge.from}-${edge.to}`}
                                            initial={{ pathLength: 0, opacity: 0 }}
                                            animate={{ pathLength: 1, opacity: 0.4 }}
                                            transition={{ delay: i * 0.1, duration: 1.5, ease: "easeInOut" }}
                                            d={`M ${from.x} ${from.y} C ${from.x} ${(from.y + to.y) / 2}, ${to.x} ${(from.y + to.y) / 2}, ${to.x} ${to.y}`}
                                            fill="none"
                                            stroke="#84cc16"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            className="drop-shadow-sm"
                                        />
                                    );
                                })}
                            </g>

                            {/* Nodes */}
                            <g>
                                {roadmap.nodes.map((node, i) => (
                                    <motion.g
                                        key={node.id}
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: i * 0.15, type: "spring", bounce: 0.4 }}
                                        onClick={() => setSelectedNode(node)}
                                        className="cursor-pointer group"
                                    >
                                        {/* Node Glow */}
                                        <circle
                                            cx={node.x}
                                            cy={node.y}
                                            r="45"
                                            fill="#bef264"
                                            opacity="0"
                                            className="group-hover:opacity-20 transition-opacity duration-300"
                                        />

                                        {/* Node Body */}
                                        <circle
                                            cx={node.x}
                                            cy={node.y}
                                            r="35"
                                            fill="url(#nodeGradient)"
                                            stroke="white"
                                            strokeWidth="4"
                                            className="drop-shadow-lg transition-transform duration-300 group-hover:scale-110"
                                        />

                                        {/* Node Icon/Text */}
                                        <text
                                            x={node.x}
                                            y={node.y}
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            className="text-[10px] font-bold fill-zinc-700 pointer-events-none uppercase tracking-wider"
                                        >
                                            {node.label.substring(0, 3)}
                                        </text>
                                    </motion.g>
                                ))}
                            </g>

                            {/* Labels (Separate layer for legibility) */}
                            <g>
                                {roadmap.nodes.map((node, i) => (
                                    <motion.foreignObject
                                        key={`label-${node.id}`}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.15 + 0.5 }}
                                        x={node.x - 60}
                                        y={node.y + 40}
                                        width="120"
                                        height="40"
                                        className="pointer-events-none"
                                    >
                                        <div className="text-center">
                                            <div className="text-xs font-bold text-zinc-900 bg-white/80 backdrop-blur-md px-2 py-1 rounded-lg shadow-sm inline-block border border-zinc-100">
                                                {node.label}
                                            </div>
                                        </div>
                                    </motion.foreignObject>
                                ))}
                            </g>

                            {/* Definitions */}
                            <defs>
                                <linearGradient id="nodeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                    <stop offset="0%" stopColor="#f7fee7" />
                                    <stop offset="100%" stopColor="#d9f99d" />
                                </linearGradient>
                            </defs>
                        </svg>
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
                            <p className="text-sm text-zinc-500 leading-relaxed font-medium">{selectedNode.description}</p>

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
