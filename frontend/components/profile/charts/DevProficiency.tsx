"use client";

import { motion } from "framer-motion";

const skills = [
    { name: "React / Next.js", level: 90 },
    { name: "Node.js / Express", level: 75 },
    { name: "TypeScript", level: 85 },
    { name: "Tailwind CSS", level: 95 },
    { name: "PostgreSQL", level: 60 },
];

export function DevProficiency() {
    return (
        <div className="space-y-6">
            {skills.map((skill, index) => (
                <div key={skill.name} className="space-y-1">
                    <div className="flex justify-between text-sm font-medium">
                        <span>{skill.name}</span>
                        <span className="text-muted-foreground">{skill.level}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${skill.level}%` }}
                            transition={{ duration: 1, delay: index * 0.1, ease: "easeOut" }}
                            className="h-full bg-primary rounded-full"
                        />
                    </div>
                </div>
            ))}
        </div>
    );
}
