# 🎮 Box Blast 2D — Unity 6 Game Engine Port

A high-performance 2D block puzzle game built in **Unity 6 (6000.6+)** with **C#**, matching the web & mobile architecture of **Box Blast 2D** 1-to-1.

---

## ⚡ Quick Start: Opening in Unity Hub

1. Open **Unity Hub**.
2. Click the **"Add"** button (or **Add project from disk**).
3. Select this folder:
   ```
   C:\Users\nextsem\Documents\box-blast-2d\unity
   ```
4. Select Unity Editor version **`6000.6.1f1`** (already installed on your machine).
5. Click to open the project!

---

## 🚀 1-Click Automated Scene Setup

Once Unity opens:
1. In the top Unity menu, click:
   ```
   Tools ➔ Box Blast 2D ➔ Setup Complete Game Scene
   ```
2. The setup tool will automatically:
   - Configure the Orthographic Camera and background color (`#0e1117`).
   - Import the 2D Sprites (`cell_bg`, `block`, `ice`, `relic`).
   - Construct the World-Space `BoardView`, `HandTray`, and `UI Canvas`.
   - Wire up `GameManager`, `BoosterManager`, `SoundManager`, `CameraShake`, and `BlockParticleManager`.
   - Save the active scene to `Assets/Scenes/MainGame.unity`.
3. Press **▶ Play** in the Unity Editor to start blasting blocks!

---

## 🏗️ Architectural Breakdown

| Script | Purpose |
|---|---|
| `Assets/Scripts/Core/GridEngine.cs` | Pure C# 9×9 matrix, boundary checks, line clear detection, obstacle hits, clean slate calculation, and booster blasts (Hammer, Rocket, Bomb). |
| `Assets/Scripts/Core/GameManager.cs` | Master state coordinator for **Classic** and **Adventure** modes, scoring, combo streaks, revive system, and win/fail triggers. |
| `Assets/Scripts/Data/ShapesDatabase.cs` | All 20+ polyomino shapes (dots, lines 2–5, 2×2, 3×3, corners, T, Z, S, L/J) with the **Smart Hand Fairness Algorithm** that prevents soft-locks. |
| `Assets/Scripts/Data/AdventureLevelData.cs` | Chapters, levels, objectives (`ClearLines`, `MeltIce`, `CollectRelics`, `TargetScore`), moves counter, and 3-star thresholds. |
| `Assets/Scripts/Data/ColorPalette.cs` | Cyber dark palette and vibrant jewel tones (Cyan, Amber, Ruby, Emerald, Purple, Sapphire, Pink). |
| `Assets/Scripts/Gameplay/BoardView.cs` | World-space 9×9 grid rendering, world-to-grid coordinate projection, ghost preview highlight, and line pulse animations. |
| `Assets/Scripts/Gameplay/GridCellView.cs` | Individual cell GameObject with layered background, block sprite, obstacle overlays, and pop-in/blast animations. |
| `Assets/Scripts/Gameplay/DraggablePiece.cs` | 120fps touch drag controller with **Touch Offset Y compensation** (lifts piece above finger), real-time ghost projection, and spring snapback. |
| `Assets/Scripts/Gameplay/HandTrayController.cs` | Manages the 3 bottom dock slots, restocking smart hands, and greying out unplayable pieces. |
| `Assets/Scripts/Boosters/BoosterManager.cs` | Interactive targeting and execution for **Hammer** (single cell), **Rocket** (cross blast), **Reroll** (fresh hand), and **Revive Bomb** (3×3). |
| `Assets/Scripts/Audio/SoundManager.cs` | Ascending musical pitch scaler (chromatic semitone scale on consecutive combos: C4 to C5), place thuds, and fanfare. |
| `Assets/Scripts/Juice/CameraShake.cs` | Procedural camera trauma shake on multi-line clears, combo streaks, and bomb blasts. |
| `Assets/Scripts/Juice/BlockParticleManager.cs` | Particle burst explosions matching the cleared block color. |
| `Assets/Scripts/UI/UIManager.cs` | Responsive HUD for Classic and Adventure modes, combo badges, booster counters, and Game Over / Victory modals. |
| `Assets/Scripts/Editor/BoxBlastSetupTool.cs` | Editor window tool for 1-click scene generation. |

---

## 📱 Mobile Optimization (60fps / 120fps)

- **Target Frame Rate**: Set `Application.targetFrameRate = 120;` in `GameManager.cs` for ultra-smooth 120Hz display refresh on modern Android and iOS devices.
- **Orientation**: Portrait (`ScreenOrientation.Portrait`).
- **Touch Drag Offset**: Built into `DraggablePiece.cs` (`touchOffsetY = 1.35f`) so the player's thumb never blocks the view of where the block will drop.
