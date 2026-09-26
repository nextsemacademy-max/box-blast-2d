using System.Collections.Generic;
using UnityEngine;
using BoxBlast2D.Core;

namespace BoxBlast2D
{
    public static class ShapesDatabase
    {
        public static readonly List<ShapeData> AllShapes = new List<ShapeData>();

        static ShapesDatabase()
        {
            InitializeShapes();
        }

        private static void InitializeShapes()
        {
            AllShapes.Clear();

            // 1. Single Dot (1x1)
            AllShapes.Add(new ShapeData("dot-1", "Single Dot", new int[,] { { 1 } }, ColorTheme.Amber, 12));

            // 2. Line 2 (H & V)
            AllShapes.Add(new ShapeData("line-2-h", "Line 2 Horizontal", new int[,] { { 1, 1 } }, ColorTheme.Cyan, 15));
            AllShapes.Add(new ShapeData("line-2-v", "Line 2 Vertical", new int[,] { { 1 }, { 1 } }, ColorTheme.Cyan, 15));

            // 3. Line 3 (H & V)
            AllShapes.Add(new ShapeData("line-3-h", "Line 3 Horizontal", new int[,] { { 1, 1, 1 } }, ColorTheme.Emerald, 14));
            AllShapes.Add(new ShapeData("line-3-v", "Line 3 Vertical", new int[,] { { 1 }, { 1 }, { 1 } }, ColorTheme.Emerald, 14));

            // 4. Line 4 (H & V)
            AllShapes.Add(new ShapeData("line-4-h", "Line 4 Horizontal", new int[,] { { 1, 1, 1, 1 } }, ColorTheme.Sapphire, 10));
            AllShapes.Add(new ShapeData("line-4-v", "Line 4 Vertical", new int[,] { { 1 }, { 1 }, { 1 }, { 1 } }, ColorTheme.Sapphire, 10));

            // 5. Line 5 (H & V)
            AllShapes.Add(new ShapeData("line-5-h", "Line 5 Horizontal", new int[,] { { 1, 1, 1, 1, 1 } }, ColorTheme.Ruby, 6));
            AllShapes.Add(new ShapeData("line-5-v", "Line 5 Vertical", new int[,] { { 1 }, { 1 }, { 1 }, { 1 }, { 1 } }, ColorTheme.Ruby, 6));

            // 6. Square 2x2
            AllShapes.Add(new ShapeData("square-2x2", "Square 2x2", new int[,] { { 1, 1 }, { 1, 1 } }, ColorTheme.Purple, 14));

            // 7. Small Corner L (2x2) - 4 Rotations
            AllShapes.Add(new ShapeData("corner-small-1", "Corner Small TL", new int[,] { { 1, 1 }, { 1, 0 } }, ColorTheme.Pink, 12));
            AllShapes.Add(new ShapeData("corner-small-2", "Corner Small TR", new int[,] { { 1, 1 }, { 0, 1 } }, ColorTheme.Pink, 12));
            AllShapes.Add(new ShapeData("corner-small-3", "Corner Small BL", new int[,] { { 1, 0 }, { 1, 1 } }, ColorTheme.Pink, 12));
            AllShapes.Add(new ShapeData("corner-small-4", "Corner Small BR", new int[,] { { 0, 1 }, { 1, 1 } }, ColorTheme.Pink, 12));

            // 8. Large Corner L (3x3) - 4 Rotations
            AllShapes.Add(new ShapeData("corner-large-1", "Corner Large BL", new int[,] { { 1, 0, 0 }, { 1, 0, 0 }, { 1, 1, 1 } }, ColorTheme.Amber, 8));
            AllShapes.Add(new ShapeData("corner-large-2", "Corner Large BR", new int[,] { { 0, 0, 1 }, { 0, 0, 1 }, { 1, 1, 1 } }, ColorTheme.Amber, 8));
            AllShapes.Add(new ShapeData("corner-large-3", "Corner Large TL", new int[,] { { 1, 1, 1 }, { 1, 0, 0 }, { 1, 0, 0 } }, ColorTheme.Amber, 8));
            AllShapes.Add(new ShapeData("corner-large-4", "Corner Large TR", new int[,] { { 1, 1, 1 }, { 0, 0, 1 }, { 0, 0, 1 } }, ColorTheme.Amber, 8));

            // 9. Giant Square 3x3
            AllShapes.Add(new ShapeData("square-3x3", "Giant Square 3x3", new int[,] { { 1, 1, 1 }, { 1, 1, 1 }, { 1, 1, 1 } }, ColorTheme.Ruby, 5));

            // 10. T-Shape (4 Rotations)
            AllShapes.Add(new ShapeData("t-shape-down", "T-Shape Down", new int[,] { { 1, 1, 1 }, { 0, 1, 0 } }, ColorTheme.Purple, 10));
            AllShapes.Add(new ShapeData("t-shape-up", "T-Shape Up", new int[,] { { 0, 1, 0 }, { 1, 1, 1 } }, ColorTheme.Purple, 10));
            AllShapes.Add(new ShapeData("t-shape-left", "T-Shape Left", new int[,] { { 0, 1 }, { 1, 1 }, { 0, 1 } }, ColorTheme.Purple, 9));
            AllShapes.Add(new ShapeData("t-shape-right", "T-Shape Right", new int[,] { { 1, 0 }, { 1, 1 }, { 1, 0 } }, ColorTheme.Purple, 9));

            // 11. Z and S shapes
            AllShapes.Add(new ShapeData("z-shape", "Z-Shape Horizontal", new int[,] { { 1, 1, 0 }, { 0, 1, 1 } }, ColorTheme.Cyan, 9));
            AllShapes.Add(new ShapeData("z-shape-v", "Z-Shape Vertical", new int[,] { { 0, 1 }, { 1, 1 }, { 1, 0 } }, ColorTheme.Cyan, 8));
            AllShapes.Add(new ShapeData("s-shape", "S-Shape Horizontal", new int[,] { { 0, 1, 1 }, { 1, 1, 0 } }, ColorTheme.Emerald, 9));
            AllShapes.Add(new ShapeData("s-shape-v", "S-Shape Vertical", new int[,] { { 1, 0 }, { 1, 1 }, { 0, 1 } }, ColorTheme.Emerald, 8));

            // 12. Standard L and J Shapes (3x2)
            AllShapes.Add(new ShapeData("l-shape-1", "L-Shape BL", new int[,] { { 1, 0 }, { 1, 0 }, { 1, 1 } }, ColorTheme.Amber, 10));
            AllShapes.Add(new ShapeData("l-shape-2", "L-Shape BR", new int[,] { { 0, 1 }, { 0, 1 }, { 1, 1 } }, ColorTheme.Amber, 10));
            AllShapes.Add(new ShapeData("l-shape-3", "L-Shape TL", new int[,] { { 1, 1 }, { 1, 0 }, { 1, 0 } }, ColorTheme.Amber, 10));
            AllShapes.Add(new ShapeData("l-shape-4", "L-Shape TR", new int[,] { { 1, 1 }, { 0, 1 }, { 0, 1 } }, ColorTheme.Amber, 10));
        }

        public static ShapeData GetWeightedRandomShape(List<ShapeData> pool)
        {
            if (pool == null || pool.Count == 0) return AllShapes[0];

            int totalWeight = 0;
            for (int i = 0; i < pool.Count; i++) totalWeight += pool[i].weight;

            int randomVal = Random.Range(0, totalWeight);
            for (int i = 0; i < pool.Count; i++)
            {
                if (randomVal < pool[i].weight)
                {
                    return pool[i];
                }
                randomVal -= pool[i].weight;
            }

            return pool[0];
        }

        public static List<ShapeData> GenerateSmartHand(GridEngine grid)
        {
            int filledCount = grid.CountFilledCells();
            float fullness = (float)filledCount / (GridEngine.BoardSize * GridEngine.BoardSize);
            var nearLines = grid.GetNearCompleteLines();
            bool hasNearComplete = nearLines.rows.Count > 0 || nearLines.cols.Count > 0;

            // 1. Build an adaptive pool
            List<ShapeData> pool = new List<ShapeData>();
            for (int i = 0; i < AllShapes.Count; i++)
            {
                var s = AllShapes[i];
                if (fullness >= 0.45f)
                {
                    // Crowded board: completely ban giant 3x3 square, 5-lines, and large corners
                    if (s.id == "square-3x3" || s.id.StartsWith("line-5") || s.id.StartsWith("corner-large"))
                        continue;
                }
                else if (fullness >= 0.30f)
                {
                    // Moderate congestion: ban giant 3x3 square
                    if (s.id == "square-3x3") continue;
                }

                // Clone to modify weight without affecting static database
                var copy = new ShapeData(s.id, s.shapeName, new int[s.rows, s.cols], s.colorTheme, s.weight);
                System.Array.Copy(s.flattenedMatrix, copy.flattenedMatrix, s.flattenedMatrix.Length);

                if (fullness >= 0.30f && copy.id.StartsWith("line-5"))
                {
                    copy.weight = 2;
                }

                // 2. Saver boost
                if (hasNearComplete || fullness >= 0.35f)
                {
                    if (copy.id == "dot-1") copy.weight = 32;
                    else if (copy.id.StartsWith("line-2")) copy.weight = 25;
                    else if (copy.id.StartsWith("corner-small")) copy.weight = 20;
                }

                pool.Add(copy);
            }

            // 3. Find playable candidates
            List<ShapeData> playablePool = new List<ShapeData>();
            for (int i = 0; i < pool.Count; i++)
            {
                if (grid.CanFitAnywhere(pool[i]))
                {
                    playablePool.Add(pool[i]);
                }
            }

            List<ShapeData> hand = new List<ShapeData>();

            ShapeData PickPlayable()
            {
                if (playablePool.Count > 0) return GetWeightedRandomShape(playablePool);
                return AllShapes.Find(s => s.id == "dot-1") ?? AllShapes[0];
            }

            ShapeData PickGeneral()
            {
                var candidate = GetWeightedRandomShape(pool);
                if (grid.CanFitAnywhere(candidate)) return candidate;
                return PickPlayable();
            }

            // Slot 0 & 1: Guaranteed playable
            hand.Add(PickPlayable());
            hand.Add(PickPlayable());

            // Slot 2: Crowded guarantee or general
            if (fullness >= 0.35f)
            {
                hand.Add(PickPlayable());
            }
            else
            {
                hand.Add(PickGeneral());
            }

            return hand;
        }
    }
}
