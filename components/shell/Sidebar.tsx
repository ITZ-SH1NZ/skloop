import { motion, AnimatePresence, Variants } from "framer-motion";
import {
    Home,
    Layers,
    BookOpen,
    Users,
    User,
    ChevronLeft,
    ChevronRight,
    GraduationCap,
    Bot,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/Button";
import { cn } from "@/lib/utils";
import Logo from "@/components/Logo";
import { useMediaQuery } from "@/hooks/use-media-query";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/Tooltip";

interface NavItemType {
    label: string;
    href: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    icon: any;
    badge?: string | number;
    subItems?: { label: string; href: string }[];
}

interface NavItemProps {
    item: NavItemType;
    isCollapsed: boolean;
    isDesktop: boolean;
    pathname: string;
    setMobileOpen?: (open: boolean) => void;
    setIsCollapsed: (collapsed: boolean) => void;
}

const NavItem = ({ item, isCollapsed, isDesktop, pathname, setMobileOpen, setIsCollapsed }: NavItemProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const isActive = pathname === item.href || (item.subItems && item.subItems.some((sub) => pathname === sub.href));
    const showLabel = !isCollapsed || !isDesktop;
    const showTooltip = isCollapsed && isDesktop;

    // Auto-expand sub-menu if active and sidebar is expanded
    if (isActive && showLabel && !isOpen) {
        // Optional: auto-open active section on load?
        // simple approach: let user open it, or use useEffect. 
        // For now, let's just keep manual toggle unless active.
    }

    const itemContent = (
        <div className={cn(
            "flex items-center gap-3 xl:gap-4 px-4 xl:px-5 py-3 xl:py-4 rounded-[1.5rem] transition-all duration-300 relative overflow-hidden",
            isActive
                ? "bg-primary text-primary-foreground shadow-sm font-bold"
                : "text-gray-500 hover:bg-gray-50 hover:text-foreground",
            isCollapsed && isDesktop ? "justify-center px-0" : ""
        )}>
            <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className="shrink-0 z-10 xl:w-[22px] xl:h-[22px]" />
            {showLabel && (
                <>
                    <span className="truncate text-sm xl:text-sm z-10 font-medium text-left flex-1">{item.label}</span>
                    {item.subItems && <ChevronRight size={16} className={cn("transition-transform duration-200", isOpen ? "rotate-90" : "")} />}
                </>
            )}
            {showLabel && item.badge && !item.subItems && (
                <span className={cn(
                    "ml-auto text-[10px] xl:text-[10px] font-bold px-2 py-0.5 rounded-full z-10",
                    isActive ? "bg-white/50 text-black" : "bg-gray-100 text-gray-600"
                )}>
                    {item.badge}
                </span>
            )}
        </div>
    );

    if (item.subItems) {
        return (
            <div className="mb-1">
                <TooltipProvider delayDuration={300}>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => {
                                    if (isCollapsed && isDesktop) {
                                        setIsCollapsed(false);
                                        setIsOpen(true);
                                    } else {
                                        setIsOpen(!isOpen);
                                    }
                                }}
                                className="w-full text-left outline-none"
                            >
                                {itemContent}
                            </button>
                        </TooltipTrigger>
                        {showTooltip && (
                            <TooltipContent side="right">
                                <p>{item.label}</p>
                            </TooltipContent>
                        )}
                    </Tooltip>
                </TooltipProvider>

                <AnimatePresence>
                    {isOpen && showLabel && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden ml-4 pl-4 border-l border-gray-100 space-y-1 mt-1"
                        >
                            {item.subItems.map((sub, idx: number) => {
                                const isSubActive = pathname === sub.href;
                                return (
                                    <Link
                                        key={idx}
                                        href={sub.href}
                                        onClick={() => setMobileOpen?.(false)}
                                        className={cn(
                                            "block py-2 px-4 rounded-xl text-xs xl:text-sm transition-colors",
                                            isSubActive ? "text-primary font-bold bg-primary/5" : "text-gray-500 hover:text-foreground hover:bg-gray-50"
                                        )}
                                    >
                                        {sub.label}
                                    </Link>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <TooltipProvider delayDuration={300}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link
                        href={item.href}
                        onClick={() => {
                            setMobileOpen?.(false);
                        }}
                        className="block group mb-1 outline-none"
                    >
                        {itemContent}
                    </Link>
                </TooltipTrigger>
                {showTooltip && (
                    <TooltipContent side="right">
                        <p>{item.label}</p>
                    </TooltipContent>
                )}
            </Tooltip>
        </TooltipProvider>
    );
};

// Extracted SidebarContent to prevent re-renders affecting animation
interface SidebarContentProps {
    isCollapsed: boolean;
    isDesktop: boolean;
    pathname: string;
    setMobileOpen?: (open: boolean) => void;
    setIsCollapsed: (collapsed: boolean) => void;
}

const SidebarContent = ({ isCollapsed, isDesktop, pathname, setMobileOpen, setIsCollapsed }: SidebarContentProps) => {
    const navItems = [
        { icon: Home, label: "Home", href: "/dashboard" },
        {
            icon: Layers,
            label: "Tracks",
            href: "#",
            subItems: [
                { label: "My Roadmap", href: "/roadmap" },
                { label: "Web Development", href: "/course/web-dev" },
                { label: "DSA Foundations", href: "/course/dsa" },
            ]
        },
        {
            icon: BookOpen,
            label: "Practice",
            href: "/practice",
            subItems: [
                { label: "Daily Hub", href: "/practice" },
                { label: "Daily Codele", href: "/practice/daily-codele" },
                { label: "Typing Speed", href: "/practice/typing-speed" },
                { label: "DSA Quiz", href: "/practice/dsa-quiz" },
            ]
        },
        {
            icon: GraduationCap,
            label: "Mentorship",
            href: "#",
            subItems: [
                { label: "Find Mentor", href: "/mentorship/find" },
                { label: "My Sessions", href: "/mentorship/sessions" },
                { label: "Become a Mentor", href: "/mentorship/apply" },
                { label: "Mentor Dashboard", href: "/mentorship/dashboard" },
            ]
        },
        {
            icon: Users,
            label: "Peers",
            href: "#",
            subItems: [
                { label: "My Peers", href: "/peer/my-peers" },
                { label: "Chat", href: "/peer/chat" },
                { label: "Study Circles", href: "/peer/study-circles" },
                { label: "Leaderboard", href: "/peer/leaderboard" },
            ]
        },
        { icon: User, label: "Profile", href: "/profile" },
        { icon: Bot, label: "Loopy AI", href: "/loopy" },
    ];

    return (
        <div className="flex-1 flex flex-col h-full bg-surface shadow-2xl md:shadow-none border md:border-none rounded-[2rem] overflow-hidden relative transition-all duration-300">
            {/* Brand Header */}
            <div className={cn("p-6 xl:p-8 pb-6 flex items-center gap-4 transition-all duration-300", isCollapsed && isDesktop ? "justify-center px-2" : "")}>
                <div className="h-10 w-10 text-primary rounded-xl flex items-center justify-center shrink-0 transition-transform hover:scale-110">
                    <Logo className="w-10 h-10" />
                </div>
                {(!isCollapsed || !isDesktop) && (
                    <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="font-bold text-xl xl:text-2xl tracking-tight text-foreground whitespace-nowrap"
                    >
                        Skloop
                    </motion.span>
                )}
                {/* Mobile Close Button */}
                <div className="md:hidden ml-auto">
                    <Button variant="ghost" className="h-10 w-10 p-0" onClick={() => setMobileOpen?.(false)}>
                        <ChevronLeft />
                    </Button>
                </div>
            </div>

            {/* Separator */}
            <div className="mx-6 mb-6 h-px bg-gray-100" />

            {/* Navigation Links */}
            <nav className="flex-1 px-3 xl:px-4 space-y-1 xl:space-y-2 overflow-y-auto no-scrollbar">
                {navItems.map((item, idx: number) => (
                    <NavItem
                        key={idx}
                        item={item}
                        isCollapsed={isCollapsed}
                        isDesktop={isDesktop}
                        pathname={pathname}
                        setMobileOpen={setMobileOpen}
                        setIsCollapsed={setIsCollapsed}
                    />
                ))}
            </nav>

            {/* Bottom Actions Area */}
            <div className="p-4 mt-auto space-y-2 hidden md:block">
                {/* Clean Collapse Toggle - Desktop Only */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className={cn(
                        "w-full flex items-center gap-4 px-5 py-3 rounded-[1.5rem] transition-all duration-200 text-gray-400 hover:bg-gray-50 hover:text-foreground",
                        isCollapsed ? "justify-center" : ""
                    )}
                >
                    {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                    {!isCollapsed && <span className="font-medium text-xs xl:text-sm">Collapse Sidebar</span>}
                </button>
            </div>
        </div>
    );
};

export function Sidebar({ mobileOpen = false, setMobileOpen }: { mobileOpen?: boolean; setMobileOpen?: (open: boolean) => void }) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const pathname = usePathname();
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const isWide = useMediaQuery("(min-width: 1280px)");

    // Animation Variants - 'Snap & Glide'
    const drawerVariants: Variants = {
        open: {
            x: 0,
            opacity: 1,
            scale: 1,
            transition: {
                type: "spring",
                stiffness: 300,
                damping: 30
            }
        },
        closed: {
            x: "-100%",
            opacity: 0,
            scale: 0.95,
            transition: {
                type: "tween",
                ease: "easeInOut",
                duration: 0.3
            }
        }
    };

    return (
        <>
            {/* Desktop Sidebar (Persistent) */}
            <motion.aside
                initial={false}
                animate={{ width: isCollapsed ? 90 : (isWide ? 340 : 260) }} // Responsive width: 340px on wide screens, 260px on laptops
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="hidden md:flex flex-col h-full shrink-0"
            >
                <div className="h-full w-full card-float p-0 rounded-[2.5rem] overflow-hidden">
                    <SidebarContent
                        isCollapsed={isCollapsed}
                        isDesktop={isDesktop}
                        pathname={pathname}
                        setMobileOpen={setMobileOpen}
                        setIsCollapsed={setIsCollapsed}
                    />
                </div>
            </motion.aside>

            {/* Mobile Sidebar (Drawer) */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            key="mobile-overlay"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            onClick={() => setMobileOpen?.(false)}
                            className="md:hidden fixed inset-0 bg-black/60 z-[90] backdrop-blur-sm"
                        />
                        <motion.aside
                            key="mobile-drawer"
                            initial="closed"
                            animate="open"
                            exit="closed"
                            variants={drawerVariants}
                            className="md:hidden fixed inset-y-4 left-4 z-[100] w-80 shadow-2xl"
                        >
                            <SidebarContent
                                isCollapsed={false}
                                isDesktop={false}
                                pathname={pathname}
                                setMobileOpen={setMobileOpen}
                                setIsCollapsed={setIsCollapsed}
                            />
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
