import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
    title: "Learning Roadmaps",
    description: "Follow your path or explore new territories in the technical landscape."
};

export default function RoadmapLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
