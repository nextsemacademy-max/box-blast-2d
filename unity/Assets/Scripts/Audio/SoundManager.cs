using UnityEngine;

namespace BoxBlast2D.Audio
{
    public class SoundManager : MonoBehaviour
    {
        public static SoundManager Instance { get; private set; }

        [Header("Audio Sources")]
        [SerializeField] private AudioSource sfxSource;
        [SerializeField] private AudioSource comboSource;

        [Header("Audio Clips")]
        [SerializeField] private AudioClip pickupClip;
        [SerializeField] private AudioClip placeClip;
        [SerializeField] private AudioClip lineClearClip;
        [SerializeField] private AudioClip comboClip;
        [SerializeField] private AudioClip bombClip;
        [SerializeField] private AudioClip gameOverClip;
        [SerializeField] private AudioClip winClip;
        [SerializeField] private AudioClip boosterClip;

        private void Awake()
        {
            if (Instance == null)
            {
                Instance = this;
                DontDestroyOnLoad(gameObject);
            }
            else
            {
                Destroy(gameObject);
                return;
            }

            if (sfxSource == null) sfxSource = gameObject.AddComponent<AudioSource>();
            if (comboSource == null) comboSource = gameObject.AddComponent<AudioSource>();
        }

        public void PlayPickup()
        {
            if (pickupClip != null && sfxSource != null)
            {
                sfxSource.pitch = Random.Range(0.95f, 1.05f);
                sfxSource.PlayOneShot(pickupClip, 0.7f);
            }
        }

        public void PlayPlace()
        {
            if (placeClip != null && sfxSource != null)
            {
                sfxSource.pitch = 1.0f;
                sfxSource.PlayOneShot(placeClip, 0.85f);
            }
        }

        public void PlayLineClear(int linesCount, int comboCount)
        {
            if (lineClearClip != null && sfxSource != null)
            {
                sfxSource.pitch = 1.0f + (linesCount - 1) * 0.08f;
                sfxSource.PlayOneShot(lineClearClip, 0.9f);
            }

            if (comboCount > 0)
            {
                PlayCombo(comboCount);
            }
        }

        public void PlayCombo(int comboCount)
        {
            if (comboClip != null && comboSource != null)
            {
                // Ascending semitone scale (12-TET chromatic progression)
                float semitone = Mathf.Clamp(comboCount - 1, 0, 12);
                comboSource.pitch = Mathf.Pow(1.05946f, semitone);
                comboSource.PlayOneShot(comboClip, 1.0f);
            }
        }

        public void PlayBomb()
        {
            if (bombClip != null && sfxSource != null)
            {
                sfxSource.pitch = 0.9f;
                sfxSource.PlayOneShot(bombClip, 1.0f);
            }
        }

        public void PlayBooster()
        {
            if (boosterClip != null && sfxSource != null)
            {
                sfxSource.pitch = 1.2f;
                sfxSource.PlayOneShot(boosterClip, 0.9f);
            }
        }

        public void PlayGameOver()
        {
            if (gameOverClip != null && sfxSource != null)
            {
                sfxSource.pitch = 1.0f;
                sfxSource.PlayOneShot(gameOverClip, 1.0f);
            }
        }

        public void PlayWin()
        {
            if (winClip != null && sfxSource != null)
            {
                sfxSource.pitch = 1.0f;
                sfxSource.PlayOneShot(winClip, 1.0f);
            }
        }
    }
}
