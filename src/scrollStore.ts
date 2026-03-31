/**
 * Shared store that bridges R3F's useScroll (inside Canvas) 
 * to plain HTML/React components (outside Canvas).
 * 
 * A ScrollTracker component inside the Canvas writes to this,
 * and SineCarousel reads from it in its requestAnimationFrame loop.
 */
export const scrollStore = {
  /** Raw scroll.offset from ScrollControls (0 → 1) */
  offset: 0,
};
