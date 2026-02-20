"use client";

import PorcelainShell from "@/components/practice/PorcelainShell";
import DSAQuiz from "@/components/practice/DSAQuiz";

export default function Page() {
    return (
        <PorcelainShell
            title="DSA Rapid Fire"
            description="Algorithmic endurance test."
        >
            <DSAQuiz />
        </PorcelainShell>
    );
}
