using System;
using UnityEngine;

namespace BoxBlast2D
{
    [Serializable]
    public class ShapeData
    {
        public string id;
        public string shapeName;
        public int rows;
        public int cols;
        public int[] flattenedMatrix; // rows * cols, 1 = filled, 0 = empty
        public ColorTheme colorTheme;
        public int weight;

        public ShapeData(string id, string shapeName, int[,] matrix2D, ColorTheme colorTheme, int weight)
        {
            this.id = id;
            this.shapeName = shapeName;
            this.rows = matrix2D.GetLength(0);
            this.cols = matrix2D.GetLength(1);
            this.colorTheme = colorTheme;
            this.weight = weight;

            flattenedMatrix = new int[rows * cols];
            for (int r = 0; r < rows; r++)
            {
                for (int c = 0; c < cols; c++)
                {
                    flattenedMatrix[r * cols + c] = matrix2D[r, c];
                }
            }
        }

        public bool IsFilled(int r, int c)
        {
            if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
            return flattenedMatrix[r * cols + c] == 1;
        }

        public int GetFilledCount()
        {
            int count = 0;
            for (int i = 0; i < flattenedMatrix.Length; i++)
            {
                if (flattenedMatrix[i] == 1) count++;
            }
            return count;
        }
    }
}
