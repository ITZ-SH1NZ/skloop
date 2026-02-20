"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";

interface DataPoint {
    time: number;
    wpm: number;
    raw: number;
    errors: number;
}

interface ResultChartProps {
    data: DataPoint[];
    width?: number;
    height?: number;
}

export default function ResultChart({ data, width = 600, height = 300 }: ResultChartProps) {
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);

    const maxTime = useMemo(() => Math.max(...(data.map(d => d.time).length ? data.map(d => d.time) : [0])), [data]);
    const maxWpm = useMemo(() => Math.max(...(data.map(d => Math.max(d.wpm, d.raw)).length ? data.map(d => Math.max(d.wpm, d.raw)) : [0])) || 1, [data]);

    // Process data to fit SVG coordinates
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return [];

        // Add 10% padding to maxWpm
        const yMax = Math.ceil(maxWpm * 1.1);

        return data.map(d => ({
            x: (d.time / (maxTime || 1)) * width,
            yWpm: height - (d.wpm / yMax) * height,
            yRaw: height - (d.raw / yMax) * height,
            rawWpm: d.wpm,
            rawRaw: d.raw,
            timeLabel: d.time
        }));
    }, [data, width, height, maxTime, maxWpm]);

    if (chartData.length === 0) return null;

    // Generate Path D strings
    const wpmPath = `M ${chartData.map(d => `${d.x},${d.yWpm}`).join(" L ")}`;

    // Generate Grid Lines
    const yGridLines = [0, 0.25, 0.5, 0.75, 1].map(p => ({
        y: height - (p * height),
        label: Math.round(p * (maxWpm * 1.1))
    }));

    return (
        <div className="relative w-full h-[300px] select-none">
            {/* Y Axis Labels */}
            <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-[10px] text-zinc-400 font-mono py-1 pointer-events-none">
                {yGridLines.reverse().map(l => (
                    <span key={l.label} style={{ transform: 'translateY(-50%)' }}>{l.label}</span>
                ))}
            </div>

            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible ml-10 pr-4">
                {/* Grid Lines */}
                {yGridLines.map(l => (
                    <line
                        key={l.label}
                        x1="0"
                        y1={l.y}
                        x2={width}
                        y2={l.y}
                        stroke="#f1f5f9"
                        strokeWidth="1"
                    />
                ))}

                {/* Raw WPM Line */}
                <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 0.5 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    d={chartData.map((d, i) => (i === 0 ? `M ${d.x} ${d.yRaw}` : `L ${d.x} ${d.yRaw}`)).join(" ")}
                    fill="none"
                    stroke="#a1a1aa" // zinc-400
                    strokeWidth="2"
                    strokeDasharray="4 4"
                />

                {/* Current WPM Line */}
                <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }}
                    d={wpmPath}
                    fill="none"
                    stroke="#D4F268" // Theme Lime
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Area under WPM */}
                <motion.path
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.1 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    d={`${wpmPath} L ${width} ${height} L 0 ${height} Z`}
                    fill="#D4F268"
                    stroke="none"
                />

                {/* Interactive Hover Points */}
                {chartData.map((d, i) => (
                    <g key={i}>
                        <circle
                            cx={d.x}
                            cy={d.yWpm}
                            r="4"
                            fill="#D4F268"
                            opacity={hoveredPoint === i ? "1" : "0"}
                            className="transition-opacity"
                        />
                        <circle
                            cx={d.x}
                            cy={d.yWpm}
                            r="12"
                            fill="transparent"
                            onMouseEnter={() => setHoveredPoint(i)}
                            onMouseLeave={() => setHoveredPoint(null)}
                            className="cursor-pointer"
                        />
                    </g>
                ))}
            </svg>

            {/* Tooltip */}
            {hoveredPoint !== null && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bg-zinc-900 text-white px-3 py-2 rounded-lg text-xs font-bold shadow-lg pointer-events-none"
                    style={{
                        left: chartData[hoveredPoint].x + 40,
                        top: chartData[hoveredPoint].yWpm - 20
                    }}
                >
                    <div className="flex gap-3">
                        <span className="text-lime-400">{chartData[hoveredPoint].rawWpm} WPM</span>
                        <span className="text-zinc-400">Raw: {chartData[hoveredPoint].rawRaw}</span>
                        <span className="text-zinc-500">{chartData[hoveredPoint].timeLabel}s</span>
                    </div>
                </motion.div>
            )}

            {/* Legend */}
            <div className="absolute top-4 right-4 flex gap-4 text-xs font-bold uppercase tracking-widest pl-10">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-lime-500" /> WPM
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                    <div className="w-3 h-0.5 border-t-2 border-dashed border-zinc-400" /> Raw
                </div>
            </div>

            {/* X Axis Label */}
            <div className="absolute bottom-0 w-full text-center text-[10px] text-zinc-400 font-mono tracking-widest mt-2 uppercase">
                Duration ({Math.round(maxTime)}s)
            </div>
        </div>
    );
}
