
import React from 'react';
import { LightSource } from '@/types/battle';

interface FogOfWarProps {
  lights: LightSource[];
  scale: number;
  mapOffset: { x: number; y: number };
}

const FogOfWar: React.FC<FogOfWarProps> = ({ lights, scale, mapOffset }) => {
  return (
    <div className="absolute inset-0 pointer-events-none">
      {lights.map((light) => {
        // Вместо прямого доступа к x и y, используем position
        const { position } = light;
        const scaledX = position.x * scale + mapOffset.x;
        const scaledY = position.y * scale + mapOffset.y;
        
        return (
          <div
            key={light.id}
            className="light-source absolute rounded-full bg-white opacity-50"
            style={{
              left: scaledX,
              top: scaledY,
              width: light.radius * 2 * scale,
              height: light.radius * 2 * scale,
              transform: 'translate(-50%, -50%)',
              background: light.color
                ? `radial-gradient(circle, ${light.color} 0%, rgba(0,0,0,0) 70%)`
                : 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(0,0,0,0) 70%)',
              mixBlendMode: 'screen',
              pointerEvents: 'none',
            }}
          />
        );
      })}
    </div>
  );
};

export { FogOfWar };
