import { BOARD_SIZE, GridEngine } from './Grid';
import { generateSmartHand } from './Shapes';
import { DragState, ShapeDefinition, ObstacleType } from './types';
import { sound } from './SoundFX';
import { ParticleEngine } from './Particles';
import {
  ADVENTURE_LEVELS,
  AdventureLevel,
  getUnlockedLevel,
  unlockNextLevel,
  getLevelStars,
  saveLevelStars,
  calculateStars,
} from './AdventureLevels';

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
  private gameWrapperEl: HTMLElement;
  private currentTheme: string = 'theme-cosmic';
  private hapticEnabled: boolean = true;
  private hasRevivedThisRun: boolean = false;

  // Boosters State & DOM Elements
  private boosterHammerBtn: HTMLElement;
  private boosterRocketBtn: HTMLElement;
  private boosterRerollBtn: HTMLElement;
  private boosterHammerBadge: HTMLElement;
  private boosterRocketBadge: HTMLElement;
  private boosterRerollBadge: HTMLElement;
  private boosterHintBar: HTMLElement;
  private boosterHintText: HTMLElement;
  private hammerCount: number = 3;
  private rocketCount: number = 3;
  private rerollCount: number = 3;
  private activeBooster: 'hammer' | 'rocket' | null = null;
  private currentRocketAimCells: { r: number; c: number }[] = [];

  // Career Statistics & Celebration DOM Elements
  private statsModal: HTMLElement;
  private pauseStatsBtn: HTMLElement;
  private closeStatsBtn: HTMLElement;
  private statHighScore: HTMLElement;
  private statGamesPlayed: HTMLElement;
  private statLinesCleared: HTMLElement;
  private statMaxCombo: HTMLElement;
  private gameOverNewRecordBanner: HTMLElement;
  private modalShareBtn: HTMLElement;

  // Adventure Mode DOM Elements & State
  private btnModeClassic: HTMLElement;
  private btnModeAdventure: HTMLElement;
  private adventureHudBar: HTMLElement;
  private adventureMapBtn: HTMLElement;
  private adventureLevelBadge: HTMLElement;
  private adventureGoalIcon: HTMLElement;
  private adventureGoalName: HTMLElement;
  private adventureGoalCount: HTMLElement;
  private adventureMovesLeft: HTMLElement;
  private adventureMovesChip: HTMLElement;
  private adventureGoalProgressFill: HTMLElement;
  private failReviveBtn: HTMLElement;
  private adventureMapModal: HTMLElement;
  private mapTotalStars: HTMLElement;
  private adventureLevelsGrid: HTMLElement;
  private closeMapBtn: HTMLElement;
  private levelCompleteModal: HTMLElement;
  private victoryLevelSubtitle: HTMLElement;
  private victoryScore: HTMLElement;
  private victoryMovesLeft: HTMLElement;
  private nextLevelBtn: HTMLElement;
  private replayLevelBtn: HTMLElement;
  private victoryMapBtn: HTMLElement;
  private levelFailedModal: HTMLElement;
  private failStatusText: HTMLElement;
  private failProgressStat: HTMLElement;
  private failScoreStat: HTMLElement;
  private retryLevelBtn: HTMLElement;
  private failMapBtn: HTMLElement;

  // Adventure Mode Gameplay State
  private currentGameMode: 'classic' | 'adventure' = 'classic';
  private currentAdventureLevelId: number = 1;
  private adventureMovesRemaining: number = 14;
  private adventureGoalCurrent: number = 0;
  private adventureGoalTarget: number = 3;
  private isAdventureWon: boolean = false;
  private isAdventureFailed: boolean = false;

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

  // Tap-to-Place State
  private selectedSlotIndex: number | null = null;
  private dragMoved: boolean = false;

  // Career Statistics Tracking
  private gamesPlayed: number = 0;
  private totalLinesCleared: number = 0;
  private maxCombo: number = 0;

  // Cached Geometry & Direct Cell Array for 120fps Zero-Lag Dragging
  private cachedBoardRect: DOMRect | null = null;
  private cachedBoardOffsetX: number = 0;
  private cachedBoardOffsetY: number = 0;
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
  private sparkleTimer: ReturnType<typeof setInterval> | null = null;
  private scoreRollingInterval: ReturnType<typeof setInterval> | null = null;

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
    this.gameWrapperEl = document.getElementById('app')!;
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
    this.pauseStatsBtn = document.getElementById('pause-stats-btn')!;
    this.pauseHowToPlayBtn = document.getElementById('pause-how-to-play-btn')!;
    this.pauseRestartGameBtn = document.getElementById('pause-restart-game-btn')!;
    this.modalToggleSound = document.getElementById('modal-toggle-sound')!;
    this.modalToggleHaptic = document.getElementById('modal-toggle-haptic')!;

    this.restartBtn = document.getElementById('restart-btn')!;
    this.restartIconSvg = document.getElementById('restart-icon-svg')!;
    this.modalRestartBtn = document.getElementById('modal-restart-btn')!;
    this.modalReviveBtn = document.getElementById('modal-revive-btn')!;
    this.closeTutorialBtn = document.getElementById('close-tutorial-btn')!;

    // Boosters DOM Elements
    this.boosterHammerBtn = document.getElementById('booster-hammer-btn')!;
    this.boosterRocketBtn = document.getElementById('booster-rocket-btn')!;
    this.boosterRerollBtn = document.getElementById('booster-reroll-btn')!;
    this.boosterHammerBadge = document.getElementById('booster-hammer-badge')!;
    this.boosterRocketBadge = document.getElementById('booster-rocket-badge')!;
    this.boosterRerollBadge = document.getElementById('booster-reroll-badge')!;
    this.boosterHintBar = document.getElementById('booster-hint-bar')!;
    this.boosterHintText = document.getElementById('booster-hint-text')!;

    // Career Stats & Celebration Elements
    this.statsModal = document.getElementById('stats-modal')!;
    this.closeStatsBtn = document.getElementById('close-stats-btn')!;
    this.statHighScore = document.getElementById('stat-high-score')!;
    this.statGamesPlayed = document.getElementById('stat-games-played')!;
    this.statLinesCleared = document.getElementById('stat-lines-cleared')!;
    this.statMaxCombo = document.getElementById('stat-max-combo')!;
    this.gameOverNewRecordBanner = document.getElementById('game-over-new-record')!;
    this.modalShareBtn = document.getElementById('modal-share-btn')!;

    // Adventure Mode DOM Elements
    this.btnModeClassic = document.getElementById('btn-mode-classic')!;
    this.btnModeAdventure = document.getElementById('btn-mode-adventure')!;
    this.adventureHudBar = document.getElementById('adventure-hud-bar')!;
    this.adventureMapBtn = document.getElementById('adventure-map-btn')!;
    this.adventureLevelBadge = document.getElementById('adventure-level-badge')!;
    this.adventureGoalIcon = document.getElementById('adventure-goal-icon')!;
    this.adventureGoalName = document.getElementById('adventure-goal-name')!;
    this.adventureGoalCount = document.getElementById('adventure-goal-count')!;
    this.adventureMovesLeft = document.getElementById('adventure-moves-left')!;
    this.adventureMovesChip = document.querySelector('.adventure-moves-chip')!;
    this.adventureGoalProgressFill = document.getElementById('adventure-goal-progress-fill')!;
    this.failReviveBtn = document.getElementById('fail-revive-btn')!;
    this.adventureMapModal = document.getElementById('adventure-map-modal')!;
    this.mapTotalStars = document.getElementById('map-total-stars')!;
    this.adventureLevelsGrid = document.getElementById('adventure-levels-grid')!;
    this.closeMapBtn = document.getElementById('close-map-btn')!;
    this.levelCompleteModal = document.getElementById('level-complete-modal')!;
    this.victoryLevelSubtitle = document.getElementById('victory-level-subtitle')!;
    this.victoryScore = document.getElementById('victory-score')!;
    this.victoryMovesLeft = document.getElementById('victory-moves-left')!;
    this.nextLevelBtn = document.getElementById('next-level-btn')!;
    this.replayLevelBtn = document.getElementById('replay-level-btn')!;
    this.victoryMapBtn = document.getElementById('victory-map-btn')!;
    this.levelFailedModal = document.getElementById('level-failed-modal')!;
    this.failStatusText = document.getElementById('fail-status-text')!;
    this.failProgressStat = document.getElementById('fail-progress-stat')!;
    this.failScoreStat = document.getElementById('fail-score-stat')!;
    this.retryLevelBtn = document.getElementById('retry-level-btn')!;
    this.failMapBtn = document.getElementById('fail-map-btn')!;

    const canvas = document.getElementById('particle-canvas') as HTMLCanvasElement;
    this.particles = new ParticleEngine(canvas);

    this.initStorage();
    this.setupAudioUnlock();
    this.setupBoardDOM();
    this.setupGlobalPointerEvents();
    this.setupButtonEvents();
    this.setupAdventureEvents();
    this.setupKeyboardEvents();
    this.startNewGame();
    this.startIdleSparkleTimer();

    // Re-cache board rect on window resize and board element resize
    window.addEventListener('resize', () => {
      if (this.boardElement) {
        this.updateCachedBoardGeometry();
        this.particles.resize();
      }
    });

    if ('ResizeObserver' in window && this.boardElement) {
      const ro = new ResizeObserver(() => {
        this.updateCachedBoardGeometry();
        this.particles.resize();
      });
      ro.observe(this.boardElement);
    }
  }

  private initStorage(): void {
    const savedBest = localStorage.getItem('box_blast_2d_best');
    this.bestScore = savedBest ? parseInt(savedBest, 10) : 0;
    this.bestScoreElement.textContent = this.bestScore.toLocaleString();

    this.gamesPlayed = parseInt(localStorage.getItem('box_blast_games_played') || '0', 10);
    this.totalLinesCleared = parseInt(localStorage.getItem('box_blast_total_lines') || '0', 10);
    this.maxCombo = parseInt(localStorage.getItem('box_blast_max_combo') || '0', 10);

    const savedSound = localStorage.getItem('box_blast_sound');
    if (savedSound !== null) {
      sound.enabled = savedSound === 'true';
    }

    const savedHaptic = localStorage.getItem('box_blast_haptics');
    if (savedHaptic !== null) {
      this.hapticEnabled = savedHaptic === 'true';
    }

    this.updateSoundUI();
    this.updateHapticUI();

    const savedTheme = localStorage.getItem('box_blast_theme') || 'theme-cosmic';
    this.applyTheme(savedTheme);

    this.loadBoosterCounts();
  }

  public applyTheme(theme: string): void {
    this.currentTheme = theme;
    localStorage.setItem('box_blast_theme', theme);
    this.gameWrapperEl.classList.remove(
      'theme-cosmic', 'theme-wood', 'theme-neon', 'theme-dark',
      'theme-emerald', 'theme-amber', 'theme-amethyst', 'theme-ruby', 'theme-prism'
    );
    this.gameWrapperEl.classList.add(theme);

    const activePill = document.getElementById('active-theme-name');
    if (activePill) {
      const names: Record<string, string> = {
        'theme-cosmic': 'Cosmic',
        'theme-wood': 'Wood',
        'theme-neon': 'Neon',
        'theme-dark': 'Dark',
        'theme-emerald': 'Emerald',
        'theme-amber': 'Amber',
        'theme-amethyst': 'Amethyst',
        'theme-ruby': 'Ruby',
        'theme-prism': 'Prism',
      };
      activePill.textContent = names[theme] || 'Custom';
    }

    const buttons = document.querySelectorAll('.theme-select-btn');
    buttons.forEach((btn) => {
      if ((btn as HTMLElement).dataset.theme === theme) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  private updateMiniStats(): void {
    const miniBest = document.getElementById('settings-mini-best');
    const miniLines = document.getElementById('settings-mini-lines');
    const miniCombo = document.getElementById('settings-mini-combo');
    if (miniBest) miniBest.textContent = this.bestScore.toLocaleString();
    if (miniLines) miniLines.textContent = this.totalLinesCleared.toLocaleString();
    if (miniCombo) miniCombo.textContent = `${this.maxCombo}x`;
  }

  private setupAudioUnlock(): void {
    const unlockHandler = () => {
      sound.unlock();
      window.removeEventListener('pointerdown', unlockHandler);
      window.removeEventListener('keydown', unlockHandler);
    };
    window.addEventListener('pointerdown', unlockHandler, { once: true });
    window.addEventListener('keydown', unlockHandler, { once: true });
  }

  public startNewGame(): void {
    this.deselectSlot();
    this.grid.reset();
    this.score = 0;
    this.displayedScore = 0;
    if (this.scoreRollingInterval) {
      clearInterval(this.scoreRollingInterval);
      this.scoreRollingInterval = null;
    }
    this.comboStreak = 0;
    this.isGameOver = false;
    this.hasRevivedThisRun = false;
    this.isReturningSnapback = false;
    this.wasPredicting = false;
    this.hasCelebratedNewRecord = false;

    this.gamesPlayed++;
    localStorage.setItem('box_blast_games_played', String(this.gamesPlayed));

    this.clearGhostCells();
    this.clearPredictiveCells();
    this.scoreElement.textContent = '0';
    this.updateStreakUI();
    this.updateReviveButtonUI();
    this.renderBoard();
    this.spawnNewHand(true);
    this.gameOverModal.classList.add('hidden');
    this.updateCachedBoardGeometry();
  }

  private updateCachedBoardGeometry(): void {
    if (!this.boardElement || !this.boardContainerElement) return;
    this.cachedBoardRect = this.boardElement.getBoundingClientRect();
    const containerRect = this.boardContainerElement.getBoundingClientRect();
    this.cachedBoardOffsetX = this.cachedBoardRect.left - containerRect.left;
    this.cachedBoardOffsetY = this.cachedBoardRect.top - containerRect.top;
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

        // Tap-to-place support
        cell.addEventListener('click', () => this.onCellClicked(r, c));
        cell.addEventListener('pointerenter', () => this.onCellHover(r, c));

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
        let cls = 'grid-cell';
        if (state.filled && state.color) {
          cls += ` filled ${state.color}`;
        }
        if (state.obstacle === 'ice') {
          cls += ' obstacle-ice';
        } else if (state.obstacle === 'relic') {
          cls += ' obstacle-relic';
        }
        cell.className = cls;
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
      const maxDim = Math.max(rows, cols);
      const unitSize = maxDim >= 5 ? 13 : (maxDim >= 4 ? 15 : 18);
      const gapSize = maxDim >= 4 ? 2 : 3;

      container.style.gap = `${gapSize}px`;
      container.style.gridTemplateRows = `repeat(${rows}, ${unitSize}px)`;
      container.style.gridTemplateColumns = `repeat(${cols}, ${unitSize}px)`;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const unit = document.createElement('div');
          unit.style.width = `${unitSize}px`;
          unit.style.height = `${unitSize}px`;
          if (shape.matrix[r][c] === 1) {
            unit.className = `block-unit ${shape.color}`;
          } else {
            unit.style.visibility = 'hidden';
          }
          container.appendChild(unit);
        }
      }

      // Pointer drag/tap start on the shape
      container.addEventListener('pointerdown', (e) => this.onDragStart(e, shape, i, container));

      slot.appendChild(container);
    }

    this.updateHandPlayabilityVisuals();
  }

  private cancelSnapbackImmediate(): void {
    if (this.dragState) {
      const slot = document.getElementById(`slot-${this.dragState.slotIndex}`);
      if (slot && slot.firstElementChild) {
        (slot.firstElementChild as HTMLElement).style.opacity = '1';
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

    this.dragMoved = false;

    // If a different slot was selected in tap-to-place mode, deselect it
    if (this.selectedSlotIndex !== null && this.selectedSlotIndex !== slotIndex) {
      this.deselectSlot();
    }

    this.updateCachedBoardGeometry();
    sound.playPickup();
    this.triggerVibrate(10);

    const isTouch = e.pointerType === 'touch' || e.pointerType === 'pen';
    // Zero artificial offset so the piece stays directly under the finger/cursor without jumping upwards
    const touchOffsetY = 0;

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
      grabOffsetX,
      grabOffsetY,
    };

    this.lastGhostRow = -999;
    this.lastGhostCol = -999;

    // Cleanly hide original shape in slot
    const slot = document.getElementById(`slot-${slotIndex}`);
    if (slot && slot.firstElementChild) {
      (slot.firstElementChild as HTMLElement).style.opacity = '0';
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

  private onDragTick = (): void => {
    if (!this.dragState) {
      this.rafDragPending = false;
      return;
    }
    this.rafDragPending = false;
    this.setProxyTransform(this.latestPointerX, this.latestPointerY);
    this.updateGhostPlacement(this.latestPointerX, this.latestPointerY);
  };

  private setupGlobalPointerEvents(): void {
    window.addEventListener('pointermove', (e) => {
      if (!this.dragState) return;
      e.preventDefault();

      const dist = Math.hypot(e.clientX - this.dragState.initialPointerX, e.clientY - this.dragState.initialPointerY);
      if (dist > 7) {
        this.dragMoved = true;
      }

      const grabX = this.dragState.grabOffsetX || 0;
      const grabY = this.dragState.grabOffsetY || 0;
      this.latestPointerX = e.clientX - grabX;
      this.latestPointerY = e.clientY - this.dragState.touchOffsetY - grabY;

      if (!this.rafDragPending) {
        this.rafDragPending = true;
        requestAnimationFrame(this.onDragTick);
      }
    }, { passive: false });

    // Prevent any browser page scrolling / rubber-banding while dragging
    window.addEventListener('touchmove', (e) => {
      if (this.dragState) {
        e.preventDefault();
      }
    }, { passive: false });

    window.addEventListener('pointerup', (e) => {
      if (!this.dragState) return;
      e.preventDefault();
      this.rafDragPending = false;

      // If released with minimal movement, treat as a TAP/CLICK on the slot
      if (!this.dragMoved) {
        const slotIdx = this.dragState.slotIndex;
        const slot = document.getElementById(`slot-${slotIdx}`);
        if (slot && slot.firstElementChild) {
          (slot.firstElementChild as HTMLElement).style.opacity = '1';
        }
        this.cleanupDrag();
        this.toggleSelectSlot(slotIdx);
        return;
      }

      const grabX = this.dragState.grabOffsetX || 0;
      const grabY = this.dragState.grabOffsetY || 0;
      const effX = e.clientX - grabX;
      const effY = e.clientY - this.dragState.touchOffsetY - grabY;
      this.onDragEnd(effX, effY);
    });

    window.addEventListener('pointercancel', () => {
      if (!this.dragState) return;
      this.rafDragPending = false;
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
      const shapeColor = this.dragState.shape.color;
      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[0].length; c++) {
          if (matrix[r][c] === 1) {
            const gr = startRow + r;
            const gc = startCol + c;
            this.currentGhostCells.push({ r: gr, c: gc });
            const cellEl = this.getCellElement(gr, gc);
            if (cellEl) {
              cellEl.classList.add('ghost', shapeColor);
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
          this.triggerVibrate(12);
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
        const state = this.grid.board[r]?.[c];
        if (state && state.filled && state.color) {
          let cls = `grid-cell filled ${state.color}`;
          if (state.obstacle === 'ice') cls += ' obstacle-ice';
          else if (state.obstacle === 'relic') cls += ' obstacle-relic';
          cellEl.className = cls;
        } else {
          cellEl.classList.remove(
            'color-cyan',
            'color-amber',
            'color-ruby',
            'color-emerald',
            'color-purple',
            'color-sapphire',
            'color-pink',
            'obstacle-ice',
            'obstacle-relic'
          );
        }
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
        const state = this.grid.board[r]?.[c];
        if (state && state.filled && state.color) {
          let cls = `grid-cell filled ${state.color}`;
          if (state.obstacle === 'ice') cls += ' obstacle-ice';
          else if (state.obstacle === 'relic') cls += ' obstacle-relic';
          cellEl.className = cls;
        }
      }
    });
    this.currentPredictiveCells = [];
  }

  private getGridCoordFromPoint(x: number, y: number, shape: ShapeDefinition): { startRow: number; startCol: number } | null {
    const boardRect = this.cachedBoardRect;
    if (!boardRect) return null;

    const cellWidth = this.cachedCellWidth || 42;
    const cellHeight = this.cachedCellHeight || 42;

    const shapeCols = shape.matrix[0].length;
    const shapeRows = shape.matrix.length;

    // Generous forgiving margin around board edges for smooth single-thumb reach
    const marginX = cellWidth * 1.2;
    const marginY = cellHeight * 1.2;

    if (
      x < boardRect.left - marginX ||
      x > boardRect.right + marginX ||
      y < boardRect.top - marginY ||
      y > boardRect.bottom + marginY
    ) {
      return null;
    }

    const fracCol = (x - boardRect.left) / cellWidth - shapeCols / 2;
    const fracRow = (y - boardRect.top) / cellHeight - shapeRows / 2;
    const rawCol = Math.round(fracCol);
    const rawRow = Math.round(fracRow);

    const maxCol = BOARD_SIZE - shapeCols;
    const maxRow = BOARD_SIZE - shapeRows;

    // Magnetic Edge Clamping: Piece snaps cleanly to boundaries instead of ghost disappearing!
    let startCol = Math.max(0, Math.min(maxCol, rawCol));
    let startRow = Math.max(0, Math.min(maxRow, rawRow));

    // Smart Magnetic Assist: If target cell is blocked, gently check 1-cell adjacent spot in direction of thumb bias
    if (!this.grid.canPlaceShape(shape, startRow, startCol)) {
      const biasX = fracCol - rawCol;
      const biasY = fracRow - rawRow;

      const candidates: Array<{ r: number; c: number }> = [];
      if (Math.abs(biasX) > 0.2) {
        candidates.push({ r: startRow, c: startCol + (biasX > 0 ? 1 : -1) });
      }
      if (Math.abs(biasY) > 0.2) {
        candidates.push({ r: startRow + (biasY > 0 ? 1 : -1), c: startCol });
      }

      for (const cand of candidates) {
        if (
          cand.r >= 0 && cand.r <= maxRow &&
          cand.c >= 0 && cand.c <= maxCol &&
          this.grid.canPlaceShape(shape, cand.r, cand.c)
        ) {
          return { startRow: cand.r, startCol: cand.c };
        }
      }
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
        this.triggerVibrate(15);

        // Add placement points (10 pts per block unit)
        const blockUnitsCount = this.dragState.shape.matrix.flat().filter(v => v === 1).length;
        const placementPoints = blockUnitsCount * 10;
        this.addScore(placementPoints);

        // Consume block from hand
        this.hand[this.dragState.slotIndex] = null;
        placed = true;

        this.renderBoard();

        // Magnetic Snap-In Jelly Pop Animation on newly placed cells
        placedCoords.forEach(({ r, c }) => {
          const el = this.getCellElement(r, c);
          if (el) {
            el.classList.add('placed-pop');
            setTimeout(() => el.classList.remove('placed-pop'), 320);
          }
        });

        // Floating flying score for piece drop (Zero reflow)
        if (placedCoords.length > 0) {
          const avgR = placedCoords.reduce((acc, p) => acc + p.r, 0) / placedCoords.length;
          const avgC = placedCoords.reduce((acc, p) => acc + p.c, 0) / placedCoords.length;
          const fx = this.cachedBoardOffsetX + (avgC + 0.5) * (this.cachedCellWidth || 38);
          const fy = this.cachedBoardOffsetY + (avgR + 0.5) * (this.cachedCellHeight || 38);
          this.spawnFloatingScore(fx, fy, `+${placementPoints}`, false);
        }

        if (this.currentGameMode === 'adventure') {
          this.adventureMovesRemaining = Math.max(0, this.adventureMovesRemaining - 1);
          const level = ADVENTURE_LEVELS.find((l) => l.id === this.currentAdventureLevelId);
          if (level && level.objectiveType === 'target_score') {
            this.adventureGoalCurrent = Math.min(this.adventureGoalTarget, this.score);
          }
          this.updateAdventureHUD();
        }

        this.processLineClears();
      }
    }

    if (placed) {
      this.cleanupDrag();
      this.deselectSlot();
      this.renderBoard();
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
          (slotEl.firstElementChild as HTMLElement).style.opacity = '1';
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
    this.rafDragPending = false;
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

      // Track Career Stats
      this.totalLinesCleared += result.totalLines;
      localStorage.setItem('box_blast_total_lines', String(this.totalLinesCleared));

      if (this.comboStreak > this.maxCombo) {
        this.maxCombo = this.comboStreak;
        localStorage.setItem('box_blast_max_combo', String(this.maxCombo));
      }

      // Mega Combo Celebration Confetti Cannons
      if (result.totalLines >= 2 || this.comboStreak >= 3) {
        this.particles.spawnHypeCannons(85);
        sound.playMegaComboFanfare();
      }

      this.triggerVibrate(this.comboStreak >= 3 ? [20, 30, 25] : [15, 20]);

      // High-Rewarding Points Calculation:
      let baseLinePoints = 150;
      if (result.totalLines === 2) {
        baseLinePoints = 450;
      } else if (result.totalLines === 3) {
        baseLinePoints = 900;
      } else if (result.totalLines >= 4) {
        baseLinePoints = 1600 + (result.totalLines - 4) * 500;
      }

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

      // Track Adventure Mode Objective Progress
      if (this.currentGameMode === 'adventure') {
        this.checkAdventureProgress(result.clearedObstacles, result.totalLines);
      }

      // Trigger Staggered Line Clears & Jewel Debris
      this.triggerStaggeredLineClears(result.clearedRows, result.clearedCols, totalEarned, isCleanSlate);
      this.updateStreakUI();
      this.updateHandPlayabilityVisuals();
    } else {
      this.comboStreak = 0;
      this.updateStreakUI();
    }
  }

  private triggerStaggeredLineClears(clearedRows: number[], clearedCols: number[], pointsEarned: number, isCleanSlate: boolean = false): void {
    const boardOffsetX = this.cachedBoardOffsetX;
    const boardOffsetY = this.cachedBoardOffsetY;
    const cellWidth = this.cachedCellWidth || 42;
    const cellHeight = this.cachedCellHeight || 42;

    // Board screen shake on inner grid (Zero outer container reflow)
    const shakeClass = clearedRows.length + clearedCols.length >= 2 ? 'board-shake-heavy' : 'board-shake-light';
    this.boardElement.classList.add(shakeClass);
    setTimeout(() => this.boardElement.classList.remove(shakeClass), 240);

    // Real-Time Laser Sweep Elimination Effect
    this.spawnLaserBeams(clearedRows, clearedCols, clearedRows.length + clearedCols.length >= 2);

    const clearedRowSet = new Set(clearedRows);
    const clearedColSet = new Set(clearedCols);
    const allClearedKeys = new Set<string>();

    clearedRows.forEach((r) => {
      for (let c = 0; c < BOARD_SIZE; c++) allClearedKeys.add(`${r},${c}`);
    });
    clearedCols.forEach((c) => {
      for (let r = 0; r < BOARD_SIZE; r++) allClearedKeys.add(`${r},${c}`);
    });

    allClearedKeys.forEach((key) => {
      const [r, c] = key.split(',').map(Number);
      const cellEl = this.getCellElement(r, c);
      if (!cellEl) return;

      const inRow = clearedRowSet.has(r);
      const inCol = clearedColSet.has(c);
      // Stagger wave: row clears wave left-to-right, col clears wave top-to-bottom
      const delay = Math.min(inRow ? c * 20 : 999, inCol ? r * 20 : 999);
      const particleColor = inRow && inCol ? '#f59e0b' : inRow ? '#22d3ee' : '#10b981';

      // Zero-reflow mathematical coordinates
      const x = boardOffsetX + (c + 0.5) * cellWidth;
      const y = boardOffsetY + (r + 0.5) * cellHeight;

      setTimeout(() => {
        cellEl.classList.add('clearing');
        this.particles.spawnBurst(x, y, particleColor, 4);

        setTimeout(() => {
          cellEl.className = 'grid-cell';
        }, 280);
      }, delay);
    });

    // 3D Combo Celebration Popup
    this.triggerComboCelebration(pointsEarned, isCleanSlate);

    // Floating Flying Score Numbers
    const fx = boardOffsetX + (this.cachedCellWidth || 42) * BOARD_SIZE / 2;
    const fy = boardOffsetY + (this.cachedCellHeight || 42) * BOARD_SIZE / 2;
    this.spawnFloatingScore(fx, fy, `+${pointsEarned.toLocaleString()}`, true);
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

  // Real-Time Laser Beam Elimination Sweep (Zero layout thrashing)
  private spawnLaserBeams(clearedRows: number[], clearedCols: number[], isMulti: boolean): void {
    const boardOffsetX = this.cachedBoardOffsetX;
    const boardOffsetY = this.cachedBoardOffsetY;
    const cellWidth = this.cachedCellWidth || 42;
    const cellHeight = this.cachedCellHeight || 42;

    clearedRows.forEach((r) => {
      const top = boardOffsetY + (r + 0.5) * cellHeight;
      const beam = document.createElement('div');
      beam.className = isMulti ? 'laser-beam laser-beam-row laser-gold' : 'laser-beam laser-beam-row';
      beam.style.top = `${top}px`;
      this.boardContainerElement.appendChild(beam);
      setTimeout(() => beam.remove(), 360);
    });

    clearedCols.forEach((c) => {
      const left = boardOffsetX + (c + 0.5) * cellWidth;
      const beam = document.createElement('div');
      beam.className = isMulti ? 'laser-beam laser-beam-col laser-gold' : 'laser-beam laser-beam-col';
      beam.style.left = `${left}px`;
      this.boardContainerElement.appendChild(beam);
      setTimeout(() => beam.remove(), 360);
    });
  }

  // Floating Flying Score Numbers (+30, +450 PTS)
  private spawnFloatingScore(x: number, y: number, text: string, isBig: boolean = false): void {
    const scoreEl = document.createElement('div');
    scoreEl.className = isBig ? 'flying-score big' : 'flying-score';
    scoreEl.textContent = text;
    scoreEl.style.left = `${x}px`;
    scoreEl.style.top = `${y}px`;
    this.boardContainerElement.appendChild(scoreEl);
    setTimeout(() => scoreEl.remove(), 850);
  }

  // Idle Diamond Shimmer Engine (Gems on board sparkle every 4 seconds)
  private startIdleSparkleTimer(): void {
    if (this.sparkleTimer) clearInterval(this.sparkleTimer);
    this.sparkleTimer = setInterval(() => this.triggerIdleShimmer(), 4000);
  }

  private triggerIdleShimmer(): void {
    if (this.isGameOver || this.dragState !== null || this.isReturningSnapback) return;

    const occupied: { r: number; c: number }[] = [];
    for (let r = 0; r < BOARD_SIZE; r++) {
      for (let c = 0; c < BOARD_SIZE; c++) {
        if (this.grid.board[r]?.[c]?.filled) {
          occupied.push({ r, c });
        }
      }
    }

    if (occupied.length === 0) return;

    // Pick 1 to 3 random occupied cells to shimmer
    const count = Math.min(occupied.length, Math.floor(Math.random() * 3) + 1);
    for (let i = 0; i < count; i++) {
      const j = i + Math.floor(Math.random() * (occupied.length - i));
      const temp = occupied[i];
      occupied[i] = occupied[j];
      occupied[j] = temp;

      const { r, c } = occupied[i];
      const cellEl = this.getCellElement(r, c);
      if (cellEl && cellEl.classList.contains('filled') && !cellEl.classList.contains('clearing')) {
        cellEl.classList.add('idle-shimmer');
        setTimeout(() => cellEl.classList.remove('idle-shimmer'), 750);
      }
    }
  }

  // 8. Rolling Score Counter & Streak UI
  private addScore(amount: number): void {
    const oldScore = this.score;
    this.score += amount;
    this.animateScoreRolling();

    // Check for 1000-point board color evolution
    const prevMilestone = Math.floor(oldScore / 1000);
    const newMilestone = Math.floor(this.score / 1000);
    if (newMilestone > prevMilestone && newMilestone > 0) {
      this.triggerMilestoneEvolution(newMilestone);
    }

    // Check Adventure Mode progress if target_score
    if (this.currentGameMode === 'adventure') {
      this.checkAdventureProgress();
    }

    if (this.score > this.bestScore) {
      const wasExistingRecord = this.bestScore > 0;
      this.bestScore = this.score;
      this.bestScoreElement.textContent = this.bestScore.toLocaleString();
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

    if (this.scoreRollingInterval) {
      clearInterval(this.scoreRollingInterval);
      this.scoreRollingInterval = null;
    }

    const step = Math.max(1, Math.ceil(diff / 10));
    this.scoreRollingInterval = setInterval(() => {
      if (this.displayedScore < target) {
        this.displayedScore = Math.min(this.displayedScore + step, target);
        this.scoreElement.textContent = this.displayedScore.toLocaleString();
        sound.playScoreTick();
      } else {
        if (this.scoreRollingInterval) {
          clearInterval(this.scoreRollingInterval);
          this.scoreRollingInterval = null;
        }
        this.scoreElement.textContent = target.toLocaleString();
      }
    }, 24);
  }

  private updateStreakUI(): void {
    this.streakIndicatorElement.textContent = `Streak: ${this.comboStreak}`;
    const bannerZone = this.comboBadgeElement.parentElement;

    if (this.comboStreak >= 2) {
      if (bannerZone) bannerZone.classList.add('has-combo');
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
      if (bannerZone) bannerZone.classList.remove('has-combo');
      this.comboBadgeElement.classList.add('hidden');
      this.streakIndicatorElement.classList.remove('active');
      this.boardContainerElement.classList.remove('combo-aura', 'combo-aura-super');
    }
  }

  // 9. Playability Check & Game Over Flow
  private checkPlayability(): void {
    this.updateHandPlayabilityVisuals();

    const availableShapes = this.hand.filter((s): s is ShapeDefinition => s !== null);
    if (availableShapes.length === 0) return;

    const canPlayAny = availableShapes.some((shape) => this.grid.canFitAnywhere(shape));
    if (!canPlayAny) {
      if (this.currentGameMode === 'adventure') {
        if (!this.isAdventureWon && !this.isAdventureFailed) {
          this.triggerAdventureFail();
        }
      } else {
        this.triggerGameOver();
      }
    } else if (this.currentGameMode === 'adventure') {
      if (this.adventureMovesRemaining <= 0 && !this.isAdventureWon && !this.isAdventureFailed) {
        if (this.adventureGoalCurrent < this.adventureGoalTarget) {
          this.triggerAdventureFail();
        }
      }
    }
  }

  // Visual cues for playable vs unplayable shapes in the hand dock
  private updateHandPlayabilityVisuals(): void {
    for (let i = 0; i < 3; i++) {
      const slot = document.getElementById(`slot-${i}`);
      const shape = this.hand[i];
      if (!slot) continue;

      if (shape) {
        if (!this.grid.canFitAnywhere(shape)) {
          slot.classList.add('slot-unplayable');
          if (this.selectedSlotIndex === i) {
            this.deselectSlot();
          }
        } else {
          slot.classList.remove('slot-unplayable');
        }
      } else {
        slot.classList.remove('slot-unplayable', 'slot-selected');
      }
    }
  }

  private triggerGameOver(): void {
    this.isGameOver = true;
    sound.playGameOver();
    this.triggerVibrate([60, 40, 80]);

    this.modalFinalScore.textContent = this.score.toLocaleString();
    this.modalBestScore.textContent = this.bestScore.toLocaleString();
    this.updateReviveButtonUI();

    // Check if player set a new high score this run
    const isNewRecord = this.score >= this.bestScore && this.score > 0;
    if (isNewRecord) {
      this.gameOverNewRecordBanner.classList.remove('hidden');
      this.particles.spawnHypeCannons(80);
      sound.playMegaComboFanfare();
    } else {
      this.gameOverNewRecordBanner.classList.add('hidden');
    }

    this.gameOverModal.classList.remove('hidden');
  }

  private updateReviveButtonUI(): void {
    if (!this.modalReviveBtn) return;
    const strongEl = this.modalReviveBtn.querySelector('.revive-text strong');
    const smallEl = this.modalReviveBtn.querySelector('.revive-text small');

    if (this.hasRevivedThisRun) {
      this.modalReviveBtn.setAttribute('disabled', 'true');
      this.modalReviveBtn.classList.add('revive-used');
      if (strongEl) strongEl.textContent = 'Revive Used (0/1)';
      if (smallEl) smallEl.textContent = 'Limit 1 revive per game session';
    } else {
      this.modalReviveBtn.removeAttribute('disabled');
      this.modalReviveBtn.classList.remove('revive-used');
      if (strongEl) strongEl.textContent = 'Revive & Clear Board (1/1)';
      if (smallEl) smallEl.textContent = 'Blast center 3×3 orbs to continue';
    }
  }

  // Rewarded Ad Revive Simulation
  private performRevive(): void {
    if (this.hasRevivedThisRun) {
      this.showToast('Revive already used this game!');
      return;
    }
    this.hasRevivedThisRun = true;
    this.updateReviveButtonUI();

    this.gameOverModal.classList.add('hidden');
    this.isGameOver = false;

    // Clear 3x3 center bomb zone
    const center = Math.floor(BOARD_SIZE / 2);
    const cleared = this.grid.clearBombArea(center, center);
    this.renderBoard();
    sound.playRevive();

    // Particle explosion across cleared zone (Zero layout thrashing)
    cleared.forEach(({ r, c }: { r: number; c: number }, idx: number) => {
      const x = this.cachedBoardOffsetX + (c + 0.5) * (this.cachedCellWidth || 38);
      const y = this.cachedBoardOffsetY + (r + 0.5) * (this.cachedCellHeight || 38);
      setTimeout(() => {
        this.particles.spawnBurst(x, y, '#10b981', 12);
      }, idx * 15);
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

  private lastVibrateTime: number = 0;

  private triggerVibrate(pattern: number | number[]): void {
    if (!this.hapticEnabled) return;
    const now = performance.now();
    if (now - this.lastVibrateTime < 60 && typeof pattern === 'number' && pattern < 20) return;
    this.lastVibrateTime = now;
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

  private updateHapticUI(): void {
    if (this.modalToggleHaptic) {
      this.modalToggleHaptic.classList.toggle('active', this.hapticEnabled);
    }
  }

  // 10. Tap-to-Place Accessibility Engine
  private toggleSelectSlot(slotIndex: number): void {
    if (this.selectedSlotIndex === slotIndex) {
      this.deselectSlot();
    } else {
      this.selectSlot(slotIndex);
    }
  }

  private selectSlot(slotIndex: number): void {
    const shape = this.hand[slotIndex];
    if (!shape) return;

    if (!this.grid.canFitAnywhere(shape)) {
      sound.playSnapback();
      this.triggerVibrate(25);
      this.showToast("Shape doesn't fit on board!");
      return;
    }

    this.deselectSlot();
    this.selectedSlotIndex = slotIndex;
    sound.playPickup();
    this.triggerVibrate(12);

    const slotEl = document.getElementById(`slot-${slotIndex}`);
    if (slotEl) {
      slotEl.classList.add('slot-selected');
    }
    this.showToast(`Selected piece! Tap board socket to drop.`);
  }

  private deselectSlot(): void {
    if (this.selectedSlotIndex !== null) {
      const slotEl = document.getElementById(`slot-${this.selectedSlotIndex}`);
      if (slotEl) {
        slotEl.classList.remove('slot-selected');
      }
      this.selectedSlotIndex = null;
    }
    this.clearGhostCells();
    this.clearPredictiveCells();
  }

  private onCellHover(r: number, c: number): void {
    if (this.activeBooster === 'rocket') {
      this.clearRocketAim();
      for (let c_idx = 0; c_idx < BOARD_SIZE; c_idx++) {
        const el = this.getCellElement(r, c_idx);
        if (el) {
          el.classList.add('rocket-aim-cross');
          this.currentRocketAimCells.push({ r, c: c_idx });
        }
      }
      for (let r_idx = 0; r_idx < BOARD_SIZE; r_idx++) {
        const el = this.getCellElement(r_idx, c);
        if (el) {
          el.classList.add('rocket-aim-cross');
          this.currentRocketAimCells.push({ r: r_idx, c });
        }
      }
      return;
    }

    if (this.selectedSlotIndex === null || this.dragState !== null) return;
    const shape = this.hand[this.selectedSlotIndex];
    if (!shape) return;

    this.clearGhostCells();
    this.clearPredictiveCells();

    if (this.grid.canPlaceShape(shape, r, c)) {
      const matrix = shape.matrix;
      const shapeColor = shape.color;
      for (let mr = 0; mr < matrix.length; mr++) {
        for (let mc = 0; mc < matrix[0].length; mc++) {
          if (matrix[mr][mc] === 1) {
            const gr = r + mr;
            const gc = c + mc;
            this.currentGhostCells.push({ r: gr, c: gc });
            const cellEl = this.getCellElement(gr, gc);
            if (cellEl) {
              cellEl.classList.add('ghost', shapeColor);
            }
          }
        }
      }

      const predicted = this.grid.predictClearedLines(shape, r, c);
      const isMulti = predicted.rows.length + predicted.cols.length >= 2;
      for (const pr of predicted.rows) {
        for (let pc = 0; pc < BOARD_SIZE; pc++) {
          this.currentPredictiveCells.push({ r: pr, c: pc });
          const cellEl = this.getCellElement(pr, pc);
          if (cellEl) {
            cellEl.classList.add('predictive-line');
            if (isMulti) cellEl.classList.add('predictive-line-multi');
          }
        }
      }
      for (const pc of predicted.cols) {
        for (let pr = 0; pr < BOARD_SIZE; pr++) {
          this.currentPredictiveCells.push({ r: pr, c: pc });
          const cellEl = this.getCellElement(pr, pc);
          if (cellEl) {
            cellEl.classList.add('predictive-line');
            if (isMulti) cellEl.classList.add('predictive-line-multi');
          }
        }
      }
    }
  }

  private onCellClicked(r: number, c: number): void {
    if (this.activeBooster === 'hammer') {
      this.executeHammerBooster(r, c);
      return;
    }
    if (this.activeBooster === 'rocket') {
      this.executeRocketBooster(r, c);
      return;
    }

    if (this.selectedSlotIndex === null) return;
    const shape = this.hand[this.selectedSlotIndex];
    if (!shape) {
      this.deselectSlot();
      return;
    }

    if (this.grid.canPlaceShape(shape, r, c)) {
      const placedCoords = this.grid.placeShape(shape, r, c);
      sound.playPlace();
      this.triggerVibrate(15);

      const blockUnitsCount = shape.matrix.flat().filter((v) => v === 1).length;
      this.addScore(blockUnitsCount * 10);

      this.hand[this.selectedSlotIndex] = null;
      this.deselectSlot();

      this.renderBoard();

      placedCoords.forEach(({ r: pr, c: pc }) => {
        const el = this.getCellElement(pr, pc);
        if (el) {
          el.classList.add('placed-pop');
          setTimeout(() => el.classList.remove('placed-pop'), 320);
        }
      });

      if (placedCoords.length > 0) {
        const avgR = placedCoords.reduce((acc, p) => acc + p.r, 0) / placedCoords.length;
        const avgC = placedCoords.reduce((acc, p) => acc + p.c, 0) / placedCoords.length;
        const fx = this.cachedBoardOffsetX + (avgC + 0.5) * (this.cachedCellWidth || 38);
        const fy = this.cachedBoardOffsetY + (avgR + 0.5) * (this.cachedCellHeight || 38);
        this.spawnFloatingScore(fx, fy, `+${blockUnitsCount * 10}`, false);
      }

      if (this.currentGameMode === 'adventure') {
        this.adventureMovesRemaining = Math.max(0, this.adventureMovesRemaining - 1);
        const level = ADVENTURE_LEVELS.find((l) => l.id === this.currentAdventureLevelId);
        if (level && level.objectiveType === 'target_score') {
          this.adventureGoalCurrent = Math.min(this.adventureGoalTarget, this.score);
        }
        this.updateAdventureHUD();
      }

      this.processLineClears();

      if (this.hand.every((s) => s === null)) {
        this.spawnNewHand(true);
      } else {
        this.renderHand(false);
        this.checkPlayability();
      }
    } else {
      sound.playSnapback();
      this.triggerVibrate(30);
      const cellEl = this.getCellElement(r, c);
      if (cellEl) {
        cellEl.classList.add('snap-settle');
        setTimeout(() => cellEl.classList.remove('snap-settle'), 160);
      }
      this.showToast("Shape doesn't fit here!");
    }
  }

  // 11. Career Statistics Modal & Share
  private openStatsModal(): void {
    sound.playPickup();
    this.statHighScore.textContent = this.bestScore.toLocaleString();
    this.statGamesPlayed.textContent = this.gamesPlayed.toLocaleString();
    this.statLinesCleared.textContent = this.totalLinesCleared.toLocaleString();
    this.statMaxCombo.textContent = `${this.maxCombo}x`;
    this.pauseModal.classList.add('hidden');
    this.statsModal.classList.remove('hidden');
  }

  private closeStatsModal(): void {
    sound.playPickup();
    this.statsModal.classList.add('hidden');
  }

  private shareScore(): void {
    sound.playPickup();
    const shareText = `🎮 I just scored ${this.score.toLocaleString()} PTS on Box Blast 2D! Can you beat my high score? Play now: ${window.location.href}`;

    if (navigator.share) {
      navigator.share({
        title: 'Box Blast 2D Challenge',
        text: shareText,
        url: window.location.href,
      }).catch(() => {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(shareText).then(() => {
        this.showToast('Challenge copied to clipboard!');
      }).catch(() => {
        this.showToast(`Your Score: ${this.score} PTS`);
      });
    } else {
      this.showToast(`Your Score: ${this.score} PTS`);
    }
  }

  // 12. Buttons & Interactive Modals Setup
  private setupButtonEvents(): void {
    // Sound Toggle Button
    this.soundBtn.addEventListener('click', () => {
      sound.enabled = !sound.enabled;
      localStorage.setItem('box_blast_sound', String(sound.enabled));
      this.updateSoundUI();
      if (sound.enabled) {
        sound.playPickup();
      }
    });

    // Pause / Settings Button
    this.pauseBtn.addEventListener('click', () => {
      sound.playPickup();
      this.updateMiniStats();
      this.pauseModal.classList.remove('hidden');
    });

    // Modal Close (X) Button
    const closeSettingsX = document.getElementById('close-settings-x-btn');
    if (closeSettingsX) {
      closeSettingsX.addEventListener('click', () => {
        sound.playPickup();
        this.pauseModal.classList.add('hidden');
      });
    }

    // Header Quick Career Stats Button
    const headerStatsBtn = document.getElementById('header-stats-btn');
    if (headerStatsBtn) {
      headerStatsBtn.addEventListener('click', () => {
        this.openStatsModal();
      });
    }

    this.resumeGameBtn.addEventListener('click', () => {
      sound.playPickup();
      this.pauseModal.classList.add('hidden');
    });

    this.pauseStatsBtn.addEventListener('click', () => {
      this.openStatsModal();
    });

    this.closeStatsBtn.addEventListener('click', () => {
      this.closeStatsModal();
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
      localStorage.setItem('box_blast_sound', String(sound.enabled));
      this.updateSoundUI();
      if (sound.enabled) sound.playPickup();
    });

    this.modalToggleHaptic.addEventListener('click', () => {
      this.hapticEnabled = !this.hapticEnabled;
      localStorage.setItem('box_blast_haptics', String(this.hapticEnabled));
      this.updateHapticUI();
      if (this.hapticEnabled) this.triggerVibrate(15);
    });

    // Tutorial Modal
    this.closeTutorialBtn.addEventListener('click', () => {
      sound.playPickup();
      this.tutorialModal.classList.add('hidden');
    });

    // Boosters Button Events
    this.boosterHammerBtn.addEventListener('click', () => {
      sound.unlock();
      this.toggleBooster('hammer');
    });

    this.boosterRocketBtn.addEventListener('click', () => {
      sound.unlock();
      this.toggleBooster('rocket');
    });

    this.boosterRerollBtn.addEventListener('click', () => {
      sound.unlock();
      this.useRerollBooster();
    });

    this.boosterHintBar.addEventListener('click', () => {
      this.cancelBooster();
    });

    this.boardElement.addEventListener('pointerleave', () => {
      this.clearRocketAim();
    });

    // Restart Buttons with Double-Tap Safety
    let restartConfirmPending = false;
    let restartConfirmTimeout: ReturnType<typeof setTimeout> | null = null;

    this.restartBtn.addEventListener('click', () => {
      sound.unlock();
      if (this.score > 100 && !this.isGameOver && !restartConfirmPending) {
        restartConfirmPending = true;
        this.showToast('Tap restart again to confirm');
        if (restartConfirmTimeout) clearTimeout(restartConfirmTimeout);
        restartConfirmTimeout = setTimeout(() => {
          restartConfirmPending = false;
        }, 2500);
        return;
      }
      restartConfirmPending = false;
      if (restartConfirmTimeout) clearTimeout(restartConfirmTimeout);

      this.restartIconSvg.classList.remove('spin-anim');
      void this.restartIconSvg.offsetWidth; // trigger reflow
      this.restartIconSvg.classList.add('spin-anim');
      sound.playPickup();
      if (this.currentGameMode === 'adventure') {
        this.loadAdventureLevel(this.currentAdventureLevelId);
      } else {
        this.startNewGame();
      }
    });

    this.modalRestartBtn.addEventListener('click', () => {
      sound.unlock();
      sound.playPickup();
      if (this.currentGameMode === 'adventure') {
        this.loadAdventureLevel(this.currentAdventureLevelId);
      } else {
        this.startNewGame();
      }
    });

    // Revive Button
    this.modalReviveBtn.addEventListener('click', () => {
      this.performRevive();
    });

    // Share Button
    this.modalShareBtn.addEventListener('click', () => {
      this.shareScore();
    });

    // Background Theme Selector
    const themeButtons = document.querySelectorAll('.theme-select-btn');
    themeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        sound.unlock();
        sound.playPickup();
        const theme = (btn as HTMLElement).dataset.theme;
        if (theme) {
          this.applyTheme(theme);
        }
      });
    });
  }

  // 13. Desktop Keyboard Shortcuts
  private setupKeyboardEvents(): void {
    window.addEventListener('keydown', (e) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT') return;

      const key = e.key.toLowerCase();
      if (key === 'escape' || key === 'p') {
        e.preventDefault();
        sound.playPickup();
        if (this.pauseModal.classList.contains('hidden')) {
          if (!this.gameOverModal.classList.contains('hidden')) return;
          if (!this.statsModal.classList.contains('hidden')) {
            this.statsModal.classList.add('hidden');
            return;
          }
          this.pauseModal.classList.remove('hidden');
        } else {
          this.pauseModal.classList.add('hidden');
        }
      } else if (key === 'r') {
        e.preventDefault();
        this.restartBtn.click();
      } else if (key === 'm') {
        e.preventDefault();
        this.soundBtn.click();
      } else if (key === 's') {
        e.preventDefault();
        if (this.statsModal.classList.contains('hidden')) {
          this.openStatsModal();
        } else {
          this.closeStatsModal();
        }
      } else if (key === '1' || key === '2' || key === '3') {
        const slotIdx = parseInt(key, 10) - 1;
        this.toggleSelectSlot(slotIdx);
      }
    });
  }

  // 14. Adventure Mode Implementation
  private setupAdventureEvents(): void {
    this.btnModeClassic.addEventListener('click', () => {
      sound.playPickup();
      this.switchGameMode('classic');
    });

    this.btnModeAdventure.addEventListener('click', () => {
      sound.playPickup();
      this.switchGameMode('adventure');
    });

    this.adventureMapBtn.addEventListener('click', () => {
      sound.playPickup();
      this.openAdventureMap();
    });

    this.closeMapBtn.addEventListener('click', () => {
      sound.playPickup();
      this.closeAdventureMap();
    });

    this.nextLevelBtn.addEventListener('click', () => {
      sound.playPickup();
      this.levelCompleteModal.classList.add('hidden');
      const nextId = Math.min(this.currentAdventureLevelId + 1, ADVENTURE_LEVELS.length);
      this.loadAdventureLevel(nextId);
    });

    this.replayLevelBtn.addEventListener('click', () => {
      sound.playPickup();
      this.levelCompleteModal.classList.add('hidden');
      this.loadAdventureLevel(this.currentAdventureLevelId);
    });

    this.victoryMapBtn.addEventListener('click', () => {
      sound.playPickup();
      this.levelCompleteModal.classList.add('hidden');
      this.openAdventureMap();
    });

    this.retryLevelBtn.addEventListener('click', () => {
      sound.playPickup();
      this.levelFailedModal.classList.add('hidden');
      this.loadAdventureLevel(this.currentAdventureLevelId);
    });

    this.failMapBtn.addEventListener('click', () => {
      sound.playPickup();
      this.levelFailedModal.classList.add('hidden');
      this.openAdventureMap();
    });

    if (this.failReviveBtn) {
      this.failReviveBtn.addEventListener('click', () => {
        sound.playRevive();
        this.particles.spawnHypeCannons(35);
        this.levelFailedModal.classList.add('hidden');
        this.isAdventureFailed = false;
        this.adventureMovesRemaining += 5;
        this.updateAdventureHUD();
        this.showToast('+5 Extra Moves! Keep going!');
      });
    }

    const advBackBtn = document.getElementById('adv-back-classic-btn');
    if (advBackBtn) {
      advBackBtn.addEventListener('click', () => {
        sound.playPickup();
        this.switchGameMode('classic');
      });
    }

    const advPauseBtn = document.getElementById('adv-pause-btn');
    if (advPauseBtn) {
      advPauseBtn.addEventListener('click', () => {
        sound.playPickup();
        this.pauseBtn.click();
      });
    }
  }

  private switchGameMode(mode: 'classic' | 'adventure'): void {
    this.currentGameMode = mode;
    this.btnModeClassic.classList.toggle('active', mode === 'classic');
    this.btnModeClassic.setAttribute('aria-pressed', String(mode === 'classic'));
    this.btnModeAdventure.classList.toggle('active', mode === 'adventure');
    this.btnModeAdventure.setAttribute('aria-pressed', String(mode === 'adventure'));

    this.gameWrapperEl.classList.toggle('mode-adventure', mode === 'adventure');

    // Hide classic header and mode bar in Adventure mode for a 100% unified single-bar HUD
    const classicHeader = document.querySelector('.hud-header');
    const modeNavBar = document.querySelector('.mode-nav-bar');
    if (classicHeader) classicHeader.classList.toggle('hidden', mode === 'adventure');
    if (modeNavBar) modeNavBar.classList.toggle('hidden', mode === 'adventure');
    this.adventureHudBar.classList.toggle('hidden', mode !== 'adventure');

    // Recalculate board geometry for seamless responsive layout transition
    requestAnimationFrame(() => {
      this.updateCachedBoardGeometry();
      this.particles.resize();
    });

    if (mode === 'classic') {
      this.showToast('Classic Endless Mode');
      this.startNewGame();
    } else {
      const unlocked = getUnlockedLevel();
      this.currentAdventureLevelId = unlocked;
      this.showToast(`Adventure Mode: Level ${this.currentAdventureLevelId}`);
      this.loadAdventureLevel(this.currentAdventureLevelId);
    }
  }

  private loadAdventureLevel(levelId: number): void {
    const level = ADVENTURE_LEVELS.find((l) => l.id === levelId) || ADVENTURE_LEVELS[0];
    this.currentAdventureLevelId = level.id;
    this.isAdventureWon = false;
    this.isAdventureFailed = false;

    // Reset base game state
    this.deselectSlot();
    this.grid.reset();
    this.score = 0;
    this.displayedScore = 0;
    this.comboStreak = 0;
    this.isGameOver = false;
    this.hasRevivedThisRun = false;
    this.scoreElement.textContent = '0';
    this.updateStreakUI();

    // Populate initial obstacles if defined
    if (level.initialCells && level.initialCells.length > 0) {
      level.initialCells.forEach(({ r, c, obstacle, color }) => {
        this.grid.setObstacle(r, c, obstacle, color);
      });
    }

    // Set Adventure Goals
    this.adventureMovesRemaining = level.moves;
    this.adventureGoalTarget = level.targetCount;
    this.adventureGoalCurrent = 0;

    this.updateAdventureHUD(level);
    this.renderBoard();
    this.spawnNewHand(true);
    this.updateCachedBoardGeometry();
  }

  private updateAdventureHUD(level?: AdventureLevel): void {
    const currentLvl = level || ADVENTURE_LEVELS.find((l) => l.id === this.currentAdventureLevelId) || ADVENTURE_LEVELS[0];
    this.adventureLevelBadge.textContent = `LVL ${currentLvl.id}`;
    this.adventureMovesLeft.textContent = String(this.adventureMovesRemaining);

    // Update goal icon and text
    if (currentLvl.objectiveType === 'melt_ice') {
      this.adventureGoalIcon.textContent = '🧊';
      this.adventureGoalName.textContent = 'Melt Ice';
    } else if (currentLvl.objectiveType === 'collect_relics') {
      this.adventureGoalIcon.textContent = '🏺';
      this.adventureGoalName.textContent = 'Relics';
    } else if (currentLvl.objectiveType === 'clear_lines') {
      this.adventureGoalIcon.textContent = '⚡';
      this.adventureGoalName.textContent = 'Lines';
    } else {
      this.adventureGoalIcon.textContent = '🎯';
      this.adventureGoalName.textContent = 'Score';
    }

    this.adventureGoalCount.textContent = `${this.adventureGoalCurrent} / ${this.adventureGoalTarget}`;

    // Update goal micro progress bar fill
    if (this.adventureGoalProgressFill) {
      const pct = Math.min(100, Math.round((this.adventureGoalCurrent / Math.max(1, this.adventureGoalTarget)) * 100));
      this.adventureGoalProgressFill.style.width = `${pct}%`;
    }

    // Low moves warning
    this.adventureMovesChip.classList.toggle('low-moves', this.adventureMovesRemaining <= 3);
  }

  private checkAdventureProgress(clearedObstacles?: { type: ObstacleType }[], clearedLinesCount: number = 0): void {
    if (this.currentGameMode !== 'adventure' || this.isAdventureWon) return;

    const level = ADVENTURE_LEVELS.find((l) => l.id === this.currentAdventureLevelId);
    if (!level) return;

    if (level.objectiveType === 'clear_lines' && clearedLinesCount > 0) {
      this.adventureGoalCurrent = Math.min(this.adventureGoalTarget, this.adventureGoalCurrent + clearedLinesCount);
    } else if (level.objectiveType === 'target_score') {
      this.adventureGoalCurrent = Math.min(this.adventureGoalTarget, this.score);
    } else if (level.objectiveType === 'melt_ice' && clearedObstacles && clearedObstacles.length > 0) {
      const iceMelted = clearedObstacles.filter((o) => o.type === 'ice').length;
      this.adventureGoalCurrent = Math.min(this.adventureGoalTarget, this.adventureGoalCurrent + iceMelted);
    } else if (level.objectiveType === 'collect_relics' && clearedObstacles && clearedObstacles.length > 0) {
      const relicsCollected = clearedObstacles.filter((o) => o.type === 'relic').length;
      this.adventureGoalCurrent = Math.min(this.adventureGoalTarget, this.adventureGoalCurrent + relicsCollected);
    }

    this.updateAdventureHUD(level);

    if (this.adventureGoalCurrent >= this.adventureGoalTarget && !this.isAdventureWon) {
      this.triggerAdventureVictory(level);
    }
  }

  private triggerAdventureVictory(level: AdventureLevel): void {
    this.isAdventureWon = true;
    sound.playMegaComboFanfare();
    this.particles.spawnHypeCannons(95);

    // Calculate Stars
    const stars = calculateStars(level, this.score);
    saveLevelStars(level.id, stars);
    unlockNextLevel(level.id);

    this.victoryLevelSubtitle.textContent = `${level.chapter} • Level ${level.id}: ${level.name}`;
    this.victoryScore.textContent = this.score.toLocaleString();
    this.victoryMovesLeft.textContent = `${this.adventureMovesRemaining} Moves Left`;

    // Update stars UI with staggered bounce
    const star1 = document.getElementById('star-1')!;
    const star2 = document.getElementById('star-2')!;
    const star3 = document.getElementById('star-3')!;
    const starEls = [star1, star2, star3];

    starEls.forEach((el, idx) => {
      el.classList.remove('earned');
      if (idx < stars) {
        setTimeout(() => el.classList.add('earned'), (idx + 1) * 220);
      }
    });

    setTimeout(() => {
      this.levelCompleteModal.classList.remove('hidden');
    }, 400);
  }

  private triggerAdventureFail(): void {
    this.isAdventureFailed = true;
    sound.playGameOver();
    const level = ADVENTURE_LEVELS.find((l) => l.id === this.currentAdventureLevelId);
    const diff = Math.max(0, this.adventureGoalTarget - this.adventureGoalCurrent);
    this.failStatusText.textContent = `You needed ${diff} more to complete Level ${this.currentAdventureLevelId}!`;
    this.failProgressStat.textContent = `${this.adventureGoalCurrent} / ${this.adventureGoalTarget}`;
    this.failScoreStat.textContent = this.score.toLocaleString();

    setTimeout(() => {
      this.levelFailedModal.classList.remove('hidden');
    }, 350);
  }

  private openAdventureMap(): void {
    this.renderAdventureMap();
    this.adventureMapModal.classList.remove('hidden');
  }

  private closeAdventureMap(): void {
    this.adventureMapModal.classList.add('hidden');
  }

  private renderAdventureMap(): void {
    const unlocked = getUnlockedLevel();
    let totalStars = 0;
    this.adventureLevelsGrid.innerHTML = '';

    // Group levels by chapter
    const chapters: { [chapterName: string]: AdventureLevel[] } = {};
    ADVENTURE_LEVELS.forEach((level) => {
      if (!chapters[level.chapter]) {
        chapters[level.chapter] = [];
      }
      chapters[level.chapter].push(level);
    });

    const chapterIcons: { [key: string]: string } = {
      'Mystic Forest': '🌲',
      'Crystal Cavern': '💎',
      'Cosmic Sanctuary': '🌌',
    };

    let chapterIndex = 0;
    for (const [chapterName, levels] of Object.entries(chapters)) {
      chapterIndex++;
      let chapterStars = 0;
      levels.forEach((l) => {
        chapterStars += getLevelStars(l.id);
      });
      totalStars += chapterStars;

      const groupEl = document.createElement('div');
      groupEl.className = 'chapter-group';

      const headerEl = document.createElement('div');
      headerEl.className = 'chapter-header';
      const icon = chapterIcons[chapterName] || '🗺️';
      headerEl.innerHTML = `
        <span class="chapter-title">${icon} Ch.${chapterIndex}: ${chapterName}</span>
        <span class="chapter-stars-pill">⭐ ${chapterStars} / ${levels.length * 3}</span>
      `;
      groupEl.appendChild(headerEl);

      const gridEl = document.createElement('div');
      gridEl.className = 'chapter-levels-grid';

      levels.forEach((level) => {
        const stars = getLevelStars(level.id);
        const isUnlocked = level.id <= unlocked;
        const isCurrent = level.id === this.currentAdventureLevelId;

        const btn = document.createElement('button');
        btn.className = `level-node-btn ${isUnlocked ? 'unlocked' : 'locked'} ${isCurrent ? 'current' : ''}`;
        btn.title = `${level.chapter} - ${level.name}`;

        let starsText = '';
        if (isUnlocked) {
          starsText = '⭐'.repeat(stars) + '☆'.repeat(3 - stars);
        } else {
          starsText = '🔒';
        }

        btn.innerHTML = `
          <span class="level-num">${level.id}</span>
          <span class="level-stars-bar">${starsText}</span>
        `;

        if (isUnlocked) {
          btn.addEventListener('click', () => {
            sound.playPickup();
            this.closeAdventureMap();
            if (this.currentGameMode !== 'adventure') {
              this.switchGameMode('adventure');
            }
            this.loadAdventureLevel(level.id);
          });
        }

        gridEl.appendChild(btn);
      });

      groupEl.appendChild(gridEl);
      this.adventureLevelsGrid.appendChild(groupEl);
    }

    this.mapTotalStars.textContent = `${totalStars} / ${ADVENTURE_LEVELS.length * 3}`;
  }

  // =========================================================================
  // 12. Boosters Engine (Hammer, Rocket, Reroll) & Milestone Evolution
  // =========================================================================

  private loadBoosterCounts(): void {
    const savedHammer = localStorage.getItem('box_blast_hammer_count');
    const savedRocket = localStorage.getItem('box_blast_rocket_count');
    const savedReroll = localStorage.getItem('box_blast_reroll_count');

    this.hammerCount = savedHammer !== null ? Math.max(0, parseInt(savedHammer, 10)) : 3;
    this.rocketCount = savedRocket !== null ? Math.max(0, parseInt(savedRocket, 10)) : 3;
    this.rerollCount = savedReroll !== null ? Math.max(0, parseInt(savedReroll, 10)) : 3;

    if (isNaN(this.hammerCount)) this.hammerCount = 3;
    if (isNaN(this.rocketCount)) this.rocketCount = 3;
    if (isNaN(this.rerollCount)) this.rerollCount = 3;

    this.updateBoosterUI();
  }

  private saveBoosterCounts(): void {
    localStorage.setItem('box_blast_hammer_count', String(this.hammerCount));
    localStorage.setItem('box_blast_rocket_count', String(this.rocketCount));
    localStorage.setItem('box_blast_reroll_count', String(this.rerollCount));
    this.updateBoosterUI();
  }

  private updateBoosterUI(): void {
    if (!this.boosterHammerBadge || !this.boosterRocketBadge || !this.boosterRerollBadge) return;

    this.boosterHammerBadge.textContent = String(this.hammerCount);
    this.boosterRocketBadge.textContent = String(this.rocketCount);
    this.boosterRerollBadge.textContent = String(this.rerollCount);

    this.boosterHammerBadge.classList.toggle('empty', this.hammerCount === 0);
    this.boosterRocketBadge.classList.toggle('empty', this.rocketCount === 0);
    this.boosterRerollBadge.classList.toggle('empty', this.rerollCount === 0);

    this.boosterHammerBtn.classList.toggle('active-booster', this.activeBooster === 'hammer');
    this.boosterRocketBtn.classList.toggle('active-booster', this.activeBooster === 'rocket');
  }

  private toggleBooster(type: 'hammer' | 'rocket'): void {
    const count = type === 'hammer' ? this.hammerCount : this.rocketCount;
    if (count <= 0) {
      sound.playSnapback();
      this.triggerVibrate(20);
      this.showToast(`No ${type}s left! Reach next 1,000 pts for free bonus! 🎁`);
      return;
    }

    if (this.activeBooster === type) {
      this.cancelBooster();
      sound.playPickup();
      return;
    }

    // Activate selected booster
    this.deselectSlot();
    this.clearGhostCells();
    this.clearPredictiveCells();
    this.clearRocketAim();

    this.activeBooster = type;
    this.boardElement.classList.remove('targeting-hammer', 'targeting-rocket');
    this.boardElement.classList.add(`targeting-${type}`);

    this.boosterHintBar.classList.remove('hidden');
    if (type === 'hammer') {
      this.boosterHintText.textContent = '🔨 Tap any block to smash • Tap booster to cancel';
    } else {
      this.boosterHintText.textContent = '🚀 Tap any cell to blast Row & Col • Tap booster to cancel';
    }

    sound.playPickup();
    this.triggerVibrate(15);
    this.updateBoosterUI();
  }

  private cancelBooster(): void {
    this.activeBooster = null;
    this.boardElement.classList.remove('targeting-hammer', 'targeting-rocket');
    this.boosterHintBar.classList.add('hidden');
    this.clearRocketAim();
    this.updateBoosterUI();
  }

  private clearRocketAim(): void {
    if (this.currentRocketAimCells.length > 0) {
      this.currentRocketAimCells.forEach(({ r, c }) => {
        const el = this.getCellElement(r, c);
        if (el) el.classList.remove('rocket-aim-cross');
      });
      this.currentRocketAimCells = [];
    }
  }

  private executeHammerBooster(r: number, c: number): void {
    if (!this.grid.board[r]?.[c]?.filled) {
      sound.playSnapback();
      this.triggerVibrate(25);
      this.showToast('Tap a filled block to smash! 🔨');
      return;
    }

    const cleared = this.grid.clearSingleCell(r, c);
    if (cleared) {
      const cellEl = this.getCellElement(r, c);
      if (cellEl) {
        const x = this.cachedBoardOffsetX + (c + 0.5) * (this.cachedCellWidth || 38);
        const y = this.cachedBoardOffsetY + (r + 0.5) * (this.cachedCellHeight || 38);
        this.particles.spawnBurst(x, y, '#f59e0b', 14);
        cellEl.className = 'grid-cell placed-pop';
        setTimeout(() => {
          if (cellEl) cellEl.className = 'grid-cell';
        }, 220);
      }

      this.boardElement.classList.add('board-shake-light');
      setTimeout(() => this.boardElement.classList.remove('board-shake-light'), 220);

      sound.playHammerSmash();
      this.triggerVibrate(35);
      this.addScore(25);

      // Track adventure mode progress if an obstacle (ice/relic) was smashed
      if (cleared.obstacle) {
        this.checkAdventureProgress([{ type: cleared.obstacle }], 0);
      }

      this.renderBoard();
      this.hammerCount = Math.max(0, this.hammerCount - 1);
      this.saveBoosterCounts();
      this.cancelBooster();
      this.checkPlayability();
      this.showToast('Block Smashed! 🔨 (+25 PTS)');
    }
  }

  private executeRocketBooster(targetR: number, targetC: number): void {
    const cleared = this.grid.clearCrossRocket(targetR, targetC);

    // Launch supersonic visual rocket sprites
    const targetCell = this.getCellElement(targetR, targetC);
    if (targetCell) {
      const rowY = targetCell.offsetTop + targetCell.offsetHeight / 2;
      const missileH = document.createElement('div');
      missileH.className = 'rocket-missile-h';
      missileH.textContent = '🚀';
      missileH.style.top = `${rowY}px`;
      this.boardElement.appendChild(missileH);
      setTimeout(() => {
        if (missileH.parentElement) missileH.parentElement.removeChild(missileH);
      }, 420);

      const colX = targetCell.offsetLeft + targetCell.offsetWidth / 2;
      const missileV = document.createElement('div');
      missileV.className = 'rocket-missile-v';
      missileV.textContent = '🚀';
      missileV.style.left = `${colX}px`;
      this.boardElement.appendChild(missileV);
      setTimeout(() => {
        if (missileV.parentElement) missileV.parentElement.removeChild(missileV);
      }, 420);
    }

    this.boardElement.classList.add('board-shake-heavy');
    setTimeout(() => this.boardElement.classList.remove('board-shake-heavy'), 320);

    sound.playRocketLaunch();
    this.triggerVibrate([40, 30, 60]);

    // Animate clears
    cleared.forEach(({ r, c }) => {
      const cellEl = this.getCellElement(r, c);
      if (cellEl) {
        const x = this.cachedBoardOffsetX + (c + 0.5) * (this.cachedCellWidth || 38);
        const y = this.cachedBoardOffsetY + (r + 0.5) * (this.cachedCellHeight || 38);
        this.particles.spawnBurst(x, y, '#38bdf8', 8);
        cellEl.className = 'grid-cell clearing';
        setTimeout(() => {
          if (cellEl) cellEl.className = 'grid-cell';
        }, 220);
      }
    });

    const pts = Math.max(100, cleared.length * 25);
    this.addScore(pts);

    // Track adventure progress for obstacles destroyed & lines blasted by rocket
    const clearedObstacles = cleared
      .filter((c) => c.obstacle !== null)
      .map((c) => ({ type: c.obstacle! }));
    this.checkAdventureProgress(clearedObstacles, 2);

    this.renderBoard();
    this.rocketCount = Math.max(0, this.rocketCount - 1);
    this.saveBoosterCounts();
    this.cancelBooster();
    this.checkPlayability();
    this.showToast(`Supersonic Rocket Blast! 🚀 (+${pts} PTS)`);
  }

  private useRerollBooster(): void {
    if (this.rerollCount <= 0) {
      sound.playSnapback();
      this.triggerVibrate(20);
      this.showToast('No Rerolls left! Reach next 1,000 pts for free bonus! 🎁');
      return;
    }

    if (this.hand.every((s) => s === null)) {
      this.showToast('Hand is already empty!');
      return;
    }

    sound.playReroll();
    this.triggerVibrate([20, 20, 20]);

    for (let i = 0; i < 3; i++) {
      const slot = document.getElementById(`slot-${i}`);
      if (slot) {
        slot.classList.add('reroll-spin');
        setTimeout(() => slot.classList.remove('reroll-spin'), 400);
      }
    }

    this.hand = generateSmartHand(this.grid);
    this.renderHand(false);

    this.rerollCount = Math.max(0, this.rerollCount - 1);
    this.saveBoosterCounts();
    this.cancelBooster();
    this.checkPlayability();
    this.showToast('Hand Refreshed! 🔄');
  }

  // 13. Dynamic Board Color Evolution Every 1,000 Points
  private triggerMilestoneEvolution(milestone: number): void {
    const MILESTONE_THEMES = [
      { id: 'theme-emerald', name: 'Emerald Sanctuary', accent: '#10b981' },
      { id: 'theme-amber', name: 'Solar Gold', accent: '#f59e0b' },
      { id: 'theme-amethyst', name: 'Royal Amethyst', accent: '#a855f7' },
      { id: 'theme-neon', name: 'Cyber Neon', accent: '#06b6d4' },
      { id: 'theme-ruby', name: 'Crimson Inferno', accent: '#ef4444' },
      { id: 'theme-prism', name: 'Mythic Prism', accent: '#38bdf8' },
    ];

    const themeObj = MILESTONE_THEMES[(milestone - 1) % MILESTONE_THEMES.length];
    this.applyTheme(themeObj.id);

    // Reward +1 of every booster!
    this.hammerCount += 1;
    this.rocketCount += 1;
    this.rerollCount += 1;
    this.saveBoosterCounts();

    sound.playMilestoneFanfare();
    this.triggerVibrate([40, 30, 60, 30, 100]);
    this.particles.spawnHypeCannons(80);

    // Floating celebratory milestone banner
    const banner = document.createElement('div');
    banner.className = 'milestone-banner';
    banner.innerHTML = `
      <span class="milestone-title">🎉 ${(milestone * 1000).toLocaleString()} PTS! ${themeObj.name.toUpperCase()}</span>
      <span class="milestone-sub">+1 Hammer • +1 Rocket • +1 Reroll Free!</span>
    `;
    this.floatingTextContainer.appendChild(banner);
    setTimeout(() => {
      if (banner.parentElement) banner.parentElement.removeChild(banner);
    }, 2400);

    this.showToast(`✨ ${(milestone * 1000).toLocaleString()} PTS! Board Evolved: ${themeObj.name}`);
  }

  private getCellElement(r: number, c: number): HTMLElement | null {
    if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
      return this.cellElementsGrid[r]?.[c] || null;
    }
    return null;
  }
}
