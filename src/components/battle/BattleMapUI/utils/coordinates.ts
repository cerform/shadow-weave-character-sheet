import { GRID } from './constants';

export type Vec2 = { x: number; y: number };

/**
 * Snap coordinate to grid
 */
export function snap(value: number): number {
  return Math.round(value / GRID) * GRID;
}

/**
 * Snap position to grid
 */
export function snapPosition(pos: Vec2): Vec2 {
  return {
    x: snap(pos.x),
    y: snap(pos.y),
  };
}

/**
 * Calculate distance between two points
 */
export function distance(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}
