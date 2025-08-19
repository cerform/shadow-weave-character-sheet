// Утилиты для расчета движения токенов
export interface GridPosition {
  x: number;
  z: number;
}

/**
 * Вычисляет расстояние в клетках между двумя позициями на сетке
 */
export function getGridDistance(pos1: GridPosition, pos2: GridPosition): number {
  // Манхэттенское расстояние (как в D&D)
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.z - pos2.z);
}

/**
 * Преобразует мировые координаты в координаты сетки
 */
export function worldToGrid(position: [number, number, number]): GridPosition {
  return {
    x: Math.round(position[0]),
    z: Math.round(position[2])
  };
}

/**
 * Преобразует координаты сетки в мировые координаты
 */
export function gridToWorld(grid: GridPosition): [number, number, number] {
  return [grid.x, 0, grid.z];
}

/**
 * Проверяет, доступна ли клетка для перемещения
 */
export function isCellAccessible(
  target: GridPosition,
  tokens: Array<{ id: string; position: [number, number, number] }>,
  currentTokenId: string
): boolean {
  // Проверяем, не занята ли клетка другим токеном
  const occupiedPositions = tokens
    .filter(token => token.id !== currentTokenId)
    .map(token => worldToGrid(token.position));
  
  return !occupiedPositions.some(pos => pos.x === target.x && pos.z === target.z);
}

/**
 * Получает все доступные клетки для перемещения токена
 */
export function getAccessibleCells(
  currentPosition: [number, number, number],
  speed: number,
  tokens: Array<{ id: string; position: [number, number, number] }>,
  currentTokenId: string,
  mapBounds: { minX: number; maxX: number; minZ: number; maxZ: number } = {
    minX: -12, maxX: 12, minZ: -8, maxZ: 8
  }
): GridPosition[] {
  const startGrid = worldToGrid(currentPosition);
  const accessibleCells: GridPosition[] = [];
  
  // Обходим все клетки в радиусе скорости
  for (let x = startGrid.x - speed; x <= startGrid.x + speed; x++) {
    for (let z = startGrid.z - speed; z <= startGrid.z + speed; z++) {
      const targetGrid = { x, z };
      
      // Проверяем расстояние
      const distance = getGridDistance(startGrid, targetGrid);
      if (distance > speed) continue;
      
      // Проверяем границы карты
      if (x < mapBounds.minX || x > mapBounds.maxX || z < mapBounds.minZ || z > mapBounds.maxZ) {
        continue;
      }
      
      // Проверяем доступность клетки
      if (isCellAccessible(targetGrid, tokens, currentTokenId)) {
        accessibleCells.push(targetGrid);
      }
    }
  }
  
  return accessibleCells;
}

/**
 * Проверяет, может ли токен переместиться на заданную позицию
 */
export function canMoveToPosition(
  currentPosition: [number, number, number],
  targetPosition: [number, number, number],
  speed: number,
  tokens: Array<{ id: string; position: [number, number, number] }>,
  currentTokenId: string,
  hasMovedThisTurn: boolean = false
): boolean {
  // Если уже двигался в этом ходу, не может двигаться снова
  if (hasMovedThisTurn) return false;
  
  const startGrid = worldToGrid(currentPosition);
  const targetGrid = worldToGrid(targetPosition);
  
  // Проверяем расстояние
  const distance = getGridDistance(startGrid, targetGrid);
  if (distance > speed) return false;
  
  // Проверяем доступность клетки
  return isCellAccessible(targetGrid, tokens, currentTokenId);
}

/**
 * Выравнивает позицию по сетке
 */
export function snapToGrid(position: [number, number, number]): [number, number, number] {
  return [
    Math.round(position[0]),
    position[1],
    Math.round(position[2])
  ];
}