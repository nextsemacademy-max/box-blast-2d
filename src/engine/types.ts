export type ColorTheme = 
  | 'color-cyan'
  | 'color-amber'
  | 'color-ruby'
  | 'color-emerald'
  | 'color-purple'
  | 'color-sapphire'
  | 'color-pink';

export interface ShapeDefinition {
  id: string;
  name: string;
  matrix: number[][]; // 1 for filled block, 0 for empty
  color: ColorTheme;
  weight: number; // probability weight
}

export interface GridCellState {
  filled: boolean;
  color: ColorTheme | null;
}

export interface DragState {
  shape: ShapeDefinition;
  slotIndex: number;
  initialPointerX: number;
  initialPointerY: number;
  currentPointerX: number;
  currentPointerY: number;
  touchOffsetY: number; // Lifts block above touch contact point
  grabOffsetX?: number; // Relative grab offset for smooth pickup without jumping
  grabOffsetY?: number;
}

export interface ClearResult {
  clearedRows: number[];
  clearedCols: number[];
  totalLines: number;
  cellsCleared: number;
}
