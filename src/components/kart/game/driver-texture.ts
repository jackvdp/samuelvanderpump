import * as THREE from "three";
import { ATLAS_SIZE, ATLAS_TILES, TILE, mulberry32, vary, type RGB } from "./textures";
import type { Character } from "./characters";

// Each driver gets a tiny atlas of their own (face, hair, side, top). It uses
// the same 8x8 tile grid as the world atlas so the shared box UV helper works
// unchanged; only the first four tiles are painted.
export const D = { FACE: 0, HAIR: 1, SIDE: 2, SHIRT: 3 } as const;

type Painter = (x: number, y: number, r: number) => RGB;

const WHITE: RGB = [250, 250, 250];
const SHADES: RGB = [26, 26, 32];

function hexRGB(hex: number): RGB {
  return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
}

function scale(c: RGB, f: number): RGB {
  return [Math.min(255, c[0] * f) | 0, Math.min(255, c[1] * f) | 0, Math.min(255, c[2] * f) | 0];
}

function seedOf(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
}

// 8x8 pixel face, drawn at 2x into the 16px tile
function facePainter(c: Character): Painter {
  const beard = scale(c.hair, 1.15);
  const lips: RGB = [scale(c.skin, 0.72)[0], scale(c.skin, 0.55)[1], scale(c.skin, 0.55)[2]];
  const nose = scale(c.skin, 0.86);
  const fringe = c.hairStyle === "quiff" ? 3 : 2;
  return (x, y, r) => {
    const gx = x >> 1;
    const gy = y >> 1;
    if (gy < fringe) return vary(c.hair, 10, r);
    if (gy === 2 && (gx === 0 || gx === 7)) return vary(c.hair, 10, r);
    if (c.hairStyle === "swept" && gy === 2 && gx <= 3) return vary(c.hair, 10, r);
    if (c.hairStyle === "long" && (gx === 0 || gx === 7)) return vary(c.hair, 10, r);
    if (c.glasses && gy === 4 && gx >= 1 && gx <= 6) return vary(SHADES, 6, r);
    if (gy === 4) {
      if (gx === 1 || gx === 6) return WHITE;
      if (gx === 2 || gx === 5) return c.eyes;
    }
    if (gy === 5 && (gx === 3 || gx === 4)) return vary(nose, 6, r);
    if (c.beard && (gy === 7 || (gy === 6 && (gx <= 1 || gx >= 6)))) return vary(beard, 10, r);
    if (gy === 6 && gx >= 2 && gx <= 5) return vary(lips, 8, r);
    return vary(c.skin, 10, r);
  };
}

function hairPainter(c: Character): Painter {
  return (_x, _y, r) => vary(c.hair, 12, r);
}

// sides and back of the head: long hair falls to the chin
function sidePainter(c: Character): Painter {
  const hairTo = c.hairStyle === "long" ? 13 : 5;
  return (_x, y, r) => (y < hairTo ? vary(c.hair, 10, r) : vary(c.skin, 10, r));
}

function shirtPainter(c: Character): Painter {
  const outfit = hexRGB(c.outfit);
  return (x, y, r) => {
    if (y < 3) return vary(c.skin, 10, r); // neck
    if (c.blazer && y < 8 && Math.abs(x - 7.5) < 8 - y) return vary([240, 240, 236], 6, r);
    return vary(outfit, 14, r);
  };
}

function paint(ctx: CanvasRenderingContext2D, tile: number, ox: number, oy: number, fn: Painter, rand: () => number) {
  const img = ctx.createImageData(TILE, TILE);
  for (let y = 0; y < TILE; y++) {
    for (let x = 0; x < TILE; x++) {
      const c = fn(x, y, rand());
      const i = (y * TILE + x) * 4;
      img.data[i] = c[0];
      img.data[i + 1] = c[1];
      img.data[i + 2] = c[2];
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, ox + (tile % ATLAS_TILES) * TILE, oy + Math.floor(tile / ATLAS_TILES) * TILE);
}

export function buildDriverTexture(c: Character): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = ATLAS_SIZE;
  canvas.height = ATLAS_SIZE;
  const ctx = canvas.getContext("2d")!;
  const rand = mulberry32(seedOf(c.id));
  paint(ctx, D.FACE, 0, 0, facePainter(c), rand);
  paint(ctx, D.HAIR, 0, 0, hairPainter(c), rand);
  paint(ctx, D.SIDE, 0, 0, sidePainter(c), rand);
  paint(ctx, D.SHIRT, 0, 0, shirtPainter(c), rand);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

// The same face as a data URL, for the driver-select cards.
const faceCache = new Map<string, string>();
export function faceDataUrl(c: Character): string {
  const cached = faceCache.get(c.id);
  if (cached) return cached;
  const canvas = document.createElement("canvas");
  canvas.width = TILE;
  canvas.height = TILE;
  const ctx = canvas.getContext("2d")!;
  paint(ctx, 0, 0, 0, facePainter(c), mulberry32(seedOf(c.id)));
  const url = canvas.toDataURL();
  faceCache.set(c.id, url);
  return url;
}
