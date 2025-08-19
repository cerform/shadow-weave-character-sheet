// src/game/fog/FogVision.ts
import { FogGrid } from "./FogGrid";
import { VisionSource, LOSBlocker } from "./FogTypes";

export class FogVision {
  private grid: FogGrid;
  private blockers: LOSBlocker[] = [];

  constructor(grid: FogGrid) {
    this.grid = grid;
  }

  setBlockers(blockers: LOSBlocker[]) {
    this.blockers = blockers;
  }

  // Simple line-of-sight check between two points
  hasLineOfSight(x1: number, y1: number, x2: number, y2: number): boolean {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const steps = Math.ceil(distance);
    
    if (steps === 0) return true;
    
    const stepX = dx / steps;
    const stepY = dy / steps;
    
    for (let i = 1; i < steps; i++) {
      const x = x1 + stepX * i;
      const y = y1 + stepY * i;
      
      // Check if this point intersects any blocker
      for (const blocker of this.blockers) {
        if (x >= blocker.x && x <= blocker.x + blocker.width &&
            y >= blocker.y && y <= blocker.y + blocker.height) {
          return false;
        }
      }
    }
    
    return true;
  }

  // Apply vision from a source, respecting line of sight
  applyVision(source: VisionSource) {
    const { x: centerX, y: centerY, radius, angle, fov } = source;
    
    // Get grid bounds for the vision area
    const gridRadius = Math.ceil(radius / this.grid.cellSize);
    const { x: gridX, y: gridY } = this.grid.worldToGrid(centerX, centerY);
    
    for (let dx = -gridRadius; dx <= gridRadius; dx++) {
      for (let dy = -gridRadius; dy <= gridRadius; dy++) {
        const x = gridX + dx;
        const y = gridY + dy;
        
        if (!this.grid.inBounds(x, y)) continue;
        
        const worldPos = this.grid.gridToWorld(x, y);
        const distance = Math.sqrt(
          (worldPos.x - centerX) ** 2 + (worldPos.y - centerY) ** 2
        );
        
        if (distance > radius) continue;
        
        // Check field of view if specified
        if (angle !== undefined && fov !== undefined) {
          const targetAngle = Math.atan2(worldPos.y - centerY, worldPos.x - centerX);
          const angleDiff = Math.abs(targetAngle - angle);
          const normalizedDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);
          
          if (normalizedDiff > fov / 2) continue;
        }
        
        // Check line of sight
        if (this.hasLineOfSight(centerX, centerY, worldPos.x, worldPos.y)) {
          this.grid.setVisible(x, y);
        }
      }
    }
  }

  // Update vision for all sources
  updateVision(sources: VisionSource[]) {
    // Downgrade all visible cells to explored
    this.grid.downgradeVisibleToExplored();
    
    // Apply vision from all sources
    for (const source of sources) {
      this.applyVision(source);
    }
  }
}