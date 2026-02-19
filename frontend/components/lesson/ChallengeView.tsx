"use client";

import { useState, useEffect } from "react";
import { Play, RefreshCw, Code, Monitor, Maximize2, Minimize2, RotateCcw, Info, X, ListChecks, Lightbulb, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup"; // HTML is inside markup
import "prismjs/themes/prism.css"; // Default light theme

interface ChallengeViewProps {
    title: string;
    description: string;
    requirements?: string[];
    hints?: string[];
    initialCode: {
        html: string;
        css: string;
        js: string;
    } | string;
    mode?: "web" | "algorithm" | "pseudocode";
}

type TabType = "html" | "css" | "js";
type ViewMode = "code" | "preview"; // Mobile toggle
type FullscreenMode = "none" | "code" | "preview"; // Desktop expansion

export default function ChallengeView({
    title = "Coding Challenge",
    description = "No description available for this challenge.",
    requirements = [],
    hints = [],
    initialCode,
    mode = "web"
}: ChallengeViewProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("code");
    const [fullscreen, setFullscreen] = useState<FullscreenMode>("none");
    const [activeTab, setActiveTab] = useState<TabType>("html");
    const [showInfo, setShowInfo] = useState(false);

    // Unified code state: Web uses object, others use string
    const [webCode, setWebCode] = useState(typeof initialCode === 'object' ? initialCode : { html: '', css: '', js: '' });
    const [textCode, setTextCode] = useState(typeof initialCode === 'string' ? initialCode : '');

    const [srcDoc, setSrcDoc] = useState("");
    const [previewKey, setPreviewKey] = useState(0);

    // Initialize state based on props if they change
    useEffect(() => {
        if (mode === 'web' && typeof initialCode === 'object') {
            setWebCode(initialCode);
        } else if (typeof initialCode === 'string') {
            setTextCode(initialCode);
        }
    }, [initialCode, mode]);

    // Web Mode: Real-time update for preview
    useEffect(() => {
        if (mode !== 'web') return;

        const timeout = setTimeout(() => {
            const htmlLower = webCode.html.trim().toLowerCase();
            const isFullHtml = htmlLower.startsWith("<!doctype") || htmlLower.startsWith("<html");
            let finalHtml = webCode.html;

            if (isFullHtml) {
                // 1. CSS Injection: Handle <link href="style.css">
                const cssContent = `<style>${webCode.css}</style>`;
                const linkRegex = /<link[^>]+href=["']style\.css["'][^>]*>/i;

                if (linkRegex.test(finalHtml)) {
                    finalHtml = finalHtml.replace(linkRegex, () => cssContent);
                } else {
                    // Auto-inject into <head> if explicit link is missing
                    finalHtml = finalHtml.replace("</head>", () => `${cssContent}</head>`);
                }

                // 2. JS Injection: Handle <script src="script.js">
                const jsContent = `<script>${webCode.js}</script>`;
                const scriptRegex = /<script[^>]+src=["']script\.js["'][^>]*>[\s\S]*?<\/script>/i;

                if (scriptRegex.test(finalHtml)) {
                    finalHtml = finalHtml.replace(scriptRegex, () => jsContent);
                } else {
                    // Auto-inject into body end if explicit script is missing
                    if (finalHtml.includes("</body>")) {
                        finalHtml = finalHtml.replace("</body>", () => `${jsContent}</body>`);
                    } else {
                        finalHtml = finalHtml + jsContent;
                    }
                }

                // 3. Navigation Guard
                const navGuardScript = `
                <script>
                    document.addEventListener('click', function(e) {
                        const link = e.target.closest('a');
                        if (link) {
                            const href = link.getAttribute('href');
                            if (href) {
                                if (href.startsWith('#')) {
                                    e.preventDefault();
                                    const targetId = href.substring(1);
                                    const targetElement = document.getElementById(targetId);
                                    if (targetElement) {
                                        targetElement.scrollIntoView({ behavior: 'smooth' });
                                    }
                                } else if (!href.toLowerCase().startsWith('javascript:')) {
                                    e.preventDefault();
                                    window.open(href, '_blank');
                                }
                            }
                        }
                    });
                </script>`;

                finalHtml = finalHtml + navGuardScript;
                setSrcDoc(finalHtml);
            } else {
                // Standard Wrapper
                const documentContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <style>
                        body { margin: 0; background-color: white; font-family: sans-serif; }
                        ${webCode.css}
                    </style>
                </head>
                <body>
                    ${webCode.html}
                    <script>
                        try { ${webCode.js} } catch (err) { console.error(err); }
                    </script>
                </body>
                </html>
            `;
                setSrcDoc(documentContent);
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [webCode, mode]);

    const handleClear = () => {
        if (mode === 'web') {
            setWebCode({ html: "", css: "", js: "" });
        } else {
            setTextCode("");
        }
        setPreviewKey(prev => prev + 1);
    };

    const handleReload = () => {
        setPreviewKey(prev => prev + 1);
    };

    const toggleFullscreen = (mode: FullscreenMode) => {
        setFullscreen(prev => prev === mode ? "none" : mode);
    };

    const isSinglePane = mode === 'pseudocode' || mode === 'algorithm';

    return (
        <div className="flex flex-col md:flex-row h-[calc(100vh-3.5rem)] bg-[#FDFCF8] relative">
            {/* Info Modal */}
            <AnimatePresence>
                {showInfo && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[80vh]"
                        >
                            <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50">
                                <div>
                                    <h3 className="text-xl font-bold text-zinc-900">{title}</h3>
                                    <p className="text-sm text-zinc-500 mt-1">Challenge Details</p>
                                </div>
                                <button onClick={() => setShowInfo(false)} className="p-2 hover:bg-zinc-200 rounded-full transition-colors">
                                    <X size={20} className="text-zinc-500" />
                                </button>
                            </div>
                            <div className="p-6 overflow-y-auto space-y-6">
                                <div>
                                    <p className="text-zinc-700 leading-relaxed">
                                        {description || "No description provided for this challenge."}
                                    </p>
                                </div>

                                {requirements && requirements.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                                            <ListChecks size={16} /> Requirements
                                        </h4>
                                        <ul className="space-y-2">
                                            {requirements.map((req, i) => (
                                                <li key={i} className="flex gap-3 text-sm text-zinc-600 bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                                                    <div className="min-w-[4px] h-4 bg-[#D4F268] rounded-full mt-0.5" />
                                                    {req}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {hints && hints.length > 0 && (
                                    <div className="space-y-3">
                                        <h4 className="text-sm font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-2">
                                            <Lightbulb size={16} /> Hints
                                        </h4>
                                        <div className="grid gap-2">
                                            {hints.map((hint, i) => (
                                                <div key={i} className="text-sm text-zinc-600 bg-yellow-50 p-3 rounded-lg border border-yellow-100 flex gap-3">
                                                    <span className="font-bold text-yellow-600">Tip {i + 1}:</span> {hint}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex justify-end">
                                <button
                                    onClick={() => setShowInfo(false)}
                                    className="bg-zinc-900 text-white px-6 py-2 rounded-full font-bold hover:scale-105 transition-transform"
                                >
                                    Got it, let me code!
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Code Editor Section */}
            <div className={`
                flex flex-col bg-white border-r border-zinc-100 overflow-hidden transition-all duration-300 ease-in-out
                ${fullscreen === 'preview' ? 'hidden' : 'flex'}
                ${fullscreen === 'code' || isSinglePane ? 'w-full' : 'flex-1'}
                ${!isSinglePane && viewMode === 'preview' ? 'hidden md:flex' : 'flex'}
            `}>
                <div className="bg-zinc-50 border-b border-zinc-100 px-4 py-2 flex items-center justify-between shadow-sm z-10 w-full">
                    {/* Tabs or Title */}
                    <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {mode === 'web' ? (
                            <div className="flex bg-zinc-200/50 p-1 rounded-lg">
                                {(["html", "css", "js"] as TabType[]).map((tab) => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        className={`
                                            text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-all
                                            ${activeTab === tab
                                                ? "bg-white text-zinc-900 shadow-sm"
                                                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50"}
                                        `}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-2">
                                <Code size={16} className="text-zinc-400" />
                                <span className="text-sm font-bold text-zinc-600 uppercase tracking-wide">
                                    {mode === 'algorithm' ? 'JavaScript' : 'Pseudocode'}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 md:gap-2">
                        <button
                            onClick={() => setShowInfo(true)}
                            className="text-zinc-500 hover:text-zinc-900 p-2 rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-2 mr-2 bg-white border border-zinc-200 shadow-sm"
                            title="Challenge Details"
                        >
                            <Info size={16} />
                            <span className="hidden lg:inline text-xs font-bold">Details</span>
                        </button>

                        <button
                            onClick={handleClear}
                            className="text-xs text-red-400 hover:text-red-600 font-medium px-2 py-1.5 rounded hover:bg-red-50 flex items-center gap-1.5 transition-colors"
                            title="Clear All Code"
                        >
                            <Trash2 size={14} />
                            <span className="hidden sm:inline">Clear</span>
                        </button>
                        <div className="h-4 w-px bg-zinc-200 mx-1 hidden md:block" />
                        {!isSinglePane && (
                            <button
                                onClick={() => toggleFullscreen('code')}
                                className="text-zinc-400 hover:text-zinc-900 p-1.5 rounded hover:bg-zinc-200 transition-colors hidden md:block"
                                title={fullscreen === 'code' ? "Exit Fullscreen" : "Fullscreen Editor"}
                            >
                                {fullscreen === 'code' ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 relative group">
                    <Editor
                        value={mode === 'web' ? webCode[activeTab] : textCode}
                        onValueChange={(code) => mode === 'web' ? setWebCode(c => ({ ...c, [activeTab]: code })) : setTextCode(code)}
                        highlight={code => {
                            if (mode !== 'web') return code;
                            // Only highlight for web mode
                            const grammar = languages[activeTab === 'js' ? 'javascript' : activeTab];
                            return highlight(code, grammar, activeTab);
                        }}
                        padding={24}
                        className="font-mono text-sm bg-white min-h-full"
                        textareaClassName="focus:outline-none"
                        style={{
                            fontFamily: '"Fira Code", "Fira Mono", monospace',
                            fontSize: 14,
                            backgroundColor: 'white',
                            minHeight: '100%',
                        }}
                    />
                </div>
            </div>

            {/* PREVIEW PANE (Only for Web Mode) */}
            {!isSinglePane && (
                <div className={`
                    bg-white relative flex flex-col h-full transition-all duration-300 ease-in-out
                    ${fullscreen === 'code' ? 'hidden' : 'flex'}
                    ${fullscreen === 'preview' ? 'w-full' : 'flex-1'}
                    ${viewMode === 'code' ? 'hidden md:flex' : 'flex'}
                `}>
                    <div className="bg-white border-b border-zinc-100 px-4 py-2.5 flex items-center justify-between shadow-sm z-10">
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                            <Monitor size={14} /> Live Preview
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPreviewKey(p => p + 1)}
                                className="p-1.5 hover:bg-zinc-100 rounded text-zinc-400 hover:text-zinc-600 transition-colors"
                                title="Refresh Preview"
                            >
                                <RefreshCw size={14} />
                            </button>
                            <div className="h-4 w-px bg-zinc-200 mx-1 hidden md:block" />
                            <button
                                onClick={() => toggleFullscreen('preview')}
                                className="text-zinc-400 hover:text-zinc-900 p-1.5 rounded hover:bg-zinc-200 transition-colors hidden md:block"
                                title={fullscreen === 'preview' ? "Exit Fullscreen" : "Fullscreen Preview"}
                            >
                                {fullscreen === 'preview' ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 relative w-full h-full bg-white">
                        <iframe
                            key={previewKey}
                            srcDoc={srcDoc}
                            title="preview"
                            className="w-full h-full border-none"
                            sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
                        />
                    </div>
                </div>
            )}

            {/* Mobile Toggle Button */}
            {!isSinglePane && (
                <div className={`md:hidden absolute bottom-6 right-6 z-40`}>
                    <button
                        onClick={() => setViewMode(m => m === 'code' ? 'preview' : 'code')}
                        className="h-14 w-14 rounded-full bg-zinc-900 text-[#D4F268] shadow-xl shadow-zinc-900/30 flex items-center justify-center transition-transform active:scale-95 border-2 border-[#D4F268]"
                    >
                        {viewMode === 'code' ? <Play size={24} className="ml-1 fill-current" /> : <Code size={24} />}
                    </button>
                </div>
            )}

            {/* Mobile Info Button */}
            <div className={`md:hidden absolute bottom-24 right-6 z-40`}>
                <button
                    onClick={() => setShowInfo(true)}
                    className="h-10 w-10 rounded-full bg-white text-zinc-900 shadow-lg flex items-center justify-center border border-zinc-200"
                >
                    <Info size={20} />
                </button>
            </div>
        </div>
    );
}
