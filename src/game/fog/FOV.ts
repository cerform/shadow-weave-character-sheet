import { FogGrid } from "./FogGrid";
import { VisionSource, LOSBlocker } from "./FogTypes";

export function recomputeVisibility(grid: FogGrid, sources: VisionSource[], blockers: LOSBlocker[]) {
  grid.downgradeVisibleToExplored();

  for (const src of sources) {
    const steps = 360;
    const sx = src.x / grid.cellSize;
    const sy = src.y / grid.cellSize;
    const radius = src.radius / grid.cellSize;

    for (let i = 0; i < steps; i++) {
      const theta = (i / steps) * 2 * Math.PI;
      const dx = Math.cos(theta) * 0.3;
      const dy = Math.sin(theta) * 0.3;

      let x = sx, y = sy;
      for (let r = 0; r < radius; r++) {
        const gx = Math.round(x);
        const gy = Math.round(y);
        if (!grid.inBounds(gx, gy)) break;
        grid.set(gx, gy, 2);

        // проверка на препятствия
        if (blockers.some(b => gx * grid.cellSize >= b.x && gx * grid.cellSize < b.x + b.width &&
                               gy * grid.cellSize >= b.y && gy * grid.cellSize < b.y + b.height)) {
          break;
        }
        x += dx; y += dy;
      }
    }
  }
}