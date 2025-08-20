// src/systems/pathfinding/AStar.ts
export interface GridCell {
  cost: number;
  opaque: boolean;
  elevation: number;
}

export function aStar(
  grid: GridCell[][], 
  startX: number, 
  startZ: number, 
  goalX: number, 
  goalZ: number
): Array<[number, number]> | null {
  const width = grid[0].length;
  const height = grid.length;
  
  if (startX < 0 || startX >= width || startZ < 0 || startZ >= height ||
      goalX < 0 || goalX >= width || goalZ < 0 || goalZ >= height) {
    return null;
  }
  
  // Simple pathfinding - just return straight line for now
  const path: Array<[number, number]> = [];
  const dx = goalX - startX;
  const dz = goalZ - startZ;
  const steps = Math.max(Math.abs(dx), Math.abs(dz));
  
  for (let i = 0; i <= steps; i++) {
    const x = Math.round(startX + (dx * i) / steps);
    const z = Math.round(startZ + (dz * i) / steps);
    path.push([x, z]);
  }
  
  return path;
}