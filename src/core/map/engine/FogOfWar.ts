/**
 * Система тумана войны
 * Реальная маска видимости через текстуру/Canvas + FOV от токенов
 */

import { GridSystem, GridPosition } from './Grid';
import { VISION_RULES } from '../../battle/engine/Rules';

export enum FogState {
  Dark = 0,      // Невидимое (черное)
  Dim = 1,       // Разведанное, но не видимое (серое)
  Bright = 2,    // Видимое (прозрачное)
}

export interface VisionSource {
  tokenId: string;
  position: GridPosition;
  range: number;
  type: 'normal' | 'darkvision';
}

export interface FogCell {
  state: FogState;
  lastSeen: number; // timestamp когда клетка была видна последний раз
}

export class FogOfWarSystem {
  private grid: GridSystem;
  private fogMap: Map<string, FogCell>;
  private visionSources: Map<string, VisionSource>;
  private canvas: HTMLCanvasElement | null = null;
  private context: CanvasRenderingContext2D | null = null;
  private isDirty: boolean = false;

  constructor(grid: GridSystem) {
    this.grid = grid;
    this.fogMap = new Map();
    this.visionSources = new Map();
    this.initializeFog();
  }

  /**
   * Инициализация тумана - вся карта в темноте
   */
  private initializeFog(): void {
    const mapSize = this.grid.getMapSize();
    
    for (let x = 0; x < mapSize.width; x++) {
      for (let y = 0; y < mapSize.height; y++) {
        const key = this.grid.getCellKey({ x, y });
        this.fogMap.set(key, {
          state: FogState.Dark,
          lastSeen: 0,
        });
      }
    }
    
    this.isDirty = true;
  }

  /**
   * Создание Canvas для отрисовки тумана
   */
  createCanvas(width: number, height: number): HTMLCanvasElement {
    if (this.canvas) {
      this.canvas.remove();
    }

    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.context = this.canvas.getContext('2d');
    
    if (!this.context) {
      throw new Error('Failed to get 2D context');
    }

    return this.canvas;
  }

  /**
   * Добавление источника зрения
   */
  addVisionSource(
    tokenId: string, 
    position: GridPosition, 
    range: number = VISION_RULES.DEFAULT_VISION_RANGE,
    type: 'normal' | 'darkvision' = 'normal'
  ): void {
    this.visionSources.set(tokenId, {
      tokenId,
      position,
      range,
      type,
    });
    
    this.isDirty = true;
  }

  /**
   * Обновление позиции источника зрения
   */
  updateVisionSource(tokenId: string, position: GridPosition): void {
    const source = this.visionSources.get(tokenId);
    if (!source) return;

    source.position = position;
    this.isDirty = true;
  }

  /**
   * Удаление источника зрения
   */
  removeVisionSource(tokenId: string): void {
    this.visionSources.delete(tokenId);
    this.isDirty = true;
  }

  /**
   * Пересчет видимости на основе всех источников зрения
   */
  recomputeVision(obstacles: Set<string> = new Set()): void {
    const currentTime = Date.now();
    
    // Сначала все клетки становятся dim (если они были видны ранее)
    for (const [key, cell] of this.fogMap.entries()) {
      if (cell.state === FogState.Bright) {
        cell.state = FogState.Dim;
      }
    }

    // Затем обрабатываем каждый источник зрения
    for (const source of this.visionSources.values()) {
      this.computeFieldOfView(source, obstacles, currentTime);
    }

    this.isDirty = true;
  }

  /**
   * Расчет поля зрения для источника
   */
  private computeFieldOfView(
    source: VisionSource, 
    obstacles: Set<string>, 
    currentTime: number
  ): void {
    const visibleCells = this.grid.getCellsInRadius(source.position, source.range);
    
    for (const cell of visibleCells) {
      // Проверяем линию зрения
      if (this.hasLineOfSight(source.position, cell, obstacles)) {
        const key = this.grid.getCellKey(cell);
        const fogCell = this.fogMap.get(key);
        
        if (fogCell) {
          fogCell.state = FogState.Bright;
          fogCell.lastSeen = currentTime;
        }
      }
    }
  }

  /**
   * Проверка линии зрения между двумя точками
   */
  private hasLineOfSight(
    from: GridPosition, 
    to: GridPosition, 
    obstacles: Set<string>
  ): boolean {
    const lineCells = this.grid.getLineOfSightCells(from, to);
    
    // Исключаем начальную и конечную клетки из проверки препятствий
    for (let i = 1; i < lineCells.length - 1; i++) {
      const key = this.grid.getCellKey(lineCells[i]);
      if (obstacles.has(key)) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Получение состояния тумана для клетки
   */
  getFogState(position: GridPosition): FogState {
    const key = this.grid.getCellKey(position);
    return this.fogMap.get(key)?.state || FogState.Dark;
  }

  /**
   * Проверка видимости клетки
   */
  isVisible(position: GridPosition): boolean {
    return this.getFogState(position) === FogState.Bright;
  }

  /**
   * Проверка, была ли клетка исследована
   */
  isExplored(position: GridPosition): boolean {
    const state = this.getFogState(position);
    return state === FogState.Bright || state === FogState.Dim;
  }

  /**
   * Принудительное открытие клетки (для ДМ инструментов)
   */
  revealCell(position: GridPosition): void {
    const key = this.grid.getCellKey(position);
    const cell = this.fogMap.get(key);
    
    if (cell) {
      cell.state = FogState.Bright;
      cell.lastSeen = Date.now();
      this.isDirty = true;
    }
  }

  /**
   * Принудительное сокрытие клетки
   */
  hideCell(position: GridPosition): void {
    const key = this.grid.getCellKey(position);
    const cell = this.fogMap.get(key);
    
    if (cell) {
      cell.state = FogState.Dark;
      this.isDirty = true;
    }
  }

  /**
   * Открытие области
   */
  revealArea(center: GridPosition, radius: number): void {
    const cells = this.grid.getCellsInRadius(center, radius);
    const currentTime = Date.now();
    
    for (const cell of cells) {
      const key = this.grid.getCellKey(cell);
      const fogCell = this.fogMap.get(key);
      
      if (fogCell) {
        fogCell.state = FogState.Bright;
        fogCell.lastSeen = currentTime;
      }
    }
    
    this.isDirty = true;
  }

  /**
   * Полная очистка тумана
   */
  revealAll(): void {
    const currentTime = Date.now();
    
    for (const cell of this.fogMap.values()) {
      cell.state = FogState.Bright;
      cell.lastSeen = currentTime;
    }
    
    this.isDirty = true;
  }

  /**
   * Сброс тумана к начальному состоянию
   */
  resetFog(): void {
    for (const cell of this.fogMap.values()) {
      cell.state = FogState.Dark;
      cell.lastSeen = 0;
    }
    
    this.isDirty = true;
  }

  /**
   * Отрисовка тумана на Canvas
   */
  renderToCanvas(): boolean {
    if (!this.context || !this.isDirty) return false;

    const mapSize = this.grid.getMapSize();
    const cellPixelSize = this.canvas!.width / mapSize.width;

    // Очищаем canvas
    this.context.clearRect(0, 0, this.canvas!.width, this.canvas!.height);

    // Отрисовываем каждую клетку
    for (let x = 0; x < mapSize.width; x++) {
      for (let y = 0; y < mapSize.height; y++) {
        const state = this.getFogState({ x, y });
        
        if (state !== FogState.Bright) {
          const pixelX = x * cellPixelSize;
          const pixelY = y * cellPixelSize;
          
          // Устанавливаем цвет в зависимости от состояния
          if (state === FogState.Dark) {
            this.context.fillStyle = 'rgba(0, 0, 0, 1.0)'; // Полностью черный
          } else if (state === FogState.Dim) {
            this.context.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Полупрозрачный серый
          }
          
          this.context.fillRect(pixelX, pixelY, cellPixelSize, cellPixelSize);
        }
      }
    }

    this.isDirty = false;
    return true;
  }

  /**
   * Получение Canvas элемента
   */
  getCanvas(): HTMLCanvasElement | null {
    return this.canvas;
  }

  /**
   * Получение маски тумана как ImageData
   */
  getMask(): ImageData | null {
    if (!this.context) return null;
    
    this.renderToCanvas();
    return this.context.getImageData(0, 0, this.canvas!.width, this.canvas!.height);
  }

  /**
   * Экспорт состояния тумана
   */
  exportFogData(): Record<string, { state: FogState; lastSeen: number }> {
    const data: Record<string, { state: FogState; lastSeen: number }> = {};
    
    for (const [key, cell] of this.fogMap.entries()) {
      data[key] = {
        state: cell.state,
        lastSeen: cell.lastSeen,
      };
    }
    
    return data;
  }

  /**
   * Импорт состояния тумана
   */
  importFogData(data: Record<string, { state: FogState; lastSeen: number }>): void {
    this.fogMap.clear();
    
    for (const [key, cellData] of Object.entries(data)) {
      this.fogMap.set(key, {
        state: cellData.state,
        lastSeen: cellData.lastSeen,
      });
    }
    
    this.isDirty = true;
  }

  /**
   * Получение статистики тумана
   */
  getStatistics(): {
    totalCells: number;
    darkCells: number;
    dimCells: number;
    brightCells: number;
    explorationPercentage: number;
  } {
    let darkCells = 0;
    let dimCells = 0;
    let brightCells = 0;
    
    for (const cell of this.fogMap.values()) {
      switch (cell.state) {
        case FogState.Dark:
          darkCells++;
          break;
        case FogState.Dim:
          dimCells++;
          break;
        case FogState.Bright:
          brightCells++;
          break;
      }
    }
    
    const totalCells = this.fogMap.size;
    const exploredCells = dimCells + brightCells;
    const explorationPercentage = totalCells > 0 ? (exploredCells / totalCells) * 100 : 0;
    
    return {
      totalCells,
      darkCells,
      dimCells,
      brightCells,
      explorationPercentage,
    };
  }
}