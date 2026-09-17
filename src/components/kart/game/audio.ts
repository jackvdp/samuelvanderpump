// Small Web Audio synth: engine hum that follows speed, plus a few cues.
// Everything is guarded so a missing/blocked AudioContext never breaks play.
export class GameAudio {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private engineGain: GainNode | null = null;
  private osc1: OscillatorNode | null = null;
  private osc2: OscillatorNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private muted = false;
  private running = false;

  // must be called from a user gesture
  init() {
    if (this.ctx) return;
    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      const ctx = new Ctor();
      this.ctx = ctx;
      const master = ctx.createGain();
      master.gain.value = this.muted ? 0 : 0.5;
      master.connect(ctx.destination);
      this.master = master;

      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 500;
      filter.Q.value = 2;
      filter.connect(master);
      this.filter = filter;

      const engineGain = ctx.createGain();
      engineGain.gain.value = 0;
      engineGain.connect(filter);
      this.engineGain = engineGain;

      const osc1 = ctx.createOscillator();
      osc1.type = "sawtooth";
      osc1.frequency.value = 55;
      osc1.connect(engineGain);
      osc1.start();
      const osc2 = ctx.createOscillator();
      osc2.type = "square";
      osc2.frequency.value = 27.5;
      const g2 = ctx.createGain();
      g2.gain.value = 0.4;
      osc2.connect(g2);
      g2.connect(engineGain);
      osc2.start();
      this.osc1 = osc1;
      this.osc2 = osc2;
      this.running = true;
    } catch {
      this.ctx = null;
    }
  }

  resume() {
    this.ctx?.resume().catch(() => {});
  }

  suspend() {
    this.ctx?.suspend().catch(() => {});
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(m ? 0 : 0.5, this.ctx.currentTime, 0.05);
    }
  }

  isMuted() {
    return this.muted;
  }

  // speed 0..1 of top speed, throttle 0..1
  engine(speed: number, throttle: number, boosting: boolean) {
    if (!this.running || !this.ctx || !this.osc1 || !this.osc2 || !this.engineGain || !this.filter) return;
    const t = this.ctx.currentTime;
    const base = 48 + speed * 150 + (boosting ? 40 : 0);
    this.osc1.frequency.setTargetAtTime(base, t, 0.08);
    this.osc2.frequency.setTargetAtTime(base / 2, t, 0.08);
    this.engineGain.gain.setTargetAtTime(0.05 + speed * 0.09 + throttle * 0.03, t, 0.1);
    this.filter.frequency.setTargetAtTime(350 + speed * 900 + throttle * 300, t, 0.1);
  }

  private blip(freq: number, duration: number, type: OscillatorType = "square", gain = 0.18) {
    if (!this.ctx || !this.master) return;
    try {
      const ctx = this.ctx;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.value = freq;
      g.gain.setValueAtTime(gain, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(g);
      g.connect(this.master);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // ignore
    }
  }

  countdownTick() {
    this.blip(440, 0.18);
  }

  go() {
    this.blip(880, 0.5);
  }

  boost() {
    if (!this.ctx || !this.master) return;
    try {
      const ctx = this.ctx;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.35);
      g.gain.setValueAtTime(0.14, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
      osc.connect(g);
      g.connect(this.master);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // ignore
    }
  }

  bump() {
    this.blip(90, 0.12, "triangle", 0.25);
  }

  lap() {
    this.blip(660, 0.12);
    setTimeout(() => this.blip(990, 0.2), 120);
  }

  finish() {
    [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.blip(f, 0.3, "square", 0.16), i * 140));
  }

  dispose() {
    try {
      this.osc1?.stop();
      this.osc2?.stop();
      this.ctx?.close();
    } catch {
      // ignore
    }
    this.ctx = null;
    this.running = false;
  }
}
