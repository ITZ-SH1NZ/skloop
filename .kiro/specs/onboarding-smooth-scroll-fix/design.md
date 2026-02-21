# Design Document

## Overview

This design addresses the smooth scroll bugs on the onboarding page by consolidating to a single Lenis implementation, properly synchronizing GSAP ScrollTrigger, and ensuring all existing animations and visual effects are preserved. The solution isolates changes to the onboarding page only, without affecting other parts of the application.

## Architecture

### Current Issues

1. **Duplicate Scroll Libraries**: The onboarding page uses `LenisProvider` (ReactLenis wrapper), but there's also a separate `SmoothScroll` component in the codebase that creates conflicting Lenis instances
2. **GSAP Synchronization**: ScrollTrigger instances are created before Lenis is fully initialized, causing timing issues
3. **Ticker Management**: Multiple GSAP ticker callbacks may be registered, causing performance degradation
4. **ScrollTrigger Refresh**: ScrollTrigger needs to be refreshed after Lenis initializes, but this isn't happening consistently

### Proposed Solution

Use ReactLenis (via LenisProvider) as the single source of truth for smooth scrolling on the onboarding page. Ensure proper initialization order:

1. LenisProvider wraps the page content
2. Lenis initializes and becomes available via ref
3. GSAP ticker is synchronized with Lenis raf
4. ScrollTrigger instances are created in components
5. ScrollTrigger.refresh() is called after Lenis is ready

## Components and Interfaces

### Modified Components

#### 1. `app/onboarding/page.tsx`
- Already uses LenisProvider correctly
- No changes needed to the component structure
- Ensure LenisProvider configuration is optimal

#### 2. `components/providers/LenisProvider.tsx`
- Update to ensure proper GSAP ticker synchronization
- Add ScrollTrigger refresh after Lenis initialization
- Expose Lenis instance readiness state
- Optimize Lenis configuration for performance

#### 3. `components/onboarding/InfinityHero.tsx`
- Ensure ScrollTrigger instances wait for Lenis to be ready
- Add proper cleanup in useEffect return
- Verify ScrollTrigger configuration is compatible with Lenis

#### 4. `components/onboarding/ProtocolOverview.tsx`
- Ensure horizontal scroll ScrollTrigger waits for Lenis
- Verify snap points work correctly with Lenis
- Add proper cleanup

### Component Interaction Flow

```
LenisProvider (initializes)
    ↓
Lenis instance created
    ↓
GSAP ticker synchronized
    ↓
ScrollTrigger.refresh() called
    ↓
Child components mount
    ↓
ScrollTrigger instances created in components
    ↓
Animations work smoothly
```

## Data Models

### LenisProvider Configuration

```typescript
interface LenisOptions {
  lerp: number;           // Smoothness factor (0.1 = smooth)
  duration: number;       // Animation duration
  smoothWheel: boolean;   // Enable smooth wheel scrolling
  syncTouch: boolean;     // Sync touch events
  touchMultiplier: number; // Touch sensitivity
}
```

### ScrollTrigger Configuration

```typescript
interface ScrollTriggerConfig {
  trigger: HTMLElement;
  start: string;
  end: string;
  pin: boolean;
  scrub: number | boolean;
  snap?: {
    snapTo: number | number[];
    duration: { min: number; max: number };
    delay: number;
    ease: string;
  };
  anticipatePin: number;
  invalidateOnRefresh: boolean;
}
```

## Correctne
ss Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

Most of the requirements for this feature are related to visual smoothness, performance, and user experience, which are difficult to test programmatically. However, we can define some example-based tests to verify critical implementation details:

**Example 1: Cleanup verification**
When the onboarding page unmounts, verify that Lenis instance is destroyed and GSAP ticker callbacks are removed
**Validates: Requirements 1.5**

**Example 2: ScrollTrigger configuration for InfinityHero**
Verify that the InfinityHero component creates a ScrollTrigger with pin: true and proper start/end values
**Validates: Requirements 2.1**

**Example 3: Horizontal scroll configuration**
Verify that ProtocolOverview creates a ScrollTrigger with snap configuration for 5 panels
**Validates: Requirements 2.2**

**Example 4: ScrollTrigger refresh after init**
Verify that ScrollTrigger.refresh() is called after Lenis initialization completes
**Validates: Requirements 2.5**

**Example 5: Animation preservation**
Verify that the infinity loop path animation and scaling timeline still exist in InfinityHero
**Validates: Requirements 2.6**

**Example 6: Single Lenis instance**
Verify that only one Lenis instance is created when the onboarding page renders
**Validates: Requirements 3.1**

**Example 7: GSAP ticker integration**
Verify that a GSAP ticker callback is registered that calls lenis.raf()
**Validates: Requirements 3.3**

**Example 8: Touch configuration**
Verify that Lenis is configured with syncTouch: true and appropriate touchMultiplier
**Validates: Requirements 4.1**

**Example 9: Easing function configuration**
Verify that Lenis is configured with a custom easing function
**Validates: Requirements 5.3**

**Example 10: Lag smoothing disabled**
Verify that gsap.ticker.lagSmoothing(0) is called during initialization
**Validates: Requirements 5.5**

## Error Handling

### Initialization Errors

- If Lenis fails to initialize, log error to console and fall back to native scrolling
- If GSAP or ScrollTrigger is not available, log warning and skip scroll animations
- If window is undefined (SSR), skip all scroll initialization

### Runtime Errors

- Wrap ScrollTrigger creation in try-catch blocks to prevent component crashes
- If ScrollTrigger.refresh() fails, log warning but continue execution
- Handle missing DOM elements gracefully in scroll animations

### Cleanup Errors

- Ensure cleanup functions handle cases where instances may already be destroyed
- Use optional chaining when calling destroy methods
- Catch and log any errors during unmount to prevent memory leaks

## Testing Strategy

### Unit Testing

Since most of the functionality is visual and performance-related, unit testing will focus on:

1. **Configuration verification**: Test that Lenis and ScrollTrigger are configured with correct options
2. **Lifecycle management**: Test that initialization and cleanup happen in the correct order
3. **Integration points**: Test that GSAP ticker is properly connected to Lenis

### Property-Based Testing

This feature is not well-suited for property-based testing because:
- Most requirements are about visual smoothness and performance
- Scroll behavior is environment-dependent (browser, device, input method)
- Animation timing is subjective and hard to quantify

Therefore, we will rely primarily on manual testing and example-based unit tests.

### Manual Testing Checklist

1. **Smooth scrolling**: Verify momentum-based scrolling feels natural
2. **Infinity loop animation**: Verify loop expands and fades correctly on scroll
3. **Horizontal panels**: Verify 5 panels scroll horizontally with snap points
4. **Mobile touch**: Test on mobile devices for touch responsiveness
5. **Performance**: Monitor frame rate during scroll (should be 60fps)
6. **No conflicts**: Verify no console errors or warnings
7. **Cleanup**: Navigate away and back to verify no memory leaks

### Testing Framework

- **Unit tests**: Jest + React Testing Library
- **Component tests**: Test that components render and configure ScrollTrigger correctly
- **Integration tests**: Test that Lenis and GSAP work together without conflicts

## Implementation Notes

### Key Changes

1. **LenisProvider.tsx**: 
   - Add proper ScrollTrigger.refresh() after Lenis init
   - Ensure single GSAP ticker callback
   - Add lag smoothing disable

2. **InfinityHero.tsx**:
   - Wait for Lenis to be ready before creating ScrollTrigger
   - Improve cleanup in useEffect return

3. **ProtocolOverview.tsx**:
   - Wait for Lenis to be ready before creating ScrollTrigger
   - Verify snap configuration works with Lenis

### Performance Optimizations

- Use `will-change-transform` on animated elements (already present)
- Disable lag smoothing to prevent jumpiness
- Use GSAP ticker for consistent frame timing
- Set appropriate lerp value (0.1) for smooth but responsive scrolling

### Browser Compatibility

- Lenis works in all modern browsers (Chrome, Firefox, Safari, Edge)
- Fallback to native scrolling if Lenis fails to initialize
- Touch events work on mobile Safari and Chrome

## Dependencies

- `lenis` (already installed)
- `lenis/react` (ReactLenis wrapper, already installed)
- `gsap` (already installed)
- `gsap/dist/ScrollTrigger` (already installed)
- `framer-motion` (already installed, used for other animations)

No new dependencies required.
