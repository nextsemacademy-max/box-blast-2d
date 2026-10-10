using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using BoxBlast2D.Core;

namespace BoxBlast2D.Gameplay
{
    public class DraggablePiece : MonoBehaviour
    {
        public ShapeData Shape { get; private set; }
        public int SlotIndex { get; private set; }

        [Header("Drag Settings")]
        [SerializeField] private float touchOffsetY = 1.35f; // Lifts piece above finger on mobile
        [SerializeField] private float dockScale = 0.65f;
        [SerializeField] private float dragScale = 1.0f;

        private Vector3 dockPosition;
        private bool isDragging = false;
        private Camera mainCamera;
        private List<SpriteRenderer> blockRenderers = new List<SpriteRenderer>();
        private Collider2D pieceCollider;
        private Coroutine snapbackCoroutine;

        private static DraggablePiece activeDraggingPiece = null;

        public void Initialize(ShapeData shape, int slotIndex, Vector3 spawnDockPos, Sprite blockSprite)
        {
            Shape = shape;
            SlotIndex = slotIndex;
            dockPosition = spawnDockPos;
            transform.position = dockPosition;
            transform.localScale = Vector3.one * dockScale;
            mainCamera = Camera.main;

            BuildVisuals(blockSprite);
        }

        private void BuildVisuals(Sprite blockSprite)
        {
            // Clear children if any
            for (int i = transform.childCount - 1; i >= 0; i--)
            {
                Destroy(transform.GetChild(i).gameObject);
            }
            blockRenderers.Clear();

            float step = BoardView.Instance != null ? BoardView.Instance.StepSize : 0.84f;
            float totalW = shapeWidth(Shape) * step;
            float totalH = shapeHeight(Shape) * step;

            // Center blocks around piece pivot
            float offsetX = -totalW * 0.5f + step * 0.5f;
            float offsetY = totalH * 0.5f - step * 0.5f;

            Color blockCol = ColorPalette.GetColor(Shape.colorTheme);

            for (int r = 0; r < Shape.rows; r++)
            {
                for (int c = 0; c < Shape.cols; c++)
                {
                    if (Shape.IsFilled(r, c))
                    {
                        GameObject b = new GameObject($"B_{r}_{c}");
                        b.transform.SetParent(transform);
                        b.transform.localPosition = new Vector3(offsetX + c * step, offsetY - r * step, 0f);

                        SpriteRenderer sr = b.AddComponent<SpriteRenderer>();
                        sr.sprite = blockSprite;
                        sr.color = blockCol;
                        sr.sortingOrder = 10;
                        blockRenderers.Add(sr);
                    }
                }
            }

            // Add BoxCollider2D covering the shape for touch/click detection
            pieceCollider = GetComponent<Collider2D>();
            if (pieceCollider == null)
            {
                BoxCollider2D box = gameObject.AddComponent<BoxCollider2D>();
                box.size = new Vector2(Mathf.Max(totalW, 1.2f), Mathf.Max(totalH, 1.2f));
                pieceCollider = box;
            }
        }

        private int shapeWidth(ShapeData s) => s.cols;
        private int shapeHeight(ShapeData s) => s.rows;

        public void SetPlayableTint(bool canPlay)
        {
            Color baseCol = ColorPalette.GetColor(Shape.colorTheme);
            if (!canPlay)
            {
                baseCol = Color.Lerp(baseCol, Color.gray, 0.65f);
                baseCol.a = 0.45f;
            }
            else
            {
                baseCol.a = 1.0f;
            }

            foreach (var sr in blockRenderers)
            {
                if (sr != null) sr.color = baseCol;
            }
        }

        private void Update()
        {
            if (mainCamera == null) mainCamera = Camera.main;
            if (mainCamera == null) return;

            if (activeDraggingPiece == null)
            {
                if (Input.GetMouseButtonDown(0))
                {
                    Vector3 mouseWorld3 = mainCamera.ScreenToWorldPoint(Input.mousePosition);
                    Vector2 mouseWorld = new Vector2(mouseWorld3.x, mouseWorld3.y);

                    bool hit = false;
                    if (pieceCollider != null && pieceCollider.OverlapPoint(mouseWorld))
                    {
                        hit = true;
                    }
                    else
                    {
                        float grabRadius = Mathf.Max(shapeWidth(Shape), shapeHeight(Shape)) * (BoardView.Instance != null ? BoardView.Instance.StepSize : 0.84f) * 0.5f * dockScale + 0.4f;
                        if (Vector2.Distance(mouseWorld, transform.position) <= grabRadius)
                        {
                            hit = true;
                        }
                    }

                    if (hit)
                    {
                        StartDrag();
                    }
                }
            }
            else if (activeDraggingPiece == this)
            {
                if (Input.GetMouseButton(0))
                {
                    ContinueDrag();
                }
                else if (Input.GetMouseButtonUp(0))
                {
                    EndDrag();
                }
            }
        }

        private void StartDrag()
        {
            if (snapbackCoroutine != null) StopCoroutine(snapbackCoroutine);

            activeDraggingPiece = this;
            isDragging = true;
            transform.localScale = Vector3.one * dragScale;

            UpdateSortingOrder(25);
            Audio.SoundManager.Instance?.PlayPickup();
            UpdatePositionWithPointer();
            CheckGhostPlacement();
        }

        private void ContinueDrag()
        {
            if (!isDragging) return;
            UpdatePositionWithPointer();
            CheckGhostPlacement();
        }

        private void EndDrag()
        {
            if (!isDragging) return;
            isDragging = false;
            activeDraggingPiece = null;
            UpdateSortingOrder(10);

            BoardView.Instance?.ClearGhostPreview();

            // Try placement
            Vector2Int? targetGridPos = GetTargetGridPosition();
            if (targetGridPos.HasValue && GameManager.Instance != null &&
                GameManager.Instance.TryPlacePiece(this, targetGridPos.Value.x, targetGridPos.Value.y))
            {
                // Successfully placed!
                Destroy(gameObject);
            }
            else
            {
                // Snapback to dock slot
                snapbackCoroutine = StartCoroutine(AnimateSnapback());
            }
        }

        private void UpdatePositionWithPointer()
        {
            if (mainCamera == null) mainCamera = Camera.main;
            if (mainCamera == null) return;

            Vector3 mouseWorld = mainCamera.ScreenToWorldPoint(Input.mousePosition);
            mouseWorld.z = 0f;
            float offsetY = Application.isMobilePlatform ? touchOffsetY : 0.35f;
            mouseWorld.y += offsetY;
            transform.position = mouseWorld;
        }

        private void CheckGhostPlacement()
        {
            Vector2Int? targetPos = GetTargetGridPosition();
            if (targetPos.HasValue && GameManager.Instance != null)
            {
                BoardView.Instance.ShowGhostPreview(Shape, targetPos.Value.x, targetPos.Value.y, GameManager.Instance.Grid);
            }
            else
            {
                BoardView.Instance.ClearGhostPreview();
            }
        }

        private Vector2Int? GetTargetGridPosition()
        {
            if (BoardView.Instance == null) return null;

            float step = BoardView.Instance.StepSize;
            float totalW = shapeWidth(Shape) * step;
            float totalH = shapeHeight(Shape) * step;

            // Top-left block coordinate of the dragged piece in world space
            Vector3 topLeftWorld = transform.position + new Vector3(-totalW * 0.5f + step * 0.5f, totalH * 0.5f - step * 0.5f, 0f);

            return BoardView.Instance.WorldToGridPosition(topLeftWorld);
        }

        private void UpdateSortingOrder(int order)
        {
            foreach (var sr in blockRenderers)
            {
                if (sr != null) sr.sortingOrder = order;
            }
        }

        private IEnumerator AnimateSnapback()
        {
            Vector3 startPos = transform.position;
            Vector3 startScale = transform.localScale;
            Vector3 targetScale = Vector3.one * dockScale;

            float elapsed = 0f;
            float duration = 0.16f;

            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                float t = elapsed / duration;
                float smoothT = 1f - Mathf.Pow(1f - t, 3f);
                transform.position = Vector3.Lerp(startPos, dockPosition, smoothT);
                transform.localScale = Vector3.Lerp(startScale, targetScale, smoothT);
                yield return null;
            }

            transform.position = dockPosition;
            transform.localScale = targetScale;
            snapbackCoroutine = null;
        }

        private void OnDisable()
        {
            if (activeDraggingPiece == this) activeDraggingPiece = null;
        }

        private void OnDestroy()
        {
            if (activeDraggingPiece == this) activeDraggingPiece = null;
        }
    }
}
