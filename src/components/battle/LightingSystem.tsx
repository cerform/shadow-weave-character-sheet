
import React from 'react';

export interface LightSourceProps {
  id: string;
  x: number;
  y: number;
  radius: number;
  type: 'torch' | 'lantern' | 'daylight';
  color: string;
  intensity: number;
}

interface LightingSystemProps {
  lightSources: LightSourceProps[];
  isDaytime?: boolean;
  globalIllumination?: number;
}

const LightingSystem: React.FC<LightingSystemProps> = ({ 
  lightSources, 
  isDaytime = false,
  globalIllumination = 0.1
}) => {
  // Если включено дневное освещение, уровень глобального света выше
  const ambientLightLevel = isDaytime ? 0.7 : globalIllumination;
  
  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Глобальное затенение - полупрозрачный прямоугольник, если не день */}
      {!isDaytime && (
        <div 
          className="absolute inset-0"
          style={{ 
            backgroundColor: 'black', 
            opacity: 1 - ambientLightLevel,
          }}
        />
      )}
      
      {/* Отрисовываем каждый источник света */}
      {lightSources.map((light) => {
        // Настраиваем параметры в зависимости от типа источника света
        const radiusMultiplier = light.type === 'torch' ? 1 : 
                               light.type === 'lantern' ? 1.5 : 
                               light.type === 'daylight' ? 10 : 1;
        
        const effectiveRadius = light.radius * radiusMultiplier;
        
        return (
          <div
            key={light.id}
            className="absolute rounded-full mix-blend-lighten"
            style={{
              left: light.x - effectiveRadius,
              top: light.y - effectiveRadius,
              width: effectiveRadius * 2,
              height: effectiveRadius * 2,
              background: `radial-gradient(circle, ${light.color} 0%, ${light.color}50 70%, ${light.color}00 100%)`,
            }}
          />
        );
      })}
    </div>
  );
};

export default LightingSystem;
