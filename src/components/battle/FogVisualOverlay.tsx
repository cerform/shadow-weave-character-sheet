import React, { useMemo } from 'react';
import { useFogOfWarStore } from '@/stores/fogOfWarStore';

interface FogVisualOverlayProps {
  mapWidth: number;
  mapHeight: number;
  scale?: number;
}

export const FogVisualOverlay: React.FC<FogVisualOverlayProps> = ({ 
  mapWidth, 
  mapHeight, 
  scale = 1 
}) => {
  const { visibleAreas, fogSettings } = useFogOfWarStore();

  const fogStyle = useMemo(() => ({
    background: `
      radial-gradient(circle at 20% 30%, ${fogSettings.fogColor}CC 10%, ${fogSettings.fogColor}AA 40%),
      radial-gradient(circle at 80% 70%, ${fogSettings.fogColor}BB 15%, ${fogSettings.fogColor}88 50%),
      radial-gradient(circle at 40% 80%, ${fogSettings.fogColor}99 20%, ${fogSettings.fogColor}66 60%),
      linear-gradient(45deg, ${fogSettings.fogColor}${Math.round(fogSettings.fogOpacity * 255).toString(16).padStart(2, '0')} 0%, ${fogSettings.fogColor}DD 100%)
    `,
    filter: `blur(${fogSettings.blurAmount}px)`,
    transition: `all ${fogSettings.transitionSpeed}s ease-in-out`,
    animation: 'fogFlow 12s ease-in-out infinite'
  }), [fogSettings]);

  const secondaryFogStyle = useMemo(() => ({
    background: `
      radial-gradient(ellipse at 60% 40%, ${fogSettings.fogColor}66 20%, ${fogSettings.fogColor}44 70%),
      radial-gradient(ellipse at 10% 90%, ${fogSettings.fogColor}55 30%, ${fogSettings.fogColor}33 80%)
    `,
    filter: `blur(${fogSettings.blurAmount + 3}px)`,
    animation: 'fogFlow2 18s ease-in-out infinite reverse'
  }), [fogSettings]);

  if (!fogSettings.enabled || fogSettings.globalReveal) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none z-20"
      style={{
        width: mapWidth * scale,
        height: mapHeight * scale,
      }}
    >
      {/* Base fog layer - covers everything */}
      <div
        className="absolute inset-0"
        style={fogStyle}
      />
      
      {/* Secondary fog layer for depth */}
      <div
        className="absolute inset-0"
        style={secondaryFogStyle}
      />

      {/* Mask for visible areas - creates holes in the fog */}
      <svg 
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: 'multiply' }}
      >
        <defs>
          <mask id="visibleMask">
            {/* Start with white (visible) background */}
            <rect width="100%" height="100%" fill="white" />
            
            {/* Add black (hidden) circles for each visible area */}
            {visibleAreas.map((area) => {
              if (area.type === 'circle') {
                return (
                  <circle
                    key={area.id}
                    cx={area.x * scale}
                    cy={area.y * scale}
                    r={area.radius * scale}
                    fill="black"
                    style={{
                      filter: `blur(${Math.max(0, fogSettings.blurAmount - 4)}px)`
                    }}
                  />
                );
              } else if (area.type === 'rectangle') {
                return (
                  <rect
                    key={area.id}
                    x={area.x * scale}
                    y={area.y * scale}
                    width={(area.width || 100) * scale}
                    height={(area.height || 100) * scale}
                    fill="black"
                    style={{
                      filter: `blur(${Math.max(0, fogSettings.blurAmount - 4)}px)`
                    }}
                  />
                );
              }
              return null;
            })}
          </mask>
        </defs>
        
        {/* Apply mask to a colored rectangle that represents the fog */}
        <rect 
          width="100%" 
          height="100%" 
          fill={fogSettings.fogColor}
          mask="url(#visibleMask)"
          opacity={fogSettings.fogOpacity}
        />
      </svg>

      {/* Fog particles effect */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `
            radial-gradient(2px 2px at 20px 30px, ${fogSettings.fogColor}, transparent),
            radial-gradient(2px 2px at 40px 70px, ${fogSettings.fogColor}, transparent),
            radial-gradient(1px 1px at 90px 40px, ${fogSettings.fogColor}, transparent),
            radial-gradient(1px 1px at 130px 80px, ${fogSettings.fogColor}, transparent)
          `,
          backgroundSize: '200px 100px',
          animation: 'fogParticles 25s linear infinite'
        }}
      />
    </div>
  );
};