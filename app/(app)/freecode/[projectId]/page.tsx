"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Globe, Loader2, Copy, Check, TerminalSquare, Eye, Rocket, Plus } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { getProject, updateProjectFiles, updateProjectName, publishProject, deployToArsenal, FreeCodeProject } from "@/lib/freecode-helpers";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/components/ui/ToastProvider";
import { cn } from "@/lib/utils";

import {
  SandpackProvider,
  SandpackPreview,
  SandpackFileExplorer,
  SandpackConsole,
  useSandpack,
} from "@codesandbox/sandpack-react";
import { MonacoSandpackEditor } from "@/components/freecode/MonacoSandpackEditor";

// Custom control for adding files alongside Sandpack explorer
function FileControls() {
  const { sandpack } = useSandpack();
  const handleAddFile = () => {
    const name = window.prompt("Enter an absolute file path (e.g. /components/Button.js):", "/new-file.js");
    if (name) {
      sandpack.addFile(name, "");
      sandpack.openFile(name);
    }
  };
  return (
    <button onClick={handleAddFile} className="p-1 hover:bg-zinc-200 rounded text-zinc-500 hover:text-black transition-colors" title="Create new file">
      <Plus size={16} />
    </button>
  );
}

// Auto-saving component that lives inside SandpackProvider
function SandpackAutoSaver({ 
  projectId, 
  onSaveStatus 
}: { 
  projectId: string, 
  onSaveStatus: (status: 'saving' | 'saved' | 'idle') => void 
}) {
  const { sandpack } = useSandpack();
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    // Debounce save
    const timeoutId = setTimeout(async () => {
      onSaveStatus('saving');
      try {
        await updateProjectFiles(supabase, projectId, sandpack.files);
        onSaveStatus('saved');
        setTimeout(() => onSaveStatus('idle'), 2000);
      } catch (err: any) {
        toast("Failed to auto-save: " + err.message, "error");
        onSaveStatus('idle');
      }
    }, 1500);

    return () => clearTimeout(timeoutId);
  }, [sandpack.files, projectId, supabase, toast, onSaveStatus]);

  return null;
}

export default function FreeCodeIDEPage() {
  const params = useParams();
  const router = useRouter();
  const { user, profile } = useUser();
  const { toast } = useToast();
  const supabase = createClient();
  
  const projectId = params.projectId as string;
  
  const [project, setProject] = useState<FreeCodeProject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPublishing, setIsPublishing] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'idle'>('idle');
  const [projectName, setProjectName] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  useEffect(() => {
    async function init() {
      if (!projectId) return;
      try {
        const data = await getProject(supabase, projectId);
        
        // Ensure only the owner can edit
        if (data.user_id !== user?.id) {
          router.push('/freecode');
          return;
        }

        setProject(data);
        setProjectName(data.name);
      } catch (err: any) {
        toast("Failed to load project: " + err.message, "error");
        router.push('/freecode');
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, [projectId, user, supabase, router, toast]);

  const handleNameSave = async () => {
    setIsEditingName(false);
    if (projectName.trim() === project?.name || !projectName.trim()) {
      setProjectName(project?.name || "");
      return;
    }
    try {
      setSaveStatus('saving');
      await updateProjectName(supabase, projectId, projectName.trim());
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (err: any) {
      toast("Failed to rename: " + err.message, "error");
      setProjectName(project?.name || "");
      setSaveStatus('idle');
    }
  };

  const handlePublishToggle = async () => {
    if (!project) return;
    setIsPublishing(true);
    try {
      const newState = !project.is_published;
      await publishProject(supabase, projectId, newState);
      setProject({ ...project, is_published: newState });
      
      if (newState) {
        toast("Project published successfully!", "success");
      } else {
        toast("Project unpublished.", "success");
      }
    } catch (err: any) {
      toast("Failed to toggle publish status: " + err.message, "error");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyLink = () => {
    if (!project || !profile?.username) return;
    const url = `${window.location.origin}/${profile.username}/${project.slug}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    toast("Link copied to clipboard!", "success");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDeployToArsenal = async () => {
    if (!project || !user || !profile?.username) return;
    setIsDeploying(true);
    try {
      await deployToArsenal(supabase, projectId, user.id, profile.username);
      toast("Deployed to your Arsenal!", "success");
      // If it wasn't published before, updating the state so the publish button lights up
      if (!project.is_published) {
        setProject({ ...project, is_published: true });
      }
    } catch (err: any) {
      toast("Failed to deploy to Arsenal: " + err.message, "error");
    } finally {
      setIsDeploying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-lime-500" />
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="h-screen w-full bg-[#FDFCF8] flex flex-col text-black overflow-hidden border-l-2 border-zinc-200">
      {/* Top Header */}
      <header className="h-14 border-b-2 border-zinc-200 bg-white/80 backdrop-blur flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.push('/freecode')}
            className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-500 hover:text-black"
          >
            <ArrowLeft size={18} />
          </button>

          {isEditingName ? (
            <input 
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              onBlur={handleNameSave}
              onKeyDown={(e) => e.key === 'Enter' && handleNameSave()}
              autoFocus
              className="bg-zinc-100 text-black px-3 py-1 rounded-md outline-none border-2 border-black font-black"
            />
          ) : (
            <h1 
              onClick={() => setIsEditingName(true)}
              className="font-black text-lg cursor-pointer hover:text-lime-600 transition-colors tracking-tight"
            >
              {projectName}
            </h1>
          )}

          {/* Save Status Indicator */}
          <div className="flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200 ml-4 text-zinc-600">
            {saveStatus === 'saving' && <><Loader2 size={12} className="animate-spin text-lime-500" /> Saving...</>}
            {saveStatus === 'saved' && <><Check size={12} className="text-green-600" /> Saved</>}
            {saveStatus === 'idle' && <><Save size={12} className="text-zinc-500" /> Auto-save</>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {project.is_published && (
            <button 
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-lg bg-zinc-100 hover:bg-zinc-200 transition-colors text-black border border-zinc-200"
            >
              {copiedLink ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
              Copy Link
            </button>
          )}
          
          <button
            onClick={handlePublishToggle}
            disabled={isPublishing}
            className={cn(
              "flex items-center gap-2 px-4 py-1.5 font-bold text-sm transition-all border-2",
              project.is_published 
                ? "bg-white text-green-600 border-green-600 rounded-xl hover:bg-green-50"
                : "bg-lime-400 text-black border-black rounded-xl hover:bg-lime-500 hover:-translate-y-0.5 shadow-[2px_2px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] active:translate-y-0 active:shadow-none"
            )}
          >
            {isPublishing ? <Loader2 size={16} className="animate-spin" /> : <Globe size={16} />}
            {project.is_published ? "Published" : "Publish"}
          </button>

          <button
            onClick={handleDeployToArsenal}
            disabled={isDeploying}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl bg-zinc-900 text-white hover:bg-black transition-colors border-2 border-transparent hover:border-lime-400 hover:-translate-y-0.5 shadow-sm active:translate-y-0"
          >
            {isDeploying ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
            Deploy to Arsenal
          </button>
        </div>
      </header>

      {/* Main IDE Body */}
      <div className="flex-1 overflow-hidden relative">
        <style dangerouslySetInnerHTML={{__html: `
          .sp-wrapper, .sp-layout {
            height: 100% !important;
            min-height: 100% !important;
          }
          .sp-preview, .sp-stack {
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
          }
          .sp-preview-container {
            flex: 1 !important;
            height: 100% !important;
          }
          .sp-preview-iframe {
            height: 100% !important;
            flex: 1 !important;
          }
        `}} />
        {/* Sandpack Provider wraps the entire environment */}
        <SandpackProvider 
          template={project.template as any} 
          theme="light"
          files={Object.keys(project.files).length > 0 ? project.files : undefined}
          options={{
            classes: {
              "sp-layout": "h-full rounded-none border-none bg-white",
              "sp-file-explorer": "bg-white border-r-2 border-zinc-200",
            }
          }}
        >
          {/* Invisible component to hook into Sandpack state for auto-saving */}
          <SandpackAutoSaver projectId={projectId} onSaveStatus={setSaveStatus} />

          <div className="flex h-full w-full">
            {/* Left Sidebar: File Explorer */}
            <div className="w-64 border-r-2 border-zinc-200 shrink-0 hidden md:block bg-zinc-50 flex flex-col">
              <div className="h-10 flex items-center justify-between px-4 border-b-2 border-zinc-200 bg-white">
                <span className="text-xs font-black text-black uppercase tracking-widest">Files</span>
                <FileControls />
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar h-[calc(100%-2.5rem)]">
                <SandpackFileExplorer autoHiddenFiles={true} />
              </div>
            </div>

            {/* Middle: Editor */}
            <div className="flex-1 border-r-2 border-zinc-200 min-w-0 bg-white h-full relative">
              <MonacoSandpackEditor />
            </div>

            {/* Right: Preview & Console */}
            <div className="w-[40%] flex flex-col min-w-0 bg-white">
              {/* Preview/Console Toggle Tabs */}
              <div className="h-10 flex items-center px-2 border-b-2 border-zinc-200 bg-zinc-100 text-sm font-bold gap-1 shrink-0">
                <button 
                  onClick={() => setShowConsole(false)}
                  className={cn("px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors", !showConsole ? "bg-white shadow-sm border border-zinc-200 text-black" : "text-zinc-500 hover:text-black")}
                >
                  <Eye size={14} /> Preview
                </button>
                <button 
                  onClick={() => setShowConsole(true)}
                  className={cn("px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors", showConsole ? "bg-white shadow-sm border border-zinc-200 text-black" : "text-zinc-500 hover:text-black")}
                >
                  <TerminalSquare size={14} /> Terminal
                </button>
              </div>

              {/* Dynamic Right Pane Content */}
              <div className="flex-1 overflow-hidden relative bg-white">
                <div className={cn("absolute inset-0", showConsole ? "invisible" : "visible")}>
                  <SandpackPreview showNavigator={false} showRefreshButton showOpenInCodeSandbox={false} />
                </div>
                <div className={cn("absolute inset-0 bg-[#FDFCF8]", !showConsole ? "invisible" : "visible")}>
                  <SandpackConsole standalone />
                </div>
              </div>
            </div>
          </div>
        </SandpackProvider>
      </div>
    </div>
  );
}
