using System.Collections.Generic;
using UnityEngine;

namespace BoxBlast2D.Core
{
    public struct GridCellData
    {
        public bool filled;
        public ColorTheme color;
        public ObstacleType obstacle;
        public int obstacleHits;
    }

    public struct ClearResult
    {
        public List<int> clearedRows;
        public List<int> clearedCols;
        public int totalLines;
        public int cellsCleared;
        public List<Vector2Int> clearedObstacles;
    }

    public class GridEngine
    {
        public const int BoardSize = 9;
        public GridCellData[,] Board { get; private set; }

        public GridEngine()
        {
            Board = new GridCellData[BoardSize, BoardSize];
            Reset();
        }

        public void Reset()
        {
            for (int r = 0; r < BoardSize; r++)
            {
                for (int c = 0; c < BoardSize; c++)
                {
                    Board[r, c] = new GridCellData
                    {
                        filled = false,
                        color = ColorTheme.Cyan,
                        obstacle = ObstacleType.None,
                        obstacleHits = 0
                    };
                }
            }
        }

        public bool CanPlaceShape(ShapeData shape, int startRow, int startCol)
        {
            for (int r = 0; r < shape.rows; r++)
            {
                for (int c = 0; c < shape.cols; c++)
                {
                    if (shape.IsFilled(r, c))
                    {
                        int boardR = startRow + r;
                        int boardC = startCol + c;

                        if (boardR < 0 || boardR >= BoardSize || boardC < 0 || boardC >= BoardSize)
                            return false;

                        if (Board[boardR, boardC].filled)
                            return false;
                    }
                }
            }
            return true;
        }

        public List<Vector2Int> PlaceShape(ShapeData shape, int startRow, int startCol)
        {
            List<Vector2Int> placed = new List<Vector2Int>();
            for (int r = 0; r < shape.rows; r++)
            {
                for (int c = 0; c < shape.cols; c++)
                {
                    if (shape.IsFilled(r, c))
                    {
                        int boardR = startRow + r;
                        int boardC = startCol + c;

                        Board[boardR, boardC] = new GridCellData
                        {
                            filled = true,
                            color = shape.colorTheme,
                            obstacle = ObstacleType.None,
                            obstacleHits = 0
                        };
                        placed.Add(new Vector2Int(boardR, boardC));
                    }
                }
            }
            return placed;
        }

        public ClearResult CheckAndClearLines()
        {
            List<int> clearedRows = new List<int>();
            List<int> clearedCols = new List<int>();

            // 1. Check rows
            for (int r = 0; r < BoardSize; r++)
            {
                bool full = true;
                for (int c = 0; c < BoardSize; c++)
                {
                    if (!Board[r, c].filled)
                    {
                        full = false;
                        break;
                    }
                }
                if (full) clearedRows.Add(r);
            }

            // 2. Check columns
            for (int c = 0; c < BoardSize; c++)
            {
                bool full = true;
                for (int r = 0; r < BoardSize; r++)
                {
                    if (!Board[r, c].filled)
                    {
                        full = false;
                        break;
                    }
                }
                if (full) clearedCols.Add(c);
            }

            // 3. Clear cells
            HashSet<Vector2Int> clearedSet = new HashSet<Vector2Int>();
            foreach (int r in clearedRows)
            {
                for (int c = 0; c < BoardSize; c++) clearedSet.Add(new Vector2Int(r, c));
            }
            foreach (int c in clearedCols)
            {
                for (int r = 0; r < BoardSize; r++) clearedSet.Add(new Vector2Int(r, c));
            }

            List<Vector2Int> clearedObstacles = new List<Vector2Int>();
            foreach (var coord in clearedSet)
            {
                if (Board[coord.x, coord.y].obstacle != ObstacleType.None)
                {
                    clearedObstacles.Add(coord);
                }

                Board[coord.x, coord.y] = new GridCellData
                {
                    filled = false,
                    color = ColorTheme.Cyan,
                    obstacle = ObstacleType.None,
                    obstacleHits = 0
                };
            }

            return new ClearResult
            {
                clearedRows = clearedRows,
                clearedCols = clearedCols,
                totalLines = clearedRows.Count + clearedCols.Count,
                cellsCleared = clearedSet.Count,
                clearedObstacles = clearedObstacles
            };
        }

        public bool CanFitAnywhere(ShapeData shape)
        {
            for (int r = 0; r <= BoardSize - shape.rows; r++)
            {
                for (int c = 0; c <= BoardSize - shape.cols; c++)
                {
                    if (CanPlaceShape(shape, r, c))
                        return true;
                }
            }
            return false;
        }

        public (List<int> rows, List<int> cols) PredictClearedLines(ShapeData shape, int startRow, int startCol)
        {
            List<int> predRows = new List<int>();
            List<int> predCols = new List<int>();

            if (!CanPlaceShape(shape, startRow, startCol))
                return (predRows, predCols);

            // Predict rows
            for (int r = 0; r < BoardSize; r++)
            {
                bool willBeFull = true;
                for (int c = 0; c < BoardSize; c++)
                {
                    bool isFilled = Board[r, c].filled;
                    bool filledByShape = (r >= startRow && r < startRow + shape.rows &&
                                          c >= startCol && c < startCol + shape.cols &&
                                          shape.IsFilled(r - startRow, c - startCol));

                    if (!isFilled && !filledByShape)
                    {
                        willBeFull = false;
                        break;
                    }
                }
                if (willBeFull) predRows.Add(r);
            }

            // Predict columns
            for (int c = 0; c < BoardSize; c++)
            {
                bool willBeFull = true;
                for (int r = 0; r < BoardSize; r++)
                {
                    bool isFilled = Board[r, c].filled;
                    bool filledByShape = (r >= startRow && r < startRow + shape.rows &&
                                          c >= startCol && c < startCol + shape.cols &&
                                          shape.IsFilled(r - startRow, c - startCol));

                    if (!isFilled && !filledByShape)
                    {
                        willBeFull = false;
                        break;
                    }
                }
                if (willBeFull) predCols.Add(c);
            }

            return (predRows, predCols);
        }

        public List<Vector2Int> ClearBombArea(int centerR = 4, int centerC = 4)
        {
            List<Vector2Int> cleared = new List<Vector2Int>();
            for (int r = centerR - 1; r <= centerR + 1; r++)
            {
                for (int c = centerC - 1; c <= centerC + 1; c++)
                {
                    if (r >= 0 && r < BoardSize && c >= 0 && c < BoardSize)
                    {
                        if (Board[r, c].filled)
                        {
                            cleared.Add(new Vector2Int(r, c));
                            Board[r, c] = new GridCellData { filled = false };
                        }
                    }
                }
            }
            return cleared;
        }

        public bool ClearSingleCell(int r, int c, out GridCellData cellData)
        {
            cellData = default;
            if (r >= 0 && r < BoardSize && c >= 0 && c < BoardSize)
            {
                if (Board[r, c].filled)
                {
                    cellData = Board[r, c];
                    Board[r, c] = new GridCellData { filled = false };
                    return true;
                }
            }
            return false;
        }

        public List<Vector2Int> ClearCrossRocket(int targetR, int targetC)
        {
            List<Vector2Int> cleared = new List<Vector2Int>();
            HashSet<Vector2Int> unique = new HashSet<Vector2Int>();

            for (int c = 0; c < BoardSize; c++)
            {
                if (Board[targetR, c].filled)
                {
                    unique.Add(new Vector2Int(targetR, c));
                    Board[targetR, c] = new GridCellData { filled = false };
                }
            }

            for (int r = 0; r < BoardSize; r++)
            {
                if (Board[r, targetC].filled && !unique.Contains(new Vector2Int(r, targetC)))
                {
                    unique.Add(new Vector2Int(r, targetC));
                    Board[r, targetC] = new GridCellData { filled = false };
                }
            }

            cleared.AddRange(unique);
            return cleared;
        }

        public int CountFilledCells()
        {
            int count = 0;
            for (int r = 0; r < BoardSize; r++)
            {
                for (int c = 0; c < BoardSize; c++)
                {
                    if (Board[r, c].filled) count++;
                }
            }
            return count;
        }

        public bool IsCleanSlate()
        {
            return CountFilledCells() == 0;
        }

        public (List<int> rows, List<int> cols) GetNearCompleteLines()
        {
            List<int> nearRows = new List<int>();
            List<int> nearCols = new List<int>();

            for (int r = 0; r < BoardSize; r++)
            {
                int filled = 0;
                for (int c = 0; c < BoardSize; c++)
                {
                    if (Board[r, c].filled) filled++;
                }
                if (filled >= BoardSize - 2 && filled < BoardSize) nearRows.Add(r);
            }

            for (int c = 0; c < BoardSize; c++)
            {
                int filled = 0;
                for (int r = 0; r < BoardSize; r++)
                {
                    if (Board[r, c].filled) filled++;
                }
                if (filled >= BoardSize - 2 && filled < BoardSize) nearCols.Add(c);
            }

            return (nearRows, nearCols);
        }

        public void SetObstacle(int r, int c, ObstacleType obstacle, ColorTheme color)
        {
            if (r >= 0 && r < BoardSize && c >= 0 && c < BoardSize)
            {
                Board[r, c] = new GridCellData
                {
                    filled = true,
                    color = color,
                    obstacle = obstacle,
                    obstacleHits = 1
                };
            }
        }

        public int CountRemainingObstacles(ObstacleType? type = null)
        {
            int count = 0;
            for (int r = 0; r < BoardSize; r++)
            {
                for (int c = 0; c < BoardSize; c++)
                {
                    if (type.HasValue)
                    {
                        if (Board[r, c].obstacle == type.Value) count++;
                    }
                    else
                    {
                        if (Board[r, c].obstacle != ObstacleType.None) count++;
                    }
                }
            }
            return count;
        }
    }
}
