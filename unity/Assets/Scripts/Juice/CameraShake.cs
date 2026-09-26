using System.Collections;
using UnityEngine;

namespace BoxBlast2D.Juice
{
    public class CameraShake : MonoBehaviour
    {
        public static CameraShake Instance { get; private set; }

        private Vector3 originalPos;
        private Coroutine shakeCoroutine;

        private void Awake()
        {
            Instance = this;
            originalPos = transform.localPosition;
        }

        public void Shake(float intensity = 0.22f, float duration = 0.18f)
        {
            if (shakeCoroutine != null) StopCoroutine(shakeCoroutine);
            shakeCoroutine = StartCoroutine(DoShake(intensity, duration));
        }

        private IEnumerator DoShake(float intensity, float duration)
        {
            float elapsed = 0f;
            while (elapsed < duration)
            {
                elapsed += Time.deltaTime;
                float progress = elapsed / duration;
                float damp = 1f - progress;

                float x = (Random.value * 2f - 1f) * intensity * damp;
                float y = (Random.value * 2f - 1f) * intensity * damp;

                transform.localPosition = new Vector3(originalPos.x + x, originalPos.y + y, originalPos.z);
                yield return null;
            }

            transform.localPosition = originalPos;
            shakeCoroutine = null;
        }
    }
}
