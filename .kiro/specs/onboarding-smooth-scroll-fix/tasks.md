# Implementation Plan

- [-] 1. Fix LenisProvider to properly synchronize with GSAP and ScrollTrigger
  - Update `components/providers/LenisProvider.tsx` to add ScrollTrigger.refresh() after Lenis initialization
  - Ensure GSAP ticker is properly synchronized with Lenis raf
  - Add lag smoothing disable (gsap.ticker.lagSmoothing(0))
  - Verify cleanup properly removes ticker callbacks
  - _Requirements: 1.1, 1.2, 1.5, 3.3, 5.5_

- [ ] 1.1 Write unit test for LenisProvider configuration
  - **Example 7: GSAP ticker integration**
  - **Validates: Requirements 3.3**
  - **Example 8: Touch configuration**
  - **Validates: Requirements 4.1**
  - **Example 9: Easing function configuration**
  - **Validates: Requirements 5.3**
  - **Example 10: Lag smoothing disabled**
  - **Validates: Requirements 5.5**

- [ ] 1.2 Write unit test for LenisProvider cleanup
  - **Example 1: Cleanup verification**
  - **Validates: Requirements 1.5**

- [ ] 2. Update InfinityHero component to wait for Lenis initialization
  - Modify `components/onboarding/InfinityHero.tsx` to ensure ScrollTrigger instances are created after Lenis is ready
  - Add proper cleanup for all GSAP timelines and ScrollTrigger instances
  - Verify all existing animations (loop expansion, scaling, content fade) are preserved
  - _Requirements: 2.1, 2.5, 2.6_

- [ ] 2.1 Write unit test for InfinityHero ScrollTrigger configuration
  - **Example 2: ScrollTrigger configuration for InfinityHero**
  - **Validates: Requirements 2.1**
  - **Example 5: Animation preservation**
  - **Validates: Requirements 2.6**

- [ ] 3. Update ProtocolOverview component to wait for Lenis initialization
  - Modify `components/onboarding/ProtocolOverview.tsx` to ensure horizontal scroll ScrollTrigger is created after Lenis is ready
  - Verify snap points configuration works correctly with Lenis
  - Ensure all 5 panels scroll horizontally as designed
  - Add proper cleanup for ScrollTrigger instance
  - _Requirements: 2.2, 2.5_

- [ ] 3.1 Write unit test for ProtocolOverview ScrollTrigger configuration
  - **Example 3: Horizontal scroll configuration**
  - **Validates: Requirements 2.2**

- [ ] 4. Verify single Lenis instance on onboarding page
  - Ensure no duplicate scroll library instances are created
  - Verify LenisProvider is the only scroll implementation used
  - Test that onboarding page doesn't conflict with root ScrollProvider
  - _Requirements: 3.1, 3.2, 3.4_

- [ ] 4.1 Write unit test for single Lenis instance
  - **Example 6: Single Lenis instance**
  - **Validates: Requirements 3.1**

- [ ] 5. Manual testing and verification
  - Test smooth scrolling on desktop (wheel and trackpad)
  - Test touch scrolling on mobile devices
  - Verify infinity loop animation triggers correctly
  - Verify horizontal panel scrolling with snap points
  - Check for console errors or warnings
  - Monitor performance (60fps target)
  - Test navigation away and back for memory leaks
  - _Requirements: 1.3, 1.4, 2.3, 2.4, 4.2, 4.3, 4.4, 5.1, 5.2, 5.4_
