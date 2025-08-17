import React, { useMemo } from 'react';
import { useFogOfWarStore } from '@/stores/fogOfWarStore';

interface AnimatedFogOverlayProps {
  mapWidth: number;
  mapHeight: number;
  scale?: number;
}

export const AnimatedFogOverlay: React.FC<AnimatedFogOverlayProps> = ({ 
  mapWidth, 
  mapHeight, 
  scale = 1 
}) => {
  const { fogAreas, fogSettings, isDM } = useFogOfWarStore();

  const fogStyle = useMemo(() => ({
    background: `
      radial-gradient(circle at 20% 30%, ${fogSettings.fogColor}AA 10%, transparent 40%),
      radial-gradient(circle at 80% 70%, ${fogSettings.fogColor}77 15%, transparent 50%),
      radial-gradient(circle at 40% 80%, ${fogSettings.fogColor}55 20%, transparent 60%),
      linear-gradient(45deg, ${fogSettings.fogColor}${Math.round(fogSettings.fogOpacity * 255).toString(16).padStart(2, '0')} 0%, transparent 100%)
    `,
    filter: `blur(${fogSettings.blurAmount}px)`,
    transition: `all ${fogSettings.transitionSpeed}s ease-in-out`,
    animation: 'fogFlow 10s ease-in-out infinite'
  }), [fogSettings]);

  const secondaryFogStyle = useMemo(() => ({
    background: `
      radial-gradient(ellipse at 60% 40%, transparent 20%, ${fogSettings.fogColor}44 70%),
      radial-gradient(ellipse at 10% 90%, transparent 30%, ${fogSettings.fogColor}33 80%)
    `,
    filter: `blur(${fogSettings.blurAmount + 5}px)`,
    animation: 'fogFlow2 15s ease-in-out infinite reverse'
  }), [fogSettings]);

  if (!fogSettings.enabled || fogSettings.globalReveal) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        width: mapWidth * scale,
        height: mapHeight * scale,
      }}
    >
      {/* Primary animated fog layer */}
      <div
        className="absolute inset-0"
        style={fogStyle}
      />
      
      {/* Secondary fog layer for depth */}
      <div
        className="absolute inset-0"
        style={secondaryFogStyle}
      />

      {/* Fog holes for revealed areas */}
      {fogAreas.map((area) => (
        area.revealed && (
          <div
            key={area.id}
            className="absolute"
            style={{
              left: area.type === 'circle' 
                ? (area.x - area.radius) * scale 
                : area.x * scale,
              top: area.type === 'circle' 
                ? (area.y - area.radius) * scale 
                : area.y * scale,
              width: area.type === 'circle' 
                ? area.radius * 2 * scale 
                : (area.width || 100) * scale,
              height: area.type === 'circle' 
                ? area.radius * 2 * scale 
                : (area.height || 100) * scale,
              borderRadius: area.type === 'circle' ? '50%' : '0',
              background: 'transparent',
              boxShadow: `inset 0 0 0 9999px ${fogSettings.fogColor}`,
              filter: `blur(${Math.max(0, fogSettings.blurAmount - 2)}px)`,
              animation: 'revealFade 1s ease-out',
              mixBlendMode: 'multiply'
            }}
          />
        )
      ))}
      
      {/* Fog particles effect */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            radial-gradient(2px 2px at 20px 30px, ${fogSettings.fogColor}, transparent),
            radial-gradient(2px 2px at 40px 70px, ${fogSettings.fogColor}, transparent),
            radial-gradient(1px 1px at 90px 40px, ${fogSettings.fogColor}, transparent),
            radial-gradient(1px 1px at 130px 80px, ${fogSettings.fogColor}, transparent)
          `,
          backgroundSize: '200px 100px',
          animation: 'fogParticles 20s linear infinite'
        }}
      />
    </div>
  );
};