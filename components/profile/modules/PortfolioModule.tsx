"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, Github, ExternalLink, Image as ImageIcon, Loader2, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/ToastProvider";

interface Project {
    id: string;
    user_id: string;
    title: string;
    description: string;
    thumbnail_url: string | null;
    github_url: string | null;
    website_url: string | null;
    created_at: string;
}

export function PortfolioModule() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    const [newProject, setNewProject] = useState({ 
        title: "", 
        description: "", 
        website_url: "", 
        github_url: "", 
        thumbnail_url: "" 
    });

    const supabase = createClient();
    const { toast } = useToast();

    useEffect(() => {
        const checkUserAndFetchProjects = async () => {
            setIsLoading(true);
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session?.user) {
                setCurrentUserId(session.user.id);
                fetchProjects(session.user.id);
            } else {
                setIsLoading(false);
            }
        };

        checkUserAndFetchProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchProjects = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from("user_projects")
                .select("*")
                .eq("user_id", userId)
                .order("created_at", { ascending: false });

            if (error) throw error;
            setProjects(data || []);
        } catch (error) {
            console.error("Error fetching projects:", error);
            toast("Failed to load projects", "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async () => {
        if (!newProject.title.trim() || !newProject.description.trim()) {
            toast("Title and description are required.", "error");
            return;
        }

        if (!currentUserId) {
            toast("You must be logged in to upload a project.", "error");
            return;
        }

        setIsSubmitting(true);

        try {
            const projectData = {
                user_id: currentUserId,
                title: newProject.title,
                description: newProject.description,
                thumbnail_url: newProject.thumbnail_url || null,
                github_url: newProject.github_url || null,
                website_url: newProject.website_url || null,
            };

            const { data, error } = await supabase
                .from("user_projects")
                .insert([projectData])
                .select();

            if (error) throw error;
            setProjects([data[0], ...projects]);
            setIsUploading(false);
            setNewProject({ title: "", description: "", website_url: "", github_url: "", thumbnail_url: "" });
            toast("Project added to arsenal!", "success");
        } catch (error: any) {
            console.error("Upload error:", error);
            toast(error.message || "Failed to upload project.", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (projectId: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;

        setIsDeleting(projectId);
        try {
            const { error } = await supabase
                .from("user_projects")
                .delete()
                .eq("id", projectId)
                .eq("user_id", currentUserId);

            if (error) throw error;

            setProjects(projects.filter(p => p.id !== projectId));
            toast("Project removed.", "success");
        } catch (error: any) {
            console.error("Delete error:", error);
            toast("Failed to delete project.", "error");
        } finally {
            setIsDeleting(null);
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter">Arsenal <span className="text-lime-500">.</span></h2>
                    <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest mt-1">Logged Projects & Tools</p>
                </div>
                <Button 
                    onClick={() => setIsUploading(true)} 
                    className="bg-lime-400 hover:bg-lime-500 text-black font-black uppercase tracking-wider rounded-xl border-2 border-black shadow-[4px_4px_0_0_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_#000] active:translate-y-0 active:shadow-none transition-all gap-2 h-12 px-6"
                >
                    <Plus size={18} strokeWidth={3} /> Add Loadout
                </Button>
            </div>

            {/* Premium Upload Modal */}
            <AnimatePresence>
                {isUploading && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: "auto", scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.95 }}
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        className="overflow-hidden"
                    >
                        <div className="bg-zinc-900 text-white p-6 md:p-8 rounded-[2rem] border-4 border-black shadow-[8px_8px_0_0_#d4f268] mb-8 relative">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-black text-2xl uppercase tracking-tight flex items-center gap-3">
                                    <div className="w-4 h-4 rounded-full bg-lime-400 animate-pulse border-2 border-black" />
                                    Initialise Project
                                </h3>
                                <button 
                                    onClick={() => setIsUploading(false)} 
                                    className="w-10 h-10 rounded-full bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors border-2 border-transparent hover:border-lime-400 text-zinc-400 hover:text-white"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                            
                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Project Designation *</label>
                                    <Input
                                        placeholder="E.g., Neural Net Visualiser"
                                        value={newProject.title}
                                        onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                                        className="bg-black border-2 border-zinc-800 focus:border-lime-400 rounded-xl h-14 text-white placeholder:text-zinc-600 font-medium"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Mission Briefing *</label>
                                    <Textarea
                                        placeholder="Describe the architecture, tech stack, and what problem this solves..."
                                        value={newProject.description}
                                        onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                        className="bg-black border-2 border-zinc-800 focus:border-lime-400 rounded-xl min-h-[120px] text-white placeholder:text-zinc-600 font-medium resize-none px-4 py-4"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2 shadow-sm">
                                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                            <Github size={14} /> Repository Link
                                        </label>
                                        <Input
                                            placeholder="https://github.com/username/repo"
                                            value={newProject.github_url}
                                            onChange={(e) => setNewProject({ ...newProject, github_url: e.target.value })}
                                            className="bg-black border-2 border-zinc-800 focus:border-lime-400 rounded-xl h-14 text-white placeholder:text-zinc-600 font-mono text-sm"
                                        />
                                    </div>
                                    <div className="space-y-2 shadow-sm">
                                        <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                            <ExternalLink size={14} /> Live Deployment
                                        </label>
                                        <Input
                                            placeholder="https://example.com"
                                            value={newProject.website_url}
                                            onChange={(e) => setNewProject({ ...newProject, website_url: e.target.value })}
                                            className="bg-black border-2 border-zinc-800 focus:border-lime-400 rounded-xl h-14 text-white placeholder:text-zinc-600 font-mono text-sm"
                                        />
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                                        <ImageIcon size={14} /> Thumbnail Image URL
                                    </label>
                                    <div className="flex gap-4 items-center">
                                        <Input
                                            placeholder="https://images.unsplash.com/photo-..."
                                            value={newProject.thumbnail_url}
                                            onChange={(e) => setNewProject({ ...newProject, thumbnail_url: e.target.value })}
                                            className="bg-black border-2 border-zinc-800 focus:border-lime-400 rounded-xl h-14 text-white placeholder:text-zinc-600 font-mono text-sm flex-1"
                                        />
                                        {newProject.thumbnail_url && (
                                            <div className="w-14 h-14 rounded-xl border-2 border-zinc-800 overflow-hidden shrink-0 bg-black">
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img 
                                                    src={newProject.thumbnail_url} 
                                                    alt="Preview" 
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <Button 
                                    onClick={handleUpload} 
                                    disabled={isSubmitting}
                                    className="w-full h-16 bg-lime-400 hover:bg-lime-500 text-black font-black uppercase tracking-widest text-lg rounded-xl border-4 border-black mt-2 shadow-[0_4px_0_0_#000] active:translate-y-1 active:shadow-none transition-all disabled:opacity-70"
                                >
                                    {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <><Save size={20} className="mr-2" /> Commit to Arsenal</>}
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Loading State */}
            {isLoading && (
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-lime-500" />
                </div>
            )}

            {/* Empty State */}
            {!isLoading && projects.length === 0 && !isUploading && (
                <div className="bg-zinc-50 border-4 border-dashed border-zinc-200 rounded-[2rem] py-20 px-6 text-center flex flex-col items-center justify-center">
                    <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                        <ImageIcon size={32} className="text-zinc-300" />
                    </div>
                    <h3 className="font-black text-2xl text-zinc-800 mb-2 uppercase tracking-tight">Arsenal Empty</h3>
                    <p className="font-medium text-zinc-500 max-w-sm mb-8">Your portfolio is currently blank. Deploy your first project to start building your technical reputation.</p>
                    <Button 
                        onClick={() => setIsUploading(true)}
                        variant="outline"
                        className="rounded-xl border-2 border-zinc-300 hover:border-black hover:bg-zinc-100 font-bold px-8 h-12"
                    >
                        Initialise First Project
                    </Button>
                </div>
            )}

            {/* Project Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                <AnimatePresence>
                    {projects.map((project) => (
                        <motion.div
                            key={project.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="group bg-white rounded-[2rem] overflow-hidden border-4 border-black relative transition-all hover:translate-y-[-4px] hover:shadow-[8px_8px_0_0_#000] flex flex-col h-full"
                        >
                            <div className="h-48 md:h-56 overflow-hidden relative border-b-4 border-black bg-zinc-100 shrink-0">
                                {project.thumbnail_url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img 
                                        src={project.thumbnail_url} 
                                        alt={project.title} 
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 group-hover:bg-zinc-800 transition-colors">
                                        <CodeBracketIcon />
                                    </div>
                                )}
                                
                                {currentUserId === project.user_id && (
                                    <button 
                                        onClick={() => handleDelete(project.id)}
                                        disabled={isDeleting === project.id}
                                        className="absolute top-4 right-4 w-10 h-10 bg-red-500 hover:bg-red-600 border-2 border-black rounded-full flex items-center justify-center text-white shadow-[2px_2px_0_0_#000] hover:shadow-[4px_4px_0_0_#000] hover:-translate-y-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
                                    >
                                        {isDeleting === project.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} strokeWidth={2.5} />}
                                    </button>
                                )}
                            </div>
                            
                            <div className="p-6 md:p-8 flex flex-col flex-1 bg-white">
                                <h3 className="font-black text-2xl mb-3 uppercase tracking-tight leading-tight">{project.title}</h3>
                                <p className="text-zinc-600 font-medium mb-8 flex-1 leading-relaxed line-clamp-3">
                                    {project.description}
                                </p>
                                
                                <div className="flex flex-wrap gap-3 mt-auto pt-4 border-t-2 border-zinc-100">
                                    {project.github_url && (
                                        <a href={project.github_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                                            <Button variant="outline" className="w-full rounded-xl border-2 border-black hover:bg-black hover:text-white font-bold h-12 uppercase tracking-wide text-xs">
                                                <Github size={16} className="mr-2" /> Source Code
                                            </Button>
                                        </a>
                                    )}
                                    {project.website_url && (
                                        <a href={project.website_url} target="_blank" rel="noopener noreferrer" className="flex-1">
                                            <Button className="w-full bg-[#E5E5E5] hover:bg-black text-black hover:text-white rounded-xl border-2 border-black font-bold h-12 uppercase tracking-wide text-xs transition-colors">
                                                <ExternalLink size={16} className="mr-2" /> Launch App
                                            </Button>
                                        </a>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}

// Helper SVG for placeholder
function CodeBracketIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-700">
            <polyline points="16 18 22 12 16 6"></polyline>
            <polyline points="8 6 2 12 8 18"></polyline>
        </svg>
    );
}
