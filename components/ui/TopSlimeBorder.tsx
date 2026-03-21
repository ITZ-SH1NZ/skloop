"use client";

import { memo } from "react";

export const TopSlimeBorder = memo(() => {
    return (
        <div className="absolute top-0 left-0 right-0 h-[160px] z-0 pointer-events-none overflow-visible">
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes wave-morph {
                    0%   { d: path("M0,0 L1440,0 L1440,55 Q1380,75 1320,58 Q1260,42 1200,62 Q1140,80 1080,60 Q1020,40 960,65 Q900,88 840,68 Q780,48 720,72 Q660,94 600,74 Q540,54 480,78 Q420,100 360,78 Q300,57 240,80 Q180,102 120,80 Q60,58 0,82 Z"); }
                    20%  { d: path("M0,0 L1440,0 L1440,62 Q1380,88 1320,66 Q1260,46 1200,70 Q1140,92 1080,68 Q1020,46 960,72 Q900,96 840,74 Q780,52 720,78 Q660,102 600,80 Q540,58 480,84 Q420,108 360,84 Q300,62 240,86 Q180,108 120,84 Q60,62 0,88 Z"); }
                    40%  { d: path("M0,0 L1440,0 L1440,48 Q1380,68 1320,50 Q1260,34 1200,54 Q1140,72 1080,52 Q1020,34 960,58 Q900,80 840,60 Q780,42 720,64 Q660,86 600,66 Q540,46 480,70 Q420,92 360,70 Q300,50 240,72 Q180,92 120,70 Q60,50 0,74 Z"); }
                    60%  { d: path("M0,0 L1440,0 L1440,70 Q1380,92 1320,70 Q1260,50 1200,74 Q1140,96 1080,72 Q1020,50 960,76 Q900,100 840,76 Q780,54 720,80 Q660,104 600,80 Q540,58 480,84 Q420,106 360,82 Q300,60 240,84 Q180,106 120,82 Q60,60 0,86 Z"); }
                    80%  { d: path("M0,0 L1440,0 L1440,52 Q1380,72 1320,54 Q1260,38 1200,58 Q1140,76 1080,56 Q1020,38 960,62 Q900,84 840,64 Q780,44 720,68 Q660,90 600,68 Q540,48 480,72 Q420,94 360,72 Q300,52 240,76 Q180,96 120,72 Q60,52 0,76 Z"); }
                    100% { d: path("M0,0 L1440,0 L1440,55 Q1380,75 1320,58 Q1260,42 1200,62 Q1140,80 1080,60 Q1020,40 960,65 Q900,88 840,68 Q780,48 720,72 Q660,94 600,74 Q540,54 480,78 Q420,100 360,78 Q300,57 240,80 Q180,102 120,80 Q60,58 0,82 Z"); }
                }

                @keyframes wave-morph-2 {
                    0%   { d: path("M0,0 L1440,0 L1440,42 Q1380,60 1320,44 Q1260,30 1200,48 Q1140,64 1080,46 Q1020,30 960,52 Q900,72 840,54 Q780,36 720,56 Q660,76 600,58 Q540,40 480,62 Q420,82 360,62 Q300,44 240,64 Q180,82 120,62 Q60,44 0,66 Z"); }
                    25%  { d: path("M0,0 L1440,0 L1440,50 Q1380,70 1320,52 Q1260,36 1200,56 Q1140,74 1080,54 Q1020,36 960,60 Q900,82 840,62 Q780,44 720,66 Q660,88 600,66 Q540,46 480,70 Q420,92 360,70 Q300,50 240,72 Q180,92 120,70 Q60,50 0,74 Z"); }
                    50%  { d: path("M0,0 L1440,0 L1440,36 Q1380,54 1320,38 Q1260,24 1200,42 Q1140,58 1080,40 Q1020,24 960,46 Q900,66 840,48 Q780,30 720,50 Q660,70 600,52 Q540,34 480,56 Q420,76 360,56 Q300,38 240,58 Q180,76 120,56 Q60,38 0,60 Z"); }
                    75%  { d: path("M0,0 L1440,0 L1440,56 Q1380,76 1320,58 Q1260,42 1200,62 Q1140,80 1080,60 Q1020,42 960,66 Q900,88 840,68 Q780,50 720,72 Q660,94 600,72 Q540,52 480,76 Q420,98 360,76 Q300,56 240,78 Q180,98 120,76 Q60,56 0,80 Z"); }
                    100% { d: path("M0,0 L1440,0 L1440,42 Q1380,60 1320,44 Q1260,30 1200,48 Q1140,64 1080,46 Q1020,30 960,52 Q900,72 840,54 Q780,36 720,56 Q660,76 600,58 Q540,40 480,62 Q420,82 360,62 Q300,44 240,64 Q180,82 120,62 Q60,44 0,66 Z"); }
                }

                .slime-main {
                    animation: wave-morph 7s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
                }

                .slime-highlight {
                    animation: wave-morph-2 5s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
                }

                @keyframes drip-fall {
                    0%   { transform: scaleY(0) translateY(0px);   opacity: 0; }
                    8%   { opacity: 1; }
                    60%  { transform: scaleY(1) translateY(0px);   opacity: 1; }
                    100% { transform: scaleY(1) translateY(48px);  opacity: 0; }
                }

                @keyframes bead-fall {
                    0%   { transform: translateY(0px);  opacity: 0; }
                    8%   { opacity: 1; }
                    55%  { transform: translateY(0px);  opacity: 1; }
                    100% { transform: translateY(44px); opacity: 0; }
                }

                .drip-neck {
                    transform-origin: top center;
                    animation: drip-fall linear infinite;
                }
                .drip-bead {
                    animation: bead-fall linear infinite;
                }

                .d1 .drip-neck, .d1 .drip-bead { animation-duration: 3.2s; animation-delay: 0s; }
                .d2 .drip-neck, .d2 .drip-bead { animation-duration: 2.8s; animation-delay: 0.7s; }
                .d3 .drip-neck, .d3 .drip-bead { animation-duration: 3.6s; animation-delay: 1.4s; }
                .d4 .drip-neck, .d4 .drip-bead { animation-duration: 2.5s; animation-delay: 0.3s; }
                .d5 .drip-neck, .d5 .drip-bead { animation-duration: 4.0s; animation-delay: 1.9s; }
                .d6 .drip-neck, .d6 .drip-bead { animation-duration: 3.0s; animation-delay: 0.9s; }
                .d7 .drip-neck, .d7 .drip-bead { animation-duration: 2.7s; animation-delay: 2.3s; }
                .d8 .drip-neck, .d8 .drip-bead { animation-duration: 3.5s; animation-delay: 1.1s; }

                @keyframes glow-pulse {
                    0%, 100% { opacity: 0.25; }
                    50%       { opacity: 0.55; }
                }

                .slime-glow {
                    animation: glow-pulse 3.5s ease-in-out infinite;
                }
            `}} />
            <svg viewBox="0 0 1440 160" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-[160px] overflow-visible">
                <defs>
                    <linearGradient id="slimeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#1d4210"/>
                        <stop offset="70%"  stopColor="#132d0b"/>
                        <stop offset="100%" stopColor="#0a1f06"/>
                    </linearGradient>

                    <linearGradient id="glowGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#a3e635" stopOpacity="0"/>
                        <stop offset="60%"  stopColor="#a3e635" stopOpacity="0.5"/>
                        <stop offset="100%" stopColor="#a3e635" stopOpacity="0"/>
                    </linearGradient>

                    <linearGradient id="sheenGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#d9f99d" stopOpacity="0.18"/>
                        <stop offset="100%" stopColor="#d9f99d" stopOpacity="0"/>
                    </linearGradient>

                    <linearGradient id="dripGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%"   stopColor="#1d4210"/>
                        <stop offset="100%" stopColor="#0f2a08"/>
                    </linearGradient>

                    <filter id="dripBlur" x="-30%" y="-10%" width="160%" height="130%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="1.2"/>
                    </filter>

                    <filter id="edgeGlow" x="-5%" y="-20%" width="110%" height="150%">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur"/>
                        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
                    </filter>
                </defs>

                <path className="slime-main" fill="url(#slimeGrad)" d="M0,0 L1440,0 L1440,55 Q1380,75 1320,58 Q1260,42 1200,62 Q1140,80 1080,60 Q1020,40 960,65 Q900,88 840,68 Q780,48 720,72 Q660,94 600,74 Q540,54 480,78 Q420,100 360,78 Q300,57 240,80 Q180,102 120,80 Q60,58 0,82 Z" />
                <path className="slime-main slime-glow" fill="none" stroke="url(#glowGrad)" strokeWidth="6" filter="url(#edgeGlow)" d="M0,82 Q60,58 120,80 Q180,102 240,80 Q300,57 360,78 Q420,100 480,78 Q540,54 600,74 Q660,94 720,72 Q780,48 840,68 Q900,88 960,65 Q1020,40 1080,60 Q1140,80 1200,62 Q1260,42 1320,58 Q1380,75 1440,55" />
                <path className="slime-highlight" fill="url(#sheenGrad)" d="M0,0 L1440,0 L1440,42 Q1380,60 1320,44 Q1260,30 1200,48 Q1140,64 1080,46 Q1020,30 960,52 Q900,72 840,54 Q780,36 720,56 Q660,76 600,58 Q540,40 480,62 Q420,82 360,62 Q300,44 240,64 Q180,82 120,62 Q60,44 0,66 Z" />

                <g filter="url(#dripBlur)">
                    <g className="d1"><ellipse className="drip-neck" cx="148" cy="91" rx="7" ry="20" fill="url(#dripGrad)"/><ellipse className="drip-bead" cx="148" cy="114" rx="6.5" ry="6.5" fill="#112905"/></g>
                    <g className="d2"><ellipse className="drip-neck" cx="302" cy="86" rx="5" ry="14" fill="url(#dripGrad)"/><ellipse className="drip-bead" cx="302" cy="102" rx="4.5" ry="4.5" fill="#112905"/></g>
                    <g className="d3"><ellipse className="drip-neck" cx="467" cy="90" rx="9" ry="24" fill="url(#dripGrad)"/><ellipse className="drip-bead" cx="467" cy="116" rx="8" ry="8" fill="#112905"/></g>
                    <g className="d4"><ellipse className="drip-neck" cx="621" cy="82" rx="6" ry="18" fill="url(#dripGrad)"/><ellipse className="drip-bead" cx="621" cy="102" rx="5.5" ry="5.5" fill="#112905"/></g>
                    <g className="d5"><ellipse className="drip-neck" cx="743" cy="80" rx="4.5" ry="28" fill="url(#dripGrad)"/><ellipse className="drip-bead" cx="743" cy="110" rx="4" ry="4" fill="#112905"/></g>
                    <g className="d6"><ellipse className="drip-neck" cx="888" cy="76" rx="7" ry="20" fill="url(#dripGrad)"/><ellipse className="drip-bead" cx="888" cy="98" rx="6" ry="6" fill="#112905"/></g>
                    <g className="d7"><ellipse className="drip-neck" cx="1062" cy="68" rx="5" ry="16" fill="url(#dripGrad)"/><ellipse className="drip-bead" cx="1062" cy="86" rx="4.5" ry="4.5" fill="#112905"/></g>
                    <g className="d8"><ellipse className="drip-neck" cx="1284" cy="64" rx="8.5" ry="22" fill="url(#dripGrad)"/><ellipse className="drip-bead" cx="1284" cy="88" rx="7.5" ry="7.5" fill="#112905"/></g>
                </g>
            </svg>
        </div>
    );
});
TopSlimeBorder.displayName = "TopSlimeBorder";
