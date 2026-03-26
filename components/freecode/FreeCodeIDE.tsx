"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import MonacoEditor, { loader } from "@monaco-editor/react";
import {
    RotateCcw, Layout, Eye, Smartphone, Tablet, Laptop,
    FileText, ChevronLeft, ChevronRight,
    FolderPlus, FilePlus, Folder, FolderOpen, Wand2, Trash, Edit2,
    Maximize2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { emmetHTML, emmetCSS } from "emmet-monaco-es";
import { FreeCodeProject, FileNode, getDefaultFiles } from "@/lib/freecode-helpers";
import { cn } from "@/lib/utils";
loader.config({ paths: { vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.55.1/min/vs' } });

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
        'editor.selectionBackground': '#D4F268',
        'editorBracketMatch.background': '#D4F268',
        'editorBracketMatch.border': '#D4F268',
    }
};

interface FreeCodeIDEProps {
    project: FreeCodeProject;
    onFilesChange: (files: FileNode[]) => void;
}

function getInitialFiles(project: FreeCodeProject): FileNode[] {
    if (Array.isArray(project.files) && project.files.length > 0) {
        return project.files as FileNode[];
    }
    return getDefaultFiles();
}

export default function FreeCodeIDE({ project, onFilesChange }: FreeCodeIDEProps) {
    const [files, setFiles] = useState<FileNode[]>(() => getInitialFiles(project));
    const [activeTab, setActiveTab] = useState<string>("index.html");
    const [srcDoc, setSrcDoc] = useState("");
    const [logs, setLogs] = useState<{ type: string; message: string }[]>([]);
    const [showLogs, setShowLogs] = useState(false);
    const [previewDevice, setPreviewDevice] = useState<"mobile" | "tablet" | "desktop">("desktop");
    const [previewKey] = useState(0);
    const [showSidebar, setShowSidebar] = useState(true);
    const [fullscreenPane, setFullscreenPane] = useState<"editor" | "preview" | null>(null);
    const [dividerPosition, setDividerPosition] = useState(50); // percentage
    const [isResizing, setIsResizing] = useState(false);
    const [isCreating, setIsCreating] = useState<{ type: 'file' | 'folder', parentId: string | null } | null>(null);
    const [newItemName, setNewItemName] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);

    const iframeRef = useRef<HTMLIFrameElement>(null);
    const editorRef = useRef<any>(null);

    // Notify parent when files change (parent debounces DB write)
    useEffect(() => {
        onFilesChange(files);
    }, [files]);

    // Resize handlers
    const startResizing = useCallback(() => setIsResizing(true), []);
    const stopResizing = useCallback(() => setIsResizing(false), []);
    const resize = useCallback((e: any) => {
        if (!isResizing) return;
        const newPosition = (e.clientX / window.innerWidth) * 100;
        if (newPosition > 20 && newPosition < 80) {
            setDividerPosition(newPosition);
        }
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

    // File Management
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

    const handleFormat = async () => {
        if (editorRef.current) {
            try {
                editorRef.current.focus();
                await editorRef.current.getAction('editor.action.formatDocument').run();
                const formattedValue = editorRef.current.getValue();
                handleEditorChange(formattedValue);
            } catch (err) {
                console.error("Formatting failed:", err);
            }
        }
    };

    // Console message listener
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'console-log') {
                setLogs(prev => [...prev.slice(-49), { type: 'log', message: event.data.message }]);
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

    // Real-time preview build
    useEffect(() => {
        const timeout = setTimeout(() => {
            let indexFile = files.find(f => f.name === 'index.html' && !f.parentId);
            if (!indexFile) indexFile = files.find(f => f.name === 'index.html');
            if (!indexFile) {
                const activeFile = files.find(f => f.id === activeTab);
                if (activeFile?.name.endsWith('.html')) indexFile = activeFile;
            }
            if (!indexFile) indexFile = files.find(f => f.name.endsWith('.html'));
            if (!indexFile) return;

            let html = indexFile.content || "";
            const htmlLower = html.trim().toLowerCase();
            const isFullHtml = htmlLower.startsWith("<!doctype") || htmlLower.startsWith("<html");

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

                const styleTags = content.match(/<link[^>]+href=["']([^"']+)["'][^>]*>/gi) || [];
                styleTags.forEach(tag => {
                    const hrefMatch = tag.match(/href=["']([^"']+)["']/i);
                    if (hrefMatch) {
                        const rawHref = hrefMatch[1];
                        const normalizedHref = rawHref.startsWith('/') ? rawHref.slice(1) : resolveRelativePath(entryDir, rawHref);
                        let cssContent = pathMap[normalizedHref] || pathMap[rawHref.replace(/^\.\//, '')];
                        if (!cssContent) {
                            const fileName = rawHref.split('/').pop() || "";
                            if (fuzzyMap[fileName]) cssContent = fuzzyMap[fileName];
                        }
                        if (cssContent) resolved = resolved.split(tag).join(`<style>${cssContent}</style>`);
                    }
                });

                const scriptTags = content.match(/<script[^>]+src=["']([^"']+)["'][^>]*>[\s\S]*?<\/script>/gi) || [];
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
                        if (jsContent) resolved = resolved.split(tag).join(`<script>${jsContent}</script>`);
                    }
                });

                return resolved;
            };

            let finalHtml = resolveInjection(html);

            if (!finalHtml.includes('<style>')) {
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
                finalHtml = `<!DOCTYPE html><html><head>${consoleScript}</head><body>${finalHtml}</body></html>`;
            }
            setSrcDoc(finalHtml);
        }, 500);

        return () => clearTimeout(timeout);
    }, [files, activeTab]);

    const handleEditorChange = (value: string | undefined) => {
        const val = value || "";
        setFiles(prev => prev.map(f => f.id === activeTab ? { ...f, content: val } : f));
    };

    const handleEditorWillMount = (monaco: any) => {
        monaco.editor.defineTheme('skloop-theme', skloopTheme);
        emmetHTML(monaco);
        emmetCSS(monaco);
    };

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
                                range: new monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
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

    return (
        <div className="flex flex-col h-full bg-[#FDFCF8] overflow-hidden select-none">
            <div className="flex-1 flex overflow-hidden relative">
                {/* File Sidebar */}
                <AnimatePresence>
                    {showSidebar && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 220, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="bg-zinc-50 border-r border-zinc-200 flex flex-col h-full overflow-hidden shrink-0"
                        >
                            <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Explorer</span>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => setIsCreating({ type: 'file', parentId: null })} className="p-1 text-zinc-400 hover:text-zinc-900 transition-colors" title="New file"><FilePlus size={14} /></button>
                                    <button onClick={() => setIsCreating({ type: 'folder', parentId: null })} className="p-1 text-zinc-400 hover:text-zinc-900 transition-colors" title="New folder"><FolderPlus size={14} /></button>
                                    <button onClick={() => setShowSidebar(false)} className="p-1 text-zinc-400 hover:text-zinc-900 transition-colors"><ChevronLeft size={14} /></button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
                                {isCreating && isCreating.parentId === null && (
                                    <div className="mb-2 px-2">
                                        <input
                                            autoFocus
                                            className="bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-xs w-full outline-none shadow-sm font-bold"
                                            value={newItemName}
                                            onChange={(e) => setNewItemName(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') addFile(isCreating.type, null, newItemName);
                                                if (e.key === 'Escape') setIsCreating(null);
                                            }}
                                            onBlur={() => setIsCreating(null)}
                                            placeholder={isCreating.type === 'file' ? "file.html" : "folder..."}
                                        />
                                    </div>
                                )}
                                <div className="space-y-0.5 text-zinc-500">
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
                                        />
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {!showSidebar && (
                    <button
                        onClick={() => setShowSidebar(true)}
                        className="w-8 bg-zinc-50 border-r border-zinc-200 flex items-start justify-center pt-6 text-zinc-400 hover:text-zinc-900 transition-colors shrink-0"
                    >
                        <ChevronRight size={14} />
                    </button>
                )}

                {/* Editor + Preview Container */}
                <div className="flex-1 flex min-w-0 relative">
                    {/* Monaco Editor Pane */}
                    <motion.div 
                        animate={{ 
                            width: fullscreenPane === 'editor' ? '100%' : fullscreenPane === 'preview' ? '0%' : `${dividerPosition}%`,
                            opacity: fullscreenPane === 'preview' ? 0 : 1,
                            pointerEvents: fullscreenPane === 'preview' ? 'none' : 'auto'
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="flex flex-col bg-white overflow-hidden border-r border-zinc-200 group relative"
                    >
                        <div className="bg-zinc-50 border-b border-zinc-100 px-4 py-2 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2">
                                <FileText size={14} className="text-zinc-400" />
                                <span className="text-[10px] font-black text-zinc-900 uppercase tracking-widest truncate">
                                    {files.find(f => f.id === activeTab)?.name || 'Editor'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={handleFormat} className="p-1.5 text-zinc-400 hover:text-zinc-900 transition-colors" title="Format Code"><Wand2 size={14} /></button>
                                <button
                                    onClick={() => setFullscreenPane(fullscreenPane === 'editor' ? null : 'editor')}
                                    className={cn("p-1.5 rounded-lg transition-all", fullscreenPane === 'editor' ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-400 hover:bg-zinc-200')}
                                    title="Fullscreen Editor"
                                >
                                    <Maximize2 size={14} />
                                </button>
                                <button
                                    onClick={() => setShowLogs(!showLogs)}
                                    className={cn("p-1.5 rounded-lg transition-all", showLogs ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-400 hover:bg-zinc-200')}
                                    title="Toggle console"
                                >
                                    <Layout size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 min-h-0">
                            <MonacoEditor
                                height="100%"
                                language={files.find(f => f.id === activeTab)?.language || "html"}
                                value={files.find(f => f.id === activeTab)?.content || ""}
                                onChange={handleEditorChange}
                                theme="skloop-theme"
                                beforeMount={handleEditorWillMount}
                                onMount={handleEditorDidMount}
                                options={{
                                    minimap: { enabled: false },
                                    fontSize: 14,
                                    lineNumbers: "on",
                                    roundedSelection: true,
                                    scrollBeyondLastLine: false,
                                    automaticLayout: true,
                                    padding: { top: 20 },
                                    cursorBlinking: "smooth",
                                    renderLineHighlight: 'none',
                                    guides: { indentation: false, bracketPairs: false },
                                    occurrencesHighlight: 'off' as any,
                                    selectionHighlight: false,
                                    folding: false,
                                    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
                                    wordWrap: 'on',
                                }}
                            />
                        </div>
                    </motion.div>

                    {/* Resize Handle */}
                    {!fullscreenPane && (
                        <div
                            onMouseDown={startResizing}
                            className={cn(
                                "w-1 hover:w-2 bg-transparent hover:bg-lime-400/50 absolute top-0 bottom-0 z-50 cursor-col-resize transition-all duration-300 group/resizer",
                                isResizing && "w-2 bg-lime-400 bg-opacity-100"
                            )}
                            style={{ left: `calc(${dividerPosition}% - 2px)` }}
                        >
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-white border border-zinc-200 rounded-full flex items-center justify-center opacity-0 group-hover/resizer:opacity-100 transition-opacity">
                                <div className="w-0.5 h-3 bg-zinc-300 rounded-full" />
                            </div>
                        </div>
                    )}

                    {/* Preview Pane */}
                    <motion.div 
                        animate={{ 
                            width: fullscreenPane === 'preview' ? '100%' : fullscreenPane === 'editor' ? '0%' : `${100 - dividerPosition}%`,
                            opacity: fullscreenPane === 'editor' ? 0 : 1,
                            pointerEvents: fullscreenPane === 'editor' ? 'none' : 'auto'
                        }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="flex flex-col bg-[#F8F9FA] overflow-hidden group"
                    >
                        <div className="bg-white border-b border-zinc-100 px-4 py-2 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-2 bg-zinc-50 px-3 py-1 rounded-full border border-zinc-200">
                                <Eye size={12} className="text-zinc-400" />
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Live View</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center bg-zinc-50 p-1 rounded-xl border border-zinc-100">
                                    <button onClick={() => setPreviewDevice("mobile")} className={cn("p-1.5 rounded-lg transition-all", previewDevice === 'mobile' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400")} title="Mobile"><Smartphone size={13} /></button>
                                    <button onClick={() => setPreviewDevice("tablet")} className={cn("p-1.5 rounded-lg transition-all", previewDevice === 'tablet' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400")} title="Tablet"><Tablet size={13} /></button>
                                    <button onClick={() => setPreviewDevice("desktop")} className={cn("p-1.5 rounded-lg transition-all", previewDevice === 'desktop' ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400")} title="Desktop"><Laptop size={13} /></button>
                                </div>
                                <button
                                    onClick={() => setFullscreenPane(fullscreenPane === 'preview' ? null : 'preview')}
                                    className={cn("p-1.5 rounded-lg transition-all", fullscreenPane === 'preview' ? 'bg-zinc-200 text-zinc-900' : 'text-zinc-400 hover:bg-zinc-200')}
                                    title="Fullscreen Preview"
                                >
                                    <Maximize2 size={14} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 flex items-center justify-center p-4 overflow-hidden bg-zinc-100/50">
                            <motion.div
                                animate={{
                                    width: previewDevice === 'mobile' ? 375 : previewDevice === 'tablet' ? 768 : '100%',
                                    height: previewDevice === 'mobile' ? 667 : '100%',
                                }}
                                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                className={cn(
                                    "bg-white overflow-hidden shadow-2xl transition-all duration-500",
                                    previewDevice === 'desktop' ? 'rounded-none border-none shadow-none w-full h-full' : 'rounded-[2rem] border-8 border-zinc-900'
                                )}
                            >
                                <iframe
                                    key={previewKey}
                                    ref={iframeRef}
                                    srcDoc={srcDoc}
                                    title="preview"
                                    className="w-full h-full border-none"
                                    sandbox="allow-scripts"
                                />
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Debug Console */}
            <AnimatePresence>
                {showLogs && (
                    <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: 200 }}
                        exit={{ height: 0 }}
                        className="bg-[#1A1A1A] border-t border-zinc-800 flex flex-col z-40 shrink-0"
                    >
                        <div className="px-4 py-2 border-b border-zinc-800 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#D4F268]" />
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Debug Console</span>
                            </div>
                            <button onClick={() => setLogs([])} className="text-zinc-500 hover:text-white transition-colors"><RotateCcw size={12} /></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 font-mono text-xs space-y-1.5 no-scrollbar">
                            {logs.map((log, i) => (
                                <div key={i} className={`flex gap-3 ${log.type === 'error' ? 'text-red-400' : log.type === 'warn' ? 'text-yellow-400' : 'text-zinc-300'}`}>
                                    <span className="text-zinc-700 select-none">[{new Date().toLocaleTimeString([], { hour12: false })}]</span>
                                    <span className="flex-1 break-all">{log.message}</span>
                                </div>
                            ))}
                            {logs.length === 0 && <div className="text-zinc-600 italic text-[10px] uppercase tracking-widest">Waiting for output...</div>}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function FileTreeItem({
    node, files, activeTab, setActiveTab, toggleFolder,
    editingId, setEditingId, newItemName, setNewItemName,
    renameFile, deleteFile, isCreating, setIsCreating, addFile
}: any) {
    const children = files.filter((f: any) => f.parentId === node.id);

    return (
        <div className="w-full">
            <div
                className={`group flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === node.id ? "bg-[#D4F268] text-zinc-900 shadow-sm" : "text-zinc-500 hover:bg-zinc-100"}`}
                onClick={() => node.type === 'file' ? setActiveTab(node.id) : toggleFolder(node.id)}
            >
                {node.type === 'folder' ? (
                    node.isExpanded ? <FolderOpen size={14} /> : <Folder size={14} />
                ) : (
                    <FileText size={14} className={node.name.endsWith('.html') ? "text-orange-500" : node.name.endsWith('.css') ? "text-blue-500" : "text-yellow-500"} />
                )}

                {editingId === node.id ? (
                    <input
                        autoFocus
                        className="bg-transparent outline-none w-full border-b border-zinc-900"
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') renameFile(node.id, newItemName);
                            if (e.key === 'Escape') setEditingId(null);
                        }}
                        onBlur={() => setEditingId(null)}
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span className="flex-1 truncate">{node.name}</span>
                )}

                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1">
                    {node.type === 'folder' && (
                        <>
                            <button onClick={(e) => { e.stopPropagation(); setIsCreating({ type: 'file', parentId: node.id }); }} className="p-0.5 hover:bg-zinc-200 rounded text-zinc-400 hover:text-zinc-900"><FilePlus size={12} /></button>
                            <button onClick={(e) => { e.stopPropagation(); setIsCreating({ type: 'folder', parentId: node.id }); }} className="p-0.5 hover:bg-zinc-200 rounded text-zinc-400 hover:text-zinc-900"><FolderPlus size={12} /></button>
                        </>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); setEditingId(node.id); setNewItemName(node.name); }} className="text-zinc-400 hover:text-zinc-900 p-0.5"><Edit2 size={12} /></button>
                    <button onClick={(e) => { e.stopPropagation(); deleteFile(node.id); }} className="text-red-300 hover:text-red-500 p-0.5"><Trash size={12} /></button>
                </div>
            </div>

            {node.type === 'folder' && node.isExpanded && (
                <div className="ml-4 border-l border-zinc-100 pl-1 mt-0.5">
                    {isCreating && isCreating.parentId === node.id && (
                        <div className="mb-1 px-2">
                            <input
                                autoFocus
                                className="bg-white border border-zinc-200 rounded-lg px-2 py-1.5 text-[10px] w-full outline-none shadow-sm font-bold"
                                value={newItemName}
                                onChange={(e) => setNewItemName(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') addFile(isCreating.type, node.id, newItemName);
                                    if (e.key === 'Escape') setIsCreating(null);
                                }}
                                onBlur={() => setIsCreating(null)}
                                placeholder={isCreating.type === 'file' ? "file.html" : "folder..."}
                            />
                        </div>
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
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
