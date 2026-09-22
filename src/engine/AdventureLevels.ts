import { ColorTheme, ObstacleType } from './types';

export type AdventureObjectiveType = 'melt_ice' | 'collect_relics' | 'target_score' | 'clear_lines';

export interface LevelInitialCell {
  r: number;
  c: number;
  obstacle: ObstacleType;
  color: ColorTheme;
}

export interface AdventureLevel {
  id: number;
  chapter: string;
  name: string;
  moves: number;
  objectiveType: AdventureObjectiveType;
  targetCount: number;
  description: string;
  initialCells?: LevelInitialCell[];
  starScores: [number, number, number]; // 1, 2, 3 stars
}

export const ADVENTURE_LEVELS: AdventureLevel[] = [
  // --- Chapter 1: Mystic Forest ---
  {
    id: 1,
    chapter: 'Mystic Forest',
    name: 'First Steps',
    moves: 14,
    objectiveType: 'clear_lines',
    targetCount: 3,
    description: 'Clear 3 lines on the board to awaken the forest portal!',
    starScores: [300, 600, 1000],
  },
  {
    id: 2,
    chapter: 'Mystic Forest',
    name: 'Ice Breaking',
    moves: 14,
    objectiveType: 'melt_ice',
    targetCount: 4,
    description: 'Melt all 4 frozen ice orbs by clearing their rows or columns!',
    initialCells: [
      { r: 2, c: 2, obstacle: 'ice', color: 'color-cyan' },
      { r: 2, c: 5, obstacle: 'ice', color: 'color-cyan' },
      { r: 5, c: 2, obstacle: 'ice', color: 'color-cyan' },
      { r: 5, c: 5, obstacle: 'ice', color: 'color-cyan' },
    ],
    starScores: [400, 750, 1200],
  },
  {
    id: 3,
    chapter: 'Mystic Forest',
    name: 'Relic Hunt',
    moves: 15,
    objectiveType: 'collect_relics',
    targetCount: 6,
    description: 'Collect 6 ancient sun relics by blasting their lines!',
    initialCells: [
      { r: 1, c: 3, obstacle: 'relic', color: 'color-amber' },
      { r: 1, c: 4, obstacle: 'relic', color: 'color-amber' },
      { r: 3, c: 1, obstacle: 'relic', color: 'color-amber' },
      { r: 3, c: 6, obstacle: 'relic', color: 'color-amber' },
      { r: 6, c: 3, obstacle: 'relic', color: 'color-amber' },
      { r: 6, c: 4, obstacle: 'relic', color: 'color-amber' },
    ],
    starScores: [500, 900, 1400],
  },
  {
    id: 4,
    chapter: 'Mystic Forest',
    name: 'Forest Shrine',
    moves: 13,
    objectiveType: 'target_score',
    targetCount: 800,
    description: 'Achieve 800 Points before your moves run out!',
    starScores: [800, 1200, 1800],
  },

  // --- Chapter 2: Crystal Cavern ---
  {
    id: 5,
    chapter: 'Crystal Cavern',
    name: 'Frozen Glade',
    moves: 16,
    objectiveType: 'melt_ice',
    targetCount: 8,
    description: 'Melt 8 frozen crystals encasing the cave entrance!',
    initialCells: [
      { r: 1, c: 1, obstacle: 'ice', color: 'color-sapphire' },
      { r: 1, c: 6, obstacle: 'ice', color: 'color-sapphire' },
      { r: 2, c: 3, obstacle: 'ice', color: 'color-sapphire' },
      { r: 2, c: 4, obstacle: 'ice', color: 'color-sapphire' },
      { r: 5, c: 3, obstacle: 'ice', color: 'color-sapphire' },
      { r: 5, c: 4, obstacle: 'ice', color: 'color-sapphire' },
      { r: 6, c: 1, obstacle: 'ice', color: 'color-sapphire' },
      { r: 6, c: 6, obstacle: 'ice', color: 'color-sapphire' },
    ],
    starScores: [600, 1100, 1700],
  },
  {
    id: 6,
    chapter: 'Crystal Cavern',
    name: "Pharaoh's Vault",
    moves: 15,
    objectiveType: 'collect_relics',
    targetCount: 8,
    description: 'Excavate 8 royal golden relics from the inner sanctum!',
    initialCells: [
      { r: 2, c: 2, obstacle: 'relic', color: 'color-amber' },
      { r: 2, c: 3, obstacle: 'relic', color: 'color-amber' },
      { r: 2, c: 4, obstacle: 'relic', color: 'color-amber' },
      { r: 2, c: 5, obstacle: 'relic', color: 'color-amber' },
      { r: 5, c: 2, obstacle: 'relic', color: 'color-amber' },
      { r: 5, c: 3, obstacle: 'relic', color: 'color-amber' },
      { r: 5, c: 4, obstacle: 'relic', color: 'color-amber' },
      { r: 5, c: 5, obstacle: 'relic', color: 'color-amber' },
    ],
    starScores: [700, 1300, 1900],
  },
  {
    id: 7,
    chapter: 'Crystal Cavern',
    name: 'Combo Temple',
    moves: 15,
    objectiveType: 'clear_lines',
    targetCount: 5,
    description: 'Clear 5 full lines to resonate the cavern crystals!',
    starScores: [800, 1400, 2200],
  },
  {
    id: 8,
    chapter: 'Crystal Cavern',
    name: 'Glacier Ridge',
    moves: 16,
    objectiveType: 'melt_ice',
    targetCount: 10,
    description: 'Shatter 10 thick ice barriers across the ridge!',
    initialCells: [
      { r: 0, c: 3, obstacle: 'ice', color: 'color-cyan' },
      { r: 0, c: 4, obstacle: 'ice', color: 'color-cyan' },
      { r: 3, c: 0, obstacle: 'ice', color: 'color-cyan' },
      { r: 3, c: 7, obstacle: 'ice', color: 'color-cyan' },
      { r: 4, c: 0, obstacle: 'ice', color: 'color-cyan' },
      { r: 4, c: 7, obstacle: 'ice', color: 'color-cyan' },
      { r: 7, c: 3, obstacle: 'ice', color: 'color-cyan' },
      { r: 7, c: 4, obstacle: 'ice', color: 'color-cyan' },
      { r: 3, c: 3, obstacle: 'ice', color: 'color-cyan' },
      { r: 4, c: 4, obstacle: 'ice', color: 'color-cyan' },
    ],
    starScores: [900, 1600, 2400],
  },

  // --- Chapter 3: Cosmic Sanctuary ---
  {
    id: 9,
    chapter: 'Cosmic Sanctuary',
    name: 'Golden Treasury',
    moves: 16,
    objectiveType: 'collect_relics',
    targetCount: 10,
    description: 'Collect 10 astral relics guarding the galaxy core!',
    initialCells: [
      { r: 1, c: 2, obstacle: 'relic', color: 'color-ruby' },
      { r: 1, c: 5, obstacle: 'relic', color: 'color-ruby' },
      { r: 2, c: 1, obstacle: 'relic', color: 'color-ruby' },
      { r: 2, c: 6, obstacle: 'relic', color: 'color-ruby' },
      { r: 5, c: 1, obstacle: 'relic', color: 'color-ruby' },
      { r: 5, c: 6, obstacle: 'relic', color: 'color-ruby' },
      { r: 6, c: 2, obstacle: 'relic', color: 'color-ruby' },
      { r: 6, c: 5, obstacle: 'relic', color: 'color-ruby' },
      { r: 3, c: 3, obstacle: 'relic', color: 'color-ruby' },
      { r: 4, c: 4, obstacle: 'relic', color: 'color-ruby' },
    ],
    starScores: [1000, 1800, 2600],
  },
  {
    id: 10,
    chapter: 'Cosmic Sanctuary',
    name: 'Nebula Sweep',
    moves: 16,
    objectiveType: 'clear_lines',
    targetCount: 6,
    description: 'Clear 6 lines through the heavy cosmic nebula!',
    starScores: [1100, 1900, 2800],
  },
  {
    id: 11,
    chapter: 'Cosmic Sanctuary',
    name: 'Frost Core',
    moves: 17,
    objectiveType: 'melt_ice',
    targetCount: 12,
    description: 'Melt all 12 deep permafrost seals on the sanctuary!',
    initialCells: [
      { r: 1, c: 3, obstacle: 'ice', color: 'color-emerald' },
      { r: 1, c: 4, obstacle: 'ice', color: 'color-emerald' },
      { r: 3, c: 1, obstacle: 'ice', color: 'color-emerald' },
      { r: 3, c: 6, obstacle: 'ice', color: 'color-emerald' },
      { r: 4, c: 1, obstacle: 'ice', color: 'color-emerald' },
      { r: 4, c: 6, obstacle: 'ice', color: 'color-emerald' },
      { r: 6, c: 3, obstacle: 'ice', color: 'color-emerald' },
      { r: 6, c: 4, obstacle: 'ice', color: 'color-emerald' },
      { r: 2, c: 2, obstacle: 'ice', color: 'color-emerald' },
      { r: 2, c: 5, obstacle: 'ice', color: 'color-emerald' },
      { r: 5, c: 2, obstacle: 'ice', color: 'color-emerald' },
      { r: 5, c: 5, obstacle: 'ice', color: 'color-emerald' },
    ],
    starScores: [1200, 2100, 3000],
  },
  {
    id: 12,
    chapter: 'Cosmic Sanctuary',
    name: 'Grand Master',
    moves: 18,
    objectiveType: 'target_score',
    targetCount: 2500,
    description: 'Score 2,500 Points to complete the Ultimate Journey!',
    starScores: [2500, 3500, 5000],
  },
];

// Progress Management Helpers
export function getUnlockedLevel(): number {
  const val = localStorage.getItem('box_blast_adventure_unlocked');
  return val ? Math.max(1, parseInt(val, 10)) : 1;
}

export function unlockNextLevel(completedLevelId: number): void {
  const currentUnlocked = getUnlockedLevel();
  if (completedLevelId >= currentUnlocked && completedLevelId < ADVENTURE_LEVELS.length) {
    localStorage.setItem('box_blast_adventure_unlocked', String(completedLevelId + 1));
  }
}

export function getLevelStars(levelId: number): number {
  const val = localStorage.getItem(`box_blast_level_${levelId}_stars`);
  return val ? parseInt(val, 10) : 0;
}

export function saveLevelStars(levelId: number, stars: number): void {
  const existing = getLevelStars(levelId);
  if (stars > existing) {
    localStorage.setItem(`box_blast_level_${levelId}_stars`, String(stars));
  }
}

export function calculateStars(level: AdventureLevel, score: number): number {
  if (score >= level.starScores[2]) return 3;
  if (score >= level.starScores[1]) return 2;
  return 1;
}
