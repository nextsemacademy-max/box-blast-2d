using System.Collections.Generic;
using UnityEngine;
using BoxBlast2D.Core;
using BoxBlast2D.Gameplay;
using BoxBlast2D.Juice;
using BoxBlast2D.Audio;

namespace BoxBlast2D.Boosters
{
    public class BoosterManager : MonoBehaviour
    {
        public static BoosterManager Instance { get; private set; }

        public int HammerCount { get; private set; } = 3;
        public int RocketCount { get; private set; } = 3;
        public int RerollCount { get; private set; } = 3;

        public BoosterType ActiveBooster { get; private set; } = BoosterType.None;

        private void Awake()
        {
            Instance = this;
        }

        public void SelectBooster(BoosterType booster)
        {
            if (ActiveBooster == booster)
            {
                // Toggle off
                ActiveBooster = BoosterType.None;
                return;
            }

            if (booster == BoosterType.Hammer && HammerCount <= 0) return;
            if (booster == BoosterType.Rocket && RocketCount <= 0) return;

            if (booster == BoosterType.Reroll)
            {
                if (RerollCount > 0 && GameManager.Instance != null)
                {
                    RerollCount--;
                    SoundManager.Instance?.PlayBooster();
                    HandTrayController.Instance?.RerollHand(GameManager.Instance.Grid);
                    UI.UIManager.Instance?.UpdateBoosterUI();
                }
                return;
            }

            ActiveBooster = booster;
            UI.UIManager.Instance?.UpdateBoosterUI();
        }

        public void CancelBooster()
        {
            ActiveBooster = BoosterType.None;
            UI.UIManager.Instance?.UpdateBoosterUI();
        }

        private void Update()
        {
            if (ActiveBooster == BoosterType.None) return;

            if (Input.GetMouseButtonDown(0))
            {
                Vector3 mouseWorld = Camera.main.ScreenToWorldPoint(Input.mousePosition);
                Vector2Int? gridPos = BoardView.Instance?.WorldToGridPosition(mouseWorld);

                if (gridPos.HasValue && GameManager.Instance != null)
                {
                    ExecuteBooster(gridPos.Value.x, gridPos.Value.y);
                }
            }
        }

        private void ExecuteBooster(int r, int c)
        {
            var grid = GameManager.Instance.Grid;

            if (ActiveBooster == BoosterType.Hammer)
            {
                if (grid.ClearSingleCell(r, c, out var cellData))
                {
                    HammerCount--;
                    SoundManager.Instance?.PlayBooster();
                    CameraShake.Instance?.Shake(0.18f, 0.15f);

                    Vector3 worldPos = BoardView.Instance.GridToWorldPosition(r, c);
                    BlockParticleManager.Instance?.PlayBlastEffect(worldPos, ColorPalette.GetColor(cellData.color));

                    BoardView.Instance.RefreshBoard(grid);
                    HandTrayController.Instance?.UpdatePlayableStatus(grid);
                }
            }
            else if (ActiveBooster == BoosterType.Rocket)
            {
                List<Vector2Int> cleared = grid.ClearCrossRocket(r, c);
                if (cleared.Count > 0)
                {
                    RocketCount--;
                    SoundManager.Instance?.PlayBooster();
                    CameraShake.Instance?.Shake(0.35f, 0.25f);

                    List<Vector3> positions = new List<Vector3>();
                    foreach (var coord in cleared)
                    {
                        positions.Add(BoardView.Instance.GridToWorldPosition(coord.x, coord.y));
                    }
                    BlockParticleManager.Instance?.PlayLineClears(positions, Color.cyan);

                    BoardView.Instance.RefreshBoard(grid);
                    HandTrayController.Instance?.UpdatePlayableStatus(grid);
                }
            }

            ActiveBooster = BoosterType.None;
            UI.UIManager.Instance?.UpdateBoosterUI();
        }

        public void ExecuteReviveBomb()
        {
            if (GameManager.Instance == null) return;
            var grid = GameManager.Instance.Grid;

            List<Vector2Int> cleared = grid.ClearBombArea(4, 4);
            SoundManager.Instance?.PlayBomb();
            CameraShake.Instance?.Shake(0.45f, 0.35f);

            List<Vector3> positions = new List<Vector3>();
            foreach (var coord in cleared)
            {
                positions.Add(BoardView.Instance.GridToWorldPosition(coord.x, coord.y));
            }
            BlockParticleManager.Instance?.PlayLineClears(positions, Color.yellow);

            BoardView.Instance.RefreshBoard(grid);
            HandTrayController.Instance?.RerollHand(grid);
        }
    }
}
