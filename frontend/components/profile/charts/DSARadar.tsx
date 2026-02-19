"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer } from "recharts";

const data = [
    { subject: "Arrays", A: 120, fullMark: 150 },
    { subject: "Trees", A: 98, fullMark: 150 },
    { subject: "Graph", A: 86, fullMark: 150 },
    { subject: "DP", A: 99, fullMark: 150 },
    { subject: "Strings", A: 85, fullMark: 150 },
    { subject: "Linked List", A: 65, fullMark: 150 },
];

export function DSARadar() {
    return (
        <div className="w-full h-[300px] md:h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#e5e7eb" strokeOpacity={0.5} />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 600 }} />
                    <Radar
                        name="Mike"
                        dataKey="A"
                        stroke="#8884d8"
                        strokeWidth={3}
                        fill="#8884d8"
                        fillOpacity={0.3}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
