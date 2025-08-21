// Система навигации и построения пути для боевой карты
import * as THREE from 'three';

export interface PathNode {
  x: number;
  y: number;
  z: number;
  g: number; // стоимость от старта
  h: number; // эвристика до цели
  f: number; // g + h
  parent?: PathNode;
  isDifficultTerrain: boolean;
}

export interface PathResult {
  path: { x: number; y: number; z: number }[];
  totalCost: number;
  isValid: boolean;
}

export class PathfindingSystem {
  private gridSize: number = 5; // размер клетки в футах
  private difficultTerrainMap: Map<string, boolean> = new Map();
  private obstacles: Set<string> = new Set();

  constructor(gridSize: number = 5) {
    this.gridSize = gridSize;
  }

  public setDifficultTerrain(x: number, y: number, isDifficult: boolean): void {
    const key = `${x},${y}`;
    if (isDifficult) {
      this.difficultTerrainMap.set(key, true);
    } else {
      this.difficultTerrainMap.delete(key);
    }
  }

  public addObstacle(x: number, y: number): void {
    this.obstacles.add(`${x},${y}`);
  }

  public removeObstacle(x: number, y: number): void {
    this.obstacles.delete(`${x},${y}`);
  }

  public findPath(
    from: { x: number; y: number; z: number },
    to: { x: number; y: number; z: number },
    maxRange?: number
  ): PathResult {
    // Конвертируем мировые координаты в координаты сетки
    const startGrid = this.worldToGrid(from);
    const endGrid = this.worldToGrid(to);

    // A* алгоритм
    const openSet: PathNode[] = [];
    const closedSet: Set<string> = new Set();

    const startNode: PathNode = {
      ...startGrid,
      g: 0,
      h: this.heuristic(startGrid, endGrid),
      f: 0,
      isDifficultTerrain: this.isDifficultTerrain(startGrid.x, startGrid.y)
    };
    startNode.f = startNode.g + startNode.h;

    openSet.push(startNode);

    while (openSet.length > 0) {
      // Находим узел с наименьшим f
      openSet.sort((a, b) => a.f - b.f);
      const current = openSet.shift()!;

      const currentKey = `${current.x},${current.y}`;
      if (closedSet.has(currentKey)) continue;
      closedSet.add(currentKey);

      // Достигли цели
      if (current.x === endGrid.x && current.y === endGrid.y) {
        return this.reconstructPath(current);
      }

      // Проверяем соседей
      const neighbors = this.getNeighbors(current);
      for (const neighbor of neighbors) {
        const neighborKey = `${neighbor.x},${neighbor.y}`;
        
        if (closedSet.has(neighborKey)) continue;
        if (this.isObstacle(neighbor.x, neighbor.y)) continue;

        const tentativeG = current.g + this.getMovementCost(current, neighbor);

        // Проверяем максимальную дальность
        if (maxRange && tentativeG > maxRange) continue;

        // Проверяем, есть ли этот узел в открытом списке
        const existingIndex = openSet.findIndex(n => n.x === neighbor.x && n.y === neighbor.y);
        
        if (existingIndex === -1 || tentativeG < openSet[existingIndex].g) {
          neighbor.g = tentativeG;
          neighbor.h = this.heuristic(neighbor, endGrid);
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.parent = current;

          if (existingIndex === -1) {
            openSet.push(neighbor);
          } else {
            openSet[existingIndex] = neighbor;
          }
        }
      }
    }

    // Путь не найден
    return {
      path: [],
      totalCost: 0,
      isValid: false
    };
  }

  public getReachablePositions(
    from: { x: number; y: number; z: number },
    movementRange: number
  ): { x: number; y: number; z: number; cost: number }[] {
    const startGrid = this.worldToGrid(from);
    const reachable: { x: number; y: number; z: number; cost: number }[] = [];
    
    const openSet: PathNode[] = [];
    const costs: Map<string, number> = new Map();

    const startNode: PathNode = {
      ...startGrid,
      g: 0,
      h: 0,
      f: 0,
      isDifficultTerrain: this.isDifficultTerrain(startGrid.x, startGrid.y)
    };

    openSet.push(startNode);
    costs.set(`${startGrid.x},${startGrid.y}`, 0);

    while (openSet.length > 0) {
      const current = openSet.shift()!;

      const neighbors = this.getNeighbors(current);
      for (const neighbor of neighbors) {
        if (this.isObstacle(neighbor.x, neighbor.y)) continue;

        const newCost = current.g + this.getMovementCost(current, neighbor);
        if (newCost > movementRange) continue;

        const neighborKey = `${neighbor.x},${neighbor.y}`;
        const existingCost = costs.get(neighborKey);

        if (existingCost === undefined || newCost < existingCost) {
          costs.set(neighborKey, newCost);
          
          neighbor.g = newCost;
          neighbor.parent = current;
          openSet.push(neighbor);

          const worldPos = this.gridToWorld(neighbor);
          reachable.push({
            x: worldPos.x,
            y: worldPos.y,
            z: worldPos.z,
            cost: newCost
          });
        }
      }
    }

    return reachable;
  }

  private worldToGrid(pos: { x: number; y: number; z: number }): PathNode {
    return {
      x: Math.round(pos.x),
      y: Math.round(pos.y),
      z: Math.round(pos.z),
      g: 0,
      h: 0,
      f: 0,
      isDifficultTerrain: false
    };
  }

  private gridToWorld(node: PathNode): { x: number; y: number; z: number } {
    return {
      x: node.x,
      y: node.y,
      z: node.z
    };
  }

  private heuristic(a: PathNode, b: PathNode): number {
    // Манхэттенское расстояние для сетки
    const dx = Math.abs(b.x - a.x);
    const dy = Math.abs(b.y - a.y);
    const dz = Math.abs(b.z - a.z);
    return (Math.max(dx, dy) + dz) * this.gridSize;
  }

  private getNeighbors(node: PathNode): PathNode[] {
    const neighbors: PathNode[] = [];
    
    // 8 направлений + вверх/вниз
    const directions = [
      { x: 1, y: 0, z: 0 },   // восток
      { x: -1, y: 0, z: 0 },  // запад
      { x: 0, y: 1, z: 0 },   // север
      { x: 0, y: -1, z: 0 },  // юг
      { x: 1, y: 1, z: 0 },   // северо-восток
      { x: -1, y: 1, z: 0 },  // северо-запад
      { x: 1, y: -1, z: 0 },  // юго-восток
      { x: -1, y: -1, z: 0 }, // юго-запад
      { x: 0, y: 0, z: 1 },   // вверх
      { x: 0, y: 0, z: -1 }   // вниз
    ];

    for (const dir of directions) {
      const neighbor: PathNode = {
        x: node.x + dir.x,
        y: node.y + dir.y,
        z: node.z + dir.z,
        g: 0,
        h: 0,
        f: 0,
        isDifficultTerrain: this.isDifficultTerrain(node.x + dir.x, node.y + dir.y)
      };

      neighbors.push(neighbor);
    }

    return neighbors;
  }

  private getMovementCost(from: PathNode, to: PathNode): number {
    const dx = Math.abs(to.x - from.x);
    const dy = Math.abs(to.y - from.y);
    const dz = Math.abs(to.z - from.z);

    // Базовая стоимость
    let cost = this.gridSize;
    
    // Диагональное движение стоит столько же в D&D 5e
    if (dx + dy + dz > 1) {
      cost = this.gridSize;
    }

    // Вертикальное движение
    if (dz > 0) {
      cost += dz * this.gridSize;
    }

    // Трудная местность удваивает стоимость
    if (to.isDifficultTerrain) {
      cost *= 2;
    }

    return cost;
  }

  private isDifficultTerrain(x: number, y: number): boolean {
    return this.difficultTerrainMap.get(`${x},${y}`) || false;
  }

  private isObstacle(x: number, y: number): boolean {
    return this.obstacles.has(`${x},${y}`);
  }

  private reconstructPath(endNode: PathNode): PathResult {
    const path: { x: number; y: number; z: number }[] = [];
    let current: PathNode | undefined = endNode;
    let totalCost = endNode.g;

    while (current) {
      const worldPos = this.gridToWorld(current);
      path.unshift(worldPos);
      current = current.parent;
    }

    return {
      path,
      totalCost,
      isValid: true
    };
  }

  // Визуализация пути для Three.js
  public createPathMesh(path: { x: number; y: number; z: number }[]): THREE.Object3D {
    const group = new THREE.Group();

    if (path.length < 2) return group;

    // Создаем линию пути
    const points = path.map(p => new THREE.Vector3(p.x, p.y + 0.1, p.z));
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
      color: 0x00ff00, 
      linewidth: 3,
      transparent: true,
      opacity: 0.8
    });
    const line = new THREE.Line(geometry, material);
    group.add(line);

    // Добавляем маркеры точек
    path.forEach((point, index) => {
      const markerGeometry = new THREE.SphereGeometry(0.1, 8, 8);
      const markerMaterial = new THREE.MeshBasicMaterial({ 
        color: index === 0 ? 0x00ff00 : index === path.length - 1 ? 0xff0000 : 0xffff00,
        transparent: true,
        opacity: 0.8
      });
      const marker = new THREE.Mesh(markerGeometry, markerMaterial);
      marker.position.set(point.x, point.y + 0.15, point.z);
      group.add(marker);
    });

    return group;
  }

  public createReachableAreaMesh(
    reachablePositions: { x: number; y: number; z: number; cost: number }[]
  ): THREE.Object3D {
    const group = new THREE.Group();

    reachablePositions.forEach(pos => {
      const geometry = new THREE.PlaneGeometry(0.8, 0.8);
      const material = new THREE.MeshBasicMaterial({
        color: 0x0088ff,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide
      });
      
      const plane = new THREE.Mesh(geometry, material);
      plane.position.set(pos.x, pos.y + 0.05, pos.z);
      plane.rotation.x = -Math.PI / 2;
      group.add(plane);
    });

    return group;
  }
}