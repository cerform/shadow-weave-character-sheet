/**
 * Система сетки карты
 * Поддерживает квадратную и шестигранную сетки
 * Правила диагонали 5-10-5 для D&D 5e
 */

export type GridType = 'square' | 'hex';
export type DiagonalRule = '5-10-5' | 'euclid';

export interface GridPosition {
  x: number;
  y: number;
}

export interface GridConfig {
  type: GridType;
  cellSizePx: number;
  feetPerCell: number;
  diagonalRule: DiagonalRule;
  offsetX: number;
  offsetY: number;
  rotation: number;
  snapEnabled: boolean;
}

export interface GridBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export class GridSystem {
  private config: GridConfig = {
    type: 'square',
    cellSizePx: 50,
    feetPerCell: 5,
    diagonalRule: '5-10-5',
    offsetX: 0,
    offsetY: 0,
    rotation: 0,
    snapEnabled: true
  };

  private callbacks: Array<(config: GridConfig) => void> = [];

  configure(newConfig: Partial<GridConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.notifyChange();
  }

  getConfig(): GridConfig {
    return { ...this.config };
  }

  pixelsToGrid(pixelX: number, pixelY: number): GridPosition {
    const adjustedX = pixelX - this.config.offsetX;
    const adjustedY = pixelY - this.config.offsetY;

    if (this.config.type === 'square') {
      return {
        x: Math.floor(adjustedX / this.config.cellSizePx),
        y: Math.floor(adjustedY / this.config.cellSizePx)
      };
    } else {
      const size = this.config.cellSizePx / 2;
      const q = (2/3 * adjustedX) / size;
      const r = (-1/3 * adjustedX + Math.sqrt(3)/3 * adjustedY) / size;
      
      return this.hexRound(q, r);
    }
  }

  gridToPixels(gridX: number, gridY: number): { x: number; y: number } {
    if (this.config.type === 'square') {
      return {
        x: gridX * this.config.cellSizePx + this.config.cellSizePx / 2 + this.config.offsetX,
        y: gridY * this.config.cellSizePx + this.config.cellSizePx / 2 + this.config.offsetY
      };
    } else {
      const size = this.config.cellSizePx / 2;
      const x = size * (3/2 * gridX) + this.config.offsetX;
      const y = size * (Math.sqrt(3)/2 * gridX + Math.sqrt(3) * gridY) + this.config.offsetY;
      
      return { x, y };
    }
  }

  snapToGrid(pixelX: number, pixelY: number): { x: number; y: number } {
    if (!this.config.snapEnabled) {
      return { x: pixelX, y: pixelY };
    }

    const gridPos = this.pixelsToGrid(pixelX, pixelY);
    return this.gridToPixels(gridPos.x, gridPos.y);
  }

  isValidGridPosition(position: GridPosition): boolean {
    return Number.isInteger(position.x) && Number.isInteger(position.y);
  }

  getDistance(from: GridPosition, to: GridPosition): { cells: number; feet: number } {
    let cells: number;

    if (this.config.type === 'square') {
      const dx = Math.abs(to.x - from.x);
      const dy = Math.abs(to.y - from.y);

      if (this.config.diagonalRule === '5-10-5') {
        const diagonals = Math.min(dx, dy);
        const straight = Math.abs(dx - dy);
        cells = diagonals + straight;
      } else {
        cells = Math.sqrt(dx * dx + dy * dy);
      }
    } else {
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      cells = Math.max(Math.abs(dx), Math.abs(dy), Math.abs(dx + dy));
    }

    return {
      cells: Math.round(cells * 100) / 100,
      feet: Math.round(cells * this.config.feetPerCell * 100) / 100
    };
  }

  getLine(from: GridPosition, to: GridPosition): GridPosition[] {
    const cells: GridPosition[] = [];
    
    if (this.config.type === 'square') {
      const dx = Math.abs(to.x - from.x);
      const dy = Math.abs(to.y - from.y);
      const sx = from.x < to.x ? 1 : -1;
      const sy = from.y < to.y ? 1 : -1;
      let err = dx - dy;
      
      let x = from.x;
      let y = from.y;
      
      while (true) {
        cells.push({ x, y });
        
        if (x === to.x && y === to.y) break;
        
        const e2 = 2 * err;
        if (e2 > -dy) {
          err -= dy;
          x += sx;
        }
        if (e2 < dx) {
          err += dx;
          y += sy;
        }
      }
    } else {
      const distance = this.getDistance(from, to).cells;
      for (let i = 0; i <= distance; i++) {
        const t = distance === 0 ? 0 : i / distance;
        const x = from.x + (to.x - from.x) * t;
        const y = from.y + (to.y - from.y) * t;
        cells.push(this.hexRound(x, y));
      }
    }
    
    return cells;
  }

  getRadius(center: GridPosition, radiusCells: number): GridPosition[] {
    const cells: GridPosition[] = [];
    
    for (let x = center.x - radiusCells; x <= center.x + radiusCells; x++) {
      for (let y = center.y - radiusCells; y <= center.y + radiusCells; y++) {
        const distance = this.getDistance(center, { x, y }).cells;
        if (distance <= radiusCells) {
          cells.push({ x, y });
        }
      }
    }
    
    return cells;
  }

  getBounds(positions: GridPosition[]): GridBounds {
    if (positions.length === 0) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }

    const pixels = positions.map(pos => this.gridToPixels(pos.x, pos.y));
    
    return {
      minX: Math.min(...pixels.map(p => p.x)) - this.config.cellSizePx / 2,
      maxX: Math.max(...pixels.map(p => p.x)) + this.config.cellSizePx / 2,
      minY: Math.min(...pixels.map(p => p.y)) - this.config.cellSizePx / 2,
      maxY: Math.max(...pixels.map(p => p.y)) + this.config.cellSizePx / 2
    };
  }

  private hexRound(q: number, r: number): GridPosition {
    const s = -q - r;
    const rq = Math.round(q);
    const rr = Math.round(r);
    const rs = Math.round(s);
    
    const qDiff = Math.abs(rq - q);
    const rDiff = Math.abs(rr - r);
    const sDiff = Math.abs(rs - s);
    
    if (qDiff > rDiff && qDiff > sDiff) {
      return { x: -rr - rs, y: rr };
    } else if (rDiff > sDiff) {
      return { x: rq, y: -rq - rs };
    } else {
      return { x: rq, y: rr };
    }
  }

  private notifyChange(): void {
    this.callbacks.forEach(callback => callback(this.getConfig()));
  }

  // Дополнительные методы для совместимости с существующим кодом
  getMapSize(): { width: number; height: number } {
    return { width: 100, height: 100 }; // TODO: реальный размер карты
  }

  getCellKey(position: GridPosition): string {
    return `${position.x},${position.y}`;
  }

  getCellsInRadius(center: GridPosition, radius: number): GridPosition[] {
    return this.getRadius(center, radius);
  }

  getLineOfSightCells(from: GridPosition, to: GridPosition): GridPosition[] {
    return this.getLine(from, to);
  }

  worldToGrid(worldX: number, worldY: number): GridPosition {
    return this.pixelsToGrid(worldX, worldY);
  }

  onChange(callback: (config: GridConfig) => void): () => void {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index !== -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }
}