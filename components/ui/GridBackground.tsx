"use client";

export default function GridBackground({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    return (
        <div className={`min-h-[100dvh] w-full bg-[#FAFAF9] relative ${className}`}>
            <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: `
                    linear-gradient(to right, rgba(0,0,0,0.05) 1px, transparent 1px),
                    linear-gradient(to bottom, rgba(0,0,0,0.05) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px'
            }} />
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
