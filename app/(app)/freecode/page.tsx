"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Globe, Clock, Code2, Search, X, Upload, Check, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/utils";
import { createClient } from "@/utils/supabase/client";
import useSWR from "swr";
import { useUser } from "@/context/UserContext";
import { getUserProjects, createProject, updateProjectMeta, deleteProject, FreeCodeProject } from "@/lib/freecode-helpers";

const fetchProjects = async ([_, userId]: [string, string]) => {
    const supabase = createClient();
    return await getUserProjects(supabase, userId);
};

const COLORS = [
    { hex: '#A3E635', label: 'Lime' },
    { hex: '#38BDF8', label: 'Sky' },
    { hex: '#A78BFA', label: 'Violet' },
    { hex: '#FB7185', label: 'Rose' },
    { hex: '#FCD34D', label: 'Amber' },
    { hex: '#2DD4BF', label: 'Teal' },
    { hex: '#FB923C', label: 'Orange' },
    { hex: '#94A3B8', label: 'Slate' },
];

const PRESET_THUMBNAILS = [
    { src: '/thumbnails/waves.svg', label: 'Waves' },
    { src: '/thumbnails/circuit.svg', label: 'Circuit' },
    { src: '/thumbnails/dots.svg', label: 'Dots' },
    { src: '/thumbnails/grid.svg', label: 'Grid' },
    { src: '/thumbnails/mesh.svg', label: 'Mesh' },
    { src: '/thumbnails/triangles.svg', label: 'Triangles' },
    { src: '/thumbnails/stripes.svg', label: 'Stripes' },
    { src: '/thumbnails/hexagons.svg', label: 'Hexagons' },
    { src: '/thumbnails/noise.svg', label: 'Noise' },
    { src: '/thumbnails/code.svg', label: 'Code' },
    { src: '/thumbnails/aurora.svg', label: 'Aurora' },
];

type ModalMode = 'create' | 'edit';

export default function FreeCodeGalleryPage() {
    const { user } = useUser();
    const currentUserId = user?.id || null;
    const supabase = createClient();
    const router = useRouter();
    const { toast } = useToast();

    const [searchQuery, setSearchQuery] = useState("");

    // Shared modal state for both create + edit
    const [modalMode, setModalMode] = useState<ModalMode>('create');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<FreeCodeProject | null>(null);

    // Form fields
    const [formName, setFormName] = useState("");
    const [formColor, setFormColor] = useState('#A3E635');
    const [selectedPreset, setSelectedPreset] = useState<string | null>('/thumbnails/waves.svg');
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
    const [thumbnailTab, setThumbnailTab] = useState<'presets' | 'upload'>('presets');

    const [isSaving, setIsSaving] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState<FreeCodeProject | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data: projects = [], isLoading, mutate } = useSWR(
        currentUserId ? ['freecodeProjects', currentUserId] : null,
        fetchProjects as any
    );

    const filteredProjects = (projects as FreeCodeProject[]).filter((p) =>
        searchQuery ? p.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
    );

    const effectiveThumbnailUrl = thumbnailTab === 'presets' ? selectedPreset : uploadPreviewUrl;

    const resetForm = useCallback(() => {
        setFormName("");
        setFormColor('#A3E635');
        setSelectedPreset('/thumbnails/waves.svg');
        setUploadedFile(null);
        if (uploadPreviewUrl) URL.revokeObjectURL(uploadPreviewUrl);
        setUploadPreviewUrl(null);
        setThumbnailTab('presets');
    }, [uploadPreviewUrl]);

    const openCreateModal = () => {
        setModalMode('create');
        setEditingProject(null);
        resetForm();
        setIsModalOpen(true);
    };

    const openEditModal = (project: FreeCodeProject) => {
        setModalMode('edit');
        setEditingProject(project);
        setFormName(project.name);
        setFormColor(project.color || '#A3E635');

        const existing = project.thumbnail_url;
        if (existing && PRESET_THUMBNAILS.some(p => p.src === existing)) {
            setSelectedPreset(existing);
            setThumbnailTab('presets');
        } else if (existing) {
            setUploadPreviewUrl(existing);
            setSelectedPreset(null);
            setThumbnailTab('upload');
        } else {
            setSelectedPreset(null);
            setThumbnailTab('presets');
        }
        setUploadedFile(null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        if (uploadPreviewUrl && uploadedFile) URL.revokeObjectURL(uploadPreviewUrl);
        setIsModalOpen(false);
        setEditingProject(null);
    };

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast("Please select an image file.", "error");
            return;
        }
        setUploadedFile(file);
        const url = URL.createObjectURL(file);
        setUploadPreviewUrl(url);
        setThumbnailTab('upload');
    }, [toast]);

    const resolveThumbnailUrl = async (): Promise<string | null> => {
        if (thumbnailTab === 'upload' && uploadedFile) {
            const ext = uploadedFile.name.split('.').pop() || 'png';
            const filePath = `${currentUserId}/${Date.now()}.${ext}`;
            const { error: uploadError } = await supabase.storage
                .from('freecode-thumbnails')
                .upload(filePath, uploadedFile, { upsert: true, contentType: uploadedFile.type });

            if (uploadError) {
                toast("Failed to upload thumbnail, continuing without it.", "error");
                return null;
            }
            const { data: urlData } = supabase.storage
                .from('freecode-thumbnails')
                .getPublicUrl(filePath);
            return urlData.publicUrl;
        }
        if (thumbnailTab === 'presets' && selectedPreset) return selectedPreset;
        // upload tab but no new file — keep existing URL
        if (thumbnailTab === 'upload' && uploadPreviewUrl && !uploadedFile) return uploadPreviewUrl;
        return null;
    };

    const handleSave = async () => {
        if (!formName.trim() || !currentUserId) return;
        setIsSaving(true);

        try {
            const thumbnailUrl = await resolveThumbnailUrl();

            if (modalMode === 'create') {
                const project = await createProject(supabase, currentUserId, formName, "", formColor, thumbnailUrl);
                toast(`"${formName}" created!`, "success");
                router.push(`/freecode/${project.id}`);
            } else if (editingProject) {
                await updateProjectMeta(supabase, editingProject.id, {
                    name: formName.trim(),
                    color: formColor,
                    thumbnail_url: thumbnailUrl,
                });
                toast("Project updated!", "success");
                mutate();
                closeModal();
            }
        } catch (err: any) {
            toast(`Failed: ${err.message}`, "error");
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setIsDeleting(true);
        try {
            await deleteProject(supabase, deleteTarget.id);
            toast(`"${deleteTarget.name}" deleted.`, "success");
            mutate();
            setDeleteTarget(null);
        } catch (err: any) {
            toast(`Failed to delete: ${err.message}`, "error");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="p-4 md:p-6 xl:p-8 max-w-7xl mx-auto min-h-screen bg-[#FDFCF8]">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between mb-8 md:mb-12 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-black mb-2 tracking-tight flex items-center gap-2 sm:gap-3">
                        <Code2 className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-lime-500 shrink-0" />
                        <span className="truncate">FreeCode Sandbox</span>
                    </h1>
                    <p className="text-gray-500 font-bold text-sm sm:text-base">
                        {filteredProjects.length} {filteredProjects.length === 1 ? "Project" : "Projects"}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-white rounded-full border border-zinc-200 shadow-sm px-4 h-12 md:h-14 min-w-[180px] md:min-w-[240px]">
                        <Search size={15} className="text-zinc-400 shrink-0" />
                        <input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search projects..."
                            className="bg-transparent outline-none font-bold text-sm flex-1 placeholder:text-zinc-400 text-black"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="text-zinc-400 hover:text-black transition-colors">
                                <X size={14} />
                            </button>
                        )}
                    </div>
                    <Button
                        onClick={openCreateModal}
                        className="bg-primary text-black rounded-full px-5 sm:px-6 md:px-8 h-10 sm:h-12 md:h-14 font-bold shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transition-all text-xs sm:text-sm md:text-base flex items-center whitespace-nowrap"
                    >
                        <Plus size={18} className="mr-1 sm:mr-2" />
                        New
                    </Button>
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="py-24 flex justify-center w-full">
                    <div className="w-12 h-12 rounded-full border-4 border-lime-100 border-t-lime-500 animate-spin" />
                </div>
            ) : (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={searchQuery}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="gap-6 xl:gap-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                    >
                        <motion.button
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.05 }}
                            onClick={openCreateModal}
                            className="rounded-3xl border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-400 hover:text-black hover:border-black hover:bg-black/5 transition-all gap-4 min-h-[220px] group"
                        >
                            <div className="h-14 w-14 rounded-full bg-zinc-100 flex items-center justify-center group-hover:bg-primary group-hover:text-black group-hover:shadow-md transition-all">
                                <Plus size={28} className="group-hover:scale-110 transition-transform" />
                            </div>
                            <span className="font-bold text-lg">New Sandbox</span>
                        </motion.button>

                        {filteredProjects.map((project: FreeCodeProject, i: number) => (
                            <ProjectCard
                                key={project.id}
                                project={project}
                                index={i}
                                onClick={() => router.push(`/freecode/${project.id}`)}
                                onEdit={() => openEditModal(project)}
                                onDelete={() => setDeleteTarget(project)}
                            />
                        ))}
                    </motion.div>
                </AnimatePresence>
            )}

            {/* Create / Edit Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={modalMode === 'create' ? "New Sandbox" : "Edit Project"}
                footer={
                    <div className="flex justify-end gap-2 w-full">
                        <Button variant="outline" onClick={closeModal} className="rounded-xl font-bold flex-1 md:flex-none">Cancel</Button>
                        <Button
                            onClick={handleSave}
                            className="rounded-xl font-bold bg-primary hover:bg-lime-500 text-black flex-1 md:flex-none"
                            disabled={!formName.trim() || isSaving}
                        >
                            {isSaving ? "Saving..." : modalMode === 'create' ? "Create Project" : "Save Changes"}
                        </Button>
                    </div>
                }
            >
                <ProjectForm
                    name={formName}
                    onNameChange={setFormName}
                    color={formColor}
                    onColorChange={setFormColor}
                    selectedPreset={selectedPreset}
                    onPresetSelect={setSelectedPreset}
                    thumbnailTab={thumbnailTab}
                    onThumbnailTabChange={setThumbnailTab}
                    uploadPreviewUrl={uploadPreviewUrl}
                    fileInputRef={fileInputRef}
                    onFileSelect={handleFileSelect}
                    effectiveThumbnailUrl={effectiveThumbnailUrl}
                    onSubmit={handleSave}
                    isCreate={modalMode === 'create'}
                />
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                title="Delete Project"
                footer={
                    <div className="flex justify-end gap-2 w-full">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)} className="rounded-xl font-bold flex-1 md:flex-none">Cancel</Button>
                        <Button
                            onClick={handleDelete}
                            className="rounded-xl font-bold bg-red-500 hover:bg-red-600 text-white flex-1 md:flex-none"
                            disabled={isDeleting}
                        >
                            {isDeleting ? "Deleting..." : "Delete"}
                        </Button>
                    </div>
                }
            >
                <p className="text-sm text-zinc-600">
                    Are you sure you want to delete <span className="font-bold text-black">"{deleteTarget?.name}"</span>? This action cannot be undone.
                </p>
            </Modal>
        </div>
    );
}

// ── Shared form used in both Create and Edit modals ──────────────────────────

interface ProjectFormProps {
    name: string;
    onNameChange: (v: string) => void;
    color: string;
    onColorChange: (v: string) => void;
    selectedPreset: string | null;
    onPresetSelect: (v: string) => void;
    thumbnailTab: 'presets' | 'upload';
    onThumbnailTabChange: (v: 'presets' | 'upload') => void;
    uploadPreviewUrl: string | null;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    effectiveThumbnailUrl: string | null;
    onSubmit: () => void;
    isCreate: boolean;
}

function ProjectForm({
    name, onNameChange, color, onColorChange,
    selectedPreset, onPresetSelect,
    thumbnailTab, onThumbnailTabChange,
    uploadPreviewUrl, fileInputRef, onFileSelect,
    effectiveThumbnailUrl, onSubmit, isCreate,
}: ProjectFormProps) {
    return (
        <div className="space-y-5">
            {/* Live mini-preview */}
            <div
                className="w-full h-28 rounded-2xl overflow-hidden relative border border-zinc-100 shadow-sm"
                style={
                    effectiveThumbnailUrl
                        ? { backgroundImage: `url(${effectiveThumbnailUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                        : { backgroundColor: color + '33' }
                }
            >
                <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: color }} />
                <div className="absolute inset-0 flex items-end p-3">
                    <span className="font-black text-base text-black drop-shadow-sm truncate">
                        {name || 'Project Name'}
                    </span>
                </div>
            </div>

            {/* Name */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Project Name</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => onNameChange(e.target.value)}
                    placeholder="e.g. My Awesome App"
                    className="w-full px-4 py-3 rounded-xl bg-zinc-100 border-transparent focus:bg-white focus:border-black focus:ring-4 focus:ring-black/10 outline-none transition-all font-medium text-black"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
                />
            </div>

            {/* Color Picker */}
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Accent Color</label>
                <div className="flex gap-2.5 flex-wrap">
                    {COLORS.map(({ hex, label }) => (
                        <button
                            key={hex}
                            onClick={() => onColorChange(hex)}
                            title={label}
                            className="w-9 h-9 rounded-full transition-all duration-150 relative"
                            style={{
                                backgroundColor: hex,
                                outline: color === hex ? '3px solid #000' : '3px solid transparent',
                                outlineOffset: '2px',
                                transform: color === hex ? 'scale(1.2)' : 'scale(1)',
                            }}
                        >
                            {color === hex && <Check size={14} className="absolute inset-0 m-auto text-black" />}
                        </button>
                    ))}
                </div>
            </div>

            {/* Thumbnail */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-gray-700">Thumbnail</label>
                    <div className="flex items-center bg-zinc-100 rounded-lg p-0.5 text-xs font-bold">
                        <button
                            onClick={() => onThumbnailTabChange('presets')}
                            className={cn("px-3 py-1.5 rounded-md transition-all", thumbnailTab === 'presets' ? "bg-white shadow-sm text-black" : "text-zinc-500 hover:text-black")}
                        >
                            Presets
                        </button>
                        <button
                            onClick={() => onThumbnailTabChange('upload')}
                            className={cn("px-3 py-1.5 rounded-md transition-all", thumbnailTab === 'upload' ? "bg-white shadow-sm text-black" : "text-zinc-500 hover:text-black")}
                        >
                            Upload
                        </button>
                    </div>
                </div>

                {thumbnailTab === 'presets' && (
                    <div className="grid grid-cols-4 gap-2">
                        {PRESET_THUMBNAILS.map(({ src, label }) => (
                            <button
                                key={src}
                                onClick={() => onPresetSelect(src)}
                                title={label}
                                className={cn(
                                    "rounded-xl overflow-hidden aspect-video border-2 transition-all",
                                    selectedPreset === src ? "border-black shadow-md scale-[1.04]" : "border-zinc-200 hover:border-zinc-400"
                                )}
                            >
                                <img src={src} alt={label} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                )}

                {thumbnailTab === 'upload' && (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-zinc-200 rounded-xl p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-black hover:bg-zinc-50 transition-all"
                    >
                        {uploadPreviewUrl ? (
                            <div className="w-full aspect-video rounded-lg overflow-hidden">
                                <img src={uploadPreviewUrl} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <>
                                <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center">
                                    <Upload size={20} className="text-zinc-400" />
                                </div>
                                <div className="text-center">
                                    <p className="font-bold text-sm text-black">Click to upload</p>
                                    <p className="text-xs text-zinc-400 mt-0.5">PNG, JPG, WEBP</p>
                                </div>
                            </>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            onChange={onFileSelect}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Project Card ──────────────────────────────────────────────────────────────

function ProjectCard({
    project, index, onClick, onEdit, onDelete
}: {
    project: FreeCodeProject;
    index: number;
    onClick: () => void;
    onEdit: () => void;
    onDelete: () => void;
}) {
    const color = project.color || '#A3E635';
    const thumbnailUrl = project.thumbnail_url;
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Close menu when clicking outside
    useEffect(() => {
        if (!menuOpen) return;
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [menuOpen]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: (index + 1) * 0.03, duration: 0.2, ease: "easeOut" }}
            style={{ backfaceVisibility: "hidden" }}
            className="bg-white shadow-sm hover:shadow-xl transition-all border border-zinc-200 group relative cursor-pointer will-change-transform rounded-3xl overflow-hidden flex flex-col min-h-[220px]"
            onClick={onClick}
        >
            {/* Banner */}
            <div
                className="h-24 w-full relative shrink-0"
                style={
                    thumbnailUrl
                        ? { backgroundImage: `url(${thumbnailUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                        : { backgroundColor: color + '33' }
                }
            >
                <div className="absolute bottom-0 left-0 right-0 h-1" style={{ backgroundColor: color }} />
                {project.is_published && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur text-[10px] font-bold text-green-600 border border-green-100 flex items-center gap-1 shadow-sm">
                        <Globe size={10} />
                        Published
                    </div>
                )}

                {/* Context menu button */}
                <div
                    ref={menuRef}
                    className="absolute top-2 right-2"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button
                        onClick={() => setMenuOpen(v => !v)}
                        className="w-8 h-8 rounded-full bg-white/80 backdrop-blur border border-zinc-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
                    >
                        <MoreVertical size={14} className="text-zinc-600" />
                    </button>

                    <AnimatePresence>
                        {menuOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: -4 }}
                                transition={{ duration: 0.1 }}
                                className="absolute right-0 top-9 w-40 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 overflow-hidden"
                            >
                                <button
                                    onClick={() => { setMenuOpen(false); onEdit(); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-bold hover:bg-zinc-50 transition-colors text-black"
                                >
                                    <Pencil size={14} className="text-zinc-500" />
                                    Edit Details
                                </button>
                                <div className="h-px bg-zinc-100 mx-2" />
                                <button
                                    onClick={() => { setMenuOpen(false); onDelete(); }}
                                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm font-bold hover:bg-red-50 transition-colors text-red-500"
                                >
                                    <Trash2 size={14} />
                                    Delete
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex flex-col flex-1">
                <h3 className="font-bold text-lg mb-auto group-hover:text-black transition-colors leading-tight line-clamp-2">{project.name}</h3>
                <div className="flex items-center text-xs font-medium text-zinc-400 gap-1.5 mt-3">
                    <Clock size={11} />
                    <span>{new Date(project.updated_at).toLocaleDateString()}</span>
                </div>
            </div>
        </motion.div>
    );
}
