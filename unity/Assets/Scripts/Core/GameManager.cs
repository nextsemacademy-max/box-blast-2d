using System.Collections.Generic;
using UnityEngine;
using BoxBlast2D.Gameplay;
using BoxBlast2D.Audio;
using BoxBlast2D.Juice;
using BoxBlast2D.Boosters;
using BoxBlast2D.UI;

namespace BoxBlast2D.Core
{
    public class GameManager : MonoBehaviour
    {
        public static GameManager Instance { get; private set; }

        public GridEngine Grid { get; private set; }
        public GameMode CurrentMode { get; private set; } = GameMode.Classic;

        [Header("Classic Mode State")]
        public int Score { get; private set; } = 0;
        public int HighScore { get; private set; } = 0;
        public int ComboStreak { get; private set; } = 0;
        public bool IsGameOver { get; private set; } = false;

        [Header("Adventure Mode State")]
        public int CurrentLevelId { get; private set; } = 1;
        public int MovesRemaining { get; private set; } = 14;
        public int GoalCurrent { get; private set; } = 0;
        public int GoalTarget { get; private set; } = 3;
        public bool HasRevivedThisRun { get; private set; } = false;

        private const string PrefsHighScore = "BB2D_HighScore";

        private void Awake()
        {
            Instance = this;
            Grid = new GridEngine();
            HighScore = PlayerPrefs.GetInt(PrefsHighScore, 0);
        }

        private void Start()
        {
            StartClassicGame();
        }

        public void StartClassicGame()
        {
            CurrentMode = GameMode.Classic;
            Score = 0;
            ComboStreak = 0;
            IsGameOver = false;
            HasRevivedThisRun = false;

            Grid.Reset();
            BoardView.Instance?.InitializeGrid(Grid);
            HandTrayController.Instance?.SpawnHand(Grid);

            UIManager.Instance?.UpdateScore(Score, HighScore);
            UIManager.Instance?.UpdateCombo(ComboStreak);
            UIManager.Instance?.SetModeHUD(GameMode.Classic);
            UIManager.Instance?.HideModals();
        }

        public void StartAdventureLevel(int levelId)
        {
            CurrentMode = GameMode.Adventure;
            CurrentLevelId = levelId;
            Score = 0;
            ComboStreak = 0;
            IsGameOver = false;
            HasRevivedThisRun = false;

            var levelData = AdventureDatabase.GetLevel(levelId);
            MovesRemaining = levelData.moves;
            GoalCurrent = 0;
            GoalTarget = levelData.targetCount;

            Grid.Reset();

            // Setup level obstacles
            foreach (var cellSetup in levelData.initialCells)
            {
                Grid.SetObstacle(cellSetup.row, cellSetup.col, cellSetup.obstacle, cellSetup.color);
            }

            BoardView.Instance?.InitializeGrid(Grid);
            HandTrayController.Instance?.SpawnHand(Grid);

            UIManager.Instance?.SetModeHUD(GameMode.Adventure);
            UIManager.Instance?.UpdateAdventureGoal(levelData.objectiveType, GoalCurrent, GoalTarget, MovesRemaining);
            UIManager.Instance?.UpdateScore(Score, HighScore);
            UIManager.Instance?.HideModals();
        }

        public bool TryPlacePiece(DraggablePiece piece, int row, int col)
        {
            if (IsGameOver) return false;
            if (!Grid.CanPlaceShape(piece.Shape, row, col)) return false;

            // 1. Commit placement
            List<Vector2Int> placedCoords = Grid.PlaceShape(piece.Shape, row, col);
            BoardView.Instance?.AnimatePlacedShape(placedCoords);
            SoundManager.Instance?.PlayPlace();

            // Points for placing blocks
            int placePoints = piece.Shape.GetFilledCount() * 10;
            AddScore(placePoints);

            // 2. Check and clear completed lines
            ClearResult clearResult = Grid.CheckAndClearLines();

            if (clearResult.totalLines > 0)
            {
                ComboStreak++;
                int lineBonus = (int)(clearResult.totalLines * 100 * (1f + (ComboStreak - 1) * 0.5f));
                AddScore(lineBonus);

                // Sound & Juice
                SoundManager.Instance?.PlayLineClear(clearResult.totalLines, ComboStreak);
                CameraShake.Instance?.Shake(0.18f + clearResult.totalLines * 0.05f, 0.2f);

                // Particles
                List<Vector3> blastPositions = new List<Vector3>();
                foreach (int r in clearResult.clearedRows)
                {
                    for (int c = 0; c < GridEngine.BoardSize; c++)
                        blastPositions.Add(BoardView.Instance.GridToWorldPosition(r, c));
                }
                foreach (int c in clearResult.clearedCols)
                {
                    for (int r = 0; r < GridEngine.BoardSize; r++)
                        blastPositions.Add(BoardView.Instance.GridToWorldPosition(r, c));
                }
                BlockParticleManager.Instance?.PlayLineClears(blastPositions, ColorPalette.GetColor(piece.Shape.colorTheme));

                // Clean Slate bonus
                if (Grid.IsCleanSlate())
                {
                    AddScore(500);
                    UIManager.Instance?.ShowAnnouncement("CLEAN SLATE! +500");
                }

                // Adventure objective progress
                if (CurrentMode == GameMode.Adventure)
                {
                    var lvl = AdventureDatabase.GetLevel(CurrentLevelId);
                    if (lvl.objectiveType == AdventureObjectiveType.ClearLines)
                    {
                        GoalCurrent += clearResult.totalLines;
                    }
                    else if (lvl.objectiveType == AdventureObjectiveType.MeltIce)
                    {
                        GoalCurrent += clearResult.clearedObstacles.FindAll(o => Grid.Board[o.x, o.y].obstacle == ObstacleType.Ice).Count;
                    }
                    else if (lvl.objectiveType == AdventureObjectiveType.CollectRelics)
                    {
                        GoalCurrent += clearResult.clearedObstacles.FindAll(o => Grid.Board[o.x, o.y].obstacle == ObstacleType.Relic).Count;
                    }
                }
            }
            else
            {
                // Streak broken
                ComboStreak = 0;
            }

            // Update adventure target score
            if (CurrentMode == GameMode.Adventure)
            {
                var lvl = AdventureDatabase.GetLevel(CurrentLevelId);
                if (lvl.objectiveType == AdventureObjectiveType.TargetScore)
                {
                    GoalCurrent = Score;
                }

                MovesRemaining--;
                UIManager.Instance?.UpdateAdventureGoal(lvl.objectiveType, GoalCurrent, GoalTarget, MovesRemaining);

                // Win check
                if (GoalCurrent >= GoalTarget)
                {
                    OnAdventureWon();
                    return true;
                }
                else if (MovesRemaining <= 0)
                {
                    OnAdventureFailed();
                    return true;
                }
            }

            UIManager.Instance?.UpdateCombo(ComboStreak);

            // 3. Update Hand Tray
            HandTrayController.Instance?.OnPiecePlaced(piece.SlotIndex, Grid);

            return true;
        }

        private void AddScore(int delta)
        {
            Score += delta;
            if (Score > HighScore)
            {
                HighScore = Score;
                PlayerPrefs.SetInt(PrefsHighScore, HighScore);
            }
            UIManager.Instance?.UpdateScore(Score, HighScore);
        }

        public void OnNoMovesRemaining()
        {
            if (IsGameOver) return;
            IsGameOver = true;

            SoundManager.Instance?.PlayGameOver();
            UIManager.Instance?.ShowGameOverModal(Score, HighScore, HasRevivedThisRun);
        }

        private void OnAdventureWon()
        {
            IsGameOver = true;
            SoundManager.Instance?.PlayWin();
            int stars = AdventureDatabase.CalculateStars(CurrentLevelId, Score);
            UIManager.Instance?.ShowVictoryModal(CurrentLevelId, Score, stars);
        }

        private void OnAdventureFailed()
        {
            IsGameOver = true;
            SoundManager.Instance?.PlayGameOver();
            UIManager.Instance?.ShowLevelFailedModal(GoalCurrent, GoalTarget, Score);
        }

        public void RevivePlayer()
        {
            if (HasRevivedThisRun) return;
            HasRevivedThisRun = true;
            IsGameOver = false;

            BoosterManager.Instance?.ExecuteReviveBomb();
            UIManager.Instance?.HideModals();
        }

        public void RestartCurrentGame()
        {
            if (CurrentMode == GameMode.Classic)
            {
                StartClassicGame();
            }
            else
            {
                StartAdventureLevel(CurrentLevelId);
            }
        }
    }
}
