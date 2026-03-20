/**
 * Universal file upload utility.
 *
 * Routing:
 *   video/*        → Mux (adaptive HLS streaming) — env: MUX_TOKEN_ID, MUX_TOKEN_SECRET
 *   image/*        → Cloudinary (if configured)   — env: NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
 *   everything else → Supabase Storage
 *
 * All paths fall back to Supabase if the primary service fails or is not configured.
 */

export async function uploadAttachment(file: File): Promise<string> {
    // Videos → Mux
    if (file.type.startsWith('video/')) {
        try {
            return await uploadVideoToMux(file);
        } catch (err) {
            console.warn("[Upload] Mux failed, falling back to Supabase:", err);
            return uploadToSupabase(file);
        }
    }

    // Images → Cloudinary
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    if (file.type.startsWith('image/') && cloudName && uploadPreset) {
        try {
            return await uploadToCloudinary(file, cloudName, uploadPreset);
        } catch (err) {
            console.warn("[Upload] Cloudinary failed, falling back to Supabase:", err);
        }
    }

    // Audio, docs, everything else → Supabase
    return uploadToSupabase(file);
}

// ─── Mux ─────────────────────────────────────────────────────────────────────

async function uploadVideoToMux(file: File): Promise<string> {
    // 1. Get a direct upload URL from our server
    const res = await fetch("/api/mux-upload", { method: "POST" });
    if (!res.ok) throw new Error("Failed to create Mux upload");
    const { uploadUrl, uploadId } = await res.json();

    // 2. PUT the file directly to Mux (bypasses our server)
    const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
    });
    if (!uploadRes.ok) throw new Error("Failed to upload file to Mux");

    // 3. Poll for the playback ID (Mux processes async, usually 5–20s for short videos)
    for (let attempt = 0; attempt < 20; attempt++) {
        await new Promise(r => setTimeout(r, 3000));
        const statusRes = await fetch(`/api/mux-upload?uploadId=${uploadId}`);
        if (!statusRes.ok) continue;
        const { status, playbackId } = await statusRes.json();
        if (playbackId) return `https://stream.mux.com/${playbackId}`;
        if (status === 'errored') throw new Error("Mux processing failed");
    }

    throw new Error("Mux upload timed out after 60s");
}

// ─── Cloudinary ───────────────────────────────────────────────────────────────

async function uploadToCloudinary(file: File, cloudName: string, uploadPreset: string): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

    const res = await fetch(endpoint, { method: "POST", body: formData });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || "Cloudinary upload failed");
    }
    const data = await res.json();
    return data.secure_url as string;
}

// ─── Supabase Storage ─────────────────────────────────────────────────────────

async function uploadToSupabase(file: File): Promise<string> {
    const { uploadChatFile } = await import("@/actions/chat-actions");
    const formData = new FormData();
    formData.append("file", file);
    const url = await uploadChatFile(formData);
    if (!url) throw new Error("Supabase upload failed");
    return url;
}
