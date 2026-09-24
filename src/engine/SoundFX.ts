// Advanced Box Blast 2D Sound & Harmonic Synthesizer (Web Audio API)

class SoundFXEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  // Musical Scale for Combos (C Major pentatonic & full scale)
  private comboScale = [
    261.63, // C4
    293.66, // D4
    329.63, // E4
    349.23, // F4
    392.00, // G4
    440.00, // A4
    493.88, // B4
    523.25, // C5
    587.33, // D5
    659.25, // E5
    783.99, // G5
    1046.50, // C6 (High Masterpiece)
  ];

  private hasUserInteracted: boolean = false;

  public unlock(): void {
    this.hasUserInteracted = true;
    this.initContext();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  private initContext(): void {
    if (!this.hasUserInteracted) return;
    if (!this.ctx) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.ctx = new AudioCtx();
      } catch {}
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Tactile click on picking up block
  public playPickup() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(360, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.05);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  // Solid tactile thud on placing block
  public playPlace() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Low punch
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.09);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);

    // Subtle click transient
    const clickOsc = this.ctx.createOscillator();
    const clickGain = this.ctx.createGain();
    clickOsc.type = 'triangle';
    clickOsc.frequency.setValueAtTime(480, now);
    clickOsc.frequency.exponentialRampToValueAtTime(100, now + 0.03);
    clickGain.gain.setValueAtTime(0.15, now);
    clickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);
    clickOsc.connect(clickGain);
    clickGain.connect(this.ctx.destination);
    clickOsc.start(now);
    clickOsc.stop(now + 0.035);
  }

  // Smooth Spring Return / Snapback on invalid drop
  public playSnapback() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(260, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  // Line Clear with Bell/Marimba Harmonic Synthesis & Echo
  public playLineClear(comboCount: number) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const pitchIndex = Math.min(Math.max(comboCount - 1, 0), this.comboScale.length - 1);
    const baseFreq = this.comboScale[pitchIndex];
    const now = this.ctx.currentTime;

    // Harmonic bell partials: 1x, 2x, 3x, 4.2x
    const partials = [
      { mult: 1.0, gain: 0.28, decay: 0.45 },
      { mult: 2.0, gain: 0.15, decay: 0.35 },
      { mult: 3.0, gain: 0.08, decay: 0.25 },
      { mult: 4.2, gain: 0.04, decay: 0.20 },
    ];

    partials.forEach((p, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const delay = idx * 0.015;

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(baseFreq * p.mult, now + delay);

      gain.gain.setValueAtTime(p.gain, now + delay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + delay + p.decay);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now + delay);
      osc.stop(now + delay + p.decay + 0.02);
    });
  }

  // Staggered Hand Slot Pluck (Chimes as new 3 blocks slide in)
  public playHandSpawn(slotIndex: number) {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const freq = notes[slotIndex % notes.length];
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  private lastScoreTickTime: number = 0;

  // Soft Score Rolling Tick
  public playScoreTick() {
    if (!this.enabled) return;
    const realNow = performance.now();
    if (realNow - this.lastScoreTickTime < 45) return;
    this.lastScoreTickTime = realNow;

    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(880, now);

    gain.gain.setValueAtTime(0.03, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.025);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.03);
  }

  // Revive / Bomb Area Clear Fanfare
  public playRevive() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [392.00, 523.25, 659.25, 783.99, 1046.50];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = this.ctx.currentTime + idx * 0.07;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.22, start);
      gain.gain.exponentialRampToValueAtTime(0.005, start + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.3);
    });
  }

  // Subtle glassy preview chime when hovering a completing line
  public playPredictiveChord() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(1046.50, now + 0.06);

    gain.gain.setValueAtTime(0.045, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Celebratory Mega Combo Fanfare
  public playMegaComboFanfare() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = this.ctx.currentTime + idx * 0.055;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0.18, start);
      gain.gain.exponentialRampToValueAtTime(0.005, start + 0.35);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(start);
      osc.stop(start + 0.38);
    });
  }

  // Game Over Tone
  public playGameOver() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.linearRampToValueAtTime(70, now + 0.45);

    gain.gain.setValueAtTime(0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.45);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.46);
  }

  // Hammer Smash Impact (Heavy mechanical thud + crystal shatter)
  public playHammerSmash() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Heavy bass impact
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(180, now);
    subOsc.frequency.exponentialRampToValueAtTime(35, now + 0.16);
    subGain.gain.setValueAtTime(0.45, now);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.16);
    subOsc.connect(subGain);
    subGain.connect(this.ctx.destination);
    subOsc.start(now);
    subOsc.stop(now + 0.17);

    // Marble crack transient
    const crackOsc = this.ctx.createOscillator();
    const crackGain = this.ctx.createGain();
    crackOsc.type = 'triangle';
    crackOsc.frequency.setValueAtTime(980, now);
    crackOsc.frequency.exponentialRampToValueAtTime(220, now + 0.08);
    crackGain.gain.setValueAtTime(0.28, now);
    crackGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
    crackOsc.connect(crackGain);
    crackGain.connect(this.ctx.destination);
    crackOsc.start(now);
    crackOsc.stop(now + 0.09);
  }

  // Supersonic Rocket Swoosh & Blast
  public playRocketLaunch() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Rocket acceleration whoosh
    const whooshOsc = this.ctx.createOscillator();
    const whooshGain = this.ctx.createGain();
    whooshOsc.type = 'sawtooth';
    whooshOsc.frequency.setValueAtTime(150, now);
    whooshOsc.frequency.exponentialRampToValueAtTime(880, now + 0.22);
    whooshGain.gain.setValueAtTime(0.02, now);
    whooshGain.gain.linearRampToValueAtTime(0.32, now + 0.15);
    whooshGain.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
    whooshOsc.connect(whooshGain);
    whooshGain.connect(this.ctx.destination);
    whooshOsc.start(now);
    whooshOsc.stop(now + 0.3);

    // Boom trail
    const boomOsc = this.ctx.createOscillator();
    const boomGain = this.ctx.createGain();
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(120, now + 0.12);
    boomOsc.frequency.exponentialRampToValueAtTime(30, now + 0.35);
    boomGain.gain.setValueAtTime(0.38, now + 0.12);
    boomGain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
    boomOsc.connect(boomGain);
    boomGain.connect(this.ctx.destination);
    boomOsc.start(now + 0.12);
    boomOsc.stop(now + 0.36);
  }

  // Reroll / Shuffle Harmonic Cascade
  public playReroll() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const start = this.ctx.currentTime + idx * 0.04;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.2, start);
      gain.gain.exponentialRampToValueAtTime(0.01, start + 0.16);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(start);
      osc.stop(start + 0.18);
    });
  }

  // 1000-Point Milestone Victory Fanfare
  public playMilestoneFanfare() {
    if (!this.enabled) return;
    this.initContext();
    if (!this.ctx) return;

    // Major triumphal chord progression
    const chord1 = [523.25, 659.25, 783.99]; // C Major
    const chord2 = [587.33, 739.99, 880.00]; // D Major
    const chord3 = [659.25, 830.61, 987.77, 1318.51]; // E Major High

    const playChord = (freqs: number[], timeOffset: number, duration: number) => {
      freqs.forEach((freq) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = this.ctx.currentTime + timeOffset;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0.16 / freqs.length, start);
        gain.gain.exponentialRampToValueAtTime(0.005, start + duration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(start);
        osc.stop(start + duration + 0.02);
      });
    };

    playChord(chord1, 0.0, 0.18);
    playChord(chord2, 0.12, 0.18);
    playChord(chord3, 0.25, 0.55);
  }

  public toggle(): boolean {
    this.enabled = !this.enabled;
    return this.enabled;
  }
}

export const sound = new SoundFXEngine();
