
import React from 'react';
import { Circle, Line, RegularPolygon } from 'react-konva';

interface AreaEffectProps {
  type: 'circle' | 'cone' | 'square' | 'line';
  x: number;
  y: number;
  size: number;
  color: string;
  opacity?: number;
  rotation?: number;
  gridSize?: number;
}

const AreaEffects: React.FC<AreaEffectProps> = ({ 
  type, 
  x, 
  y, 
  size, 
  color, 
  opacity = 0.4, 
  rotation = 0,
  gridSize = 40 
}) => {
  const sizeInPixels = size * gridSize;
  
  switch (type) {
    case 'circle':
      return (
        <Circle
          x={x}
          y={y}
          radius={sizeInPixels}
          fill={color}
          opacity={opacity}
          listening={false}
        />
      );
    case 'cone':
      return (
        <RegularPolygon
          x={x}
          y={y}
          sides={3}
          radius={sizeInPixels}
          fill={color}
          opacity={opacity}
          rotation={rotation}
          listening={false}
        />
      );
    case 'square':
      return (
        <RegularPolygon
          x={x}
          y={y}
          sides={4}
          radius={sizeInPixels / Math.sqrt(2)} // Для корректного размера квадрата
          fill={color}
          opacity={opacity}
          rotation={rotation + 45}
          listening={false}
        />
      );
    case 'line':
      // Для линии используем более сложную геометрию
      return (
        <Line
          points={[
            x, y,
            x + sizeInPixels * Math.cos(Math.PI * rotation / 180),
            y + sizeInPixels * Math.sin(Math.PI * rotation / 180)
          ]}
          stroke={color}
          strokeWidth={gridSize / 2}
          opacity={opacity}
          listening={false}
        />
      );
    default:
      return null;
  }
};

export default AreaEffects;
