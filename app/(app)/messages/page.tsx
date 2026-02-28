"use client";

import { Suspense } from "react";
import Chat from "@/app/(app)/peer/chat/page";

// Re-export the fully-functional peer chat page as the main messages page.
// The actual ChatWindow + sidebar logic with Supabase is implemented there.
export default function MessagesPage() {
    return (
        <Suspense fallback={
            <div className="flex-1 flex items-center justify-center h-full">
                <div className="w-8 h-8 rounded-full border-4 border-zinc-200 border-t-zinc-700 animate-spin" />
            </div>
        }>
            <Chat />
        </Suspense>
    );
}
