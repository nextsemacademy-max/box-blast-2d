import { GridCellState, ShapeDefinition, ClearResult, ObstacleType, ColorTheme } from './types';

export const BOARD_SIZE = 9;

export class GridEngine {
  public board: GridCellState[][];

  constructor() {
    this.board = this.createEmptyBoard();
  }

  public createEmptyBoard(): GridCellState[][] {
    const board: GridCellState[][] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      const row: GridCellState[] = [];
      for (let c = 0; c < BOARD_SIZE; c++) {
        row.push({ filled: false, color: null });
      }
      board.push(row);
    }
    return board;
  }

  public reset(): void {
    this.board = this.createEmptyBoard();
  }

  /**
   * Validates if a shape can be legally placed at (startRow, startCol)
   */
  public canPlaceShape(shape: ShapeDefinition, startRow: number, startCol: number): boolean {
    const matrix = shape.matrix;
    const shapeRows = matrix.length;
    const shapeCols = matrix[0].length;

    for (let r = 0; r < shapeRows; r++) {
      for (let c = 0; c < shapeCols; c++) {
        if (matrix[r][c] === 1) {
          const boardR = startRow + r;
          const boardC = startCol + c;

          // Out of board boundaries
          if (boardR < 0 || boardR >= BOARD_SIZE || boardC < 0 || boardC >= BOARD_SIZE) {
            return false;
          }

          // Cell already occupied
          if (this.board[boardR][boardC].filled) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Commits placement of a shape onto the board
   */
  public placeShape(shape: ShapeDefinition, startRow: number, startCol: number): { r: number; c: number }[] {
    const placedCoords: { r: number; c: number }[] = [];
    const matrix = shape.matrix;

    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[0].length; c++) {
        if (matrix[r][c] === 1) {
          const boardR = startRow + r;
          const boardC = startCol + c;
          this.board[boardR][boardC] = {
            filled: true,
            color: shape.color,
          };
          placedCoords.push({ r: boardR, c: boardC });
        }
      }
    }

    return placedCoords;
  }

  /**
   * Scans rows and columns for full lines and clears them
   */
  public checkAndClearLines(): ClearResult {
    const clearedRows: number[] = [];
    const clearedCols: number[] = [];

    // 1. Check full rows
    for (let r = 0; r < BOARD_SIZE; r++) {
      let full = true;
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (!this.board[r][c].filled) {
          full = false;
          break;
        }
      }
      if (full) {
        clearedRows.push(r);
      }
    }

    // 2. Check full columns
    for (let c = 0; c < BOARD_SIZE; c++) {
      let full = true;
      for (let r = 0; r < BOARD_SIZE; r++) {
        if (!this.board[r][c].filled) {
          full = false;
          break;
        }
      }
      if (full) {
        clearedCols.push(c);
      }
    }

    // 3. Clear the identified lines
    const clearedSet = new Set<string>();

    for (const r of clearedRows) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        clearedSet.add(`${r},${c}`);
      }
    }

    for (const c of clearedCols) {
      for (let r = 0; r < BOARD_SIZE; r++) {
        clearedSet.add(`${r},${c}`);
      }
    }

    const clearedObstacles: { r: number; c: number; type: ObstacleType }[] = [];

    // Empty the cells and track any cleared obstacles
    clearedSet.forEach((coord) => {
      const [r, c] = coord.split(',').map(Number);
      const cell = this.board[r][c];
      if (cell.obstacle) {
        clearedObstacles.push({ r, c, type: cell.obstacle });
      }
      this.board[r][c] = { filled: false, color: null, obstacle: null };
    });

    return {
      clearedRows,
      clearedCols,
      totalLines: clearedRows.length + clearedCols.length,
      cellsCleared: clearedSet.size,
      clearedObstacles,
    };
  }

  /**
   * Sets an obstacle on the board (used by Adventure mode levels)
   */
  public setObstacle(r: number, c: number, obstacle: ObstacleType, color: ColorTheme): void {
    if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
      this.board[r][c] = {
        filled: true,
        color,
        obstacle,
        obstacleHits: 1,
      };
    }
  }

  /**
   * Counts remaining obstacles of a specific type on the board
   */
  public countRemainingObstacles(type?: ObstacleType): number {
    let count = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (type) {
          if (this.board[r][c].obstacle === type) count++;
        } else {
          if (this.board[r][c].obstacle) count++;
        }
      }
    }
    return count;
  }

  /**
   * Determines if a shape can be placed anywhere on the current board
   */
  public canFitAnywhere(shape: ShapeDefinition): boolean {
    const rows = shape.matrix.length;
    const cols = shape.matrix[0].length;

    for (let r = 0; r <= BOARD_SIZE - rows; r++) {
      for (let c = 0; c <= BOARD_SIZE - cols; c++) {
        if (this.canPlaceShape(shape, r, c)) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Predicts which rows and columns would be cleared if shape is placed at (startRow, startCol)
   */
  public predictClearedLines(shape: ShapeDefinition, startRow: number, startCol: number): { rows: number[]; cols: number[] } {
    const rows: number[] = [];
    const cols: number[] = [];

    const matrix = shape.matrix;
    const shapeRows = matrix.length;
    const shapeCols = matrix[0].length;

    // Validate placement feasibility
    for (let r = 0; r < shapeRows; r++) {
      for (let c = 0; c < shapeCols; c++) {
        if (matrix[r][c] === 1) {
          const boardR = startRow + r;
          const boardC = startCol + c;
          if (boardR < 0 || boardR >= BOARD_SIZE || boardC < 0 || boardC >= BOARD_SIZE) {
            return { rows, cols };
          }
          if (this.board[boardR][boardC].filled) {
            return { rows, cols };
          }
        }
      }
    }

    // 1. Scan rows for potential completion
    for (let r = 0; r < BOARD_SIZE; r++) {
      let willBeFull = true;
      for (let c = 0; c < BOARD_SIZE; c++) {
        const isCurrentlyFilled = this.board[r][c].filled;
        const willBeFilledByShape = (
          r >= startRow &&
          r < startRow + shapeRows &&
          c >= startCol &&
          c < startCol + shapeCols &&
          matrix[r - startRow][c - startCol] === 1
        );
        if (!isCurrentlyFilled && !willBeFilledByShape) {
          willBeFull = false;
          break;
        }
      }
      if (willBeFull) {
        rows.push(r);
      }
    }

    // 2. Scan columns for potential completion
    for (let c = 0; c < BOARD_SIZE; c++) {
      let willBeFull = true;
      for (let r = 0; r < BOARD_SIZE; r++) {
        const isCurrentlyFilled = this.board[r][c].filled;
        const willBeFilledByShape = (
          r >= startRow &&
          r < startRow + shapeRows &&
          c >= startCol &&
          c < startCol + shapeCols &&
          matrix[r - startRow][c - startCol] === 1
        );
        if (!isCurrentlyFilled && !willBeFilledByShape) {
          willBeFull = false;
          break;
        }
      }
      if (willBeFull) {
        cols.push(c);
      }
    }

    return { rows, cols };
  }

  /**
   * Rewarded Ad Revive: Clears a 3x3 area around center to free up space
   */
  public clearBombArea(centerR: number = 4, centerC: number = 4): { r: number; c: number }[] {
    const cleared: { r: number; c: number }[] = [];
    for (let r = centerR - 1; r <= centerR + 1; r++) {
      for (let c = centerC - 1; c <= centerC + 1; c++) {
        if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
          if (this.board[r][c].filled) {
            cleared.push({ r, c });
            this.board[r][c] = { filled: false, color: null };
          }
        }
      }
    }
    return cleared;
  }

  /**
   * Hammer Booster: Clears a single target cell
   */
  public clearSingleCell(r: number, c: number): { r: number; c: number; color: ColorTheme | null } | null {
    if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
      if (this.board[r][c].filled) {
        const color = this.board[r][c].color;
        this.board[r][c] = { filled: false, color: null, obstacle: null };
        return { r, c, color };
      }
    }
    return null;
  }

  /**
   * Rocket Booster: Clears all filled cells in row `r` and column `c` (Supersonic Cross Blast)
   */
  public clearCrossRocket(targetR: number, targetC: number): { r: number; c: number; color: ColorTheme | null }[] {
    const cleared: { r: number; c: number; color: ColorTheme | null }[] = [];
    const clearedCoords = new Set<string>();

    // Clear entire row
    for (let c = 0; c < BOARD_SIZE; c++) {
      if (this.board[targetR][c].filled) {
        clearedCoords.add(`${targetR},${c}`);
        cleared.push({ r: targetR, c, color: this.board[targetR][c].color });
        this.board[targetR][c] = { filled: false, color: null, obstacle: null };
      }
    }

    // Clear entire column
    for (let r = 0; r < BOARD_SIZE; r++) {
      const key = `${r},${targetC}`;
      if (this.board[r][targetC].filled && !clearedCoords.has(key)) {
        clearedCoords.add(key);
        cleared.push({ r, c: targetC, color: this.board[r][targetC].color });
        this.board[r][targetC] = { filled: false, color: null, obstacle: null };
      }
    }

    return cleared;
  }

  /**
   * Counts the total number of currently filled cells on the board
   */
  public countFilledCells(): number {
    let count = 0;
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (this.board[r][c].filled) {
          count++;
        }
      }
    }
    return count;
  }

  /**
   * Checks whether the entire board is completely empty (Clean Slate)
   */
  public isCleanSlate(): boolean {
    return this.countFilledCells() === 0;
  }

  /**
   * Identifies rows and columns that are 1 or 2 blocks away from completing (6 or 7 cells filled)
   */
  public getNearCompleteLines(): { rows: number[]; cols: number[] } {
    const nearRows: number[] = [];
    const nearCols: number[] = [];

    for (let r = 0; r < BOARD_SIZE; r++) {
      let filled = 0;
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (this.board[r][c].filled) filled++;
      }
      if (filled >= BOARD_SIZE - 2 && filled < BOARD_SIZE) {
        nearRows.push(r);
      }
    }

    for (let c = 0; c < BOARD_SIZE; c++) {
      let filled = 0;
      for (let r = 0; r < BOARD_SIZE; r++) {
        if (this.board[r][c].filled) filled++;
      }
      if (filled >= BOARD_SIZE - 2 && filled < BOARD_SIZE) {
        nearCols.push(c);
      }
    }

    return { rows: nearRows, cols: nearCols };
  }
}

