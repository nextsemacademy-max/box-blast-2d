using System;
using System.Collections.Generic;
using UnityEngine;

namespace BoxBlast2D
{
    [Serializable]
    public struct InitialCellSetup
    {
        public int row;
        public int col;
        public ObstacleType obstacle;
        public ColorTheme color;

        public InitialCellSetup(int r, int c, ObstacleType obs, ColorTheme colr)
        {
            row = r;
            col = c;
            obstacle = obs;
            color = colr;
        }
    }

    [Serializable]
    public class AdventureLevelData
    {
        public int id;
        public string chapter;
        public string name;
        public int moves;
        public AdventureObjectiveType objectiveType;
        public int targetCount;
        public string description;
        public int[] starScores; // 3 thresholds
        public List<InitialCellSetup> initialCells = new List<InitialCellSetup>();

        public AdventureLevelData(int id, string chapter, string name, int moves, AdventureObjectiveType objType, int target, string desc, int[] stars)
        {
            this.id = id;
            this.chapter = chapter;
            this.name = name;
            this.moves = moves;
            this.objectiveType = objType;
            this.targetCount = target;
            this.description = desc;
            this.starScores = stars;
        }
    }

    public static class AdventureDatabase
    {
        public static readonly List<AdventureLevelData> Levels = new List<AdventureLevelData>();

        static AdventureDatabase()
        {
            InitializeLevels();
        }

        private static void InitializeLevels()
        {
            Levels.Clear();

            // Level 1: First Steps
            var lvl1 = new AdventureLevelData(1, "Mystic Forest", "First Steps", 14, AdventureObjectiveType.ClearLines, 3, "Clear 3 lines on the board to awaken the forest portal!", new int[] { 300, 600, 1000 });
            Levels.Add(lvl1);

            // Level 2: Ice Breaking
            var lvl2 = new AdventureLevelData(2, "Mystic Forest", "Ice Breaking", 14, AdventureObjectiveType.MeltIce, 4, "Melt all 4 frozen ice orbs by clearing their rows or columns!", new int[] { 400, 750, 1200 });
            lvl2.initialCells.Add(new InitialCellSetup(2, 2, ObstacleType.Ice, ColorTheme.Cyan));
            lvl2.initialCells.Add(new InitialCellSetup(2, 5, ObstacleType.Ice, ColorTheme.Cyan));
            lvl2.initialCells.Add(new InitialCellSetup(5, 2, ObstacleType.Ice, ColorTheme.Cyan));
            lvl2.initialCells.Add(new InitialCellSetup(5, 5, ObstacleType.Ice, ColorTheme.Cyan));
            Levels.Add(lvl2);

            // Level 3: Relic Hunt
            var lvl3 = new AdventureLevelData(3, "Mystic Forest", "Relic Hunt", 15, AdventureObjectiveType.CollectRelics, 6, "Collect 6 ancient sun relics by blasting their lines!", new int[] { 500, 900, 1400 });
            lvl3.initialCells.Add(new InitialCellSetup(1, 3, ObstacleType.Relic, ColorTheme.Amber));
            lvl3.initialCells.Add(new InitialCellSetup(1, 4, ObstacleType.Relic, ColorTheme.Amber));
            lvl3.initialCells.Add(new InitialCellSetup(3, 1, ObstacleType.Relic, ColorTheme.Amber));
            lvl3.initialCells.Add(new InitialCellSetup(3, 6, ObstacleType.Relic, ColorTheme.Amber));
            lvl3.initialCells.Add(new InitialCellSetup(6, 3, ObstacleType.Relic, ColorTheme.Amber));
            lvl3.initialCells.Add(new InitialCellSetup(6, 4, ObstacleType.Relic, ColorTheme.Amber));
            Levels.Add(lvl3);

            // Level 4: Forest Shrine
            var lvl4 = new AdventureLevelData(4, "Mystic Forest", "Forest Shrine", 13, AdventureObjectiveType.TargetScore, 800, "Achieve 800 Points before your moves run out!", new int[] { 800, 1200, 1800 });
            Levels.Add(lvl4);

            // Level 5: Frozen Glade
            var lvl5 = new AdventureLevelData(5, "Crystal Cavern", "Frozen Glade", 16, AdventureObjectiveType.MeltIce, 8, "Melt 8 frozen crystals encasing the cave entrance!", new int[] { 600, 1100, 1700 });
            lvl5.initialCells.Add(new InitialCellSetup(1, 1, ObstacleType.Ice, ColorTheme.Sapphire));
            lvl5.initialCells.Add(new InitialCellSetup(1, 6, ObstacleType.Ice, ColorTheme.Sapphire));
            lvl5.initialCells.Add(new InitialCellSetup(2, 3, ObstacleType.Ice, ColorTheme.Sapphire));
            lvl5.initialCells.Add(new InitialCellSetup(2, 4, ObstacleType.Ice, ColorTheme.Sapphire));
            lvl5.initialCells.Add(new InitialCellSetup(5, 3, ObstacleType.Ice, ColorTheme.Sapphire));
            lvl5.initialCells.Add(new InitialCellSetup(5, 4, ObstacleType.Ice, ColorTheme.Sapphire));
            lvl5.initialCells.Add(new InitialCellSetup(6, 1, ObstacleType.Ice, ColorTheme.Sapphire));
            lvl5.initialCells.Add(new InitialCellSetup(6, 6, ObstacleType.Ice, ColorTheme.Sapphire));
            Levels.Add(lvl5);
        }

        public static AdventureLevelData GetLevel(int id)
        {
            return Levels.Find(l => l.id == id) ?? Levels[0];
        }

        public static int CalculateStars(int levelId, int score)
        {
            var level = GetLevel(levelId);
            if (score >= level.starScores[2]) return 3;
            if (score >= level.starScores[1]) return 2;
            if (score >= level.starScores[0]) return 1;
            return 0;
        }
    }
}
