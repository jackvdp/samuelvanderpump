import * as THREE from "three";

export type TrackSample = {
  x: number;
  z: number;
  tx: number; // unit tangent (direction of travel)
  tz: number;
  s: number; // arc length from the start line
};

export type Track = {
  samples: TrackSample[];
  length: number;
  halfWidth: number;
  count: number;
  nearestIndex: (x: number, z: number, hint: number) => number;
};

// Control points for the closed loop (x, z). Direction of travel follows the
// array order; the start/finish line sits at the first point.
export const TRACK_POINTS: [number, number][] = [
  [0, -52],
  [26, -56],
  [50, -46],
  [58, -22],
  [48, 0],
  [52, 24],
  [36, 46],
  [12, 50],
  [-4, 34],
  [-8, 12],
  [-26, 20],
  [-36, 44],
  [-56, 36],
  [-60, 8],
  [-44, -14],
  [-52, -40],
  [-30, -54],
];

// arc-length positions of the boost pads, as fractions of the lap
export const BOOST_PADS = [0.17, 0.42, 0.62, 0.86];

export function buildTrack(halfWidth = 4.5, spacing = 0.5): Track {
  const pts = TRACK_POINTS.map(([x, z]) => new THREE.Vector3(x, 0, z));
  const curve = new THREE.CatmullRomCurve3(pts, true, "centripetal", 0.5);
  curve.arcLengthDivisions = 2000;
  const length = curve.getLength();
  const count = Math.max(64, Math.round(length / spacing));
  const spaced = curve.getSpacedPoints(count);
  const ds = length / count;

  const samples: TrackSample[] = [];
  for (let i = 0; i < count; i++) {
    const p = spaced[i];
    const n = spaced[(i + 1) % count];
    let tx = n.x - p.x;
    let tz = n.z - p.z;
    const len = Math.hypot(tx, tz) || 1;
    tx /= len;
    tz /= len;
    samples.push({ x: p.x, z: p.z, tx, tz, s: i * ds });
  }

  const nearestIndex = (x: number, z: number, hint: number) => {
    // local search around the last known index; fall back to a full scan when
    // the kart has wandered far from the line
    const window = 40;
    let best = hint;
    let bestD = Infinity;
    for (let k = -window; k <= window; k++) {
      const i = (((hint + k) % count) + count) % count;
      const s = samples[i];
      const d = (s.x - x) * (s.x - x) + (s.z - z) * (s.z - z);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    }
    if (bestD > (halfWidth + 8) * (halfWidth + 8)) {
      for (let i = 0; i < count; i += 2) {
        const s = samples[i];
        const d = (s.x - x) * (s.x - x) + (s.z - z) * (s.z - z);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
    }
    return best;
  };

  return { samples, length, halfWidth, count, nearestIndex };
}
