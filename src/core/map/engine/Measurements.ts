/**
 * Система измерений (ruler tool)
 * Поддерживает множественные сегменты, снап к сетке
 */

import { GridSystem, GridPosition } from './Grid';

export interface MeasurementPoint {
  x: number;
  y: number;
  gridX: number;
  gridY: number;
}

export interface MeasurementSegment {
  from: MeasurementPoint;
  to: MeasurementPoint;
  distance: {
    cells: number;
    feet: number;
  };
}

export interface Measurement {
  id: string;
  segments: MeasurementSegment[];
  totalDistance: {
    cells: number;
    feet: number;
  };
  snapToGrid: boolean;
}

export interface TemplateShape {
  type: 'cone' | 'line' | 'circle' | 'cube' | 'sphere';
  origin: MeasurementPoint;
  params: {
    length?: number; // для cone, line
    width?: number;  // для line
    radius?: number; // для circle, sphere
    size?: number;   // для cube
    angle?: number;  // для cone (в градусах)
    direction?: number; // направление в градусах
  };
  cells: GridPosition[];
  area: {
    cells: number;
    squareFeet: number;
  };
}

export class MeasurementsEngine {
  private grid: GridSystem;
  private activeMeasurement: Measurement | null = null;
  private measurements: Map<string, Measurement> = new Map();
  private callbacks: Array<(measurements: Measurement[]) => void> = [];

  constructor(grid: GridSystem) {
    this.grid = grid;
  }

  /**
   * Начинает новое измерение
   */
  startMeasurement(x: number, y: number, snapToGrid = true): string {
    const id = `measurement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const point = this.createPoint(x, y, snapToGrid);
    
    this.activeMeasurement = {
      id,
      segments: [],
      totalDistance: { cells: 0, feet: 0 },
      snapToGrid
    };

    return id;
  }

  /**
   * Добавляет точку к активному измерению
   */
  addPoint(x: number, y: number): boolean {
    if (!this.activeMeasurement) return false;

    const point = this.createPoint(x, y, this.activeMeasurement.snapToGrid);
    const segments = this.activeMeasurement.segments;
    
    if (segments.length === 0) {
      // Первая точка - создаем начальный сегмент
      segments.push({
        from: point,
        to: point,
        distance: { cells: 0, feet: 0 }
      });
    } else {
      // Завершаем предыдущий сегмент и начинаем новый
      const lastSegment = segments[segments.length - 1];
      lastSegment.to = point;
      lastSegment.distance = this.grid.getDistance(
        { x: lastSegment.from.gridX, y: lastSegment.from.gridY },
        { x: lastSegment.to.gridX, y: lastSegment.to.gridY }
      );

      // Начинаем новый сегмент
      segments.push({
        from: point,
        to: point,
        distance: { cells: 0, feet: 0 }
      });
    }

    this.updateTotalDistance();
    this.notifyChange();
    return true;
  }

  /**
   * Обновляет конечную точку последнего сегмента
   */
  updateLastPoint(x: number, y: number): boolean {
    if (!this.activeMeasurement || this.activeMeasurement.segments.length === 0) {
      return false;
    }

    const point = this.createPoint(x, y, this.activeMeasurement.snapToGrid);
    const lastSegment = this.activeMeasurement.segments[this.activeMeasurement.segments.length - 1];
    
    lastSegment.to = point;
    lastSegment.distance = this.grid.getDistance(
      { x: lastSegment.from.gridX, y: lastSegment.from.gridY },
      { x: lastSegment.to.gridX, y: lastSegment.to.gridY }
    );

    this.updateTotalDistance();
    this.notifyChange();
    return true;
  }

  /**
   * Завершает активное измерение
   */
  finishMeasurement(): Measurement | null {
    if (!this.activeMeasurement) return null;

    // Удаляем последний пустой сегмент если есть
    const segments = this.activeMeasurement.segments;
    if (segments.length > 0) {
      const lastSegment = segments[segments.length - 1];
      if (lastSegment.distance.cells === 0) {
        segments.pop();
      }
    }

    this.updateTotalDistance();
    
    if (segments.length > 0) {
      this.measurements.set(this.activeMeasurement.id, { ...this.activeMeasurement });
    }

    const result = this.activeMeasurement;
    this.activeMeasurement = null;
    this.notifyChange();
    return result;
  }

  /**
   * Отменяет активное измерение
   */
  cancelMeasurement(): void {
    this.activeMeasurement = null;
    this.notifyChange();
  }

  /**
   * Получает активное измерение
   */
  getActiveMeasurement(): Measurement | null {
    return this.activeMeasurement ? { ...this.activeMeasurement } : null;
  }

  /**
   * Простое измерение расстояния между двумя точками
   */
  measureLine(fromX: number, fromY: number, toX: number, toY: number, snap = true): {
    distance: { cells: number; feet: number };
    line: GridPosition[];
  } {
    const from = this.createPoint(fromX, fromY, snap);
    const to = this.createPoint(toX, toY, snap);
    
    const fromGrid = { x: from.gridX, y: from.gridY };
    const toGrid = { x: to.gridX, y: to.gridY };
    
    return {
      distance: this.grid.getDistance(fromGrid, toGrid),
      line: this.grid.getLine(fromGrid, toGrid)
    };
  }

  /**
   * Создает шаблон заклинания
   */
  createTemplate(shape: Omit<TemplateShape, 'cells' | 'area'>): TemplateShape {
    const cells = this.calculateTemplateCells(shape);
    const area = this.calculateTemplateArea(cells);
    
    return {
      ...shape,
      cells,
      area
    };
  }

  /**
   * Удаляет измерение
   */
  removeMeasurement(id: string): boolean {
    const result = this.measurements.delete(id);
    this.notifyChange();
    return result;
  }

  /**
   * Очищает все измерения
   */
  clearMeasurements(): void {
    this.measurements.clear();
    this.activeMeasurement = null;
    this.notifyChange();
  }

  /**
   * Получает все измерения
   */
  getMeasurements(): Measurement[] {
    const result = Array.from(this.measurements.values());
    if (this.activeMeasurement) {
      result.push(this.activeMeasurement);
    }
    return result;
  }

  private createPoint(x: number, y: number, snapToGrid: boolean): MeasurementPoint {
    const gridPos = this.grid.pixelsToGrid(x, y);
    const snappedPixels = snapToGrid ? this.grid.gridToPixels(gridPos.x, gridPos.y) : { x, y };
    
    return {
      x: snappedPixels.x,
      y: snappedPixels.y,
      gridX: gridPos.x,
      gridY: gridPos.y
    };
  }

  private updateTotalDistance(): void {
    if (!this.activeMeasurement) return;

    let totalCells = 0;
    let totalFeet = 0;

    for (const segment of this.activeMeasurement.segments) {
      totalCells += segment.distance.cells;
      totalFeet += segment.distance.feet;
    }

    this.activeMeasurement.totalDistance = {
      cells: Math.round(totalCells * 100) / 100,
      feet: Math.round(totalFeet * 100) / 100
    };
  }

  private calculateTemplateCells(shape: Omit<TemplateShape, 'cells' | 'area'>): GridPosition[] {
    const origin = { x: shape.origin.gridX, y: shape.origin.gridY };
    const cells: GridPosition[] = [];

    switch (shape.type) {
      case 'circle':
      case 'sphere':
        if (shape.params.radius) {
          const radiusCells = Math.ceil(shape.params.radius / this.grid.getConfig().feetPerCell);
          return this.grid.getRadius(origin, radiusCells);
        }
        break;

      case 'cube':
        if (shape.params.size) {
          const sizeCells = Math.ceil(shape.params.size / this.grid.getConfig().feetPerCell);
          const halfSize = Math.floor(sizeCells / 2);
          
          for (let x = origin.x - halfSize; x <= origin.x + halfSize; x++) {
            for (let y = origin.y - halfSize; y <= origin.y + halfSize; y++) {
              cells.push({ x, y });
            }
          }
        }
        break;

      case 'line':
        if (shape.params.length) {
          const lengthCells = Math.ceil(shape.params.length / this.grid.getConfig().feetPerCell);
          const direction = (shape.params.direction || 0) * Math.PI / 180;
          const endX = origin.x + Math.cos(direction) * lengthCells;
          const endY = origin.y + Math.sin(direction) * lengthCells;
          
          return this.grid.getLine(origin, { 
            x: Math.round(endX), 
            y: Math.round(endY) 
          });
        }
        break;

      case 'cone':
        if (shape.params.length && shape.params.angle) {
          const lengthCells = Math.ceil(shape.params.length / this.grid.getConfig().feetPerCell);
          const direction = (shape.params.direction || 0) * Math.PI / 180;
          const halfAngle = (shape.params.angle / 2) * Math.PI / 180;
          
          // Простая аппроксимация конуса
          for (let distance = 1; distance <= lengthCells; distance++) {
            const width = Math.tan(halfAngle) * distance;
            const widthCells = Math.ceil(width);
            
            for (let offset = -widthCells; offset <= widthCells; offset++) {
              const x = origin.x + Math.cos(direction) * distance + Math.cos(direction + Math.PI/2) * offset;
              const y = origin.y + Math.sin(direction) * distance + Math.sin(direction + Math.PI/2) * offset;
              cells.push({ x: Math.round(x), y: Math.round(y) });
            }
          }
        }
        break;
    }

    return cells;
  }

  private calculateTemplateArea(cells: GridPosition[]): { cells: number; squareFeet: number } {
    const config = this.grid.getConfig();
    const cellAreaFeet = config.feetPerCell * config.feetPerCell;
    
    return {
      cells: cells.length,
      squareFeet: cells.length * cellAreaFeet
    };
  }

  private notifyChange(): void {
    this.callbacks.forEach(callback => callback(this.getMeasurements()));
  }

  onChange(callback: (measurements: Measurement[]) => void): () => void {
    this.callbacks.push(callback);
    return () => {
      const index = this.callbacks.indexOf(callback);
      if (index !== -1) {
        this.callbacks.splice(index, 1);
      }
    };
  }
}