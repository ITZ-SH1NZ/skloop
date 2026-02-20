import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "outline" | "secondary";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
    const variants = {
        default: "bg-primary text-primary-foreground border-transparent",
        outline: "text-foreground border border-foreground/20",
        secondary: "bg-secondary text-secondary-foreground border-transparent",
    };

    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                variants[variant],
                className
            )}
            {...props}
        />
    );
}
