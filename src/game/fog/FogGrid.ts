import { FogCellState, FogGridOptions } from "./FogTypes";

export class FogGrid {
  cols: number;
  rows: number;
  cellSize: number;
  data: Uint8Array;

  constructor(opts: FogGridOptions) {
    this.cols = opts.cols;
    this.rows = opts.rows;
    this.cellSize = opts.cellSize;
    this.data = new Uint8Array(this.cols * this.rows);
  }

  private index(x: number, y: number) {
    return y * this.cols + x;
  }

  inBounds(x: number, y: number) {
    return x >= 0 && y >= 0 && x < this.cols && y < this.rows;
  }

  get(x: number, y: number): FogCellState {
    return this.data[this.index(x, y)] as FogCellState;
  }

  set(x: number, y: number, v: FogCellState) {
    if (this.inBounds(x, y)) this.data[this.index(x, y)] = v;
  }

  raw() {
    return this.data;
  }

  downgradeVisibleToExplored() {
    for (let i = 0; i < this.data.length; i++) {
      if (this.data[i] === 2) this.data[i] = 1;
    }
  }
}