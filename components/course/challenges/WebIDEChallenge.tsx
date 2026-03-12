"use client";

import { useState, useEffect, useRef } from "react";
import Editor from "react-simple-code-editor";
import { highlight, languages } from "prismjs";
import "prismjs/components/prism-markup";
import "prismjs/components/prism-css";
import "prismjs/components/prism-javascript";
import "prismjs/themes/prism-tomorrow.css";
import { Play, RotateCcw, CheckCircle, Layout, Code, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
    const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
    // Mobile-only: toggle between "code" and "preview" panels
    const [mobilePanel, setMobilePanel] = useState<"code" | "preview">("code");
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Initial load from localStorage
    useEffect(() => {
        const storageKey = `skloop_web_challenge_${challengeData.instructions.slice(0, 20).replace(/\s+/g, '_').toLowerCase()}`;
        const savedData = localStorage.getItem(storageKey);
        if (savedData) {
            try {
                const { html: h, css: c, js: j } = JSON.parse(savedData);
                setHtml(h);
                setCss(c);
                setJs(j);
            } catch (e) {
                console.error("Failed to load saved progress", e);
            }
        }
    }, [challengeData]);

    // Autosave logic
    useEffect(() => {
        const storageKey = `skloop_web_challenge_${challengeData.instructions.slice(0, 20).replace(/\s+/g, '_').toLowerCase()}`;
        const timeout = setTimeout(() => {
            localStorage.setItem(storageKey, JSON.stringify({ html, css, js }));
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 2000);
        }, 1000);

        setSaveStatus("saving");
        return () => clearTimeout(timeout);
    }, [html, css, js, challengeData]);

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

            if (activeTab === "html") setHtml(newValue);
            else if (activeTab === "css") setCss(newValue);
            else if (activeTab === "js") setJs(newValue);

            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = selectionStart + 1;
            }, 0);
        }

        // HTML Tag Auto-closing
        if (e.key === '>' && activeTab === 'html') {
            const textarea = e.target as HTMLTextAreaElement;
            const { selectionStart, value } = textarea;
            const textBefore = value.substring(0, selectionStart);

            // Match the most recent opening tag that isn't closed or self-closing
            const tagMatch = textBefore.match(/<([a-zA-Z0-9]+)(?:\s[^>]*|)$/);

            if (tagMatch) {
                const tagName = tagMatch[1];
                const selfClosingTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

                if (!selfClosingTags.includes(tagName.toLowerCase())) {
                    e.preventDefault();
                    const closingTag = `></${tagName}>`;
                    const newValue = value.substring(0, selectionStart) + closingTag + value.substring(selectionStart);

                    setHtml(newValue);

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

            if (activeTab === "html") setHtml(newValue);
            else if (activeTab === "css") setCss(newValue);
            else if (activeTab === "js") setJs(newValue);

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

                if (activeTab === "html") setHtml(newValue);
                else if (activeTab === "css") setCss(newValue);
                else if (activeTab === "js") setJs(newValue);

                setTimeout(() => {
                    textarea.selectionStart = textarea.selectionEnd = selectionStart + 5; // \n + 4 spaces
                }, 0);
            }
        }
    };

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
                    <div className="flex items-center gap-2 mr-4">
                        <AnimatePresence mode="wait">
                            {saveStatus === "saving" && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600 animate-pulse" /> Saving
                                </motion.div>
                            )}
                            {saveStatus === "saved" && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[10px] text-lime-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-lime-500" /> Saved
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <button
                        onClick={() => {
                            if (confirm("Reset all code to initial state?")) {
                                setHtml(challengeData.initialHtml);
                                setCss(challengeData.initialCss);
                                setJs(challengeData.initialJs);
                            }
                        }}
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

            {/* Mobile: only show the active panel */}
            <div className="flex-1 flex overflow-hidden">
                {/* Editor Section - hidden on mobile when preview is active */}
                <div className={`flex flex-col border-r border-zinc-800 ${mobilePanel === "preview" ? "hidden md:flex" : "flex"} w-full md:w-1/2`}>
                    <div className="flex-1 overflow-auto bg-zinc-950 p-4 font-mono text-sm custom-scrollbar">
                        {activeTab === "html" && (
                            <Editor
                                value={html}
                                onValueChange={setHtml}
                                onKeyDown={handleKeyDown}
                                highlight={code => highlight(code, languages.markup, "markup")}
                                padding={10}
                                className="prism-editor text-zinc-300"
                            />
                        )}
                        {activeTab === "css" && (
                            <Editor
                                value={css}
                                onValueChange={setCss}
                                onKeyDown={handleKeyDown}
                                highlight={code => highlight(code, languages.css, "css")}
                                padding={10}
                                className="prism-editor text-zinc-300"
                            />
                        )}
                        {activeTab === "js" && (
                            <Editor
                                value={js}
                                onValueChange={setJs}
                                onKeyDown={handleKeyDown}
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

                {/* Preview Section - hidden on mobile when code is active */}
                <div className={`flex flex-col bg-white ${mobilePanel === "code" ? "hidden md:flex" : "flex"} w-full md:w-1/2`}>
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

            {/* Mobile Toggle Bar — only visible on small screens */}
            <div className="md:hidden flex border-t border-zinc-700 bg-zinc-900">
                <button
                    onClick={() => setMobilePanel("code")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${mobilePanel === "code" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
                >
                    <Code size={15} /> Code
                </button>
                <button
                    onClick={() => setMobilePanel("preview")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${mobilePanel === "preview" ? "bg-zinc-700 text-white" : "text-zinc-400 hover:text-zinc-200"}`}
                >
                    <Eye size={15} /> Preview
                </button>
            </div>
        </div>
    );
}

