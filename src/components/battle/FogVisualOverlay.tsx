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
      radial-gradient(circle at 20% 30%, rgba(40, 44, 52, 0.3) 10%, rgba(40, 44, 52, 0.6) 40%),
      radial-gradient(circle at 80% 70%, rgba(45, 50, 58, 0.4) 15%, rgba(45, 50, 58, 0.7) 50%),
      radial-gradient(circle at 40% 80%, rgba(50, 55, 63, 0.35) 20%, rgba(50, 55, 63, 0.65) 60%),
      linear-gradient(45deg, rgba(45, 50, 58, ${fogSettings.fogOpacity * 0.4}) 0%, rgba(55, 60, 68, ${fogSettings.fogOpacity * 0.6}) 100%)
    `,
    filter: `blur(${fogSettings.blurAmount}px)`,
    transition: `all ${fogSettings.transitionSpeed}s ease-in-out`,
    animation: 'fogFlow 12s ease-in-out infinite',
    mixBlendMode: 'multiply' as const
  }), [fogSettings]);

  const secondaryFogStyle = useMemo(() => ({
    background: `
      radial-gradient(ellipse at 60% 40%, rgba(65, 70, 78, 0.2) 20%, rgba(65, 70, 78, 0.5) 70%),
      radial-gradient(ellipse at 10% 90%, rgba(70, 75, 83, 0.25) 30%, rgba(70, 75, 83, 0.45) 80%)
    `,
    filter: `blur(${fogSettings.blurAmount + 3}px)`,
    animation: 'fogFlow2 18s ease-in-out infinite reverse',
    mixBlendMode: 'multiply' as const
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
        style={{ mixBlendMode: 'screen' }}
      >
        <defs>
          <mask id="visibleMask">
            {/* Start with black (hidden) background */}
            <rect width="100%" height="100%" fill="black" />
            
            {/* Add white (visible) circles for each visible area with soft gradients */}
            {visibleAreas.map((area) => {
              if (area.type === 'circle') {
                return (
                  <g key={area.id}>
                    <defs>
                      <radialGradient id={`gradient-${area.id}`} cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor="white" stopOpacity="1" />
                        <stop offset="70%" stopColor="white" stopOpacity="0.8" />
                        <stop offset="90%" stopColor="white" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="white" stopOpacity="0" />
                      </radialGradient>
                    </defs>
                    <circle
                      cx={area.x * scale}
                      cy={area.y * scale}
                      r={area.radius * scale * 1.2}
                      fill={`url(#gradient-${area.id})`}
                    />
                  </g>
                );
              } else if (area.type === 'rectangle') {
                return (
                  <rect
                    key={area.id}
                    x={area.x * scale - 10}
                    y={area.y * scale - 10}
                    width={(area.width || 100) * scale + 20}
                    height={(area.height || 100) * scale + 20}
                    fill="white"
                    opacity="0.8"
                    style={{
                      filter: `blur(${Math.max(0, fogSettings.blurAmount - 2)}px)`
                    }}
                  />
                );
              }
              return null;
            })}
          </mask>
        </defs>
        
        {/* Apply mask to a realistic fog texture */}
        <rect 
          width="100%" 
          height="100%" 
          fill="rgba(80, 85, 95, 0.7)"
          mask="url(#visibleMask)"
          style={{
            filter: `blur(${fogSettings.blurAmount * 0.5}px)`
          }}
        />
      </svg>

      {/* Realistic fog particles effect */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `
            radial-gradient(2px 2px at 20px 30px, rgba(120, 125, 135, 0.6), transparent),
            radial-gradient(3px 3px at 40px 70px, rgba(125, 130, 140, 0.5), transparent),
            radial-gradient(1px 1px at 90px 40px, rgba(130, 135, 145, 0.7), transparent),
            radial-gradient(2px 2px at 130px 80px, rgba(115, 120, 130, 0.4), transparent)
          `,
          backgroundSize: '200px 100px',
          animation: 'fogParticles 25s linear infinite',
          mixBlendMode: 'multiply'
        }}
      />
    </div>
  );
};