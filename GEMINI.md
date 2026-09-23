# Box Blast 2D - Core Architectural Guidelines

## Performance & Smoothness (60fps / 120fps)
- All drag-and-drop and particle systems must run at native 60fps/120fps with zero layout thrashing.
- Drag events are throttled through `requestAnimationFrame` with cached board geometry.
- Hardware GPU acceleration (`transform: translate3d(...)`, `will-change`) is strictly required for animations.

## Layout & Proportions
- The entire game must always fit inside 100dvh without vertical overflow.
- In **Adventure Mode**, use the Unified Single-Row Pro HUD (Level map pill + Goal card + Moves chip + Settings). Never stack multiple redundant header rows.
- The bottom 3 hand-dock trays must ALWAYS be 100% visible and never clipped on any screen size.
- Board dimensions dynamically compute via `min(392px, calc(100% - 4px), calc(100dvh - var(--reserved-vertical-space)))`.
