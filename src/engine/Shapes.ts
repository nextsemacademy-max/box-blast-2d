import { ShapeDefinition } from './types';

export const SHAPES: ShapeDefinition[] = [
  // 1. Single Dot (1x1)
  {
    id: 'dot-1',
    name: 'Single Dot',
    matrix: [[1]],
    color: 'color-amber',
    weight: 12,
  },

  // 2. Line 2 (Horizontal & Vertical)
  {
    id: 'line-2-h',
    name: 'Line 2 Horizontal',
    matrix: [[1, 1]],
    color: 'color-cyan',
    weight: 15,
  },
  {
    id: 'line-2-v',
    name: 'Line 2 Vertical',
    matrix: [[1], [1]],
    color: 'color-cyan',
    weight: 15,
  },

  // 3. Line 3 (Horizontal & Vertical)
  {
    id: 'line-3-h',
    name: 'Line 3 Horizontal',
    matrix: [[1, 1, 1]],
    color: 'color-emerald',
    weight: 14,
  },
  {
    id: 'line-3-v',
    name: 'Line 3 Vertical',
    matrix: [[1], [1], [1]],
    color: 'color-emerald',
    weight: 14,
  },

  // 4. Line 4 (Horizontal & Vertical)
  {
    id: 'line-4-h',
    name: 'Line 4 Horizontal',
    matrix: [[1, 1, 1, 1]],
    color: 'color-sapphire',
    weight: 10,
  },
  {
    id: 'line-4-v',
    name: 'Line 4 Vertical',
    matrix: [[1], [1], [1], [1]],
    color: 'color-sapphire',
    weight: 10,
  },

  // 5. Line 5 (Horizontal & Vertical)
  {
    id: 'line-5-h',
    name: 'Line 5 Horizontal',
    matrix: [[1, 1, 1, 1, 1]],
    color: 'color-ruby',
    weight: 6,
  },
  {
    id: 'line-5-v',
    name: 'Line 5 Vertical',
    matrix: [[1], [1], [1], [1], [1]],
    color: 'color-ruby',
    weight: 6,
  },

  // 6. Square 2x2
  {
    id: 'square-2x2',
    name: 'Square 2x2',
    matrix: [
      [1, 1],
      [1, 1],
    ],
    color: 'color-purple',
    weight: 14,
  },

  // 7. Small Corner L (2x2) - 4 Rotations
  {
    id: 'corner-small-1',
    name: 'Corner Small TL',
    matrix: [
      [1, 1],
      [1, 0],
    ],
    color: 'color-pink',
    weight: 12,
  },
  {
    id: 'corner-small-2',
    name: 'Corner Small TR',
    matrix: [
      [1, 1],
      [0, 1],
    ],
    color: 'color-pink',
    weight: 12,
  },
  {
    id: 'corner-small-3',
    name: 'Corner Small BL',
    matrix: [
      [1, 0],
      [1, 1],
    ],
    color: 'color-pink',
    weight: 12,
  },
  {
    id: 'corner-small-4',
    name: 'Corner Small BR',
    matrix: [
      [0, 1],
      [1, 1],
    ],
    color: 'color-pink',
    weight: 12,
  },

  // 8. Large Corner L (3x3) - 4 Rotations
  {
    id: 'corner-large-1',
    name: 'Corner Large BL',
    matrix: [
      [1, 0, 0],
      [1, 0, 0],
      [1, 1, 1],
    ],
    color: 'color-amber',
    weight: 8,
  },
  {
    id: 'corner-large-2',
    name: 'Corner Large BR',
    matrix: [
      [0, 0, 1],
      [0, 0, 1],
      [1, 1, 1],
    ],
    color: 'color-amber',
    weight: 8,
  },
  {
    id: 'corner-large-3',
    name: 'Corner Large TL',
    matrix: [
      [1, 1, 1],
      [1, 0, 0],
      [1, 0, 0],
    ],
    color: 'color-amber',
    weight: 8,
  },
  {
    id: 'corner-large-4',
    name: 'Corner Large TR',
    matrix: [
      [1, 1, 1],
      [0, 0, 1],
      [0, 0, 1],
    ],
    color: 'color-amber',
    weight: 8,
  },

  // 9. Giant Square 3x3
  {
    id: 'square-3x3',
    name: 'Giant Square 3x3',
    matrix: [
      [1, 1, 1],
      [1, 1, 1],
      [1, 1, 1],
    ],
    color: 'color-ruby',
    weight: 5,
  },

  // 10. T-Shape (All 4 Rotations)
  {
    id: 't-shape-down',
    name: 'T-Shape Down',
    matrix: [
      [1, 1, 1],
      [0, 1, 0],
    ],
    color: 'color-purple',
    weight: 10,
  },
  {
    id: 't-shape-up',
    name: 'T-Shape Up',
    matrix: [
      [0, 1, 0],
      [1, 1, 1],
    ],
    color: 'color-purple',
    weight: 10,
  },
  {
    id: 't-shape-left',
    name: 'T-Shape Left',
    matrix: [
      [0, 1],
      [1, 1],
      [0, 1],
    ],
    color: 'color-purple',
    weight: 9,
  },
  {
    id: 't-shape-right',
    name: 'T-Shape Right',
    matrix: [
      [1, 0],
      [1, 1],
      [1, 0],
    ],
    color: 'color-purple',
    weight: 9,
  },

  // 11. Z and S shapes (Horizontal & Vertical)
  {
    id: 'z-shape',
    name: 'Z-Shape Horizontal',
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: 'color-cyan',
    weight: 9,
  },
  {
    id: 'z-shape-v',
    name: 'Z-Shape Vertical',
    matrix: [
      [0, 1],
      [1, 1],
      [1, 0],
    ],
    color: 'color-cyan',
    weight: 8,
  },
  {
    id: 's-shape',
    name: 'S-Shape Horizontal',
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: 'color-emerald',
    weight: 9,
  },
  {
    id: 's-shape-v',
    name: 'S-Shape Vertical',
    matrix: [
      [1, 0],
      [1, 1],
      [0, 1],
    ],
    color: 'color-emerald',
    weight: 8,
  },

  // 12. Standard L and J Shapes (3x2 - 4 Rotations)
  {
    id: 'l-shape-1',
    name: 'L-Shape BL',
    matrix: [
      [1, 0],
      [1, 0],
      [1, 1],
    ],
    color: 'color-amber',
    weight: 10,
  },
  {
    id: 'l-shape-2',
    name: 'L-Shape BR',
    matrix: [
      [0, 1],
      [0, 1],
      [1, 1],
    ],
    color: 'color-amber',
    weight: 10,
  },
  {
    id: 'l-shape-3',
    name: 'L-Shape TL',
    matrix: [
      [1, 1],
      [1, 0],
      [1, 0],
    ],
    color: 'color-amber',
    weight: 10,
  },
  {
    id: 'l-shape-4',
    name: 'L-Shape TR',
    matrix: [
      [1, 1],
      [0, 1],
      [0, 1],
    ],
    color: 'color-amber',
    weight: 10,
  },
];

import type { GridEngine } from './Grid';

/**
 * Returns a weighted random shape definition from a given pool of shapes
 */
export function getWeightedRandomShape(pool: ShapeDefinition[] = SHAPES): ShapeDefinition {
  if (pool.length === 0) return SHAPES[0];
  const totalWeight = pool.reduce((sum, s) => sum + s.weight, 0);
  let randomVal = Math.random() * totalWeight;

  for (const shape of pool) {
    if (randomVal < shape.weight) {
      return shape;
    }
    randomVal -= shape.weight;
  }

  return pool[0];
}

/**
 * Legacy blind generator
 */
export function getRandomShape(): ShapeDefinition {
  return getWeightedRandomShape(SHAPES);
}

/**
 * Generates 3 shapes for the player hand (legacy fallback)
 */
export function generateHand(): (ShapeDefinition | null)[] {
  return [getRandomShape(), getRandomShape(), getRandomShape()];
}

/**
 * Smart, Fair, and Solvable Hand Generator:
 * - Eliminates oversized shapes (3x3 squares, 5-lines) when board is congested.
 * - Prioritizes saver pieces (dots, 2-lines, small corners) when rows/cols are near completion.
 * - Guarantees that at least 2 shapes (and usually all 3) can be legally placed on the board.
 */
export function generateSmartHand(grid: GridEngine): (ShapeDefinition | null)[] {
  const filledCount = grid.countFilledCells();
  const fullness = filledCount / 64;
  const nearLines = grid.getNearCompleteLines();
  const hasNearComplete = nearLines.rows.length > 0 || nearLines.cols.length > 0;

  // 1. Build an adaptive candidate pool based on board congestion
  let pool = SHAPES.map((s) => ({ ...s }));

  if (fullness >= 0.45) {
    // Crowded board: completely ban giant 3x3 square, 5-lines, and large corners
    pool = pool.filter(
      (s) =>
        s.id !== 'square-3x3' &&
        !s.id.startsWith('line-5') &&
        !s.id.startsWith('corner-large')
    );
  } else if (fullness >= 0.30) {
    // Moderate congestion: ban giant 3x3 square, reduce 5-lines
    pool = pool.filter((s) => s.id !== 'square-3x3');
    pool.forEach((s) => {
      if (s.id.startsWith('line-5')) s.weight = 2;
    });
  }

  // 2. Saver boost: if lines are 1-2 blocks from clearing or board is crowded, boost small saver pieces
  if (hasNearComplete || fullness >= 0.35) {
    pool.forEach((s) => {
      if (s.id === 'dot-1') {
        s.weight = 32; // Generously offer 1x1 dots for clutch line clears
      } else if (s.id.startsWith('line-2')) {
        s.weight = 25;
      } else if (s.id.startsWith('corner-small')) {
        s.weight = 20;
      }
    });
  }

  // 3. Find playable candidates on current board
  const playablePool = pool.filter((s) => grid.canFitAnywhere(s));

  // If candidate pool has playable shapes, ensure at least 2 shapes in hand are guaranteed playable
  const result: (ShapeDefinition | null)[] = [];

  const pickPlayable = (): ShapeDefinition => {
    if (playablePool.length > 0) {
      return getWeightedRandomShape(playablePool);
    }
    // Extreme fallback: single dot
    const dot = SHAPES.find((s) => s.id === 'dot-1') || SHAPES[0];
    return dot;
  };

  const pickGeneral = (): ShapeDefinition => {
    const candidate = getWeightedRandomShape(pool);
    // If candidate can fit, use it; otherwise fallback to a guaranteed playable piece
    if (grid.canFitAnywhere(candidate)) {
      return candidate;
    }
    return pickPlayable();
  };

  // Slot 0: Guaranteed playable
  result.push(pickPlayable());

  // Slot 1: Guaranteed playable
  result.push(pickPlayable());

  // Slot 2: If board is crowded (>= 35%), guarantee playable; otherwise allow general shape with fallback
  if (fullness >= 0.35) {
    result.push(pickPlayable());
  } else {
    result.push(pickGeneral());
  }

  return result;
}
