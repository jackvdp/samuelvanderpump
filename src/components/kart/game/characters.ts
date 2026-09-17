import type { RGB } from "./textures";

// The Made in Chelsea grid. Everything visual about a driver (kart paint,
// outfit, pixel face) and their handling comes from this one record.

export type HairStyle = "short" | "quiff" | "long" | "swept";

export type Character = {
  id: string;
  name: string;
  first: string; // what fits on a card / button
  tagline: string;
  color: number; // kart paint
  outfit: number; // top / arms
  hair: RGB;
  skin: RGB;
  eyes: RGB;
  hairStyle: HairStyle;
  beard?: boolean;
  glasses?: boolean;
  blazer?: boolean; // white shirt showing under the jacket
  stats: { speed: number; accel: number; handling: number }; // 1–5 each
};

const BLONDE: RGB = [214, 178, 96];
const DARK_BROWN: RGB = [58, 38, 22];
const BROWN: RGB = [96, 64, 36];
const LIGHT_BROWN: RGB = [140, 98, 56];
const BLACK: RGB = [30, 26, 26];

const FAIR: RGB = [232, 190, 160];
const LIGHT: RGB = [222, 168, 128];
const TAN: RGB = [204, 150, 110];

const BLUE: RGB = [70, 92, 200];
const HAZEL: RGB = [92, 60, 36];
const GREEN: RGB = [70, 140, 90];

export const CHARACTERS: Character[] = [
  {
    id: "sam",
    name: "Sam Vanderpump",
    first: "Sam",
    tagline: "Finance by day, full throttle by night.",
    color: 0xf97316,
    outfit: 0x1e293b,
    hair: DARK_BROWN,
    skin: LIGHT,
    eyes: HAZEL,
    hairStyle: "short",
    blazer: true,
    stats: { speed: 4, accel: 2, handling: 3 },
  },
  {
    id: "jamie",
    name: "Jamie Laing",
    first: "Jamie",
    tagline: "Sweet on the straights, sharp in the corners.",
    color: 0xf472b6,
    outfit: 0xf8fafc,
    hair: BLONDE,
    skin: FAIR,
    eyes: BLUE,
    hairStyle: "quiff",
    stats: { speed: 3, accel: 4, handling: 2 },
  },
  {
    id: "spencer",
    name: "Spencer Matthews",
    first: "Spencer",
    tagline: "Original cast, original pace.",
    color: 0x1e3a8a,
    outfit: 0x0f172a,
    hair: DARK_BROWN,
    skin: LIGHT,
    eyes: BLUE,
    hairStyle: "short",
    beard: true,
    blazer: true,
    stats: { speed: 5, accel: 2, handling: 2 },
  },
  {
    id: "binky",
    name: "Binky Felstead",
    first: "Binky",
    tagline: "Chelsea royalty on four wheels.",
    color: 0x8b5cf6,
    outfit: 0xf5f5f4,
    hair: BROWN,
    skin: FAIR,
    eyes: HAZEL,
    hairStyle: "long",
    stats: { speed: 3, accel: 3, handling: 3 },
  },
  {
    id: "ollie",
    name: "Ollie Locke",
    first: "Ollie",
    tagline: "Never met a corner he couldn't charm.",
    color: 0x10b981,
    outfit: 0x3f6212,
    hair: DARK_BROWN,
    skin: LIGHT,
    eyes: GREEN,
    hairStyle: "swept",
    blazer: true,
    stats: { speed: 2, accel: 3, handling: 4 },
  },
  {
    id: "markfrancis",
    name: "Mark-Francis Vandelli",
    first: "Mark-Francis",
    tagline: "Refuses to drive anything less than fabulous.",
    color: 0xeab308,
    outfit: 0x1c1917,
    hair: BLACK,
    skin: TAN,
    eyes: HAZEL,
    hairStyle: "short",
    glasses: true,
    blazer: true,
    stats: { speed: 4, accel: 3, handling: 2 },
  },
  {
    id: "millie",
    name: "Millie Mackintosh",
    first: "Millie",
    tagline: "Effortless style, effortless speed.",
    color: 0x38bdf8,
    outfit: 0xfda4af,
    hair: BROWN,
    skin: FAIR,
    eyes: BLUE,
    hairStyle: "long",
    stats: { speed: 3, accel: 2, handling: 4 },
  },
  {
    id: "louise",
    name: "Louise Thompson",
    first: "Louise",
    tagline: "Fast off the line, faster into the lead.",
    color: 0xef4444,
    outfit: 0x111827,
    hair: DARK_BROWN,
    skin: LIGHT,
    eyes: HAZEL,
    hairStyle: "long",
    stats: { speed: 2, accel: 5, handling: 2 },
  },
  {
    id: "miles",
    name: "Miles Nazaire",
    first: "Miles",
    tagline: "Treats the racing line like the King's Road.",
    color: 0xe5e7eb,
    outfit: 0x0ea5e9,
    hair: LIGHT_BROWN,
    skin: LIGHT,
    eyes: BLUE,
    hairStyle: "quiff",
    stats: { speed: 5, accel: 1, handling: 3 },
  },
  {
    id: "maeva",
    name: "Maeva D'Ascanio",
    first: "Maeva",
    tagline: "Drifts with flair, wins with attitude.",
    color: 0x84cc16,
    outfit: 0xec4899,
    hair: BLACK,
    skin: TAN,
    eyes: HAZEL,
    hairStyle: "long",
    stats: { speed: 2, accel: 4, handling: 3 },
  },
];

export const DEFAULT_CHARACTER = "sam";

export function characterById(id: string | null | undefined): Character {
  return CHARACTERS.find((c) => c.id === id) ?? CHARACTERS.find((c) => c.id === DEFAULT_CHARACTER)!;
}

// The 1–5 stats become small multipliers on the shared kart physics so every
// driver stays raceable and the AI balance holds.
export function characterMods(c: Character) {
  return {
    topSpeed: 1 + (c.stats.speed - 3) * 0.02,
    accel: 1 + (c.stats.accel - 3) * 0.06,
    turn: 1 + (c.stats.handling - 3) * 0.05,
  };
}

export type CharacterMods = ReturnType<typeof characterMods>;
