import Image from "next/image";
import { cn } from "@/lib/utils";

export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
    return (
        <div className={cn("relative flex items-center justify-center", className)}>
            <Image
                src="/logo.svg"
                alt="Skloop Logo"
                fill
                className="object-contain"
                priority
            />
        </div>
    );
}
