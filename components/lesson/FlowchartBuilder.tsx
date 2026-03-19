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
    useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Play, RotateCcw, Plus, Trash2, Terminal, MousePointerClick } from 'lucide-react';
import { useMediaQuery } from "@/hooks/use-media-query";

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
    onChange?: (id: string, value: string) => void;
}

// Base styling for nodes
const nodeBaseStyle = "px-4 py-2 shadow-md border-2 bg-white text-xs font-mono font-bold text-center min-w-[100px] flex flex-col items-center justify-center transition-all hover:shadow-lg active:scale-95";

// --- NODE COMPONENTS ---

// Start Node - Oval
function StartNode({ data }: NodeProps) {
    return (
        <div className="relative group">
            <div className={`px-6 py-3 rounded-full border-2 border-green-500 bg-green-50 shadow-sm text-green-700 font-bold text-xs tracking-wider min-w-[80px] text-center`}>
                START
            </div>
            <Handle type="source" position={Position.Bottom} className="w-4 h-4 md:w-3 md:h-3 bg-green-500 border-2 border-white" />
        </div>
    );
}

// End Node - Oval
function EndNode({ data }: NodeProps) {
    return (
        <div className="relative group">
            <Handle type="target" position={Position.Top} className="w-4 h-4 md:w-3 md:h-3 bg-red-400 border-2 border-white" />
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
            <Handle type="target" position={Position.Top} className="w-4 h-4 md:w-3 md:h-3 bg-blue-500 border-2 border-white" />
            <div className={`${nodeBaseStyle} border-blue-500 rounded-lg`}>
                <div className="text-blue-600 mb-1 uppercase tracking-wide text-[10px]">Process</div>
                <input
                    className="w-full text-xs p-1.5 border border-zinc-200 rounded text-center font-mono bg-zinc-50 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all"
                    value={code || ''}
                    onChange={(evt) => onChange && onChange(id, evt.target.value)}
                    placeholder="ctx.x = 10"
                />
            </div>
            <Handle type="source" position={Position.Bottom} className="w-4 h-4 md:w-3 md:h-3 bg-blue-500 border-2 border-white" />
        </div>
    );
}

// Input Node - Parallelogram (Blue/Cyan)
function InputNode({ data, id }: NodeProps) {
    const { code, onChange } = data as FlowchartNodeData;
    return (
        <div className="relative">
            <Handle type="target" position={Position.Top} className="w-4 h-4 md:w-3 md:h-3 bg-cyan-500 border-2 border-white z-10" />

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

            <Handle type="source" position={Position.Bottom} className="w-4 h-4 md:w-3 md:h-3 bg-cyan-500 border-2 border-white z-10" />
        </div>
    );
}


// Output Node - Parallelogram (Purple)
function OutputNode({ data, id }: NodeProps) {
    const { code, onChange } = data as FlowchartNodeData;
    return (
        <div className="relative">
            <Handle type="target" position={Position.Top} className="w-4 h-4 md:w-3 md:h-3 bg-purple-500 border-2 border-white z-10" />

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

            <Handle type="source" position={Position.Bottom} className="w-4 h-4 md:w-3 md:h-3 bg-purple-500 border-2 border-white z-10" />
        </div>
    );
}

// Decision Node - Diamond
function DecisionNode({ data, id }: NodeProps) {
    const { code, onChange } = data as FlowchartNodeData;
    return (
        <div className="relative flex items-center justify-center p-6">
            <Handle type="target" position={Position.Top} className="w-4 h-4 md:w-3 md:h-3 bg-orange-500 border-2 border-white z-20 -mt-6" />

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

            <Handle type="source" position={Position.Left} id="false" className="w-4 h-4 md:w-3 md:h-3 bg-red-400 border-2 border-white z-20 -ml-7" />
            <Handle type="source" position={Position.Right} id="true" className="w-4 h-4 md:w-3 md:h-3 bg-green-400 border-2 border-white z-20 -mr-7" />
        </div>
    );
}

// For Loop Node - Hexagon
function ForNode({ data, id }: NodeProps) {
    const { code, onChange } = data as FlowchartNodeData;
    return (
        <div className="relative flex items-center justify-center p-2">
            <Handle type="target" position={Position.Top} className="w-4 h-4 md:w-3 md:h-3 bg-amber-500 border-2 border-white z-20" />

            {/* Hexagon simulated with CSS clip-path or simple styling. Using a simpler stretched 'hexagon-like' shape or detailed SVG? 
                Let's use a simpler visual: A rectangle with pointed sides.
            */}
            <div className="relative flex items-center">
                {/* Left Triangle */}
                <div className="w-0 h-0 border-t-[25px] border-t-transparent border-r-[15px] border-r-amber-500 border-b-[25px] border-b-transparent"></div>
                {/* Center Rect */}
                <div className="h-[50px] bg-amber-500 bg-opacity-10 border-t-2 border-b-2 border-amber-500 flex flex-col items-center justify-center px-2 min-w-[120px]">
                    <div className="font-bold text-amber-700 text-[10px] uppercase tracking-wide">FOR Loop</div>
                    <input
                        className="w-full text-[10px] p-1 border border-amber-200 rounded text-center font-mono bg-white focus:outline-none focus:border-amber-400 transition-all"
                        value={code || ''}
                        onChange={(evt) => onChange && onChange(id, evt.target.value)}
                        placeholder="i=0; i<10; i++"
                    />
                </div>
                {/* Right Triangle */}
                <div className="w-0 h-0 border-t-[25px] border-t-transparent border-l-[15px] border-l-amber-500 border-b-[25px] border-b-transparent"></div>
            </div>

            {/* Loop Exit (False/Done) usually bottom, Continue (True/Next) usually side/bottom? 
                For loop is usually: Top In -> Condition -> True (Body) -> Increment -> Condition... -> False (Exit).
                We can treat it like Decision: True (Loop), False (Exit).
            */}
            <div className="absolute w-full flex justify-between pointer-events-none z-20 top-1/2 transform -translate-y-1/2 px-1">
                <span className="text-[9px] font-bold text-red-500 bg-white/80 px-1 -ml-8">Exit</span>
                <span className="text-[9px] font-bold text-green-600 bg-white/80 px-1 -mr-8">Loop</span>
            </div>

            <Handle type="source" position={Position.Left} id="false" className="w-4 h-4 md:w-3 md:h-3 bg-red-400 border-2 border-white z-20 -ml-4" />
            <Handle type="source" position={Position.Right} id="true" className="w-4 h-4 md:w-3 md:h-3 bg-green-400 border-2 border-white z-20 -mr-4" />
        </div>
    );
}

// While Loop Node - Hexagon (Same visual as For usually, or similiar)
function WhileNode({ data, id }: NodeProps) {
    const { code, onChange } = data as FlowchartNodeData;
    return (
        <div className="relative flex items-center justify-center p-2">
            <Handle type="target" position={Position.Top} className="w-4 h-4 md:w-3 md:h-3 bg-amber-500 border-2 border-white z-20" />

            <div className="relative flex items-center">
                <div className="w-0 h-0 border-t-[25px] border-t-transparent border-r-[15px] border-r-amber-500 border-b-[25px] border-b-transparent"></div>
                <div className="h-[50px] bg-amber-500 bg-opacity-10 border-t-2 border-b-2 border-amber-500 flex flex-col items-center justify-center px-2 min-w-[120px]">
                    <div className="font-bold text-amber-700 text-[10px] uppercase tracking-wide">WHILE Loop</div>
                    <input
                        className="w-full text-[10px] p-1 border border-amber-200 rounded text-center font-mono bg-white focus:outline-none focus:border-amber-400 transition-all"
                        value={code || ''}
                        onChange={(evt) => onChange && onChange(id, evt.target.value)}
                        placeholder="ctx.x < 10"
                    />
                </div>
                <div className="w-0 h-0 border-t-[25px] border-t-transparent border-l-[15px] border-l-amber-500 border-b-[25px] border-b-transparent"></div>
            </div>

            <div className="absolute w-full flex justify-between pointer-events-none z-20 top-1/2 transform -translate-y-1/2 px-1">
                <span className="text-[9px] font-bold text-red-500 bg-white/80 px-1 -ml-8">Exit</span>
                <span className="text-[9px] font-bold text-green-600 bg-white/80 px-1 -mr-8">Loop</span>
            </div>

            <Handle type="source" position={Position.Left} id="false" className="w-4 h-4 md:w-3 md:h-3 bg-red-400 border-2 border-white z-20 -ml-4" />
            <Handle type="source" position={Position.Right} id="true" className="w-4 h-4 md:w-3 md:h-3 bg-green-400 border-2 border-white z-20 -mr-4" />
        </div>
    );
}

// Repeat Node - Circular Arrow (for while loop  connections)
function RepeatNode({ data }: NodeProps) {
    return (
        <div className="relative">
            <Handle type="target" position={Position.Top} className="w-4 h-4 md:w-3 md:h-3 bg-indigo-500 border-2 border-white z-10" />

            <div className="px-4 py-2 rounded-full border-2 border-indigo-500 bg-indigo-50 shadow-sm flex items-center justify-center min-w-[80px]">
                <span className="text-indigo-700 font-bold text-xs tracking-wider">↻ REPEAT</span>
            </div>

            <Handle type="source" position={Position.Bottom} className="w-4 h-4 md:w-3 md:h-3 bg-indigo-500 border-2 border-white z-10" />
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
    repeat: RepeatNode
};

// --- MAIN COMPONENT ---

const initialNodes: Node<FlowchartNodeData>[] = [
    { id: '1', type: 'start', position: { x: 250, y: 50 }, data: { label: 'Start' } },
];

const getId = () => `node_${Math.random().toString(36).substring(2, 9)}`;

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
    const [hasPassed, setHasPassed] = useState(false);
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [isConsoleOpen, setIsConsoleOpen] = useState(false); // Default to closed on mobile (and desktop initially until hydration)

    // Input handling states
    const [isPendingInput, setIsPendingInput] = useState(false);
    const [inputPrompt, setInputPrompt] = useState("");
    const [inputValue, setInputValue] = useState("");
    const inputResolveRef = useRef<((value: string) => void) | null>(null);

    // Double-tap connection state
    const [connectionSource, setConnectionSource] = useState<{
        nodeId: string;
        handleId: string | null;
    } | null>(null);

    useEffect(() => {
        // Sync state with media query only if it changes or on mount
        setIsConsoleOpen(isDesktop);
    }, [isDesktop]);

    // Update node data (code)
    const onNodeDataChange = (id: string, value: string) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id) {
                    node.data = { ...node.data, code: value };
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

    // Double-tap/click Connection Logic
    const handleNodeDoubleClick = useCallback((event: React.MouseEvent, node: Node<FlowchartNodeData>) => {
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
        }
        addLog(">>> STARTING EXECUTION...");

        // Context for variables
        const context: Record<string, any> = {};

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
                return !!func(context);
            } catch (e: any) {
                addLog(`Condition Error: ${e.message}`);
                return false;
            }
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

                // Execute Logic based on type
                switch (currentNode.type) {
                    case 'process':
                        if (currentNode.data.code) {
                            try {
                                const code = currentNode.data.code as string;
                                if (!isSafeCode(code)) { addLog('⚠️ Unsafe code blocked'); break; }
                                const func = new Function('ctx', `with(ctx) { ${code} }`);
                                func(context);
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
                                    result = func(context);
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
                                    initFunc(context);

                                    // Find the loop body (true path)
                                    const trueEdge = edges.find(e => e.source === currentNode?.id && e.sourceHandle === 'true');
                                    const falseEdge = edges.find(e => e.source === currentNode?.id && e.sourceHandle === 'false');

                                    // Execute the for loop
                                    while (evaluateCondition(parsed.condition)) {
                                        if (steps >= MAX_STEPS) break;

                                        // Execute loop body (follow true path once)
                                        if (trueEdge) {
                                            let bodyNode = nodes.find(n => n.id === trueEdge.target);
                                            let bodySteps = 0;
                                            const MAX_BODY_STEPS = 50;

                                            while (bodyNode && bodySteps < MAX_BODY_STEPS) {
                                                bodySteps++;
                                                steps++;

                                                // Execute the body node (but don't follow back to for or to false path)
                                                if (bodyNode.type === 'output' && bodyNode.data.code) {
                                                    const func = new Function('ctx', `with(ctx) { return (${bodyNode.data.code}); }`);
                                                    const result = func(context);
                                                    addLog(`> ${result}`);
                                                } else if (bodyNode.type === 'process' && bodyNode.data.code) {
                                                    const func = new Function('ctx', `with(ctx) { ${bodyNode.data.code} }`);
                                                    func(context);
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
                                        }

                                        // Execute increment
                                        const incFunc = new Function('ctx', `with(ctx) { ${parsed.increment} }`);
                                        incFunc(context);
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

                    case 'while':
                    // While loops work like decision nodes - user connects repeat block manually
                    // Fall through to decision logic
                    case 'decision':
                        let condition = false;
                        try {
                            const code: string = (currentNode.data.code as string) || "false";
                            condition = evaluateCondition(code);
                            addLog(`Condition (${code}) is ${condition}`);
                        } catch (e: any) {
                            addLog(`Condition Error: ${e.message}`);
                        }

                        const targetHandle = condition ? 'true' : 'false';
                        const edge: Edge | undefined = edges.find(
                            e => e.source === currentNode?.id && e.sourceHandle === targetHandle
                        );

                        if (edge) {
                            currentNode = nodes.find(n => n.id === edge.target);
                        } else {
                            addLog(`Dead end: No path for ${condition}`);
                            currentNode = undefined;
                        }
                        await wait(500);
                        continue; // Skip standard navigation
                }

                await wait(500); // Step delay

                // Find Next Node (for non-branching nodes)
                if (currentNode?.type === 'end') {
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
        }

        console.log(`runFlowchart silent (${silent}) exiting... Logs Length:`, generatedLogs.length);
        return generatedLogs;
    };


    const runValidation = async () => {
        if (!validation || !validation.testCases) {
            console.log("No functional validation tests defined.");
            return true;
        }

        console.log("=========================================");

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

        for (let i = 0; i < totalTests; i++) {
            const testCase = validation.testCases[i];
            const testQueue = [...testCase.inputQueue];
            const isHidden = testCase.hidden === 1;

            if (isHidden) {
                hiddenTotal++;
            } else {
                visibleTotal++;
                const headerLog = `\n> Running Test Case ${i + 1}/${totalTests}\n> Inputs: [${testCase.inputQueue.join(", ")}]`;
                console.log(headerLog);
                addLogUI(headerLog);
            }

            // Execute logic silently
            const testLogs = await runFlowchart(testQueue, true);

            // Push test logs to UI immediately if not hidden
            if (!isHidden) {
                if (testLogs && testLogs.length > 0) {
                    testLogs.forEach(log => {
                        console.log(`  ${log}`);
                        addLogUI(`  ${log}`);
                    });
                } else {
                    console.log(`  [No logs generated]`);
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
        }

        const allPassed = (passedCount + hiddenPassedCount) === totalTests;
        
        // Output summary block
        console.log("\n");
        addLogUI("\n");
        
        if (testResultsSummary.length > 0) {
            testResultsSummary.forEach(res => {
                console.log(res);
                addLogUI(res);
            });
            const visibleSummaryMsg = `\n(${passedCount}/${visibleTotal}) Tests Passed`;
            console.log(visibleSummaryMsg);
            addLogUI(visibleSummaryMsg);
        }

        if (hiddenTestResultsSummary.length > 0) {
            const header = "\nHidden Tests:";
            console.log(header);
            addLogUI(header);
            hiddenTestResultsSummary.forEach(res => {
                console.log(res);
                addLogUI(res);
            });
            const hiddenSummaryMsg = `\n(${hiddenPassedCount}/${hiddenTotal}) Tests Passed`;
            console.log(hiddenSummaryMsg);
            addLogUI(hiddenSummaryMsg);
        }

        const totalSummaryMsg = `\n(${passedCount + hiddenPassedCount}/${totalTests}) Total Passed\n`;
        console.log(totalSummaryMsg);
        addLogUI(totalSummaryMsg);

        if (allPassed) {
            const completeMsg = "🎉 ALL TESTS PASSED!";
            console.log(completeMsg);
            addLogUI(completeMsg);
            setHasPassed(true);
        } else {
            addLogUI("⚠️ VALIDATION FAILED. Fix errors and try again.");
        }

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
            <div className="w-full md:w-64 bg-white border-r border-zinc-100 flex flex-col md:h-full h-auto max-h-[25dvh] md:max-h-none overflow-y-auto z-10 shrink-0 shadow-sm md:shadow-none">
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

                <div className="p-2 md:p-4 border-b border-zinc-100 bg-zinc-50/50">
                    <h3 className="font-bold text-zinc-500 text-[10px] uppercase tracking-wider flex items-center gap-2">
                        <Plus size={12} /> Toolbox
                    </h3>
                    <p className="text-[9px] text-zinc-400 hidden md:block mt-0.5 italic">Drag nodes onto the canvas</p>
                </div>

                <div className="p-1 md:p-4 flex flex-row md:flex-col gap-2 md:gap-3 overflow-x-auto md:overflow-y-auto flex-1 items-center md:items-stretch scrollbar-hide">
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

                        <div className="text-[10px] md:text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1 mt-2 hidden md:block">Logic</div>

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

                        <div className="flex gap-1 md:flex-col w-full items-center">
                            <div
                                className="relative flex items-center justify-center p-1 md:p-2 cursor-pointer md:cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
                                onDragStart={(event) => onDragStart(event, 'for')}
                                onClick={() => addNode('for')}
                                draggable
                            >
                                <div className="w-0 h-0 border-t-[10px] md:border-t-[15px] border-t-transparent border-r-[6px] md:border-r-[10px] border-r-amber-500 border-b-[10px] md:border-b-[15px] border-b-transparent"></div>
                                <div className="h-[20px] md:h-[30px] bg-white border-t border-b border-amber-500 flex items-center justify-center px-1 md:px-2 min-w-[30px] md:min-w-[60px]">
                                    <span className="text-[8px] md:text-[10px] font-bold text-amber-700">FOR</span>
                                </div>
                                <div className="w-0 h-0 border-t-[10px] md:border-t-[15px] border-t-transparent border-l-[6px] md:border-l-[10px] border-l-amber-500 border-b-[10px] md:border-b-[15px] border-b-transparent"></div>
                            </div>
                            <div
                                className="relative flex items-center justify-center p-1 md:p-2 cursor-pointer md:cursor-grab active:cursor-grabbing hover:scale-105 transition-transform"
                                onDragStart={(event) => onDragStart(event, 'while')}
                                onClick={() => addNode('while')}
                                draggable
                            >
                                <div className="w-0 h-0 border-t-[10px] md:border-t-[15px] border-t-transparent border-r-[6px] md:border-r-[10px] border-r-amber-500 border-b-[10px] md:border-b-[15px] border-b-transparent"></div>
                                <div className="h-[20px] md:h-[30px] bg-white border-t border-b border-amber-500 flex items-center justify-center px-1 md:px-2 min-w-[30px] md:min-w-[60px]">
                                    <span className="text-[8px] md:text-[10px] font-bold text-amber-700">WHILE</span>
                                </div>
                                <div className="w-0 h-0 border-t-[10px] md:border-t-[15px] border-t-transparent border-l-[6px] md:border-l-[10px] border-l-amber-500 border-b-[10px] md:border-b-[15px] border-b-transparent"></div>
                            </div>
                        </div>

                    </div>
                </div>

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
                        <div className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-1">
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
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
