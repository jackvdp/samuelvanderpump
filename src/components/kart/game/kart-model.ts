import * as THREE from "three";
import { T, boxGeometryWithTiles, uniformFaces } from "./textures";
import { D, buildDriverTexture } from "./driver-texture";
import type { Character } from "./characters";

export type KartModel = {
  root: THREE.Group;
  body: THREE.Group; // tilts with steering / drift
  wheels: THREE.Mesh[]; // [FL, FR, RL, RR]
  frontPivots: THREE.Group[];
  shadow: THREE.Mesh;
  boostFlames: THREE.Mesh[];
  dispose: () => void;
};

const sharedGeos: THREE.BufferGeometry[] = [];
let wheelGeo: THREE.BoxGeometry | null = null;
let headGeo: THREE.BoxGeometry | null = null;
let torsoGeo: THREE.BoxGeometry | null = null;
let shadowGeo: THREE.CircleGeometry | null = null;

function ensureShared() {
  if (!wheelGeo) {
    wheelGeo = boxGeometryWithTiles(0.34, 0.5, 0.5, {
      top: T.TYRE,
      bottom: T.TYRE,
      north: T.TYRE,
      south: T.TYRE,
      east: T.TYRE_SIDE,
      west: T.TYRE_SIDE,
    });
    // head and torso UVs point into the per-driver atlas, which every driver
    // lays out identically, so the geometry can still be shared
    headGeo = boxGeometryWithTiles(0.56, 0.56, 0.56, {
      top: D.HAIR,
      bottom: D.SIDE,
      north: D.SIDE,
      south: D.FACE,
      east: D.SIDE,
      west: D.SIDE,
    });
    torsoGeo = boxGeometryWithTiles(0.56, 0.5, 0.3, uniformFaces(D.SHIRT));
    shadowGeo = new THREE.CircleGeometry(1.15, 10);
    sharedGeos.push(wheelGeo, headGeo, torsoGeo, shadowGeo);
  }
}

export function buildKart(character: Character, atlas: THREE.Texture): KartModel {
  ensureShared();
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  const driverTex = buildDriverTexture(character);
  const paint = new THREE.MeshLambertMaterial({ color: character.color });
  const outfit = new THREE.MeshLambertMaterial({ color: character.outfit });
  const dark = new THREE.MeshLambertMaterial({ color: 0x2a2a2e });
  const steel = new THREE.MeshLambertMaterial({ color: 0xb8bcc4 });
  const texMat = new THREE.MeshLambertMaterial({ map: atlas });
  const driverMat = new THREE.MeshLambertMaterial({ map: driverTex });
  const flameMat = new THREE.MeshBasicMaterial({ color: 0xffb020, transparent: true, opacity: 0.9 });
  const mats = [paint, outfit, dark, steel, texMat, driverMat, flameMat];
  const geos: THREE.BufferGeometry[] = [];
  const box = (w: number, h: number, d: number, m: THREE.Material, x: number, y: number, z: number) => {
    const g = new THREE.BoxGeometry(w, h, d);
    geos.push(g);
    const mesh = new THREE.Mesh(g, m);
    mesh.position.set(x, y, z);
    body.add(mesh);
    return mesh;
  };

  // chassis (kart faces +z)
  box(1.2, 0.34, 1.9, paint, 0, 0.42, 0);
  box(1.36, 0.22, 0.42, paint, 0, 0.5, 0.86); // nose
  box(1.0, 0.16, 0.5, dark, 0, 0.62, 0.55); // bonnet
  box(0.9, 0.5, 0.2, paint, 0, 0.72, -0.62); // seat back
  box(0.7, 0.14, 0.5, dark, 0, 0.56, -0.25); // seat base
  box(0.16, 0.16, 0.5, steel, -0.36, 0.34, -1.1); // exhausts
  box(0.16, 0.16, 0.5, steel, 0.36, 0.34, -1.1);
  box(0.42, 0.06, 0.28, dark, 0, 0.84, 0.28); // steering wheel
  box(0.06, 0.24, 0.06, steel, 0, 0.72, 0.36);

  // driver
  const torso = new THREE.Mesh(torsoGeo!, driverMat);
  torso.position.set(0, 0.98, -0.3);
  body.add(torso);
  const head = new THREE.Mesh(headGeo!, driverMat);
  head.position.set(0, 1.52, -0.3);
  body.add(head);
  box(0.16, 0.16, 0.5, outfit, -0.36, 1.0, -0.05); // arms
  box(0.16, 0.16, 0.5, outfit, 0.36, 1.0, -0.05);

  // wheels: front pair sits in pivots so they can yaw with steering
  const wheels: THREE.Mesh[] = [];
  const frontPivots: THREE.Group[] = [];
  const wheelPositions: [number, number, number][] = [
    [-0.72, 0.28, 0.62],
    [0.72, 0.28, 0.62],
    [-0.72, 0.28, -0.62],
    [0.72, 0.28, -0.62],
  ];
  wheelPositions.forEach(([x, y, z], i) => {
    const pivot = new THREE.Group();
    pivot.position.set(x, y, z);
    const wheel = new THREE.Mesh(wheelGeo!, texMat);
    pivot.add(wheel);
    root.add(pivot);
    wheels.push(wheel);
    if (i < 2) frontPivots.push(pivot);
  });

  // exhaust flames, shown while boosting
  const boostFlames: THREE.Mesh[] = [];
  for (const x of [-0.36, 0.36]) {
    const g = new THREE.BoxGeometry(0.2, 0.2, 0.6);
    geos.push(g);
    const flame = new THREE.Mesh(g, flameMat);
    flame.position.set(x, 0.34, -1.6);
    flame.visible = false;
    body.add(flame);
    boostFlames.push(flame);
  }

  const shadowMat = new THREE.MeshBasicMaterial({
    color: 0x000000,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
  });
  mats.push(shadowMat);
  const shadow = new THREE.Mesh(shadowGeo!, shadowMat);
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = 0.02;
  shadow.scale.set(0.7, 0.9, 1);
  root.add(shadow);

  return {
    root,
    body,
    wheels,
    frontPivots,
    shadow,
    boostFlames,
    dispose: () => {
      geos.forEach((g) => g.dispose());
      mats.forEach((m) => m.dispose());
      driverTex.dispose();
    },
  };
}

export function disposeSharedKartGeometry() {
  sharedGeos.forEach((g) => g.dispose());
  sharedGeos.length = 0;
  wheelGeo = null;
  headGeo = null;
  torsoGeo = null;
  shadowGeo = null;
}
