import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState } from "react";
import Logo from "@/components/Logo";

interface AuthCardProps {
    children: React.ReactNode;
    subtitle?: string;
    showProgress?: boolean;
    currentStep?: number;
    totalSteps?: number;
    className?: string;
}

export default function AuthCard({ children, subtitle, showProgress = false, currentStep = 1, totalSteps = 4, className }: AuthCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.3 }}
            className={cn(
                "relative w-full max-w-[480px] z-10",
                className
            )}
        >
            {/* The "Device" Shell */}
            <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] border-[3px] border-zinc-100 relative overflow-hidden">

                {/* Top Notch / Status Bar */}
                <div className="flex justify-between items-center mb-8">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: "auto" }}
                        className="flex items-center gap-3 bg-zinc-50 px-4 py-2 rounded-full border border-zinc-100"
                    >
                        <div className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Secure</span>
                    </motion.div>

                    {/* Progress Dots (Nintendo Style) */}
                    {showProgress && (
                        <div className="flex gap-2">
                            {Array.from({ length: totalSteps }).map((_, i) => (
                                <motion.div
                                    key={i}
                                    animate={{
                                        scale: i + 1 === currentStep ? 1.2 : 1,
                                        backgroundColor: i + 1 <= currentStep ? "#D4F268" : "#E4E4E7"
                                    }}
                                    className="w-3 h-3 rounded-full"
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Header */}
                {/* Header */}
                <div className="mb-10 text-center">
                    <div className="inline-flex justify-center mb-6 p-4 bg-zinc-50 rounded-[1.5rem] shadow-xl shadow-zinc-200/50 transform -rotate-3 hover:rotate-0 transition-transform cursor-pointer border border-zinc-100">
                        <Logo className="w-10 h-10" />
                    </div>
                    {subtitle && (
                        <h2 className="text-2xl font-black text-zinc-900 tracking-tight leading-none">
                            {subtitle}
                        </h2>
                    )}
                </div>

                {children}
            </div>

            {/* Decor Elements around the card */}
            <div className="absolute -z-10 -top-10 -right-10 w-24 h-24 bg-lime-200 rounded-full blur-2xl opacity-50" />
            <div className="absolute -z-10 -bottom-10 -left-10 w-32 h-32 bg-blue-200 rounded-full blur-2xl opacity-50" />
        </motion.div>
    );
}

// "Tactile" Input Component
import { Eye, EyeOff } from "lucide-react";

export function AuthInput({ icon, className, type = "text", ...props }: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ReactNode }) {
    const [focused, setFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
        <div className="relative group mb-4">
            <motion.div
                animate={focused ? { y: -2, boxShadow: "0 10px 20px -5px rgba(0,0,0,0.1)" } : { y: 0 }}
                className={cn(
                    "relative flex items-center bg-zinc-50 border-2 rounded-2xl transition-all duration-200 overflow-hidden",
                    focused ? "border-zinc-900 bg-white" : "border-transparent"
                )}
            >
                {icon && (
                    <div className={cn(
                        "pl-5 pr-2 transition-colors duration-200",
                        focused ? "text-zinc-900" : "text-zinc-400"
                    )}>
                        {icon}
                    </div>
                )}

                <input
                    {...props}
                    type={inputType}
                    onFocus={(e) => { setFocused(true); props.onFocus?.(e); }}
                    onBlur={(e) => { setFocused(false); props.onBlur?.(e); }}
                    className={cn(
                        "w-full bg-transparent border-none px-4 py-5 text-base font-bold text-zinc-900 placeholder:text-zinc-300 outline-none",
                        !icon && "pl-5",
                        isPassword && "pr-12",
                        className
                    )}
                />

                {isPassword && (
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 p-1 text-zinc-400 hover:text-zinc-900 transition-colors"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                )}
            </motion.div>
        </div>
    );
}

// "Pressable" 3D Button
import { HTMLMotionProps } from "framer-motion";

interface AuthButtonProps extends HTMLMotionProps<"button"> {
    children: React.ReactNode;
}

export function AuthButton({ children, className, disabled, ...props }: AuthButtonProps) {
    return (
        <motion.button
            whileHover={!disabled ? { y: -2 } : {}}
            whileTap={!disabled ? { y: 4, boxShadow: "0 0px 0 0 #4d7c0f" } : {}}
            disabled={disabled}
            {...props}
            className={cn(
                "w-full relative h-16 rounded-2xl font-black text-sm uppercase tracking-widest transition-all select-none flex items-center justify-center",
                disabled
                    ? "bg-zinc-100 text-zinc-300 cursor-not-allowed shadow-none"
                    : "bg-lime-400 text-zinc-900 shadow-[0_6px_0_0_#65a30d] hover:shadow-[0_8px_0_0_#65a30d] active:translate-y-[4px] active:shadow-none",
                className
            )}
        >
            {children}
        </motion.button>
    )
}
