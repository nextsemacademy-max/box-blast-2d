using System.Collections;
using UnityEngine;

namespace BoxBlast2D.Gameplay
{
    public class GridCellView : MonoBehaviour
    {
        public int Row { get; private set; }
        public int Col { get; private set; }

        [SerializeField] private SpriteRenderer bgRenderer;
        [SerializeField] private SpriteRenderer blockRenderer;
        [SerializeField] private SpriteRenderer overlayRenderer;

        public bool IsFilled { get; private set; }
        public ObstacleType Obstacle { get; private set; }

        public void Init(int r, int c, Sprite cellBgSprite, Sprite blockSprite, Sprite iceSprite, Sprite relicSprite)
        {
            Row = r;
            Col = c;

            if (bgRenderer != null)
            {
                bgRenderer.sprite = cellBgSprite;
                bgRenderer.color = ColorPalette.CellBackground;
            }

            if (blockRenderer != null)
            {
                blockRenderer.sprite = blockSprite;
                blockRenderer.enabled = false;
            }

            if (overlayRenderer != null)
            {
                overlayRenderer.enabled = false;
            }
        }

        public void SetFilled(bool filled, ColorTheme theme)
        {
            IsFilled = filled;
            if (blockRenderer != null)
            {
                blockRenderer.enabled = filled;
                if (filled)
                {
                    blockRenderer.color = ColorPalette.GetColor(theme);
                }
            }
        }

        public void SetObstacle(ObstacleType obstacle, Sprite iceSprite, Sprite relicSprite)
        {
            Obstacle = obstacle;
            if (overlayRenderer != null)
            {
                if (obstacle == ObstacleType.Ice)
                {
                    overlayRenderer.enabled = true;
                    overlayRenderer.sprite = iceSprite;
                    overlayRenderer.color = new Color(0.7f, 0.9f, 1f, 0.85f);
                }
                else if (obstacle == ObstacleType.Relic)
                {
                    overlayRenderer.enabled = true;
                    overlayRenderer.sprite = relicSprite;
                    overlayRenderer.color = Color.yellow;
                }
                else
                {
                    overlayRenderer.enabled = false;
                }
            }
        }

        public void SetGhost(bool active, ColorTheme theme)
        {
            if (IsFilled) return; // Don't show ghost on already filled cells

            if (blockRenderer != null)
            {
                if (active)
                {
                    blockRenderer.enabled = true;
                    Color ghostCol = ColorPalette.GetColor(theme);
                    ghostCol.a = 0.38f;
                    blockRenderer.color = ghostCol;
                }
                else
                {
                    blockRenderer.enabled = false;
                }
            }
        }

        public void SetLinePulse(bool active)
        {
            if (!IsFilled && overlayRenderer != null)
            {
                if (active)
                {
                    overlayRenderer.enabled = true;
                    overlayRenderer.color = ColorPalette.LinePulseHighlight;
                }
                else
                {
                    overlayRenderer.enabled = false;
                }
            }
        }

        public void PlayPopIn()
        {
            StartCoroutine(AnimatePopIn());
        }

        private IEnumerator AnimatePopIn()
        {
            Vector3 originalScale = transform.localScale;
            transform.localScale = originalScale * 0.4f;

            float elapsed = 0f;
            float duration = 0.14f;
            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                float t = elapsed / duration;
                // Elastic overshoot curve
                float scale = Mathf.Sin(t * Mathf.PI * 0.5f);
                transform.localScale = Vector3.LerpUnclamped(originalScale * 0.4f, originalScale * 1.15f, scale);
                yield return null;
            }

            elapsed = 0f;
            duration = 0.08f;
            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                float t = elapsed / duration;
                transform.localScale = Vector3.Lerp(originalScale * 1.15f, originalScale, t);
                yield return null;
            }

            transform.localScale = originalScale;
        }

        public void PlayBlastClear()
        {
            StartCoroutine(AnimateBlastClear());
        }

        private IEnumerator AnimateBlastClear()
        {
            Vector3 originalScale = transform.localScale;
            Color originalColor = blockRenderer != null ? blockRenderer.color : Color.white;

            float elapsed = 0f;
            float duration = 0.18f;

            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                float t = elapsed / duration;

                if (blockRenderer != null)
                {
                    Color c = originalColor;
                    c.a = Mathf.Lerp(1f, 0f, t);
                    blockRenderer.color = c;
                    blockRenderer.transform.localScale = Vector3.one * (1f + t * 0.4f);
                }

                yield return null;
            }

            SetFilled(false, ColorTheme.Cyan);
            if (blockRenderer != null)
            {
                blockRenderer.transform.localScale = Vector3.one;
            }
            transform.localScale = originalScale;
        }
    }
}
