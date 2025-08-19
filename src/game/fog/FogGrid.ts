// src/game/fog/FogGrid.ts
import { FogCellState, FogGridOptions, FogStateSnapshot, FOG_VERSION } from "./FogTypes";

export class FogGrid {
  readonly cols: number;
  readonly rows: number;
  readonly cellSize: number;
  private data: Uint8Array; // stores FogCellState

  constructor(opts: FogGridOptions) {
    this.cols = opts.cols;
    this.rows = opts.rows;
    this.cellSize = opts.cellSize;
    this.data = new Uint8Array(this.cols * this.rows); // default 0 = hidden
  }

  index(x: number, y: number) { return y * this.cols + x; }

  inBounds(x: number, y: number) {
    return x >= 0 && y >= 0 && x < this.cols && y < this.rows;
  }

  get(x: number, y: number): FogCellState {
    if (!this.inBounds(x, y)) return 0;
    return this.data[this.index(x, y)] as FogCellState;
  }

  set(x: number, y: number, v: FogCellState) {
    if (!this.inBounds(x, y)) return;
    this.data[this.index(x, y)] = v;
  }

  clearHidden() {
    this.data.fill(0);
  }

  setVisible(x: number, y: number) {
    if (!this.inBounds(x, y)) return;
    this.data[this.index(x, y)] = 2;
  }

  downgradeVisibleToExplored() {
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i] === 2) this.data[i] = 1;
    }
  }

  revealAll() {
    this.data.fill(2);
  }

  hideAll() {
    this.data.fill(0);
  }

  // Convert world coordinates to grid coordinates
  worldToGrid(worldX: number, worldY: number): { x: number; y: number } {
    return {
      x: Math.floor(worldX / this.cellSize),
      y: Math.floor(worldY / this.cellSize)
    };
  }

  // Convert grid coordinates to world coordinates (center of cell)
  gridToWorld(gridX: number, gridY: number): { x: number; y: number } {
    return {
      x: gridX * this.cellSize + this.cellSize / 2,
      y: gridY * this.cellSize + this.cellSize / 2
    };
  }

  // Reveal circular area
  revealCircle(centerX: number, centerY: number, radius: number) {
    const { x: gridX, y: gridY } = this.worldToGrid(centerX, centerY);
    const gridRadius = Math.ceil(radius / this.cellSize);

    for (let dx = -gridRadius; dx <= gridRadius; dx++) {
      for (let dy = -gridRadius; dy <= gridRadius; dy++) {
        const x = gridX + dx;
        const y = gridY + dy;
        
        if (!this.inBounds(x, y)) continue;
        
        const worldPos = this.gridToWorld(x, y);
        const distance = Math.sqrt(
          (worldPos.x - centerX) ** 2 + (worldPos.y - centerY) ** 2
        );
        
        if (distance <= radius) {
          this.setVisible(x, y);
        }
      }
    }
  }

  // Hide circular area
  hideCircle(centerX: number, centerY: number, radius: number) {
    const { x: gridX, y: gridY } = this.worldToGrid(centerX, centerY);
    const gridRadius = Math.ceil(radius / this.cellSize);

    for (let dx = -gridRadius; dx <= gridRadius; dx++) {
      for (let dy = -gridRadius; dy <= gridRadius; dy++) {
        const x = gridX + dx;
        const y = gridY + dy;
        
        if (!this.inBounds(x, y)) continue;
        
        const worldPos = this.gridToWorld(x, y);
        const distance = Math.sqrt(
          (worldPos.x - centerX) ** 2 + (worldPos.y - centerY) ** 2
        );
        
        if (distance <= radius) {
          this.set(x, y, 0);
        }
      }
    }
  }

  // Create snapshot for serialization
  createSnapshot(): FogStateSnapshot {
    return {
      grid: new Uint8Array(this.data),
      version: FOG_VERSION,
      cols: this.cols,
      rows: this.rows,
      cellSize: this.cellSize
    };
  }

  // Load from snapshot
  loadSnapshot(snapshot: FogStateSnapshot) {
    if (snapshot.version !== FOG_VERSION) {
      console.warn('Fog version mismatch, resetting grid');
      this.clearHidden();
      return;
    }
    
    if (snapshot.cols !== this.cols || snapshot.rows !== this.rows) {
      console.warn('Fog grid size mismatch, resetting grid');
      this.clearHidden();
      return;
    }
    
    this.data.set(snapshot.grid);
  }

  // Get opacity for rendering (0 = fully visible, 1 = fully hidden)
  getOpacity(x: number, y: number): number {
    const state = this.get(x, y);
    switch (state) {
      case 0: return 1.0;    // hidden
      case 1: return 0.3;    // explored (slightly visible)
      case 2: return 0.0;    // visible
      default: return 1.0;
    }
  }
}