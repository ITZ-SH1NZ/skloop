import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Practice Arena",
    description: "Focus. Learn. Improve. Sharpen your engineering skills in the arena."
};

export default function PracticeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
