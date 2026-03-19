"use client";

const SHORTCUT_GROUPS = [
    {
        title: "Global",
        items: [
            { keys: ["⌘", "K"],          action: "Open command palette" },
            { keys: ["Escape"],           action: "Close panel / modal" },
        ],
    },
    {
        title: "In-Browser IDE",
        items: [
            { keys: ["⌘", "↵"],          action: "Run code" },
            { keys: ["⌘", "S"],          action: "Save file" },
            { keys: ["⌘", "⇧", "F"],    action: "Format code" },
            { keys: ["⌘", "K"],          action: "Ask Loopy AI for hint" },
            { keys: ["⌘", "Z"],          action: "Undo" },
            { keys: ["⌘", "⇧", "Z"],    action: "Redo" },
        ],
    },
    {
        title: "Chat & Messaging",
        items: [
            { keys: ["↵"],               action: "Send message" },
            { keys: ["⇧", "↵"],         action: "New line" },
            { keys: ["↑"],               action: "Edit last message" },
        ],
    },
    {
        title: "Navigation",
        items: [
            { keys: ["⌘", "1"],          action: "Go to Home" },
            { keys: ["⌘", "2"],          action: "Go to Practice" },
            { keys: ["⌘", "3"],          action: "Go to Loopy AI" },
        ],
    },
];

function KeyChip({ k }: { k: string }) {
    return (
        <kbd className="inline-flex items-center justify-center min-w-[2rem] h-7 px-2 bg-zinc-100 border border-zinc-200 rounded-lg text-xs font-black text-zinc-700 shadow-sm">
            {k}
        </kbd>
    );
}

export default function ShortcutsSettingsPage() {
    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Keyboard Shortcuts</h1>
                <p className="text-zinc-500 font-medium mt-1">A quick reference for all shortcuts available in Skloop.</p>
            </div>

            <div className="space-y-5">
                {SHORTCUT_GROUPS.map((group) => (
                    <div key={group.title} className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm">
                        <h2 className="text-sm font-black uppercase tracking-widest text-zinc-400 mb-4">{group.title}</h2>
                        <div className="space-y-0">
                            {group.items.map((item, i) => (
                                <div key={i}>
                                    <div className="flex items-center justify-between py-3">
                                        <span className="text-sm font-semibold text-zinc-700">{item.action}</span>
                                        <div className="flex items-center gap-1">
                                            {item.keys.map((k, ki) => (
                                                <KeyChip key={ki} k={k} />
                                            ))}
                                        </div>
                                    </div>
                                    {i < group.items.length - 1 && <div className="h-px bg-zinc-50" />}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
