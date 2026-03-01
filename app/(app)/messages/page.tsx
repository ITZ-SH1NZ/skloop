"use client";

// Re-exports the peer chat page as the main messages route.
// ChatPage handles its own Suspense boundary for useSearchParams internally.
export { default } from "@/app/(app)/peer/chat/page";
