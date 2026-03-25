import { useState, useEffect, useRef, memo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { difficultyColors, categoryColors } from "@/lib/dsa-data";
import { SortingVisualizer } from "./visualizers/SortingVisualizer";
import { StructureVisualizer } from "./visualizers/StructureVisualizer";
import { GraphVisualizer } from "./visualizers/GraphVisualizer";
import { TreeVisualizer } from "./visualizers/TreeVisualizer";
import { DPVisualizer } from "./visualizers/DPVisualizer";
import { StringVisualizer } from "./visualizers/StringVisualizer";
import { MathVisualizer } from "./visualizers/MathVisualizer";

export const AlgorithmPreviewCard = memo(function AlgorithmPreviewCard({ algo }: { algo: any }) {
    const [isPlaying, setIsPlaying] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => setIsPlaying(entry.isIntersecting),
            { threshold: 0.1 }
        );
        if (containerRef.current) observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const renderPreview = () => {
        const props = {
            algorithmId: algo.id,
            isPlaying: isPlaying, // Only play when in view
            speed: 30, // Slower for thumbnails
            isThumbnail: true
        };

        switch (algo.category) {
            case "Sorting": return <SortingVisualizer {...props} />;
            case "Trees":   return <TreeVisualizer {...props} />;
            case "Graphs":  return <GraphVisualizer {...props} />;
            case "Linear":  return <StructureVisualizer {...props} />;
            case "Dynamic Programming": return <DPVisualizer {...props} />;
            case "Math":    return <MathVisualizer {...props} />;
            case "String":  return <StringVisualizer {...props} />;
            default:        return <StructureVisualizer {...props} />;
        }
    };

    return (
        <Link 
            href={`/dsa/${algo.id}`} 
            className="block h-full outline-none group"
        >
            <div className="card-float h-full flex flex-col p-6 hover:card-float-hover border border-zinc-100 bg-white" ref={containerRef}>
                
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        <div className={cn("px-3 py-1 rounded-full text-xs font-bold border", difficultyColors[algo.difficulty as keyof typeof difficultyColors])}>
                            {algo.difficulty}
                        </div>
                        <div className="px-2 py-1 rounded-full text-xs font-mono font-bold bg-zinc-100 text-zinc-700 border border-zinc-200 flex items-center gap-1">
                            T: {algo.timeComplexity}
                        </div>
                    </div>
                    <div className={cn("px-3 py-1 rounded-md text-xs font-semibold shrink-0", categoryColors[algo.category as keyof typeof categoryColors])}>
                        {algo.category}
                    </div>
                </div>
                
                <h2 className="text-xl font-bold text-zinc-900 mb-2">{algo.title}</h2>
                <p className="text-zinc-500 text-sm mb-6 flex-1 line-clamp-3">
                    {algo.shortDescription}
                </p>
                
                <div className="h-40 bg-zinc-50 rounded-2xl overflow-hidden relative border border-zinc-100 mt-auto transition-colors duration-500 pointer-events-none group-hover:bg-zinc-100">
                    <div className="absolute inset-0 flex items-center justify-center">
                        {renderPreview()}
                    </div>
                </div>
                
                <div className="mt-4 flex items-center text-sm font-bold text-zinc-900">
                    Visualize Algorithm <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
            </div>
        </Link>
    );
});
