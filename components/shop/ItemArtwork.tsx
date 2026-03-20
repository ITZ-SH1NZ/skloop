import { memo } from "react";

export const ItemArtwork = memo(({ item, fallbackIcon: FallbackIcon }: { item: any, fallbackIcon: any }) => {
    const itemId = item.id;
    const accent = item.accentColor || "#ffffff";

    switch (itemId) {
        case "item_streak_shield":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_20px_rgba(96,165,250,0.4)]">
                        <defs>
                            <linearGradient id="shieldGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#60a5fa" />
                                <stop offset="100%" stopColor="#1e3a8a" />
                            </linearGradient>
                            <linearGradient id="shieldBorder" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#bfdbfe" />
                                <stop offset="100%" stopColor="#1e40af" />
                            </linearGradient>
                        </defs>
                        <path d="M50 10 L90 25 V50 C90 75 50 90 50 90 C50 90 10 75 10 50 V25 Z" fill="url(#shieldGrad)" stroke="url(#shieldBorder)" strokeWidth="3" />
                        <path d="M50 20 L80 32 V50 C80 68 50 80 50 80 C50 80 20 68 20 50 V32 Z" fill="#2563eb" opacity="0.5" />
                        <path d="M50 20 L80 32 V50 C80 68 50 80 50 80 Z" fill="#93c5fd" opacity="0.3" className="mix-blend-overlay" />
                        <circle cx="50" cy="45" r="8" fill="#eff6ff" className="animate-pulse" filter="blur(2px)"/>
                        <circle cx="50" cy="45" r="4" fill="#ffffff" />
                    </svg>
                </div>
            );
        case "title_junior_dev":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_20px_rgba(16,185,129,0.5)]">
                        <path d="M20 75 Q20 40 50 35 Q80 40 80 75 Q85 85 50 85 Q15 85 20 75 Z" fill="#34d399" />
                        <path d="M30 50 Q50 45 70 50 Q75 60 50 55 Q25 60 30 50 Z" fill="#a7f3d0" opacity="0.4" />
                        <rect x="25" y="52" width="22" height="16" rx="3" fill="none" stroke="#0f172a" strokeWidth="4.5" />
                        <rect x="53" y="52" width="22" height="16" rx="3" fill="none" stroke="#0f172a" strokeWidth="4.5" />
                        <line x1="47" y1="60" x2="53" y2="60" stroke="#0f172a" strokeWidth="4.5" />
                        <rect x="48" y="56" width="4" height="8" fill="#e2e8f0" />
                        <circle cx="36" cy="60" r="3" fill="#0f172a" />
                        <circle cx="64" cy="60" r="3" fill="#0f172a" />
                        <rect x="46" y="74" width="4" height="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                        <rect x="50" y="74" width="4" height="6" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" />
                        <path d="M35 35 Q50 15 65 35 Z" fill="#ef4444" stroke="#b91c1c" strokeWidth="2" strokeLinejoin="round" />
                        <line x1="50" y1="30" x2="50" y2="12" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
                        <ellipse cx="50" cy="12" rx="16" ry="4" fill="#3b82f6" opacity="0.9" />
                    </svg>
                </div>
            );
        case "title_algo_lord":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_25px_rgba(251,191,36,0.6)]">
                        <path d="M10 80 Q10 30 50 25 Q90 30 90 80 Q95 95 50 95 Q5 95 10 80 Z" fill="#fbbf24" />
                        <path d="M25 50 Q50 35 75 50 Q80 70 50 65 Q20 70 25 50 Z" fill="#fef3c7" opacity="0.4" />
                        <path d="M25 30 L35 5 L50 20 L65 5 L75 30 Z" fill="#b45309" stroke="#fcd34d" strokeWidth="3" strokeLinejoin="round" />
                        <circle cx="50" cy="18" r="4.5" fill="#ef4444" className="animate-pulse" />
                        <path d="M30 70 Q50 50 70 70 Q50 80 30 70 Z" fill="#f8fafc" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))" }} />
                        <line x1="32" y1="48" x2="45" y2="54" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
                        <line x1="68" y1="48" x2="55" y2="54" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
                        <circle cx="42" cy="56" r="2.5" fill="#0f172a" />
                        <circle cx="58" cy="56" r="2.5" fill="#0f172a" />
                    </svg>
                </div>
            );
        case "title_pixel_pusher":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_20px_rgba(244,63,94,0.4)]">
                         <defs>
                            <linearGradient id="zapGrad" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#fb7185" />
                                <stop offset="100%" stopColor="#be123c" />
                            </linearGradient>
                         </defs>
                         <path d="M55 10 L20 55 H50 L45 90 L80 45 H50 Z" fill="url(#zapGrad)" stroke="#fda4af" strokeWidth="2" strokeLinejoin="round" />
                         <rect x="25" y="20" width="8" height="8" fill="#fda4af" className="animate-pulse" />
                         <rect x="75" y="70" width="8" height="8" fill="#fda4af" className="animate-pulse" style={{ animationDelay: "0.5s" }} />
                         <rect x="20" y="75" width="6" height="6" fill="#f43f5e" />
                         <rect x="85" y="25" width="6" height="6" fill="#f43f5e" />
                    </svg>
                </div>
            );
        case "card_flexbox":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_25px_rgba(16,185,129,0.5)]">
                        <rect x="15" y="15" width="30" height="30" fill="#34d399" rx="6" />
                        <rect x="55" y="15" width="30" height="30" fill="#10b981" rx="6" />
                        <rect x="15" y="55" width="30" height="30" fill="#059669" rx="6" />
                        <rect x="55" y="55" width="30" height="30" fill="#047857" rx="6" />
                        <line x1="45" y1="30" x2="55" y2="30" stroke="#6ee7b7" strokeWidth="3" strokeDasharray="3" className="animate-pulse" />
                        <line x1="30" y1="45" x2="30" y2="55" stroke="#6ee7b7" strokeWidth="3" strokeDasharray="3" className="animate-pulse" />
                        <line x1="45" y1="70" x2="55" y2="70" stroke="#6ee7b7" strokeWidth="3" strokeDasharray="3" className="animate-pulse" />
                        <line x1="70" y1="45" x2="70" y2="55" stroke="#6ee7b7" strokeWidth="3" strokeDasharray="3" className="animate-pulse" />
                    </svg>
                </div>
            );
        case "card_binary_tree":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_25px_rgba(139,92,246,0.6)]">
                        <line x1="50" y1="20" x2="25" y2="45" stroke="#a78bfa" strokeWidth="4" />
                        <line x1="50" y1="20" x2="75" y2="45" stroke="#a78bfa" strokeWidth="4" />
                        <line x1="25" y1="45" x2="15" y2="75" stroke="#8b5cf6" strokeWidth="3" />
                        <line x1="25" y1="45" x2="35" y2="75" stroke="#8b5cf6" strokeWidth="3" />
                        <line x1="75" y1="45" x2="65" y2="75" stroke="#8b5cf6" strokeWidth="3" />
                        <line x1="75" y1="45" x2="85" y2="75" stroke="#8b5cf6" strokeWidth="3" />
                        <circle cx="50" cy="20" r="10" fill="#ede9fe" stroke="#6d28d9" strokeWidth="3" className="animate-pulse" />
                        <circle cx="25" cy="45" r="8" fill="#ddd6fe" stroke="#7c3aed" strokeWidth="3" />
                        <circle cx="75" cy="45" r="8" fill="#ddd6fe" stroke="#7c3aed" strokeWidth="3" />
                        <circle cx="15" cy="75" r="6" fill="#c4b5fd" />
                        <circle cx="35" cy="75" r="6" fill="#c4b5fd" />
                        <circle cx="65" cy="75" r="6" fill="#c4b5fd" />
                        <circle cx="85" cy="75" r="6" fill="#c4b5fd" />
                    </svg>
                </div>
            );
        case "ring_obsidian":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_30px_rgba(168,85,247,0.3)]">
                        <defs>
                            <linearGradient id="obsidianGrad" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#3f3f46" />
                                <stop offset="50%" stopColor="#18181b" />
                                <stop offset="100%" stopColor="#000000" />
                            </linearGradient>
                            <radialGradient id="ringGlow" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#581c87" stopOpacity="0" />
                            </radialGradient>
                        </defs>
                        <ellipse cx="50" cy="50" rx="40" ry="18" fill="url(#obsidianGrad)" stroke="#52525b" strokeWidth="2" />
                        <ellipse cx="50" cy="45" rx="30" ry="12" fill="#09090b" stroke="#27272a" strokeWidth="1" />
                        <circle cx="50" cy="45" r="10" fill="url(#ringGlow)" filter="blur(2px)" className="animate-pulse" />
                        <circle cx="50" cy="45" r="4" fill="#d8b4fe" />
                    </svg>
                </div>
            );
        case "ring_neon":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_20px_rgba(34,211,238,0.5)] animate-[spin_10s_linear_infinite]">
                        <defs>
                            <linearGradient id="neonGrad" x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor="#67e8f9" />
                                <stop offset="100%" stopColor="#0891b2" />
                            </linearGradient>
                            <filter id="neonBlur" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="4" />
                            </filter>
                        </defs>
                        <circle cx="50" cy="50" r="35" fill="none" stroke="#22d3ee" strokeWidth="6" filter="url(#neonBlur)" opacity="0.8" />
                        <circle cx="50" cy="50" r="35" fill="none" stroke="url(#neonGrad)" strokeWidth="4" />
                        <circle cx="50" cy="15" r="4" fill="#ffffff" filter="blur(1px)" />
                        <circle cx="85" cy="50" r="3" fill="#ffffff" filter="blur(1px)" />
                        <circle cx="15" cy="50" r="2" fill="#ffffff" filter="blur(1px)" />
                    </svg>
                </div>
            );
        
        // NEW DATABASE ITEM SVGS
        case "title_css_wizard":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_20px_rgba(129,140,248,0.5)]">
                        <path d="M20 10 L80 10 L70 80 L50 90 L30 80 Z" fill="#4f46e5" />
                        <path d="M50 15 L72 15 L64 74 L50 81 Z" fill="#6366f1" opacity="0.6" />
                        <text x="50" y="55" fontFamily="monospace" fontSize="28" fontWeight="bold" fill="#ffffff" textAnchor="middle">{`{}`}</text>
                        <circle cx="50" cy="50" r="30" fill="none" stroke="#a5b4fc" strokeWidth="2" strokeDasharray="4 8" className="animate-[spin_4s_linear_infinite]" />
                    </svg>
                </div>
            );
        case "title_vim_god":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_20px_rgba(22,163,74,0.5)]">
                        <rect x="10" y="20" width="80" height="60" rx="4" fill="#022c22" stroke="#10b981" strokeWidth="2" />
                        <rect x="10" y="20" width="80" height="12" fill="#064e3b" />
                        <circle cx="18" cy="26" r="2" fill="#ef4444" />
                        <circle cx="24" cy="26" r="2" fill="#eab308" />
                        <circle cx="30" cy="26" r="2" fill="#22c55e" />
                        <text x="18" y="50" fontFamily="monospace" fontSize="14" fill="#10b981">{`~`}</text>
                        <text x="18" y="65" fontFamily="monospace" fontSize="14" fill="#10b981">{`~`}</text>
                        <text x="18" y="75" fontFamily="monospace" fontSize="14" fill="#34d399" fontWeight="bold">{`:wq`}</text>
                        <rect x="42" y="65" width="8" height="12" fill="#34d399" className="animate-pulse" />
                    </svg>
                </div>
            );
        case "title_bug_hunter":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_20px_rgba(248,113,113,0.5)]">
                        {/* Splat */}
                        <path d="M30 40 Q50 20 70 40 Q90 50 70 60 Q50 80 30 60 Q10 50 30 40 Z" fill="#7f1d1d" opacity="0.6" />
                        {/* Bug Body */}
                        <ellipse cx="50" cy="50" rx="10" ry="15" fill="#f87171" />
                        <line x1="40" y1="40" x2="30" y2="30" stroke="#f87171" strokeWidth="2" />
                        <line x1="60" y1="40" x2="70" y2="30" stroke="#f87171" strokeWidth="2" />
                        <line x1="40" y1="60" x2="30" y2="70" stroke="#f87171" strokeWidth="2" />
                        <line x1="60" y1="60" x2="70" y2="70" stroke="#f87171" strokeWidth="2" />
                        {/* Magnifying Glass */}
                        <circle cx="55" cy="45" r="20" fill="rgba(254,226,226,0.2)" stroke="#fca5a5" strokeWidth="4" />
                        <line x1="69" y1="59" x2="85" y2="75" stroke="#fca5a5" strokeWidth="6" strokeLinecap="round" />
                        <circle cx="60" cy="40" r="5" fill="#ffffff" opacity="0.6" />
                    </svg>
                </div>
            );
        case "item_xp_booster":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_25px_rgba(16,185,129,0.5)]">
                        {/* Energy Flask */}
                        <path d="M40 20 L60 20 L60 30 L70 50 L70 80 Q70 90 50 90 Q30 90 30 80 L30 50 L40 30 Z" fill="#047857" stroke="#34d399" strokeWidth="3" />
                        <path d="M35 55 L65 55 L65 80 Q65 85 50 85 Q35 85 35 80 Z" fill="#10b981" />
                        {/* 2X Text */}
                        <text x="50" y="75" fontFamily="monospace" fontSize="18" fontWeight="bold" fill="#ffffff" textAnchor="middle">2X</text>
                        {/* Bubbles */}
                        <circle cx="45" cy="65" r="3" fill="#ffffff" opacity="0.7" className="animate-pulse" />
                        <circle cx="55" cy="70" r="2" fill="#ffffff" opacity="0.5" />
                        <circle cx="50" cy="50" r="4" fill="#a7f3d0" opacity="0.8" className="animate-bounce" />
                        <rect x="45" y="10" width="10" height="10" fill="#0f766e" rx="2" />
                    </svg>
                </div>
            );
        case "title_kernel_hacker":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_20px_rgba(34,197,94,0.5)]">
                        {/* Chip Base */}
                        <rect x="25" y="25" width="50" height="50" rx="5" fill="#14532d" stroke="#22c55e" strokeWidth="2" />
                        <rect x="35" y="35" width="30" height="30" rx="2" fill="#064e3b" />
                        {/* Pins */}
                        {[20, 30, 40, 50, 60, 70, 80].map(y => (
                            <g key={`pin-l-${y}`}>
                                <line x1="15" y1={y} x2="25" y2={y} stroke="#4ade80" strokeWidth="2" />
                                <line x1="75" y1={y} x2="85" y2={y} stroke="#4ade80" strokeWidth="2" />
                            </g>
                        ))}
                        {[20, 30, 40, 50, 60, 70, 80].map(x => (
                            <g key={`pin-t-${x}`}>
                                <line x1={x} y1="15" x2={x} y2="25" stroke="#4ade80" strokeWidth="2" />
                                <line x1={x} y1="75" x2={x} y2="85" stroke="#4ade80" strokeWidth="2" />
                            </g>
                        ))}
                        {/* Glowing Traces */}
                        <path d="M50 35 L50 25 M35 50 L25 50 M65 50 L75 50 M50 65 L50 75" stroke="#bbf7d0" strokeWidth="2" className="animate-pulse" />
                    </svg>
                </div>
            );
        case "title_null_pointer":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_20px_rgba(161,161,170,0.5)]">
                        <path d="M30 20 L70 50 L50 60 L60 85 L45 90 L35 65 L20 75 Z" fill="#71717a" stroke="#d4d4d8" strokeWidth="2" opacity="0.8" />
                        <path d="M35 15 L60 30" stroke="#f87171" strokeWidth="4" strokeDasharray="3" className="animate-pulse" />
                        <path d="M60 40 L80 40" stroke="#f87171" strokeWidth="4" strokeDasharray="3" className="animate-pulse" style={{animationDelay: '0.2s'}} />
                        <text x="50" y="55" fontFamily="monospace" fontSize="24" fontWeight="bold" fill="#ef4444" textAnchor="middle" transform="rotate(-15, 50, 50)">NULL</text>
                    </svg>
                </div>
            );
        case "title_git_master":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_20px_rgba(249,115,22,0.5)]">
                        <line x1="30" y1="20" x2="30" y2="80" stroke="#f97316" strokeWidth="6" />
                        <line x1="30" y1="30" x2="70" y2="50" stroke="#fb923c" strokeWidth="4" strokeDasharray="5" className="animate-[dash_2s_linear_infinite]" />
                        <line x1="70" y1="50" x2="30" y2="70" stroke="#fb923c" strokeWidth="4" strokeDasharray="5" className="animate-[dash_2s_linear_infinite]" />
                        <circle cx="30" cy="20" r="8" fill="#fdba74" stroke="#ea580c" strokeWidth="3" />
                        <circle cx="30" cy="50" r="8" fill="#fdba74" stroke="#ea580c" strokeWidth="3" />
                        <circle cx="30" cy="80" r="8" fill="#fdba74" stroke="#ea580c" strokeWidth="3" />
                        <circle cx="70" cy="50" r="10" fill="#f97316" stroke="#c2410c" strokeWidth="4" className="animate-pulse" />
                    </svg>
                </div>
            );
        case "title_stack_hero":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_20px_rgba(251,146,60,0.5)]">
                        <path d="M20 70 L50 85 L80 70 L50 55 Z" fill="#ea580c" />
                        <path d="M20 70 L50 85 L50 95 L20 80 Z" fill="#c2410c" />
                        <path d="M80 70 L50 85 L50 95 L80 80 Z" fill="#9a3412" />
                        
                        <path d="M25 55 L50 65 L75 55 L50 45 Z" fill="#f97316" className="animate-bounce" style={{animationDelay: '0ms'}} />
                        <path d="M30 40 L50 48 L70 40 L50 32 Z" fill="#fb923c" className="animate-bounce" style={{animationDelay: '100ms'}} />
                        <path d="M35 25 L50 31 L65 25 L50 19 Z" fill="#fdba74" className="animate-bounce" style={{animationDelay: '200ms'}} />
                    </svg>
                </div>
            );
        case "title_lead_arch":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_20px_rgba(100,116,139,0.5)]">
                        <rect x="10" y="10" width="80" height="80" fill="none" stroke="#475569" strokeWidth="1" strokeDasharray="4" opacity="0.5" />
                        <line x1="10" y1="50" x2="90" y2="50" stroke="#475569" strokeWidth="1" opacity="0.5" />
                        <line x1="50" y1="10" x2="50" y2="90" stroke="#475569" strokeWidth="1" opacity="0.5" />
                        {/* Compass */}
                        <path d="M20 80 L50 20 L80 80 L70 80 L50 40 L30 80 Z" fill="#94a3b8" />
                        <circle cx="50" cy="20" r="6" fill="#cbd5e1" stroke="#64748b" strokeWidth="3" />
                        <path d="M25 65 L75 65" stroke="#cbd5e1" strokeWidth="4" />
                        <circle cx="50" cy="50" r="15" fill="none" stroke="#60a5fa" strokeWidth="2" strokeDasharray="5" className="animate-[spin_6s_linear_infinite]" />
                    </svg>
                </div>
            );
        case "title_indie_maker":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_20px_rgba(56,189,248,0.5)]">
                        <path d="M50 90 Q40 100 30 90 Q40 80 50 90 Z" fill="#ef4444" className="animate-pulse" />
                        <path d="M50 85 Q45 95 40 85 Q45 75 50 85 Z" fill="#f59e0b" className="animate-pulse" style={{animationDelay: '100ms'}} />
                        <path d="M30 60 L40 50 L35 30 Z" fill="#0284c7" />
                        <path d="M70 60 L60 50 L65 30 Z" fill="#0284c7" />
                        <path d="M50 10 Q20 30 35 70 L65 70 Q80 30 50 10 Z" fill="#38bdf8" />
                        <circle cx="50" cy="40" r="10" fill="#0f172a" stroke="#bae6fd" strokeWidth="3" />
                        <circle cx="50" cy="40" r="3" fill="#bae6fd" />
                    </svg>
                </div>
            );
        case "title_the_compiler":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">
                        <path d="M50 15 L80 30 L80 70 L50 85 L20 70 L20 30 Z" fill="none" stroke="#f59e0b" strokeWidth="4" strokeDasharray="10 5" className="animate-[spin_10s_linear_infinite]" />
                        <circle cx="50" cy="50" r="20" fill="#d97706" />
                        <circle cx="50" cy="50" r="10" fill="#fef3c7" />
                        <path d="M35 35 L50 20 L65 35 L50 50 Z" fill="#fbbf24" opacity="0.8" />
                        <path d="M35 65 L50 50 L65 65 L50 80 Z" fill="#fbbf24" opacity="0.8" />
                        <rect x="45" y="45" width="10" height="10" fill="#ffffff" className="animate-ping" />
                    </svg>
                </div>
            );
        case "title_o1_guru":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#fbbf24" strokeWidth="6" />
                        <path d="M50 10 L50 5" stroke="#f59e0b" strokeWidth="4" />
                        <path d="M50 50 L50 20" stroke="#fef3c7" strokeWidth="6" strokeLinecap="round" className="animate-[spin_2s_linear_infinite]" style={{ transformOrigin: '50px 50px' }} />
                        <path d="M25 50 C25 35 45 35 50 50 C55 65 75 65 75 50 C75 35 55 35 50 50 C45 65 25 65 25 50 Z" fill="none" stroke="#b45309" strokeWidth="4" />
                        <text x="50" y="60" fontFamily="sans-serif" fontSize="32" fontWeight="900" fill="#ffffff" textAnchor="middle">1</text>
                    </svg>
                </div>
            );
        case "item_coin_magnet":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]">
                        <path d="M30 80 L30 40 A20 20 0 0 1 70 40 L70 80 L55 80 L55 40 A5 5 0 0 0 45 40 L45 80 Z" fill="#f59e0b" />
                        <rect x="25" y="75" width="10" height="10" fill="#dc2626" />
                        <rect x="65" y="75" width="10" height="10" fill="#e5e5e5" />
                        {/* Magnetic Waves */}
                        <path d="M30 15 Q50 5 70 15" fill="none" stroke="#fcd34d" strokeWidth="3" opacity="0.6" className="animate-pulse" />
                        <path d="M35 25 Q50 15 65 25" fill="none" stroke="#fcd34d" strokeWidth="3" opacity="0.8" className="animate-pulse" style={{animationDelay: '100ms'}} />
                        <circle cx="50" cy="20" r="6" fill="#fbbf24" className="animate-bounce" />
                    </svg>
                </div>
            );
        case "item_shield_plus":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_25px_rgba(96,165,250,0.6)]">
                        <path d="M50 5 L95 20 V50 C95 80 50 95 50 95 C50 95 5 80 5 50 V20 Z" fill="#1d4ed8" opacity="0.8" stroke="#60a5fa" strokeWidth="4" />
                        <path d="M50 15 L85 28 V50 C85 75 50 85 50 85 C50 85 15 75 15 50 V28 Z" fill="#2563eb" opacity="0.9" />
                        <path d="M50 25 L75 35 V50 C75 70 50 75 50 75 C50 75 25 70 25 50 V35 Z" fill="#3b82f6" opacity="1" />
                        <text x="50" y="60" fontFamily="sans-serif" fontSize="36" fontWeight="900" fill="#ffffff" textAnchor="middle" className="animate-pulse">+</text>
                    </svg>
                </div>
            );
        case "item_daily_skip":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                        <rect x="20" y="25" width="60" height="60" rx="8" fill="#6d28d9" stroke="#a78bfa" strokeWidth="3" />
                        <rect x="20" y="25" width="60" height="15" fill="#4c1d95" rx="8" />
                        <line x1="35" y1="15" x2="35" y2="35" stroke="#f3f4f6" strokeWidth="4" strokeLinecap="round" />
                        <line x1="65" y1="15" x2="65" y2="35" stroke="#f3f4f6" strokeWidth="4" strokeLinecap="round" />
                        <path d="M35 55 L50 65 L35 75 Z" fill="#ddd6fe" className="animate-pulse" />
                        <path d="M55 55 L70 65 L55 75 Z" fill="#ddd6fe" className="animate-pulse" style={{animationDelay: '150ms'}} />
                    </svg>
                </div>
            );
        case "ring_ruby_spark":
        case "ring_emerald_glow":
        case "ring_sapphire_pulse":
        case "ring_golden_ratio":
        case "ring_void_loop":
        case "ring_cyber_cyan": {
            // Reusing common geometric parameters with distinct color matrices
            let baseColor, glowColor, coreColor;
            if (itemId === "ring_ruby_spark") { baseColor = "#9f1239"; glowColor = "rgba(244,63,94,0.5)"; coreColor = "#f43f5e"; }
            else if (itemId === "ring_emerald_glow") { baseColor = "#065f46"; glowColor = "rgba(16,185,129,0.5)"; coreColor = "#10b981"; }
            else if (itemId === "ring_sapphire_pulse") { baseColor = "#1e3a8a"; glowColor = "rgba(59,130,246,0.5)"; coreColor = "#3b82f6"; }
            else if (itemId === "ring_golden_ratio") { baseColor = "#78350f"; glowColor = "rgba(245,158,11,0.5)"; coreColor = "#f59e0b"; }
            else if (itemId === "ring_void_loop") { baseColor = "#09090b"; glowColor = "rgba(168,85,247,0.8)"; coreColor = "#a855f7"; }
            else { baseColor = "#083344"; glowColor = "rgba(34,211,238,0.5)"; coreColor = "#22d3ee"; }

            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className={`w-[85%] h-[85%] drop-shadow-[0_0_25px_${glowColor}]`}>
                        {itemId === "ring_cyber_cyan" ? (
                            <polygon points="50,15 85,35 85,65 50,85 15,65 15,35" fill="none" stroke={coreColor} strokeWidth="6" className="animate-[spin_4s_linear_infinite]" style={{transformOrigin: '50px 50px'}} />
                        ) : (
                            <>
                                <ellipse cx="50" cy="50" rx="42" ry="20" fill={baseColor} stroke={coreColor} strokeWidth="2" />
                                <ellipse cx="50" cy="45" rx="32" ry="14" fill="#000000" opacity="0.6" stroke={coreColor} strokeWidth="1" />
                            </>
                        )}
                        <circle cx="50" cy="45" r="12" fill={coreColor} filter="blur(4px)" className="animate-pulse" />
                        <circle cx="50" cy="45" r="5" fill="#ffffff" />
                        {itemId === "ring_golden_ratio" && (
                            <path d="M50 45 Q70 45 70 65 Q70 80 50 80 Q35 80 35 65 Q35 55 50 55" fill="none" stroke="#ffffff" strokeWidth="2" opacity="0.8" />
                        )}
                    </svg>
                </div>
            );
        }
        case "card_first_commit":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_20px_rgba(212,212,216,0.4)]">
                        <rect x="25" y="60" width="50" height="20" rx="4" fill="#3f3f46" />
                        <text x="50" y="74" fontFamily="monospace" fontSize="12" fill="#a1a1aa" textAnchor="middle">init</text>
                        <path d="M50 60 Q40 40 30 25" fill="none" stroke="#10b981" strokeWidth="4" />
                        <path d="M50 60 Q60 40 70 25" fill="none" stroke="#10b981" strokeWidth="4" />
                        <circle cx="30" cy="25" r="6" fill="#34d399" className="animate-pulse" />
                        <circle cx="70" cy="25" r="6" fill="#34d399" className="animate-pulse" style={{animationDelay: '0.2s'}} />
                        <circle cx="50" cy="60" r="8" fill="#f4f4f5" />
                    </svg>
                </div>
            );
        case "card_legacy_code":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_20px_rgba(120,113,108,0.5)]">
                        <path d="M20 15 L80 20 L75 85 L25 80 Z" fill="#57534e" stroke="#78716c" strokeWidth="3" />
                        <line x1="30" y1="35" x2="60" y2="36" stroke="#fbbf24" strokeWidth="3" opacity="0.6" />
                        <line x1="32" y1="50" x2="65" y2="52" stroke="#fbbf24" strokeWidth="3" opacity="0.6" />
                        <line x1="28" y1="65" x2="50" y2="67" stroke="#fbbf24" strokeWidth="3" opacity="0.6" />
                        <circle cx="70" cy="68" r="4" fill="#ef4444" className="animate-pulse" />
                        <path d="M15 10 L45 35" stroke="#292524" strokeWidth="2" opacity="0.5" />
                    </svg>
                </div>
            );
        case "card_prod_error":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_30px_rgba(239,68,68,0.7)]">
                        <path d="M50 10 L90 85 H10 Z" fill="#b91c1c" stroke="#f87171" strokeWidth="4" strokeLinejoin="round" />
                        <rect x="46" y="35" width="8" height="25" rx="4" fill="#ffffff" className="animate-pulse" />
                        <circle cx="50" cy="73" r="5" fill="#ffffff" className="animate-ping" />
                        <circle cx="50" cy="73" r="4" fill="#ffffff" />
                    </svg>
                </div>
            );
        case "card_monolith":
            return (
                <div className="relative w-full h-full flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-500">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_25px_rgba(71,85,105,0.6)]">
                        <polygon points="30,20 70,10 70,80 30,90" fill="#1e293b" />
                        <polygon points="70,10 90,25 90,75 70,80" fill="#0f172a" />
                        <polygon points="30,20 50,35 90,25 70,10" fill="#334155" />
                        <circle cx="50" cy="50" r="3" fill="#cbd5e1" className="animate-pulse" />
                        <line x1="30" y1="40" x2="70" y2="30" stroke="#475569" strokeWidth="1" />
                        <line x1="30" y1="60" x2="70" y2="50" stroke="#475569" strokeWidth="1" />
                    </svg>
                </div>
            );
        case "card_microservice":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_20px_rgba(129,140,248,0.5)]">
                        {[
                            { cx: 50, cy: 50, r: 8 },
                            { cx: 20, cy: 30, r: 6 },
                            { cx: 80, cy: 30, r: 6 },
                            { cx: 30, cy: 80, r: 6 },
                            { cx: 70, cy: 80, r: 6 }
                        ].map((c, i) => (
                            <circle key={i} cx={c.cx} cy={c.cy} r={c.r} fill="#6366f1" stroke="#c7d2fe" strokeWidth="2" className="animate-pulse" style={{animationDelay: `${i * 150}ms`}} />
                        ))}
                        <path d="M50 50 L20 30 M50 50 L80 30 M50 50 L30 80 M50 50 L70 80 M20 30 L80 30 M30 80 L70 80" stroke="#818cf8" strokeWidth="2" opacity="0.5" strokeDasharray="3" className="animate-[spin_20s_linear_infinite]" style={{transformOrigin: '50px 50px'}} />
                    </svg>
                </div>
            );
        case "card_pull_request":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_20px_rgba(52,211,153,0.5)]">
                        <path d="M20 70 Q20 40 45 40 L45 30 L65 50 L45 70 L45 60 Q30 60 30 70 Z" fill="#34d399" opacity="0.8" />
                        <circle cx="75" cy="50" r="15" fill="none" stroke="#10b981" strokeWidth="4" />
                        <path d="M68 50 L73 55 L82 45" fill="none" stroke="#10b981" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
            );
        case "card_singleton":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_30px_rgba(139,92,246,0.7)]">
                        <defs>
                            <radialGradient id="singletonGlow" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="#a855f7" stopOpacity="0.8" />
                                <stop offset="100%" stopColor="#4c1d95" stopOpacity="0" />
                            </radialGradient>
                        </defs>
                        <circle cx="50" cy="50" r="40" fill="url(#singletonGlow)" />
                        <path d="M30 65 L40 35 L50 50 L60 35 L70 65 Z" fill="#c4b5fd" stroke="#fff" strokeWidth="2" strokeLinejoin="round" />
                        <circle cx="50" cy="50" r="3" fill="#ffffff" className="animate-pulse" />
                        <circle cx="40" cy="35" r="2" fill="#ffffff" />
                        <circle cx="60" cy="35" r="2" fill="#ffffff" />
                    </svg>
                </div>
            );
        case "card_binary_split":
            return (
                <div className="relative w-full h-full flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] drop-shadow-[0_0_20px_rgba(34,211,238,0.5)]">
                        <polygon points="20,30 45,40 45,80 20,70" fill="#0ea5e9" opacity="0.8" />
                        <polygon points="55,30 80,40 80,80 55,70" fill="#0284c7" opacity="0.8" />
                        <line x1="50" y1="10" x2="50" y2="90" stroke="#67e8f9" strokeWidth="4" className="animate-pulse" />
                        <circle cx="50" cy="10" r="4" fill="#ffffff" />
                        <circle cx="50" cy="90" r="4" fill="#ffffff" />
                    </svg>
                </div>
            );
        default:
            // Generic premium glowing isometric 3D box for any other backend item
            return (
                <div className="relative w-full h-full flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                    <svg viewBox="0 0 100 100" className="w-[85%] h-[85%]" style={{ filter: `drop-shadow(0 0 20px ${accent}60)` }}>
                        <defs>
                            <linearGradient id={`grad-${itemId}`} x1="0" y1="1" x2="1" y2="0">
                                <stop offset="0%" stopColor={accent} stopOpacity="0.8" />
                                <stop offset="100%" stopColor={accent} stopOpacity="0.2" />
                            </linearGradient>
                            <linearGradient id={`grad-glow-${itemId}`} x1="0" y1="0" x2="1" y2="1">
                                <stop offset="0%" stopColor={accent} stopOpacity="0.5" />
                                <stop offset="100%" stopColor="white" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        {/* Base Hexagon / Diamond shape */}
                        <polygon points="50,15 85,35 85,65 50,85 15,65 15,35" fill={`url(#grad-${itemId})`} stroke={accent} strokeWidth="2" />
                        <polygon points="50,15 85,35 50,55 15,35" fill={`url(#grad-glow-${itemId})`} opacity="0.7" />
                        <line x1="15" y1="35" x2="50" y2="55" stroke={accent} strokeWidth="2" opacity="0.5" />
                        <line x1="85" y1="35" x2="50" y2="55" stroke={accent} strokeWidth="2" opacity="0.5" />
                        <line x1="50" y1="55" x2="50" y2="85" stroke={accent} strokeWidth="2" opacity="0.5" />
                        
                        {/* Spinning ring around it */}
                        <circle cx="50" cy="50" r="38" fill="none" stroke={accent} strokeWidth="1" strokeDasharray="5 15" className="animate-[spin_8s_linear_infinite]" opacity="0.6" />
                    </svg>
                    
                    {/* The Lucide Icon projected mapping over top */}
                    <div className="absolute inset-0 flex items-center justify-center" style={{ transform: "translateZ(10px)" }}>
                        <FallbackIcon size={34} color="white" className="mix-blend-overlay opacity-90 drop-shadow-[0_0_10px_rgba(255,255,255,1)]" strokeWidth={1.5} />
                    </div>
                </div>
            );
    }
});
ItemArtwork.displayName = "ItemArtwork";
