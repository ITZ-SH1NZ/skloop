import { Check, X } from "lucide-react";

interface OptionButtonProps {
    option: string;
    isAnswered: boolean;
    isSelected: boolean;
    isCorrect: boolean;
    onClick: () => void;
    idx: number;
}

export function OptionButton({
    option,
    isAnswered,
    isSelected,
    isCorrect,
    onClick,
    idx
}: OptionButtonProps) {
    let baseStyles = "bg-white border-2 border-zinc-200 border-b-[6px] text-zinc-900 hover:bg-zinc-50 hover:border-zinc-300 pointer-events-auto";
    let numberBg = "bg-zinc-100 text-zinc-500 border-2 border-zinc-200";

    if (isAnswered) {
        if (isCorrect) {
            baseStyles = "bg-[#D4F268] border-2 border-[#849f2b] border-b-[6px] border-b-[#849f2b] text-[#1a2e05]";
            numberBg = "bg-white/40 text-[#1a2e05] border-[#849f2b]";
        } else if (isSelected && !isCorrect) {
            baseStyles = "bg-red-500 border-2 border-red-700 border-b-[6px] border-b-red-700 text-white";
            numberBg = "bg-white/20 text-white border-red-800";
        } else {
            baseStyles = "bg-transparent border-2 border-zinc-200 text-zinc-400 opacity-60";
            numberBg = "bg-transparent text-zinc-400 border-zinc-200 bg-white/50";
        }
    } else if (isSelected) {
        baseStyles = "bg-[#eaf9ac] border-2 border-[#849f2b] border-b-[6px] border-b-[#849f2b] text-[#1a2e05]";
        numberBg = "bg-[#D4F268] text-[#1a2e05] border-[#849f2b]";
    }

    return (
        <button
            onClick={onClick}
            disabled={isAnswered}
            className={`
                relative w-full text-left px-5 py-4 md:px-6 md:py-6 rounded-2xl font-black transition-all duration-100 flex items-center gap-4 text-lg md:text-xl
                ${baseStyles}
                ${isAnswered ? 'cursor-default pointer-events-none' : 'cursor-pointer active:translate-y-[4px] active:border-b-2 active:mt-[4px]'}
            `}
        >
            <span className={`w-8 h-8 md:w-10 md:h-10 shrink-0 flex items-center justify-center rounded-xl text-xs md:text-sm font-black transition-colors ${numberBg}`}>
                {idx + 1}
            </span>
            <span className="flex-1 drop-shadow-sm">{option}</span>

            <div className="shrink-0 flex items-center">
                {isAnswered && isCorrect && <Check className="text-[#1a2e05]" size={36} strokeWidth={4} />}
                {isAnswered && isSelected && !isCorrect && <X className="text-white" size={36} strokeWidth={4} />}
            </div>
        </button>
    );
} 
