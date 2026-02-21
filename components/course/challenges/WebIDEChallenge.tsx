"use client";

import { useState, useEffect, useRef } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";
import { Play, RotateCcw, CheckCircle, Layout, Code, Eye } from "lucide-react";
import { motion } from "framer-motion";

interface WebIDEChallengeProps {
    challengeData: {
        initialHtml: string;
        initialCss: string;
        initialJs: string;
        instructions: string;
        validationRules: { type: string; selector?: string; property?: string; value?: string; text?: string }[];
    };
    onComplete: () => void;
}

export default function WebIDEChallenge({ challengeData, onComplete }: WebIDEChallengeProps) {
    const [html, setHtml] = useState(challengeData.initialHtml);
    const [css, setCss] = useState(challengeData.initialCss);
    const [js, setJs] = useState(challengeData.initialJs);
    const [activeTab, setActiveTab] = useState<"html" | "css" | "js">("html");
    const [srcDoc, setSrcDoc] = useState("");
    const [isValidating, setIsValidating] = useState(false);
    const [isPassed, setIsPassed] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    useEffect(() => {
        const timeout = setTimeout(() => {
            setSrcDoc(`
                <html>
                    <style>${css}</style>
                    <body>${html}</body>
                    <script>${js}</script>
                </html>
            `);
        }, 250);
        return () => clearTimeout(timeout);
    }, [html, css, js]);

    const handleRun = () => {
        setIsValidating(true);
        // Simple validation logic for now
        // In a real app, we'd use DOM inspection inside the iframe
        setTimeout(() => {
            setIsPassed(true);
            setIsValidating(false);
        }, 1000);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] bg-zinc-950 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-6 py-3 bg-zinc-900 border-b border-zinc-800">
                <div className="flex items-center gap-4">
                    <div className="flex bg-zinc-800 rounded-lg p-1">
                        <button
                            onClick={() => setActiveTab("html")}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === "html" ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"}`}
                        >
                            HTML
                        </button>
                        <button
                            onClick={() => setActiveTab("css")}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === "css" ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"}`}
                        >
                            CSS
                        </button>
                        <button
                            onClick={() => setActiveTab("js")}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${activeTab === "js" ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"}`}
                        >
                            JS
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => { setHtml(challengeData.initialHtml); setCss(challengeData.initialCss); setJs(challengeData.initialJs); }}
                        className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 transition-colors"
                        title="Reset Challenge"
                    >
                        <RotateCcw size={18} />
                    </button>
                    {!isPassed ? (
                        <button
                            onClick={handleRun}
                            disabled={isValidating}
                            className={`flex items-center gap-2 px-6 py-2 bg-lime-400 hover:bg-lime-500 text-zinc-950 rounded-xl font-black transition-all active:scale-95 ${isValidating ? "opacity-50" : ""}`}
                        >
                            <Play size={18} fill="currentColor" />
                            {isValidating ? "Checking..." : "Run & Check"}
                        </button>
                    ) : (
                        <button
                            onClick={onComplete}
                            className="flex items-center gap-2 px-6 py-2 bg-zinc-100 hover:bg-white text-zinc-950 rounded-xl font-black transition-all active:scale-95"
                        >
                            <CheckCircle size={18} className="text-lime-600" />
                            Claim Reward
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Editor Section */}
                <div className="w-1/2 flex flex-col border-r border-zinc-800">
                    <div className="flex-1 overflow-auto bg-zinc-950 p-4 font-mono text-sm custom-scrollbar">
                        {activeTab === "html" && (
                            <Editor
                                value={html}
                                onValueChange={setHtml}
                                highlight={code => highlight(code, languages.markup, "markup")}
                                padding={10}
                                className="prism-editor text-zinc-300"
                            />
                        )}
                        {activeTab === "css" && (
                            <Editor
                                value={css}
                                onValueChange={setCss}
                                highlight={code => highlight(code, languages.css, "css")}
                                padding={10}
                                className="prism-editor text-zinc-300"
                            />
                        )}
                        {activeTab === "js" && (
                            <Editor
                                value={js}
                                onValueChange={setJs}
                                highlight={code => highlight(code, languages.javascript, "javascript")}
                                padding={10}
                                className="prism-editor text-zinc-300"
                            />
                        )}
                    </div>

                    {/* Instructions Panel */}
                    <div className="h-40 bg-zinc-900 border-t border-zinc-800 p-4 overflow-y-auto">
                        <div className="flex items-center gap-2 mb-2 text-zinc-400">
                            <Code size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Task Instructions</span>
                        </div>
                        <p className="text-zinc-300 text-sm leading-relaxed">{challengeData.instructions}</p>
                    </div>
                </div>

                {/* Preview Section */}
                <div className="w-1/2 flex flex-col bg-white">
                    <div className="flex items-center gap-2 px-4 py-2 bg-zinc-100 border-b border-zinc-200">
                        <Eye size={14} className="text-zinc-400" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Live Preview</span>
                    </div>
                    <iframe
                        ref={iframeRef}
                        srcDoc={srcDoc}
                        title="output"
                        sandbox="allow-scripts"
                        className="flex-1 border-0"
                    />
                </div>
            </div>
        </div>
    );
}
