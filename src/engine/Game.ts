import { BOARD_SIZE, GridEngine } from './Grid';
import { generateHand } from './Shapes';
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
  private helpBtn: HTMLElement;
  private restartBtn: HTMLElement;
  private modalRestartBtn: HTMLElement;
  private modalReviveBtn: HTMLElement;
  private closeTutorialBtn: HTMLElement;

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

  // Cached Geometry for Zero-Lag Dragging
  private cachedBoardRect: DOMRect | null = null;
  private cachedCellWidth: number = 0;
  private cachedCellHeight: number = 0;
  private currentGhostCells: { r: number; c: number }[] = [];
  private lastGhostRow: number = -999;
  private lastGhostCol: number = -999;
  private rafDragPending: boolean = false;
  private latestPointerX: number = 0;
  private latestPointerY: number = 0;

  // Combo Celebration Titles
  private comboHypeTitles = [
    '',
    'NICE! 👏',
    'COOL! 🔥',
    'GREAT! ⚡',
    'AMAZING! 💥',
    'EXCELLENT! 🌟',
    'UNBELIEVABLE! 🏆',
    'MASTERPIECE! 👑',
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
    this.helpBtn = document.getElementById('help-btn')!;
    this.restartBtn = document.getElementById('restart-btn')!;
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

  // 1. Board DOM setup (8x8 cells)
  private setupBoardDOM(): void {
    this.boardElement.innerHTML = '';
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.row = String(r);
        cell.dataset.col = String(c);
        this.boardElement.appendChild(cell);
      }
    }
  }

  // 2. Render Board
  private renderBoard(): void {
    const cells = this.boardElement.querySelectorAll('.grid-cell');
    cells.forEach((el) => {
      const r = parseInt((el as HTMLElement).dataset.row!, 10);
      const c = parseInt((el as HTMLElement).dataset.col!, 10);
      const state = this.grid.board[r][c];

      el.className = 'grid-cell';
      if (state.filled && state.color) {
        el.classList.add('filled', state.color);
      }
    });
  }

  // 3. Hand Management with Staggered Slide-In
  private spawnNewHand(isInitial: boolean = false): void {
    this.hand = generateHand();
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
        slot.style.animationDelay = `${i * 0.08}s`;
        setTimeout(() => {
          sound.playHandSpawn(i);
        }, i * 80);
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

  // 4. Ultra-Smooth Hardware-Accelerated Drag & Drop
  private onDragStart(e: PointerEvent, shape: ShapeDefinition, slotIndex: number, containerEl: HTMLElement): void {
    if (this.isGameOver || this.isReturningSnapback) return;
    e.preventDefault();

    this.updateCachedBoardGeometry();
    sound.playPickup();

    if ('vibrate' in navigator) {
      navigator.vibrate?.(10);
    }

    const isTouch = e.pointerType === 'touch' || e.pointerType === 'pen';
    const touchOffsetY = isTouch ? 70 : 0;

    this.activePointerId = e.pointerId;
    this.activeContainerEl = containerEl;

    try {
      containerEl.setPointerCapture(e.pointerId);
    } catch {}

    this.dragState = {
      shape,
      slotIndex,
      initialPointerX: e.clientX,
      initialPointerY: e.clientY,
      currentPointerX: e.clientX,
      currentPointerY: e.clientY,
      touchOffsetY,
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
    const effY = e.clientY - touchOffsetY;
    this.setProxyTransform(e.clientX, effY);
    this.updateGhostPlacement(e.clientX, effY);
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
      if (!this.dragState || this.isReturningSnapback) return;
      e.preventDefault();

      this.latestPointerX = e.clientX;
      this.latestPointerY = e.clientY - this.dragState.touchOffsetY;

      this.setProxyTransform(this.latestPointerX, this.latestPointerY);

      if (!this.rafDragPending) {
        this.rafDragPending = true;
        requestAnimationFrame(() => {
          this.rafDragPending = false;
          if (this.dragState && !this.isReturningSnapback) {
            this.updateGhostPlacement(this.latestPointerX, this.latestPointerY);
          }
        });
      }
    }, { passive: false });

    window.addEventListener('pointerup', (e) => {
      if (!this.dragState || this.isReturningSnapback) return;
      e.preventDefault();

      const effY = e.clientY - this.dragState.touchOffsetY;
      this.onDragEnd(e.clientX, effY);
    });

    window.addEventListener('pointercancel', () => {
      if (!this.dragState || this.isReturningSnapback) return;
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

  private getGridCoordFromPoint(x: number, y: number, shape: ShapeDefinition): { startRow: number; startCol: number } | null {
    const boardRect = this.cachedBoardRect;
    if (!boardRect) return null;

    if (x < boardRect.left || x > boardRect.right || y < boardRect.top || y > boardRect.bottom) {
      return null;
    }

    const cellWidth = this.cachedCellWidth;
    const cellHeight = this.cachedCellHeight;

    const shapeCols = shape.matrix[0].length;
    const shapeRows = shape.matrix.length;

    const relX = x - boardRect.left - (shapeCols * cellWidth) / 2 + cellWidth / 2;
    const relY = y - boardRect.top - (shapeRows * cellHeight) / 2 + cellHeight / 2;

    const startCol = Math.round(relX / cellWidth);
    const startRow = Math.round(relY / cellHeight);

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

        // Add placement points
        const blockUnitsCount = this.dragState.shape.matrix.flat().filter(v => v === 1).length;
        this.addScore(blockUnitsCount);

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
          setTimeout(() => slotEl.classList.remove('snap-settle'), 200);
        }
        this.dragProxyElement.classList.remove('spring-returning');
        this.cleanupDrag();
        this.isReturningSnapback = false;
      }, 220);
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

      if ('vibrate' in navigator) {
        if (this.comboStreak >= 3) {
          navigator.vibrate?.([20, 30, 25]);
        } else {
          navigator.vibrate?.([15, 20]);
        }
      }

      // Points calculation
      const baseLinePoints = result.totalLines * 100 * (1 + (result.totalLines - 1) * 0.5);
      const comboMultiplier = 1 + (this.comboStreak - 1) * 0.5;
      const totalEarned = Math.round(baseLinePoints * comboMultiplier);

      this.addScore(totalEarned);

      // Trigger Staggered Line Clears & Jewel Debris
      this.triggerStaggeredLineClears(result.clearedRows, result.clearedCols, totalEarned);
      this.updateStreakUI();
    } else {
      this.comboStreak = 0;
      this.updateStreakUI();
    }
  }

  private triggerStaggeredLineClears(clearedRows: number[], clearedCols: number[], pointsEarned: number): void {
    const containerRect = this.boardContainerElement.getBoundingClientRect();

    // Board screen shake
    const shakeClass = clearedRows.length + clearedCols.length >= 2 ? 'board-shake-heavy' : 'board-shake-light';
    this.boardContainerElement.classList.add(shakeClass);
    setTimeout(() => this.boardContainerElement.classList.remove(shakeClass), 320);

    // Staggered cell clear wave (Row Left-to-Right)
    clearedRows.forEach((r) => {
      for (let c = 0; c < BOARD_SIZE; c++) {
        const cellEl = this.getCellElement(r, c);
        if (cellEl) {
          cellEl.classList.add('clearing');
          cellEl.style.animationDelay = `${c * 0.022}s`;

          const cellRect = cellEl.getBoundingClientRect();
          const x = cellRect.left - containerRect.left + cellRect.width / 2;
          const y = cellRect.top - containerRect.top + cellRect.height / 2;

          setTimeout(() => {
            this.particles.spawnBurst(x, y, '#22d3ee', 14);
          }, c * 22);
        }
      }
    });

    // Staggered cell clear wave (Column Top-to-Bottom)
    clearedCols.forEach((c) => {
      for (let r = 0; r < BOARD_SIZE; r++) {
        const cellEl = this.getCellElement(r, c);
        if (cellEl) {
          cellEl.classList.add('clearing');
          cellEl.style.animationDelay = `${r * 0.022}s`;

          const cellRect = cellEl.getBoundingClientRect();
          const x = cellRect.left - containerRect.left + cellRect.width / 2;
          const y = cellRect.top - containerRect.top + cellRect.height / 2;

          setTimeout(() => {
            this.particles.spawnBurst(x, y, '#f59e0b', 14);
          }, r * 22);
        }
      }
    });

    // 3D Combo Celebration Popup
    this.triggerComboCelebration(pointsEarned);

    // Re-render board after staggered wave clears
    setTimeout(() => {
      this.renderBoard();
    }, 280);
  }

  private triggerComboCelebration(pointsEarned: number): void {
    const celebration = document.createElement('div');
    celebration.className = 'combo-celebration';

    const titleIdx = Math.min(this.comboStreak, this.comboHypeTitles.length - 1);
    const titleText = this.comboStreak >= 2 ? this.comboHypeTitles[titleIdx] : `+${pointsEarned}!`;

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
      this.bestScore = this.score;
      this.bestScoreElement.textContent = String(this.bestScore);
      localStorage.setItem('box_blast_2d_best', String(this.bestScore));
    }
  }

  private animateScoreRolling(): void {
    const target = this.score;
    const diff = target - this.displayedScore;
    if (diff <= 0) return;

    this.scoreElement.classList.add('bump');
    setTimeout(() => this.scoreElement.classList.remove('bump'), 140);

    const step = Math.max(1, Math.ceil(diff / 10));
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
    this.streakIndicatorElement.textContent = `⚡ Streak: ${this.comboStreak}`;

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

    this.showToast('Board Cleared! Keep Blasting!');
    this.checkPlayability();
  }

  private showToast(msg: string): void {
    this.toastElement.textContent = msg;
    this.toastElement.classList.remove('hidden');
    setTimeout(() => {
      this.toastElement.classList.add('hidden');
    }, 1600);
  }

  // 10. Buttons & Interactive Modals Setup
  private setupButtonEvents(): void {
    // Sound Toggle
    this.soundBtn.addEventListener('click', () => {
      sound.enabled = !sound.enabled;
      this.soundBtn.textContent = sound.enabled ? '🔊' : '🔇';
      if (sound.enabled) {
        sound.playPickup();
      }
    });

    // Tutorial Modal
    this.helpBtn.addEventListener('click', () => {
      sound.playPickup();
      this.tutorialModal.classList.remove('hidden');
    });

    this.closeTutorialBtn.addEventListener('click', () => {
      sound.playPickup();
      this.tutorialModal.classList.add('hidden');
    });

    // Restart Buttons
    this.restartBtn.addEventListener('click', () => {
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
    return this.boardElement.querySelector(`.grid-cell[data-row="${r}"][data-col="${c}"]`);
  }
}
