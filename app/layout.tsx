import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import clsx from "clsx";

import { ToastProvider } from "@/components/ui/ToastProvider";
import { MasterScrollProvider } from "@/components/providers/MasterScrollProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Skloop | Trade Skills",
  description: "Where skills come full circle. Trade skills, learn anything.",
};

import { LoadingProvider } from "@/components/LoadingProvider";

import { Suspense } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={clsx(
          inter.variable,
          "bg-background text-foreground font-sans min-h-screen bg-dot-pattern",
          "pb-[env(safe-area-inset-bottom)]"
        )}
      >
        <ToastProvider>
          <Suspense fallback={null}>
            <LoadingProvider>
              {children}
            </LoadingProvider>
          </Suspense>
        </ToastProvider>
      </body>
    </html>
  );
}
