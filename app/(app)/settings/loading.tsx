import { Loader2 } from "lucide-react";

export default function SettingsLoading() {
    return (
        <div className="w-full h-full min-h-[60vh] flex flex-col items-center justify-center">
            <Loader2 size={32} className="animate-spin text-zinc-300" />
            <p className="text-zinc-400 font-bold mt-4 tracking-widest uppercase text-xs">Loading...</p>
        </div>
    );
}
