"use client";

import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import {
    ReactFlow,
    addEdge,
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    Panel,
    Handle,
    Position,
    NodeProps,
    Edge,
    Node,
    Connection,
    useReactFlow,
    useNodes
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Play, RotateCcw, Plus, Trash2, Terminal, MousePointerClick } from 'lucide-react';
import { useMediaQuery } from "@/hooks/use-media-query";
import TestResultsModal, { TestResult } from "./TestResultsModal";

// --- Code Safety Validator (FIX 8) ---
const BLOCKED_PATTERNS = [
    /fetch\s*\(/i, /XMLHttpRequest/i, /import\s*\(/i,
    /\bdocument\b/, /\bwindow\b/, /\blocalStorage\b/, /\bsessionStorage\b/,
    /\beval\s*\(/, /new\s+Function/i, /:\/\//
]
function isSafeCode(code: string): boolean {
    return !BLOCKED_PATTERNS.some(p => p.test(code))
}


// --- NODE TYPES ---

interface FlowchartNodeData extends Record<string, unknown> {
    label: string;
    code?: string;
    params?: string;
    callId?: string;
    callArgs?: Record<string, string>;
    onChange?: (id: string, value: any, field?: string) => void;
}

// Base styling for nodes
const nodeBaseStyle = "px-4 py-2 shadow-md border-2 bg-white text-xs font-mono font-bold text-center min-w-[100px] flex flex-col items-center justify-center transition-all hover:shadow-lg active:scale-95";

// --- NODE COMPONENTS ---

// Start Node - Oval Function Header
function StartNode({ data, id }: NodeProps) {
    const { code, params, onChange } = data as FlowchartNodeData & { params?: string };
    const isMain = id === 'start'; // The absolute initial block
    
    const allNodes = useNodes();
    const myName = (code || (isMain ? 'main' : '')).trim();
    const isDuplicate = !isMain && myName && allNodes.some(n => n.id !== id && n.type === 'start' && ((n.data.code as string || '').trim() || (n.id === 'start' ? 'main' : '')) === myName);

    return (
        <div className="relative group">
            <div className={`px-5 py-3 rounded-full border-2 ${isDuplicate ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'} shadow-sm flex flex-col items-center justify-center gap-1.5 min-w-[140px] transition-colors`}>
                <div className={`text-[9px] uppercase tracking-widest ${isDuplicate ? 'text-red-600' : 'text-green-600/70'} font-bold mb-[-2px] select-none`}>START</div>
                <input
                    className={`w-[110px] text-[10px] p-0.5 border-b ${isDuplicate ? 'border-red-300 text-red-800' : 'border-green-300 text-green-800'} text-center font-bold bg-transparent focus:outline-none placeholder-zinc-400 transition-colors ${isMain ? 'cursor-not-allowed opacity-80' : ''}`}
                    value={code || (isMain ? 'main' : '')}
                    onChange={(evt) => !isMain && onChange && onChange(id, evt.target.value, 'code')}
                    placeholder="functionName"
                    readOnly={isMain}
                />
                <input
                    className={`w-[110px] text-[9px] p-1 border ${isDuplicate ? 'border-red-200 text-red-800' : 'border-green-200 text-green-800'} rounded-md text-center font-mono bg-white/60 focus:outline-none focus:bg-white transition-all placeholder-green-300/80`}
                    value={params || ''}
                    onChange={(evt) => onChange && onChange(id, evt.target.value, 'params')}
                    placeholder="params (x,y)"
                />
            </div>
            {isDuplicate && <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 text-red-600 font-bold text-[8px] whitespace-nowrap bg-white px-1.5 py-0.5 shadow-sm border border-red-200 rounded-full z-30 pointer-events-none">Duplicate Name!</div>}
            <Handle type="source" position={Position.Bottom} className={`w-7 h-7 md:w-3 md:h-3 ${isDuplicate ? 'bg-red-500' : 'bg-green-500'} border-2 border-white`} />
        </div>
    );
}

// End Node - Oval
function EndNode({ data }: NodeProps) {
    return (
        <div className="relative group">
            <Handle type="target" position={Position.Top} className="w-7 h-7 md:w-3 md:h-3 bg-red-400 border-2 border-white" />
            <div className={`px-6 py-3 rounded-full border-2 border-red-500 bg-red-50 shadow-sm text-red-700 font-bold text-xs tracking-wider min-w-[80px] text-center`}>
                END
            </div>
        </div>
    );
}

// Process Node - Rectangle
function ProcessNode({ data, id }: NodeProps) {
    const { code, onChange } = data as FlowchartNodeData;
    return (
        <div className="relative">
            <Handle type="target" position={Position.Top} className="w-7 h-7 md:w-3 md:h-3 bg-blue-500 border-2 border-white" />
            <div className={`${nodeBaseStyle} border-blue-500 rounded-lg`}>
                <div className="text-blue-600 mb-1 uppercase tracking-wide text-[10px]">Process</div>
                <input
                    className="w-full text-xs p-1.5 border border-zinc-200 rounded text-center font-mono bg-zinc-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    value={code || ''}
                    onChange={(evt) => onChange && onChange(id, evt.target.value)}
                    placeholder="ctx.x = 10"
                />
            </div>
            <Handle type="source" position={Position.Bottom} className="w-7 h-7 md:w-3 md:h-3 bg-blue-500 border-2 border-white" />
        </div>
    );
}

// Input Node - Parallelogram (Blue/Cyan)
function InputNode({ data, id }: NodeProps) {
    const { code, onChange } = data as FlowchartNodeData;
    return (
        <div className="relative">
            <Handle type="target" position={Position.Top} className="w-7 h-7 md:w-3 md:h-3 bg-cyan-500 border-2 border-white z-10" />

            <div className={`${nodeBaseStyle} border-cyan-500 bg-white transform -skew-x-12 rounded-sm`}>
                <div className="transform skew-x-12">
                    <div className="text-cyan-700 mb-1 uppercase tracking-wide text-[10px]">INPUT</div>
                    <input
                        className="w-full text-xs p-1.5 border border-zinc-200 rounded text-center font-mono bg-zinc-50 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 transition-all placeholder:text-zinc-300"
                        value={code || ''}
                        onChange={(evt) => onChange && onChange(id, evt.target.value)}
                        placeholder='ctx.name = "User"'
                    />
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="w-7 h-7 md:w-3 md:h-3 bg-cyan-500 border-2 border-white z-10" />
        </div>
    );
}


// Output Node - Parallelogram (Purple)
function OutputNode({ data, id }: NodeProps) {
    const { code, onChange } = data as FlowchartNodeData;
    return (
        <div className="relative">
            <Handle type="target" position={Position.Top} className="w-7 h-7 md:w-3 md:h-3 bg-purple-500 border-2 border-white z-10" />

            <div className={`${nodeBaseStyle} border-purple-500 bg-white transform -skew-x-12 rounded-sm`}>
                <div className="transform skew-x-12">
                    <div className="text-purple-700 mb-1 uppercase tracking-wide text-[10px]">PRINT</div>
                    <input
                        className="w-full text-xs p-1.5 border border-zinc-200 rounded text-center font-mono bg-zinc-50 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all placeholder:text-zinc-300"
                        value={code || ''}
                        onChange={(evt) => onChange && onChange(id, evt.target.value)}
                        placeholder='ctx.x or "msg"'
                    />
                </div>
            </div>

            <Handle type="source" position={Position.Bottom} className="w-7 h-7 md:w-3 md:h-3 bg-purple-500 border-2 border-white z-10" />
        </div>
    );
}

// Decision Node - Diamond
function DecisionNode({ data, id }: NodeProps) {
    const { code, onChange } = data as FlowchartNodeData;
    return (
        <div className="relative flex items-center justify-center p-6">
            <Handle type="target" position={Position.Top} className="w-7 h-7 md:w-3 md:h-3 bg-orange-500 border-2 border-white z-20 -mt-6" />

            {/* Diamond Shape */}
            <div className="absolute w-24 h-24 border-2 border-orange-500 bg-white transform rotate-45 z-0 rounded-sm shadow-sm hover:shadow-md transition-shadow" />

            {/* Content (Un-rotated) */}
            <div className="relative z-10 flex flex-col items-center w-32">
                <div className="font-bold text-orange-700 mb-1 text-[10px] uppercase tracking-wide bg-white/50 px-1 rounded">IF Condition</div>
                <input
                    className="w-24 text-[10px] p-1 border border-zinc-200 rounded text-center font-mono bg-white/90 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-all"
                    value={code || ''}
                    onChange={(evt) => onChange && onChange(id, evt.target.value)}
                    placeholder="x > 5"
                />
            </div>
            <div className="absolute w-full flex justify-between px-2 pointer-events-none z-20">
                {/* Labels */}
                <span className="text-[9px] font-bold text-red-500 bg-white px-1 -ml-6 mt-8">False</span>
                <span className="text-[9px] font-bold text-green-600 bg-white px-1 -mr-6 mt-8">True</span>
            </div>

            <Handle type="source" position={Position.Left} id="false" className="w-7 h-7 md:w-3 md:h-3 bg-red-400 border-2 border-white z-20 -ml-7" />
            <Handle type="source" position={Position.Right} id="true" className="w-7 h-7 md:w-3 md:h-3 bg-green-400 border-2 border-white z-20 -mr-7" />
        </div>
    );
}

// For Loop Node - Hexagon
function ForNode({ data, id }: NodeProps) {
    const { code, onChange } = data as FlowchartNodeData;
    return (
        <div className="relative flex items-center justify-center p-2 w-[200px] h-[80px]">
            <Handle type="target" position={Position.Top} className="w-7 h-7 md:w-3 md:h-3 bg-pink-500 border-2 border-white z-20" />

            <svg className="absolute inset-0 w-full h-full z-0 overflow-visible" style={{ pointerEvents: 'none' }}>
                <polygon points="15,10 185,10 195,40 185,70 15,70 5,40" fill="white" stroke="#ec4899" strokeWidth="2"
                    style={{ filter: 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))' }} />
            </svg>

            <div className="relative z-10 flex flex-col items-center justify-center w-full mt-2">
                <div className="font-bold text-pink-700 text-[10px] uppercase tracking-wide bg-white px-2 rounded mb-1">FOR LOOP</div>
                <input
                    className="w-36 text-[10px] p-1 border border-pink-200 rounded text-center font-mono bg-white focus:outline-none focus:border-pink-400 transition-all"
                    value={code || ''}
                    onChange={(evt) => onChange && onChange(id, evt.target.value)}
                    placeholder="i=0; i<10; i++"
                />
            </div>

            <Handle type="source" position={Position.Left} id="false" className="w-7 h-7 md:w-3 md:h-3 bg-red-400 border-2 border-white z-20 left-[5px]" />
            <Handle type="source" position={Position.Right} id="true" className="w-7 h-7 md:w-3 md:h-3 bg-green-400 border-2 border-white z-20 right-[5px]" />
            
            <span className="absolute left-[-15px] top-[20px] text-[9px] font-bold text-red-500 bg-white/80 px-1 z-30 pointer-events-none">Exit</span>
            <span className="absolute right-[-15px] top-[20px] text-[9px] font-bold text-green-600 bg-white/80 px-1 z-30 pointer-events-none">Loop</span>
        </div>
    );
}

// While Loop Node - Hexagon (Same visual as For)
function WhileNode({ data, id }: NodeProps) {
    const { code, onChange } = data as FlowchartNodeData;
    return (
        <div className="relative flex items-center justify-center p-2 w-[200px] h-[80px]">
            <Handle type="target" position={Position.Top} className="w-7 h-7 md:w-3 md:h-3 bg-pink-500 border-2 border-white z-20" />

            <svg className="absolute inset-0 w-full h-full z-0 overflow-visible" style={{ pointerEvents: 'none' }}>
                <polygon points="15,10 185,10 195,40 185,70 15,70 5,40" fill="white" stroke="#ec4899" strokeWidth="2"
                    style={{ filter: 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))' }} />
            </svg>

            <div className="relative z-10 flex flex-col items-center justify-center w-full mt-2">
                <div className="font-bold text-pink-700 text-[10px] uppercase tracking-wide bg-white px-2 rounded mb-1">WHILE LOOP</div>
                <input
                    className="w-36 text-[10px] p-1 border border-pink-200 rounded text-center font-mono bg-white focus:outline-none focus:border-pink-400 transition-all"
                    value={code || ''}
                    onChange={(evt) => onChange && onChange(id, evt.target.value)}
                    placeholder="x < 10"
                />
            </div>

            <Handle type="source" position={Position.Left} id="false" className="w-7 h-7 md:w-3 md:h-3 bg-red-400 border-2 border-white z-20 left-[5px]" />
            <Handle type="source" position={Position.Right} id="true" className="w-7 h-7 md:w-3 md:h-3 bg-green-400 border-2 border-white z-20 right-[5px]" />
            
            <span className="absolute left-[-15px] top-[20px] text-[9px] font-bold text-red-500 bg-white/80 px-1 z-30 pointer-events-none">Exit</span>
            <span className="absolute right-[-15px] top-[20px] text-[9px] font-bold text-green-600 bg-white/80 px-1 z-30 pointer-events-none">Loop</span>
        </div>
    );
}

// Repeat Node - Circular Arrow (for while loop  connections)
function RepeatNode({ data }: NodeProps) {
    return (
        <div className="relative">
            <Handle type="target" position={Position.Top} className="w-7 h-7 md:w-3 md:h-3 bg-indigo-500 border-2 border-white z-10" />

            <div className="px-4 py-2 rounded-full border-2 border-indigo-500 bg-indigo-50 shadow-sm flex items-center justify-center min-w-[80px]">
                <span className="text-indigo-700 font-bold text-xs tracking-wider">↻ REPEAT</span>
            </div>

            <Handle type="source" position={Position.Bottom} className="w-7 h-7 md:w-3 md:h-3 bg-indigo-500 border-2 border-white z-10" />
        </div>
    );
}


// Do-While Node
function DoWhileNode({ data, id }: NodeProps) {
    const { code, onChange } = data as FlowchartNodeData;
    return (
        <div className="relative flex flex-col items-center justify-center p-2 mt-4">
            <Handle type="target" position={Position.Top} className="w-7 h-7 md:w-3 md:h-3 bg-pink-500 border-2 border-white z-20 top-0 mt-[1px]" />

            <div className={`${nodeBaseStyle} border-pink-500 rounded-md bg-white border-2 min-w-[120px] shadow-sm z-10`}>
                <div className="text-pink-600 mb-1 uppercase tracking-wide text-[10px] font-bold">DO</div>
                <span className="text-zinc-400 text-[10px] italic mb-1">execute block</span>
            </div>

            <div className="w-[2px] h-6 bg-pink-500 z-0 my-[-2px]"></div>

            <div className="relative flex items-center justify-center p-2 w-[200px] h-[80px]">
                <svg className="absolute inset-0 w-full h-full z-0 overflow-visible" style={{ pointerEvents: 'none' }}>
                    <polygon points="15,10 185,10 195,40 185,70 15,70 5,40" fill="white" stroke="#ec4899" strokeWidth="2" style={{ filter: 'drop-shadow(0 1px 2px rgb(0 0 0 / 0.1))' }} />
                </svg>

                <div className="relative z-10 flex flex-col items-center justify-center w-full mt-2">
                    <div className="font-bold text-pink-700 text-[10px] uppercase tracking-wide bg-white px-2 rounded mb-1">WHILE</div>
                    <input
                        className="w-36 text-[10px] p-1 border border-pink-200 rounded text-center font-mono bg-white focus:outline-none focus:border-pink-400 transition-all"
                        value={code || ''}
                        onChange={(evt) => onChange && onChange(id, evt.target.value)}
                        placeholder="x < 10"
                    />
                </div>

                <Handle type="source" position={Position.Left} id="false" className="w-7 h-7 md:w-3 md:h-3 bg-red-400 border-2 border-white z-20 left-[5px]" />
                <Handle type="source" position={Position.Right} id="true" className="w-7 h-7 md:w-3 md:h-3 bg-green-400 border-2 border-white z-20 right-[5px]" />
                
                <span className="absolute left-[-15px] top-[20px] text-[9px] font-bold text-red-500 bg-white/80 px-1 z-30 pointer-events-none">Exit</span>
                <span className="absolute right-[-15px] top-[20px] text-[9px] font-bold text-green-600 bg-white/80 px-1 z-30 pointer-events-none">Loop</span>
            </div>
        </div>
    );
}
// Return Node - Oval
function ReturnNode({ data, id }: NodeProps) {
    const { code, onChange } = data as FlowchartNodeData;
    return (
        <div className="relative group">
            <Handle type="target" position={Position.Top} className="w-7 h-7 md:w-3 md:h-3 bg-rose-500 border-2 border-white" />
            <div className={`px-4 py-3 rounded-full border-2 border-rose-500 bg-rose-50 shadow-sm text-rose-700 font-bold text-xs tracking-wider min-w-[100px] text-center flex flex-col items-center justify-center`}>
                <div className="text-[10px] mb-1">RETURN</div>
                <input
                    className="w-16 text-[10px] p-1 border border-rose-200 rounded text-center font-mono bg-white focus:outline-none focus:border-rose-400 transition-all text-rose-900"
                    value={code || ''}
                    onChange={(evt) => onChange && onChange(id, evt.target.value)}
                    placeholder="val"
                />
            </div>
        </div>
    );
}

// Break Node - Small Rectangle
function BreakNode({ data }: NodeProps) {
    return (
        <div className="relative group">
            <Handle type="target" position={Position.Top} className="w-7 h-7 md:w-3 md:h-3 bg-red-500 border-2 border-white" />
            <div className={`px-4 py-2 rounded-md border-2 border-red-500 bg-red-50 shadow-sm text-red-700 font-bold text-[10px] tracking-wider min-w-[60px] text-center flex items-center justify-center`}>
                BREAK
            </div>
        </div>
    );
}

// Continue Node - Small Rectangle (Yellow)
function ContinueNode({ data }: NodeProps) {
    return (
        <div className="relative group">
            <Handle type="target" position={Position.Top} className="w-7 h-7 md:w-3 md:h-3 bg-yellow-500 border-2 border-white" />
            <div className={`px-4 py-2 rounded-md border-2 border-yellow-500 bg-yellow-50 shadow-sm text-yellow-700 font-bold text-[10px] tracking-wider min-w-[60px] text-center flex items-center justify-center`}>
                CONTINUE
            </div>
        </div>
    );
}

// Pass Node - Small Rectangle (Grey)
function PassNode({ data }: NodeProps) {
    return (
        <div className="relative group">
            <Handle type="target" position={Position.Top} className="w-7 h-7 md:w-3 md:h-3 bg-zinc-400 border-2 border-white" />
            <div className={`px-4 py-2 rounded-md border-2 border-zinc-400 bg-zinc-50 shadow-sm text-zinc-600 font-bold text-[10px] tracking-wider min-w-[60px] text-center flex items-center justify-center`}>
                PASS
            </div>
            <Handle type="source" position={Position.Bottom} className="w-7 h-7 md:w-3 md:h-3 bg-zinc-400 border-2 border-white" />
        </div>
    );
}

// Switch Node - Wide Hexagon (Amber)
function SwitchNode({ data, id }: NodeProps) {
    const { code, onChange } = data as FlowchartNodeData;
    return (
        <div className="relative flex flex-col items-center justify-center w-[120px] h-[60px]">
            <Handle type="target" position={Position.Top} className="w-7 h-7 md:w-3 md:h-3 bg-amber-500 border-2 border-white z-20 top-[-6px]" />
            
            <svg className="absolute inset-0 w-full h-full z-0 overflow-visible" viewBox="0 0 120 60">
                <polygon points="15,2 105,2 118,30 105,58 15,58 2,30" fill="white" stroke="#f59e0b" strokeWidth="2" />
            </svg>

            <div className="relative z-10 flex flex-col items-center justify-center w-full">
                <div className="font-bold text-amber-700 mb-1 text-[10px] uppercase tracking-wide">SWITCH</div>
                <input
                    className="w-16 text-[10px] p-1 border border-amber-200 rounded text-center font-mono focus:outline-none focus:border-amber-400 transition-all z-20 bg-white/90"
                    value={code || ''}
                    onChange={(evt) => onChange && onChange(id, evt.target.value)}
                    placeholder="x"
                    onClick={(e) => e.stopPropagation()}
                />
            </div>

            <Handle type="source" position={Position.Bottom} className="w-7 h-7 md:w-3 md:h-3 bg-amber-500 border-2 border-white z-20 bottom-[-6px]" />
        </div>
    );
}

// Call Node Function Block
function CallNode({ data, id }: NodeProps) {
    const { callId, callArgs = {}, onChange } = data as FlowchartNodeData;
    const allNodes = useNodes();
    
    // Find available functions (Start nodes excluding 'main' root)
    const funcNodes = allNodes.filter(n => n.type === 'start' && n.id !== 'start');
    
    // Find active target function
    const targetFunc = funcNodes.find(n => n.id === callId);
    
    // Extract parameter keys from target function's signature
    const expectedParams = targetFunc 
        ? ((targetFunc.data.params as string) || '').split(',').map(p => p.trim()).filter(Boolean)
        : [];
        
    // Validate synchronization (Edge case: missing params or deleted target function)
    const isInvalid = callId && (!targetFunc || Object.keys(callArgs || {}).some(k => !expectedParams.includes(k)) || expectedParams.some(p => typeof (callArgs as any || {})[p] === 'undefined'));

    const handleFuncSelected = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = e.target.value;
        const target = funcNodes.find(n => n.id === selectedId);
        
        onChange && onChange(id, selectedId, 'callId');
        
        // Reset local argument mapping bindings
        const newArgs: Record<string, string> = {};
        if (target) {
             const tParams = ((target.data.params as string) || '').split(',').map(p => p.trim()).filter(Boolean);
             tParams.forEach(p => newArgs[p] = '');
        }
        onChange && onChange(id, newArgs, 'callArgs');
    };

    const handleArgChange = (param: string, val: string) => {
        const newArgs = { ...(callArgs as Record<string, string>), [param]: val };
        onChange && onChange(id, newArgs, 'callArgs');
    };

    return (
        <div className="relative flex flex-col items-center group">
            <Handle type="target" position={Position.Top} className="w-7 h-7 md:w-3 md:h-3 bg-blue-700 border-2 border-white z-20" />
            
            <div className={`px-2 py-2 border-2 ${isInvalid ? 'border-red-500 border-x-red-700 bg-red-50' : 'border-blue-700 border-l-[6px] border-r-[6px] bg-blue-50'} shadow-sm rounded-sm flex flex-col gap-1 min-w-[140px] items-center transition-colors`}>
                <div className={`text-[9px] uppercase tracking-widest ${isInvalid ? 'text-red-700' : 'text-blue-800'} font-bold mb-0.5`}>CALL</div>
                
                <select 
                    className={`w-[120px] text-[10px] p-1 border ${isInvalid ? 'border-red-300 text-red-900 bg-white' : 'border-blue-300 text-blue-900 bg-white/80'} rounded text-center focus:outline-none focus:border-blue-500 font-bold appearance-none cursor-pointer truncate`}
                    value={callId || ''}
                    onChange={handleFuncSelected}
                >
                    <option value="" disabled>Select Func...</option>
                    {funcNodes.map(n => (
                        <option key={n.id} value={n.id}>
                            {(n.data.code as string || '').trim() || `func_${n.id.slice(0,4)}`}
                        </option>
                    ))}
                </select>
                
                {targetFunc && expectedParams.length > 0 && (
                    <div className="flex flex-col gap-1.5 w-[120px] mt-1 pt-1.5 border-t border-blue-200/50">
                        {expectedParams.map(param => (
                            <div key={param} className="flex items-center justify-between gap-1 w-full">
                                <span className="text-[9px] font-mono text-blue-700 truncate max-w-[45px]" title={param}>{param}:</span>
                                <input
                                    className="flex-1 min-w-0 text-[9px] p-0.5 border border-blue-200 rounded text-center font-mono bg-white focus:outline-none focus:border-blue-400"
                                    value={(callArgs as Record<string,string>)[param] || ''}
                                    onChange={(e) => handleArgChange(param, e.target.value)}
                                    placeholder="val"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {Boolean(isInvalid) && <div className="absolute top-[-20px] left-1/2 -translate-x-1/2 text-red-600 font-bold text-[8px] whitespace-nowrap bg-white px-1.5 py-0.5 shadow-sm border border-red-200 rounded-full z-30 pointer-events-none">Invalid Sync!</div>}
            
            <Handle type="source" position={Position.Bottom} className="w-7 h-7 md:w-3 md:h-3 bg-blue-700 border-2 border-white z-20" />
        </div>
    );
}

// Case Node - Notched Rectangle (Amber edge)
function CaseNode({ data, id }: NodeProps) {
    const { code, onChange } = data as FlowchartNodeData;
    return (
        <div className="relative group">
            <Handle type="target" position={Position.Top} className="w-7 h-7 md:w-3 md:h-3 bg-amber-500 border-2 border-white" />
            <div className={`px-4 py-2 rounded-sm border-2 border-zinc-200 border-l-[6px] border-l-amber-500 bg-white shadow-sm text-amber-700 font-bold text-[10px] tracking-wider min-w-[90px] text-center flex flex-col items-center justify-center`}>
                <div className="text-[9px] mb-1">CASE</div>
                <input
                    className="w-24 text-[10px] p-1 border border-zinc-200 rounded text-center font-mono bg-zinc-50 focus:outline-none focus:border-amber-400 transition-all text-amber-900"
                    value={code || ''}
                    onChange={(evt) => onChange && onChange(id, evt.target.value)}
                    placeholder="val / default"
                />
            </div>
            <Handle type="source" position={Position.Bottom} className="w-7 h-7 md:w-3 md:h-3 bg-zinc-400 border-2 border-white" />
        </div>
    );
}

const nodeTypes = {
    start: StartNode,
    end: EndNode,
    process: ProcessNode,
    decision: DecisionNode,
    output: OutputNode,
    input: InputNode,
    for: ForNode,
    while: WhileNode,
    repeat: RepeatNode,
    do_while: DoWhileNode,
    return: ReturnNode,
    break: BreakNode,
    continue: ContinueNode,
    pass: PassNode,
    switch: SwitchNode,
    case: CaseNode,
    call: CallNode
};

// --- MAIN COMPONENT ---

const initialNodes: Node<FlowchartNodeData>[] = [
    { id: 'start', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start', code: 'main' } },
];

const getId = () => `node_${Math.random().toString(36).substring(2, 9)}`;

export interface PseudocodeLine {
    lineNumber: number;
    text: string;
    indent: number;
    nodeId: string | null;
}

const buildPseudocode = (nodes: Node<FlowchartNodeData>[], edges: Edge[]): PseudocodeLine[] => {
    const lines: PseudocodeLine[] = [];
    let lineNum = 1;
    const visited = new Set<string>();

    const addLine = (text: string, indent: number, nodeId: string | null) => {
        lines.push({ lineNumber: lineNum++, text, indent, nodeId });
    };

    const getDescendants = (start: string | null): string[] => {
        const desc: string[] = [];
        if (!start) return desc;
        const q = [start];
        const qVis = new Set<string>([start]);
        while (q.length > 0) {
            const curr = q.shift()!;
            desc.push(curr);
            edges.filter(e => e.source === curr).forEach(e => {
                if (!qVis.has(e.target)) {
                    qVis.add(e.target);
                    q.push(e.target);
                }
            });
        }
        return desc;
    };

    const findReconvergence = (nodeIdT: string | null, nodeIdF: string | null): string | null => {
        if (!nodeIdT || !nodeIdF) return null;
        const dt = getDescendants(nodeIdT);
        const df = getDescendants(nodeIdF);
        const setF = new Set(df);
        for (const t of dt) {
            if (setF.has(t)) return t;
        }
        return null;
    };

    const traverse = (nodeId: string, indent: number, stopNodeIds: Set<string>, isElseIf = false) => {
        if (!nodeId || stopNodeIds.has(nodeId) || visited.has(nodeId)) return;

        visited.add(nodeId);

        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;

        const code = node.data?.code || '';

        switch (node.type as string) {
            case 'start':
                addLine(`BEGIN`, indent, node.id);
                break;
            case 'end':
                addLine(`END`, indent, node.id);
                break;
            case 'return':
                addLine(`RETURN ${code || ''}`, indent, node.id);
                break;
            case 'break':
                addLine(`BREAK`, indent, node.id);
                break;
            case 'continue':
                addLine(`CONTINUE`, indent, node.id);
                break;
            case 'pass':
                addLine(`PASS`, indent, node.id);
                break;
            case 'switch': {
                addLine(`SWITCH (${code || '...'})`, indent, node.id);
                const outEdges = edges.filter(e => e.source === node.id);
                for (const edge of outEdges) {
                    const targetNode = nodes.find(n => n.id === edge.target);
                    if (targetNode?.type === 'case') {
                        traverse(edge.target, indent + 1, stopNodeIds);
                    }
                }
                addLine(`END SWITCH`, indent, null);
                return;
            }
            case 'case': {
                if (code === 'default') {
                    addLine(`DEFAULT:`, indent, node.id);
                } else {
                    addLine(`CASE ${code || '?'}:`, indent, node.id);
                }
                const outEdges = edges.filter(e => e.source === node.id);
                for (const edge of outEdges) {
                    traverse(edge.target, indent + 1, stopNodeIds);
                }
                return;
            }
            case 'input':
                addLine(`INPUT ${code || 'value'}`, indent, node.id);
                break;
            case 'output':
                addLine(`PRINT ${code || 'empty'}`, indent, node.id);
                break;
            case 'process':
                addLine(`SET ${code || '...'}`, indent, node.id);
                break;
            case 'do_while': {
                addLine(`DO`, indent, node.id);
                const tEdge = edges.find(e => e.source === node.id && e.sourceHandle === 'true');
                const fEdge = edges.find(e => e.source === node.id && e.sourceHandle === 'false');
                
                if (tEdge) traverse(tEdge.target, indent + 1, new Set([...stopNodeIds, node.id]));
                
                addLine(`WHILE (${code || '...'})`, indent, node.id);
                
                if (fEdge) traverse(fEdge.target, indent, stopNodeIds);
                return;
            }
            case 'while':
            case 'for': {
                const isFor = node.type === 'for';
                const kw = isFor ? 'FOR' : 'WHILE';
                addLine(`${kw} (${code || '...'}) DO`, indent, node.id);
                
                const tEdge = edges.find(e => e.source === node.id && e.sourceHandle === 'true');
                const fEdge = edges.find(e => e.source === node.id && e.sourceHandle === 'false');
                
                if (tEdge) traverse(tEdge.target, indent + 1, new Set([...stopNodeIds, node.id]));
                
                addLine(`END ${kw}`, indent, null);
                if (fEdge) traverse(fEdge.target, indent, stopNodeIds);
                return;
            }
            case 'decision': {
                const tEdge = edges.find(e => e.source === node.id && e.sourceHandle === 'true');
                const fEdge = edges.find(e => e.source === node.id && e.sourceHandle === 'false');
                
                const tT = tEdge ? tEdge.target : null;
                const tF = fEdge ? fEdge.target : null;
                const r = findReconvergence(tT, tF);

                const nextStops = new Set(stopNodeIds);
                if (r) nextStops.add(r);

                if (isElseIf) {
                    addLine(`ELSE IF (${code || '...'}) THEN`, Math.max(0, indent - 1), node.id);
                } else {
                    addLine(`IF (${code || '...'}) THEN`, indent, node.id);
                }

                if (tT) traverse(tT, indent + 1, nextStops);

                if (tF && tF !== r) {
                    const fNode = nodes.find(n => n.id === tF);
                    if (fNode && fNode.type === 'decision') {
                        traverse(tF, indent + 1, nextStops, true);
                    } else {
                        addLine(`ELSE`, indent, null);
                        traverse(tF, indent + 1, nextStops);
                    }
                }

                if (!isElseIf) {
                    addLine(`END IF`, indent, null);
                }

                // If `r` is a local reconvergence (not from parents), we should traverse it.
                // Because nextStops includes `r`, children stopped at `r`.
                // We only traverse `r` if outer scopes haven't already claimed it as their stop.
                let isDownstream = false;
                if (r) {
                    for (const stopId of Array.from(stopNodeIds)) {
                        if (getDescendants(stopId).includes(r)) {
                            isDownstream = true;
                            break;
                        }
                    }
                }

                if (r && !isDownstream) {
                    traverse(r, indent, stopNodeIds);
                }
                return;
            }
            case 'call': {
                const targetF = nodes.find(n => n.id === node.data.callId);
                const fName = targetF ? (targetF.data.code || (targetF.id === 'start' ? 'main' : `func_${targetF.id.slice(0,4)}`)) : '???';
                const targetParams = targetF ? ((targetF.data.params as string) || '').split(',').map(p => p.trim()).filter(Boolean) : [];
                const callArgs = (node.data.callArgs || {}) as Record<string, string>;
                const argStr = targetParams.map(p => callArgs[p] || '?').join(', ');
                
                addLine(`CALL ${fName}(${argStr})`, indent, node.id);
                break;
            }
        }

        if (!['decision', 'for', 'while', 'do_while', 'end'].includes(node.type as string)) {
            const nextEdge = edges.find(e => e.source === node.id);
            if (nextEdge) traverse(nextEdge.target, indent, stopNodeIds);
        }
    };

    const startNodes = nodes.filter(n => n.type === 'start');
    if (startNodes.length > 0) {
        startNodes.forEach(startNode => {
            const funcName = startNode.data.code || (startNode.id === 'start' ? 'main' : `func_${startNode.id.slice(0,4)}`);
            const params = startNode.data.params || '';
            addLine(`FUNCTION ${funcName}(${params}):`, 0, startNode.id);
            traverse(startNode.id, 1, new Set());
            addLine(`END FUNCTION`, 0, null);
            addLine(``, 0, null);
        });
    } else {
        addLine(`// Link nodes to a START block to build logic...`, 0, null);
    }

    const unvisited = nodes.filter(n => !visited.has(n.id) && n.type !== 'start' && n.type !== 'repeat');
    if (unvisited.length > 0) {
        addLine(``, 0, null);
        addLine(`// --- Unlinked Blocks ---`, 0, null);
        unvisited.forEach(n => {
            addLine(`[${(n.type || 'unknown').toUpperCase()}] ${n.data?.code || '...'}`, 0, n.id);
        });
    }

    return lines;
};

interface FlowchartBuilderProps {
    task?: string;
    requiredNodes?: string[];
    validation?: any;
    onComplete?: () => void;
}

export default function FlowchartBuilder({
    task = "Build a flowchart to solve the problem.",
    requiredNodes = [],
    validation,
    onComplete
}: FlowchartBuilderProps) {
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [nodes, setNodes, onNodesChange] = useNodesState<Node<FlowchartNodeData>>(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
    const [logs, setLogs] = useState<string[]>([]);
    const [isRunning, setIsRunning] = useState(false);
    const [activeNodeId, setActiveNodeId] = useState<string | null>(null);
    const [runtimeContext, setRuntimeContext] = useState<Record<string, any>>({});
    const [hasPassed, setHasPassed] = useState(false);
    
    const [testResults, setTestResults] = useState<TestResult[]>([]);
    const [showTestResultsModal, setShowTestResultsModal] = useState(false);
    
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [isConsoleOpen, setIsConsoleOpen] = useState(false); // Default to closed on mobile (and desktop initially until hydration)

    // Sidebar states
    const [activeSidebarTab, setActiveSidebarTab] = useState<'toolbox' | 'pseudocode'>('toolbox');
    const [pseudocodeLines, setPseudocodeLines] = useState<PseudocodeLine[]>([]);

    // Input handling states
    const [isPendingInput, setIsPendingInput] = useState(false);
    const [inputPrompt, setInputPrompt] = useState("");
    const [inputValue, setInputValue] = useState("");
    const inputResolveRef = useRef<((value: string) => void) | null>(null);
    const consoleEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (consoleEndRef.current) {
            consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [logs, isPendingInput]);

    // Double-tap connection state
    const [connectionSource, setConnectionSource] = useState<{
        nodeId: string;
        handleId: string | null;
    } | null>(null);

    useEffect(() => {
        // Sync state with media query only if it changes or on mount
        setIsConsoleOpen(isDesktop);
    }, [isDesktop]);

    useEffect(() => {
        setPseudocodeLines(buildPseudocode(nodes, edges));
    }, [nodes, edges]);

    // Update node data (code, params, callId, or callArgs)
    const onNodeDataChange = (id: string, value: any, field: string = 'code') => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    node.data = { ...node.data, [field]: value };
                }
                return node;
            })
        );
    };

    // Inject onChange handler to all nodes of specific types
    const nodesWithHandler = useMemo(() => {
        return nodes.map(node => ({
            ...node,
            data: { ...node.data, onChange: onNodeDataChange }
        }));
    }, [nodes]);


    const onConnect = useCallback(
        (params: Connection) => setEdges((eds) => addEdge(params, eds)),
        [setEdges],
    );

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event: React.DragEvent) => {
            event.preventDefault();

            const type = event.dataTransfer.getData('application/reactflow');
            if (typeof type === 'undefined' || !type) {
                return;
            }

            // Handle both mouse and touch events
            let clientX = event.clientX;
            let clientY = event.clientY;

            // Fallback to center of viewport if coordinates are invalid (mobile issue)
            if (!clientX && !clientY && reactFlowWrapper.current) {
                const bounds = reactFlowWrapper.current.getBoundingClientRect();
                clientX = bounds.left + bounds.width / 2;
                clientY = bounds.top + bounds.height / 2;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: clientX,
                y: clientY,
            });

            const newNode: Node<FlowchartNodeData> = {
                id: getId(),
                type,
                position,
                data: { label: `${type} node`, code: '' },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance, setNodes],
    );

    // Click to add fallback (Mobile) - places at center of visible viewport
    const addNode = (type: string) => {
        if (!reactFlowInstance || !reactFlowWrapper.current) return;

        // Get center of the visible viewport
        const bounds = reactFlowWrapper.current.getBoundingClientRect();
        const centerX = bounds.left + bounds.width / 2;
        const centerY = bounds.top + bounds.height / 2;

        // Convert screen position to flow position
        const position = reactFlowInstance.screenToFlowPosition({
            x: centerX,
            y: centerY,
        });

        const newNode: Node<FlowchartNodeData> = {
            id: getId(),
            type,
            position,
            data: { label: `${type} node`, code: '' },
        };
        setNodes((nds) => nds.concat(newNode));
    };

    // Delete Selected Logic
    const onDeleteSelected = useCallback(() => {
        setNodes((nds) => nds.filter((node) => !node.selected));
        setEdges((eds) => eds.filter((edge) => !edge.selected));
    }, [setNodes, setEdges]);

    // Double-tap/click Connection / Deletion Logic
    const handleNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node<FlowchartNodeData>) => {
        if (!isDesktop) {
            // Mobile: Double-tap deletes node
            setNodes((nds) => nds.filter((n) => n.id !== node.id));
            setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id));
            return;
        }

        if (!connectionSource) {
            // First selection - set as source
            let handleId: string | null = null;

            // For decision/while/for nodes, default to 'true' handle
            if (['decision', 'while', 'for'].includes(node.type as string)) {
                handleId = 'true';
            }

            setConnectionSource({ nodeId: node.id, handleId });
            setNodes((nds) => nds.map((n) => ({
                ...n,
                selected: n.id === node.id
            })));
        } else {
            // Second selection - create connection
            if (connectionSource.nodeId !== node.id) {
                const newEdge: Edge = {
                    id: `edge_${connectionSource.nodeId}_${node.id}_${Date.now()}`,
                    source: connectionSource.nodeId,
                    target: node.id,
                    sourceHandle: connectionSource.handleId,
                };

                setEdges((eds) => addEdge(newEdge, eds));
            }

            // Clear selection
            setConnectionSource(null);
            setNodes((nds) => nds.map((n) => ({ ...n, selected: false })));
        }
    }, [connectionSource, setNodes, setEdges]);


    // LOGIC EXECUTION ENGINE
    const runFlowchart = async (testQueue?: any[], silent = false): Promise<string[]> => {
        const generatedLogs: string[] = [];
        const addLog = (msg: string) => {
            generatedLogs.push(msg);
            if (!silent) setLogs(l => [...l, msg]);
        };

        if (!silent) {
            setLogs([]);
            setIsRunning(true);
            setRuntimeContext({});
        }
        addLog(">>> STARTING EXECUTION...");

        // State tracker to force true on first pass for Header-style Do-While loops
        const doWhileVisited = new Set<string>();
        
        // Stack to trace return paths for Function Calls
        const callStack: Array<{ returnNodeId: string | null; savedContext: Record<string, any> }> = [];

        // Context for variables
        const context: Record<string, any> = {};
        const proxyContext = new Proxy(context, {
            has(target, key) {
                if (typeof key === 'string' && ['Math', 'console', 'parseFloat', 'parseInt', 'String', 'Number', 'Date', 'isNaN'].includes(key)) return false;
                if (key === Symbol.unscopables) return false;
                return true;
            },
            get(target, key) {
                if (key === Symbol.unscopables) return undefined;
                return target[key as string];
            }
        });

        // Helper to delay for visualization
        const wait = (ms: number) => silent ? Promise.resolve() : new Promise(resolve => setTimeout(resolve, ms));

        // Helper to get input from console
        const getInput = (prompt: string): Promise<string> => {
            if (testQueue && testQueue.length > 0) {
                return Promise.resolve(String(testQueue.shift()));
            }
            if (silent) return Promise.resolve("0");

            return new Promise((resolve) => {
                setInputPrompt(prompt);
                setInputValue("");
                setIsPendingInput(true);
                setIsConsoleOpen(true); // Auto-open console for input
                inputResolveRef.current = (value: string) => {
                    setIsPendingInput(false);
                    setInputPrompt("");
                    resolve(value);
                };
            });
        };

        // Helper to evaluate condition (for decision, while, for)
        const evaluateCondition = (code: string): boolean => {
            if (!isSafeCode(code)) {
                addLog('⚠️ Unsafe code blocked');
                return false;
            }
            try {
                const func = new Function('ctx', `with(ctx) { return (${code}); }`);
                return !!func(proxyContext);
            } catch (e: any) {
                addLog(`Condition Error: ${e.message}`);
                return false;
            }
        };

        const isSafeCode = (code: string) => {
            const blacklist = ['window', 'document', 'eval', 'Function', 'localStorage', 'sessionStorage', 'fetch', 'XMLHttpRequest', 'require', 'import'];
            return !blacklist.some(b => code.includes(b));
        };

        // Helper to parse for loop syntax: "i=0; i<10; i++"
        const parseForLoop = (code: string): { init: string; condition: string; increment: string } | null => {
            try {
                const parts = code.split(';').map(p => p.trim());
                if (parts.length !== 3) return null;
                return { init: parts[0], condition: parts[1], increment: parts[2] };
            } catch {
                return null;
            }
        };

        let currentNode: Node<FlowchartNodeData> | undefined = nodes.find(n => n.type === 'start');
        if (!currentNode) {
            addLog("Error: No Start Node found.");
            if (!silent) setIsRunning(false);
            return generatedLogs;
        }

        // Execution Loop limits to prevent infinite loops
        let steps = 0;
        const MAX_STEPS = 500;

        try {
            while (currentNode && steps < MAX_STEPS) {
                steps++;
                if (!silent) setActiveNodeId(currentNode.id);

                // Execute Logic based on type
                switch (currentNode.type) {
                    case 'process':
                        if (currentNode.data.code) {
                            try {
                                const code = currentNode.data.code as string;
                                if (!isSafeCode(code)) { addLog('⚠️ Unsafe code blocked'); break; }
                                const func = new Function('ctx', `with(ctx) { ${code} }`);
                                func(proxyContext);
                                if (!silent) setRuntimeContext({ ...context });
                            } catch (e: any) {
                                addLog(`Error in Process: ${e.message}`);
                            }
                        }
                        break;

                    case 'input':
                        if (currentNode.data) { // Changed to allow input without target variable code
                            try {
                                const code = (currentNode.data.code as string) || '';
                                const match = code.match(/(?:ctx\.)?(\w+)\s*=/);
                                const varName = match ? match[1] : 'value';

                                const userInput = await getInput(`Input for ${varName}: `);

                                const numValue = parseFloat(userInput);
                                const finalValue = !isNaN(numValue) && userInput.trim() !== '' ? numValue : userInput;

                                context[varName] = finalValue;
                                if (!silent) setRuntimeContext({ ...context });
                                addLog(`Input: ${varName} = ${finalValue}`);
                            } catch (e: any) {
                                addLog(`Input Error: ${e.message}`);
                            }
                        }
                        break;

                    case 'output':
                        if (currentNode.data) {
                            try {
                                const code = (currentNode.data.code as string) || '';
                                let result;
                                if (code) {
                                    if (!isSafeCode(code)) { addLog('⚠️ Unsafe code blocked'); break; }
                                    const func = new Function('ctx', `with(ctx) { return (${code}); }`);
                                    result = func(proxyContext);
                                } else {
                                    result = "Empty Print";
                                }
                                addLog(`> ${result}`);
                            } catch (e: any) {
                                addLog(`Print Error: ${e.message}`);
                            }
                        }
                        break;

                    case 'for':
                        if (currentNode.data.code) {
                            try {
                                const code = currentNode.data.code as string;
                                const parsed = parseForLoop(code);

                                if (parsed) {
                                    // Execute initialization
                                    const initFunc = new Function('ctx', `with(ctx) { ${parsed.init} }`);
                                    initFunc(proxyContext);
                                    if (!silent) setRuntimeContext({ ...context });

                                    // Find the loop body (true path)
                                    const trueEdge = edges.find(e => e.source === currentNode?.id && e.sourceHandle === 'true');
                                    const falseEdge = edges.find(e => e.source === currentNode?.id && e.sourceHandle === 'false');

                                    // Execute the for loop
                                    while (evaluateCondition(parsed.condition)) {
                                        if (steps >= MAX_STEPS) break;

                                        if (!silent) {
                                            setActiveNodeId(currentNode.id);
                                            await wait(300);
                                        }

                                        // Execute loop body (follow true path once)
                                        if (trueEdge) {
                                            let bodyNode = nodes.find(n => n.id === trueEdge.target);
                                            let bodySteps = 0;
                                            const MAX_BODY_STEPS = 50;
                                            let shouldBreakOuter = false;

                                            while (bodyNode && bodySteps < MAX_BODY_STEPS) {
                                                bodySteps++;
                                                steps++;
                                                if (!silent) setActiveNodeId(bodyNode.id);

                                                if (bodyNode.type === 'break') {
                                                    addLog("> BREAK encountered");
                                                    shouldBreakOuter = true;
                                                    break;
                                                }

                                                if (bodyNode.type === 'continue') {
                                                    addLog("> CONTINUE encountered");
                                                    // Immediately stops this loop body and skips to the `incFunc` increment below!
                                                    break;
                                                }

                                                // Execute the body node (but don't follow back to for or to false path)
                                                if (bodyNode.type === 'output' && bodyNode.data.code) {
                                                    const func = new Function('ctx', `with(ctx) { return (${bodyNode.data.code}); }`);
                                                    const result = func(proxyContext);
                                                    addLog(`> ${result}`);
                                                } else if (bodyNode.type === 'process' && bodyNode.data.code) {
                                                    const func = new Function('ctx', `with(ctx) { ${bodyNode.data.code} }`);
                                                    func(proxyContext);
                                                    if (!silent) setRuntimeContext({ ...context });
                                                }

                                                await wait(300);

                                                // Find next node in body
                                                const nextEdge = edges.find(e => e.source === bodyNode?.id);
                                                if (!nextEdge) break;

                                                const nextNode = nodes.find(n => n.id === nextEdge.target);
                                                // Stop if we're back at the for node or hit the exit
                                                if (nextNode?.id === currentNode?.id || nextNode?.type === 'end') break;
                                                bodyNode = nextNode;
                                            }

                                            if (shouldBreakOuter) break;
                                        }

                                        // Execute increment
                                        const incFunc = new Function('ctx', `with(ctx) { ${parsed.increment} }`);
                                        incFunc(proxyContext);
                                        if (!silent) setRuntimeContext({ ...context });
                                    }

                                    // Loop done, follow false path
                                    addLog(`For loop completed`);
                                    if (falseEdge) {
                                        currentNode = nodes.find(n => n.id === falseEdge.target);
                                    } else {
                                        currentNode = undefined;
                                    }
                                    await wait(500);
                                    continue; // Skip standard navigation but keep logs intact
                                } else {
                                    addLog(`For loop syntax error. Use: i=0; i<10; i++`);
                                }
                            } catch (e: any) {
                                addLog(`For Loop Error: ${e.message}`);
                            }
                        }
                        break;

                    case 'do_while': {
                        let condition = false;
                        try {
                            const code: string = (currentNode.data.code as string) || "false";
                            // For DO-WHILE, we explicitly skip verification on first encounter to force body execution!
                            if (!doWhileVisited.has(currentNode.id)) {
                                doWhileVisited.add(currentNode.id);
                                condition = true; // Hard bypass
                                if (!silent) {
                                    addLog(`[DO-WHILE] First pass forcing true!`);
                                }
                            } else {
                                condition = evaluateCondition(code);
                                if (!silent) {
                                    addLog(`Condition (${code}) is ${condition}`);
                                }
                            }
                        } catch (e: any) {
                            if (!silent) addLog(`Condition Error: ${e.message}`);
                        }

                        const targetHandle = condition ? 'true' : 'false';
                        const edge: Edge | undefined = edges.find(
                            e => e.source === currentNode?.id && e.sourceHandle === targetHandle
                        );

                        if (edge) {
                            currentNode = nodes.find(n => n.id === edge.target);
                        } else {
                            if (!silent) addLog(`Dead end: No path for ${condition}`);
                            currentNode = undefined;
                        }
                        await wait(500);
                        continue; // Skip standard navigation
                    }
                    case 'while':
                    // While loops work like decision nodes - user connects repeat block manually
                    // Fall through to decision logic
                    case 'decision': {
                        let condition = false;
                        try {
                            const code: string = (currentNode.data.code as string) || "false";
                            condition = evaluateCondition(code);
                            if (!silent) addLog(`Condition (${code}) is ${condition}`);
                        } catch (e: any) {
                            if (!silent) addLog(`Condition Error: ${e.message}`);
                        }

                        const targetHandle = condition ? 'true' : 'false';
                        const edge: Edge | undefined = edges.find(
                            e => e.source === currentNode?.id && e.sourceHandle === targetHandle
                        );

                        if (edge) {
                            currentNode = nodes.find(n => n.id === edge.target);
                        } else {
                            if (!silent) addLog(`Dead end: No path for ${condition}`);
                            currentNode = undefined;
                        }
                        await wait(500);
                        continue; // Skip standard navigation
                    }
                    case 'break':
                    case 'continue': {
                        // Graph backward search to find enclosing loop
                        const isBreak = currentNode.type === 'break';
                        const nearestLoop = (() => {
                            const q = [currentNode!.id];
                            const vis = new Set([currentNode!.id]);
                            while(q.length > 0) {
                                const curr = q.shift()!;
                                const n = nodes.find(x => x.id === curr);
                                if (n && ['while', 'do_while', 'for'].includes(n.type as string) && curr !== currentNode!.id) {
                                    return n;
                                }
                                const incoming = edges.filter(e => e.target === curr);
                                for (const e of incoming) {
                                    if (!vis.has(e.source)) {
                                        vis.add(e.source);
                                        q.push(e.source);
                                    }
                                }
                            }
                            return null;
                        })();

                        if (nearestLoop) {
                            if (isBreak) {
                                addLog("> BREAK encountered, exiting loop.");
                                const falseEdge = edges.find(e => e.source === nearestLoop.id && e.sourceHandle === 'false');
                                if (falseEdge) {
                                    currentNode = nodes.find(n => n.id === falseEdge.target);
                                } else {
                                    currentNode = undefined;
                                }
                            } else {
                                addLog("> CONTINUE encountered, jumping to loop condition.");
                                currentNode = nearestLoop; // Jump back to the loop node to trigger re-evaluation
                            }
                        } else {
                            addLog(`⚠️ ${isBreak ? 'BREAK' : 'CONTINUE'} placed outside of a loop! Execution halts.`);
                            currentNode = undefined;
                        }
                        await wait(500);
                        continue;
                    }
                    case 'switch': {
                        addLog(`> SWITCH evaluating (${currentNode.data.code})`);
                        try {
                            const code: string = (currentNode.data.code as string) || '';
                            let switchValue: any = undefined;
                            if (code) {
                                if (!isSafeCode(code)) { addLog('⚠️ Unsafe code blocked'); break; }
                                const func = new Function('ctx', `with(ctx) { return (${code}); }`);
                                switchValue = func(proxyContext);
                            }
                            
                            const outEdges = edges.filter(e => e.source === currentNode?.id);
                            const childNodes = outEdges.map(e => nodes.find(n => n.id === e.target)).filter(n => n && n.type === 'case');
                            
                            let matchedNode = null;
                            let defaultNode = null;

                            for (const child of childNodes) {
                                const caseCode = child?.data.code as string || '';
                                if (caseCode.trim().toLowerCase() === 'default') {
                                    defaultNode = child;
                                } else {
                                    if (!isSafeCode(caseCode)) continue;
                                    const caseFunc = new Function('ctx', `with(ctx) { return (${caseCode}); }`);
                                    const caseValue = caseFunc(proxyContext);
                                    if (caseValue === switchValue) {
                                        matchedNode = child;
                                        break;
                                    }
                                }
                            }

                            if (matchedNode) {
                                addLog(`> Matched CASE (${matchedNode!.data.code})`);
                                currentNode = matchedNode;
                            } else if (defaultNode) {
                                addLog(`> Reverted to DEFAULT case`);
                                currentNode = defaultNode;
                            } else {
                                addLog(`> No matching CASE found. Skipping switch block.`);
                                currentNode = undefined;
                            }
                        } catch(e: any) {
                            addLog(`Switch Error: ${e.message}`);
                            currentNode = undefined;
                        }
                        await wait(500);
                        continue;
                    }
                    case 'case': {
                        const incomingEdges = edges.filter(e => e.target === currentNode?.id);
                        const hasSwitch = incomingEdges.some(e => nodes.find(n => n.id === e.source)?.type === 'switch');
                        if (!hasSwitch) {
                            addLog(`⚠️ CASE placed without a connecting SWITCH block! Execution halts.`);
                            currentNode = undefined;
                            await wait(500);
                            continue;
                        }
                        // Instantly pass through to body!
                        const edge = edges.find(e => e.source === currentNode?.id);
                        if (edge) {
                            currentNode = nodes.find(n => n.id === edge.target);
                        } else {
                            currentNode = undefined;
                        }
                        await wait(500);
                        continue;
                    }
                    case 'call': {
                        const targetId = currentNode.data.callId as string;
                        const targetNode = nodes.find(n => n.id === targetId);
                        
                        if (!targetNode) {
                            addLog(`❌ CALL block references undefined function! Halting.`);
                            currentNode = undefined;
                            break;
                        }
                        
                        const targetParams = ((targetNode.data.params as string) || '').split(',').map(p => p.trim()).filter(Boolean);
                        const callArgs = (currentNode.data.callArgs || {}) as Record<string, string>;
                        
                        // Evaluate arguments in current context
                        const evaluatedArgs: Record<string, any> = {};
                        let callFailed = false;
                        for (const p of targetParams) {
                            const argExpr = callArgs[p];
                            if (!argExpr) {
                                addLog(`❌ Missing argument for parameter "${p}" in call to ${targetNode.data.code || targetId}. Halting.`);
                                callFailed = true; break;
                            }
                            if (!isSafeCode(argExpr)) {
                                addLog(`🔒 Unsafe code detected in argument: ${argExpr}. Execution halted.`);
                                callFailed = true; break;
                            }
                            try {
                                const func = new Function('ctx', `with(ctx) { return (${argExpr}); }`);
                                let evalVal = func(proxyContext);
                                evaluatedArgs[p] = evalVal;
                            } catch (e: any) {
                                addLog(`❌ Error evaluating argument "${p}": ${e.message}. Halting.`);
                                callFailed = true; break;
                            }
                        }
                        
                        if (callFailed) {
                            currentNode = undefined;
                            break;
                        }
                        
                        addLog(`🔀 Calling ${(targetNode.data.code as string || '').trim() || targetId}(${Object.values(evaluatedArgs).join(', ')})`);
                        
                        // Push to call stack
                        callStack.push({
                            returnNodeId: currentNode.id,   // Save caller explicitly
                            savedContext: { ...context }   // Save local variables
                        });
                        
                        // Setup new context
                        Object.keys(context).forEach(k => delete context[k]); 
                        Object.entries(evaluatedArgs).forEach(([k, v]) => context[k] = v); 
                        
                         // Jump to function start body
                        const funcEdge = edges.find(e => e.source === targetId);
                        currentNode = funcEdge ? nodes.find(n => n.id === funcEdge.target) : undefined;
                        await wait(500);
                        continue;
                    }
                }

                // Find Next Node (for non-branching nodes)
                if (currentNode?.type === 'end' || currentNode?.type === 'return') {
                    if (currentNode.type === 'return') {
                        const code = (currentNode.data.code as string) || '';
                        if (code) {
                            try {
                                if (!isSafeCode(code)) { addLog('⚠️ Unsafe code blocked'); continue; }
                                const func = new Function('ctx', `with(ctx) { return (${code}); }`);
                                const result = func(proxyContext);
                                addLog(`> Returned: ${result}`);
                            } catch (e: any) {
                                addLog(`Return Error: ${e.message}`);
                            }
                        } else {
                            addLog(`> Returned (void)`);
                        }
                    }
                    addLog(">>> EXECUTION FINISHED");
                    currentNode = undefined;
                    if (!validation) setHasPassed(true);
                } else if (currentNode && !['decision', 'while', 'for'].includes(currentNode.type as string)) {
                    // Standard single output
                    const edge: Edge | undefined = edges.find(e => e.source === currentNode?.id);
                    if (edge) {
                        currentNode = nodes.find(n => n.id === edge.target);
                    } else {
                        if (currentNode.type !== 'end') addLog("Dead end.");
                        currentNode = undefined;
                    }
                }
            }

            if (steps >= MAX_STEPS) {
                addLog(`⚠️ Max steps (${MAX_STEPS}) reached. Possible infinite loop.`);
            }
        } catch (err: any) {
            console.error(err);
            addLog(`System Error: ${err.message}`);
        } finally {
            setIsRunning(false);
            setIsPendingInput(false);
            if (!silent) setActiveNodeId(null);
        }

        return generatedLogs;
    };


    const runValidation = async () => {
        if (!validation || !validation.testCases) {
            return true;
        }

        setIsRunning(true);
        setIsConsoleOpen(true);

        const accumulatedLogs: string[] = [];
        const addLogUI = (msg: string) => {
            accumulatedLogs.push(msg);
            setLogs([...accumulatedLogs]); // Always set to current accumulated state
        };

        setLogs([]);
        addLogUI(">>> STARTING VALIDATION TESTS...");

        let passedCount = 0;
        let hiddenPassedCount = 0;
        let visibleTotal = 0;
        let hiddenTotal = 0;
        
        const totalTests = validation.testCases.length;
        const testResultsSummary: string[] = [];
        const hiddenTestResultsSummary: string[] = [];
        const newTestResults: TestResult[] = [];

        for (let i = 0; i < totalTests; i++) {
            const testCase = validation.testCases[i];
            const testQueue = [...testCase.inputQueue];
            const isHidden = testCase.hidden === 1;

            if (isHidden) {
                hiddenTotal++;
            } else {
                visibleTotal++;
                const headerLog = `\n> Running Test Case ${i + 1}/${totalTests}\n> Inputs: [${testCase.inputQueue.join(", ")}]`;
                addLogUI(headerLog);
            }

            // Execute logic silently
            const startTime = performance.now();
            const testLogs = await runFlowchart(testQueue, true);
            const endTime = performance.now();

            // Push test logs to UI immediately if not hidden
            if (!isHidden) {
                if (testLogs && testLogs.length > 0) {
                    testLogs.forEach(log => {
                        addLogUI(`  ${log}`);
                    });
                } else {
                    addLogUI(`  [No logs generated]`);
                }
            }

            let passed = false;

            if (validation.matchStrategy === "contains_number") {
                // Find outputs in the logs (lines starting with '>')
                const outputs = testLogs.filter(log => log.startsWith('> '));

                // Check if any output contains the expected number
                for (const output of outputs) {
                    const strVal = output.substring(2).trim(); // Remove '> '
                    // Try parsing the number
                    const numVal = parseFloat(strVal);
                    if (!isNaN(numVal) && numVal === testCase.expected) {
                        passed = true;
                        break;
                    }
                    if (strVal.includes(String(testCase.expected))) {
                        passed = true;
                        break;
                    }
                }
            } else {
                // Default: just check if the output array includes the expected value
                passed = testLogs.some(log => log.startsWith('> ') && log.includes(String(testCase.expected)));
            }

            if (passed) {
                if (isHidden) {
                    hiddenPassedCount++;
                    hiddenTestResultsSummary.push(`Test ${i + 1} - ✅ Passed`);
                } else {
                    passedCount++;
                    testResultsSummary.push(`Test ${i + 1} - ✅ Passed`);
                }
            } else {
                if (isHidden) {
                    hiddenTestResultsSummary.push(`Test ${i + 1} - ❌ Failed`);
                } else {
                    testResultsSummary.push(`Test ${i + 1} - ❌ Failed: ${testCase.hint}`);
                }
            }

            newTestResults.push({
                passed,
                expected: `Output should include: ${testCase.expected}`,
                actual: passed ? `Found expected output` : `Missing expected output. Actual logic logs: [${testLogs.join(" | ")}]`,
                timeMs: Math.max(0.1, endTime - startTime),
                ruleType: 'functional',
                isHidden: isHidden
            });
        }

        const allPassed = (passedCount + hiddenPassedCount) === totalTests;
        
        // Output summary block
        addLogUI("\n");
        
        if (testResultsSummary.length > 0) {
            testResultsSummary.forEach(res => {
                addLogUI(res);
            });
            const visibleSummaryMsg = `\n(${passedCount}/${visibleTotal}) Tests Passed`;
            addLogUI(visibleSummaryMsg);
        }

        if (hiddenTestResultsSummary.length > 0) {
            const header = "\nHidden Tests:";
            addLogUI(header);
            hiddenTestResultsSummary.forEach(res => {
                addLogUI(res);
            });
            const hiddenSummaryMsg = `\n(${hiddenPassedCount}/${hiddenTotal}) Tests Passed`;
            addLogUI(hiddenSummaryMsg);
        }

        const totalSummaryMsg = `\n(${passedCount + hiddenPassedCount}/${totalTests}) Total Passed\n`;
        addLogUI(totalSummaryMsg);

        if (allPassed) {
            const completeMsg = "🎉 ALL TESTS PASSED!";
            addLogUI(completeMsg);
            setHasPassed(true);
        } else {
            addLogUI("⚠️ VALIDATION FAILED. Fix errors and try again.");
        }

        setTestResults(newTestResults);
        setShowTestResultsModal(true);

        setIsRunning(false);
        setIsPendingInput(false);
        return allPassed;
    };

    const isSafeCode = (code: string) => {
        const forbidden = ['window', 'document', 'eval', 'process', 'require', 'fetch', 'XMLHttpRequest', 'localStorage', 'sessionStorage', 'indexedDB', 'cookie'];
        return !forbidden.some(word => code.includes(word));
    };

    const runFlowchartAction = async () => {
        setHasPassed(false); // Reset pass state on new run

        // If there is validation set, run the validation sequence
        // We will no longer run the visual sequence if validation exists to prevent doubling outputs
        if (validation) {
            await runValidation();
        } else {
            // Only run the standard visual component if there is no implicit validation mapped out.
            await runFlowchart();
        }
    };

    const onDragStart = (event: React.DragEvent, nodeType: string) => {
        event.dataTransfer.setData('application/reactflow', nodeType);
        event.dataTransfer.effectAllowed = 'move';
    };


    return (
        <div className="flex flex-col md:flex-row h-[calc(100dvh-3.5rem)] bg-[#FDFCF8] overflow-hidden">
            {/* Sidebar / Toolbox */}
            <div 
                className="w-full md:w-64 bg-white border-r border-zinc-100 flex flex-col md:h-full h-auto max-h-[35dvh] md:max-h-none overflow-y-auto z-10 shrink-0 shadow-sm md:shadow-none"
                onWheelCapture={(e) => e.stopPropagation()}
            >
                <div className="p-2 md:p-4 border-b border-zinc-100 bg-zinc-50 flex justify-between items-center sticky top-0 md:static z-20">
                    <div>
                        <h3 className="font-bold text-zinc-900 text-xs md:text-base flex items-center gap-2">
                            <Terminal size={14} className="md:w-4 md:h-4" /> Challenge
                        </h3>
                    </div>
                    <div className="flex gap-2">
                        {hasPassed && onComplete && (
                            <button
                                onClick={onComplete}
                                className="md:hidden px-2 py-1 rounded-md flex items-center gap-1 font-bold text-[10px] tracking-wide transition-all shadow-sm active:scale-95 bg-emerald-500 text-white"
                            >
                                CONTINUE
                            </button>
                        )}
                        <button
                            onClick={runFlowchartAction}
                            disabled={isRunning}
                            className={`md:hidden px-2 py-1 rounded-md flex items-center gap-1 font-bold text-[10px] tracking-wide transition-all shadow-sm active:scale-95
                                ${isRunning ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' : 'bg-[#D4F268] text-zinc-900'}
                            `}
                        >
                            {isRunning ? '...' : <><Play size={10} fill="currentColor" /> RUN</>}
                        </button>
                    </div>
                </div>

                {/* Task Instructions */}
                <div className="p-3 md:p-4 border-b border-zinc-100 bg-white">
                    <p className="text-[10px] md:text-xs text-zinc-600 leading-relaxed italic">
                        {task}
                    </p>
                    {requiredNodes.length > 0 && (
                        <div className="mt-2">
                            <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">Requirements</div>
                            <div className="flex flex-wrap gap-1">
                                {requiredNodes.map((rn, idx) => (
                                    <span key={idx} className="px-1.5 py-0.5 bg-zinc-100 text-zinc-600 rounded text-[8px] font-mono border border-zinc-200">
                                        {rn}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Tabs Header */}
                <div className="flex border-b border-zinc-100 bg-zinc-50/50 shrink-0">
                    <button 
                        className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-colors ${activeSidebarTab === 'toolbox' ? 'text-zinc-900 border-b-2 border-[#D4F268] bg-white' : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600'}`}
                        onClick={() => setActiveSidebarTab('toolbox')}
                    >
                        <Plus size={12} /> Toolbox
                    </button>
                    <button 
                        className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-wider flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 transition-colors ${activeSidebarTab === 'pseudocode' ? 'text-zinc-900 border-b-2 border-[#D4F268] bg-white' : 'text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600'}`}
                        onClick={() => setActiveSidebarTab('pseudocode')}
                    >
                        <Terminal size={12} /> Pseudocode
                    </button>
                </div>

                {activeSidebarTab === 'toolbox' ? (
                    <div className="min-h-[85px] md:min-h-0 p-2 md:p-4 flex flex-row md:flex-col gap-2 md:gap-3 overflow-x-auto md:overflow-y-auto shrink-0 md:flex-1 items-center md:items-stretch [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-300 hover:[&::-webkit-scrollbar-thumb]:bg-zinc-400 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {/* Items wrapper for horizontal scroll on mobile */}
                    <div className="flex md:flex-col gap-2 md:gap-3 min-w-max md:min-w-0 items-center md:items-stretch h-full px-1">
                        <div className="text-[9px] md:text-xs font-bold text-zinc-400 uppercase tracking-wider mb-0.5 hidden md:block">Flow Control</div>

                        <div
                            className="p-1.5 md:p-3 bg-green-50 border border-green-500 rounded-full cursor-pointer md:cursor-grab active:cursor-grabbing font-mono text-[10px] md:text-xs font-bold text-green-700 text-center shadow-sm hover:shadow-md transition-all w-16 md:w-full shrink-0"
                            onDragStart={(event) => onDragStart(event, 'start')}
                            onClick={() => addNode('start')}
                            draggable
                        >
                            START
                        </div>
                        <div
                            className="p-1.5 md:p-3 bg-red-50 border border-red-500 rounded-full cursor-pointer md:cursor-grab active:cursor-grabbing font-mono text-[10px] md:text-xs font-bold text-red-700 text-center shadow-sm hover:shadow-md transition-all w-16 md:w-full shrink-0"
                            onDragStart={(event) => onDragStart(event, 'end')}
                            onClick={() => addNode('end')}
                            draggable
                        >
                            END
                        </div>
                        <div
                            className="p-1.5 md:p-3 bg-rose-50 border border-rose-500 rounded-full cursor-pointer md:cursor-grab active:cursor-grabbing font-mono text-[10px] md:text-xs font-bold text-rose-700 text-center shadow-sm hover:shadow-md transition-all w-24 md:w-full shrink-0"
                            onDragStart={(event) => onDragStart(event, 'return')}
                            onClick={() => addNode('return')}
                            draggable
                        >
                            RETURN
                        </div>

                        <div className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 mt-2 hidden md:block">Modifiers</div>

                        <div
                            className="p-1.5 md:p-3 bg-red-50 border border-red-500 rounded-md cursor-pointer md:cursor-grab active:cursor-grabbing font-mono text-[10px] md:text-xs font-bold text-red-700 text-center shadow-sm hover:shadow-md transition-all w-20 md:w-full shrink-0"
                            onDragStart={(event) => onDragStart(event, 'break')}
                            onClick={() => addNode('break')}
                            draggable
                        >
                            BREAK
                        </div>
                        <div
                            className="p-1.5 md:p-3 bg-yellow-50 border border-yellow-500 rounded-md cursor-pointer md:cursor-grab active:cursor-grabbing font-mono text-[10px] md:text-xs font-bold text-yellow-700 text-center shadow-sm hover:shadow-md transition-all w-20 md:w-full shrink-0"
                            onDragStart={(event) => onDragStart(event, 'continue')}
                            onClick={() => addNode('continue')}
                            draggable
                        >
                            <span className="text-[9px]">CONTINUE</span>
                        </div>
                        <div
                            className="p-1.5 md:p-3 bg-zinc-50 border border-zinc-400 rounded-md cursor-pointer md:cursor-grab active:cursor-grabbing font-mono text-[10px] md:text-xs font-bold text-zinc-600 text-center shadow-sm hover:shadow-md transition-all w-20 md:w-full shrink-0"
                            onDragStart={(event) => onDragStart(event, 'pass')}
                            onClick={() => addNode('pass')}
                            draggable
                        >
                            PASS
                        </div>

                        <div className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 mt-2 hidden md:block">Logic</div>

                        <div
                            className="p-1 md:p-2 border-2 border-blue-700 border-l-[4px] border-r-[4px] bg-blue-50 rounded-sm cursor-pointer md:cursor-grab active:cursor-grabbing font-mono text-[10px] md:text-xs font-bold text-blue-800 text-center shadow-sm hover:shadow-md transition-all w-20 md:w-full shrink-0"
                            onDragStart={(event) => onDragStart(event, 'call')}
                            onClick={() => addNode('call')}
                            draggable
                        >
                            CALL
                        </div>
                        <div
                            className="p-1.5 md:p-3 bg-white border border-blue-500 rounded-lg cursor-pointer md:cursor-grab active:cursor-grabbing font-mono text-[10px] md:text-xs font-bold text-blue-700 text-center shadow-sm hover:shadow-md transition-all w-20 md:w-full shrink-0"
                            onDragStart={(event) => onDragStart(event, 'process')}
                            onClick={() => addNode('process')}
                            draggable
                        >
                            PROCESS
                        </div>
                        <div
                            className="p-1.5 md:p-3 bg-white border border-cyan-500 rounded-sm transform -skew-x-12 cursor-pointer md:cursor-grab active:cursor-grabbing font-mono text-[10px] md:text-xs font-bold text-cyan-700 text-center shadow-sm hover:shadow-md transition-all w-20 md:w-full shrink-0 ml-1"
                            onDragStart={(event) => onDragStart(event, 'input')}
                            onClick={() => addNode('input')}
                            draggable
                        >
                            <span className="transform skew-x-12 inline-block">INPUT</span>
                        </div>
                        <div
                            className="p-1.5 md:p-3 bg-white border border-purple-500 rounded-sm transform -skew-x-12 cursor-pointer md:cursor-grab active:cursor-grabbing font-mono text-[10px] md:text-xs font-bold text-purple-700 text-center shadow-sm hover:shadow-md transition-all w-20 md:w-full shrink-0 ml-1"
                            onDragStart={(event) => onDragStart(event, 'output')}
                            onClick={() => addNode('output')}
                            draggable
                        >
                            <span className="transform skew-x-12 inline-block">PRINT</span>
                        </div>
                        <div
                            className="p-1.5 md:p-3 bg-indigo-50 border border-indigo-500 rounded-full cursor-pointer md:cursor-grab active:cursor-grabbing font-mono text-[10px] md:text-xs font-bold text-indigo-700 text-center shadow-sm hover:shadow-md transition-all w-20 md:w-full shrink-0"
                            onDragStart={(event) => onDragStart(event, 'repeat')}
                            onClick={() => addNode('repeat')}
                            draggable
                        >
                            ↻ REPEAT
                        </div>

                        <div className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 mt-2 hidden md:block">Conditions</div>

                        <div
                            className="bg-white border border-orange-500 rounded-sm transform rotate-45 m-1 md:m-2 cursor-pointer md:cursor-grab active:cursor-grabbing font-mono text-[10px] md:text-xs font-bold text-orange-700 text-center shadow-sm hover:shadow-md transition-all w-10 h-10 md:w-16 md:h-16 flex items-center justify-center shrink-0 self-center"
                            onDragStart={(event) => onDragStart(event, 'decision')}
                            onClick={() => addNode('decision')}
                            draggable
                        >
                            <span className="transform -rotate-45">IF</span>
                        </div>
                        <div
                            className="relative flex items-center justify-center p-1 md:p-2 cursor-pointer md:cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
                            onDragStart={(event) => onDragStart(event, 'switch')}
                            onClick={() => addNode('switch')}
                            draggable
                        >
                            <div className="relative w-[60px] h-[30px] flex items-center justify-center">
                                <svg className="absolute inset-0 w-full h-full z-0 overflow-visible" viewBox="0 0 60 30" style={{ pointerEvents: 'none' }}>
                                    <polygon points="10,2 50,2 58,15 50,28 10,28 2,15" fill="white" stroke="#f59e0b" strokeWidth="2" />
                                </svg>
                                <span className="text-[8px] md:text-[10px] font-bold text-amber-700 z-10">SWITCH</span>
                            </div>
                        </div>
                        <div
                            className="p-1.5 md:p-3 border border-amber-500 bg-white rounded-sm cursor-pointer md:cursor-grab active:cursor-grabbing font-mono text-[10px] md:text-xs font-bold text-amber-700 text-center shadow-sm hover:shadow-md transition-all w-20 md:w-full shrink-0"
                            onDragStart={(event) => onDragStart(event, 'case')}
                            onClick={() => addNode('case')}
                            draggable
                        >
                            CASE
                        </div>

                        <div className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 mt-3 hidden md:block">Iteration</div>

                        <div className="flex gap-1 md:flex-col w-full items-center">
                            <div
                                className="relative flex items-center justify-center p-1 md:p-2 cursor-pointer md:cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
                                onDragStart={(event) => onDragStart(event, 'for')}
                                onClick={() => addNode('for')}
                                draggable
                            >
                                <div className="relative w-[60px] h-[30px] flex items-center justify-center">
                                    <svg className="absolute inset-0 w-full h-full z-0 overflow-visible" style={{ pointerEvents: 'none' }}>
                                        <polygon points="5,2 55,2 60,15 55,28 5,28 0,15" fill="white" stroke="#ec4899" strokeWidth="2" />
                                    </svg>
                                    <span className="text-[8px] md:text-[10px] font-bold text-pink-700 z-10">FOR</span>
                                </div>
                            </div>
                            <div
                                className="relative flex items-center justify-center p-1 md:p-2 cursor-pointer md:cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
                                onDragStart={(event) => onDragStart(event, 'while')}
                                onClick={() => addNode('while')}
                                draggable
                            >
                                <div className="relative w-[60px] h-[30px] flex items-center justify-center">
                                    <svg className="absolute inset-0 w-full h-full z-0 overflow-visible" style={{ pointerEvents: 'none' }}>
                                        <polygon points="5,2 55,2 60,15 55,28 5,28 0,15" fill="white" stroke="#ec4899" strokeWidth="2" />
                                    </svg>
                                    <span className="text-[8px] md:text-[10px] font-bold text-pink-700 z-10">WHILE</span>
                                </div>
                            </div>
                            <div
                                className="relative flex items-center justify-center p-1 md:p-2 cursor-pointer md:cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
                                onDragStart={(event) => onDragStart(event, 'do_while')}
                                onClick={() => addNode('do_while')}
                                draggable
                            >
                                <div className="flex flex-col items-center">
                                    <div className="w-[34px] h-[14px] bg-white border-[1.5px] border-pink-500 rounded-[2px] flex items-center justify-center z-10">
                                        <span className="text-[7px] font-bold text-pink-700">DO</span>
                                    </div>
                                    <div className="w-[1.5px] h-[5px] bg-pink-500 z-0"></div>
                                    <div className="relative w-[50px] h-[20px] flex items-center justify-center z-10">
                                        <svg className="absolute inset-0 w-full h-full overflow-visible">
                                            <polygon points="5,2 45,2 50,10 45,18 5,18 0,10" fill="white" stroke="#ec4899" strokeWidth="1.5" />
                                        </svg>
                                        <span className="text-[7px] font-bold text-pink-700 relative z-10">...</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
                ) : (
                    <div className="min-h-[120px] md:min-h-0 shrink-0 md:flex-1 flex flex-col h-full bg-[#1A1A1A] relative shadow-inner overflow-hidden">
                        <div className="p-3 bg-zinc-900 border-b border-zinc-800 flex justify-between items-center shrink-0">
                            <span className="text-[10px] uppercase tracking-widest text-[#D4F268] font-bold flex items-center gap-2"><Terminal size={12}/> Autobuilt Pseudocode</span>
                        </div>
                        <div className="flex-1 overflow-y-auto bg-[#1A1A1A] text-zinc-300 font-mono text-xs md:text-sm py-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-zinc-900 [&::-webkit-scrollbar-thumb]:bg-zinc-700 hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600 [&::-webkit-scrollbar-thumb]:rounded-full cursor-default">
                            {pseudocodeLines.map((line, idx) => {
                                const isSelected = line.nodeId ? nodes.find(n => n.id === line.nodeId)?.selected : false;
                                const isActive = isRunning && line.nodeId === activeNodeId;
                                
                                let displayText = line.text
                                    .replace(/&/g, "&amp;")
                                    .replace(/</g, "&lt;")
                                    .replace(/>/g, "&gt;")
                                    .replace(/"/g, "&quot;")
                                    .replace(/'/g, "&#039;");

                                if (isActive && Object.keys(runtimeContext).length > 0) {
                                    // Inject live variable values `{value}` inline
                                    displayText = displayText.replace(/\b([a-zA-Z_]\w*)\b/g, (match) => {
                                        if (runtimeContext[match] !== undefined && !['IF', 'THEN', 'ELSE', 'END', 'FOR', 'WHILE', 'DO', 'PRINT', 'INPUT', 'SET', 'BEGIN'].includes(match)) {
                                            let val = runtimeContext[match];
                                            if (typeof val === 'number') val = Number.isInteger(val) ? val : parseFloat(val.toFixed(2));
                                            return `${match}<span class="text-cyan-400 font-bold">{${val}}</span>`;
                                        }
                                        return match;
                                    });
                                }

                                return (
                                    <div 
                                        key={idx} 
                                        className={`flex px-2 py-0.5 hover:bg-zinc-800/50 transition-colors ${line.nodeId ? 'cursor-pointer' : ''} ${isActive ? 'bg-[#D4F268]/20 text-[#D4F268] border-l-2 border-[#D4F268]' : isSelected ? 'bg-zinc-800 text-white border-l-2 border-[#D4F268]' : 'border-l-2 border-transparent text-zinc-400'}`}
                                        onClick={() => {
                                            if (line.nodeId) {
                                                setNodes(nds => nds.map(n => ({ ...n, selected: n.id === line.nodeId })));
                                            }
                                        }}
                                    >
                                        <div className="w-6 text-right pr-3 text-zinc-600 select-none text-[10px] opacity-70 border-r border-zinc-800 mr-3 shrink-0">{line.lineNumber}</div>
                                        <div className="flex-1 whitespace-pre-wrap" style={{ paddingLeft: `${line.indent * 1.25}rem` }} dangerouslySetInnerHTML={{ __html: displayText }} />
                                    </div>
                                );
                            })}
                        </div>
                        
                        {/* Variables Memory Panel */}
                        {Object.keys(runtimeContext).length > 0 && (
                            <div className="shrink-0 bg-zinc-900/80 border-t border-zinc-800 p-2 md:p-3 max-h-[120px] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-zinc-900 [&::-webkit-scrollbar-thumb]:bg-zinc-700">
                                <div className="text-[9px] text-zinc-500 uppercase font-bold tracking-wider mb-2">Live Memory Cache</div>
                                <div className="flex flex-wrap gap-2">
                                    {Object.entries(runtimeContext).map(([k, v]) => (
                                        <div key={k} className="bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-[10px] md:text-xs font-mono border border-zinc-700/50 shadow-sm flex items-center gap-1.5">
                                            <span className="text-pink-400">{k}</span> <span className="text-zinc-500">=</span> <span className="text-cyan-400 font-bold">{typeof v === 'number' && !Number.isInteger(v) ? v.toFixed(2) : String(v)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className="p-2 md:p-4 border-t border-zinc-100 bg-zinc-50 sticky bottom-0 md:static z-20 flex flex-col gap-2">
                    {/* Desktop Run Button */}
                    <div className="hidden md:flex flex-col gap-2 w-full">
                        <div className="flex gap-2 w-full">
                            <button
                                onClick={() => runFlowchart()}
                                disabled={isRunning}
                                className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 font-bold tracking-wide transition-all shadow-md active:scale-95
                                    ${isRunning ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' : 'bg-[#D4F268] hover:bg-zinc-100 border border-zinc-200 text-zinc-900'}
                                `}
                            >
                                {isRunning ? 'Running...' : <><Play size={16} fill="currentColor" className="text-black" /> RUN</>}
                            </button>
                            <button
                                onClick={runFlowchartAction}
                                disabled={isRunning}
                                className={`flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2 font-bold tracking-wide transition-all shadow-md active:scale-95
                                    ${isRunning ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed' : 'bg-[#D4F268] hover:zinc-100 border border-zinc-200 text-zinc-900'}
                                `}
                            >
                                {isRunning ? 'Running...' : <><Play size={16} fill="currentColor" className="text-black" /> SUBMIT</>}
                            </button>
                        </div>
                        {hasPassed && onComplete && (
                            <button
                                onClick={onComplete}
                                className="w-full py-2.5 rounded-lg flex items-center justify-center gap-2 font-bold tracking-wide transition-all shadow-md active:scale-95 bg-emerald-500 hover:bg-emerald-600 text-white"
                            >
                                CONTINUE
                            </button>
                        )}
                    </div>

                    {/* Mobile Tools (Reset/Delete) */}
                    <div className="flex gap-2 w-full">
                        <button
                            onClick={() => { setNodes(initialNodes); setEdges([]); setLogs([]); }}
                            className="flex-1 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-bold text-zinc-500 bg-white border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center gap-1.5 transition-colors"
                            title="Reset Canvas"
                        >
                            <RotateCcw size={12} className="md:w-3.5 md:h-3.5" />
                        </button>
                        <button
                            onClick={onDeleteSelected}
                            className="flex-1 py-1.5 md:py-2 rounded-lg text-[10px] md:text-xs font-bold text-red-500 bg-white border border-red-100 hover:bg-red-50 flex items-center justify-center gap-1.5 transition-colors"
                            title="Delete Selected Node/Edge"
                        >
                            <Trash2 size={12} className="md:w-3.5 md:h-3.5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Canvas Area */}
            <div className="flex-1 relative flex flex-col h-full bg-zinc-50 overflow-hidden">
                {activeNodeId && isRunning && (
                    <style>{`
                        .react-flow__node[data-id="${activeNodeId}"] > div {
                            box-shadow: 0 0 0 4px #D4F268, 0 0 30px rgba(212, 242, 104, 0.9) !important;
                            border-color: #D4F268 !important;
                            transform: scale(1.03);
                            z-index: 1000;
                            transition: all 0.2s ease;
                        }
                    `}</style>
                )}
                <div className="flex-1 w-full relative" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodesWithHandler}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onNodeDoubleClick={handleNodeDoubleClick}
                        nodeTypes={nodeTypes}
                        fitView
                        className="bg-zinc-50"
                        deleteKeyCode={['Backspace', 'Delete']}
                        multiSelectionKeyCode={['Meta', 'Shift']}
                        selectionOnDrag={true}
                        panOnDrag={true} // Ensure pan is enabled
                        zoomOnScroll={true}
                    >
                        <Controls className="bg-white border border-zinc-200 shadow-sm" />
                        <Background color="#ccc" gap={20} size={1} />
                        <MiniMap className="border border-zinc-200 shadow-sm rounded-lg overflow-hidden" zoomable pannable />

                        <Panel position="top-right" className="bg-white/80 backdrop-blur p-2 rounded-lg shadow-sm border border-zinc-100 text-xs text-zinc-500 hidden md:block">
                            Drag to connect • Double-click to connect • Backspace to delete
                        </Panel>
                    </ReactFlow>
                </div>

                {/* Console Output (Bottom Panel - Collapsible) */}
                <div
                    className={`bg-zinc-900 border-t border-zinc-800 flex flex-col shrink-0 transition-all duration-300 ease-in-out ${isConsoleOpen ? 'h-[150px] md:h-[250px]' : 'h-9'}`}
                    onWheelCapture={(e) => e.stopPropagation()}
                >
                    <div
                        className="px-4 py-2 border-b border-zinc-800 flex items-center justify-between bg-zinc-900 cursor-pointer hover:bg-zinc-800 transition-colors"
                        onClick={() => setIsConsoleOpen(!isConsoleOpen)}
                    >
                        <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                            <Terminal size={14} /> Console {logs.length > 0 && <span className="bg-zinc-700 text-zinc-300 px-1.5 rounded-full text-[9px]">{logs.length}</span>}
                        </span>
                        <div className="flex items-center gap-2">
                            {logs.length > 0 && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); setLogs([]); }}
                                    className="text-zinc-500 hover:text-white transition-colors p-1"
                                    title="Clear Logs"
                                >
                                    <Trash2 size={12} />
                                </button>
                            )}
                            {/* Chevron could go here */}
                        </div>
                    </div>
                    {isConsoleOpen && (
                        <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-zinc-900 [&::-webkit-scrollbar-thumb]:bg-zinc-700 hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600 [&::-webkit-scrollbar-thumb]:rounded-full">
                            {logs.length === 0 ? (
                                <span className="text-zinc-600 italic text-xs">Output will appear here...</span>
                            ) : (
                                logs.map((log, i) => (
                                    <div key={i} className={`
                                        ${log.startsWith('Error') ? 'text-red-400' : ''}
                                        ${log.startsWith('>') ? 'text-[#D4F268]' : 'text-zinc-300'}
                                        ${log.startsWith('Condition') ? 'text-blue-400' : ''}
                                        ${log.startsWith('>>>') ? 'text-zinc-500 font-bold' : ''}
                                        ${log.startsWith('Input:') ? 'text-cyan-400' : ''}
                                        ${log.startsWith('For loop') ? 'text-amber-400' : ''}
                                        text-xs md:text-sm
                                    `}>
                                        {log}
                                    </div>
                                ))
                            )}

                            {/* Input Prompt */}
                            {isPendingInput && (
                                <div className="mt-4 pt-4 border-t border-zinc-700">
                                    <div className="text-cyan-400 text-xs mb-2">{inputPrompt}</div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            inputMode="text"
                                            enterKeyHint="send"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && inputResolveRef.current) {
                                                    inputResolveRef.current(inputValue);
                                                    inputResolveRef.current = null;
                                                }
                                            }}
                                            className="flex-1 bg-zinc-800 border border-zinc-600 rounded px-3 py-2 text-zinc-100 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                                            placeholder="Enter value..."
                                            autoFocus
                                        />
                                        <button
                                            onClick={() => {
                                                if (inputResolveRef.current) {
                                                    inputResolveRef.current(inputValue);
                                                    inputResolveRef.current = null;
                                                }
                                            }}
                                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded font-bold text-sm transition-colors"
                                        >
                                            Submit
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div ref={consoleEndRef} />
                        </div>
                    )}
                </div>
            </div>

            <TestResultsModal 
                isOpen={showTestResultsModal} 
                onClose={() => setShowTestResultsModal(false)} 
                results={testResults} 
            />
        </div>
    );
}
