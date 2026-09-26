using System.Collections;
using UnityEngine;
using UnityEngine.UI;
using BoxBlast2D.Core;
using BoxBlast2D.Boosters;

namespace BoxBlast2D.UI
{
    public class UIManager : MonoBehaviour
    {
        public static UIManager Instance { get; private set; }

        [Header("Top HUD (Classic)")]
        [SerializeField] private GameObject classicHud;
        [SerializeField] private Text scoreText;
        [SerializeField] private Text bestScoreText;
        [SerializeField] private GameObject comboBadge;
        [SerializeField] private Text comboText;

        [Header("Top HUD (Adventure)")]
        [SerializeField] private GameObject adventureHud;
        [SerializeField] private Text adventureGoalText;
        [SerializeField] private Text movesLeftText;
        [SerializeField] private Image goalProgressBar;

        [Header("Boosters Bar")]
        [SerializeField] private Text hammerCountText;
        [SerializeField] private Text rocketCountText;
        [SerializeField] private Text rerollCountText;
        [SerializeField] private GameObject hammerActiveBorder;
        [SerializeField] private GameObject rocketActiveBorder;

        [Header("Modals")]
        [SerializeField] private GameObject gameOverModal;
        [SerializeField] private Text modalScoreText;
        [SerializeField] private Text modalBestText;
        [SerializeField] private Button reviveButton;

        [SerializeField] private GameObject victoryModal;
        [SerializeField] private Text victoryLevelText;
        [SerializeField] private Text victoryScoreText;
        [SerializeField] private GameObject[] starIcons;

        [SerializeField] private GameObject levelFailedModal;
        [SerializeField] private Text failProgressText;

        [SerializeField] private GameObject announcementBanner;
        [SerializeField] private Text announcementText;

        private void Awake()
        {
            Instance = this;
        }

        private void Start()
        {
            UpdateBoosterUI();
        }

        public void SetModeHUD(GameMode mode)
        {
            if (classicHud != null) classicHud.SetActive(mode == GameMode.Classic);
            if (adventureHud != null) adventureHud.SetActive(mode == GameMode.Adventure);
        }

        public void UpdateScore(int score, int highScore)
        {
            if (scoreText != null) scoreText.text = score.ToString("N0");
            if (bestScoreText != null) bestScoreText.text = highScore.ToString("N0");
        }

        public void UpdateCombo(int streak)
        {
            if (comboBadge != null)
            {
                comboBadge.SetActive(streak > 1);
                if (comboText != null && streak > 1)
                {
                    comboText.text = $"COMBO {streak}x!";
                }
            }
        }

        public void UpdateAdventureGoal(AdventureObjectiveType type, int current, int target, int moves)
        {
            if (adventureGoalText != null)
            {
                string objName = type == AdventureObjectiveType.ClearLines ? "Lines" :
                                 type == AdventureObjectiveType.MeltIce ? "Ice Crystals" :
                                 type == AdventureObjectiveType.CollectRelics ? "Sun Relics" : "Target Score";

                adventureGoalText.text = $"{objName}: {current} / {target}";
            }

            if (movesLeftText != null)
            {
                movesLeftText.text = $"{moves} Moves";
            }

            if (goalProgressBar != null)
            {
                goalProgressBar.fillAmount = Mathf.Clamp01((float)current / Mathf.Max(target, 1));
            }
        }

        public void UpdateBoosterUI()
        {
            var bm = BoosterManager.Instance;
            if (bm == null) return;

            if (hammerCountText != null) hammerCountText.text = bm.HammerCount.ToString();
            if (rocketCountText != null) rocketCountText.text = bm.RocketCount.ToString();
            if (rerollCountText != null) rerollCountText.text = bm.RerollCount.ToString();

            if (hammerActiveBorder != null) hammerActiveBorder.SetActive(bm.ActiveBooster == BoosterType.Hammer);
            if (rocketActiveBorder != null) rocketActiveBorder.SetActive(bm.ActiveBooster == BoosterType.Rocket);
        }

        public void ShowGameOverModal(int score, int bestScore, bool hasRevived)
        {
            if (gameOverModal != null)
            {
                gameOverModal.SetActive(true);
                if (modalScoreText != null) modalScoreText.text = score.ToString("N0");
                if (modalBestText != null) modalBestText.text = bestScore.ToString("N0");
                if (reviveButton != null) reviveButton.gameObject.SetActive(!hasRevived);
            }
        }

        public void ShowVictoryModal(int levelId, int score, int stars)
        {
            if (victoryModal != null)
            {
                victoryModal.SetActive(true);
                if (victoryLevelText != null) victoryLevelText.text = $"Level {levelId} Cleared!";
                if (victoryScoreText != null) victoryScoreText.text = $"Score: {score:N0}";

                if (starIcons != null)
                {
                    for (int i = 0; i < starIcons.Length; i++)
                    {
                        starIcons[i].SetActive(i < stars);
                    }
                }
            }
        }

        public void ShowLevelFailedModal(int current, int target, int score)
        {
            if (levelFailedModal != null)
            {
                levelFailedModal.SetActive(true);
                if (failProgressText != null)
                {
                    failProgressText.text = $"Goal Progress: {current} / {target}";
                }
            }
        }

        public void ShowAnnouncement(string message)
        {
            if (announcementBanner != null && announcementText != null)
            {
                announcementText.text = message;
                StartCoroutine(DoAnnouncement());
            }
        }

        private IEnumerator DoAnnouncement()
        {
            announcementBanner.SetActive(true);
            yield return new WaitForSeconds(1.8f);
            announcementBanner.SetActive(false);
        }

        public void HideModals()
        {
            if (gameOverModal != null) gameOverModal.SetActive(false);
            if (victoryModal != null) victoryModal.SetActive(false);
            if (levelFailedModal != null) levelFailedModal.SetActive(false);
            if (announcementBanner != null) announcementBanner.SetActive(false);
        }

        // Button Event Handlers
        public void OnClickHammerBooster() => BoosterManager.Instance?.SelectBooster(BoosterType.Hammer);
        public void OnClickRocketBooster() => BoosterManager.Instance?.SelectBooster(BoosterType.Rocket);
        public void OnClickRerollBooster() => BoosterManager.Instance?.SelectBooster(BoosterType.Reroll);
        public void OnClickRevive() => GameManager.Instance?.RevivePlayer();
        public void OnClickRestart() => GameManager.Instance?.RestartCurrentGame();
        public void OnClickNextLevel() => GameManager.Instance?.StartAdventureLevel(GameManager.Instance.CurrentLevelId + 1);
    }
}
