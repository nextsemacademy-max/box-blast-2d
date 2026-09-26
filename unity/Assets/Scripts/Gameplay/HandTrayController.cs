using System.Collections.Generic;
using UnityEngine;
using BoxBlast2D.Core;

namespace BoxBlast2D.Gameplay
{
    public class HandTrayController : MonoBehaviour
    {
        public static HandTrayController Instance { get; private set; }

        [Header("Dock Layout")]
        [SerializeField] private Vector3[] slotPositions = new Vector3[]
        {
            new Vector3(-2.2f, -3.8f, 0f),
            new Vector3(0f, -3.8f, 0f),
            new Vector3(2.2f, -3.8f, 0f)
        };

        [Header("Sprites")]
        [SerializeField] private Sprite blockSprite;

        private DraggablePiece[] activePieces = new DraggablePiece[3];

        private void Awake()
        {
            Instance = this;
        }

        public void SpawnHand(GridEngine grid)
        {
            ClearHand();

            List<ShapeData> newHand = ShapesDatabase.GenerateSmartHand(grid);

            for (int i = 0; i < 3 && i < newHand.Count; i++)
            {
                if (newHand[i] != null)
                {
                    SpawnPiece(newHand[i], i);
                }
            }

            UpdatePlayableStatus(grid);
        }

        public void OnPiecePlaced(int slotIndex, GridEngine grid)
        {
            activePieces[slotIndex] = null;

            // Check if all pieces in hand have been placed
            bool allEmpty = true;
            for (int i = 0; i < 3; i++)
            {
                if (activePieces[i] != null)
                {
                    allEmpty = false;
                    break;
                }
            }

            if (allEmpty)
            {
                // Replenish new hand
                SpawnHand(grid);
            }
            else
            {
                // Re-evaluate remaining pieces
                UpdatePlayableStatus(grid);
            }
        }

        public void UpdatePlayableStatus(GridEngine grid)
        {
            bool hasAtLeastOneMove = false;

            for (int i = 0; i < 3; i++)
            {
                if (activePieces[i] != null)
                {
                    bool canFit = grid.CanFitAnywhere(activePieces[i].Shape);
                    activePieces[i].SetPlayableTint(canFit);
                    if (canFit) hasAtLeastOneMove = true;
                }
            }

            if (!hasAtLeastOneMove)
            {
                GameManager.Instance?.OnNoMovesRemaining();
            }
        }

        public void RerollHand(GridEngine grid)
        {
            ClearHand();
            SpawnHand(grid);
        }

        public void ClearHand()
        {
            for (int i = 0; i < 3; i++)
            {
                if (activePieces[i] != null)
                {
                    Destroy(activePieces[i].gameObject);
                    activePieces[i] = null;
                }
            }
        }

        private void SpawnPiece(ShapeData shape, int slotIndex)
        {
            GameObject pieceObj = new GameObject($"Piece_Slot_{slotIndex}");
            pieceObj.transform.SetParent(transform);
            Vector3 slotPos = slotPositions[slotIndex];

            DraggablePiece piece = pieceObj.AddComponent<DraggablePiece>();
            piece.Initialize(shape, slotIndex, slotPos, blockSprite);
            activePieces[slotIndex] = piece;
        }
    }
}
