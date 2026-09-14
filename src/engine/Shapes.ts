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

  // 10. T-Shape (3x2)
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

  // 11. Z and S shapes
  {
    id: 'z-shape',
    name: 'Z-Shape',
    matrix: [
      [1, 1, 0],
      [0, 1, 1],
    ],
    color: 'color-cyan',
    weight: 9,
  },
  {
    id: 's-shape',
    name: 'S-Shape',
    matrix: [
      [0, 1, 1],
      [1, 1, 0],
    ],
    color: 'color-emerald',
    weight: 9,
  },
];

/**
 * Returns a weighted random shape definition
 */
export function getRandomShape(): ShapeDefinition {
  const totalWeight = SHAPES.reduce((sum, s) => sum + s.weight, 0);
  let randomVal = Math.random() * totalWeight;

  for (const shape of SHAPES) {
    if (randomVal < shape.weight) {
      return shape;
    }
    randomVal -= shape.weight;
  }

  return SHAPES[0];
}

/**
 * Generates 3 shapes for the player hand
 */
export function generateHand(): (ShapeDefinition | null)[] {
  return [getRandomShape(), getRandomShape(), getRandomShape()];
}
