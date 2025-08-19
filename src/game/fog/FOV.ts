// src/game/fog/FOV.ts
import { FogGrid } from "./FogGrid";
import { LOSBlocker, VisionSource } from "./FogTypes";

// Simple AABB intersection
function rectsIntersect(ax: number, ay: number, aw: number, ah: number, bx: number, by: number, bw: number, bh: number) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

// Cast one ray across cells; stop at blockers or radius
function castRay(grid: FogGrid, sx: number, sy: number, dx: number, dy: number, steps: number, blockers: LOSBlocker[]) {
  let x = sx, y = sy;
  for (let i = 0; i <= steps; i++) {
    const gx = Math.round(x);
    const gy = Math.round(y);
    if (grid.inBounds(gx, gy)) grid.setVisible(gx, gy);

    // Check blocker collision (in world px)
    const wx = gx * grid.cellSize;
    const wy = gy * grid.cellSize;
    const cellRect = { x: wx, y: wy, w: grid.cellSize, h: grid.cellSize };
    for (const b of blockers) {
      if (rectsIntersect(cellRect.x, cellRect.y, cellRect.w, cellRect.h, b.x, b.y, b.width, b.height)) return;
    }
    x += dx; y += dy;
  }
}

export function computeFOV(grid: FogGrid, source: VisionSource, blockers: LOSBlocker[]) {
  const cx = source.x / grid.cellSize;
  const cy = source.y / grid.cellSize;
  const radiusCells = Math.ceil(source.radius / grid.cellSize);

  const arc = source.fov ?? Math.PI * 2;
  const start = (source.angle ?? 0) - arc / 2;
  const rays = Math.max(360, Math.floor(arc * 180 / Math.PI)); // density ~1° per ray
  const perStep = 0.5; // 0.5 cell per sub-step for smoothness

  for (let i = 0; i < rays; i++) {
    const theta = start + (arc * i) / (rays - 1);
    const dx = Math.cos(theta) * perStep;
    const dy = Math.sin(theta) * perStep;
    castRay(grid, cx, cy, dx, dy, Math.ceil(radiusCells / perStep), blockers);
  }
}

export function recomputeVisibility(grid: FogGrid, sources: VisionSource[], blockers: LOSBlocker[]) {
  grid.downgradeVisibleToExplored();
  for (const s of sources) computeFOV(grid, s, blockers);
}