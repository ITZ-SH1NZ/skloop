"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Globe, Heart, ShieldAlert, ArrowLeft } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getPublishedProjectByUserIdAndSlug, FreeCodeProject } from "@/lib/freecode-helpers";

import {
  SandpackProvider,
  SandpackLayout,
  SandpackPreview,
} from "@codesandbox/sandpack-react";
import { cobalt2 } from "@codesandbox/sandpack-themes";

export default function PublishedProjectPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = createClient();
  
  const handle = params.username as string;
  const slug = params.slug as string;
  
  const [project, setProject] = useState<FreeCodeProject | null>(null);
  const [authorName, setAuthorName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProject() {
      if (!handle || !slug) return;
      try {
        // 1. Resolve handle to user_id via profiles table
        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("id, full_name, username")
          .eq("username", handle)
          .single();

        if (profileErr || !profile) {
          throw new Error("User not found");
        }

        // 2. Fetch the published project for this user_id and slug
        const data = await getPublishedProjectByUserIdAndSlug(supabase, profile.id, slug);
        setProject(data);
        setAuthorName(profile.full_name || profile.username);
      } catch (err: any) {
        setError(err.message || "Project not found or not published.");
      } finally {
        setIsLoading(false);
      }
    }
    loadProject();
  }, [handle, slug, supabase]);

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
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
          className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-700 transition-colors"
        >
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-zinc-950 flex flex-col text-zinc-100 overflow-hidden relative">
      <SandpackProvider 
        template={project.template as any} 
        theme={cobalt2}
        files={project.files}
        options={{
          classes: {
            "sp-layout": "h-full rounded-none border-none bg-zinc-950",
            "sp-preview-container": "h-full bg-white", 
            "sp-preview-iframe": "h-full object-cover",
          }
        }}
      >
        <div className="flex-1 h-full w-full relative">
          <SandpackPreview showNavigator={false} showRefreshButton={false} showOpenInCodeSandbox={false} />
        </div>
      </SandpackProvider>

      {/* Floating Header Overlay (auto hides or positioned absolutely) */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-[100] pointer-events-none">
        {/* Left Side: Brand & Project Name */}
        <div className="flex items-center gap-3 bg-zinc-950/80 backdrop-blur border border-zinc-800 p-2 pr-5 rounded-full shadow-2xl pointer-events-auto">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
             <Globe className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="font-bold text-sm leading-tight text-white line-clamp-1">{project.name}</h1>
            <p className="text-[10px] font-medium text-zinc-400 flex items-center gap-1">
              by <span className="text-blue-400 hover:underline cursor-pointer">@{handle}</span>
            </p>
          </div>
        </div>

        {/* Right Side: Actions */}
        <div className="flex items-center gap-2 pointer-events-auto">
           <button className="h-12 px-4 bg-zinc-950/80 backdrop-blur border border-zinc-800 rounded-full flex items-center gap-2 hover:bg-zinc-800 transition-colors shadow-2xl">
             <Heart size={16} className="text-zinc-400" />
             <span className="text-sm font-bold text-zinc-200">Like</span>
           </button>
           <button 
              onClick={() => router.push('/freecode')}
              className="w-12 h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-900/40 transition-all border border-blue-500"
            >
             <ArrowLeft size={18} />
           </button>
        </div>
      </div>
    </div>
  );
}
