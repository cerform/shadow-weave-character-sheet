import React from 'react';
import { GRID } from '../utils/constants';

interface GridLayerProps {
  width: number;
  height: number;
  visible: boolean;
}

export function GridLayer({ width, height, visible }: GridLayerProps) {
  if (!visible) return null;

  const cols = Math.ceil(width / GRID);
  const rows = Math.ceil(height / GRID);

  return (
    <svg
      className="absolute inset-0 pointer-events-none"
      width={width}
      height={height}
      style={{ opacity: 0.3 }}
    >
      {/* Vertical lines */}
      {Array.from({ length: cols + 1 }).map((_, i) => (
        <line
          key={`v-${i}`}
          x1={i * GRID}
          y1={0}
          x2={i * GRID}
          y2={height}
          stroke="hsl(var(--border))"
          strokeWidth={1}
        />
      ))}
      {/* Horizontal lines */}
      {Array.from({ length: rows + 1 }).map((_, i) => (
        <line
          key={`h-${i}`}
          x1={0}
          y1={i * GRID}
          x2={width}
          y2={i * GRID}
          stroke="hsl(var(--border))"
          strokeWidth={1}
        />
      ))}
    </svg>
  );
}
