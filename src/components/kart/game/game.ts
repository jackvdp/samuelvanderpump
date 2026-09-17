import * as THREE from "three";
import { buildAtlas } from "./textures";
import { buildTrack, type Track } from "./track";
import { buildWorld, B, type World } from "./world";
import { buildKart, disposeSharedKartGeometry, type KartModel } from "./kart-model";
import { createChannel, mergeInput, KeyboardInput, type InputChannel } from "./input";
import { GameAudio } from "./audio";
import { CHARACTERS, characterById, characterMods, type Character, type CharacterMods } from "./characters";

export type Phase = "ready" | "countdown" | "racing" | "finished";

export type RacerResult = {
  id: string;
  name: string;
  color: string;
  time: number | null;
  isPlayer: boolean;
  position: number;
};

export type GridEntry = {
  id: string;
  name: string;
  first: string;
  color: string;
  isPlayer: boolean;
};

export type HudState = {
  phase: Phase;
  countdown: number; // 3, 2, 1 → 0 shows GO, -1 hidden
  lap: number;
  totalLaps: number;
  position: number;
  racers: number;
  time: number;
  bestLap: number | null;
  lastLap: number | null;
  speed: number; // fraction of top speed
  boosting: boolean;
  drifting: boolean;
  wrongWay: boolean;
  results: RacerResult[] | null;
  grid: GridEntry[]; // everyone in the race, player included
};

type Kart = {
  character: Character;
  mods: CharacterMods;
  isPlayer: boolean;
  model: KartModel;
  x: number;
  z: number;
  heading: number;
  speed: number;
  vx: number;
  vz: number;
  steer: number;
  driftDir: number;
  driftTime: number;
  boostTime: number;
  boostEdge: boolean;
  hop: number;
  offroad: boolean;
  trackIdx: number;
  prevFrac: number;
  completed: number;
  checkpoints: number;
  finished: boolean;
  finishTime: number;
  lapStart: number;
  bestLap: number | null;
  lastLap: number | null;
  wheelSpin: number;
  wrongWayTime: number;
  wrongWay: boolean;
  bumpCooldown: number;
  visualYaw: number;
  ai: { phase: number; skill: number; stuck: number; reverse: number; input: InputChannel } | null;
};

const TOTAL_LAPS = 3;
const TOP_SPEED = 24;
const BOOST_SPEED = 34;
const BOOST_TIME = 1.5;
const ACCEL = 13;
const BRAKE = 30;
const REVERSE_MAX = 7;
const TURN_RATE = 2.3;
const GRIP = 9;
const DRIFT_GRIP = 3.4;
const OFFROAD_FACTOR = 0.55;
const KART_RADIUS = 0.72;
const STEP = 1 / 60;

// the three rivals are drawn from the rest of the cast; skill keeps the pack
// spread out whoever they turn out to be
const AI_SKILLS = [0.93, 0.9, 0.86];

function hexColor(c: number) {
  return "#" + c.toString(16).padStart(6, "0");
}

const ROAD_BLOCKS = new Set<number>([B.ROAD, B.FINISH, B.BOOST, B.ROAD_LINE, B.KERB_RED, B.KERB_WHITE]);

function wrapAngle(a: number) {
  while (a > Math.PI) a -= Math.PI * 2;
  while (a < -Math.PI) a += Math.PI * 2;
  return a;
}

class Particles {
  mesh: THREE.InstancedMesh;
  private items: {
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    life: number;
    max: number;
    size: number;
  }[] = [];
  private next = 0;
  private dummy = new THREE.Object3D();
  private geo: THREE.BoxGeometry;
  private mat: THREE.MeshLambertMaterial;

  constructor(count = 110) {
    this.geo = new THREE.BoxGeometry(1, 1, 1);
    this.mat = new THREE.MeshLambertMaterial({ color: 0xffffff });
    this.mesh = new THREE.InstancedMesh(this.geo, this.mat, count);
    this.mesh.frustumCulled = false;
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    for (let i = 0; i < count; i++) {
      this.items.push({ x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, life: 0, max: 1, size: 0.2 });
      this.dummy.position.set(0, -100, 0);
      this.dummy.scale.setScalar(0.0001);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
      this.mesh.setColorAt(i, new THREE.Color(0xffffff));
    }
  }

  spawn(x: number, y: number, z: number, color: THREE.Color, spread: number, up: number, size: number, life: number) {
    const p = this.items[this.next];
    this.next = (this.next + 1) % this.items.length;
    p.x = x;
    p.y = y;
    p.z = z;
    p.vx = (Math.random() - 0.5) * spread;
    p.vy = Math.random() * up + 0.5;
    p.vz = (Math.random() - 0.5) * spread;
    p.life = life;
    p.max = life;
    p.size = size * (0.7 + Math.random() * 0.6);
    this.mesh.setColorAt(this.next === 0 ? this.items.length - 1 : this.next - 1, color);
    if (this.mesh.instanceColor) this.mesh.instanceColor.needsUpdate = true;
  }

  update(dt: number) {
    for (let i = 0; i < this.items.length; i++) {
      const p = this.items[i];
      if (p.life <= 0) continue;
      p.life -= dt;
      p.vy -= 9 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      if (p.y < 0.05) {
        p.y = 0.05;
        p.vy = Math.abs(p.vy) * 0.3;
        p.vx *= 0.8;
        p.vz *= 0.8;
      }
      const s = p.life <= 0 ? 0.0001 : p.size * Math.min(1, p.life / p.max + 0.3);
      this.dummy.position.set(p.x, p.y, p.z);
      this.dummy.rotation.set(p.life * 3, p.life * 2, 0);
      this.dummy.scale.setScalar(s);
      this.dummy.updateMatrix();
      this.mesh.setMatrixAt(i, this.dummy.matrix);
    }
    this.mesh.instanceMatrix.needsUpdate = true;
  }

  dispose() {
    this.geo.dispose();
    this.mat.dispose();
  }
}

export type GameOptions = {
  canvas: HTMLCanvasElement;
  onHud: (state: HudState) => void;
  touch?: InputChannel; // shared with the on-screen controls
  character?: string; // roster id from characters.ts; falls back to the default
};

export class KartGame {
  readonly touch: InputChannel;
  private merged = createChannel();
  private keyboard: KeyboardInput;
  private audio = new GameAudio();

  private renderer: THREE.WebGLRenderer;
  private scene = new THREE.Scene();
  private camera: THREE.PerspectiveCamera;
  private atlas: THREE.Texture;
  private track: Track;
  private world: World;
  private karts: Kart[] = [];
  private player!: Kart; // assigned by buildRacers() in the constructor
  private playerCharacter: Character;
  private particles = new Particles();
  private clouds: THREE.Mesh[] = [];
  private cloudGeo = new THREE.BoxGeometry(1, 1, 1);
  private cloudMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.92 });
  private sunMesh: THREE.Mesh;

  private phase: Phase = "ready";
  private countdownT = 0;
  private raceTime = 0;
  private goShown = 0;
  private camPos = new THREE.Vector3();
  private camLook = new THREE.Vector3();
  private camInit = false;
  private orbit = 0;
  private fov = 65;

  private raf = 0;
  private last = 0;
  private acc = 0;
  private hudTimer = 0;
  private disposed = false;
  private onHud: (state: HudState) => void;
  private canvas: HTMLCanvasElement;

  private dustGrey = new THREE.Color(0x9a9aa0);
  private dustGrass = new THREE.Color(0x6aa83e);
  private dustSand = new THREE.Color(0xdbcfa3);
  private dustBoost = new THREE.Color(0xffb020);

  constructor(opts: GameOptions) {
    this.canvas = opts.canvas;
    this.onHud = opts.onHud;
    this.touch = opts.touch ?? createChannel();
    this.keyboard = new KeyboardInput((action) => {
      if (action === "start" && this.phase === "ready") this.start();
      else if (action === "start" && this.phase === "finished") this.restart();
      else if (action === "restart" && this.phase !== "ready") this.restart();
    });

    this.renderer = new THREE.WebGLRenderer({
      canvas: opts.canvas,
      antialias: false,
      powerPreference: "high-performance",
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    this.scene.background = new THREE.Color(0x7ec0ff);
    this.scene.fog = new THREE.Fog(0x7ec0ff, 55, 130);
    this.camera = new THREE.PerspectiveCamera(65, 1, 0.3, 240);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x5d8a3a, 1.6);
    this.scene.add(hemi);
    const sun = new THREE.DirectionalLight(0xfff4d6, 1.7);
    sun.position.set(60, 100, -40);
    this.scene.add(sun);

    this.atlas = buildAtlas();
    this.track = buildTrack();
    this.world = buildWorld(this.track, this.atlas);
    this.scene.add(this.world.group);
    this.scene.add(this.particles.mesh);

    // blocky clouds drifting overhead
    for (let i = 0; i < 16; i++) {
      const m = new THREE.Mesh(this.cloudGeo, this.cloudMat);
      m.scale.set(6 + Math.random() * 12, 1.2, 4 + Math.random() * 8);
      m.position.set((Math.random() - 0.5) * 220, 24 + Math.random() * 8, (Math.random() - 0.5) * 220);
      this.scene.add(m);
      this.clouds.push(m);
    }
    const sunGeo = new THREE.PlaneGeometry(26, 26);
    this.sunMesh = new THREE.Mesh(sunGeo, new THREE.MeshBasicMaterial({ color: 0xfff6b0, fog: false }));
    this.sunMesh.position.set(110, 120, -150);
    this.sunMesh.lookAt(0, 0, 0);
    this.scene.add(this.sunMesh);

    // racers
    this.playerCharacter = characterById(opts.character);
    this.buildRacers();

    this.keyboard.attach();
    document.addEventListener("visibilitychange", this.onVisibility);
    this.resize();
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
    this.emitHud();
  }

  // ---------------------------------------------------------------- public

  start() {
    if (this.phase !== "ready") return;
    this.audio.init();
    this.audio.resume();
    this.beginCountdown();
  }

  restart() {
    this.placeOnGrid();
    this.audio.init();
    this.audio.resume();
    this.beginCountdown();
  }

  setMuted(m: boolean) {
    this.audio.setMuted(m);
  }

  // Swap the player's driver while still in the lobby. The rivals are
  // reshuffled from the rest of the cast at the same time.
  selectCharacter(id: string) {
    if (this.phase !== "ready") return;
    const c = characterById(id);
    if (c.id === this.playerCharacter.id) return;
    this.playerCharacter = c;
    this.buildRacers();
    this.emitHud();
  }

  get characterId() {
    return this.playerCharacter.id;
  }

  // back to the driver-select screen after a race
  backToLobby() {
    if (this.phase === "ready") return;
    this.phase = "ready";
    this.raceTime = 0;
    this.goShown = 0;
    this.placeOnGrid();
    this.emitHud();
  }

  resize() {
    const parent = this.canvas.parentElement;
    const w = Math.max(1, parent ? parent.clientWidth : window.innerWidth);
    const h = Math.max(1, parent ? parent.clientHeight : window.innerHeight);
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    this.disposed = true;
    cancelAnimationFrame(this.raf);
    this.keyboard.detach();
    document.removeEventListener("visibilitychange", this.onVisibility);
    this.audio.dispose();
    this.karts.forEach((k) => k.model.dispose());
    disposeSharedKartGeometry();
    this.world.dispose();
    this.particles.dispose();
    this.cloudGeo.dispose();
    this.cloudMat.dispose();
    (this.sunMesh.material as THREE.Material).dispose();
    this.sunMesh.geometry.dispose();
    this.atlas.dispose();
    this.renderer.dispose();
  }

  // --------------------------------------------------------------- private

  private onVisibility = () => {
    if (document.hidden) this.audio.suspend();
    else {
      this.last = performance.now();
      this.audio.resume();
    }
  };

  private makeKart(character: Character, isPlayer: boolean, skill: number): Kart {
    const model = buildKart(character, this.atlas);
    this.scene.add(model.root);
    return {
      character,
      mods: characterMods(character),
      isPlayer,
      model,
      x: 0,
      z: 0,
      heading: 0,
      speed: 0,
      vx: 0,
      vz: 0,
      steer: 0,
      driftDir: 0,
      driftTime: 0,
      boostTime: 0,
      boostEdge: false,
      hop: 0,
      offroad: false,
      trackIdx: 0,
      prevFrac: 0,
      completed: -1,
      checkpoints: 7,
      finished: false,
      finishTime: 0,
      lapStart: 0,
      bestLap: null,
      lastLap: null,
      wheelSpin: 0,
      wrongWayTime: 0,
      wrongWay: false,
      bumpCooldown: 0,
      visualYaw: 0,
      ai: isPlayer
        ? null
        : { phase: Math.random() * Math.PI * 2, skill, stuck: 0, reverse: 0, input: createChannel() },
    };
  }

  private buildRacers() {
    for (const k of this.karts) {
      this.scene.remove(k.model.root);
      k.model.dispose();
    }
    this.karts = [];
    const pool = CHARACTERS.filter((c) => c.id !== this.playerCharacter.id);
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    AI_SKILLS.forEach((skill, i) => this.karts.push(this.makeKart(pool[i], false, skill)));
    this.player = this.makeKart(this.playerCharacter, true, 1);
    this.karts.push(this.player);
    this.placeOnGrid();
  }

  private beginCountdown() {
    this.phase = "countdown";
    this.countdownT = 0;
    this.raceTime = 0;
    this.goShown = 0;
    this.audio.countdownTick();
    this.emitHud();
  }

  private placeOnGrid() {
    const n = this.track.count;
    const order = [...this.karts]; // AI first, player last on the grid
    order.forEach((k, i) => {
      const row = Math.floor(i / 2);
      const side = i % 2 === 0 ? -1 : 1;
      const idx = (n - 8 - row * 7 - (i % 2) * 2 + n) % n;
      const s = this.track.samples[idx];
      const nx = -s.tz;
      const nz = s.tx;
      k.x = s.x + nx * side * 1.8;
      k.z = s.z + nz * side * 1.8;
      k.heading = Math.atan2(s.tx, s.tz);
      k.speed = 0;
      k.vx = 0;
      k.vz = 0;
      k.steer = 0;
      k.driftDir = 0;
      k.driftTime = 0;
      k.boostTime = 0;
      k.boostEdge = false;
      k.hop = 0;
      k.trackIdx = idx;
      k.prevFrac = idx / n;
      k.completed = -1;
      k.checkpoints = 7;
      k.finished = false;
      k.finishTime = 0;
      k.lapStart = 0;
      k.bestLap = null;
      k.lastLap = null;
      k.wrongWay = false;
      k.wrongWayTime = 0;
      k.visualYaw = 0;
      if (k.ai) {
        k.ai.stuck = 0;
        k.ai.reverse = 0;
      }
      this.syncModel(k);
    });
    this.camInit = false;
  }

  private frame = (now: number) => {
    if (this.disposed) return;
    this.raf = requestAnimationFrame(this.frame);
    let dt = (now - this.last) / 1000;
    this.last = now;
    if (dt > 0.25) dt = 0.25;
    if (document.hidden) return;

    this.acc += dt;
    let steps = 0;
    while (this.acc >= STEP && steps < 5) {
      this.step(STEP);
      this.acc -= STEP;
      steps++;
    }
    if (steps === 5) this.acc = 0;

    this.updateVisuals(dt);
    this.updateCamera(dt);
    this.renderer.render(this.scene, this.camera);

    this.hudTimer += dt;
    if (this.hudTimer > 0.1) {
      this.hudTimer = 0;
      this.emitHud();
    }
  };

  private step(dt: number) {
    if (this.phase === "countdown") {
      const prev = Math.ceil(3 - this.countdownT);
      this.countdownT += dt;
      const cur = Math.ceil(3 - this.countdownT);
      if (cur !== prev && cur > 0) this.audio.countdownTick();
      if (this.countdownT >= 3) {
        this.phase = "racing";
        this.goShown = 0.9;
        this.raceTime = 0;
        this.karts.forEach((k) => (k.lapStart = 0));
        this.audio.go();
        this.emitHud();
      }
    }
    const racing = this.phase === "racing" || this.phase === "finished";
    if (racing) this.raceTime += dt;
    if (this.goShown > 0) this.goShown -= dt;

    mergeInput(this.keyboard.channel, this.touch, this.merged);

    for (const k of this.karts) {
      let input: InputChannel;
      if (k.isPlayer) input = this.merged;
      else {
        this.driveAI(k, dt);
        input = k.ai!.input;
      }
      if (!racing) {
        // engines revving on the grid but no movement
        input = { steer: input.steer, throttle: 0, brake: 0, drift: false };
      }
      this.stepKart(k, input, dt);
    }
    this.collideKarts();
    for (const k of this.karts) this.updateProgress(k);
    this.particles.update(dt);

    if (this.player.isPlayer) {
      const spd = Math.min(1.3, Math.abs(this.player.speed) / TOP_SPEED);
      this.audio.engine(racing ? spd : 0.08, this.merged.throttle, this.player.boostTime > 0);
    }
  }

  private stepKart(k: Kart, input: InputChannel, dt: number) {
    const top = this.world.topAt(k.x, k.z);
    const onRoad = ROAD_BLOCKS.has(top);
    k.offroad = !onRoad;

    if (top === B.BOOST) {
      if (!k.boostEdge) {
        k.boostTime = BOOST_TIME;
        k.boostEdge = true;
        if (k.isPlayer) this.audio.boost();
      }
    } else k.boostEdge = false;

    const boosting = k.boostTime > 0;
    let maxSpeed = (boosting ? BOOST_SPEED : TOP_SPEED) * k.mods.topSpeed * (k.offroad ? OFFROAD_FACTOR : 1);
    if (k.ai) maxSpeed *= this.aiSpeedFactor(k);

    if (boosting) {
      k.boostTime -= dt;
      k.speed += (maxSpeed - k.speed) * Math.min(1, 5 * dt);
    } else if (input.throttle > 0 && k.speed < maxSpeed) {
      k.speed = Math.min(maxSpeed, k.speed + ACCEL * k.mods.accel * input.throttle * dt);
    }
    if (input.brake > 0) {
      if (k.speed > 0.4) k.speed -= BRAKE * input.brake * dt;
      else k.speed = Math.max(-REVERSE_MAX, k.speed - 7 * dt);
    }
    if (input.throttle === 0 && input.brake === 0 && !boosting) {
      const dec = Math.min(Math.abs(k.speed), (k.offroad ? 9 : 5) * dt);
      k.speed -= Math.sign(k.speed) * dec;
    }
    if (k.speed > maxSpeed) k.speed += (maxSpeed - k.speed) * Math.min(1, (k.offroad ? 5 : 2.5) * dt);

    // steering
    k.steer += (input.steer - k.steer) * Math.min(1, 14 * dt);
    const absSpeed = Math.abs(k.speed);
    if (k.driftDir === 0 && input.drift && absSpeed > 8 && Math.abs(k.steer) > 0.3 && !k.offroad) {
      k.driftDir = Math.sign(k.steer);
      k.driftTime = 0;
      k.hop = 1;
    }
    if (k.driftDir !== 0) {
      if (!input.drift || absSpeed < 5) {
        if (k.driftTime > 0.85) {
          k.boostTime = Math.max(k.boostTime, 0.75);
          k.speed += 4;
          if (k.isPlayer) this.audio.boost();
        }
        k.driftDir = 0;
        k.driftTime = 0;
      } else k.driftTime += dt;
    }
    const speedFactor = Math.min(1, absSpeed / 7) / (1 + absSpeed / 40);
    const turnRate = TURN_RATE * k.mods.turn;
    let turn = k.steer * turnRate * speedFactor;
    if (k.driftDir !== 0) {
      const into = (k.steer * k.driftDir + 1) / 2; // 0 = counter-steering, 1 = full into the drift
      turn = k.driftDir * turnRate * speedFactor * (0.9 + 0.9 * into);
    }
    if (k.speed < 0) turn = -turn;
    k.heading -= turn * dt;

    const fx = Math.sin(k.heading);
    const fz = Math.cos(k.heading);
    const grip = k.driftDir !== 0 ? DRIFT_GRIP : k.offroad ? 5 : GRIP;
    const blend = 1 - Math.exp(-grip * dt);
    k.vx += (fx * k.speed - k.vx) * blend;
    k.vz += (fz * k.speed - k.vz) * blend;

    k.bumpCooldown -= dt;
    const blockedX = !this.tryMove(k, k.vx * dt, 0);
    const blockedZ = !this.tryMove(k, 0, k.vz * dt);
    if (blockedX || blockedZ) {
      if (blockedX) k.vx *= -0.3;
      if (blockedZ) k.vz *= -0.3;
      if (Math.abs(k.speed) > 3 && k.bumpCooldown <= 0) {
        k.bumpCooldown = 0.35;
        if (k.isPlayer) this.audio.bump();
        for (let i = 0; i < 6; i++)
          this.particles.spawn(k.x + fx * 0.8, 0.4, k.z + fz * 0.8, this.dustGrey, 4, 3, 0.2, 0.6);
      }
      k.speed *= 0.45;
    }

    // dust
    if (absSpeed > 4) {
      const rate = k.driftDir !== 0 ? 0.35 : k.offroad ? 0.3 : 0;
      if (rate > 0 && Math.random() < rate) {
        const color = k.offroad ? (top === B.SAND ? this.dustSand : this.dustGrass) : this.dustGrey;
        this.particles.spawn(k.x - fx * 0.8 + (Math.random() - 0.5), 0.15, k.z - fz * 0.8 + (Math.random() - 0.5), color, 3, 2.5, 0.22, 0.7);
      }
      if (boosting && Math.random() < 0.6) {
        this.particles.spawn(k.x - fx * 1.4, 0.35, k.z - fz * 1.4, this.dustBoost, 2, 1.5, 0.16, 0.35);
      }
    }
    k.wheelSpin += (k.speed / 0.25) * dt;
    k.hop = Math.max(0, k.hop - dt * 4);
  }

  private canStand(x: number, z: number) {
    const r = KART_RADIUS * 0.8;
    return (
      this.world.isDrivable(x + r, z + r) &&
      this.world.isDrivable(x - r, z + r) &&
      this.world.isDrivable(x + r, z - r) &&
      this.world.isDrivable(x - r, z - r)
    );
  }

  private tryMove(k: Kart, dx: number, dz: number) {
    const nx = k.x + dx;
    const nz = k.z + dz;
    if (this.canStand(nx, nz)) {
      k.x = nx;
      k.z = nz;
      return true;
    }
    return false;
  }

  private collideKarts() {
    const minD = KART_RADIUS * 2;
    for (let i = 0; i < this.karts.length; i++) {
      for (let j = i + 1; j < this.karts.length; j++) {
        const a = this.karts[i];
        const b = this.karts[j];
        const dx = b.x - a.x;
        const dz = b.z - a.z;
        const d = Math.hypot(dx, dz);
        if (d >= minD || d < 1e-4) continue;
        const nx = dx / d;
        const nz = dz / d;
        const push = (minD - d) / 2;
        this.tryMove(a, -nx * push, -nz * push);
        this.tryMove(b, nx * push, nz * push);
        const rv = (a.vx - b.vx) * nx + (a.vz - b.vz) * nz;
        if (rv > 0) {
          const imp = rv * 0.6;
          a.vx -= imp * nx;
          a.vz -= imp * nz;
          b.vx += imp * nx;
          b.vz += imp * nz;
          for (const k of [a, b]) {
            const fx = Math.sin(k.heading);
            const fz = Math.cos(k.heading);
            k.speed = Math.min(k.speed, k.vx * fx + k.vz * fz);
          }
          if ((a.isPlayer || b.isPlayer) && this.player.bumpCooldown <= 0 && rv > 4) {
            this.player.bumpCooldown = 0.3;
            this.audio.bump();
          }
        }
      }
    }
  }

  private updateProgress(k: Kart) {
    const n = this.track.count;
    k.trackIdx = this.track.nearestIndex(k.x, k.z, k.trackIdx);
    const frac = k.trackIdx / n;
    if (frac > 0.25 && frac < 0.5) k.checkpoints |= 1;
    if (frac > 0.5 && frac < 0.75 && k.checkpoints & 1) k.checkpoints |= 2;
    if (frac > 0.75 && k.checkpoints & 2) k.checkpoints |= 4;

    const racing = this.phase === "racing" || this.phase === "finished";
    if (racing && !k.finished) {
      if (k.prevFrac > 0.85 && frac < 0.15) {
        if (k.checkpoints === 7) {
          k.completed += 1;
          k.checkpoints = 0;
          if (k.completed > 0) {
            const lapTime = this.raceTime - k.lapStart;
            k.lastLap = lapTime;
            k.bestLap = k.bestLap === null ? lapTime : Math.min(k.bestLap, lapTime);
            if (k.isPlayer) this.audio.lap();
          }
          k.lapStart = this.raceTime;
          if (k.completed >= TOTAL_LAPS) {
            k.finished = true;
            k.finishTime = this.raceTime;
            if (k.isPlayer) {
              this.phase = "finished";
              this.audio.finish();
              this.emitHud();
            }
          }
        }
      } else if (k.prevFrac < 0.15 && frac > 0.85) {
        k.completed -= 1;
        k.checkpoints = 7;
      }
    }
    k.prevFrac = frac;

    // wrong-way detection
    const s = this.track.samples[k.trackIdx];
    const along = k.vx * s.tx + k.vz * s.tz;
    if (along < -2.5) k.wrongWayTime += STEP;
    else if (along > 0.5) k.wrongWayTime = 0;
    k.wrongWay = k.wrongWayTime > 1;
  }

  private progressOf(k: Kart) {
    return k.completed + k.trackIdx / this.track.count;
  }

  private rankKey(k: Kart) {
    return k.finished ? 1e6 - k.finishTime : this.progressOf(k);
  }

  private aiSpeedFactor(k: Kart) {
    const ai = k.ai!;
    const gap = this.progressOf(this.player) - this.progressOf(k);
    const band = Math.max(-0.08, Math.min(0.1, gap * 0.14));
    return ai.skill + band;
  }

  private driveAI(k: Kart, dt: number) {
    const ai = k.ai!;
    const inp = ai.input;
    const n = this.track.count;
    const absSpeed = Math.abs(k.speed);

    if (this.phase === "racing" || this.phase === "finished") {
      if (absSpeed < 1.2) ai.stuck += dt;
      else ai.stuck = 0;
      if (ai.stuck > 1.6 && ai.reverse <= 0) {
        ai.reverse = 1.1;
        ai.stuck = 0;
      }
    }
    if (ai.reverse > 0) {
      ai.reverse -= dt;
      inp.throttle = 0;
      inp.brake = 1;
      inp.steer = -k.steer || 1;
      inp.drift = false;
      return;
    }

    const lookahead = Math.round((5 + absSpeed * 0.45) * 2);
    const target = this.track.samples[(k.trackIdx + lookahead) % n];
    const lane = 2.2 * Math.sin(this.raceTime * 0.3 + ai.phase);
    const tx = target.x - target.tz * lane;
    const tz = target.z + target.tx * lane;
    const desired = Math.atan2(tx - k.x, tz - k.z);
    const diff = wrapAngle(desired - k.heading);
    inp.steer = Math.max(-1, Math.min(1, -diff * 2.6));
    inp.throttle = 1;
    inp.brake = Math.abs(diff) > 1.1 && absSpeed > 13 ? 1 : 0;
    inp.drift = ai.skill > 0.9 && Math.abs(diff) > 0.45 && absSpeed > 12 && !k.offroad;
  }

  private syncModel(k: Kart) {
    k.model.root.position.set(k.x, 0, k.z);
    k.model.root.rotation.y = k.heading;
  }

  private updateVisuals(dt: number) {
    for (const k of this.karts) {
      this.syncModel(k);
      const m = k.model;
      const sf = Math.min(1, Math.abs(k.speed) / 10);
      const targetYaw = k.driftDir !== 0 ? -k.driftDir * 0.32 : 0;
      k.visualYaw += (targetYaw - k.visualYaw) * Math.min(1, 8 * dt);
      m.body.rotation.y = k.visualYaw;
      m.body.rotation.z = k.steer * 0.09 * sf + (k.driftDir !== 0 ? k.driftDir * 0.06 : 0);
      m.body.position.y = k.hop > 0 ? Math.sin(k.hop * Math.PI) * 0.28 : 0;
      for (const w of m.wheels) w.rotation.x = k.wheelSpin;
      for (const p of m.frontPivots) p.rotation.y = -k.steer * 0.45;
      const boosting = k.boostTime > 0;
      for (const f of m.boostFlames) {
        f.visible = boosting;
        if (boosting) f.scale.set(1, 1, 0.7 + Math.random() * 0.8);
      }
    }
    for (const c of this.clouds) {
      c.position.x += dt * 1.2;
      if (c.position.x > 120) c.position.x = -120;
    }
  }

  private updateCamera(dt: number) {
    const k = this.player;
    const portrait = this.camera.aspect < 1;
    const baseFov = portrait ? 82 : 64;
    const targetFov = baseFov + (k.boostTime > 0 ? 12 : 0) + Math.min(1, Math.abs(k.speed) / TOP_SPEED) * 5;
    this.fov += (targetFov - this.fov) * Math.min(1, 4 * dt);
    if (Math.abs(this.camera.fov - this.fov) > 0.05) {
      this.camera.fov = this.fov;
      this.camera.updateProjectionMatrix();
    }

    let desired: THREE.Vector3;
    let look: THREE.Vector3;
    if (this.phase === "ready") {
      this.orbit += dt * 0.25;
      desired = new THREE.Vector3(k.x + Math.sin(this.orbit) * 8, 3.2, k.z + Math.cos(this.orbit) * 8);
      look = new THREE.Vector3(k.x, 0.9, k.z);
    } else {
      const fx = Math.sin(k.heading);
      const fz = Math.cos(k.heading);
      const back = portrait ? 7.5 : 6.5;
      const height = portrait ? 3.4 : 2.9;
      desired = new THREE.Vector3(k.x - fx * back, height, k.z - fz * back);
      look = new THREE.Vector3(k.x + fx * 4, 0.9, k.z + fz * 4);
    }
    if (!this.camInit) {
      this.camPos.copy(desired);
      this.camLook.copy(look);
      this.camInit = true;
    } else {
      const f = 1 - Math.exp(-dt * (this.phase === "ready" ? 2 : 6));
      this.camPos.lerp(desired, f);
      this.camLook.lerp(look, 1 - Math.exp(-dt * 10));
    }
    this.camera.position.copy(this.camPos);
    this.camera.lookAt(this.camLook);
  }

  private emitHud() {
    const p = this.player;
    const ranked = [...this.karts].sort((a, b) => this.rankKey(b) - this.rankKey(a));
    const position = ranked.indexOf(p) + 1;
    let results: RacerResult[] | null = null;
    if (this.phase === "finished") {
      results = ranked.map((k, i) => ({
        id: k.character.id,
        name: k.character.name,
        color: hexColor(k.character.color),
        time: k.finished ? k.finishTime : null,
        isPlayer: k.isPlayer,
        position: i + 1,
      }));
    }
    const grid: GridEntry[] = this.karts.map((k) => ({
      id: k.character.id,
      name: k.character.name,
      first: k.character.first,
      color: hexColor(k.character.color),
      isPlayer: k.isPlayer,
    }));
    let countdown = -1;
    if (this.phase === "countdown") countdown = Math.max(1, Math.ceil(3 - this.countdownT));
    else if (this.goShown > 0) countdown = 0;

    this.onHud({
      phase: this.phase,
      countdown,
      lap: Math.min(TOTAL_LAPS, Math.max(1, p.completed + 1)),
      totalLaps: TOTAL_LAPS,
      position,
      racers: this.karts.length,
      time: p.finished ? p.finishTime : this.raceTime,
      bestLap: p.bestLap,
      lastLap: p.lastLap,
      speed: Math.abs(p.speed) / TOP_SPEED,
      boosting: p.boostTime > 0,
      drifting: p.driftDir !== 0,
      wrongWay: p.wrongWay && this.phase === "racing",
      results,
      grid,
    });
  }
}
