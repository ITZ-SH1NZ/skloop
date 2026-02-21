"use client";

import React, { useState, useCallback, useMemo } from 'react';
import {
    ReactFlow,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Panel,
    MarkerType,
    Node,
    Edge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Play, RotateCcw, CheckCircle, Info, Database } from 'lucide-react';
import { motion } from 'framer-motion';

// Custom Node Types can be added here if needed

interface FlowchartChallengeProps {
    challengeData: {
        task: string;
        requiredNodes: string[];
        expectedConnections: { from: string; to: string }[];
    };
    onComplete: () => void;
}

const initialNodes: Node[] = [
    { id: '1', position: { x: 250, y: 50 }, data: { label: 'Start' }, type: 'input' },
];

export default function FlowchartChallenge({ challengeData, onComplete }: FlowchartChallengeProps) {
    const [nodes, setNodes, onNodesChange] = useNodesState<Node>(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [isValidating, setIsValidating] = useState(false);
    const [isPassed, setIsPassed] = useState(false);

    const onConnect = useCallback(
        (params: any) => setEdges((eds) => addEdge({
            ...params,
            markerEnd: { type: MarkerType.ArrowClosed, color: '#18181b' },
            style: { stroke: '#18181b', strokeWidth: 2 }
        }, eds)),
        [setEdges]
    );

    const handleCheck = () => {
        setIsValidating(true);
        // Logic to check if the flowchart is correct
        // For now, simple success after timeout
        setTimeout(() => {
            setIsPassed(true);
            setIsValidating(false);
        }, 1200);
    };

    const addNode = (type: string) => {
        const id = (nodes.length + 1).toString();
        const newNode = {
            id,
            position: { x: 100, y: 100 + nodes.length * 50 },
            data: { label: type },
            style: type === 'Decision' ? { borderRadius: '50px', background: '#fef3c7', border: '2px solid #f59e0b' } : {}
        };
        setNodes((nds) => nds.concat(newNode as any));
    };

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-3xl overflow-hidden shadow-2xl border border-zinc-200">
            {/* Header Panel */}
            <div className="bg-zinc-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Database size={20} className="text-lime-400" />
                    <div>
                        <h3 className="font-bold text-sm">Logic Builder</h3>
                        <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-bold">Flowchart Challenge</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => { setNodes(initialNodes as any); setEdges([]); }} className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400">
                        <RotateCcw size={18} />
                    </button>
                    {!isPassed ? (
                        <button
                            onClick={handleCheck}
                            disabled={isValidating}
                            className="flex items-center gap-2 px-6 py-2 bg-lime-400 text-zinc-900 rounded-xl font-black transition-all active:scale-95"
                        >
                            <Play size={18} fill="currentColor" />
                            {isValidating ? "Validating..." : "Test Logic"}
                        </button>
                    ) : (
                        <button onClick={onComplete} className="px-6 py-2 bg-white text-zinc-900 rounded-xl font-black">
                            Finish Lesson
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Toolbox */}
                <div className="w-48 bg-zinc-50 border-r border-zinc-200 p-4 space-y-3">
                    <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-4">Components</div>
                    <button onClick={() => addNode('Step')} className="w-full p-3 bg-white border border-zinc-200 rounded-xl text-left text-xs font-bold shadow-sm hover:border-zinc-400 transition-all">+ Action Step</button>
                    <button onClick={() => addNode('Decision')} className="w-full p-3 bg-amber-50 border border-amber-200 rounded-xl text-left text-xs font-bold shadow-sm hover:border-amber-400 transition-all text-amber-700">+ Decision</button>
                    <button onClick={() => addNode('End')} className="w-full p-3 bg-zinc-100 border border-zinc-200 rounded-xl text-left text-xs font-bold shadow-sm hover:border-zinc-400 transition-all">+ End Node</button>

                    <div className="mt-8 pt-8 border-t border-zinc-200">
                        <div className="flex items-center gap-2 text-zinc-400 mb-2">
                            <Info size={12} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">Goal</span>
                        </div>
                        <p className="text-xs text-zinc-500 leading-relaxed italic">
                            "{challengeData.task}"
                        </p>
                    </div>
                </div>

                {/* Canvas */}
                <div className="flex-1 bg-zinc-100/50">
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        fitView
                    >
                        <Background />
                        <Controls />
                        <MiniMap />
                    </ReactFlow>
                </div>
            </div>
        </div>
    );
}
