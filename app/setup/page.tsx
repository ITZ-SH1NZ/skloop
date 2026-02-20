"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";

const SKILLS = [
    "Web Development",
    "Graphic Design",
    "Guitar",
    "Cooking",
    "Spanish",
    "Digital Marketing",
    "Yoga",
    "Photography",
    "Public Speaking",
    "Math",
];

export default function SetupPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [teachSkills, setTeachSkills] = useState<string[]>([]);
    const [learnSkills, setLearnSkills] = useState<string[]>([]);

    const toggleTeachSkill = (skill: string) => {
        setTeachSkills((prev) =>
            prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
        );
    };

    const toggleLearnSkill = (skill: string) => {
        setLearnSkills((prev) =>
            prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
        );
    };

    const nextStep = () => {
        if (step < 3) setStep(step + 1);
        else router.push("/dashboard");
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <div className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-12">
            <div className="mb-8 flex w-full max-w-lg items-center justify-between px-4">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-colors ${step >= i
                            ? "bg-primary text-background"
                            : "bg-surface text-muted"
                            }`}
                    >
                        {step > i ? <Check className="h-4 w-4" /> : i}
                    </div>
                ))}
                <div className="absolute left-0 right-0 -z-10 mx-auto h-0.5 w-[200px] bg-surface" />
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="w-full max-w-2xl px-4"
                >
                    <Card className="p-8">
                        {step === 1 && (
                            <div className="text-center">
                                <h2 className="mb-2 text-2xl font-bold">What can you teach?</h2>
                                <p className="mb-6 text-muted">
                                    Select at least one skill you can share with others.
                                </p>
                                <div className="flex flex-wrap justify-center gap-3">
                                    {SKILLS.map((skill) => (
                                        <button
                                            key={skill}
                                            onClick={() => toggleTeachSkill(skill)}
                                            className={`rounded-full border px-4 py-2 text-sm transition-all ${teachSkills.includes(skill)
                                                ? "border-primary bg-primary/20 text-primary hover:bg-primary/30"
                                                : "border-white/10 bg-transparent hover:border-white/30"
                                                }`}
                                        >
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="text-center">
                                <h2 className="mb-2 text-2xl font-bold">What do you want to learn?</h2>
                                <p className="mb-6 text-muted">
                                    Select skills you are interested in picking up.
                                </p>
                                <div className="flex flex-wrap justify-center gap-3">
                                    {SKILLS.map((skill) => (
                                        <button
                                            key={skill}
                                            onClick={() => toggleLearnSkill(skill)}
                                            className={`rounded-full border px-4 py-2 text-sm transition-all ${learnSkills.includes(skill)
                                                ? "border-secondary bg-secondary/20 text-secondary hover:bg-secondary/30"
                                                : "border-white/10 bg-transparent hover:border-white/30"
                                                }`}
                                        >
                                            {skill}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="text-center">
                                <h2 className="mb-2 text-2xl font-bold">You're all set!</h2>
                                <p className="mb-6 text-muted">
                                    We've initialized your profile. Ready to find your skill loop?
                                </p>
                                <div className="mb-8 rounded-lg bg-surface/50 p-6">
                                    <h3 className="mb-4 text-lg font-semibold">Your Profile Loop</h3>
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex-1">
                                            <div className="mb-2 text-xs text-muted">TEACHING</div>
                                            <div className="flex flex-wrap justify-center gap-1">
                                                {teachSkills.length > 0 ? (
                                                    teachSkills.map(s => <Badge key={s} variant="default">{s}</Badge>)
                                                ) : <span className="text-xs text-muted italic">None selected</span>}
                                            </div>
                                        </div>
                                        <div className="h-8 w-px bg-white/10" />
                                        <div className="flex-1">
                                            <div className="mb-2 text-xs text-muted">LEARNING</div>
                                            <div className="flex flex-wrap justify-center gap-1">
                                                {learnSkills.length > 0 ? (
                                                    learnSkills.map(s => <Badge key={s} variant="secondary">{s}</Badge>)
                                                ) : <span className="text-xs text-muted italic">None selected</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="mt-8 flex justify-between">
                            <Button
                                variant="ghost"
                                onClick={prevStep}
                                disabled={step === 1}
                                className={step === 1 ? "invisible" : ""}
                            >
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Back
                            </Button>
                            <Button
                                onClick={nextStep}
                                disabled={
                                    (step === 1 && teachSkills.length === 0) ||
                                    (step === 2 && learnSkills.length === 0)
                                }
                            >
                                {step === 3 ? "Complete" : "Next"}
                                {step !== 3 && <ChevronRight className="ml-2 h-4 w-4" />}
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
