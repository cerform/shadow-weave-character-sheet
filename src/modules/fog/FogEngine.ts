import type { FogMode, FogCell, FogEngineState } from './FogTypes';

export class FogEngine {
  private grid: number[][];
  private width: number;
  private height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.grid = Array.from({ length: height }, () => 
      Array.from({ length: width }, () => 0)
    );
  }

  applyBrush(x: number, y: number, radius: number, mode: FogMode): FogCell[] {
    const changed: FogCell[] = [];
    const r2 = radius * radius;
    const value = mode === 'reveal' ? 1 : 0;

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= r2) {
          const px = x + dx;
          const py = y + dy;
          
          if (this.isInBounds(px, py) && this.grid[py][px] !== value) {
            this.grid[py][px] = value;
            changed.push({ x: px, y: py, revealed: value === 1 });
          }
        }
      }
    }

    return changed;
  }

  reveal(x: number, y: number): boolean {
    if (!this.isInBounds(x, y)) return false;
    const changed = this.grid[y][x] !== 1;
    this.grid[y][x] = 1;
    return changed;
  }

  hide(x: number, y: number): boolean {
    if (!this.isInBounds(x, y)) return false;
    const changed = this.grid[y][x] !== 0;
    this.grid[y][x] = 0;
    return changed;
  }

  toggle(x: number, y: number): boolean {
    if (!this.isInBounds(x, y)) return false;
    this.grid[y][x] = this.grid[y][x] === 1 ? 0 : 1;
    return true;
  }

  isRevealed(x: number, y: number): boolean {
    return this.isInBounds(x, y) && this.grid[y][x] === 1;
  }

  getGrid(): number[][] {
    return this.grid;
  }

  loadGrid(grid: number[][]): void {
    if (grid.length === this.height && grid[0]?.length === this.width) {
      this.grid = grid.map(row => [...row]);
    }
  }

  exportCells(): FogCell[] {
    const cells: FogCell[] = [];
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.grid[y][x] === 1) {
          cells.push({ x, y, revealed: true });
        }
      }
    }
    return cells;
  }

  getState(): FogEngineState {
    return {
      width: this.width,
      height: this.height,
      grid: this.grid.map(row => [...row])
    };
  }

  private isInBounds(x: number, y: number): boolean {
    return x >= 0 && y >= 0 && x < this.width && y < this.height;
  }
}
