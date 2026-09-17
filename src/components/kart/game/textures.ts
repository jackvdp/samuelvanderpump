import * as THREE from "three";

// A tiny procedural 16px texture atlas so the game needs no image assets.
// Tiles are indexed left-to-right, top-to-bottom on an 8x8 grid.
export const TILE = 16;
export const ATLAS_TILES = 8;
export const ATLAS_SIZE = TILE * ATLAS_TILES;

export const T = {
  GRASS_TOP: 0,
  GRASS_SIDE: 1,
  DIRT: 2,
  STONE: 3,
  ROAD: 4,
  KERB_RED: 5,
  KERB_WHITE: 6,
  SAND: 7,
  WATER: 8,
  LOG_SIDE: 9,
  LOG_TOP: 10,
  LEAVES: 11,
  FINISH: 12,
  BOOST: 13,
  PLANKS: 14,
  BEDROCK: 15,
  FACE: 16,
  HAIR: 17,
  SKIN_HAIR: 18,
  SHIRT: 19,
  TYRE: 20,
  TYRE_SIDE: 21,
  FLOWER: 22,
  ROAD_LINE: 23,
  STUCCO_WHITE: 24,
  STUCCO_PINK: 25,
  STUCCO_BLUE: 26,
  STUCCO_YELLOW: 27,
  STUCCO_MINT: 28,
  WINDOW: 29,
  DOOR: 30,
  ROOF: 31,
} as const;

export type RGB = [number, number, number];

// deterministic PRNG so the world looks identical on every load
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp255(v: number) {
  return v < 0 ? 0 : v > 255 ? 255 : v | 0;
}

export function vary(c: RGB, amount: number, r: number): RGB {
  const d = (r - 0.5) * 2 * amount;
  return [clamp255(c[0] + d), clamp255(c[1] + d), clamp255(c[2] + d)];
}

export function buildAtlas(): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = ATLAS_SIZE;
  canvas.height = ATLAS_SIZE;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(ATLAS_SIZE, ATLAS_SIZE);
  const data = img.data;
  const rand = mulberry32(1337);

  const put = (tile: number, px: number, py: number, c: RGB, a = 255) => {
    const tx = (tile % ATLAS_TILES) * TILE + px;
    const ty = Math.floor(tile / ATLAS_TILES) * TILE + py;
    const i = (ty * ATLAS_SIZE + tx) * 4;
    data[i] = c[0];
    data[i + 1] = c[1];
    data[i + 2] = c[2];
    data[i + 3] = a;
  };

  const fill = (tile: number, fn: (x: number, y: number, r: number) => RGB) => {
    for (let y = 0; y < TILE; y++) {
      for (let x = 0; x < TILE; x++) {
        put(tile, x, y, fn(x, y, rand()));
      }
    }
  };

  const noisy = (base: RGB, amount: number) => (_x: number, _y: number, r: number) =>
    vary(base, amount, r);

  const grass: RGB = [104, 168, 62];
  const dirt: RGB = [134, 96, 67];
  const stone: RGB = [128, 128, 128];
  const sand: RGB = [219, 207, 163];
  const water: RGB = [56, 110, 224];
  const bark: RGB = [96, 74, 44];
  const leaves: RGB = [58, 128, 40];
  const road: RGB = [86, 86, 92];
  const gold: RGB = [248, 186, 48];

  fill(T.GRASS_TOP, noisy(grass, 26));
  fill(T.GRASS_SIDE, (x, y, r) => {
    const edge = 3 + (((x * 7) % 3) | 0);
    return y < edge ? vary(grass, 24, r) : vary(dirt, 22, r);
  });
  fill(T.DIRT, noisy(dirt, 24));
  fill(T.STONE, (x, y, r) => (r < 0.12 ? vary([98, 98, 98], 10, r) : vary(stone, 18, r)));
  fill(T.ROAD, (x, y, r) => {
    // cobbled look: darker mortar lines every 4px
    const mortar = x % 4 === 0 || y % 4 === 0;
    return mortar ? vary([64, 64, 70], 8, r) : vary(road, 16, r);
  });
  fill(T.KERB_RED, noisy([176, 44, 40], 14));
  fill(T.KERB_WHITE, noisy([232, 230, 224], 10));
  fill(T.SAND, noisy(sand, 18));
  fill(T.WATER, (x, y, r) => {
    const ripple = ((x + y * 2) % 9) < 2;
    return ripple ? vary([96, 150, 240], 10, r) : vary(water, 14, r);
  });
  fill(T.LOG_SIDE, (x, y, r) => {
    const stripe = x % 5 === 0 || (x + 3) % 7 === 0;
    return stripe ? vary([70, 52, 30], 10, r) : vary(bark, 16, r);
  });
  fill(T.LOG_TOP, (x, y, r) => {
    const dx = x - 7.5;
    const dy = y - 7.5;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d > 7.2) return vary(bark, 12, r);
    return (d | 0) % 2 === 0 ? vary([170, 138, 88], 12, r) : vary([146, 116, 70], 12, r);
  });
  fill(T.LEAVES, (x, y, r) => (r < 0.18 ? vary([38, 96, 28], 12, r) : vary(leaves, 26, r)));
  fill(T.FINISH, (x, y, r) => {
    const c = (Math.floor(x / 4) + Math.floor(y / 4)) % 2 === 0;
    return c ? vary([236, 236, 236], 8, r) : vary([26, 26, 30], 8, r);
  });
  fill(T.BOOST, (x, y, r) => {
    // chevrons pointing "up" the tile (which we orient along the track)
    const v = (y + Math.abs(x - 7.5)) % 8;
    return v < 3 ? vary([255, 236, 140], 10, r) : vary(gold, 16, r);
  });
  fill(T.PLANKS, (x, y, r) => (y % 4 === 0 ? vary([124, 96, 56], 8, r) : vary([168, 134, 82], 14, r)));
  fill(T.BEDROCK, noisy([46, 46, 52], 20));

  // --- driver ---
  const skin: RGB = [222, 168, 128];
  const hair: RGB = [64, 42, 22];
  const eyeWhite: RGB = [250, 250, 250];
  const eyeBlue: RGB = [70, 92, 200];
  const mouth: RGB = [150, 100, 80];
  fill(T.FACE, (x, y, r) => {
    const gx = x >> 1; // 8x8 face upscaled 2x
    const gy = y >> 1;
    if (gy < 2) return vary(hair, 10, r);
    if (gy === 2 && (gx === 0 || gx === 7)) return vary(hair, 10, r);
    if (gy === 4) {
      if (gx === 1 || gx === 6) return eyeWhite;
      if (gx === 2 || gx === 5) return eyeBlue;
    }
    if (gy === 5 && (gx === 3 || gx === 4)) return vary([196, 140, 104], 6, r);
    if (gy === 6 && gx >= 2 && gx <= 5) return vary(mouth, 8, r);
    return vary(skin, 10, r);
  });
  fill(T.HAIR, noisy(hair, 12));
  fill(T.SKIN_HAIR, (x, y, r) => (y < 5 ? vary(hair, 10, r) : vary(skin, 10, r)));
  fill(T.SHIRT, (x, y, r) => (y < 3 ? vary(skin, 10, r) : vary([54, 172, 176], 16, r)));
  fill(T.TYRE, (x, y, r) => ((x + y) % 4 < 2 ? vary([28, 28, 30], 8, r) : vary([48, 48, 52], 8, r)));
  fill(T.TYRE_SIDE, (x, y, r) => {
    const dx = x - 7.5;
    const dy = y - 7.5;
    const d = Math.sqrt(dx * dx + dy * dy);
    return d < 4 ? vary([180, 180, 186], 12, r) : vary([32, 32, 36], 8, r);
  });
  fill(T.FLOWER, (x, y, r) => {
    const gx = x >> 1;
    const gy = y >> 1;
    if (gy >= 2 && gy <= 4 && gx >= 3 && gx <= 5 && !(gy === 3 && gx === 4)) return [240, 70, 70];
    if (gy === 3 && gx === 4) return [255, 220, 90];
    if (gy >= 5 && gx === 4) return [60, 140, 50];
    return vary(grass, 22, r);
  });
  fill(T.ROAD_LINE, (x, y, r) => {
    const mortar = x % 4 === 0 || y % 4 === 0;
    if (x >= 6 && x <= 9) return vary([236, 210, 96], 8, r);
    return mortar ? vary([64, 64, 70], 8, r) : vary(road, 16, r);
  });

  // --- Chelsea townhouses: pastel stucco, sash windows, glossy front doors ---
  const stucco = (base: RGB) => {
    const course: RGB = [base[0] - 14, base[1] - 14, base[2] - 14];
    return (_x: number, y: number, r: number) => (y % 4 === 3 ? vary(course, 6, r) : vary(base, 8, r));
  };
  fill(T.STUCCO_WHITE, stucco([238, 234, 224]));
  fill(T.STUCCO_PINK, stucco([238, 190, 200]));
  fill(T.STUCCO_BLUE, stucco([178, 206, 232]));
  fill(T.STUCCO_YELLOW, stucco([240, 222, 150]));
  fill(T.STUCCO_MINT, stucco([190, 226, 200]));
  fill(T.WINDOW, (x, y, r) => {
    const frame = x < 2 || x > 13 || y < 2 || y > 13 || x === 7 || x === 8 || y === 7 || y === 8;
    if (frame) return vary([240, 240, 236], 6, r);
    return (x + y) % 7 < 2 ? vary([150, 190, 220], 8, r) : vary([64, 84, 118], 10, r);
  });
  fill(T.DOOR, (x, y, r) => {
    if (x < 2 || x > 13 || y < 2) return vary([240, 240, 236], 6, r);
    if (x === 11 && y === 9) return [226, 186, 84]; // brass knob
    const panel = x > 3 && x < 12 && y > 3 && y < 14 && (x === 4 || x === 11 || y === 4 || y === 13);
    return panel ? vary([48, 48, 54], 6, r) : vary([24, 24, 30], 6, r);
  });
  fill(T.ROOF, (_x, y, r) => (y % 4 === 0 ? vary([52, 54, 62], 6, r) : vary([78, 80, 90], 10, r)));

  ctx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// UV rectangle for a tile. THREE flips textures vertically so row 0 sits at v=1.
export function tileUV(tile: number): [number, number, number, number] {
  const tx = tile % ATLAS_TILES;
  const ty = Math.floor(tile / ATLAS_TILES);
  const u0 = tx / ATLAS_TILES;
  const v1 = 1 - ty / ATLAS_TILES;
  const v0 = v1 - 1 / ATLAS_TILES;
  return [u0, v0, u0 + 1 / ATLAS_TILES, v1];
}

export type BlockFaces = {
  top: number;
  bottom: number;
  north: number; // -z
  south: number; // +z
  east: number; // +x
  west: number; // -x
};

// BoxGeometry face order: +x, -x, +y, -y, +z, -z — four uv pairs each.
export function boxGeometryWithTiles(
  w: number,
  h: number,
  d: number,
  faces: BlockFaces
): THREE.BoxGeometry {
  const geo = new THREE.BoxGeometry(w, h, d);
  const uv = geo.attributes.uv as THREE.BufferAttribute;
  const order = [faces.east, faces.west, faces.top, faces.bottom, faces.south, faces.north];
  for (let f = 0; f < 6; f++) {
    const [u0, v0, u1, v1] = tileUV(order[f]);
    const base = f * 4;
    uv.setXY(base + 0, u0, v1);
    uv.setXY(base + 1, u1, v1);
    uv.setXY(base + 2, u0, v0);
    uv.setXY(base + 3, u1, v0);
  }
  uv.needsUpdate = true;
  return geo;
}

export function uniformFaces(tile: number): BlockFaces {
  return { top: tile, bottom: tile, north: tile, south: tile, east: tile, west: tile };
}
