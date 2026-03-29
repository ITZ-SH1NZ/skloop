import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

/**
 * Resolves a Supabase storage path to a full public URL if it's not already a URL.
 */
export function getAvatarUrl(path: string | null | undefined, bucket: string = "avatars"): string | undefined {
    if (!path) return undefined;
    if (path.startsWith('http') || path.startsWith('data:')) return path;
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    if (!supabaseUrl) return path;
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}
