import { ChatSidebar } from "@/components/loopy/ChatSidebar";

export default function LoopyChatLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 flex h-[100dvh] w-full bg-[#FAFAF8] font-sans overflow-hidden z-50">
            <ChatSidebar />
            <main className="flex-1 min-w-0 bg-[#FAFAF8] text-[#050505] relative shadow-[-10px_0_30px_rgba(0,0,0,0.03)] z-30 flex flex-col h-full overflow-hidden">
                {/* Subtle ambient backlight for depth */}
                <div className="absolute top-[-20%] left-[20%] w-[60%] h-[40%] bg-[#D4F268]/20 rounded-full blur-[120px] pointer-events-none" />
                
                {children}
            </main>
        </div>
    );
}
