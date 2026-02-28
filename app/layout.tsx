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
  icons: {
    icon: "/skloop.ico",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "name": "Skloop",
      "url": "https://skloop.online",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://skloop.online/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@type": "SiteNavigationElement",
      "name": [
        "Login",
        "Sign Up",
        "Practice Arena",
        "Learning Roadmap",
        "Dashboard"
      ],
      "url": [
        "https://skloop.online/",
        "https://skloop.online/",
        "https://skloop.online/practice",
        "https://skloop.online/roadmap",
        "https://skloop.online/dashboard"
      ]
    }
  ]
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
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
