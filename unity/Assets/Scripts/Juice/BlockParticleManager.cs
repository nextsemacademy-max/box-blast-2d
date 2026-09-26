using System.Collections.Generic;
using UnityEngine;

namespace BoxBlast2D.Juice
{
    public class BlockParticleManager : MonoBehaviour
    {
        public static BlockParticleManager Instance { get; private set; }

        [SerializeField] private ParticleSystem blastParticlePrefab;
        private ParticleSystem defaultSystem;

        private void Awake()
        {
            Instance = this;
            if (blastParticlePrefab == null)
            {
                CreateDefaultParticleSystem();
            }
        }

        public void PlayBlastEffect(Vector3 worldPos, Color color)
        {
            if (blastParticlePrefab != null)
            {
                var ps = Instantiate(blastParticlePrefab, worldPos, Quaternion.identity);
                var main = ps.main;
                main.startColor = color;
                Destroy(ps.gameObject, 1.2f);
            }
            else if (defaultSystem != null)
            {
                defaultSystem.transform.position = worldPos;
                var main = defaultSystem.main;
                main.startColor = color;
                defaultSystem.Emit(18);
            }
        }

        public void PlayLineClears(List<Vector3> worldPositions, Color color)
        {
            for (int i = 0; i < worldPositions.Count; i++)
            {
                PlayBlastEffect(worldPositions[i], color);
            }
        }

        private void CreateDefaultParticleSystem()
        {
            GameObject pObj = new GameObject("DefaultBlockParticles");
            pObj.transform.SetParent(transform);
            defaultSystem = pObj.AddComponent<ParticleSystem>();

            var main = defaultSystem.main;
            main.playOnAwake = false;
            main.duration = 0.5f;
            main.startLifetime = 0.45f;
            main.startSpeed = 5.0f;
            main.startSize = 0.18f;
            main.simulationSpace = ParticleSystemSimulationSpace.World;

            var emission = defaultSystem.emission;
            emission.enabled = false;

            var shape = defaultSystem.shape;
            shape.shapeType = ParticleSystemShapeType.Sphere;
            shape.radius = 0.25f;

            var colorOverLifetime = defaultSystem.colorOverLifetime;
            colorOverLifetime.enabled = true;
            Gradient grad = new Gradient();
            grad.SetKeys(
                new GradientColorKey[] { new GradientColorKey(Color.white, 0.0f), new GradientColorKey(Color.white, 1.0f) },
                new GradientAlphaKey[] { new GradientAlphaKey(1.0f, 0.0f), new GradientAlphaKey(0.0f, 1.0f) }
            );
            colorOverLifetime.color = grad;

            var renderer = pObj.GetComponent<ParticleSystemRenderer>();
            renderer.sortingOrder = 20;
        }
    }
}
