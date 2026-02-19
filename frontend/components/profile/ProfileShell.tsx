"use client";

import { cn } from "@/lib/utils";

interface ProfileShellProps {
    children: React.ReactNode;
    className?: string;
}

export function ProfileShell({ children, className }: ProfileShellProps) {
    return (
        <div className={cn("min-h-screen bg-gray-50/50 pb-20", className)}>
            <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
                {children}
            </div>
        </div>
    );
}
