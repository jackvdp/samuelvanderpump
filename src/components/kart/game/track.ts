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

// A blocky take on PF International at Brandon, Lincolnshire. Built from the
// circuit's corner sequence rather than a survey, so the shape is a
// tribute, not a trace: the pit straight, the T1 kink under the bridge, the
// long banked Bowl, the back straight, the Fullerton Esses, Bobby Game
// Corner, Fletcher's Loop, the hairpin, the complex and then the flyover
// back over T1. Control points are (x, z, y); direction of travel follows
// the array order and the start/finish line sits at the first point.
export const TRACK_POINTS: [number, number, number][] = [
  [28, 50, 0], // start/finish, heading west down the pit straight
  [12, 50, 0],
  [0, 44, 0], // T1 Litchfield Bridge: right-left kink under the flyover
  [-4, 34, 0],
  [0, 22, 0],
  [0, 10, 0],
  [0, 0, 0], // under the bridge
  [0, -12, 0],
  [4, -22, 0], // slight right kink
  [0, -36, 0], // T2 the Bowl: long banked left-hander
  [-14, -46, 0],
  [-34, -48, 0],
  [-50, -40, 0],
  [-60, -24, 0],
  [-62, -8, 0], // T3/T4 onto the back straight
  [-62, 8, 0],
  [-62, 26, 0],
  [-56, 42, 0], // T5/T6
  [-44, 50, 0],
  [-32, 46, 0], // T7 Fullerton Esses
  [-30, 38, 0],
  [-24, 36, 0],
  [-18, 28, 0], // T8 Bobby Game Corner
  [-18, 20, 0], // T9 Fletcher's Loop
  [-26, 14, 0],
  [-34, 16, 0],
  [-42, 16, 0], // the hairpin
  [-48, 10, 0],
  [-42, 2, 0],
  [-40, -5, 0], // Mike Wilson complex
  [-33, -1, 0],
  [-26, 0, 0], // up the ramp
  [-17, 0, 2.0],
  [-8, 0, 4.3],
  [0, 0, 4.6], // over the bridge
  [8, 0, 4.3],
  [17, 0, 2.0],
  [26, 0, 0],
  [40, 2, 0], // T14
  [52, 14, 0],
  [54, 32, 0], // T15 onto the pit straight
  [48, 44, 0],
];

// arc-length positions of the boost pads, as fractions of the lap: the exit
// of the Bowl, the back straight, the run-up to the flyover and the exit of
// the last corner onto the pit straight
export const BOOST_PADS = [0.278, 0.435, 0.731, 0.97];

// anything this high is bridge deck rather than ground
export const DECK_MIN = 0.4;

export function buildTrack(halfWidth = 4.5, spacing = 0.5): Track {
  const pts = TRACK_POINTS.map(([x, z, y]) => new THREE.Vector3(x, y, z));
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
    samples.push({ x: p.x, z: p.z, y: Math.max(0, p.y), tx, tz, s: i * ds });
  }

  const nearestIndex = (x: number, z: number, hint: number) => {
    // local search around the last known index; fall back to a full scan when
    // the kart has wandered far from the line. The window is what keeps a
    // kart on the right level at the flyover: the two passes through the
    // crossing are far apart in arc length.
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
