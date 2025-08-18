import React, { useEffect, useState } from 'react';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';

export const FogBrushCursor: React.FC = () => {
  const { fogEnabled, fogBrushSize, fogMode } = useEnhancedBattleStore();
  const [cursorPosition, setCursorPosition] = useState({ x: -9999, y: -9999 });
  const [isOverCanvas, setIsOverCanvas] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setCursorPosition({ x: e.clientX, y: e.clientY });
      
      // Check if cursor is over the fog canvas
      const target = e.target as HTMLElement;
      setIsOverCanvas(target?.tagName === 'CANVAS');
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  if (!fogEnabled || !isOverCanvas) return null;

  const cursorColor = fogMode === 'reveal' ? '#22c55e' : '#ef4444'; // green for reveal, red for hide
  const cursorSize = fogBrushSize * 2;

  return (
    <div
      className="pointer-events-none fixed z-50 transition-all duration-100"
      style={{
        left: cursorPosition.x - fogBrushSize,
        top: cursorPosition.y - fogBrushSize,
        width: cursorSize,
        height: cursorSize,
        borderRadius: '50%',
        border: `2px dashed ${cursorColor}`,
        backgroundColor: `${cursorColor}15`,
        boxShadow: `0 0 20px ${cursorColor}40`,
      }}
    >
      {/* Center dot */}
      <div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: '4px',
          height: '4px',
          backgroundColor: cursorColor,
        }}
      />
      
      {/* Mode indicator */}
      <div
        className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-2 py-1 text-xs font-medium rounded"
        style={{
          backgroundColor: cursorColor,
          color: '#ffffff',
        }}
      >
        {fogMode === 'reveal' ? '🖌️ Открыть' : '🧽 Скрыть'}
      </div>
    </div>
  );
};