"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Globe, Heart, ShieldAlert, ArrowLeft, Smartphone, Tablet, Laptop, Maximize2 } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getPublishedProjectByUserIdAndSlug, FreeCodeProject, FileNode, toggleLikeProject, getProjectLikeStatus } from "@/lib/freecode-helpers";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/ui/ToastProvider";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

function buildSrcDoc(files: FileNode[]): string {
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

  let indexFile = files.find(f => f.name === 'index.html' && !f.parentId);
  if (!indexFile) indexFile = files.find(f => f.name === 'index.html');
  if (!indexFile) indexFile = files.find(f => f.name.endsWith('.html'));
  if (!indexFile) return '<html><body><p>No index.html found.</p></body></html>';

  let html = indexFile.content || '';
  const htmlLower = html.trim().toLowerCase();
  const isFullHtml = htmlLower.startsWith('<!doctype') || htmlLower.startsWith('<html');

  const pathMap: Record<string, string> = {};
  const fuzzyMap: Record<string, string> = {};
  files.forEach(f => {
    if (f.type === 'file') {
      const fullPath = getFullPath(f, files);
      pathMap[fullPath] = f.content || '';
      fuzzyMap[f.name] = f.content || '';
    }
  });

  const entryPath = getFullPath(indexFile, files);
  const entryDir = getDir(entryPath);

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
          const fileName = rawHref.split('/').pop() || '';
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
          const fileName = rawSrc.split('/').pop() || '';
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

  if (!isFullHtml) {
    finalHtml = `<!DOCTYPE html><html><head></head><body>${finalHtml}</body></html>`;
  }

  return finalHtml;
}

export default function PublishedProjectPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const { toast } = useToast();
  const supabase = createClient();

  const handle = params.username as string;
  const slug = params.slug as string;

  const [project, setProject] = useState<FreeCodeProject | null>(null);
  const [srcDoc, setSrcDoc] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<"mobile" | "tablet" | "laptop" | "full">("full");

  useEffect(() => {
    async function loadProject() {
      if (!handle || !slug) return;
      try {
        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("id, full_name, username")
          .eq("username", handle)
          .single();

        if (profileErr || !profile) throw new Error("User not found");

        const data = await getPublishedProjectByUserIdAndSlug(supabase, profile.id, slug);
        setProject(data);
        setAuthorName(profile.full_name || profile.username);
        setLikesCount(data.likes_count || 0);

        const files = Array.isArray(data.files) ? data.files as FileNode[] : [];
        setSrcDoc(buildSrcDoc(files));

        // Get like status
        if (user) {
          const liked = await getProjectLikeStatus(supabase, data.id, user.id);
          setIsLiked(liked);
        }
      } catch (err: any) {
        setError(err.message || "Project not found or not published.");
      } finally {
        setIsLoading(false);
      }
    }
    loadProject();
  }, [handle, slug, user]);

  const handleToggleLike = async () => {
    if (!user) {
      toast("Please sign in to like projects", "error");
      return;
    }
    if (!project || isLiking) return;

    setIsLiking(true);
    try {
      const { liked, count } = await toggleLikeProject(supabase, project.id, user.id);
      setIsLiked(liked);
      setLikesCount(count);
    } catch (err: any) {
      toast("Failed to update like status", "error");
    } finally {
      setIsLiking(false);
    }
  };
  if (isLoading) {
    return (
      <div className="h-screen w-full bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-lime-400" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="h-screen w-full bg-zinc-950 flex flex-col items-center justify-center text-center px-4">
        <ShieldAlert className="w-16 h-16 text-zinc-700 mb-6" />
        <h1 className="text-2xl font-bold text-zinc-100 mb-2">Project Unavailable</h1>
        <p className="text-zinc-500 mb-8 max-w-sm">
          {error || "This project doesn't exist or hasn't been published by the author."}
        </p>
        <button
          onClick={() => router.push('/')}
          className="bg-lime-400 text-black px-6 py-2.5 rounded-full font-bold hover:bg-lime-500 transition-colors"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-[#050505] flex flex-col overflow-hidden relative font-sans">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-lime-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      {/* Main Preview Area */}
      <div className="flex-1 flex items-center justify-center p-4 md:p-8 z-10 transition-all duration-500">
        <motion.div
          layout
          initial={false}
          animate={{
            width: previewDevice === 'mobile' ? 375 : previewDevice === 'tablet' ? 768 : previewDevice === 'laptop' ? 1024 : '100%',
            height: previewDevice === 'full' ? '100%' : previewDevice === 'mobile' ? 667 : '80%',
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={cn(
            "bg-white overflow-hidden relative shadow-2xl transition-all duration-500",
            previewDevice !== 'full' ? "rounded-[2.5rem] border-[12px] border-zinc-900 shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_40px_100px_-20px_rgba(0,0,0,0.8)]" : "w-full h-full rounded-none"
          )}
        >
          {previewDevice !== 'full' && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-zinc-900 rounded-b-2xl z-50 flex items-center justify-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              <div className="w-8 h-1 rounded-full bg-zinc-800" />
            </div>
          )}
          <iframe
            srcDoc={srcDoc}
            title={project.name}
            className="w-full h-full border-none bg-white"
            sandbox="allow-scripts"
          />
        </motion.div>
      </div>

      {/* Floating Header Overlay */}
      <div className="absolute top-6 left-6 right-6 flex items-start justify-between z-[100] pointer-events-none">
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-4 bg-zinc-950/40 backdrop-blur-xl border border-white/10 p-2 pr-6 rounded-full shadow-2xl pointer-events-auto group"
        >
           <button 
             onClick={() => router.push('/freecode')}
             className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center hover:bg-zinc-800 transition-all active:scale-95"
           >
            <ArrowLeft size={18} className="text-white" />
          </button>
          <div className="flex flex-col">
            <h1 className="font-bold text-sm text-white tracking-tight">{project.name}</h1>
            <p className="text-[10px] font-medium text-zinc-400">
              by <span className="text-lime-400 hover:underline cursor-pointer">@{handle}</span>
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center gap-2 pointer-events-auto"
        >
          {/* Device Toggles */}
          <div className="hidden md:flex items-center bg-zinc-950/40 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl shadow-2xl">
            <button onClick={() => setPreviewDevice("full")} className={cn("p-2 rounded-xl transition-all", previewDevice === 'full' ? "bg-white text-black shadow-lg" : "text-zinc-400 hover:text-white")} title="Fullscreen"><Maximize2 size={16} /></button>
            <button onClick={() => setPreviewDevice("laptop")} className={cn("p-2 rounded-xl transition-all", previewDevice === 'laptop' ? "bg-white text-black shadow-lg" : "text-zinc-400 hover:text-white")} title="Laptop"><Laptop size={16} /></button>
            <button onClick={() => setPreviewDevice("tablet")} className={cn("p-2 rounded-xl transition-all", previewDevice === 'tablet' ? "bg-white text-black shadow-lg" : "text-zinc-400 hover:text-white")} title="Tablet"><Tablet size={16} /></button>
            <button onClick={() => setPreviewDevice("mobile")} className={cn("p-2 rounded-xl transition-all", previewDevice === 'mobile' ? "bg-white text-black shadow-lg" : "text-zinc-400 hover:text-white")} title="Mobile"><Smartphone size={16} /></button>
          </div>

          <button 
            onClick={handleToggleLike}
            disabled={isLiking}
            className={cn(
                "h-12 px-6 flex items-center gap-2.5 rounded-full shadow-2xl transition-all active:scale-95 border",
                isLiked 
                    ? "bg-rose-500 border-rose-400 text-white" 
                    : "bg-zinc-950/40 backdrop-blur-xl border-white/10 text-white hover:bg-zinc-900"
            )}
          >
            <Heart size={18} className={cn("transition-transform", isLiked ? "fill-current scale-110" : "text-rose-400", isLiking && "animate-pulse")} />
            <span className="text-sm font-bold">{likesCount > 0 ? likesCount : "Like"}</span>
          </button>
        </motion.div>
      </div>
      
      {/* Bottom Info Bar (Mobile Only or Subtle) */}
      <div className="md:hidden absolute bottom-6 left-6 right-6 z-50 flex justify-center">
         <div className="flex items-center bg-zinc-950/40 backdrop-blur-xl border border-white/10 p-1.5 rounded-2xl shadow-2xl">
            <button onClick={() => setPreviewDevice("full")} className={cn("p-2 rounded-xl transition-all", previewDevice === 'full' ? "bg-white text-black shadow-lg" : "text-zinc-400 hover:text-white")}><Maximize2 size={16} /></button>
            <button onClick={() => setPreviewDevice("mobile")} className={cn("p-2 rounded-xl transition-all", previewDevice === 'mobile' ? "bg-white text-black shadow-lg" : "text-zinc-400 hover:text-white")}><Smartphone size={16} /></button>
          </div>
      </div>
    </div>
  );
}
