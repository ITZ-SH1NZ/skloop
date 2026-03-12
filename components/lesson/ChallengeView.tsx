"use client";

import { useState, useEffect } from "react";
import { Play, RefreshCw, Code, Monitor, Maximize2, Minimize2, RotateCcw, Info, X, ListChecks, Lightbulb, Trash2, CheckCircle } from "lucide-react";
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
    validationRules?: {
        text: string;
        type: "text-match" | "regex";
    }[];
    onComplete?: () => void;
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
    mode = "web",
    validationRules = [],
    onComplete
}: ChallengeViewProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("code");
    const [fullscreen, setFullscreen] = useState<FullscreenMode>("none");
    const [activeTab, setActiveTab] = useState<TabType>("html");
    const [showInfo, setShowInfo] = useState(false);
    const [validationStatus, setValidationStatus] = useState<"idle" | "success" | "error" | "saving" | "saved">("idle");
    const [errorMessage, setErrorMessage] = useState("");
    const [logs, setLogs] = useState<{ type: string; message: string }[]>([]);
    const [showLogs, setShowLogs] = useState(false);

    // Unified code state: Web uses object, others use string
    const [webCode, setWebCode] = useState(typeof initialCode === 'object' ? initialCode : { html: '', css: '', js: '' });
    const [textCode, setTextCode] = useState(typeof initialCode === 'string' ? initialCode : '');

    const [srcDoc, setSrcDoc] = useState("");
    const [previewKey, setPreviewKey] = useState(0);

    // Initialize state based on props if they change
    useEffect(() => {
        // Try to load from localStorage first
        const storageKey = `skloop_challenge_${title.replace(/\s+/g, '_').toLowerCase()}`;
        const savedData = localStorage.getItem(storageKey);

        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                if (mode === 'web') {
                    setWebCode(parsed);
                } else {
                    setTextCode(parsed);
                }
                setValidationStatus("saved");
                setTimeout(() => setValidationStatus("idle"), 2000);
            } catch (e) {
                console.error("Failed to load saved progress", e);
            }
        } else {
            if (mode === 'web' && typeof initialCode === 'object') {
                setWebCode(initialCode);
            } else if (typeof initialCode === 'string') {
                setTextCode(initialCode);
            }
        }
    }, [initialCode, mode, title]);

    // Autosave logic
    useEffect(() => {
        const storageKey = `skloop_challenge_${title.replace(/\s+/g, '_').toLowerCase()}`;
        const codeToSave = mode === 'web' ? webCode : textCode;

        const timeout = setTimeout(() => {
            localStorage.setItem(storageKey, JSON.stringify(codeToSave));
            setValidationStatus("saved");
            setTimeout(() => setValidationStatus("idle"), 2000);
        }, 1000);

        setValidationStatus("saving");
        return () => clearTimeout(timeout);
    }, [webCode, textCode, mode, title]);

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

                // 3. Navigation Guard & Console Capture
                const utilsScript = `
                <script>
                    // Console Capture
                    const oldLog = console.log;
                    const oldError = console.error;
                    const oldWarn = console.warn;

                    window.parent.postMessage({ type: 'console-clear' }, '*');

                    console.log = function(...args) {
                        oldLog.apply(console, args);
                        window.parent.postMessage({ type: 'console-log', message: args.map(a => String(a)).join(' ') }, '*');
                    };
                    console.error = function(...args) {
                        oldError.apply(console, args);
                        window.parent.postMessage({ type: 'console-error', message: args.map(a => String(a)).join(' ') }, '*');
                    };
                    console.warn = function(...args) {
                        oldWarn.apply(console, args);
                        window.parent.postMessage({ type: 'console-warn', message: args.map(a => String(a)).join(' ') }, '*');
                    };

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

                finalHtml = finalHtml + utilsScript;
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
                        // Console Capture
                        const oldLog = console.log;
                        window.parent.postMessage({ type: 'console-clear' }, '*');
                        console.log = function(...args) {
                            oldLog.apply(console, args);
                            window.parent.postMessage({ type: 'console-log', message: args.map(a => String(a)).join(' ') }, '*');
                        };

                        try { ${webCode.js} } catch (err) { 
                            console.error(err); 
                            window.parent.postMessage({ type: 'console-error', message: err.message }, '*');
                        }
                    </script>
                </body>
                </html>
            `;
                setSrcDoc(documentContent);
            }
        }, 500);

        return () => clearTimeout(timeout);
    }, [webCode, mode]);

    // Listen for console messages from iframe
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'console-log') {
                setLogs(prev => [...prev.slice(-49), { type: 'info', message: event.data.message }]);
            } else if (event.data.type === 'console-error') {
                setLogs(prev => [...prev.slice(-49), { type: 'error', message: event.data.message }]);
            } else if (event.data.type === 'console-warn') {
                setLogs(prev => [...prev.slice(-49), { type: 'warn', message: event.data.message }]);
            } else if (event.data.type === 'console-clear') {
                setLogs([]);
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const handleClear = () => {
        if (!confirm("Are you sure you want to clear all your code?")) return;
        if (mode === 'web') {
            setWebCode({ html: "", css: "", js: "" });
        } else {
            setTextCode("");
        }
        setPreviewKey(prev => prev + 1);
        const storageKey = `skloop_challenge_${title.replace(/\s+/g, '_').toLowerCase()}`;
        localStorage.removeItem(storageKey);
    };

    const handleReload = () => {
        setPreviewKey(prev => prev + 1);
    };

    const toggleFullscreen = (mode: FullscreenMode) => {
        setFullscreen(prev => prev === mode ? "none" : mode);
    };

    const handleVerify = () => {
        if (!validationRules || validationRules.length === 0) {
            setValidationStatus("success");
            if (onComplete) onComplete();
            return;
        }

        const combinedCode = mode === 'web'
            ? `${webCode.html} ${webCode.css} ${webCode.js}`
            : textCode;

        const normalize = (str: string) => str.replace(/\s+/g, ' ').trim();
        const normalizedCode = normalize(combinedCode);

        console.log("--- Challenge Verification ---");
        console.log("Normalized Combined Code:", normalizedCode);
        console.log("Validation Rules:", validationRules);

        const failedRules = validationRules.filter((rule, index) => {
            const isMatch = rule.type === 'text-match'
                ? normalizedCode.includes(normalize(rule.text))
                : new RegExp(rule.text, 'i').test(combinedCode);

            console.log(`Rule ${index + 1} (${rule.type}): "${rule.text}" -> ${isMatch ? "✅ PASS" : "❌ FAIL"}`);
            return !isMatch;
        });

        if (failedRules.length === 0) {
            console.log("Result: ALL RULES PASSED");
            setValidationStatus("success");
            const timer = setTimeout(() => {
                if (onComplete) onComplete();
            }, 1500);
            return () => clearTimeout(timer);
        } else {
            setValidationStatus("error");
            setErrorMessage("Some requirements are not met. Check your code!");
            setTimeout(() => setValidationStatus("idle"), 3000);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<any>) => {
        const pairs: Record<string, string> = {
            '(': ')',
            '[': ']',
            '{': '}',
            '"': '"',
            "'": "'",
            '`': '`'
        };

        if (pairs[e.key]) {
            e.preventDefault();
            const textarea = e.target as HTMLTextAreaElement;
            const { selectionStart, selectionEnd, value } = textarea;
            const openChar = e.key;
            const closeChar = pairs[e.key];

            const newValue = value.substring(0, selectionStart) + openChar + closeChar + value.substring(selectionEnd);

            if (mode === 'web') {
                setWebCode(prev => ({ ...prev, [activeTab]: newValue }));
            } else {
                setTextCode(newValue);
            }

            // Set cursor position back after state update
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
            }, 0);
        }

        // HTML Tag Auto-closing
        if (e.key === '>' && mode === 'web' && activeTab === 'html') {
            const textarea = e.target as HTMLTextAreaElement;
            const { selectionStart, value } = textarea;
            const textBefore = value.substring(0, selectionStart);

            // Match the most recent opening tag that isn't closed or self-closing
            // Basic regex to find the tag name: <([a-zA-Z0-9]+)(\s[^>]*)?$
            const tagMatch = textBefore.match(/<([a-zA-Z0-9]+)(?:\s[^>]*|)$/);

            if (tagMatch) {
                const tagName = tagMatch[1];
                const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

                if (!selfClosingTags.includes(tagName.toLowerCase())) {
                    e.preventDefault();
                    const closingTag = `></${tagName}>`;
                    const newValue = value.substring(0, selectionStart) + closingTag + value.substring(selectionStart);

                    setWebCode(prev => ({ ...prev, html: newValue }));

                    setTimeout(() => {
                        textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
                    }, 0);
                }
            }
        }

        // Tab key support
        if (e.key === 'Tab') {
            e.preventDefault();
            const textarea = e.target as HTMLTextAreaElement;
            const { selectionStart, selectionEnd, value } = textarea;
            const newValue = value.substring(0, selectionStart) + "    " + value.substring(selectionEnd);

            if (mode === 'web') {
                setWebCode(prev => ({ ...prev, [activeTab]: newValue }));
            } else {
                setTextCode(newValue);
            }

            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = selectionStart + 4;
            }, 0);
        }

        // Smart Enter support
        if (e.key === 'Enter') {
            const textarea = e.target as HTMLTextAreaElement;
            const { selectionStart, selectionEnd, value } = textarea;
            const before = value[selectionStart - 1];
            const after = value[selectionStart];

            const isBracketPair = (before === '{' && after === '}') ||
                (before === '[' && after === ']') ||
                (before === '(' && after === ')') ||
                (before === '>' && after === '<');

            if (isBracketPair) {
                e.preventDefault();
                const newValue = value.substring(0, selectionStart) + "\n    \n" + value.substring(selectionEnd);

                if (mode === 'web') {
                    setWebCode(prev => ({ ...prev, [activeTab]: newValue }));
                } else {
                    setTextCode(newValue);
                }

                setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = selectionStart + 5; // \n + 4 spaces
                }, 0);
            }
        }
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
                        onKeyDown={handleKeyDown}
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

                    {/* Console Overlay (Desktop) */}
                    {showLogs && (
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="absolute bottom-0 left-0 right-0 h-48 bg-zinc-900 border-t border-zinc-700 z-30 font-mono text-xs overflow-hidden flex flex-col"
                        >
                            <div className="bg-zinc-800 px-4 py-1.5 flex justify-between items-center border-b border-zinc-700">
                                <span className="text-zinc-400 font-bold uppercase tracking-wider">Console Logs</span>
                                <div className="flex gap-2">
                                    <button onClick={() => setLogs([])} className="text-zinc-500 hover:text-zinc-300 transition-colors">Clear</button>
                                    <button onClick={() => setShowLogs(false)} className="text-zinc-500 hover:text-zinc-300 transition-colors">Close</button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                                {logs.length === 0 ? (
                                    <div className="text-zinc-600 italic">No logs yet...</div>
                                ) : (
                                    logs.map((log, i) => (
                                        <div key={i} className={`flex gap-2 ${log.type === 'error' ? 'text-red-400' : log.type === 'warn' ? 'text-yellow-400' : 'text-zinc-300'}`}>
                                            <span className="opacity-40">{i + 1}</span>
                                            <span className="break-all">{log.message}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Submit Action Bar */}
                <div className="bg-zinc-50 border-t border-zinc-100 p-4 flex items-center justify-between">
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            {validationStatus === "error" && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="text-red-500 text-xs font-bold"
                                >
                                    {errorMessage}
                                </motion.div>
                            )}
                            {validationStatus === "success" && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-emerald-500 text-xs font-bold flex items-center gap-1"
                                >
                                    <CheckCircle size={14} /> Challenge Completed!
                                </motion.div>
                            )}
                            {validationStatus === "saving" && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-zinc-400 text-xs flex items-center gap-2"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-pulse" />
                                    Saving...
                                </motion.div>
                            )}
                            {validationStatus === "saved" && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="text-zinc-400 text-xs flex items-center gap-2"
                                >
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                    Changes Saved
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowLogs(!showLogs)}
                            className={`px-4 py-2 text-xs font-bold rounded-full transition-all border ${showLogs ? 'bg-zinc-200 border-zinc-300' : 'bg-white border-zinc-200 hover:bg-zinc-50'}`}
                        >
                            Logs {logs.length > 0 && `(${logs.length})`}
                        </button>
                        <button
                            onClick={handleVerify}
                            disabled={validationStatus === "success"}
                            className={`
                                px-8 py-2.5 rounded-full font-bold transition-all flex items-center gap-2
                                ${validationStatus === "success"
                                    ? "bg-emerald-500 text-white cursor-default"
                                    : "bg-zinc-900 text-white hover:scale-105 active:scale-95 shadow-lg shadow-zinc-900/10"}
                            `}
                        >
                            {validationStatus === "success" ? (
                                <>Perfect!</>
                            ) : (
                                <>
                                    <Play size={16} className="fill-current" />
                                    Run & Submit
                                </>
                            )}
                        </button>
                    </div>
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
