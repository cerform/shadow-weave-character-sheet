/**
 * Система динамического освещения
 * Блокеры света (стены), источники света, ночное зрение
 */

import { GridSystem, GridPosition } from './Grid';

export interface LightSource {
  id: string;
  position: { x: number; y: number };
  radius: number; // в футах
  intensity: number; // 0-1
  color: string;
  angle?: number; // для направленного света (в градусах)
  direction?: number; // направление в градусах
  enabled: boolean;
}

export interface Wall {
  id: string;
  points: Array<{ x: number; y: number }>;
  blocksLight: boolean;
  blocksMovement: boolean;
  type: 'wall' | 'door' | 'window';
}

export interface Door extends Wall {
  type: 'door';
  isOpen: boolean;
}

export interface VisionToken {
  id: string;
  position: { x: number; y: number };
  visionRange: number; // в футах
  darkvisionRange?: number; // в футах
  blindsight?: number; // в футах
  truesight?: number; // в футах
}

export interface LightingState {
  sources: LightSource[];
  walls: Wall[];
  tokens: VisionToken[];
  globalIllumination: number; // 0-1, общее освещение
}

export interface VisibilityMask {
  width: number;
  height: number;
  data: Uint8Array; // 0 = невидимо, 255 = полностью видимо
}

export class DynamicLightingEngine {
  private grid: GridSystem;
  private state: LightingState = {
    sources: [],
    walls: [],
    tokens: [],
    globalIllumination: 0.1
  };
  
  private visibilityMask: VisibilityMask | null = null;
  private callbacks: Array<(state: LightingState) => void> = [];

  constructor(grid: GridSystem) {
    this.grid = grid;
  }

  /**
   * Добавляет источник света
   */
  addLight(source: Omit<LightSource, 'id'>): string {
    const id = `light_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const lightSource: LightSource = { ...source, id };
    
    this.state.sources.push(lightSource);
    this.recomputeVisibility();
    this.notifyChange();
    return id;
  }

  /**
   * Обновляет источник света
   */
  updateLight(id: string, updates: Partial<Omit<LightSource, 'id'>>): boolean {
    const sourceIndex = this.state.sources.findIndex(s => s.id === id);
    if (sourceIndex === -1) return false;

    this.state.sources[sourceIndex] = { ...this.state.sources[sourceIndex], ...updates };
    this.recomputeVisibility();
    this.notifyChange();
    return true;
  }

  /**
   * Удаляет источник света
   */
  removeLight(id: string): boolean {
    const initialLength = this.state.sources.length;
    this.state.sources = this.state.sources.filter(s => s.id !== id);
    
    if (this.state.sources.length < initialLength) {
      this.recomputeVisibility();
      this.notifyChange();
      return true;
    }
    return false;
  }

  /**
   * Добавляет стену/препятствие
   */
  addWall(wall: Omit<Wall, 'id'>): string {
    const id = `wall_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const wallObject: Wall = { ...wall, id };
    
    this.state.walls.push(wallObject);
    this.recomputeVisibility();
    this.notifyChange();
    return id;
  }

  /**
   * Добавляет дверь
   */
  addDoor(door: Omit<Door, 'id'>): string {
    const id = `door_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const doorObject: Door = { ...door, id };
    
    this.state.walls.push(doorObject);
    this.recomputeVisibility();
    this.notifyChange();
    return id;
  }

  /**
   * Открывает/закрывает дверь
   */
  toggleDoor(id: string, isOpen?: boolean): boolean {
    const wall = this.state.walls.find(w => w.id === id);
    if (!wall || wall.type !== 'door') return false;

    const door = wall as Door;
    door.isOpen = isOpen !== undefined ? isOpen : !door.isOpen;
    door.blocksLight = !door.isOpen;
    door.blocksMovement = !door.isOpen;
    
    this.recomputeVisibility();
    this.notifyChange();
    return true;
  }

  /**
   * Удаляет стену/дверь
   */
  removeWall(id: string): boolean {
    const initialLength = this.state.walls.length;
    this.state.walls = this.state.walls.filter(w => w.id !== id);
    
    if (this.state.walls.length < initialLength) {
      this.recomputeVisibility();
      this.notifyChange();
      return true;
    }
    return false;
  }

  /**
   * Добавляет токен с зрением
   */
  addVisionToken(token: VisionToken): void {
    const existingIndex = this.state.tokens.findIndex(t => t.id === token.id);
    if (existingIndex !== -1) {
      this.state.tokens[existingIndex] = token;
    } else {
      this.state.tokens.push(token);
    }
    
    this.recomputeVisibility();
    this.notifyChange();
  }

  /**
   * Обновляет позицию токена с зрением
   */
  updateVisionToken(id: string, position: { x: number; y: number }): boolean {
    const token = this.state.tokens.find(t => t.id === id);
    if (!token) return false;

    token.position = position;
    this.recomputeVisibility();
    this.notifyChange();
    return true;
  }

  /**
   * Удаляет токен с зрением
   */
  removeVisionToken(id: string): boolean {
    const initialLength = this.state.tokens.length;
    this.state.tokens = this.state.tokens.filter(t => t.id !== id);
    
    if (this.state.tokens.length < initialLength) {
      this.recomputeVisibility();
      this.notifyChange();
      return true;
    }
    return false;
  }

  /**
   * Устанавливает глобальное освещение
   */
  setGlobalIllumination(level: number): void {
    this.state.globalIllumination = Math.max(0, Math.min(1, level));
    this.recomputeVisibility();
    this.notifyChange();
  }

  /**
   * Пересчитывает видимость для всех токенов
   */
  recomputeVisibility(): void {
    // Создаем маску видимости на основе размеров карты
    const gridConfig = this.grid.getConfig();
    const width = 100; // TODO: получать из размеров карты
    const height = 100;
    
    this.visibilityMask = {
      width,
      height,
      data: new Uint8Array(width * height)
    };

    // Применяем глобальное освещение
    const globalLevel = Math.floor(this.state.globalIllumination * 255);
    this.visibilityMask.data.fill(globalLevel);

    // Применяем источники света
    for (const source of this.state.sources) {
      if (!source.enabled) continue;
      this.applyLightSource(source);
    }

    // Применяем зрение токенов
    for (const token of this.state.tokens) {
      this.applyTokenVision(token);
    }

    // Применяем тени от стен
    this.applyShadows();
  }

  /**
   * Получает маску видимости
   */
  getVisibilityMask(): VisibilityMask | null {
    return this.visibilityMask ? {
      width: this.visibilityMask.width,
      height: this.visibilityMask.height,
      data: new Uint8Array(this.visibilityMask.data)
    } : null;
  }

  /**
   * Проверяет видимость точки
   */
  isVisible(x: number, y: number, threshold = 50): boolean {
    if (!this.visibilityMask) return true;
    
    const gridPos = this.grid.pixelsToGrid(x, y);
    if (gridPos.x < 0 || gridPos.x >= this.visibilityMask.width ||
        gridPos.y < 0 || gridPos.y >= this.visibilityMask.height) {
      return false;
    }
    
    const index = gridPos.y * this.visibilityMask.width + gridPos.x;
    return this.visibilityMask.data[index] >= threshold;
  }

  /**
   * Проверяет линию зрения между двумя точками
   */
  hasLineOfSight(from: { x: number; y: number }, to: { x: number; y: number }): boolean {
    // Простая проверка пересечения со стенами
    for (const wall of this.state.walls) {
      if (!wall.blocksLight) continue;
      if (wall.type === 'door' && (wall as Door).isOpen) continue;
      
      if (this.lineIntersectsWall(from, to, wall)) {
        return false;
      }
    }
    return true;
  }

  getState(): LightingState {
    return JSON.parse(JSON.stringify(this.state));
  }

  private applyLightSource(source: LightSource): void {
    if (!this.visibilityMask) return;

    const gridConfig = this.grid.getConfig();
    const radiusCells = Math.ceil(source.radius / gridConfig.feetPerCell);
    const sourceGrid = this.grid.pixelsToGrid(source.position.x, source.position.y);
    
    // Простое радиальное освещение
    for (let dy = -radiusCells; dy <= radiusCells; dy++) {
      for (let dx = -radiusCells; dx <= radiusCells; dx++) {
        const x = sourceGrid.x + dx;
        const y = sourceGrid.y + dy;
        
        if (x < 0 || x >= this.visibilityMask.width || 
            y < 0 || y >= this.visibilityMask.height) continue;
        
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > radiusCells) continue;
        
        // Проверяем линию зрения
        const targetPixels = this.grid.gridToPixels(x, y);
        if (!this.hasLineOfSight(source.position, targetPixels)) continue;
        
        // Применяем освещение с затуханием
        const falloff = 1 - (distance / radiusCells);
        const lightLevel = Math.floor(falloff * source.intensity * 255);
        
        const index = y * this.visibilityMask.width + x;
        this.visibilityMask.data[index] = Math.max(
          this.visibilityMask.data[index],
          lightLevel
        );
      }
    }
  }

  private applyTokenVision(token: VisionToken): void {
    if (!this.visibilityMask) return;

    const gridConfig = this.grid.getConfig();
    const visionCells = Math.ceil(token.visionRange / gridConfig.feetPerCell);
    const tokenGrid = this.grid.pixelsToGrid(token.position.x, token.position.y);
    
    // Обычное зрение
    this.applyVisionRange(tokenGrid, visionCells, 255);
    
    // Ночное зрение
    if (token.darkvisionRange) {
      const darkvisionCells = Math.ceil(token.darkvisionRange / gridConfig.feetPerCell);
      this.applyVisionRange(tokenGrid, darkvisionCells, 128);
    }
  }

  private applyVisionRange(center: GridPosition, radiusCells: number, minLevel: number): void {
    if (!this.visibilityMask) return;

    for (let dy = -radiusCells; dy <= radiusCells; dy++) {
      for (let dx = -radiusCells; dx <= radiusCells; dx++) {
        const x = center.x + dx;
        const y = center.y + dy;
        
        if (x < 0 || x >= this.visibilityMask.width || 
            y < 0 || y >= this.visibilityMask.height) continue;
        
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance > radiusCells) continue;
        
        const centerPixels = this.grid.gridToPixels(center.x, center.y);
        const targetPixels = this.grid.gridToPixels(x, y);
        
        if (!this.hasLineOfSight(centerPixels, targetPixels)) continue;
        
        const index = y * this.visibilityMask.width + x;
        this.visibilityMask.data[index] = Math.max(
          this.visibilityMask.data[index],
          minLevel
        );
      }
    }
  }

  private applyShadows(): void {
    // TODO: Реализовать расчет теней от стен
    // Это сложная задача, требующая алгоритмов трассировки лучей
  }

  private lineIntersectsWall(from: { x: number; y: number }, to: { x: number; y: number }, wall: Wall): boolean {
    // Простая проверка пересечения отрезков
    for (let i = 0; i < wall.points.length - 1; i++) {
      const wallStart = wall.points[i];
      const wallEnd = wall.points[i + 1];
      
      if (this.lineSegmentsIntersect(from, to, wallStart, wallEnd)) {
        return true;
      }
    }
    return false;
  }

  private lineSegmentsIntersect(
    p1: { x: number; y: number }, 
    q1: { x: number; y: number },
    p2: { x: number; y: number }, 
    q2: { x: number; y: number }
  ): boolean {
    // Алгоритм проверки пересечения отрезков
    const det = (q1.x - p1.x) * (q2.y - p2.y) - (q1.y - p1.y) * (q2.x - p2.x);
    if (Math.abs(det) < 1e-10) return false; // Параллельные линии
    
    const t = ((p2.x - p1.x) * (q2.y - p2.y) - (p2.y - p1.y) * (q2.x - p2.x)) / det;
    const u = ((p2.x - p1.x) * (q1.y - p1.y) - (p2.y - p1.y) * (q1.x - p1.x)) / det;
    
    return t >= 0 && t <= 1 && u >= 0 && u <= 1;
  }

  private notifyChange(): void {
    this.callbacks.forEach(callback => callback(this.getState()));
  }

  onChange(callback: (state: LightingState) => void): () => void {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index !== -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }
}