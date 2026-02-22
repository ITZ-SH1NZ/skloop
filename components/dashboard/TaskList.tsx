"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, MoreVertical, Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/components/ui/Button";
import { useToast } from "@/components/ui/ToastProvider";

interface Task {
    id: string;
    title: string;
    tag: string;
    priority: "High" | "Low";
    completed: boolean;
}

export function TaskList() {
    const { toast } = useToast();
    const [tasks, setTasks] = useState<Task[]>([
        { id: "1", title: "Create a digital logo for a business", tag: "#LogoDesign", priority: "Low", completed: false },
        { id: "2", title: "Design a packaging concept", tag: "#Packaging", priority: "High", completed: false }
    ]);

    const toggleTask = (id: string) => {
        setTasks(prev => {
            const updated = prev.map(t => {
                if (t.id === id) {
                    const newState = !t.completed;
                    if (newState) toast("Task completed! 🎉", "success");
                    return { ...t, completed: newState };
                }
                return t;
            });
            // Sort: incomplete first, completed last
            return [...updated].sort((a, b) => Number(a.completed) - Number(b.completed));
        });
    };

    const addTask = () => {
        const newTask: Task = {
            id: Date.now().toString(),
            title: "New Design Task",
            tag: "#General",
            priority: "Low",
            completed: false
        };
        setTasks(prev => [newTask, ...prev]);
        toast("New task added", "info");
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-black flex items-center gap-2">
                    To do list <span className="text-2xl animate-bounce">✨</span>
                </h2>
                <div className="flex gap-2">
                    <button onClick={addTask} className="text-gray-300 hover:text-black transition-colors bg-white w-8 h-8 rounded-full flex items-center justify-center shadow-sm hover:shadow-md">
                        <Plus size={16} />
                    </button>
                    <button className="text-gray-300 hover:text-black transition-colors"><MoreVertical size={20} /></button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                    {tasks.map((task) => (
                        <motion.div
                            key={task.id}
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ y: -3 }}
                            onClick={() => toggleTask(task.id)}
                            className={cn(
                                "p-6 rounded-[2.5rem] relative group cursor-pointer transition-all min-h-[220px] flex flex-col justify-between",
                                task.completed
                                    ? "bg-gray-50 opacity-50 shadow-none border border-dashed border-gray-200"
                                    : task.priority === "High" ? "bg-white text-gray-800 shadow-float" : "bg-black text-white shadow-float"
                            )}
                        >
                            <div className="flex justify-between items-start">
                                <div className={cn("text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider",
                                    task.completed
                                        ? "bg-gray-200 text-gray-500"
                                        : task.priority === "High" ? "bg-orange-100 text-orange-600" : "bg-white/20 text-white"
                                )}>
                                    {task.priority} Priority
                                </div>
                                <div className={cn("h-10 w-10 rounded-full flex items-center justify-center transition-all",
                                    task.completed
                                        ? "bg-green-100 text-green-600"
                                        : task.priority === "High" ? "bg-gray-100 hover:bg-primary hover:text-black" : "bg-white/10 hover:bg-primary hover:text-black"
                                )}>
                                    {task.completed ? <CheckCircle size={18} /> : (
                                        <div className={cn("h-4 w-4 rounded-full border-2", task.priority === "High" ? "border-gray-300" : "border-white/50")} />
                                    )}
                                </div>
                            </div>
                            <div>
                                <h3 className={cn("font-bold text-xl leading-snug mb-2 transition-all", task.completed ? "line-through" : "")}>{task.title}</h3>
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400 font-mono">{task.tag}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}
