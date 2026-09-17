import * as THREE from "three";
import { T, tileUV, mulberry32 } from "./textures";
import { BOOST_PADS, type Track } from "./track";

export const B = {
  AIR: 0,
  GRASS: 1,
  DIRT: 2,
  STONE: 3,
  ROAD: 4,
  KERB_RED: 5,
  KERB_WHITE: 6,
  SAND: 7,
  WATER: 8,
  LOG: 9,
  LEAVES: 10,
  FINISH: 11,
  BOOST: 12,
  PLANKS: 13,
  BEDROCK: 14,
  FLOWER: 15,
  ROAD_LINE: 16,
  HOUSE_WHITE: 17,
  HOUSE_PINK: 18,
  HOUSE_BLUE: 19,
  HOUSE_YELLOW: 20,
  HOUSE_MINT: 21,
  WINDOW: 22,
  DOOR: 23,
  ROOF: 24,
} as const;

// [top, bottom, side] atlas tiles per block id
const FACE_TILES: Record<number, [number, number, number]> = {
  [B.GRASS]: [T.GRASS_TOP, T.DIRT, T.GRASS_SIDE],
  [B.DIRT]: [T.DIRT, T.DIRT, T.DIRT],
  [B.STONE]: [T.STONE, T.STONE, T.STONE],
  [B.ROAD]: [T.ROAD, T.STONE, T.STONE],
  [B.KERB_RED]: [T.KERB_RED, T.STONE, T.KERB_RED],
  [B.KERB_WHITE]: [T.KERB_WHITE, T.STONE, T.KERB_WHITE],
  [B.SAND]: [T.SAND, T.SAND, T.SAND],
  [B.WATER]: [T.WATER, T.WATER, T.WATER],
  [B.LOG]: [T.LOG_TOP, T.LOG_TOP, T.LOG_SIDE],
  [B.LEAVES]: [T.LEAVES, T.LEAVES, T.LEAVES],
  [B.FINISH]: [T.FINISH, T.FINISH, T.FINISH],
  [B.BOOST]: [T.BOOST, T.STONE, T.STONE],
  [B.PLANKS]: [T.PLANKS, T.PLANKS, T.PLANKS],
  [B.BEDROCK]: [T.BEDROCK, T.BEDROCK, T.BEDROCK],
  [B.FLOWER]: [T.FLOWER, T.DIRT, T.GRASS_SIDE],
  [B.ROAD_LINE]: [T.ROAD_LINE, T.STONE, T.STONE],
  [B.HOUSE_WHITE]: [T.STUCCO_WHITE, T.STUCCO_WHITE, T.STUCCO_WHITE],
  [B.HOUSE_PINK]: [T.STUCCO_PINK, T.STUCCO_PINK, T.STUCCO_PINK],
  [B.HOUSE_BLUE]: [T.STUCCO_BLUE, T.STUCCO_BLUE, T.STUCCO_BLUE],
  [B.HOUSE_YELLOW]: [T.STUCCO_YELLOW, T.STUCCO_YELLOW, T.STUCCO_YELLOW],
  [B.HOUSE_MINT]: [T.STUCCO_MINT, T.STUCCO_MINT, T.STUCCO_MINT],
  [B.WINDOW]: [T.STUCCO_WHITE, T.STUCCO_WHITE, T.WINDOW],
  [B.DOOR]: [T.STUCCO_WHITE, T.STUCCO_WHITE, T.DOOR],
  [B.ROOF]: [T.ROOF, T.ROOF, T.ROOF],
};

export const WORLD_SIZE = 144;
const Y_MIN = -4;
const Y_SIZE = 18;
const CHUNK = 36;

export type World = {
  size: number;
  x0: number;
  z0: number;
  surface: Int8Array; // surface height per column (0 = flat race level)
  topBlock: Uint8Array;
  drivable: Uint8Array;
  group: THREE.Group;
  columnIndex: (x: number, z: number) => number;
  isDrivable: (x: number, z: number) => boolean;
  topAt: (x: number, z: number) => number;
  dispose: () => void;
};

function smoothstep(t: number) {
  const x = t < 0 ? 0 : t > 1 ? 1 : t;
  return x * x * (3 - 2 * x);
}

function hash2(x: number, z: number, seed: number) {
  let h = (x * 374761393 + z * 668265263 + seed * 1274126177) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

// two-octave value noise in [-1, 1]
function valueNoise(x: number, z: number, seed: number) {
  let total = 0;
  let amp = 1;
  let freq = 1 / 11;
  let norm = 0;
  for (let o = 0; o < 2; o++) {
    const fx = x * freq;
    const fz = z * freq;
    const ix = Math.floor(fx);
    const iz = Math.floor(fz);
    const tx = smoothstep(fx - ix);
    const tz = smoothstep(fz - iz);
    const a = hash2(ix, iz, seed + o);
    const b = hash2(ix + 1, iz, seed + o);
    const c = hash2(ix, iz + 1, seed + o);
    const d = hash2(ix + 1, iz + 1, seed + o);
    const v = (a * (1 - tx) + b * tx) * (1 - tz) + (c * (1 - tx) + d * tx) * tz;
    total += (v * 2 - 1) * amp;
    norm += amp;
    amp *= 0.45;
    freq *= 2.3;
  }
  return total / norm;
}

export function buildWorld(track: Track, atlas: THREE.Texture): World {
  const size = WORLD_SIZE;
  const x0 = -size / 2;
  const z0 = -size / 2;
  const halfW = track.halfWidth;
  const cols = size * size;

  const voxels = new Uint8Array(size * Y_SIZE * size);
  const vIndex = (gx: number, y: number, gz: number) =>
    ((gx * Y_SIZE + (y - Y_MIN)) * size + gz);
  const get = (gx: number, y: number, gz: number) => {
    if (gx < 0 || gz < 0 || gx >= size || gz >= size) return B.STONE; // world edge: solid
    if (y < Y_MIN) return B.BEDROCK;
    if (y >= Y_MIN + Y_SIZE) return B.AIR;
    return voxels[vIndex(gx, y, gz)];
  };
  const set = (gx: number, y: number, gz: number, b: number) => {
    if (gx < 0 || gz < 0 || gx >= size || gz >= size) return;
    if (y < Y_MIN || y >= Y_MIN + Y_SIZE) return;
    voxels[vIndex(gx, y, gz)] = b;
  };

  // --- distance field to the track centre line ---
  const dist = new Float32Array(cols).fill(Infinity);
  const nearIdx = new Int32Array(cols);
  const R = halfW + 3;
  for (let i = 0; i < track.count; i++) {
    const s = track.samples[i];
    const gxc = s.x - x0;
    const gzc = s.z - z0;
    const gxa = Math.max(0, Math.floor(gxc - R));
    const gxb = Math.min(size - 1, Math.ceil(gxc + R));
    const gza = Math.max(0, Math.floor(gzc - R));
    const gzb = Math.min(size - 1, Math.ceil(gzc + R));
    for (let gx = gxa; gx <= gxb; gx++) {
      for (let gz = gza; gz <= gzb; gz++) {
        const dx = gx + 0.5 - gxc;
        const dz = gz + 0.5 - gzc;
        const d = Math.sqrt(dx * dx + dz * dz);
        const ci = gx * size + gz;
        if (d < dist[ci]) {
          dist[ci] = d;
          nearIdx[ci] = i;
        }
      }
    }
  }

  const boostS = BOOST_PADS.map((f) => f * track.length);

  // --- classify columns ---
  const surface = new Int8Array(cols);
  const topBlock = new Uint8Array(cols);
  const drivable = new Uint8Array(cols);
  const topRot = new Uint8Array(cols);
  const water = new Uint8Array(cols);

  for (let gx = 0; gx < size; gx++) {
    for (let gz = 0; gz < size; gz++) {
      const ci = gx * size + gz;
      const d = dist[ci];
      const wx = gx + x0 + 0.5;
      const wz = gz + z0 + 0.5;
      let top: number = B.GRASS;
      let h = 0;
      if (d < halfW) {
        const sample = track.samples[nearIdx[ci]];
        top = B.ROAD;
        if (nearIdx[ci] < 4) top = B.FINISH;
        else {
          for (const bs of boostS) {
            if (Math.abs(sample.s - bs) < 1.5 && d < 2.2) {
              top = B.BOOST;
              const { tx, tz } = sample;
              topRot[ci] = Math.abs(tz) > Math.abs(tx) ? (tz < 0 ? 0 : 2) : tx < 0 ? 1 : 3;
            }
          }
        }
      } else if (d < halfW + 1) {
        const sample = track.samples[nearIdx[ci]];
        top = Math.floor(sample.s / 2) % 2 === 0 ? B.KERB_RED : B.KERB_WHITE;
      } else {
        const f = d === Infinity ? 1 : smoothstep((d - (halfW + 2.5)) / 9);
        const n = valueNoise(wx, wz, 7);
        const hN = Math.round(n * 5.5 * f);
        if (hN >= 1) {
          h = hN;
          top = B.GRASS;
        } else if (hN <= -1) {
          h = -1;
          top = B.WATER;
          water[ci] = 1;
        } else {
          top = hash2(gx, gz, 99) < 0.03 && d > halfW + 3 ? B.FLOWER : B.GRASS;
        }
      }
      surface[ci] = h;
      topBlock[ci] = top;
      drivable[ci] = h === 0 ? 1 : 0;
    }
  }

  // sandy shores next to water
  for (let gx = 0; gx < size; gx++) {
    for (let gz = 0; gz < size; gz++) {
      const ci = gx * size + gz;
      if (surface[ci] !== 0 || topBlock[ci] !== B.GRASS && topBlock[ci] !== B.FLOWER) continue;
      const near =
        (gx > 0 && water[ci - size]) ||
        (gx < size - 1 && water[ci + size]) ||
        (gz > 0 && water[ci - 1]) ||
        (gz < size - 1 && water[ci + 1]);
      if (near) topBlock[ci] = B.SAND;
    }
  }

  // --- townhouse plots: chosen before the columns are filled so each plot
  // (and a strip of garden around it) can be levelled to race height ---
  const treeMark = new Uint8Array(cols);
  const HOUSE_W = 5; // square footprint
  const HOUSE_H = 6; // storeys of wall, flat roof on top
  const MAX_HOUSES = 16;
  const houseSites: { gx: number; gz: number; frontX: number; frontZ: number; wall: number }[] = [];
  {
    const WALLS = [B.HOUSE_WHITE, B.HOUSE_PINK, B.HOUSE_BLUE, B.HOUSE_YELLOW, B.HOUSE_MINT, B.HOUSE_WHITE];
    const hrand = mulberry32(9001);
    const W = HOUSE_W;
    for (let gx = 3; gx < size - 3 - W && houseSites.length < MAX_HOUSES; gx++) {
      for (let gz = 3; gz < size - 3 - W && houseSites.length < MAX_HOUSES; gz++) {
        if (hash2(gx, gz, 33) > 0.12) continue;
        // gentle ground, no water, close to the road but off the racing line
        let ok = true;
        for (let ax = -2; ax <= W + 1 && ok; ax++) {
          for (let az = -2; az <= W + 1; az++) {
            const ci = (gx + ax) * size + gz + az;
            const inside = ax >= 0 && ax < W && az >= 0 && az < W;
            if (
              surface[ci] < 0 ||
              surface[ci] > 3 ||
              treeMark[ci] ||
              topBlock[ci] === B.WATER ||
              dist[ci] < halfW + (inside ? 7 : 4)
            ) {
              ok = false;
              break;
            }
          }
        }
        if (!ok) continue;
        for (let ax = -2; ax <= W + 1; ax++) {
          for (let az = -2; az <= W + 1; az++) {
            const ci = (gx + ax) * size + gz + az;
            surface[ci] = 0;
            drivable[ci] = 1;
            if (topBlock[ci] !== B.FLOWER) topBlock[ci] = B.GRASS;
            treeMark[ci] = 1;
          }
        }
        // front door on the side facing the road
        const mid = Math.floor(W / 2);
        const sides = [
          { d: dist[(gx - 1) * size + gz + mid], x: 0, z: mid },
          { d: dist[(gx + W) * size + gz + mid], x: W - 1, z: mid },
          { d: dist[(gx + mid) * size + gz - 1], x: mid, z: 0 },
          { d: dist[(gx + mid) * size + gz + W], x: mid, z: W - 1 },
        ];
        const front = sides.reduce((a, b) => (b.d < a.d ? b : a));
        houseSites.push({ gx, gz, frontX: front.x, frontZ: front.z, wall: WALLS[Math.floor(hrand() * WALLS.length)] });
      }
    }
  }

  // --- fill columns ---
  for (let gx = 0; gx < size; gx++) {
    for (let gz = 0; gz < size; gz++) {
      const ci = gx * size + gz;
      const h = surface[ci];
      const top = topBlock[ci];
      const topY = h - 1;
      for (let y = Y_MIN; y <= topY; y++) {
        let b: number;
        if (y === Y_MIN) b = B.BEDROCK;
        else if (y === topY) b = top;
        else if (top === B.WATER) b = y === topY - 1 ? B.SAND : B.STONE;
        else if (top === B.SAND) b = y >= topY - 1 ? B.SAND : B.STONE;
        else if (top === B.ROAD || top === B.FINISH || top === B.BOOST || top === B.KERB_RED || top === B.KERB_WHITE)
          b = B.STONE;
        else b = y >= topY - 2 ? B.DIRT : B.STONE;
        set(gx, y, gz, b);
      }
    }
  }

  // --- Chelsea townhouses: pastel stucco terraces on their levelled plots ---
  for (const site of houseSites) {
    const { gx, gz, wall } = site;
    for (let ax = 0; ax < HOUSE_W; ax++) {
      for (let az = 0; az < HOUSE_W; az++) {
        const edgeX = ax === 0 || ax === HOUSE_W - 1;
        const edgeZ = az === 0 || az === HOUSE_W - 1;
        const corner = edgeX && edgeZ;
        const windowCol = !corner && (edgeX ? az % 2 === 1 : edgeZ ? ax % 2 === 1 : false);
        for (let y = 0; y < HOUSE_H; y++) {
          let b: number = wall;
          if (windowCol && y % 2 === 1) b = B.WINDOW;
          if (ax === site.frontX && az === site.frontZ && y <= 1) b = B.DOOR;
          set(gx + ax, y, gz + az, b);
        }
        set(gx + ax, HOUSE_H, gz + az, B.ROOF);
        const ci = (gx + ax) * size + gz + az;
        drivable[ci] = 0;
        topBlock[ci] = wall;
      }
    }
  }

  // --- trees ---
  const rand = mulberry32(4242);
  for (let gx = 2; gx < size - 2; gx++) {
    for (let gz = 2; gz < size - 2; gz++) {
      const ci = gx * size + gz;
      if (topBlock[ci] !== B.GRASS && topBlock[ci] !== B.FLOWER) continue;
      if (surface[ci] < 0 || dist[ci] < halfW + 6) continue;
      if (treeMark[ci]) continue;
      if (hash2(gx, gz, 21) > 0.022) continue;
      const base = surface[ci];
      const th = 4 + (rand() < 0.5 ? 0 : 1);
      if (base + th + 2 >= Y_MIN + Y_SIZE) continue;
      // reserve space around the tree
      for (let ax = -3; ax <= 3; ax++)
        for (let az = -3; az <= 3; az++) {
          const nx = gx + ax;
          const nz = gz + az;
          if (nx >= 0 && nz >= 0 && nx < size && nz < size) treeMark[nx * size + nz] = 1;
        }
      const topY = base + th - 1;
      for (let ly = topY - 2; ly <= topY + 1; ly++) {
        const r = ly >= topY ? 1 : 2;
        for (let ax = -r; ax <= r; ax++)
          for (let az = -r; az <= r; az++) {
            const corner = Math.abs(ax) === r && Math.abs(az) === r;
            if (corner && (r === 2 ? rand() < 0.6 : true)) continue;
            if (ly === topY + 1 && Math.abs(ax) + Math.abs(az) > 1) continue;
            if (get(gx + ax, ly, gz + az) === B.AIR) set(gx + ax, ly, gz + az, B.LEAVES);
          }
      }
      for (let ly = base; ly <= topY; ly++) set(gx, ly, gz, B.LOG);
      drivable[ci] = 0;
      topBlock[ci] = B.LOG;
    }
  }

  // --- start/finish gantry ---
  {
    const s0 = track.samples[0];
    const nx = -s0.tz;
    const nz = s0.tx;
    const off = halfW + 1.6;
    const ax = s0.x + nx * off;
    const az = s0.z + nz * off;
    const bx = s0.x - nx * off;
    const bz = s0.z - nz * off;
    const pillar = (px: number, pz: number) => {
      const gx = Math.floor(px - x0);
      const gz = Math.floor(pz - z0);
      for (let y = 0; y <= 4; y++) set(gx, y, gz, B.LOG);
      set(gx, 5, gz, B.PLANKS);
      const ci = gx * size + gz;
      if (ci >= 0 && ci < cols) drivable[ci] = 0;
    };
    pillar(ax, az);
    pillar(bx, bz);
    const steps = Math.ceil(off * 2 / 0.25);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const px = ax + (bx - ax) * t;
      const pz = az + (bz - az) * t;
      set(Math.floor(px - x0), 5, Math.floor(pz - z0), B.FINISH);
    }
  }

  // --- mesh the voxels, chunk by chunk, emitting only exposed faces ---
  const material = new THREE.MeshBasicMaterial({ map: atlas, vertexColors: true });
  const group = new THREE.Group();
  const geometries: THREE.BufferGeometry[] = [];

  // corners listed [TL, TR, BR, BL] as seen from outside the face
  type FaceDef = { n: [number, number, number]; c: [number, number, number][]; shade: number };
  const FACES: FaceDef[] = [
    { n: [0, 1, 0], c: [[0, 1, 0], [1, 1, 0], [1, 1, 1], [0, 1, 1]], shade: 1 },
    { n: [0, -1, 0], c: [[1, 0, 0], [0, 0, 0], [0, 0, 1], [1, 0, 1]], shade: 0.5 },
    { n: [1, 0, 0], c: [[1, 1, 1], [1, 1, 0], [1, 0, 0], [1, 0, 1]], shade: 0.64 },
    { n: [-1, 0, 0], c: [[0, 1, 0], [0, 1, 1], [0, 0, 1], [0, 0, 0]], shade: 0.64 },
    { n: [0, 0, 1], c: [[0, 1, 1], [1, 1, 1], [1, 0, 1], [0, 0, 1]], shade: 0.8 },
    { n: [0, 0, -1], c: [[1, 1, 0], [0, 1, 0], [0, 0, 0], [1, 0, 0]], shade: 0.8 },
  ];
  const UVS: [number, number][] = [
    [0, 1],
    [1, 1],
    [1, 0],
    [0, 0],
  ];

  const solidAt = (gx: number, y: number, gz: number) => get(gx, y, gz) !== B.AIR;

  for (let cx = 0; cx < size; cx += CHUNK) {
    for (let cz = 0; cz < size; cz += CHUNK) {
      const pos: number[] = [];
      const uvs: number[] = [];
      const col: number[] = [];
      const idx: number[] = [];
      let vcount = 0;
      for (let gx = cx; gx < Math.min(size, cx + CHUNK); gx++) {
        for (let gz = cz; gz < Math.min(size, cz + CHUNK); gz++) {
          const ci = gx * size + gz;
          for (let y = Y_MIN; y < Y_MIN + Y_SIZE; y++) {
            const b = voxels[vIndex(gx, y, gz)];
            if (b === B.AIR) continue;
            const tiles = FACE_TILES[b];
            for (let f = 0; f < 6; f++) {
              const face = FACES[f];
              const [nx, ny, nz] = face.n;
              if (solidAt(gx + nx, y + ny, gz + nz)) continue;
              const tile = f === 0 ? tiles[0] : f === 1 ? tiles[1] : tiles[2];
              const [u0, v0, u1, v1] = tileUV(tile);
              const rot = f === 0 ? topRot[ci] : 0;
              for (let k = 0; k < 4; k++) {
                const c = face.c[k];
                const vx = gx + c[0] + x0;
                const vy = y + c[1];
                const vz = gz + c[2] + z0;
                pos.push(vx, vy, vz);
                const uvk = UVS[(k + rot) % 4];
                uvs.push(u0 + (u1 - u0) * uvk[0], v0 + (v1 - v0) * uvk[1]);
                // ambient occlusion: count solid neighbours around this corner
                // on the layer the face looks into
                const bx = gx + nx;
                const by = y + ny;
                const bz = gz + nz;
                let ao = 0;
                if (ny !== 0) {
                  const sx = c[0] === 0 ? -1 : 1;
                  const sz = c[2] === 0 ? -1 : 1;
                  ao =
                    (solidAt(bx + sx, by, bz) ? 1 : 0) +
                    (solidAt(bx, by, bz + sz) ? 1 : 0) +
                    (solidAt(bx + sx, by, bz + sz) ? 1 : 0);
                } else if (nx !== 0) {
                  const sy = c[1] === 0 ? -1 : 1;
                  const sz = c[2] === 0 ? -1 : 1;
                  ao =
                    (solidAt(bx, by + sy, bz) ? 1 : 0) +
                    (solidAt(bx, by, bz + sz) ? 1 : 0) +
                    (solidAt(bx, by + sy, bz + sz) ? 1 : 0);
                } else {
                  const sx = c[0] === 0 ? -1 : 1;
                  const sy = c[1] === 0 ? -1 : 1;
                  ao =
                    (solidAt(bx + sx, by, bz) ? 1 : 0) +
                    (solidAt(bx, by + sy, bz) ? 1 : 0) +
                    (solidAt(bx + sx, by + sy, bz) ? 1 : 0);
                }
                const shade = face.shade * (1 - 0.14 * ao);
                col.push(shade, shade, shade);
              }
              idx.push(vcount, vcount + 3, vcount + 2, vcount, vcount + 2, vcount + 1);
              vcount += 4;
            }
          }
        }
      }
      if (vcount === 0) continue;
      const geo = new THREE.BufferGeometry();
      geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
      geo.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
      geo.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
      geo.setIndex(idx);
      geo.computeBoundingSphere();
      geometries.push(geo);
      const mesh = new THREE.Mesh(geo, material);
      mesh.frustumCulled = true;
      group.add(mesh);
    }
  }

  const columnIndex = (x: number, z: number) => {
    const gx = Math.floor(x - x0);
    const gz = Math.floor(z - z0);
    if (gx < 0 || gz < 0 || gx >= size || gz >= size) return -1;
    return gx * size + gz;
  };

  return {
    size,
    x0,
    z0,
    surface,
    topBlock,
    drivable,
    group,
    columnIndex,
    isDrivable: (x, z) => {
      const ci = columnIndex(x, z);
      return ci >= 0 && drivable[ci] === 1;
    },
    topAt: (x, z) => {
      const ci = columnIndex(x, z);
      return ci >= 0 ? topBlock[ci] : B.STONE;
    },
    dispose: () => {
      geometries.forEach((g) => g.dispose());
      material.dispose();
    },
  };
}
