interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  vRot: number;
  isBead: boolean;
  life: number;
  maxLife: number;
}

interface Shockwave {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  color: string;
  alpha: number;
}

interface ConfettiPiece {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  color: string;
  alpha: number;
  rotation: number;
  vRot: number;
  flutterPhase: number;
  vFlutter: number;
  isStar: boolean;
  life: number;
  maxLife: number;
}

const CONFETTI_COLORS = [
  '#f59e0b', // Gold
  '#38bdf8', // Electric Cyan
  '#10b981', // Emerald
  '#ef4444', // Ruby
  '#a855f7', // Purple
  '#ec4899', // Hot Pink
  '#fbbf24', // Amber
  '#ffffff', // Diamond White
];

export class ParticleEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private particles: Particle[] = [];
  private shockwaves: Shockwave[] = [];
  private confetti: ConfettiPiece[] = [];
  private isRunning: boolean = false;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  public resize(): void {
    const rect = this.canvas.parentElement?.getBoundingClientRect();
    if (rect) {
      this.canvas.width = rect.width;
      this.canvas.height = rect.height;
    }
  }

  // Spawns glossy marble beads and expanding shockwave rings
  public spawnBurst(x: number, y: number, color: string, count: number = 16): void {
    // 1. Expanding Shockwave Ring
    this.shockwaves.push({
      x,
      y,
      radius: 4,
      maxRadius: 36,
      color,
      alpha: 0.9,
    });

    // 2. High-speed marble beads & sparkles
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6.5 + 2.5;
      const isBead = Math.random() > 0.4;

      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 2.5, // upward initial pop
        size: isBead ? Math.random() * 7 + 4 : Math.random() * 4 + 2,
        color,
        alpha: 1,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.3,
        isBead,
        life: 0,
        maxLife: Math.random() * 25 + 22,
      });
    }

    this.ensureRunning();
  }

  // Spawns radial celebratory confetti from a point
  public spawnMegaConfetti(x: number, y: number, count: number = 70): void {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 8 + 3;
      const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      const isStar = Math.random() > 0.7;

      this.confetti.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        width: Math.random() * 8 + 6,
        height: Math.random() * 11 + 8,
        color,
        alpha: 1,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.25,
        flutterPhase: Math.random() * Math.PI * 2,
        vFlutter: Math.random() * 0.18 + 0.08,
        isStar,
        life: 0,
        maxLife: Math.random() * 40 + 45,
      });
    }

    this.ensureRunning();
  }

  // Dual cannons shooting from bottom corners across the board
  public spawnHypeCannons(count: number = 80): void {
    const w = this.canvas.width || 380;
    const h = this.canvas.height || 380;

    for (let i = 0; i < count; i++) {
      const fromLeft = i % 2 === 0;
      const originX = fromLeft ? 10 : w - 10;
      const originY = h - 20;

      const vx = fromLeft ? Math.random() * 6 + 3 : -(Math.random() * 6 + 3);
      const vy = -(Math.random() * 9 + 6);
      const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
      const isStar = Math.random() > 0.65;

      this.confetti.push({
        x: originX,
        y: originY,
        vx,
        vy,
        width: Math.random() * 9 + 6,
        height: Math.random() * 12 + 8,
        color,
        alpha: 1,
        rotation: Math.random() * Math.PI * 2,
        vRot: (Math.random() - 0.5) * 0.28,
        flutterPhase: Math.random() * Math.PI * 2,
        vFlutter: Math.random() * 0.2 + 0.09,
        isStar,
        life: 0,
        maxLife: Math.random() * 50 + 55,
      });
    }

    this.ensureRunning();
  }

  private ensureRunning(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      requestAnimationFrame(this.loop);
    }
  }

  private loop = (): void => {
    if (this.particles.length === 0 && this.shockwaves.length === 0 && this.confetti.length === 0) {
      this.isRunning = false;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      return;
    }

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 1. Render & update Shockwaves
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      sw.radius += 2.2;
      sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);

      this.ctx.save();
      this.ctx.strokeStyle = sw.color;
      this.ctx.lineWidth = 2.5;
      this.ctx.globalAlpha = sw.alpha;
      this.ctx.beginPath();
      this.ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
      this.ctx.stroke();
      this.ctx.restore();

      if (sw.radius >= sw.maxRadius) {
        this.shockwaves.splice(i, 1);
      }
    }

    // 2. Render & update Particles (Glossy marble beads & sparkles)
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22; // gravity
      p.vx *= 0.95; // air friction
      p.rotation += p.vRot;
      p.life++;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate(p.rotation);

      if (p.isBead) {
        // Spherical marble bead with specular glint
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();

        // White specular glint
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(-p.size / 6, -p.size / 6, Math.max(0.8, p.size / 5), 0, Math.PI * 2);
        this.ctx.fill();
      } else {
        // Glowing round sparkle
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.ctx.restore();

      if (p.life >= p.maxLife) {
        this.particles.splice(i, 1);
      }
    }

    // 3. Render & update Confetti with 3D Tumbling & Ribbon Flutter
    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const c = this.confetti[i];
      c.x += c.vx;
      c.y += c.vy;
      c.vy += 0.16; // gentle gravity
      c.vx *= 0.97; // air resistance
      c.rotation += c.vRot;
      c.flutterPhase += c.vFlutter;
      c.life++;
      c.alpha = Math.max(0, 1 - c.life / c.maxLife);

      const scaleX = Math.cos(c.flutterPhase); // 3D ribbon flip

      this.ctx.save();
      this.ctx.globalAlpha = c.alpha;
      this.ctx.fillStyle = c.color;
      this.ctx.translate(c.x, c.y);
      this.ctx.rotate(c.rotation);
      this.ctx.scale(scaleX, 1);

      if (c.isStar) {
        // 4-point shining star
        this.ctx.beginPath();
        this.ctx.moveTo(0, -c.height * 0.7);
        this.ctx.lineTo(c.width * 0.3, -c.height * 0.3);
        this.ctx.lineTo(c.width * 0.7, 0);
        this.ctx.lineTo(c.width * 0.3, c.height * 0.3);
        this.ctx.lineTo(0, c.height * 0.7);
        this.ctx.lineTo(-c.width * 0.3, c.height * 0.3);
        this.ctx.lineTo(-c.width * 0.7, 0);
        this.ctx.lineTo(-c.width * 0.3, -c.height * 0.3);
        this.ctx.closePath();
        this.ctx.fill();
      } else {
        // Metallic ribbon rectangle
        this.ctx.fillRect(-c.width / 2, -c.height / 2, c.width, c.height);
      }

      this.ctx.restore();

      if (c.life >= c.maxLife) {
        this.confetti.splice(i, 1);
      }
    }

    requestAnimationFrame(this.loop);
  };
}
