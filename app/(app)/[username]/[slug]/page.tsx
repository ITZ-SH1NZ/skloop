"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Globe, Heart, ShieldAlert, ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getPublishedProjectByUserIdAndSlug, FreeCodeProject, FileNode } from "@/lib/freecode-helpers";

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
  const supabase = createClient();

  const handle = params.username as string;
  const slug = params.slug as string;

  const [project, setProject] = useState<FreeCodeProject | null>(null);
  const [srcDoc, setSrcDoc] = useState("");
  const [, setAuthorName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        const files = Array.isArray(data.files) ? data.files as FileNode[] : [];
        setSrcDoc(buildSrcDoc(files));
      } catch (err: any) {
        setError(err.message || "Project not found or not published.");
      } finally {
        setIsLoading(false);
      }
    }
    loadProject();
  }, [handle, slug]);

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
    <div className="h-[100dvh] w-full bg-zinc-950 flex flex-col overflow-hidden relative">
      <iframe
        srcDoc={srcDoc}
        title={project.name}
        className="flex-1 w-full border-none bg-white"
        sandbox="allow-scripts"
      />

      {/* Floating Header Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-[100] pointer-events-none">
        <div className="flex items-center gap-3 bg-zinc-950/80 backdrop-blur border border-zinc-800 p-2 pr-5 rounded-full shadow-2xl pointer-events-auto">
          <div className="w-10 h-10 rounded-full bg-lime-400/20 border border-lime-400/30 flex items-center justify-center shrink-0">
            <Globe className="w-5 h-5 text-lime-400" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight text-white line-clamp-1">{project.name}</h1>
            <p className="text-[10px] font-medium text-zinc-400">
              by <span className="text-lime-400 hover:underline cursor-pointer">@{handle}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button className="h-12 px-4 bg-zinc-950/80 backdrop-blur border border-zinc-800 rounded-full flex items-center gap-2 hover:bg-zinc-800 transition-colors shadow-2xl">
            <Heart size={16} className="text-zinc-400" />
            <span className="text-sm font-bold text-zinc-200">Like</span>
          </button>
          <button
            onClick={() => router.push('/freecode')}
            className="w-12 h-12 bg-lime-400 hover:bg-lime-500 text-black rounded-full flex items-center justify-center shadow-lg transition-all"
          >
            <ArrowLeft size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
