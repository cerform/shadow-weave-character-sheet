// src/systems/los/LineOfSight.ts
export function hasLineOfSight(
  grid: any, 
  x1: number, 
  z1: number, 
  x2: number, 
  z2: number
): boolean {
  // Simplified line of sight check
  // TODO: Implement proper raycasting through terrain grid
  const dx = Math.abs(x2 - x1);
  const dz = Math.abs(z2 - z1);
  const distance = Math.sqrt(dx * dx + dz * dz);
  
  // For now, just check if distance is reasonable
  return distance <= 120; // 120 feet max range
}