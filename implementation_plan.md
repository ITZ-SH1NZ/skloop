# Implementation Plan: Duolingo-Level Polish & Animation Upgrade

This plan focuses on elevating the **Journey Map** and **Node interactions** to a world-class standard without altering the core "Skloop" aesthetic. We will transform the "basic" path into a living, breathing ecosystem.

---

## 1. The Living Journey Map (Visual Upgrade)
The current map is a 2D curve. We will upgrade it to feel like a high-end mobile game map.

### Action Items:
- [ ] **Reactive Path Edges**:
    - Add a "Depth" layer to the SVG path using multiple strokes and subtle shadows to give it a 3D "ribbon" feel.
    - Implement **Animated Data Flow**: Instead of a simple dash, use a custom SVG mask to show "energy pulses" flowing from completed nodes to the active node.
- [ ] **Dynamic Biomes**:
    - **Interactive Decorations**: Make trees, rocks, and fireflies reactive to the cursor. When the mouse moves near a firefly, it should "scurry" away (GSAP + Mouse move).
    - **Atmospheric Particles**: Use `tsparticles` to create localized environmental effects (e.g., drifting petals in the Forest, glowing dust in the Caves) that change intensity as you scroll.
- [ ] **Parallax Depth**:
    - Implement 3 layers of parallax:
        1. **Background**: Slow-moving distant mountains/clouds.
        2. **Midground**: The path and nodes.
        3. **Foreground**: Overlapping leaves or structures that blur when passing over the path to create extreme depth.

---

## 2. Advanced Node Interactivity ("The Note Team")
Nodes should feel like physical objects that you can "press" into the screen.

### Action Items:
- [ ] **Magnetic Haptic Nodes**:
    - Use Framer Motion's `useSpring` to make nodes "attract" the cursor when it's within a 100px radius.
    - Add a **Tilt Effect**: Nodes should slightly tilt towards the cursor when hovered (using CSS `transform: perspective(1000px) rotateX() rotateY()`).
- [ ] **Liquid Progress Fills**:
    - Instead of a solid color, the "completed" state of a node should fill with a **Liquid Wave** animation (SVG `<feTurbulence>`).
- [ ] **Status Transitions**:
    - When a node is unlocked, animate it from "Locked" to "Active" with a "Shatter" or "Dust Cloud" effect using Lottie.

---

## 3. Loopy: The Living Companion
Loopy should be the guide through the journey, not just a static image.

### Action Items:
- [ ] **The "Follower" Logic**:
    - Create a Loopy component that "floats" next to the **Active Node** on the map.
    - As the user scrolls, Loopy should have a "trailing" animation (Lerp/GSAP) so he feels like he's flying along the path.
- [ ] **State-Based Lottie Animations**:
    - **Idle**: Gentle floating/blinking.
    - **Hover**: Loopy looks at the cursor or waves.
    - **Level Up**: Loopy performs a "backflip" or celebration.

---

## 4. Responsive Sound Design (Tactile Feedback)
Every animation needs a corresponding sound to feel "insane."

### Action Items:
- [ ] **Path Navigation Sounds**:
    - Subtle "whoosh" sounds as the user scrolls past biome boundaries.
- [ ] **Node Feedback**:
    - **Hover**: A soft "pop" or "bubble" sound.
    - **Click**: A satisfying, heavy "thump" (the 3D push-button feel).
    - **Unlock**: A "magic chime" sound with a sparkle particle effect.

---

## 5. Technical Stack & Dependencies
We will use these specific tools for the upgrade:

| Package | Purpose |
| :--- | :--- |
| `@dotlottie/react-player` | For Loopy's character states and node unlock effects. |
| `framer-motion` | For spring physics, magnetic nodes, and layout transitions. |
| `gsap` | For complex timeline-based parallax and environmental animations. |
| `use-sound` | For the tactile audio layer. |
| `lucide-react` | (Already used) For clean, consistent iconography. |

---

## 6. Execution Roadmap (Phase 1)
1.  **Refactor `GamifiedPath.tsx`**: Add the 3D ribbon path and basic parallax layers.
2.  **Upgrade Node Logic**: Implement the Magnetic Tilt and 3D push-button physics.
3.  **Lottie Integration**: Add the first Loopy companion to the map.
4.  **Audio Layer**: Connect the `SoundManager` to node hover and click events.
