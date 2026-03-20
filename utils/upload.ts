/**
 * Universal file upload utility.
 *
 * Priority:
 * 1. Cloudinary (free tier: 25GB storage, 25GB bandwidth/mo) — set via:
 *      NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
 *      NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET  (create an unsigned upload preset in Cloudinary dashboard)
 *
 * 2. Supabase Storage fallback — uses the existing `uploadChatFile` server action.
 *    Free tier: 1GB storage, 2GB bandwidth/mo.
 *
 * Usage (client component):
 *   import { uploadAttachment } from "@/utils/upload";
 *   const url = await uploadAttachment(file);
 */

export async function uploadAttachment(file: File): Promise<string> {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (cloudName && uploadPreset) {
        return uploadToCloudinary(file, cloudName, uploadPreset);
    }

    // Fallback: Supabase Storage via server action
    const { uploadChatFile } = await import("@/actions/chat-actions");
    const formData = new FormData();
    formData.append("file", file);
    const url = await uploadChatFile(formData);
    if (!url) throw new Error("Upload failed");
    return url;
}

async function uploadToCloudinary(
    file: File,
    cloudName: string,
    uploadPreset: string
): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);
    // Use "auto" resource type so Cloudinary accepts images, videos, audio, and raw files
    const endpoint = `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`;

    const res = await fetch(endpoint, { method: "POST", body: formData });
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || "Cloudinary upload failed");
    }
    const data = await res.json();
    return data.secure_url as string;
}
