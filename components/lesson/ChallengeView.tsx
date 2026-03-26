"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Play, RefreshCw, Code, Monitor, Maximize2, Minimize2, RotateCcw, Info, X, ListChecks, Lightbulb, Trash2, CheckCircle, Smartphone, Tablet, Laptop, Settings, Wand2, FileText, ChevronLeft, ChevronRight, Save, Layout, FolderPlus, FilePlus, MoreVertical, Edit2, Trash, Folder, FolderOpen, Check, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import MonacoEditor, { loader } from "@monaco-editor/react";
import { createClient } from "@/utils/supabase/client";
import { logValidationProgress } from "@/actions/validation-actions";
import { cn } from "@/lib/utils";

// Register Emmet for Monaco
import { emmetHTML, emmetCSS } from "emmet-monaco-es";

// Configure Monaco to load from CDN for better performance in dev
loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs' } });

// Custom Skloop Theme Configuration
const skloopTheme = {
    base: 'vs' as const,
    inherit: true,
    rules: [
        { token: 'comment', foreground: 'A1A1AA', fontStyle: 'italic' },
        { token: 'keyword', foreground: '000000', fontStyle: 'bold' },
        { token: 'string', foreground: '16A34A' },
        { token: 'number', foreground: 'D97706' },
        { token: 'delimiter', foreground: '71717A' },
        { token: 'tag', foreground: '000000', fontStyle: 'bold' },
        { token: 'attribute.name', foreground: '4F46E5' },
        { token: 'attribute.value', foreground: '16A34A' },
    ],
    colors: {
        'editor.background': '#FDFCF8',
        'editor.foreground': '#1A1A1A',
        'editorCursor.foreground': '#1A1A1A',
        'editor.lineHighlightBackground': '#F3F4F6',
        'editorLineNumber.foreground': '#D1D5DB',
        'editorLineNumber.activeForeground': '#1A1A1A',
        'editor.selectionBackground': '#D4F268', // Punchy Lime Selection
        'editorBracketMatch.background': '#D4F268',
        'editorBracketMatch.border': '#D4F268',
    }
};

interface ValidationRule {
    text: string;
    type: "text-match" | "regex" | "dom-selector" | "css-prop";
    selector?: string;
    property?: string;
    value?: string;
    status?: "idle" | "success" | "error";
}

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
    validationRules?: ValidationRule[];
    onComplete?: () => void;
    hearts?: number;
    onHeartLost?: () => void;
}

interface FileNode {
    id: string;
    name: string;
    type: "file" | "folder";
    content?: string;
    language?: string;
    parentId: string | null;
    isExpanded?: boolean;
}

type TabType = string; // File ID
type ViewMode = "code" | "preview"; // Mobile toggle
type FullscreenMode = "none" | "code" | "preview"; // Desktop expansion
type DeviceType = "mobile" | "tablet" | "desktop";

export default function ChallengeView({
    title = "Coding Challenge",
    description = "No description available for this challenge.",
    requirements = [],
    hints = [],
    initialCode,
    mode = "web",
    validationRules = [],
    onComplete,
    hearts,
    onHeartLost
}: ChallengeViewProps) {
    const [viewMode, setViewMode] = useState<ViewMode>("code");
    const [fullscreen, setFullscreen] = useState<FullscreenMode>("none");
    const [showInfo, setShowInfo] = useState(false);
    const [validationStatus, setValidationStatus] = useState<"idle" | "success" | "error" | "saving" | "saved">("idle");
    const [ruleStatuses, setRuleStatuses] = useState<Record<number, "idle" | "success" | "error">>({});
    const [errorMessage, setErrorMessage] = useState("");
    const [logs, setLogs] = useState<{ type: string; message: string }[]>([]);
    const [showLogs, setShowLogs] = useState(false);
    const [cursorPos, setCursorPos] = useState(0);
    const [showSidebar, setShowSidebar] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [lastValidatedCode, setLastValidatedCode] = useState("");

    // Initial project setup
    const getInitialProject = (): FileNode[] => {
        if (typeof initialCode === 'object') {
            return [
                { id: 'index.html', name: 'index.html', type: 'file', content: initialCode.html, language: 'html', parentId: null },
                { id: 'style.css', name: 'style.css', type: 'file', content: initialCode.css, language: 'css', parentId: null },
                { id: 'script.js', name: 'script.js', type: 'file', content: initialCode.js, language: 'javascript', parentId: null },
            ];
        }
        return [];
    };

    const [files, setFiles] = useState<FileNode[]>(getInitialProject());
    const [activeTab, setActiveTab] = useState<TabType>("index.html");
    const [textCode, setTextCode] = useState(typeof initialCode === 'string' ? initialCode : '');

    const [srcDoc, setSrcDoc] = useState("");
    const [previewKey, setPreviewKey] = useState(0);
    const [previewDevice, setPreviewDevice] = useState<DeviceType>("desktop");
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // File Management State
    const [isCreating, setIsCreating] = useState<{ type: 'file' | 'folder', parentId: string | null } | null>(null);
    const [newItemName, setNewItemName] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    // Explorer context: selected folder for new items
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    // Drag and drop
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [dragOverId, setDragOverId] = useState<string | 'root' | null>(null);
    // Resizable split
    const [dividerPosition, setDividerPosition] = useState(50);
    const [isResizing, setIsResizing] = useState(false);
    // Autosave indicator
    const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");

    const addFile = (type: 'file' | 'folder', parentId: string | null = null, name?: string) => {
        const id = Math.random().toString(36).substr(2, 9);
        const fileName = name || (type === 'file' ? 'new_file.html' : 'new_folder');
        const extension = fileName.split('.').pop();
        const language = extension === 'js' ? 'javascript' : extension === 'css' ? 'css' : 'html';

        const newNode: FileNode = {
            id,
            name: fileName,
            type,
            parentId,
            content: type === 'file' ? '' : undefined,
            language: type === 'file' ? language : undefined,
            isExpanded: true
        };

        setFiles(prev => [...prev, newNode]);
        if (type === 'file') setActiveTab(id);
        setIsCreating(null);
        setNewItemName("");
    };

    const deleteFile = (id: string) => {
        if (!confirm("Are you sure you want to delete this?")) return;
        setFiles(prev => {
            const idsToDelete = new Set([id]);
            // Recursive delete for folder children
            const findChildren = (pid: string) => {
                prev.filter(f => f.parentId === pid).forEach(c => {
                    idsToDelete.add(c.id);
                    findChildren(c.id);
                });
            };
            findChildren(id);
            return prev.filter(f => !idsToDelete.has(f.id));
        });
        if (activeTab === id) setActiveTab("index.html");
    };

    const getFullPath = (node: FileNode, allFiles: FileNode[]): string => {
        let path = node.name;
        let current = node;
        while (current.parentId) {
            const parent = allFiles.find(f => f.id === current.parentId);
            if (!parent) break;
            path = `${parent.name}/${path}`;
            current = parent;
        }
        return path;
    };

    const getDir = (path: string): string => {
        const parts = path.split('/');
        parts.pop();
        return parts.join('/');
    };

    const resolveRelativePath = (baseDir: string, relativePath: string): string => {
        if (relativePath.startsWith('/')) return relativePath.slice(1);
        const parts = baseDir ? baseDir.split('/') : [];
        const relParts = relativePath.split('/');
        for (const part of relParts) {
            if (part === '..') parts.pop();
            else if (part !== '.' && part !== '') parts.push(part);
        }
        return parts.join('/');
    };

    const renameFile = (id: string, newName: string) => {
        setFiles(prev => prev.map(f => {
            if (f.id === id) {
                const extension = newName.split('.').pop();
                const language = extension === 'js' ? 'javascript' : extension === 'css' ? 'css' : 'html';
                return { ...f, name: newName, language: f.type === 'file' ? language : f.language };
            }
            return f;
        }));
        setEditingId(null);
        setNewItemName("");
    };

    const toggleFolder = (id: string) => {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, isExpanded: !f.isExpanded } : f));
    };

    const moveFile = (sourceId: string, targetFolderId: string | null) => {
        if (targetFolderId) {
            let cur: string | null = targetFolderId;
            while (cur) {
                if (cur === sourceId) return;
                cur = files.find(f => f.id === cur)?.parentId ?? null;
            }
        }
        setFiles(prev => prev.map(f => f.id === sourceId ? { ...f, parentId: targetFolderId } : f));
        if (targetFolderId) {
            setFiles(prev => prev.map(f => f.id === targetFolderId ? { ...f, isExpanded: true } : f));
        }
    };

    // Resize handlers
    const startResizing = useCallback(() => setIsResizing(true), []);
    const stopResizing = useCallback(() => setIsResizing(false), []);
    const resize = useCallback((e: any) => {
        if (!isResizing) return;
        const newPosition = (e.clientX / window.innerWidth) * 100;
        if (newPosition > 20 && newPosition < 80) setDividerPosition(newPosition);
    }, [isResizing]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener('mousemove', resize);
            window.addEventListener('mouseup', stopResizing);
        } else {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        }
        return () => {
            window.removeEventListener('mousemove', resize);
            window.removeEventListener('mouseup', stopResizing);
        };
    }, [isResizing, resize, stopResizing]);

    // Initialize state based on props if they change
    useEffect(() => {
        const loadSavedCode = async () => {
            const storageKey = `skloop_challenge_${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
            const savedData = localStorage.getItem(storageKey);

            if (savedData) {
                try {
                    const parsed = JSON.parse(savedData);
                    if (mode === 'web') {
                        if (!Array.isArray(parsed) && parsed.html !== undefined) {
                            setFiles([
                                { id: 'index.html', name: 'index.html', type: 'file', content: parsed.html, language: 'html', parentId: null },
                                { id: 'style.css', name: 'style.css', type: 'file', content: parsed.css, language: 'css', parentId: null },
                                { id: 'script.js', name: 'script.js', type: 'file', content: parsed.js, language: 'javascript', parentId: null },
                            ]);
                        } else {
                            setFiles(parsed);
                        }
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
                    setFiles(getInitialProject());
                } else if (typeof initialCode === 'string') {
                    setTextCode(initialCode);
                }
            }
        };
        loadSavedCode();
    }, [initialCode, mode, title]);

    // Local Auto-Sync Logic (Debounced)
    useEffect(() => {
        setAutoSaveStatus("saving");
        const syncTimeout = setTimeout(() => {
            const storageKey = `skloop_challenge_${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
            const codeToSave = mode === 'web' ? files : textCode;
            localStorage.setItem(storageKey, JSON.stringify(codeToSave));
            setAutoSaveStatus("saved");
            setTimeout(() => setAutoSaveStatus("idle"), 1500);
        }, 1000);

        return () => clearTimeout(syncTimeout);
    }, [files, textCode, mode, title]);

    // Load code from Supabase on mount
    useEffect(() => {
        const loadFromCloud = async () => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                const challengeId = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                const { data, error } = await supabase
                    .from('user_challenge_files')
                    .select('files_content')
                    .eq('user_id', user.id)
                    .eq('challenge_id', challengeId)
                    .maybeSingle();

                if (data && data.files_content) {
                    if (mode === 'web') {
                        const parsed = data.files_content;
                        if (!Array.isArray(parsed) && (parsed as any).html !== undefined) {
                            setFiles([
                                { id: 'index.html', name: 'index.html', type: 'file', content: (parsed as any).html, language: 'html', parentId: null },
                                { id: 'style.css', name: 'style.css', type: 'file', content: (parsed as any).css, language: 'css', parentId: null },
                                { id: 'script.js', name: 'script.js', type: 'file', content: (parsed as any).js, language: 'javascript', parentId: null },
                            ]);
                        } else {
                            setFiles(parsed as FileNode[]);
                        }
                    } else {
                        setTextCode(data.files_content as string);
                    }
                }
            }
        };
        loadFromCloud();
    }, [title, mode]);

    const handleSave = async () => {
        setValidationStatus("saving");
        setIsSaving(true);
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();

        const codeToSave = mode === 'web' ? files : textCode;
        const challengeId = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();

        if (user) {
            const { error } = await supabase
                .from('user_challenge_files')
                .upsert({
                    user_id: user.id,
                    challenge_id: challengeId,
                    files_content: codeToSave,
                    updated_at: new Date().toISOString()
                }, { onConflict: 'user_id,challenge_id' });

            if (error) {
                console.error("Cloud Save Error:", error);
                alert("Cloud save failed: " + error.message);
            } else {
                setValidationStatus("saved");
                setTimeout(() => setValidationStatus("idle"), 2000);
            }
        } else {
            const storageKey = `skloop_challenge_${title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
            localStorage.setItem(storageKey, JSON.stringify(codeToSave));
            setValidationStatus("saved");
            setTimeout(() => setValidationStatus("idle"), 2000);
        }
        setIsSaving(false);
    };

    // Web Mode: Real-time update for preview
    useEffect(() => {
        if (mode !== 'web') return;

        const timeout = setTimeout(() => {
            // Find the best entry point
            let indexFile = files.find(f => f.name === 'index.html' && !f.parentId); // Root index first
            if (!indexFile) indexFile = files.find(f => f.name === 'index.html'); // Any index
            if (!indexFile) {
                const activeFile = files.find(f => f.id === activeTab);
                if (activeFile?.name.endsWith('.html')) indexFile = activeFile;
            }
            if (!indexFile) indexFile = files.find(f => f.name.endsWith('.html'));

            if (!indexFile) return;

            let html = indexFile.content || "";
            const htmlLower = html.trim().toLowerCase();
            const isFullHtml = htmlLower.startsWith("<!doctype") || htmlLower.startsWith("<html");

            // Build maps for path-based and fuzzy lookups
            const pathMap: Record<string, string> = {};
            const fuzzyMap: Record<string, string> = {};
            files.forEach(f => {
                if (f.type === 'file') {
                    const fullPath = getFullPath(f, files);
                    pathMap[fullPath] = f.content || "";
                    fuzzyMap[f.name] = f.content || "";
                }
            });

            const entryPath = getFullPath(indexFile, files);
            const entryDir = getDir(entryPath);

            const consoleScript = `
            <script>
                const oldLog = console.log;
                const oldError = console.error;
                const oldWarn = console.warn;
                window.parent.postMessage({ type: 'console-clear' }, '*');
                console.log = (...args) => {
                    oldLog.apply(console, args);
                    window.parent.postMessage({ type: 'console-log', message: args.map(a => String(a)).join(' ') }, '*');
                };
                console.error = (...args) => {
                    oldError.apply(console, args);
                    window.parent.postMessage({ type: 'console-error', message: args.map(a => String(a)).join(' ') }, '*');
                };
                console.warn = (...args) => {
                    oldWarn.apply(console, args);
                    window.parent.postMessage({ type: 'console-warn', message: args.map(a => String(a)).join(' ') }, '*');
                };
            </script>`;

            const resolveInjection = (content: string) => {
                let resolved = content;

                // Resolve CSS links
                const styleTags = (content.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/gi) || []) as string[];
                styleTags.forEach(tag => {
                    const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
                    if (hrefMatch) {
                        const rawHref = hrefMatch[1];
                        const normalizedHref = rawHref.startsWith('/') ? rawHref.slice(1) : resolveRelativePath(entryDir, rawHref);

                        let cssContent = pathMap[normalizedHref] || pathMap[rawHref.replace(/^\.\//, '')];
                        if (!cssContent) {
                            // Fallback fuzzy match
                            const fileName = rawHref.split('/').pop() || "";
                            if (fuzzyMap[fileName]) cssContent = fuzzyMap[fileName];
                        }

                        if (cssContent) {
                            resolved = resolved.split(tag).join(`<style data-resolved-from="${rawHref}">${cssContent}</style>`);
                        }
                    }
                });

                // Resolve JS scripts
                const scriptTags = (content.match(/<script[^>]+src=["']([^"']+)["'][^>]*>[\s\S]*?<\/script>/gi) || []) as string[];
                scriptTags.forEach(tag => {
                    const srcMatch = tag.match(/src=["']([^"']+)["']/i);
                    if (srcMatch) {
                        const rawSrc = srcMatch[1];
                        const normalizedSrc = rawSrc.startsWith('/') ? rawSrc.slice(1) : resolveRelativePath(entryDir, rawSrc);

                        let jsContent = pathMap[normalizedSrc] || pathMap[rawSrc.replace(/^\.\//, '')];
                        if (!jsContent) {
                            const fileName = rawSrc.split('/').pop() || "";
                            if (fuzzyMap[fileName]) jsContent = fuzzyMap[fileName];
                        }

                        if (jsContent) {
                            resolved = resolved.split(tag).join(`<script data-resolved-from="${rawSrc}">${jsContent}</script>`);
                        }
                    }
                });

                return resolved;
            };

            let finalHtml = resolveInjection(html);

            // Fallback magic if not linked
            if (!finalHtml.includes('<style')) {
                const rootCss = files.find(f => f.name === 'style.css' && !f.parentId);
                const anyCss = rootCss || files.find(f => f.name.endsWith('.css'));
                if (anyCss?.content) {
                    if (finalHtml.includes('</head>')) finalHtml = finalHtml.replace('</head>', `<style>${anyCss.content}</style></head>`);
                    else finalHtml += `<style>${anyCss.content}</style>`;
                }
            }

            if (isFullHtml) {
                finalHtml = finalHtml.replace("<head>", `<head>${consoleScript}`);
            } else {
                finalHtml = `
                    <!DOCTYPE html>
                    <html>
                        <head>
                            ${consoleScript}
                        </head>
                        <body>
                            ${finalHtml}
                        </body>
                    </html>
                `;
            }
            setSrcDoc(finalHtml);
        }, 500);

        return () => clearTimeout(timeout);
    }, [files, mode, activeTab]);

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
            setFiles(getInitialProject());
            setActiveTab("index.html");
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

    const handleFormat = async () => {
        if (editorRef.current) {
            try {
                editorRef.current.focus();
                await editorRef.current.getAction('editor.action.formatDocument').run();
                const formattedValue = editorRef.current.getValue();
                handleEditorChange(formattedValue);
            } catch (err) {
                console.error("Formatting error:", err);
            }
        }
    };

    const handleVerify = async () => {
        setValidationStatus("idle");
        setErrorMessage("");

        const logs: string[] = [];
        logs.push(`Starting verification for mode: ${mode}`);

        if (!validationRules || validationRules.length === 0) {
            logs.push("No validation rules found. Passing automatically.");
            setValidationStatus("success");
            if (onComplete) onComplete();
            await logValidationProgress(logs);
            return;
        }

        logs.push(`Found ${validationRules.length} rule(s) to check.`);

        // Local save is now handled autonomously, we just need to verify

        const newRuleStatuses: Record<number, "idle" | "success" | "error"> = {};
        let allPassed = true;

        if (mode === 'web' && iframeRef.current) {
            const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
            const win = iframeRef.current.contentWindow || window;

            if (doc) {
                validationRules.forEach((rule, index) => {
                    let passed = false;
                    let expectedStr = "";
                    let actualStr = "";

                    try {
                        if (rule.type === 'dom-selector' && rule.selector) {
                            expectedStr = `Element matching '${rule.selector}' exists`;
                            const matches = doc.querySelectorAll(rule.selector);
                            passed = matches.length > 0;
                            actualStr = passed ? `Found ${matches.length} matching element(s)` : `Element not found`;
                            logs.push(`Rule ${index + 1} (dom-selector: ${rule.selector}): -> ${passed ? '✅ PASS' : '❌ FAIL'}`);
                        } else if (rule.type === 'css-prop' && rule.selector && rule.property && rule.value) {
                            expectedStr = `${rule.property} contains '${rule.value}' on ${rule.selector}`;
                            const el = doc.querySelector(rule.selector);
                            if (el) {
                                const style = win.getComputedStyle(el);
                                const currentVal = style.getPropertyValue(rule.property).toLowerCase();
                                const targetVal = rule.value.toLowerCase();
                                passed = currentVal.includes(targetVal) || targetVal.includes(currentVal);
                                actualStr = currentVal || 'Not set';
                                logs.push(`Rule ${index + 1} (css-prop: ${rule.property} on ${rule.selector}): Target '${targetVal}', Got '${currentVal}' -> ${passed ? '✅ PASS' : '❌ FAIL'}`);
                            } else {
                                actualStr = "Target element not found in DOM";
                                logs.push(`Rule ${index + 1} (css-prop): Failed to find element '${rule.selector}'`);
                            }
                        } else if (rule.type === 'text-match' && rule.text) {
                            const normalize = (str: string) => str.replace(/\s+/g, ' ').trim();
                            const combinedCode = normalize(files.map(f => f.content || '').join(' '));
                            const targetText = normalize(rule.text);
                            expectedStr = `Code contains text: "${rule.text}"`;
                            passed = combinedCode.toLowerCase().includes(targetText.toLowerCase());
                            actualStr = passed ? "Match found in source code" : "Mismatch logic detected";
                            logs.push(`Rule ${index + 1} (text-match: "${targetText}"): -> ${passed ? '✅ PASS' : '❌ FAIL'}`);
                        } else if (rule.type === 'regex' && rule.text) {
                            expectedStr = `Code matches regex: /${rule.text}/i`;
                            const combinedCode = files.map(f => f.content || '').join(' ');
                            passed = new RegExp(rule.text, 'i').test(combinedCode);
                            actualStr = passed ? "Match found in source code" : "No regex match";
                            logs.push(`Rule ${index + 1} (regex: /${rule.text}/): -> ${passed ? '✅ PASS' : '❌ FAIL'}`);
                        }
                    } catch (e: any) {
                        logs.push(`Validation exception for rule ${index + 1}: ${e.message}`);
                    }

                    newRuleStatuses[index] = passed ? "success" : "error";
                    if (!passed) allPassed = false;
                });
            } else {
                logs.push("Could not access iframe content document.");
                allPassed = false;
            }
        } else {
            // Fallback for non-web modes
            const normalize = (str: string) => str.replace(/\s+/g, ' ').trim();
            const combinedCode = mode === 'web' 
                ? files.map(f => f.content).join(' ') 
                : textCode;
            
            const normalizedCode = normalize(combinedCode);

            validationRules.forEach((rule, index) => {
                let passed = false;
                let expectedStr = "";
                let actualStr = "";

                if (rule.type === 'text-match' && rule.text) {
                    const targetText = normalize(rule.text);
                    expectedStr = `Code contains text: "${rule.text}"`;
                    passed = normalizedCode.toLowerCase().includes(targetText.toLowerCase());
                    actualStr = passed ? "Match found" : "Mismatch logic detected";
                    logs.push(`Rule ${index + 1} (text-match: "${targetText}"): -> ${passed ? '✅ PASS' : '❌ FAIL'}`);
                } else if (rule.type === 'regex' && rule.text) {
                    passed = new RegExp(rule.text, 'i').test(combinedCode);
                    logs.push(`Rule ${index + 1} (regex: /${rule.text}/): -> ${passed ? '✅ PASS' : '❌ FAIL'}`);
                }
                newRuleStatuses[index] = passed ? "success" : "error";
                if (!passed) allPassed = false;
            });
        }

        setRuleStatuses(newRuleStatuses);

        if (allPassed) {
            logs.push("Result: ALL RULES PASSED!");
            setValidationStatus("success");
            const timer = setTimeout(() => {
                if (onComplete) onComplete();
            }, 1500);
            
            await logValidationProgress(logs);
            return () => clearTimeout(timer);
        } else {
            logs.push("Result: SOME RULES FAILED.");
            // Failure! Deduct heart
            if (onHeartLost) onHeartLost();
            
            setValidationStatus("error");
            setErrorMessage("Some requirements are not met. Open 'Details' to see what's missing!");
            setShowInfo(true); // Proactively show details if they fail
        }
        
        // Ensure logs are sent even on failure
        await logValidationProgress(logs);
    };

    const handleEditorWillMount = (monaco: any) => {
        monaco.editor.defineTheme('skloop-theme', skloopTheme);
        emmetHTML(monaco);
        emmetCSS(monaco);
    };

    const editorRef = useRef<any>(null);

    const handleEditorDidMount = (editor: any, monaco: any) => {
        editorRef.current = editor;
        editor.onDidChangeModelContent((event: any) => {
            const changes = event.changes;
            for (const change of changes) {
                if (change.text === '>') {
                    const model = editor.getModel();
                    if (!model) return;

                    const position = editor.getPosition();
                    if (!position) return;

                    const lineContent = model.getLineContent(position.lineNumber);
                    const textBefore = lineContent.substring(0, position.column - 1);

                    const match = textBefore.match(/<([a-zA-Z1-6]+)(?:\s+[^>]*?)?>$/);

                    if (match) {
                        const tagName = match[1];
                        const voidTags = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

                        if (!voidTags.includes(tagName.toLowerCase()) && !textBefore.endsWith('/>')) {
                            const closingTag = `</${tagName}>`;
                            editor.executeEdits('auto-close-tag', [{
                                range: new monaco.Range(
                                    position.lineNumber,
                                    position.column,
                                    position.lineNumber,
                                    position.column
                                ),
                                text: closingTag,
                                forceMoveMarkers: true
                            }]);
                            editor.setPosition(position);
                        }
                    }
                }
            }
        });
    };

    const handleEditorChange = (value: string | undefined) => {
        const val = value || "";
        if (mode === 'web') {
            setFiles(prev => prev.map(f => f.id === activeTab ? { ...f, content: val } : f));
        } else {
            setTextCode(val);
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
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-[#FDFCF8] rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[85vh] border border-zinc-200"
                        >
                            <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-white relative">
                                <div className="absolute top-0 left-0 w-full h-1 bg-[#D4F268]" />
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-[#D4F268] rounded-2xl flex items-center justify-center rotate-3 shadow-lg shadow-[#D4F268]/20">
                                        <Code size={24} className="text-zinc-900" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-zinc-900 tracking-tight">{title}</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <span className="px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded text-[10px] font-black uppercase tracking-widest border border-zinc-200">Challenge Details</span>
                                            {validationStatus === 'error' && (
                                                <span className="px-2 py-0.5 bg-red-100 text-red-600 rounded text-[10px] font-black uppercase tracking-widest border border-red-200">Fix Required</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setShowInfo(false)} className="p-2 hover:bg-zinc-100 rounded-full transition-colors group">
                                    <X size={20} className="text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                                </button>
                            </div>
                            <div className="p-8 overflow-y-auto space-y-8 no-scrollbar">
                                <div className="relative">
                                    <div className="absolute -left-4 top-0 w-1 h-full bg-zinc-100 rounded-full" />
                                    <p className="text-zinc-600 leading-relaxed font-medium">
                                        {description || "No description provided for this challenge."}
                                    </p>
                                </div>

                                {validationRules && validationRules.length > 0 && (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                                <ListChecks size={14} className="text-[#D4F268]" /> Proper Things To Do
                                            </h4>
                                            <span className="text-[10px] font-bold text-zinc-400">
                                                {Object.values(ruleStatuses).filter(s => s === 'success').length}/{validationRules.length} Complete
                                            </span>
                                        </div>
                                        <div className="space-y-2.5">
                                            {validationRules.map((rule, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={false}
                                                    animate={{
                                                        backgroundColor: ruleStatuses[i] === 'success' ? '#F0FDF4' : ruleStatuses[i] === 'error' ? '#FEF2F2' : '#FFFFFF',
                                                        borderColor: ruleStatuses[i] === 'success' ? '#DCFCE7' : ruleStatuses[i] === 'error' ? '#FEE2E2' : '#F4F4F5'
                                                    }}
                                                    className="flex items-center gap-4 p-4 rounded-2xl border transition-all shadow-sm"
                                                >
                                                    <div className={`
                                                        w-6 h-6 rounded-full flex items-center justify-center shrink-0 border
                                                        ${ruleStatuses[i] === 'success' ? 'bg-emerald-500 border-emerald-600 text-white' :
                                                            ruleStatuses[i] === 'error' ? 'bg-red-500 border-red-600 text-white' : 'bg-white border-zinc-200 text-zinc-300'}
                                                    `}>
                                                        {ruleStatuses[i] === 'success' ? <Check size={14} strokeWidth={4} /> :
                                                            ruleStatuses[i] === 'error' ? <X size={14} strokeWidth={4} /> : <div className="w-1.5 h-1.5 rounded-full bg-zinc-200" />}
                                                    </div>
                                                    <span className={`text-sm font-bold ${ruleStatuses[i] === 'success' ? 'text-emerald-700 line-through opacity-60' : ruleStatuses[i] === 'error' ? 'text-red-700' : 'text-zinc-600'}`}>
                                                        {rule.text}
                                                    </span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {hints && hints.length > 0 && (
                                    <div className="space-y-4">
                                        <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Lightbulb size={14} className="text-yellow-400" /> Hints
                                        </h4>
                                        <div className="space-y-2">
                                            {hints.map((hint, i) => (
                                                <details key={i} className="group outline-none">
                                                    <summary className="list-none group-open:bg-yellow-50 bg-zinc-50 p-4 rounded-2xl border border-zinc-100 flex items-center justify-between cursor-pointer transition-all hover:bg-zinc-100">
                                                        <span className="text-xs font-bold text-zinc-600 flex items-center gap-2">
                                                            <div className="w-2 h-2 rounded-full bg-yellow-400" />
                                                            Hint #{i + 1}
                                                        </span>
                                                        <ChevronDown size={14} className="text-zinc-400 transition-transform group-open:rotate-180" />
                                                    </summary>
                                                    <div className="p-4 pt-2 text-xs font-medium text-zinc-500 leading-relaxed bg-yellow-50/50 rounded-b-2xl border-x border-b border-zinc-100 italic">
                                                        {hint}
                                                    </div>
                                                </details>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="p-6 border-t border-zinc-100 bg-white flex justify-end">
                                <button
                                    onClick={() => setShowInfo(false)}
                                    className="bg-zinc-900 text-[#D4F268] px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-zinc-900/20"
                                >
                                    Let's Code
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Main IDE Body */}
            <div className="flex-1 flex overflow-hidden">
                {/* File Sidebar */}
                <AnimatePresence>
                    {showSidebar && mode === 'web' && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 210, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="bg-zinc-50 border-r border-zinc-100 flex flex-col h-full overflow-hidden shrink-0"
                        >
                            <div className="px-3 py-2.5 border-b border-zinc-100 flex items-center justify-between shrink-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Explorer</span>
                                    {selectedFolderId && (
                                        <span className="text-[9px] font-bold text-lime-600 bg-lime-50 border border-lime-200 px-1.5 py-0.5 rounded-full truncate max-w-[70px]">
                                            {files.find(f => f.id === selectedFolderId)?.name}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-0.5">
                                    <button
                                        onClick={() => setIsCreating({ type: 'file', parentId: selectedFolderId })}
                                        className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                                        title={selectedFolderId ? `New file in ${files.find(f => f.id === selectedFolderId)?.name}` : "New file"}
                                    ><FilePlus size={13} /></button>
                                    <button
                                        onClick={() => setIsCreating({ type: 'folder', parentId: selectedFolderId })}
                                        className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"
                                        title={selectedFolderId ? `New folder in ${files.find(f => f.id === selectedFolderId)?.name}` : "New folder"}
                                    ><FolderPlus size={13} /></button>
                                    <button onClick={() => setShowSidebar(false)} className="p-1.5 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-lg transition-colors"><ChevronLeft size={13} /></button>
                                </div>
                            </div>

                            {/* Root drop zone */}
                            <div
                                className={cn(
                                    "flex-1 overflow-y-auto p-2 no-scrollbar transition-colors",
                                    dragOverId === 'root' && "bg-lime-50"
                                )}
                                onDragOver={(e) => { e.preventDefault(); setDragOverId('root'); }}
                                onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverId(null); }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    if (draggingId) moveFile(draggingId, null);
                                    setDraggingId(null);
                                    setDragOverId(null);
                                }}
                                onClick={() => setSelectedFolderId(null)}
                            >
                                <AnimatePresence initial={false}>
                                    {isCreating && isCreating.parentId === null && (
                                        <motion.div
                                            key="root-input"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="mb-1 overflow-hidden"
                                        >
                                            <div className="px-1 py-1">
                                                <input
                                                    autoFocus
                                                    className="bg-white border-2 border-lime-400 rounded-lg px-2 py-1.5 text-xs w-full outline-none font-bold"
                                                    value={newItemName}
                                                    onChange={(e) => setNewItemName(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && newItemName.trim()) addFile(isCreating.type, null, newItemName.trim());
                                                        if (e.key === 'Escape') { setIsCreating(null); setNewItemName(""); }
                                                    }}
                                                    onBlur={() => { setIsCreating(null); setNewItemName(""); }}
                                                    placeholder={isCreating.type === 'file' ? "filename.html" : "folder-name"}
                                                />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                                <div className="space-y-0.5">
                                    {files.filter(f => f.parentId === null).map(node => (
                                        <FileTreeItem
                                            key={node.id}
                                            node={node}
                                            files={files}
                                            activeTab={activeTab}
                                            setActiveTab={setActiveTab}
                                            toggleFolder={toggleFolder}
                                            editingId={editingId}
                                            setEditingId={setEditingId}
                                            newItemName={newItemName}
                                            setNewItemName={setNewItemName}
                                            renameFile={renameFile}
                                            deleteFile={deleteFile}
                                            isCreating={isCreating}
                                            setIsCreating={setIsCreating}
                                            addFile={addFile}
                                            selectedFolderId={selectedFolderId}
                                            setSelectedFolderId={setSelectedFolderId}
                                            draggingId={draggingId}
                                            setDraggingId={setDraggingId}
                                            dragOverId={dragOverId}
                                            setDragOverId={setDragOverId}
                                            moveFile={moveFile}
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Sidebar Toggle Button (when closed) */}
                {!showSidebar && mode === 'web' && (
                    <button
                        onClick={() => setShowSidebar(true)}
                        className="w-8 bg-zinc-50 border-r border-zinc-100 flex items-start justify-center pt-4 text-zinc-400 hover:text-zinc-900 transition-colors shrink-0"
                    >
                        <ChevronRight size={14} />
                    </button>
                )}

                {/* Code Editor Pane */}
                <motion.div
                    animate={{
                        width: isSinglePane ? '100%' : fullscreen === 'code' ? '100%' : fullscreen === 'preview' ? '0%' : `${dividerPosition}%`,
                        opacity: fullscreen === 'preview' ? 0 : 1,
                        pointerEvents: fullscreen === 'preview' ? 'none' : 'auto',
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className={cn(
                        "flex flex-col bg-white border-r border-zinc-100 overflow-hidden",
                        !isSinglePane && viewMode === 'preview' ? 'hidden md:flex' : 'flex'
                    )}
                >
                    <div className="bg-zinc-50 border-b border-zinc-100 px-4 py-2 flex items-center justify-between shadow-sm z-10 w-full">
                        {/* Current File Indicator */}
                        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
                            {mode === 'web' ? (
                                <div className="flex items-center gap-2 text-zinc-500">
                                    <FileText size={14} className={files.find(f => f.id === activeTab)?.name.endsWith('.html') ? "text-orange-500" : files.find(f => f.id === activeTab)?.name.endsWith('.css') ? "text-blue-500" : "text-yellow-500"} />
                                    <span className="text-xs font-bold uppercase tracking-wider">
                                        {files.find(f => f.id === activeTab)?.name || 'index.html'}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 px-2">
                                    <Code size={16} className="text-zinc-400" />
                                    <span className="text-sm font-bold text-zinc-600 uppercase tracking-wide">
                                        {mode === 'algorithm' ? 'JavaScript' : 'Pseudocode'}
                                    </span>
                                </div>
                            )}

                            {/* Autosave indicator */}
                            <AnimatePresence mode="wait">
                                {autoSaveStatus === "saving" && (
                                    <motion.span
                                        key="saving"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1"
                                    >
                                        <RefreshCw size={10} className="animate-spin" /> Saving...
                                    </motion.span>
                                )}
                                {autoSaveStatus === "saved" && (
                                    <motion.span
                                        key="saved"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-1"
                                    >
                                        <Check size={10} /> Saved
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 md:gap-2">
                            <button
                                onClick={() => setShowInfo(true)}
                                className="text-zinc-500 hover:text-zinc-900 p-2 rounded-xl hover:bg-zinc-100 transition-all flex items-center gap-2 mr-2 bg-white border border-zinc-200 shadow-sm relative group"
                                title="Challenge Details"
                            >
                                <Info size={16} className={validationStatus === 'error' ? 'text-red-500' : ''} />
                                <span className="hidden lg:inline text-[10px] font-black uppercase tracking-widest">Details</span>
                                {validationStatus === 'error' && (
                                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                                    </span>
                                )}
                            </button>

                            <button
                                onClick={handleClear}
                                className="text-xs text-red-400 hover:text-red-600 font-medium px-2 py-1.5 rounded hover:bg-red-50 flex items-center gap-1.5 transition-colors"
                                title="Clear All Code"
                            >
                                <Trash2 size={14} />
                                <span className="hidden sm:inline">Clear</span>
                            </button>
                            <button
                                onClick={handleFormat}
                                className="text-zinc-500 hover:text-zinc-900 p-2 rounded-lg hover:bg-zinc-200 transition-colors flex items-center gap-2 bg-white border border-zinc-200 shadow-sm"
                                title="Format Code (Alt+Shift+F)"
                            >
                                <Wand2 size={16} />
                                <span className="hidden lg:inline text-xs font-bold">Format</span>
                            </button>

                            <div className="h-4 w-px bg-zinc-200 mx-1 hidden md:block" />
                            <button
                                onClick={() => setShowLogs(!showLogs)}
                                className={`p-2 rounded-xl transition-all ${showLogs ? 'bg-zinc-200 text-zinc-900 border-zinc-300' : 'text-zinc-500 hover:bg-zinc-200 border-transparent'} border`}
                                title="Toggle Console"
                            >
                                <Layout size={18} />
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
                        <MonacoEditor
                            height="100%"
                            language={mode === 'web' ? (files.find(f => f.id === activeTab)?.language || 'html') : (mode === 'algorithm' ? 'javascript' : 'markdown')}
                            value={mode === 'web' ? (files.find(f => f.id === activeTab)?.content || '') : textCode}
                            theme="skloop-theme"
                            beforeMount={handleEditorWillMount}
                            onMount={handleEditorDidMount}
                            onChange={handleEditorChange}
                            options={{
                                fontSize: 14,
                                fontFamily: '"Fira Code", "Fira Mono", monospace',
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                lineNumbers: 'on',
                                roundedSelection: true,
                                automaticLayout: true,
                                cursorStyle: 'line',
                                cursorWidth: 2,
                                renderLineHighlight: 'none',
                                guides: { indentation: false, bracketPairs: false },
                                occurrencesHighlight: 'off' as any,
                                selectionHighlight: false,
                                folding: false,
                                bracketPairColorization: { enabled: true },
                                formatOnType: true,
                                formatOnPaste: true,
                                autoClosingBrackets: 'always',
                                autoClosingQuotes: 'always',
                                suggestOnTriggerCharacters: true,
                                acceptSuggestionOnEnter: 'on',
                                quickSuggestions: { other: true, comments: true, strings: true },
                                padding: { top: 24, bottom: 24 },
                                scrollbar: {
                                    vertical: 'hidden',
                                    horizontal: 'hidden'
                                }
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
                                onClick={handleVerify}
                                disabled={validationStatus === "success" || validationStatus === "saving"}
                                className={`
                                px-8 py-2.5 rounded-full font-bold transition-all flex items-center gap-2
                                ${validationStatus === "success"
                                        ? "bg-emerald-500 text-white cursor-default"
                                        : validationStatus === "saving"
                                            ? "bg-zinc-100 text-zinc-400 cursor-wait"
                                            : "bg-zinc-900 text-white hover:scale-105 active:scale-95 shadow-lg shadow-zinc-900/10"}
                            `}
                            >
                                {validationStatus === "success" ? (
                                    <>Perfect!</>
                                ) : validationStatus === "saving" ? (
                                    <>
                                        <RefreshCw size={16} className="animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Play size={16} className="fill-current" />
                                        Run & Submit
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* Resize Handle (desktop only, web mode only) */}
                {!isSinglePane && fullscreen === 'none' && (
                    <div
                        onMouseDown={startResizing}
                        className={cn(
                            "hidden md:block w-1 hover:w-2 bg-transparent hover:bg-lime-400/50 absolute top-0 bottom-0 z-50 cursor-col-resize transition-all duration-150 group/resizer",
                            isResizing && "w-2 bg-lime-400"
                        )}
                        style={{ left: `calc(${dividerPosition}% - 2px)` }}
                    >
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-white border border-zinc-200 rounded-full flex items-center justify-center opacity-0 group-hover/resizer:opacity-100 transition-opacity">
                            <div className="w-0.5 h-3 bg-zinc-300 rounded-full" />
                        </div>
                    </div>
                )}

                {/* PREVIEW PANE (Only for Web Mode) */}
                {!isSinglePane && (
                    <motion.div
                        animate={{
                            width: fullscreen === 'preview' ? '100%' : fullscreen === 'code' ? '0%' : `${100 - dividerPosition}%`,
                            opacity: fullscreen === 'code' ? 0 : 1,
                            pointerEvents: fullscreen === 'code' ? 'none' : 'auto',
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className={cn(
                            "bg-white relative flex flex-col h-full overflow-hidden",
                            viewMode === 'code' ? 'hidden md:flex' : 'flex'
                        )}
                    >
                        <div className="bg-white border-b border-zinc-100 px-4 py-2.5 flex items-center justify-between shadow-sm z-10">
                            <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                                <Monitor size={14} /> Live Preview
                            </span>
                            <div className="flex items-center gap-2">
                                {/* Device Preview Toggles */}
                                <div className="flex bg-zinc-100 p-1 rounded-lg mr-2">
                                    <button
                                        onClick={() => setPreviewDevice("mobile")}
                                        className={`p-1.5 rounded-md transition-all ${previewDevice === "mobile" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
                                        title="Mobile View"
                                    >
                                        <Smartphone size={14} />
                                    </button>
                                    <button
                                        onClick={() => setPreviewDevice("tablet")}
                                        className={`p-1.5 rounded-md transition-all ${previewDevice === "tablet" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
                                        title="Tablet View"
                                    >
                                        <Tablet size={14} />
                                    </button>
                                    <button
                                        onClick={() => setPreviewDevice("desktop")}
                                        className={`p-1.5 rounded-md transition-all ${previewDevice === "desktop" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-600"}`}
                                        title="Desktop View"
                                    >
                                        <Laptop size={14} />
                                    </button>
                                </div>

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

                        <div className="flex-1 relative w-full h-full bg-zinc-50 overflow-auto p-4 flex items-start justify-center">
                            <div
                                className={`
                                bg-white shadow-2xl transition-all duration-300 overflow-hidden
                                ${previewDevice === 'mobile' ? 'w-[375px] h-[667px]' : previewDevice === 'tablet' ? 'w-[768px] h-[1024px]' : 'w-full h-full'}
                            `}
                            >
                                <iframe
                                    key={previewKey}
                                    ref={iframeRef}
                                    srcDoc={srcDoc}
                                    title="preview"
                                    className="w-full h-full border-none"
                                    sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-same-origin"
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            {/* Mobile Toggle Button */}
            {!isSinglePane && (
                <div className={`md:hidden absolute bottom-6 right-6 z-40 flex flex-col gap-3 items-end`}>
                    <AnimatePresence>
                        {(!isSinglePane) && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0, y: 20 }}
                                onClick={handleVerify}
                                disabled={validationStatus === "success" || validationStatus === "saving"}
                                className={`h-14 px-6 rounded-full shadow-2xl flex items-center gap-2 font-black text-xs uppercase tracking-widest border-2 transition-all active:scale-95 ${validationStatus === "success"
                                    ? "bg-emerald-500 text-white border-emerald-400"
                                    : validationStatus === "saving"
                                        ? "bg-zinc-100 text-zinc-400 border-zinc-200"
                                        : "bg-[#D4F268] text-zinc-900 border-zinc-900"
                                    }`}
                            >
                                {validationStatus === "success" ? <Check size={20} /> : validationStatus === "saving" ? <RefreshCw size={20} className="animate-spin" /> : <Play size={18} className="fill-current" />}
                                {validationStatus === "success" ? "Perfect!" : validationStatus === "saving" ? "Saving..." : "Submit"}
                            </motion.button>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={() => setViewMode(m => m === 'code' ? 'preview' : 'code')}
                        className="h-14 w-14 rounded-full bg-zinc-900 text-[#D4F268] shadow-xl shadow-zinc-900/30 flex items-center justify-center transition-transform active:scale-95 border-2 border-[#D4F268]"
                    >
                        {viewMode === 'code' ? <Play size={24} className="ml-1 fill-current" /> : <Code size={24} />}
                    </button>
                </div>
            )}
        </div>
    );
}

function FileTreeItem({
    node, files, activeTab, setActiveTab, toggleFolder,
    editingId, setEditingId, newItemName, setNewItemName,
    renameFile, deleteFile, isCreating, setIsCreating, addFile,
    selectedFolderId, setSelectedFolderId,
    draggingId, setDraggingId, dragOverId, setDragOverId, moveFile,
}: any) {
    const children = files.filter((f: any) => f.parentId === node.id);
    const isFolder = node.type === 'folder';
    const isActive = activeTab === node.id;
    const isSelectedFolder = selectedFolderId === node.id;
    const isDraggingThis = draggingId === node.id;
    const isDragTarget = dragOverId === node.id;

    const fileColor = node.name.endsWith('.html')
        ? 'text-orange-400'
        : node.name.endsWith('.css')
        ? 'text-sky-400'
        : node.name.endsWith('.js')
        ? 'text-yellow-400'
        : 'text-zinc-400';

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isFolder) {
            toggleFolder(node.id);
            setSelectedFolderId(node.id === selectedFolderId ? null : node.id);
        } else {
            setActiveTab(node.id);
            setSelectedFolderId(null);
        }
    };

    return (
        <div className="w-full">
            <motion.div
                layout
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: isDraggingThis ? 0.35 : 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.15 }}
                draggable
                onDragStart={(e) => {
                    e.stopPropagation();
                    setDraggingId(node.id);
                    (e as any).dataTransfer.effectAllowed = 'move';
                }}
                onDragEnd={() => { setDraggingId(null); setDragOverId(null); }}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isFolder && draggingId !== node.id) setDragOverId(node.id);
                }}
                onDragLeave={(e) => {
                    e.stopPropagation();
                    if (dragOverId === node.id) setDragOverId(null);
                }}
                onDrop={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (draggingId && draggingId !== node.id && isFolder) moveFile(draggingId, node.id);
                    setDraggingId(null);
                    setDragOverId(null);
                }}
                onClick={handleClick}
                className={cn(
                    "group flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer select-none",
                    isActive && !isFolder
                        ? "bg-[#D4F268] text-zinc-900 shadow-sm"
                        : isSelectedFolder
                        ? "bg-lime-100 text-zinc-900 border border-lime-300"
                        : isDragTarget
                        ? "bg-lime-50 border border-lime-400 border-dashed"
                        : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-800"
                )}
            >
                {/* Animated chevron for folders */}
                {isFolder ? (
                    <motion.div
                        animate={{ rotate: node.isExpanded ? 90 : 0 }}
                        transition={{ duration: 0.18, ease: 'easeInOut' }}
                        className="shrink-0 text-zinc-400"
                    >
                        <ChevronRight size={13} />
                    </motion.div>
                ) : (
                    <span className="w-[13px] shrink-0" />
                )}

                {isFolder ? (
                    <span className="shrink-0">
                        {node.isExpanded
                            ? <FolderOpen size={14} className="text-amber-400" />
                            : <Folder size={14} className="text-amber-400" />
                        }
                    </span>
                ) : (
                    <FileText size={13} className={cn("shrink-0", fileColor)} />
                )}

                {editingId === node.id ? (
                    <input
                        autoFocus
                        className="bg-white border-2 border-lime-400 rounded px-1 outline-none w-full text-xs font-bold text-black"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && newItemName.trim()) renameFile(node.id, newItemName.trim());
                            if (e.key === 'Escape') { setEditingId(null); setNewItemName(""); }
                        }}
                        onBlur={() => { setEditingId(null); setNewItemName(""); }}
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span className="flex-1 truncate">{node.name}</span>
                )}

                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0 transition-opacity">
                    {isFolder && (
                        <>
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsCreating({ type: 'file', parentId: node.id }); setSelectedFolderId(node.id); if (!node.isExpanded) toggleFolder(node.id); }}
                                className="p-0.5 hover:bg-zinc-200 rounded text-zinc-400 hover:text-zinc-900"
                                title="New file here"
                            ><FilePlus size={11} /></button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsCreating({ type: 'folder', parentId: node.id }); setSelectedFolderId(node.id); if (!node.isExpanded) toggleFolder(node.id); }}
                                className="p-0.5 hover:bg-zinc-200 rounded text-zinc-400 hover:text-zinc-900"
                                title="New folder here"
                            ><FolderPlus size={11} /></button>
                        </>
                    )}
                    <button
                        onClick={(e) => { e.stopPropagation(); setEditingId(node.id); setNewItemName(node.name); }}
                        className="p-0.5 hover:bg-zinc-200 rounded text-zinc-400 hover:text-zinc-900"
                    ><Edit2 size={11} /></button>
                    <button
                        onClick={(e) => { e.stopPropagation(); deleteFile(node.id); }}
                        className="p-0.5 hover:bg-red-100 rounded text-zinc-300 hover:text-red-500"
                    ><Trash size={11} /></button>
                </div>
            </motion.div>

            {isFolder && (
                <AnimatePresence initial={false}>
                    {node.isExpanded && (
                        <motion.div
                            key="children"
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2, ease: 'easeInOut' }}
                            className="overflow-hidden"
                        >
                            <div className="ml-3 pl-2 border-l-2 border-zinc-100 mt-0.5 space-y-0.5">
                                <AnimatePresence initial={false}>
                                    {isCreating && isCreating.parentId === node.id && (
                                        <motion.div
                                            key="folder-input"
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.15 }}
                                            className="overflow-hidden py-1 pr-1"
                                        >
                                            <input
                                                autoFocus
                                                className="bg-white border-2 border-lime-400 rounded-lg px-2 py-1 text-xs w-full outline-none font-bold"
                                                value={newItemName}
                                                onChange={(e) => setNewItemName(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && newItemName.trim()) addFile(isCreating.type, node.id, newItemName.trim());
                                                    if (e.key === 'Escape') { setIsCreating(null); setNewItemName(""); }
                                                }}
                                                onBlur={() => { setIsCreating(null); setNewItemName(""); }}
                                                placeholder={isCreating.type === 'file' ? "filename.html" : "folder-name"}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {children.length === 0 && !isCreating && (
                                    <p className="text-[10px] text-zinc-300 px-2 py-1 italic">Empty folder</p>
                                )}

                                {children.map((child: any) => (
                                    <FileTreeItem
                                        key={child.id}
                                        node={child}
                                        files={files}
                                        activeTab={activeTab}
                                        setActiveTab={setActiveTab}
                                        toggleFolder={toggleFolder}
                                        editingId={editingId}
                                        setEditingId={setEditingId}
                                        newItemName={newItemName}
                                        setNewItemName={setNewItemName}
                                        renameFile={renameFile}
                                        deleteFile={deleteFile}
                                        isCreating={isCreating}
                                        setIsCreating={setIsCreating}
                                        addFile={addFile}
                                        selectedFolderId={selectedFolderId}
                                        setSelectedFolderId={setSelectedFolderId}
                                        draggingId={draggingId}
                                        setDraggingId={setDraggingId}
                                        dragOverId={dragOverId}
                                        setDragOverId={setDragOverId}
                                        moveFile={moveFile}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </div>
    );
}
