using System.Collections.Generic;
using UnityEngine;
using BoxBlast2D.Core;

namespace BoxBlast2D.Gameplay
{
    public class BoardView : MonoBehaviour
    {
        public static BoardView Instance { get; private set; }

        [Header("Grid Layout Settings")]
        [SerializeField] private float cellSize = 0.76f;
        [SerializeField] private float cellSpacing = 0.08f;
        [SerializeField] private Vector2 boardCenter = new Vector2(0f, 0.6f);

        [Header("Cell Prefab & Sprites")]
        [SerializeField] private GameObject cellPrefab;
        [SerializeField] private Sprite cellBgSprite;
        [SerializeField] private Sprite blockSprite;
        [SerializeField] private Sprite iceSprite;
        [SerializeField] private Sprite relicSprite;

        private GridCellView[,] cells = new GridCellView[GridEngine.BoardSize, GridEngine.BoardSize];
        private List<Vector2Int> currentGhostCoords = new List<Vector2Int>();
        private List<int> currentPulsingRows = new List<int>();
        private List<int> currentPulsingCols = new List<int>();

        public float StepSize => cellSize + cellSpacing;

        private void Awake()
        {
            Instance = this;
        }

        public void InitializeGrid(GridEngine grid)
        {
            // Clear existing if any
            for (int r = 0; r < transform.childCount; r++)
            {
                Destroy(transform.GetChild(r).gameObject);
            }

            float totalWidth = GridEngine.BoardSize * cellSize + (GridEngine.BoardSize - 1) * cellSpacing;
            float startX = boardCenter.x - totalWidth * 0.5f + cellSize * 0.5f;
            float startY = boardCenter.y + totalWidth * 0.5f - cellSize * 0.5f;

            for (int r = 0; r < GridEngine.BoardSize; r++)
            {
                for (int c = 0; c < GridEngine.BoardSize; c++)
                {
                    Vector3 cellPos = new Vector3(startX + c * StepSize, startY - r * StepSize, 0f);
                    GameObject cellObj;
                    if (cellPrefab != null)
                    {
                        cellObj = Instantiate(cellPrefab, cellPos, Quaternion.identity, transform);
                    }
                    else
                    {
                        cellObj = CreateDefaultCellObject(cellPos);
                    }

                    cellObj.name = $"Cell_{r}_{c}";
                    GridCellView cellView = cellObj.GetComponent<GridCellView>();
                    if (cellView == null) cellView = cellObj.AddComponent<GridCellView>();

                    cellView.Init(r, c, cellBgSprite, blockSprite, iceSprite, relicSprite);
                    cells[r, c] = cellView;
                }
            }

            RefreshBoard(grid);
        }

        public Vector3 GridToWorldPosition(int row, int col)
        {
            if (cells[row, col] != null)
            {
                return cells[row, col].transform.position;
            }

            float totalWidth = GridEngine.BoardSize * cellSize + (GridEngine.BoardSize - 1) * cellSpacing;
            float startX = boardCenter.x - totalWidth * 0.5f + cellSize * 0.5f;
            float startY = boardCenter.y + totalWidth * 0.5f - cellSize * 0.5f;
            return new Vector3(startX + col * StepSize, startY - row * StepSize, 0f);
        }

        public Vector2Int? WorldToGridPosition(Vector3 worldPos)
        {
            float totalWidth = GridEngine.BoardSize * cellSize + (GridEngine.BoardSize - 1) * cellSpacing;
            float startX = boardCenter.x - totalWidth * 0.5f + cellSize * 0.5f;
            float startY = boardCenter.y + totalWidth * 0.5f - cellSize * 0.5f;

            float colFloat = (worldPos.x - startX + StepSize * 0.5f) / StepSize;
            float rowFloat = (startY - worldPos.y + StepSize * 0.5f) / StepSize;

            int col = Mathf.FloorToInt(colFloat);
            int row = Mathf.FloorToInt(rowFloat);

            if (row >= 0 && row < GridEngine.BoardSize && col >= 0 && col < GridEngine.BoardSize)
            {
                return new Vector2Int(row, col);
            }

            return null;
        }

        public void ShowGhostPreview(ShapeData shape, int startRow, int startCol, GridEngine grid)
        {
            ClearGhostPreview();

            if (!grid.CanPlaceShape(shape, startRow, startCol)) return;

            // Highlight ghost cells
            for (int r = 0; r < shape.rows; r++)
            {
                for (int c = 0; c < shape.cols; c++)
                {
                    if (shape.IsFilled(r, c))
                    {
                        int br = startRow + r;
                        int bc = startCol + c;
                        cells[br, bc].SetGhost(true, shape.colorTheme);
                        currentGhostCoords.Add(new Vector2Int(br, bc));
                    }
                }
            }

            // Predict cleared lines
            var (predRows, predCols) = grid.PredictClearedLines(shape, startRow, startCol);
            foreach (int pr in predRows)
            {
                currentPulsingRows.Add(pr);
                for (int c = 0; c < GridEngine.BoardSize; c++) cells[pr, c].SetLinePulse(true);
            }
            foreach (int pc in predCols)
            {
                currentPulsingCols.Add(pc);
                for (int r = 0; r < GridEngine.BoardSize; r++) cells[r, pc].SetLinePulse(true);
            }
        }

        public void ClearGhostPreview()
        {
            foreach (var coord in currentGhostCoords)
            {
                cells[coord.x, coord.y].SetGhost(false, ColorTheme.Cyan);
            }
            currentGhostCoords.Clear();

            foreach (int pr in currentPulsingRows)
            {
                for (int c = 0; c < GridEngine.BoardSize; c++) cells[pr, c].SetLinePulse(false);
            }
            currentPulsingRows.Clear();

            foreach (int pc in currentPulsingCols)
            {
                for (int r = 0; r < GridEngine.BoardSize; r++) cells[r, pc].SetLinePulse(false);
            }
            currentPulsingCols.Clear();
        }

        public void RefreshBoard(GridEngine grid)
        {
            for (int r = 0; r < GridEngine.BoardSize; r++)
            {
                for (int c = 0; c < GridEngine.BoardSize; c++)
                {
                    var cellData = grid.Board[r, c];
                    cells[r, c].SetFilled(cellData.filled, cellData.color);
                    cells[r, c].SetObstacle(cellData.obstacle, iceSprite, relicSprite);
                }
            }
        }

        public void AnimatePlacedShape(List<Vector2Int> coords)
        {
            foreach (var coord in coords)
            {
                cells[coord.x, coord.y].PlayPopIn();
            }
        }

        public void AnimateLineClears(List<int> rows, List<int> cols)
        {
            HashSet<Vector2Int> clearSet = new HashSet<Vector2Int>();
            foreach (int r in rows)
            {
                for (int c = 0; c < GridEngine.BoardSize; c++) clearSet.Add(new Vector2Int(r, c));
            }
            foreach (int c in cols)
            {
                for (int r = 0; r < GridEngine.BoardSize; r++) clearSet.Add(new Vector2Int(r, c));
            }

            foreach (var coord in clearSet)
            {
                cells[coord.x, coord.y].PlayBlastClear();
            }
        }

        private GameObject CreateDefaultCellObject(Vector3 pos)
        {
            GameObject cell = new GameObject("Cell");
            cell.transform.position = pos;
            cell.transform.SetParent(transform);

            // BG
            GameObject bgObj = new GameObject("BG");
            bgObj.transform.SetParent(cell.transform);
            bgObj.transform.localPosition = Vector3.zero;
            SpriteRenderer srBg = bgObj.AddComponent<SpriteRenderer>();
            srBg.sortingOrder = 0;

            // Block
            GameObject blockObj = new GameObject("Block");
            blockObj.transform.SetParent(cell.transform);
            blockObj.transform.localPosition = Vector3.zero;
            SpriteRenderer srBlock = blockObj.AddComponent<SpriteRenderer>();
            srBlock.sortingOrder = 1;

            // Overlay
            GameObject overlayObj = new GameObject("Overlay");
            overlayObj.transform.SetParent(cell.transform);
            overlayObj.transform.localPosition = Vector3.zero;
            SpriteRenderer srOverlay = overlayObj.AddComponent<SpriteRenderer>();
            srOverlay.sortingOrder = 2;

            var cellView = cell.AddComponent<GridCellView>();
            // Use reflection or serialized fields to wire up default renderers
            var type = typeof(GridCellView);
            var fBg = type.GetField("bgRenderer", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            if (fBg != null) fBg.SetValue(cellView, srBg);
            var fBlock = type.GetField("blockRenderer", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            if (fBlock != null) fBlock.SetValue(cellView, srBlock);
            var fOverlay = type.GetField("overlayRenderer", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);
            if (fOverlay != null) fOverlay.SetValue(cellView, srOverlay);

            return cell;
        }
    }
}
