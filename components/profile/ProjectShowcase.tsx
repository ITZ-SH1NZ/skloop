"use client";

import { motion } from "framer-motion";
import { ExternalLink, Github } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface Project {
    title: string;
    desc: string;
    tags: string[];
    color: string;
    image: string;
}

// TODO: Fetch projects from backend
const projects: Project[] = [];

export function ProjectShowcase() {
    return (
        <div className="container mx-auto">
            <div className="text-center mb-16">
                <h2 className="text-4xl font-black tracking-tight mb-4">Featured Projects</h2>
                <p className="text-xl text-muted-foreground">What I&apos;ve been building lately.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map((project, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="group relative bg-white rounded-[2rem] overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300"
                    >
                        {/* Image with Overlay */}
                        <div className="h-48 overflow-hidden relative">
                            <div className={`absolute inset-0 bg-gradient-to-br ${project.color} opacity-0 group-hover:opacity-20 transition-opacity z-10`} />
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={project.image}
                                alt={`Screenshot of ${project.title}`}
                                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                            />
                        </div>

                        <div className="p-6 md:p-8">
                            <div className="flex gap-2 mb-4 flex-wrap">
                                {project.tags.map(tag => (
                                    <span key={tag} className="text-xs font-bold px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                            <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">{project.title}</h3>
                            <p className="text-muted-foreground mb-6 line-clamp-2">{project.desc}</p>

                            <div className="flex gap-3">
                                <Button size="sm" variant="outline" className="flex-1 gap-2 rounded-xl">
                                    <Github size={16} /> Code
                                </Button>
                                <Button size="sm" className="flex-1 gap-2 rounded-xl">
                                    <ExternalLink size={16} /> Live Demo
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
