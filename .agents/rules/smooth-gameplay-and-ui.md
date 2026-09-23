# Box Blast 2D - Smooth Gameplay & UI Standards

## 1. 60fps / 120fps Silky Smooth Performance Architecture
- **Hardware Acceleration Only**: Use GPU-composited CSS properties (`transform: translate3d(...)`, `opacity`, `filter`) for all active animations, drag proxies, ghost pulses, and particle effects.
- **Zero Layout Thrashing During Drag**:
  - Never call `getBoundingClientRect()`, `offsetWidth`, `offsetHeight`, or `offsetTop` inside high-frequency `pointermove` handlers.
  - Pre-cache board geometry in `updateCachedBoardGeometry()` and synchronize via `ResizeObserver` on `boardElement`.
  - Always throttle drag proxy repositioning through `requestAnimationFrame(this.onDragTick)`.
- **Gesture Protection**: Maintain `touch-action: none` and `overscroll-behavior: none` globally to eliminate mobile browser pull-to-refresh jitter, page pinch-zoom, and bounce effects.

## 2. Pro Ergonomic Layout & Zero-Cutoff Budgeting
- **Unified Single-Row HUD**:
  - In **Classic Mode**: Display single-tier HUD with Score hero, Best record pill, and compact mode switcher.
  - In **Adventure Mode**: Replace classic header with the **Unified Pro Adventure HUD** (Level Map button, Target Goal card, Moves left counter, Settings button).
  - Never stack multiple redundant header rows.
- **Vertical Budgeting**:
  - Maintain `--reserved-vertical-space` (180px in Adventure mode, 220px in Classic mode).
  - The board container must always scale dynamically with `min(392px, calc(100% - 4px), calc(100dvh - var(--reserved-vertical-space)))` and `aspect-ratio: 1 / 1`.
  - The bottom hand-dock must ALWAYS remain 100% visible on all viewports with ergonomic breathing room.

## 3. Tactile Juice & Micro-Animations
- **Marble Jelly Pop**: Fresh placements must have snappy `marbleJellyPop` spring bounce (0.28s-0.32s cubic-bezier).
- **Elastic Spring Snapback**: Unplaced shapes must smoothly return to hand slot with hardware-accelerated 0.12s elastic ease.
- **Dynamic Piece Scaling**: Hand dock pieces scale matrix unit sizes (5-dim: 13px, 4-dim: 15px, 3-dim: 18px) to fit tray cards with comfortable padding.
