# 🧩 Box Blast 2D — Standalone Web & Mobile Game

An ultra-addictive, high-performance 2D block puzzle game inspired by **Block Blast!** (the highest ad-grossing mobile puzzle game on the Google Play Store). Built from scratch with **TypeScript**, **Vite**, and **Web Audio API**.

---

## ⚡ Quick Start

```bash
# 1. Navigate to directory
cd c:\Users\nextsem\Documents\box-blast-2d

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open your browser at `http://localhost:5174/` to play!

---

## 🎮 How to Play

1. **Drag Blocks**: Drag any of the 3 polyomino shapes from the bottom tray onto the 8×8 grid.
2. **Clear Lines**: Fill complete horizontal rows or vertical columns to blast them off the board!
3. **Trigger Combos**: Clear lines on consecutive turns to build massive **COMBO streaks** (Combo 2×, 3×, 4×...) with increasing musical pitch chords and exponential point bonuses.
4. **Avoid Getting Stuck**: When no remaining blocks in your hand can fit anywhere on the board, the game ends.
5. **Rewarded Ad Revive (Monetization Loop)**: Click the **"Revive (Watch Ad)"** button to trigger a 3×3 bomb clearing and receive 3 fresh playable blocks to continue your high-score run!

---

## 🏗️ Architectural Breakdown

| File | Purpose |
|---|---|
| `src/engine/types.ts` | Type definitions for shapes, colors, grid cells, and clear results. |
| `src/engine/Shapes.ts` | 20+ standard polyomino shapes (dots, lines, corners, squares, T/Z shapes) with probability weighting. |
| `src/engine/Grid.ts` | 8×8 matrix representation, boundary validation, line clear scanner, and legal move solver. |
| `src/engine/SoundFX.ts` | Musical pitch synthesizer (C4 to C5 scale on combos, tactile place thuds, revive fanfare). |
| `src/engine/Particles.ts` | Canvas-based explosion particles triggered on line clears. |
| `src/engine/Game.ts` | Core state manager, drag-and-drop with touch offset compensation, score computation, and UI updates. |
| `src/style.css` | Cyber dark design system (`#0e1117`), responsive sizing, and mobile viewport locks. |

---

## 💰 Monetization Secrets Behind Block Blast ($17.5M - $30M/mo)

1. **Rewarded Video Revive**: Players who are 1 move away from beating their record will enthusiastically watch a 30s ad to clear a 3×3 bomb zone and keep their streak alive (this generates high $18–$45 eCPMs).
2. **Post-Game Interstitials**: After a full run concludes, displaying an interstitial ad once every 2–3 runs monetizes non-paying players.
3. **Zero Latency / Instant Restart**: Keeping the core loop completely friction-free keeps session lengths long (often 25–40 minutes per player), generating dozens of ad impressions per user daily.
