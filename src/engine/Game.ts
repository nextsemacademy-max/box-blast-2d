import { BOARD_SIZE, GridEngine } from './Grid';
import { generateSmartHand } from './Shapes';
import { DragState, ShapeDefinition } from './types';
import { sound } from './SoundFX';
import { ParticleEngine } from './Particles';

export class BlockBlastGame {
  private grid: GridEngine;
  private particles: ParticleEngine;

  // DOM Elements
  private boardContainerElement: HTMLElement;
  private boardElement: HTMLElement;
  private handDockElement: HTMLElement;
  private scoreElement: HTMLElement;
  private bestScoreElement: HTMLElement;
  private comboBadgeElement: HTMLElement;
  private comboTextElement: HTMLElement;
  private streakIndicatorElement: HTMLElement;
  private dragProxyElement: HTMLElement;
  private floatingTextContainer: HTMLElement;
  private gameOverModal: HTMLElement;
  private modalFinalScore: HTMLElement;
  private modalBestScore: HTMLElement;
  private tutorialModal: HTMLElement;
  private toastElement: HTMLElement;
  private soundBtn: HTMLElement;
  private soundIconOn: HTMLElement;
  private soundIconOff: HTMLElement;
  private pauseBtn: HTMLElement;
  private pauseModal: HTMLElement;
  private resumeGameBtn: HTMLElement;
  private pauseHowToPlayBtn: HTMLElement;
  private pauseRestartGameBtn: HTMLElement;
  private modalToggleSound: HTMLElement;
  private modalToggleHaptic: HTMLElement;
  private restartBtn: HTMLElement;
  private restartIconSvg: HTMLElement;
  private modalRestartBtn: HTMLElement;
  private modalReviveBtn: HTMLElement;
  private closeTutorialBtn: HTMLElement;
  private hapticEnabled: boolean = true;

  // State
  private hand: (ShapeDefinition | null)[] = [null, null, null];
  private score: number = 0;
  private displayedScore: number = 0;
  private bestScore: number = 0;
  private comboStreak: number = 0;
  private isGameOver: boolean = false;
  private isReturningSnapback: boolean = false;
  private dragState: DragState | null = null;
  private activePointerId: number | null = null;
  private activeContainerEl: HTMLElement | null = null;

  // Cached Geometry & Direct Cell Array for 120fps Zero-Lag Dragging
  private cachedBoardRect: DOMRect | null = null;
  private cachedCellWidth: number = 0;
  private cachedCellHeight: number = 0;
  private cellElementsGrid: HTMLElement[][] = [];
  private currentGhostCells: { r: number; c: number }[] = [];
  private currentPredictiveCells: { r: number; c: number }[] = [];
  private wasPredicting: boolean = false;
  private hasCelebratedNewRecord: boolean = false;
  private lastGhostRow: number = -999;
  private lastGhostCol: number = -999;
  private rafDragPending: boolean = false;
  private latestPointerX: number = 0;
  private latestPointerY: number = 0;

  // Combo Celebration Titles
  private comboHypeTitles = [
    '',
    'NICE!',
    'COOL!',
    'GREAT!',
    'AMAZING!',
    'EXCELLENT!',
    'UNBELIEVABLE!',
    'MASTERPIECE!',
  ];

  constructor() {
    this.grid = new GridEngine();

    // Cache DOM Elements
    this.boardContainerElement = document.querySelector('.board-container')!;
    this.boardElement = document.getElementById('grid-board')!;
    this.handDockElement = document.getElementById('hand-dock')!;
    this.scoreElement = document.getElementById('score-display')!;
    this.bestScoreElement = document.getElementById('best-score-display')!;
    this.comboBadgeElement = document.getElementById('combo-badge')!;
    this.comboTextElement = document.getElementById('combo-text')!;
    this.streakIndicatorElement = document.getElementById('streak-indicator')!;
    this.dragProxyElement = document.getElementById('drag-proxy')!;
    this.floatingTextContainer = document.getElementById('floating-text-container')!;
    this.gameOverModal = document.getElementById('game-over-modal')!;
    this.modalFinalScore = document.getElementById('modal-final-score')!;
    this.modalBestScore = document.getElementById('modal-best-score')!;
    this.tutorialModal = document.getElementById('tutorial-modal')!;
    this.toastElement = document.getElementById('toast-message')!;

    this.soundBtn = document.getElementById('sound-btn')!;
    this.soundIconOn = document.getElementById('sound-icon-on')!;
    this.soundIconOff = document.getElementById('sound-icon-off')!;
    this.pauseBtn = document.getElementById('pause-btn')!;
    this.pauseModal = document.getElementById('pause-modal')!;
    this.resumeGameBtn = document.getElementById('resume-game-btn')!;
    this.pauseHowToPlayBtn = document.getElementById('pause-how-to-play-btn')!;
    this.pauseRestartGameBtn = document.getElementById('pause-restart-game-btn')!;
    this.modalToggleSound = document.getElementById('modal-toggle-sound')!;
    this.modalToggleHaptic = document.getElementById('modal-toggle-haptic')!;

    this.restartBtn = document.getElementById('restart-btn')!;
    this.restartIconSvg = document.getElementById('restart-icon-svg')!;
    this.modalRestartBtn = document.getElementById('modal-restart-btn')!;
    this.modalReviveBtn = document.getElementById('modal-revive-btn')!;
    this.closeTutorialBtn = document.getElementById('close-tutorial-btn')!;

    const canvas = document.getElementById('particle-canvas') as HTMLCanvasElement;
    this.particles = new ParticleEngine(canvas);

    this.initScores();
    this.setupBoardDOM();
    this.setupGlobalPointerEvents();
    this.setupButtonEvents();
    this.startNewGame();

    // Re-cache board rect on window resize
    window.addEventListener('resize', () => {
      if (this.boardElement) {
        this.updateCachedBoardGeometry();
      }
    });
  }

  private initScores(): void {
    const savedBest = localStorage.getItem('box_blast_2d_best');
    this.bestScore = savedBest ? parseInt(savedBest, 10) : 0;
    this.bestScoreElement.textContent = String(this.bestScore);
  }

  public startNewGame(): void {
    this.grid.reset();
    this.score = 0;
    this.displayedScore = 0;
    this.comboStreak = 0;
    this.isGameOver = false;
    this.isReturningSnapback = false;
    this.wasPredicting = false;
    this.hasCelebratedNewRecord = false;
    this.clearGhostCells();
    this.clearPredictiveCells();
    this.scoreElement.textContent = '0';
    this.updateStreakUI();
    this.renderBoard();
    this.spawnNewHand(true);
    this.gameOverModal.classList.add('hidden');
    this.updateCachedBoardGeometry();
  }

  private updateCachedBoardGeometry(): void {
    this.cachedBoardRect = this.boardElement.getBoundingClientRect();
    this.cachedCellWidth = this.cachedBoardRect.width / BOARD_SIZE;
    this.cachedCellHeight = this.cachedBoardRect.height / BOARD_SIZE;
  }

  // 1. Board DOM setup (8x8 cells cached in 2D array for 0ms lookup)
  private setupBoardDOM(): void {
    this.boardElement.innerHTML = '';
    this.cellElementsGrid = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      const row: HTMLElement[] = [];
      for (let c = 0; c < BOARD_SIZE; c++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.row = String(r);
        cell.dataset.col = String(c);
        this.boardElement.appendChild(cell);
        row.push(cell);
      }
      this.cellElementsGrid.push(row);
    }
  }

  // 2. High-Performance Direct Array Render Board (0ms querySelector)
  private renderBoard(): void {
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const cell = this.cellElementsGrid[r][c];
        const state = this.grid.board[r][c];
        cell.className = 'grid-cell';
        if (state.filled && state.color) {
          cell.classList.add('filled', state.color);
        }
      }
    }
  }

  // 3. Hand Management with Staggered Slide-In
  private spawnNewHand(isInitial: boolean = false): void {
    this.hand = generateSmartHand(this.grid);
    this.renderHand(isInitial);
    this.checkPlayability();
  }

  private renderHand(staggerAnim: boolean = true): void {
    for (let i = 0; i < 3; i++) {
      const slot = document.getElementById(`slot-${i}`)!;
      slot.innerHTML = '';
      slot.className = 'hand-slot';

      const shape = this.hand[i];
      if (!shape) continue;

      if (staggerAnim) {
        slot.classList.add('slide-in');
        sound.playHandSpawn(i);
      }

      const container = document.createElement('div');
      container.className = 'shape-container';
      container.dataset.slot = String(i);

      const rows = shape.matrix.length;
      const cols = shape.matrix[0].length;
      container.style.gridTemplateRows = `repeat(${rows}, 18px)`;
      container.style.gridTemplateColumns = `repeat(${cols}, 18px)`;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const unit = document.createElement('div');
          if (shape.matrix[r][c] === 1) {
            unit.className = `block-unit ${shape.color}`;
          } else {
            unit.style.visibility = 'hidden';
          }
          container.appendChild(unit);
        }
      }

      // Pointer drag start on the shape
      container.addEventListener('pointerdown', (e) => this.onDragStart(e, shape, i, container));

      slot.appendChild(container);
    }
  }

  private cancelSnapbackImmediate(): void {
    if (this.dragState) {
      const slot = document.getElementById(`slot-${this.dragState.slotIndex}`);
      if (slot && slot.firstElementChild) {
        (slot.firstElementChild as HTMLElement).style.visibility = 'visible';
      }
    }
    this.dragProxyElement.classList.remove('spring-returning');
    this.cleanupDrag();
    this.isReturningSnapback = false;
  }

  // 4. Ultra-Smooth Hardware-Accelerated Zero-Lag Drag & Drop
  private onDragStart(e: PointerEvent, shape: ShapeDefinition, slotIndex: number, containerEl: HTMLElement): void {
    if (this.isGameOver) return;
    if (this.isReturningSnapback) {
      this.cancelSnapbackImmediate();
    }
    e.preventDefault();

    this.updateCachedBoardGeometry();
    sound.playPickup();
    this.triggerVibrate(10);

    const isTouch = e.pointerType === 'touch' || e.pointerType === 'pen';
    const touchOffsetY = isTouch ? 72 : 0;

    let grabOffsetX = 0;
    let grabOffsetY = 0;

    if (!isTouch) {
      const containerRect = containerEl.getBoundingClientRect();
      const centerX = containerRect.left + containerRect.width / 2;
      const centerY = containerRect.top + containerRect.height / 2;
      grabOffsetX = e.clientX - centerX;
      grabOffsetY = e.clientY - centerY;
    }

    this.activePointerId = e.pointerId;
    this.activeContainerEl = containerEl;

    this.dragState = {
      shape,
      slotIndex,
      initialPointerX: e.clientX,
      initialPointerY: e.clientY,
      currentPointerX: e.clientX,
      currentPointerY: e.clientY,
      touchOffsetY,
      grabOffsetX,
      grabOffsetY,
    };

    this.lastGhostRow = -999;
    this.lastGhostCol = -999;

    // Cleanly hide original shape in slot
    const slot = document.getElementById(`slot-${slotIndex}`);
    if (slot && slot.firstElementChild) {
      (slot.firstElementChild as HTMLElement).style.visibility = 'hidden';
    }

    // Build Drag Proxy matching grid cell dimensions
    this.buildDragProxy(shape);
    const effX = e.clientX - grabOffsetX;
    const effY = e.clientY - touchOffsetY - grabOffsetY;
    this.setProxyTransform(effX, effY);
    this.updateGhostPlacement(effX, effY);
  }

  private buildDragProxy(shape: ShapeDefinition): void {
    this.dragProxyElement.innerHTML = '';
    this.dragProxyElement.className = 'drag-proxy';
    this.dragProxyElement.style.transition = 'none';
    this.dragProxyElement.style.opacity = '1';

    const cellSize = this.cachedCellWidth || 38;
    const rows = shape.matrix.length;
    const cols = shape.matrix[0].length;

    this.dragProxyElement.style.gridTemplateRows = `repeat(${rows}, ${cellSize}px)`;
    this.dragProxyElement.style.gridTemplateColumns = `repeat(${cols}, ${cellSize}px)`;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const unit = document.createElement('div');
        if (shape.matrix[r][c] === 1) {
          unit.className = `block-unit ${shape.color}`;
          unit.style.width = `${cellSize}px`;
          unit.style.height = `${cellSize}px`;
          unit.style.borderRadius = '50%';
        } else {
          unit.style.visibility = 'hidden';
          unit.style.width = `${cellSize}px`;
          unit.style.height = `${cellSize}px`;
        }
        this.dragProxyElement.appendChild(unit);
      }
    }
  }

  private setProxyTransform(x: number, y: number): void {
    this.dragProxyElement.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%) scale(1.06)`;
  }

  private setupGlobalPointerEvents(): void {
    window.addEventListener('pointermove', (e) => {
      if (!this.dragState) return;
      e.preventDefault();

      const grabX = this.dragState.grabOffsetX || 0;
      const grabY = this.dragState.grabOffsetY || 0;
      this.latestPointerX = e.clientX - grabX;
      this.latestPointerY = e.clientY - this.dragState.touchOffsetY - grabY;

      // 0ms instant 1:1 hardware transform
      this.setProxyTransform(this.latestPointerX, this.latestPointerY);

      // 0ms instant ghost placement (zero wait time!)
      this.updateGhostPlacement(this.latestPointerX, this.latestPointerY);
    }, { passive: false });

    window.addEventListener('pointerup', (e) => {
      if (!this.dragState) return;
      e.preventDefault();

      const grabX = this.dragState.grabOffsetX || 0;
      const grabY = this.dragState.grabOffsetY || 0;
      const effX = e.clientX - grabX;
      const effY = e.clientY - this.dragState.touchOffsetY - grabY;
      this.onDragEnd(effX, effY);
    });

    window.addEventListener('pointercancel', () => {
      if (!this.dragState) return;
      this.triggerSpringSnapback();
    });
  }

  // 5. Smart Diffed Ghost Shadow Calculation
  private updateGhostPlacement(cursorX: number, cursorY: number): void {
    if (!this.dragState) return;

    const target = this.getGridCoordFromPoint(cursorX, cursorY, this.dragState.shape);

    if (!target) {
      if (this.lastGhostRow !== -999 || this.lastGhostCol !== -999) {
        this.clearGhostCells();
        this.clearPredictiveCells();
        this.wasPredicting = false;
        this.lastGhostRow = -999;
        this.lastGhostCol = -999;
      }
      return;
    }

    const { startRow, startCol } = target;

    // Diff check
    if (startRow === this.lastGhostRow && startCol === this.lastGhostCol) {
      return;
    }

    this.clearGhostCells();
    this.clearPredictiveCells();
    this.lastGhostRow = startRow;
    this.lastGhostCol = startCol;

    if (this.grid.canPlaceShape(this.dragState.shape, startRow, startCol)) {
      const matrix = this.dragState.shape.matrix;
      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[0].length; c++) {
          if (matrix[r][c] === 1) {
            const gr = startRow + r;
            const gc = startCol + c;
            this.currentGhostCells.push({ r: gr, c: gc });
            const cellEl = this.getCellElement(gr, gc);
            if (cellEl) {
              cellEl.classList.add('ghost');
            }
          }
        }
      }

      // Real-time Predictive Line Clears
      const predicted = this.grid.predictClearedLines(this.dragState.shape, startRow, startCol);
      const isPredicting = predicted.rows.length > 0 || predicted.cols.length > 0;

      if (isPredicting) {
        if (!this.wasPredicting) {
          this.wasPredicting = true;
          sound.playPredictiveChord();
          if ('vibrate' in navigator) {
            navigator.vibrate?.(12);
          }
        }

        const isMulti = (predicted.rows.length + predicted.cols.length) >= 2;

        for (const r of predicted.rows) {
          for (let c = 0; c < BOARD_SIZE; c++) {
            this.currentPredictiveCells.push({ r, c });
            const cellEl = this.getCellElement(r, c);
            if (cellEl) {
              cellEl.classList.add('predictive-line');
              if (isMulti) cellEl.classList.add('predictive-line-multi');
            }
          }
        }

        for (const c of predicted.cols) {
          for (let r = 0; r < BOARD_SIZE; r++) {
            this.currentPredictiveCells.push({ r, c });
            const cellEl = this.getCellElement(r, c);
            if (cellEl) {
              cellEl.classList.add('predictive-line');
              if (isMulti) cellEl.classList.add('predictive-line-multi');
            }
          }
        }
      } else {
        this.wasPredicting = false;
      }
    } else {
      this.wasPredicting = false;
    }
  }

  private clearGhostCells(): void {
    if (this.currentGhostCells.length === 0) return;
    this.currentGhostCells.forEach(({ r, c }) => {
      const cellEl = this.getCellElement(r, c);
      if (cellEl) {
        cellEl.classList.remove('ghost');
      }
    });
    this.currentGhostCells = [];
  }

  private clearPredictiveCells(): void {
    if (this.currentPredictiveCells.length === 0) return;
    this.currentPredictiveCells.forEach(({ r, c }) => {
      const cellEl = this.getCellElement(r, c);
      if (cellEl) {
        cellEl.classList.remove('predictive-line', 'predictive-line-multi');
      }
    });
    this.currentPredictiveCells = [];
  }

  private getGridCoordFromPoint(x: number, y: number, shape: ShapeDefinition): { startRow: number; startCol: number } | null {
    const boardRect = this.cachedBoardRect;
    if (!boardRect) return null;

    const cellWidth = this.cachedCellWidth;
    const cellHeight = this.cachedCellHeight;

    const shapeCols = shape.matrix[0].length;
    const shapeRows = shape.matrix.length;

    // Forgiving margin around board edges so ghost doesn't abruptly drop near borders
    const marginX = cellWidth * 0.55;
    const marginY = cellHeight * 0.55;

    if (
      x < boardRect.left - marginX ||
      x > boardRect.right + marginX ||
      y < boardRect.top - marginY ||
      y > boardRect.bottom + marginY
    ) {
      return null;
    }

    const relX = x - boardRect.left - (shapeCols * cellWidth) / 2 + cellWidth / 2;
    const relY = y - boardRect.top - (shapeRows * cellHeight) / 2 + cellHeight / 2;

    const startCol = Math.round(relX / cellWidth);
    const startRow = Math.round(relY / cellHeight);

    if (
      startRow < 0 ||
      startRow > BOARD_SIZE - shapeRows ||
      startCol < 0 ||
      startCol > BOARD_SIZE - shapeCols
    ) {
      return null;
    }

    return { startRow, startCol };
  }

  // 6. Committing Drop or Spring Snapback
  private onDragEnd(cursorX: number, cursorY: number): void {
    if (!this.dragState) return;

    const target = this.getGridCoordFromPoint(cursorX, cursorY, this.dragState.shape);
    let placed = false;

    if (target) {
      const { startRow, startCol } = target;
      if (this.grid.canPlaceShape(this.dragState.shape, startRow, startCol)) {
        // Place shape!
        const placedCoords = this.grid.placeShape(this.dragState.shape, startRow, startCol);
        sound.playPlace();

        if ('vibrate' in navigator) {
          navigator.vibrate?.(15);
        }

        // Add placement points (10 pts per block unit)
        const blockUnitsCount = this.dragState.shape.matrix.flat().filter(v => v === 1).length;
        this.addScore(blockUnitsCount * 10);

        // Consume block from hand
        this.hand[this.dragState.slotIndex] = null;
        placed = true;

        this.renderBoard();

        // Magnetic Snap-In Pop Animation on newly placed cells
        placedCoords.forEach(({ r, c }) => {
          const el = this.getCellElement(r, c);
          if (el) {
            el.classList.add('placed-pop');
            setTimeout(() => el.classList.remove('placed-pop'), 250);
          }
        });

        this.processLineClears();
      }
    }

    if (placed) {
      this.cleanupDrag();
      if (this.hand.every((s) => s === null)) {
        this.spawnNewHand(true);
      } else {
        this.renderHand(false);
        this.checkPlayability();
      }
    } else {
      // Silky Smooth Spring Snapback to slot
      this.triggerSpringSnapback();
    }
  }

  // Spring Snapback Animation (100% Solid, Elastic Snapback to Slot)
  private triggerSpringSnapback(): void {
    if (!this.dragState) return;
    this.isReturningSnapback = true;
    sound.playSnapback();

    this.clearGhostCells();
    this.clearPredictiveCells();
    this.wasPredicting = false;
    const slotIndex = this.dragState.slotIndex;
    const slotEl = document.getElementById(`slot-${slotIndex}`);

    if (slotEl) {
      const slotRect = slotEl.getBoundingClientRect();
      const targetCenterX = slotRect.left + slotRect.width / 2;
      const targetCenterY = slotRect.top + slotRect.height / 2;

      this.dragProxyElement.classList.add('spring-returning');
      this.dragProxyElement.style.transform = `translate3d(${targetCenterX}px, ${targetCenterY}px, 0) translate(-50%, -50%) scale(0.65)`;
      this.dragProxyElement.style.opacity = '1';

      setTimeout(() => {
        if (slotEl.firstElementChild) {
          (slotEl.firstElementChild as HTMLElement).style.visibility = 'visible';
          slotEl.classList.add('snap-settle');
          setTimeout(() => slotEl.classList.remove('snap-settle'), 120);
        }
        this.dragProxyElement.classList.remove('spring-returning');
        this.cleanupDrag();
        this.isReturningSnapback = false;
      }, 120);
    } else {
      this.cleanupDrag();
      this.isReturningSnapback = false;
    }
  }

  private cleanupDrag(): void {
    if (this.activeContainerEl && this.activePointerId !== null) {
      try {
        if (this.activeContainerEl.hasPointerCapture(this.activePointerId)) {
          this.activeContainerEl.releasePointerCapture(this.activePointerId);
        }
      } catch {}
    }
    this.activePointerId = null;
    this.activeContainerEl = null;

    this.clearGhostCells();
    this.clearPredictiveCells();
    this.wasPredicting = false;
    this.lastGhostRow = -999;
    this.lastGhostCol = -999;
    this.dragProxyElement.classList.add('hidden');
    this.dragProxyElement.innerHTML = '';
    this.dragState = null;
  }

  // 7. Staggered Wave Line-Clear & Combo Explosions
  private processLineClears(): void {
    const result = this.grid.checkAndClearLines();

    if (result.totalLines > 0) {
      this.comboStreak++;
      sound.playLineClear(this.comboStreak);

      // Mega Combo Celebration Confetti Cannons
      if (result.totalLines >= 2 || this.comboStreak >= 3) {
        this.particles.spawnHypeCannons(85);
        sound.playMegaComboFanfare();
      }

      if ('vibrate' in navigator) {
        if (this.comboStreak >= 3) {
          navigator.vibrate?.([20, 30, 25]);
        } else {
          navigator.vibrate?.([15, 20]);
        }
      }

      // High-Rewarding Points Calculation:
      // 1 Line: 150 pts | 2 Lines: 450 pts | 3 Lines: 900 pts | 4+ Lines: 1600+ pts
      let baseLinePoints = 150;
      if (result.totalLines === 2) {
        baseLinePoints = 450;
      } else if (result.totalLines === 3) {
        baseLinePoints = 900;
      } else if (result.totalLines >= 4) {
        baseLinePoints = 1600 + (result.totalLines - 4) * 500;
      }

      // Streak Multiplier: x1 for streak 1, x2 for streak 2, x3 for streak 3, x4 for streak 4, etc.
      const comboMultiplier = Math.max(1, this.comboStreak);
      let totalEarned = Math.round(baseLinePoints * comboMultiplier);

      // Clean Slate Board Clear Bonus (+1,000 PTS)
      const isCleanSlate = this.grid.isCleanSlate();
      if (isCleanSlate) {
        totalEarned += 1000;
        this.particles.spawnHypeCannons(100);
        sound.playMegaComboFanfare();
        this.showToast('CLEAN SLATE! +1,000 PTS');
      }

      this.addScore(totalEarned);

      // Trigger Staggered Line Clears & Jewel Debris
      this.triggerStaggeredLineClears(result.clearedRows, result.clearedCols, totalEarned, isCleanSlate);
      this.updateStreakUI();
    } else {
      this.comboStreak = 0;
      this.updateStreakUI();
    }
  }

  private triggerStaggeredLineClears(clearedRows: number[], clearedCols: number[], pointsEarned: number, isCleanSlate: boolean = false): void {
    const containerRect = this.boardContainerElement.getBoundingClientRect();

    // Board screen shake
    const shakeClass = clearedRows.length + clearedCols.length >= 2 ? 'board-shake-heavy' : 'board-shake-light';
    this.boardContainerElement.classList.add(shakeClass);
    setTimeout(() => this.boardContainerElement.classList.remove(shakeClass), 240);

    // Staggered cell clear wave (Row Left-to-Right)
    clearedRows.forEach((r) => {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const cellEl = this.getCellElement(r, c);
        if (cellEl) {
          const cellRect = cellEl.getBoundingClientRect();
          const x = cellRect.left - containerRect.left + cellRect.width / 2;
          const y = cellRect.top - containerRect.top + cellRect.height / 2;

          // Immediately empty the board socket DOM so user can place next piece instantly!
          cellEl.className = 'grid-cell';

          setTimeout(() => {
            this.particles.spawnBurst(x, y, '#22d3ee', 14);
          }, c * 16);
        }
      }
    });

    // Staggered cell clear wave (Column Top-to-Bottom)
    clearedCols.forEach((c) => {
      for (let r = 0; r < BOARD_SIZE; r++) {
        const cellEl = this.getCellElement(r, c);
        if (cellEl) {
          const cellRect = cellEl.getBoundingClientRect();
          const x = cellRect.left - containerRect.left + cellRect.width / 2;
          const y = cellRect.top - containerRect.top + cellRect.height / 2;

          cellEl.className = 'grid-cell';

          setTimeout(() => {
            this.particles.spawnBurst(x, y, '#f59e0b', 14);
          }, r * 16);
        }
      }
    });

    // 3D Combo Celebration Popup
    this.triggerComboCelebration(pointsEarned, isCleanSlate);
  }

  private triggerComboCelebration(pointsEarned: number, isCleanSlate: boolean = false): void {
    const celebration = document.createElement('div');
    celebration.className = 'combo-celebration';

    const titleIdx = Math.min(this.comboStreak, this.comboHypeTitles.length - 1);
    let titleText = this.comboStreak >= 2 ? this.comboHypeTitles[titleIdx] : `+${pointsEarned}!`;
    if (isCleanSlate) {
      titleText = 'CLEAN SLATE!';
    }

    celebration.innerHTML = `
      <span class="celebration-title">${titleText}</span>
      <span class="celebration-points">+${pointsEarned} PTS</span>
    `;

    this.floatingTextContainer.appendChild(celebration);
    setTimeout(() => celebration.remove(), 900);
  }

  // 8. Rolling Score Counter & Streak UI
  private addScore(amount: number): void {
    this.score += amount;
    this.animateScoreRolling();

    if (this.score > this.bestScore) {
      const wasExistingRecord = this.bestScore > 0;
      this.bestScore = this.score;
      this.bestScoreElement.textContent = String(this.bestScore);
      localStorage.setItem('box_blast_2d_best', String(this.bestScore));

      // Celebrate first time breaking high score in this session
      if (wasExistingRecord && !this.hasCelebratedNewRecord) {
        this.hasCelebratedNewRecord = true;
        this.particles.spawnHypeCannons(90);
        sound.playMegaComboFanfare();
        this.showToast('NEW HIGH SCORE RECORD!');
      }
    }
  }

  private animateScoreRolling(): void {
    const target = this.score;
    const diff = target - this.displayedScore;
    if (diff <= 0) return;

    this.scoreElement.classList.add('bump');
    setTimeout(() => this.scoreElement.classList.remove('bump'), 140);

    const step = Math.max(1, Math.ceil(diff / 12));
    const interval = setInterval(() => {
      if (this.displayedScore < target) {
        this.displayedScore = Math.min(this.displayedScore + step, target);
        this.scoreElement.textContent = String(this.displayedScore);
        sound.playScoreTick();
      } else {
        clearInterval(interval);
        this.scoreElement.textContent = String(target);
      }
    }, 18);
  }

  private updateStreakUI(): void {
    this.streakIndicatorElement.textContent = `Streak: ${this.comboStreak}`;

    if (this.comboStreak >= 2) {
      this.comboBadgeElement.classList.remove('hidden');
      this.comboTextElement.textContent = `COMBO x${this.comboStreak}`;
      this.streakIndicatorElement.classList.add('active');

      if (this.comboStreak >= 4) {
        this.boardContainerElement.classList.remove('combo-aura');
        this.boardContainerElement.classList.add('combo-aura-super');
      } else {
        this.boardContainerElement.classList.remove('combo-aura-super');
        this.boardContainerElement.classList.add('combo-aura');
      }
    } else {
      this.comboBadgeElement.classList.add('hidden');
      this.streakIndicatorElement.classList.remove('active');
      this.boardContainerElement.classList.remove('combo-aura', 'combo-aura-super');
    }
  }

  // 9. Playability Check & Game Over Flow
  private checkPlayability(): void {
    const availableShapes = this.hand.filter((s): s is ShapeDefinition => s !== null);

    if (availableShapes.length === 0) return;

    const canPlayAny = availableShapes.some((shape) => this.grid.canFitAnywhere(shape));

    if (!canPlayAny) {
      this.triggerGameOver();
    }
  }

  private triggerGameOver(): void {
    this.isGameOver = true;
    sound.playGameOver();

    if ('vibrate' in navigator) {
      navigator.vibrate?.([60, 40, 80]);
    }

    this.modalFinalScore.textContent = String(this.score);
    this.modalBestScore.textContent = String(this.bestScore);
    this.gameOverModal.classList.remove('hidden');
  }

  // Rewarded Ad Revive Simulation
  private performRevive(): void {
    this.gameOverModal.classList.add('hidden');
    this.isGameOver = false;

    // Clear 3x3 center bomb zone
    const cleared = this.grid.clearBombArea(3, 3);
    this.renderBoard();
    sound.playRevive();

    // Particle explosion across cleared zone
    const containerRect = this.boardContainerElement.getBoundingClientRect();
    cleared.forEach(({ r, c }: { r: number; c: number }, idx: number) => {
      const cell = this.getCellElement(r, c);
      if (cell) {
        const cellRect = cell.getBoundingClientRect();
        const x = cellRect.left - containerRect.left + cellRect.width / 2;
        const y = cellRect.top - containerRect.top + cellRect.height / 2;
        setTimeout(() => {
          this.particles.spawnBurst(x, y, '#10b981', 12);
        }, idx * 15);
      }
    });

    this.particles.spawnHypeCannons(70);
    this.showToast('Board Cleared! Keep Blasting!');

    // Re-verify hand playability: if any shapes in hand cannot fit, guarantee smart playable hand
    const hasUnplayable = this.hand.some((shape) => shape !== null && !this.grid.canFitAnywhere(shape));
    if (hasUnplayable || this.hand.every((s) => s === null)) {
      this.hand = generateSmartHand(this.grid);
      this.renderHand(true);
    }
    this.checkPlayability();
  }

  private showToast(msg: string): void {
    this.toastElement.textContent = msg;
    this.toastElement.classList.remove('hidden');
    setTimeout(() => {
      this.toastElement.classList.add('hidden');
    }, 1600);
  }

  private triggerVibrate(pattern: number | number[]): void {
    if (!this.hapticEnabled) return;
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate?.(pattern);
      } catch {}
    }
  }

  private updateSoundUI(): void {
    if (sound.enabled) {
      this.soundIconOn.classList.remove('hidden');
      this.soundIconOff.classList.add('hidden');
      this.modalToggleSound.classList.add('active');
    } else {
      this.soundIconOn.classList.add('hidden');
      this.soundIconOff.classList.remove('hidden');
      this.modalToggleSound.classList.remove('active');
    }
  }

  // 10. Buttons & Interactive Modals Setup
  private setupButtonEvents(): void {
    // Sound Toggle Button (Vector SVG Switch)
    this.soundBtn.addEventListener('click', () => {
      sound.enabled = !sound.enabled;
      this.updateSoundUI();
      if (sound.enabled) {
        sound.playPickup();
      }
    });

    // Pause / Settings Button
    this.pauseBtn.addEventListener('click', () => {
      sound.playPickup();
      this.pauseModal.classList.remove('hidden');
    });

    this.resumeGameBtn.addEventListener('click', () => {
      sound.playPickup();
      this.pauseModal.classList.add('hidden');
    });

    this.pauseHowToPlayBtn.addEventListener('click', () => {
      sound.playPickup();
      this.pauseModal.classList.add('hidden');
      this.tutorialModal.classList.remove('hidden');
    });

    this.pauseRestartGameBtn.addEventListener('click', () => {
      sound.playPickup();
      this.pauseModal.classList.add('hidden');
      this.startNewGame();
    });

    // Modal Toggles
    this.modalToggleSound.addEventListener('click', () => {
      sound.enabled = !sound.enabled;
      this.updateSoundUI();
      if (sound.enabled) sound.playPickup();
    });

    this.modalToggleHaptic.addEventListener('click', () => {
      this.hapticEnabled = !this.hapticEnabled;
      this.modalToggleHaptic.classList.toggle('active', this.hapticEnabled);
      if (this.hapticEnabled) this.triggerVibrate(15);
    });

    // Tutorial Modal
    this.closeTutorialBtn.addEventListener('click', () => {
      sound.playPickup();
      this.tutorialModal.classList.add('hidden');
    });

    // Restart Buttons
    this.restartBtn.addEventListener('click', () => {
      this.restartIconSvg.classList.remove('spin-anim');
      void this.restartIconSvg.offsetWidth; // trigger reflow
      this.restartIconSvg.classList.add('spin-anim');
      sound.playPickup();
      this.startNewGame();
    });

    this.modalRestartBtn.addEventListener('click', () => {
      sound.playPickup();
      this.startNewGame();
    });

    // Revive Button
    this.modalReviveBtn.addEventListener('click', () => {
      this.performRevive();
    });
  }

  private getCellElement(r: number, c: number): HTMLElement | null {
    if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
      return this.cellElementsGrid[r]?.[c] || null;
    }
    return null;
  }
}
