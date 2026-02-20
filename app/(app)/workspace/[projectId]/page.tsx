"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, MoreVertical, Calendar, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/ToastProvider";
import { createClient } from "@/utils/supabase/client";

export default function WorkspaceProjectBoard() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.projectId as string;
    const supabase = createClient();
    const { toast } = useToast();

    const [project, setProject] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal state for new task
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState("");
    const [newTaskDesc, setNewTaskDesc] = useState("");

    const fetchProjectAndTasks = async () => {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            router.push('/login');
            return;
        }

        // Fetch Project Details
        const { data: projectData, error: projectError } = await supabase
            .from('projects')
            .select('*')
            .eq('id', projectId)
            .single();

        if (projectError) {
            toast("Project not found or access denied.", "error");
            router.push('/workspace');
            return;
        }
        setProject(projectData);

        // Fetch Tasks linked to this project
        const { data: tasksData, error: tasksError } = await supabase
            .from('project_tasks')
            .select('*')
            .eq('project_id', projectId)
            .order('created_at', { ascending: true });

        if (!tasksError && tasksData) {
            setTasks(tasksData);
        }

        setIsLoading(false);
    };

    useEffect(() => {
        if (projectId) {
            fetchProjectAndTasks();
        }
    }, [projectId, supabase]);

    const handleCreateTask = async () => {
        if (!newTaskTitle.trim()) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: insertedTask, error } = await supabase
            .from('project_tasks')
            .insert([{
                project_id: projectId,
                title: newTaskTitle,
                description: newTaskDesc,
                status: 'todo',
                assigned_to: user.id
            }])
            .select()
            .single();

        if (error) {
            toast(`Error creating task: ${error.message}`, "error");
        } else if (insertedTask) {
            setTasks([...tasks, insertedTask]);
            toast("Task created successfully.", "success");
            setIsTaskModalOpen(false);
            setNewTaskTitle("");
            setNewTaskDesc("");
        }
    };

    const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
        const { error } = await supabase
            .from('project_tasks')
            .update({ status: newStatus })
            .eq('id', taskId);

        if (error) {
            toast(`Failed to move task: ${error.message}`, "error");
        } else {
            setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
        }
    };

    // Columns structure based on Supabase constraint
    const COLUMNS = [
        { id: 'todo', title: 'To Do', color: 'border-slate-200 bg-slate-50' },
        { id: 'in_progress', title: 'In Progress', color: 'border-blue-200 bg-blue-50' },
        { id: 'review', title: 'Review', color: 'border-amber-200 bg-amber-50' },
        { id: 'done', title: 'Done', color: 'border-emerald-200 bg-emerald-50' },
    ];

    if (isLoading) {
        return (
            <div className="py-24 flex justify-center w-full min-h-screen items-center">
                <div className="w-12 h-12 rounded-full border-4 border-slate-200 border-t-slate-800 animate-spin"></div>
            </div>
        );
    }

    if (!project) return null;

    return (
        <div className="p-4 md:p-6 xl:p-8 max-w-screen-2xl mx-auto min-h-screen flex flex-col">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/workspace')}
                        className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h1 className="text-2xl md:text-3xl font-black">{project.title}</h1>
                            <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                                {project.status}
                            </span>
                        </div>
                        <p className="text-slate-500 font-medium text-sm">{project.description}</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => setIsTaskModalOpen(true)}
                        className="bg-black text-white hover:bg-slate-800 rounded-full px-6 font-bold flex items-center shadow-lg"
                    >
                        <Plus size={18} className="mr-2" /> New Task
                    </Button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 overflow-x-auto pb-8">
                {COLUMNS.map(col => {
                    const columnTasks = tasks.filter(t => t.status === col.id);
                    return (
                        <div key={col.id} className="flex flex-col min-w-[300px]">
                            <div className="flex items-center justify-between mb-4 px-1">
                                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                    {col.title}
                                    <span className="w-5 h-5 rounded bg-slate-200 text-slate-600 text-xs flex items-center justify-center font-bold">
                                        {columnTasks.length}
                                    </span>
                                </h3>
                            </div>

                            <div className={`flex-1 rounded-3xl p-4 border ${col.color} flex flex-col gap-3 min-h-[500px]`}>
                                <AnimatePresence>
                                    {columnTasks.map(task => (
                                        <motion.div
                                            key={task.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative cursor-grab active:cursor-grabbing"
                                        >
                                            <div className="flex justify-between items-start mb-2">
                                                <h4 className="font-bold text-slate-800 leading-tight pr-6">{task.title}</h4>
                                                <button className="text-slate-400 hover:text-slate-800 transition-colors">
                                                    <MoreVertical size={16} />
                                                </button>
                                            </div>
                                            {task.description && (
                                                <p className="text-xs text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                                                    {task.description}
                                                </p>
                                            )}

                                            <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                                                {/* Status advance button (Simple simulation of drag) */}
                                                <div className="flex gap-1">
                                                    {col.id !== 'todo' && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleUpdateTaskStatus(task.id, COLUMNS[COLUMNS.findIndex(c => c.id === col.id) - 1].id); }}
                                                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold rounded-lg transition-colors"
                                                        >
                                                            ← Move
                                                        </button>
                                                    )}
                                                    {col.id !== 'done' && (
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleUpdateTaskStatus(task.id, COLUMNS[COLUMNS.findIndex(c => c.id === col.id) + 1].id); }}
                                                            className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold rounded-lg transition-colors"
                                                        >
                                                            Move →
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex -space-x-2">
                                                    {/* Assigned User Placeholder */}
                                                    <div className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-white flex items-center justify-center text-[10px] font-bold text-white">
                                                        U
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                {columnTasks.length === 0 && (
                                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 opacity-60 pointer-events-none">
                                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 mb-2 flex items-center justify-center">
                                            <CheckCircle2 size={20} className="text-slate-300" />
                                        </div>
                                        <p className="text-xs font-bold uppercase tracking-wider">Empty</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Task Creation Modal */}
            <Modal
                isOpen={isTaskModalOpen}
                onClose={() => setIsTaskModalOpen(false)}
                title="Create New Task"
                footer={
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsTaskModalOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                        <Button onClick={handleCreateTask} className="rounded-xl font-bold bg-black text-white" disabled={!newTaskTitle.trim()}>Create Board Task</Button>
                    </div>
                }
            >
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Task Title <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={newTaskTitle}
                            onChange={(e) => setNewTaskTitle(e.target.value)}
                            placeholder="e.g. Design Login Flow"
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 ring-black outline-none transition-all font-medium"
                            autoFocus
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                        <textarea
                            value={newTaskDesc}
                            onChange={(e) => setNewTaskDesc(e.target.value)}
                            placeholder="Details about what needs to be done..."
                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:ring-2 ring-black outline-none transition-all font-medium min-h-[120px] resize-none"
                        />
                    </div>
                </div>
            </Modal>
        </div>
    );
}
