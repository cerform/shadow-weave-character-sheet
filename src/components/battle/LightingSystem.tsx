
import React from 'react';
import { Circle } from 'react-konva';

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
    <>
      {/* Глобальное затенение - полупрозрачный прямоугольник, если не день */}
      {!isDaytime && (
        <Circle
          x={0}
          y={0}
          radius={99999} // Очень большой круг, чтобы покрыть всю карту
          fill="black"
          opacity={1 - ambientLightLevel}
          perfectDrawEnabled={false}
          listening={false}
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
          <Circle
            key={light.id}
            x={light.x}
            y={light.y}
            radius={effectiveRadius}
            fillRadialGradientStartPoint={{ x: 0, y: 0 }}
            fillRadialGradientStartRadius={0}
            fillRadialGradientEndPoint={{ x: 0, y: 0 }}
            fillRadialGradientEndRadius={effectiveRadius}
            fillRadialGradientColorStops={[
              0, light.color,
              0.7, `${light.color}50`, // Полупрозрачный на 70%
              1, `${light.color}00`    // Полностью прозрачный на границе
            ]}
            globalCompositeOperation='lighter'
            listening={false}
          />
        );
      })}
    </>
  );
};

export default LightingSystem;
