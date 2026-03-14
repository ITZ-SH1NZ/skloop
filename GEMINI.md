# GEMINI.md - Skloop Engineering Context

## Project Overview
**Skloop** is a high-fidelity "Habit Engineering Platform" designed to gamify technical mastery. It bridges the "Motivation Gap" in learning to code through visceral UI, immersive animations, and social mechanics.

### Core Stack
- **Frontend**: Next.js 16 (App Router), React 19, TypeScript.
- **Styling**: Tailwind CSS 4.
- **Animations**: Framer Motion (for micro-interactions & physics) and GSAP (for timeline-based environment animations).
- **Backend**: Supabase (Auth, PostgreSQL, Realtime, Storage).
- **AI Engine**: Groq (Llama 3.3 70B).
- **Interactive Layers**: Monaco Editor (IDE), Lenis (Smooth Scroll), @xyflow/react (Graph visualization).

## Architectural Patterns
- **Biome-Based Roadmaps**: The journey map (`GamifiedPath.tsx`) is divided into visual biomes (Grasslands, Mystical Forest, Crystal Caves) that change dynamically based on scroll position.
- **Shared Element Transitions**: Uses Framer Motion's `layoutId` to morph map nodes into detail cards, eliminating jarring page loads.
- **GPU-Accelerated VFX**: Environmental assets (leaves, fireflies, mist) are memoized and use hardware-accelerated transforms (`z: 0`, `will-change-transform`) for 60fps performance.
- **Loopy AI**: A stateful, emotional mascot guide (`LoopyMascot`) that reacts to user interactions and progress through hand-coded SVG animations and contextual dialogue.

## Development Standards

### 1. Motion & Physicality
- Every interaction must have a physical feel. Use **Spring Physics** over ease-based transitions for UI elements.
- Prefer **Squash and Stretch** animations for characters and environmental assets to maintain a "tactile toy" aesthetic.
- **Zero Lag Mandate**: Complex SVG animations must be wrapped in `React.memo` and rendered only after client-side mount (`isMounted` check) to prevent hydration mismatches and CPU bottlenecks.

### 2. Styling
- Use **Tailwind CSS 4** utility classes.
- Follow the "Porcelain" standard: high-end, clean UI with subtle gradients, backdrop blurs, and deep shadows.

### 3. State & Data
- **Supabase**: Primary source of truth. Use `useUser` context for profile and XP data.
- **SWR**: Preferred for client-side data fetching and optimistic UI updates.

## Key Build & Run Commands
- **Development**: `npm run dev`
- **Build**: `npm run build`
- **Production Start**: `npm run start`
- **Linting**: `npm run lint`

## instructional Context for Gemini
When making UI changes:
1. **Always** check for hydration mismatches when adding randomized elements (jitter, seeds).
2. **Always** implement responsive density: reduce particle counts and remove heavy parallax (vines, large blurs) on mobile (`isMobile` check).
3. **Always** use hardware acceleration (`z: 0`) for any element that moves on scroll or hover.
4. **Dialogue**: When updating Loopy's text, maintain the "Contextual Storytelling" arc: encourage beginners, challenge intermediates, and acknowledge experts.
