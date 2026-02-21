"use client";

import Link from "next/link";
import { Button } from "./ui/Button";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { cn } from "./ui/Button";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useMasterScroll } from "./providers/MasterScrollProvider";
import { usePathname, useRouter } from "next/navigation";
import MagneticButton from "./MagneticButton";
import Logo from "./Logo";

const NAV_LINKS = [
    { label: "How It Works", href: "/onboarding#how-it-works" },
    { label: "Community", href: "/onboarding#community" },
    { label: "Manifesto", href: "/docs" }, // Renamed from Documentation
    { label: "Contact", href: "/onboarding#contact" }
];

export function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { scrollY } = useScroll();
    const { scrollToElement } = useMasterScroll();
    const pathname = usePathname();
    const router = useRouter();

    const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        // If it's a documentation link, let default behavior happen
        if (href.startsWith('/docs')) {
            setIsMobileMenuOpen(false);
            return;
        }

        // Handle anchor links for onboarding page
        if (href.includes('#')) {
            const [path, hash] = href.split('#');

            // If we are already on the path (or it's just a hash), scroll smoothly
            if (pathname === path || pathname === '/onboarding') {
                e.preventDefault();
                scrollToElement(hash, -100);
                setIsMobileMenuOpen(false);
            } else {
                // Determine if we need to navigate
                // Default Next.js Link behavior will handle navigation + hash
                // But we close the menu
                setIsMobileMenuOpen(false);
            }
        }
    };

    // Transform scroll to navbar properties
    const width = useTransform(scrollY, [0, 150], ["96%", "60%"]);
    const backgroundColor = useTransform(
        scrollY,
        [0, 150],
        ["rgba(255, 255, 255, 0)", "rgba(255, 255, 255, 0.8)"]
    );
    const backdropFilter = useTransform(scrollY, [0, 150], ["blur(0px)", "blur(12px)"]);
    const boxShadow = useTransform(
        scrollY,
        [0, 150],
        ["0 0 0 rgba(0,0,0,0)", "0 8px 32px rgba(0,0,0,0.04)"]
    );

    return (
        <>
            <motion.nav
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className="fixed top-0 left-0 right-0 z-50 flex justify-center py-6 pointer-events-none"
            >
                <motion.div
                    style={{
                        width,
                        backgroundColor,
                        backdropFilter,
                        boxShadow,
                        borderRadius: "9999px",
                    }}
                    className="pointer-events-auto flex items-center justify-between py-3 px-8 border border-black/5"
                >
                    {/* Logo Section */}
                    <Link href="/" className="flex items-center gap-2 mr-8 group">
                        <MagneticButton strength={0.2} className="flex items-center gap-2">
                            <Logo className="h-10 w-10 text-primary transition-transform duration-500 group-hover:rotate-180" />
                            <span className="font-bold tracking-tight text-foreground text-lg group-hover:text-primary transition-colors">Skloop</span>
                        </MagneticButton>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden md:flex items-center gap-6">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.label}
                                href={link.href}
                                onClick={(e) => handleNavClick(e, link.href)}
                                className="text-sm font-medium text-gray-600 hover:text-black transition-all hover:scale-105"
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <div className="hidden md:block">
                            <Link href="/login">
                                <MagneticButton>
                                    <Button size="sm" className="rounded-full bg-black text-white hover:bg-black/80 shadow-none px-5 transition-transform hover:scale-105 active:scale-95">
                                        Start Loop
                                    </Button>
                                </MagneticButton>
                            </Link>
                        </div>

                        {/* Mobile Menu Toggle */}
                        <button
                            onClick={() => setIsMobileMenuOpen(true)}
                            className="md:hidden p-2 rounded-full hover:bg-black/5 transition-colors active:scale-90 text-black"
                        >
                            <Menu size={24} />
                        </button>
                    </div>
                </motion.div>
            </motion.nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <MobileMenu onClose={() => setIsMobileMenuOpen(false)} />
                )}
            </AnimatePresence>
        </>
    );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
        >
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-[#FDFCF8] shadow-2xl p-8 flex flex-col"
            >
                <div className="flex justify-between items-center mb-12">
                    <span className="font-bold text-xl tracking-tight">Menu</span>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col gap-6 flex-1">
                    {NAV_LINKS.map((link, i) => (
                        <motion.div
                            key={link.label}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.1 + i * 0.1, duration: 0.4 }}
                        >
                            <Link
                                href={link.href}
                                onClick={(e) => {
                                    onClose(); // Close menu
                                    // We need to pass the event to our handler, but handleNavClick is inside Navbar
                                    // Since we can't easily pass the handler down without prop drilling effectively,
                                    // we can replicate the logic or rely on the parent closing. 
                                    // Actually, let's just use standard navigation for mobile or force a reload if needed?
                                    // Better: The user didn't complain about mobile glitching specifically, but let's be safe.
                                    // For now, let's just close. Navigation will happen.
                                }}
                                className="text-4xl font-black tracking-tight hover:text-primary transition-colors flex items-center gap-4 group"
                            >
                                {link.label}
                                <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity" size={32} />
                            </Link>
                        </motion.div>
                    ))}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4, duration: 0.4 }}
                    >
                        <Link
                            href="/login"
                            onClick={onClose}
                            className="text-4xl font-black tracking-tight text-primary mt-4 block"
                        >
                            Sign In
                        </Link>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="pt-8 border-t border-black/5"
                >
                    <p className="text-gray-400 text-sm">
                        &copy; 2026 Skloop Inc.
                    </p>
                </motion.div>
            </motion.div>
        </motion.div>
    )
}
