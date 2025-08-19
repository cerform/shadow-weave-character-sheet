import { FogGrid } from "./FogGrid";
import { VisionSource, LOSBlocker, FogGridOptions } from "./FogTypes";
import { recomputeVisibility } from "./FOV";

export class FogManager {
  private grid: FogGrid;
  private visionSources: VisionSource[] = [];
  private blockers: LOSBlocker[] = [];
  private onUpdateCallback?: () => void;

  constructor(options: FogGridOptions) {
    this.grid = new FogGrid(options);
  }

  setUpdateCallback(callback: () => void) {
    this.onUpdateCallback = callback;
  }

  addVisionSource(source: VisionSource) {
    this.visionSources.push(source);
    this.recompute();
  }

  removeVisionSource(x: number, y: number, radius: number = 1) {
    this.visionSources = this.visionSources.filter(
      s => Math.abs(s.x - x) > radius || Math.abs(s.y - y) > radius
    );
    this.recompute();
  }

  clearVisionSources() {
    this.visionSources = [];
    this.recompute();
  }

  updateVisionSources(sources: VisionSource[]) {
    this.visionSources = [...sources];
    this.recompute();
  }

  addBlocker(blocker: LOSBlocker) {
    this.blockers.push(blocker);
    this.recompute();
  }

  clearBlockers() {
    this.blockers = [];
    this.recompute();
  }

  revealArea(x: number, y: number, radius: number = 5) {
    const gx = Math.floor(x / this.grid.cellSize);
    const gy = Math.floor(y / this.grid.cellSize);
    const gridRadius = Math.ceil(radius / this.grid.cellSize);

    for (let dx = -gridRadius; dx <= gridRadius; dx++) {
      for (let dy = -gridRadius; dy <= gridRadius; dy++) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= gridRadius) {
          this.grid.set(gx + dx, gy + dy, 2); // видимо
        }
      }
    }
    this.triggerUpdate();
  }

  hideArea(x: number, y: number, radius: number = 5) {
    const gx = Math.floor(x / this.grid.cellSize);
    const gy = Math.floor(y / this.grid.cellSize);
    const gridRadius = Math.ceil(radius / this.grid.cellSize);

    for (let dx = -gridRadius; dx <= gridRadius; dx++) {
      for (let dy = -gridRadius; dy <= gridRadius; dy++) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= gridRadius) {
          this.grid.set(gx + dx, gy + dy, 0); // скрыто
        }
      }
    }
    this.triggerUpdate();
  }

  revealAll() {
    for (let y = 0; y < this.grid.rows; y++) {
      for (let x = 0; x < this.grid.cols; x++) {
        this.grid.set(x, y, 2);
      }
    }
    this.triggerUpdate();
  }

  hideAll() {
    for (let y = 0; y < this.grid.rows; y++) {
      for (let x = 0; x < this.grid.cols; x++) {
        this.grid.set(x, y, 0);
      }
    }
    this.triggerUpdate();
  }

  private recompute() {
    recomputeVisibility(this.grid, this.visionSources, this.blockers);
    this.triggerUpdate();
  }

  private triggerUpdate() {
    if (this.onUpdateCallback) {
      this.onUpdateCallback();
    }
  }

  getGrid(): FogGrid {
    return this.grid;
  }

  exportState() {
    return {
      gridData: Array.from(this.grid.raw()),
      visionSources: this.visionSources,
      blockers: this.blockers
    };
  }

  importState(state: any) {
    if (state.gridData) {
      this.grid.data.set(new Uint8Array(state.gridData));
    }
    if (state.visionSources) {
      this.visionSources = state.visionSources;
    }
    if (state.blockers) {
      this.blockers = state.blockers;
    }
    this.triggerUpdate();
  }
}