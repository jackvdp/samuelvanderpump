import * as THREE from "three";

export type TrackSample = {
  x: number;
  z: number;
  y: number; // deck height above race level (0 on the ground)
  tx: number; // unit tangent (direction of travel)
  tz: number;
  s: number; // arc length from the start line
};

export type Track = {
  samples: TrackSample[];
  length: number;
  halfWidth: number;
  spacing: number;
  count: number;
  nearestIndex: (x: number, z: number, hint: number) => number;
};

// PF International at Brandon, Lincolnshire, traced corner for corner from
// the circuit map: every control point was snapped to the centreline of the
// drawn road and scaled so a lap takes about forty seconds. The lap runs
// anticlockwise on the map: west along the pit straight from the start line,
// up into the Sector 1 loop and its hairpin, east along the top straight,
// the two Sector 2 hairpins and the S-bend, then the Sector 3 loop, kink and
// return down the bottom straight. Control points are (x, z, y); the
// start/finish line sits at the first point.
export const TRACK_POINTS: [number, number, number][] = [
  [-28.8, 20, 0], // start/finish, heading west
  [-40.5, 19.4, 0],
  [-49.1, 16.7, 0],
  [-56.7, 9.7, 0],
  [-60.6, 2.8, 0],
  [-66.2, -2.2, 0],
  [-74.5, -4.8, 0],
  [-85.4, -5.3, 0],
  [-92, -1.4, 0], // down into the Sector 1 loop
  [-92.5, 7.2, 0],
  [-96.7, 15.7, 0],
  [-103.8, 19.4, 0],
  [-117, 20, 0],
  [-130, 18.1, 0],
  [-140.1, 11.3, 0],
  [-145.4, 0.7, 0],
  [-144.2, -9.4, 0],
  [-137.9, -15, 0],
  [-128.6, -15.2, 0],
  [-118.7, -12.2, 0],
  [-108.6, -8.1, 0],
  [-102.5, -9.1, 0], // hairpin up onto the top straight
  [-100.1, -14.7, 0],
  [-96.8, -18, 0],
  [-89.6, -20.2, 0],
  [-59, -20.7, 0],
  [-20.7, -21.1, 0], // Sector 2
  [15.8, -21.3, 0],
  [38.6, -20.7, 0],
  [45.5, -16.6, 0], // east hairpin
  [46.2, -12.8, 0],
  [45, -9.3, 0],
  [37.9, -6.9, 0],
  [-1.8, -7, 0],
  [-36.7, -6.7, 0],
  [-41.2, -4, 0], // west hairpin
  [-42.3, -0.4, 0],
  [-40.3, 3.6, 0],
  [-32.4, 6.2, 0],
  [7, 6.3, 0],
  [46.6, 6.6, 0],
  [54.7, 3.9, 0], // S-bend up to the top
  [57.8, -4.2, 0],
  [58.3, -12.3, 0],
  [64.9, -20.3, 0],
  [77.3, -20.9, 0], // Sector 3
  [112.7, -20.4, 0],
  [138.1, -19.8, 0],
  [144.1, -15.4, 0],
  [145.2, -8.6, 0],
  [144.9, 6.2, 0],
  [143.4, 15, 0],
  [140.7, 19.2, 0], // bottom-right turn
  [134.7, 21.3, 0],
  [126.2, 19.8, 0],
  [122.2, 10, 0],
  [128, 1.4, 0], // the kink
  [128.2, -5.3, 0],
  [123.3, -9.1, 0],
  [108.2, -9.5, 0],
  [91.3, -7.6, 0],
  [86.2, -4, 0],
  [83, 4.4, 0],
  [82.5, 13.1, 0],
  [79.8, 18.9, 0], // onto the bottom straight
  [69, 20.8, 0],
  [29, 20.6, 0],
  [-10.6, 20.2, 0],
];

// arc-length positions of the boost pads, as fractions of the lap: the bottom
// of the Sector 1 loop, the top straight, the Sector 2 straight after the
// west hairpin and the Sector 3 top straight
export const BOOST_PADS = [0.116, 0.292, 0.572, 0.679];

// anything this high is bridge deck rather than ground
export const DECK_MIN = 0.4;

export function buildTrack(halfWidth = 4, spacing = 0.5): Track {
  const pts = TRACK_POINTS.map(([x, z, y]) => new THREE.Vector3(x, y, z));
  const curve = new THREE.CatmullRomCurve3(pts, true, "centripetal", 0.5);
  curve.arcLengthDivisions = 3000;
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
    samples.push({ x: p.x, z: p.z, y: Math.max(0, p.y), tx, tz, s: i * ds });
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

  return { samples, length, halfWidth, spacing: ds, count, nearestIndex };
}
