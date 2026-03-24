"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface ComplexityChartProps {
    timeComplexity: string; // e.g. "O(n²)", "O(n log n)"
    className?: string;
}

const COMPLEXITY_CURVES = [
    { label: "O(1)",       key: "constant",    color: "#22c55e", points: (n: number) => 0.05 },
    { label: "O(log n)",   key: "logarithmic", color: "#86efac", points: (n: number) => Math.log2(n + 1) / Math.log2(101) * 0.3 },
    { label: "O(n)",       key: "linear",      color: "#facc15", points: (n: number) => n / 100 },
    { label: "O(n log n)", key: "linearithmic",color: "#f97316", points: (n: number) => (n / 100) * (Math.log2(n + 1) / Math.log2(101)) * 2 },
    { label: "O(n²)",      key: "quadratic",   color: "#ef4444", points: (n: number) => (n / 100) ** 2 },
    { label: "O(2ⁿ)",      key: "exponential", color: "#dc2626", points: (n: number) => Math.min(Math.pow(2, n / 100 * 7) / 128, 1) },
];

function detectCurve(tc: string): string {
    const t = tc.toLowerCase().replace(/\s/g, "");
    if (t.includes("2^n") || t.includes("2ⁿ")) return "exponential";
    if (t.includes("n²") || t.includes("n^2") || t.includes("n*n")) return "quadratic";
    if (t.includes("nlogn") || t.includes("n log")) return "linearithmic";
    if (t.includes("logn") || t.includes("log n")) return "logarithmic";
    if (t === "o(n)" || t.includes("(n)")) return "linear";
    return "constant";
}

const W = 280;
const H = 120;
const PAD = { top: 10, right: 10, bottom: 28, left: 28 };
const innerW = W - PAD.left - PAD.right;
const innerH = H - PAD.top - PAD.bottom;
const STEPS = 60;

function curveToPath(fn: (n: number) => number) {
    const pts = Array.from({ length: STEPS + 1 }, (_, i) => {
        const n = (i / STEPS) * 100;
        const y = Math.min(fn(n), 1.05);
        const px = PAD.left + (i / STEPS) * innerW;
        const py = PAD.top + innerH - y * innerH;
        return `${i === 0 ? "M" : "L"} ${px.toFixed(1)} ${py.toFixed(1)}`;
    });
    return pts.join(" ");
}

export function ComplexityChart({ timeComplexity, className }: ComplexityChartProps) {
    const activeCurve = detectCurve(timeComplexity);
    const paths = useMemo(() => COMPLEXITY_CURVES.map(c => ({ ...c, d: curveToPath(c.points) })), []);

    return (
        <div className={cn("bg-zinc-50 rounded-xl border border-zinc-200 p-4", className)}>
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Time Complexity Curve</p>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ maxHeight: 130 }}>
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map(v => {
                    const y = PAD.top + innerH - v * innerH;
                    return <line key={v} x1={PAD.left} y1={y} x2={PAD.left + innerW} y2={y} stroke="#e4e4e7" strokeWidth="1" strokeDasharray="3,3" />;
                })}

                {/* Axes */}
                <line x1={PAD.left} y1={PAD.top} x2={PAD.left} y2={PAD.top + innerH} stroke="#a1a1aa" strokeWidth="1.5" />
                <line x1={PAD.left} y1={PAD.top + innerH} x2={PAD.left + innerW} y2={PAD.top + innerH} stroke="#a1a1aa" strokeWidth="1.5" />
                
                {/* Axis labels */}
                <text x={PAD.left + innerW / 2} y={H - 4} textAnchor="middle" fontSize="9" fill="#a1a1aa">n (input size)</text>
                <text x={8} y={PAD.top + innerH / 2} textAnchor="middle" fontSize="9" fill="#a1a1aa" transform={`rotate(-90, 8, ${PAD.top + innerH / 2})`}>ops</text>

                {/* Curves — faint first, then active on top */}
                {paths.filter(c => c.key !== activeCurve).map(c => (
                    <path key={c.key} d={c.d} fill="none" stroke={c.color} strokeWidth="1.5" opacity="0.25" />
                ))}
                {paths.filter(c => c.key === activeCurve).map(c => (
                    <path key={c.key} d={c.d} fill="none" stroke={c.color} strokeWidth="3" opacity="1" />
                ))}

                {/* Active label */}
                {paths.filter(c => c.key === activeCurve).map(c => {
                    const midN = 60;
                    const y = Math.min(c.points(midN), 1.05);
                    const px = PAD.left + (midN / 100) * innerW + 4;
                    const py = PAD.top + innerH - y * innerH - 4;
                    return (
                        <text key="label" x={Math.min(px, W - 50)} y={Math.max(py, PAD.top + 10)} fontSize="9" fill={c.color} fontWeight="bold">
                            {c.label}
                        </text>
                    );
                })}
            </svg>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2">
                {COMPLEXITY_CURVES.map(c => (
                    <div key={c.key} className={cn("flex items-center gap-1 text-[10px]", c.key === activeCurve ? "font-bold" : "opacity-40")}>
                        <div className="w-3 h-1 rounded-full" style={{ backgroundColor: c.color }} />
                        <span>{c.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
