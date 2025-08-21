/**
 * Система сетки карты
 * Снап к сетке, размеры, позиционирование
 */

import { GRID_CONFIG } from '../../../core/battle/engine/Rules';

export interface GridPosition {
  x: number;
  z: number;
}

export interface WorldPosition {
  x: number;
  y: number;
  z: number;
}

export class GridSystem {
  private cellSize: number;
  private mapWidth: number;
  private mapHeight: number;

  constructor(
    cellSize: number = GRID_CONFIG.CELL_SIZE,
    mapWidth: number = GRID_CONFIG.MAP_WIDTH,
    mapHeight: number = GRID_CONFIG.MAP_HEIGHT
  ) {
    this.cellSize = cellSize;
    this.mapWidth = mapWidth;
    this.mapHeight = mapHeight;
  }

  /**
   * Преобразование мировых координат в координаты сетки
   */
  worldToGrid(worldPos: WorldPosition): GridPosition {
    const x = Math.floor((worldPos.x + this.mapWidth / 2) / this.cellSize);
    const z = Math.floor((worldPos.z + this.mapHeight / 2) / this.cellSize);
    
    return {
      x: Math.max(0, Math.min(this.mapWidth - 1, x)),
      z: Math.max(0, Math.min(this.mapHeight - 1, z)),
    };
  }

  /**
   * Преобразование координат сетки в мировые координаты
   */
  gridToWorld(gridPos: GridPosition): WorldPosition {
    const x = (gridPos.x * this.cellSize) - (this.mapWidth / 2) + (this.cellSize / 2);
    const z = (gridPos.z * this.cellSize) - (this.mapHeight / 2) + (this.cellSize / 2);
    
    return {
      x,
      y: 0, // По умолчанию на уровне земли
      z,
    };
  }

  /**
   * Привязка позиции к центру ближайшей клетки сетки
   */
  snapToGrid(worldPos: WorldPosition): WorldPosition {
    const gridPos = this.worldToGrid(worldPos);
    return this.gridToWorld(gridPos);
  }

  /**
   * Проверка, находится ли позиция в пределах карты
   */
  isValidGridPosition(gridPos: GridPosition): boolean {
    return (
      gridPos.x >= 0 &&
      gridPos.x < this.mapWidth &&
      gridPos.z >= 0 &&
      gridPos.z < this.mapHeight
    );
  }

  /**
   * Проверка, находится ли мировая позиция в пределах карты
   */
  isValidWorldPosition(worldPos: WorldPosition): boolean {
    const halfWidth = this.mapWidth / 2;
    const halfHeight = this.mapHeight / 2;
    
    return (
      worldPos.x >= -halfWidth &&
      worldPos.x <= halfWidth &&
      worldPos.z >= -halfHeight &&
      worldPos.z <= halfHeight
    );
  }

  /**
   * Расчет расстояния между двумя позициями сетки
   */
  getGridDistance(pos1: GridPosition, pos2: GridPosition): number {
    const dx = Math.abs(pos1.x - pos2.x);
    const dz = Math.abs(pos1.z - pos2.z);
    
    // D&D 5e использует "5-foot rule" - диагональное движение считается как 1 клетка
    return Math.max(dx, dz);
  }

  /**
   * Расчет точного расстояния между двумя мировыми позициями
   */
  getWorldDistance(pos1: WorldPosition, pos2: WorldPosition): number {
    const dx = pos1.x - pos2.x;
    const dz = pos1.z - pos2.z;
    return Math.sqrt(dx * dx + dz * dz);
  }

  /**
   * Получение всех клеток в радиусе
   */
  getCellsInRadius(center: GridPosition, radius: number): GridPosition[] {
    const cells: GridPosition[] = [];
    
    for (let x = center.x - radius; x <= center.x + radius; x++) {
      for (let z = center.z - radius; z <= center.z + radius; z++) {
        const pos = { x, z };
        
        if (this.isValidGridPosition(pos) && this.getGridDistance(center, pos) <= radius) {
          cells.push(pos);
        }
      }
    }
    
    return cells;
  }

  /**
   * Получение клеток на линии между двумя точками (алгоритм Bresenham)
   */
  getLineOfSightCells(from: GridPosition, to: GridPosition): GridPosition[] {
    const cells: GridPosition[] = [];
    
    let x0 = from.x;
    let z0 = from.z;
    const x1 = to.x;
    const z1 = to.z;
    
    const dx = Math.abs(x1 - x0);
    const dz = Math.abs(z1 - z0);
    const sx = x0 < x1 ? 1 : -1;
    const sz = z0 < z1 ? 1 : -1;
    let err = dx - dz;
    
    while (true) {
      cells.push({ x: x0, z: z0 });
      
      if (x0 === x1 && z0 === z1) break;
      
      const e2 = 2 * err;
      if (e2 > -dz) {
        err -= dz;
        x0 += sx;
      }
      if (e2 < dx) {
        err += dx;
        z0 += sz;
      }
    }
    
    return cells;
  }

  /**
   * Получение соседних клеток (8 направлений)
   */
  getAdjacentCells(pos: GridPosition, includeDiagonals: boolean = true): GridPosition[] {
    const directions = includeDiagonals
      ? [
          { x: -1, z: -1 }, { x: 0, z: -1 }, { x: 1, z: -1 },
          { x: -1, z: 0 },                   { x: 1, z: 0 },
          { x: -1, z: 1 },  { x: 0, z: 1 },  { x: 1, z: 1 },
        ]
      : [
          { x: 0, z: -1 },
          { x: -1, z: 0 }, { x: 1, z: 0 },
          { x: 0, z: 1 },
        ];

    return directions
      .map(dir => ({ x: pos.x + dir.x, z: pos.z + dir.z }))
      .filter(cell => this.isValidGridPosition(cell));
  }

  /**
   * Проверка, занята ли клетка
   */
  isCellOccupied(pos: GridPosition, occupiedCells: Set<string>): boolean {
    const key = `${pos.x},${pos.z}`;
    return occupiedCells.has(key);
  }

  /**
   * Создание ключа для клетки
   */
  getCellKey(pos: GridPosition): string {
    return `${pos.x},${pos.z}`;
  }

  /**
   * Парсинг ключа клетки
   */
  parseCellKey(key: string): GridPosition | null {
    const parts = key.split(',');
    if (parts.length !== 2) return null;
    
    const x = parseInt(parts[0]);
    const z = parseInt(parts[1]);
    
    if (isNaN(x) || isNaN(z)) return null;
    
    return { x, z };
  }

  /**
   * Получение размеров карты
   */
  getMapSize(): { width: number; height: number; cellSize: number } {
    return {
      width: this.mapWidth,
      height: this.mapHeight,
      cellSize: this.cellSize,
    };
  }

  /**
   * Получение границ карты в мировых координатах
   */
  getWorldBounds(): {
    minX: number;
    maxX: number;
    minZ: number;
    maxZ: number;
  } {
    const halfWidth = this.mapWidth / 2;
    const halfHeight = this.mapHeight / 2;
    
    return {
      minX: -halfWidth,
      maxX: halfWidth,
      minZ: -halfHeight,
      maxZ: halfHeight,
    };
  }
}