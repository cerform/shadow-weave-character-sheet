
import React from 'react';

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
  
  // Common style
  const baseStyle: React.CSSProperties = {
    position: 'absolute',
    opacity: opacity,
    pointerEvents: 'none',
  };
  
  switch (type) {
    case 'circle':
      return (
        <div 
          style={{
            ...baseStyle,
            left: x - sizeInPixels,
            top: y - sizeInPixels,
            width: sizeInPixels * 2,
            height: sizeInPixels * 2,
            borderRadius: '50%',
            backgroundColor: color,
          }}
        />
      );
    case 'cone':
      return (
        <div
          style={{
            ...baseStyle,
            left: x,
            top: y,
            width: 0,
            height: 0,
            borderLeft: `${sizeInPixels}px solid transparent`,
            borderRight: `${sizeInPixels}px solid transparent`,
            borderBottom: `${sizeInPixels * 2}px solid ${color}`,
            transform: `translateX(-${sizeInPixels}px) translateY(-${sizeInPixels}px) rotate(${rotation}deg)`,
            transformOrigin: 'center',
          }}
        />
      );
    case 'square':
      return (
        <div
          style={{
            ...baseStyle,
            left: x - sizeInPixels / 2,
            top: y - sizeInPixels / 2,
            width: sizeInPixels,
            height: sizeInPixels,
            backgroundColor: color,
            transform: `rotate(${rotation + 45}deg)`,
            transformOrigin: 'center',
          }}
        />
      );
    case 'line':
      // For line we use SVG for better drawing capabilities
      const endX = x + sizeInPixels * Math.cos(Math.PI * rotation / 180);
      const endY = y + sizeInPixels * Math.sin(Math.PI * rotation / 180);
      
      return (
        <svg 
          style={{
            ...baseStyle,
            left: 0,
            top: 0,
            width: '100%',
            height: '100%',
            position: 'absolute',
          }}
        >
          <line
            x1={x}
            y1={y}
            x2={endX}
            y2={endY}
            stroke={color}
            strokeWidth={gridSize / 2}
            strokeOpacity={opacity}
          />
        </svg>
      );
    default:
      return null;
  }
};

export default AreaEffects;
