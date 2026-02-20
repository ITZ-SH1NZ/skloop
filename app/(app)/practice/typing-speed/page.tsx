"use client";

import PorcelainShell from "@/components/practice/PorcelainShell";
import TypingGame from "@/components/practice/TypingGame";

export default function Page() {
    return (
        <PorcelainShell
            title="Syntax Speed Run"
            description="Type logic. Execute speed."
        >
            <TypingGame />
        </PorcelainShell>
    );
}
