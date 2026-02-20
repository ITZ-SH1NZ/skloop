"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Upload, X, Github, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { cn } from "@/lib/utils";

interface Project {
    id: number;
    title: string;
    desc: string;
    image: string;
    rarity: string;
    border: string;
    github?: string;
    link?: string;
}

// TODO: Fetch projects from backend
const INITIAL_PROJECTS: Project[] = [];

export function PortfolioModule() {
    const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
    const [isUploading, setIsUploading] = useState(false);
    const [newProject, setNewProject] = useState({ title: "", desc: "", link: "", github: "" });

    const handleUpload = () => {
        if (!newProject.title) return;
        const project = {
            id: Date.now(),
            title: newProject.title,
            desc: newProject.desc,
            image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80", // placeholder
            rarity: "common",
            border: "border-gray-200",
            github: newProject.github,
            link: newProject.link
        };
        setProjects([project, ...projects]);
        setIsUploading(false);
        setNewProject({ title: "", desc: "", link: "", github: "" });
    };

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">My Projects</h2>
                <Button onClick={() => setIsUploading(true)} className="gap-2">
                    <Plus size={16} /> Upload Project
                </Button>
            </div>

            {/* Upload Modal (Inline for now) */}
            {isUploading && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-6 rounded-2xl border border-dashed border-primary/50 shadow-sm space-y-4"
                >
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-bold">Upload New Project</h3>
                        <Button variant="ghost" size="icon" onClick={() => setIsUploading(false)}><X size={18} /></Button>
                    </div>
                    <div className="grid gap-4">
                        <Input
                            placeholder="Project Title"
                            value={newProject.title}
                            onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                        />
                        <Textarea
                            placeholder="Description"
                            value={newProject.desc}
                            onChange={(e) => setNewProject({ ...newProject, desc: e.target.value })}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                placeholder="GitHub Repo (Optional)"
                                value={newProject.github}
                                onChange={(e) => setNewProject({ ...newProject, github: e.target.value })}
                            />
                            <Input
                                placeholder="Live Demo (Optional)"
                                value={newProject.link}
                                onChange={(e) => setNewProject({ ...newProject, link: e.target.value })}
                            />
                        </div>
                        <div className="h-32 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 cursor-pointer hover:bg-gray-100 transition-colors">
                            <Upload size={24} className="mb-2" />
                            <span className="text-sm font-medium">Click to upload thumbnail</span>
                        </div>
                        <Button onClick={handleUpload} className="w-full">Publish Project</Button>
                    </div>
                </motion.div>
            )}

            {/* Project Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <motion.div
                        key={project.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={cn(
                            "group bg-white rounded-2xl overflow-hidden border-2 transition-all hover:scale-[1.02] hover:shadow-lg",
                            project.border
                        )}
                    >
                        <div className="h-48 overflow-hidden relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={project.image} alt={project.title} className="w-full h-full object-cover" />
                            {/* Rarity Badge */}
                            <div className={cn(
                                "absolute top-2 right-2 px-2 py-1 text-[10px] font-black uppercase tracking-wider rounded border bg-white/90 backdrop-blur-sm",
                                project.rarity === "legendary" ? "text-amber-500 border-amber-500" :
                                    project.rarity === "rare" ? "text-blue-500 border-blue-500" :
                                        "text-gray-500 border-gray-400"
                            )}>
                                {project.rarity}
                            </div>
                        </div>
                        <div className="p-5">
                            <h3 className="font-bold text-lg mb-1">{project.title}</h3>
                            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{project.desc}</p>
                            <div className="flex gap-2">
                                {project.github && (
                                    <Button size="sm" variant="outline" className="flex-1 text-xs h-8" onClick={() => window.open(project.github, '_blank')}>
                                        <Github size={12} className="mr-1" /> Repo
                                    </Button>
                                )}
                                {project.link && (
                                    <Button size="sm" variant="secondary" className="flex-1 text-xs h-8" onClick={() => window.open(project.link, '_blank')}>
                                        <ExternalLink size={12} className="mr-1" /> Demo
                                    </Button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
