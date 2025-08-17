// /src/components/battle/fog/types.ts
import * as THREE from "three";

export type VisionSource = {
  id: string;
  position: THREE.Vector3; // world space (x,y,z) — y ignored for top‑down
  radius: number;          // in world units (e.g., meters or squares)
  intensity?: number;      // 0..1 (default 1)
};

export type FogOfWarProps = {
  /** Map size in world units (width, height mapped to X,Z) */
  mapSize: THREE.Vector2;          // e.g., new Vector2(100, 100)
  /** Center of the map in world coordinates */
  mapCenter?: THREE.Vector3;       // default (0,0,0)
  /** Sources of vision (players, lights, etc.) */
  visionSources: VisionSource[];
  /** Optional obstacle meshes for basic LOS raycasting */
  occluders?: THREE.Mesh[];
  /** Fog color */
  fogColor?: THREE.Color | string | number;
  /** 0..1 how dense the fog is where not revealed */
  density?: number;
  /** Resolution of the offscreen reveal mask */
  maskResolution?: { width: number; height: number };
  /** Enable DM painting (Shift = reveal, Alt = hide) */
  enableDMPaint?: boolean;
  /** Brush radius for DM paint, in world units */
  brushRadius?: number;
  /** If true, write mask to a debug quad in a corner of the screen */
  debugMask?: boolean;
};