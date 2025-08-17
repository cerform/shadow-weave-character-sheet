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
      radial-gradient(circle at 20% 10%, rgba(135, 140, 150, 0.1) 5%, rgba(135, 140, 150, 0.3) 25%),
      radial-gradient(circle at 80% 20%, rgba(140, 145, 155, 0.15) 8%, rgba(140, 145, 155, 0.35) 30%),
      radial-gradient(circle at 40% 15%, rgba(145, 150, 160, 0.12) 10%, rgba(145, 150, 160, 0.32) 35%),
      linear-gradient(180deg, rgba(140, 145, 155, ${fogSettings.fogOpacity * 0.4}) 0%, rgba(140, 145, 155, ${fogSettings.fogOpacity * 0.15}) 40%, transparent 70%)
    `,
    filter: `blur(${fogSettings.blurAmount}px)`,
    transition: `all ${fogSettings.transitionSpeed}s ease-in-out`,
    animation: 'fogFlow 15s ease-in-out infinite',
    mixBlendMode: 'multiply' as const,
    backgroundPosition: '0 0, 100% 0, 50% 0, 0 0',
    backgroundSize: '60% 40%, 70% 45%, 80% 50%, 100% 100%'
  }), [fogSettings]);

  const secondaryFogStyle = useMemo(() => ({
    background: `
      radial-gradient(ellipse at 60% 5%, rgba(150, 155, 165, 0.08) 15%, rgba(150, 155, 165, 0.25) 60%),
      radial-gradient(ellipse at 10% 12%, rgba(155, 160, 170, 0.12) 20%, rgba(155, 160, 170, 0.28) 70%),
      linear-gradient(180deg, rgba(150, 155, 165, ${fogSettings.fogOpacity * 0.2}) 0%, transparent 50%)
    `,
    filter: `blur(${fogSettings.blurAmount + 2}px)`,
    animation: 'fogFlow2 20s ease-in-out infinite reverse',
    mixBlendMode: 'multiply' as const,
    backgroundPosition: '0 0, 100% 0, 0 0',
    backgroundSize: '80% 60%, 90% 65%, 100% 80%'
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
        
        {/* Sky fog gradient definition */}
        <defs>
          <linearGradient id="skyFogGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(160, 165, 175, 0.8)" />
            <stop offset="30%" stopColor="rgba(140, 145, 155, 0.6)" />
            <stop offset="70%" stopColor="rgba(120, 125, 135, 0.3)" />
            <stop offset="100%" stopColor="rgba(100, 105, 115, 0.1)" />
          </linearGradient>
        </defs>
        
        {/* Apply mask to a sky-oriented fog texture */}
        <rect 
          width="100%" 
          height="100%" 
          fill="url(#skyFogGradient)"
          mask="url(#visibleMask)"
          style={{
            filter: `blur(${fogSettings.blurAmount * 0.5}px)`
          }}
        />
      </svg>

      {/* Sky-oriented fog particles effect */}
      <div
        className="absolute inset-0 opacity-15"
        style={{
          background: `
            radial-gradient(3px 3px at 20px 15px, rgba(160, 165, 175, 0.4), transparent),
            radial-gradient(4px 4px at 40px 25px, rgba(165, 170, 180, 0.3), transparent),
            radial-gradient(2px 2px at 90px 20px, rgba(170, 175, 185, 0.5), transparent),
            radial-gradient(3px 3px at 130px 30px, rgba(155, 160, 170, 0.3), transparent),
            linear-gradient(180deg, rgba(160, 165, 175, 0.2) 0%, transparent 40%)
          `,
          backgroundSize: '250px 80px, 200px 60px, 180px 70px, 220px 65px, 100% 50%',
          backgroundPosition: '0 0, 50px 10px, 100px 5px, 150px 15px, 0 0',
          animation: 'fogParticles 30s linear infinite',
          mixBlendMode: 'multiply'
        }}
      />
    </div>
  );
};