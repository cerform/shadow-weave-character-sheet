import React, { useEffect, useRef, useState } from 'react';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';

export const FogOfWarCanvas: React.FC = () => {
  const { fogEnabled, fogBrushSize, fogMode, fogEditMode } = useEnhancedBattleStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fogDataRef = useRef<ImageData | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize canvas with fog data
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fogEnabled) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      // Create fog data if not exists
      if (!fogDataRef.current || fogDataRef.current.width !== width || fogDataRef.current.height !== height) {
        fogDataRef.current = ctx.createImageData(width, height);
        const data = fogDataRef.current.data;
        
        // Fill with initial fog (semi-transparent black)
        for (let i = 0; i < data.length; i += 4) {
          data[i] = 0;     // R
          data[i + 1] = 0; // G
          data[i + 2] = 0; // B
          data[i + 3] = 153; // A (0.6 opacity * 255)
        }
      }
      
      // Draw fog data to canvas
      ctx.putImageData(fogDataRef.current, 0, 0);
      console.log('🌫️ Fog canvas initialized', { fogEnabled, width, height });
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [fogEnabled]);

  const paint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!fogEnabled || !fogEditMode || !fogDataRef.current) return;
    
    // Если не рисуем, не продолжаем
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(e.clientX - rect.left);
    const y = Math.floor(e.clientY - rect.top);

    // Check for override keys
    const forceReveal = e.shiftKey;
    const forceHide = e.altKey;
    const effectiveMode = forceReveal ? 'reveal' : forceHide ? 'hide' : fogMode;

    const data = fogDataRef.current.data;
    const width = fogDataRef.current.width;
    const height = fogDataRef.current.height;
    
    // Paint in circle area
    const brushRadius = Math.floor(fogBrushSize);
    
    for (let dy = -brushRadius; dy <= brushRadius; dy++) {
      for (let dx = -brushRadius; dx <= brushRadius; dx++) {
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= brushRadius) {
          const pixelX = x + dx;
          const pixelY = y + dy;
          
          if (pixelX >= 0 && pixelX < width && pixelY >= 0 && pixelY < height) {
            const index = (pixelY * width + pixelX) * 4;
            
            if (effectiveMode === 'reveal') {
              // Reveal area - make transparent
              data[index + 3] = 0;
            } else {
              // Hide area - soft edge based on distance
              const opacity = Math.max(0, 1 - (distance / brushRadius));
              const targetAlpha = Math.floor(153 * opacity); // 153 = 0.6 * 255
              data[index + 3] = Math.max(data[index + 3], targetAlpha);
            }
          }
        }
      }
    }
    
    // Update canvas
    ctx.putImageData(fogDataRef.current, 0, 0);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!fogEditMode) {
      console.log('🌫️ Drawing blocked - fog edit mode disabled');
      return;
    }
    
    // Предотвращаем перетаскивание карты
    e.preventDefault();
    e.stopPropagation();
    
    console.log('🌫️ Starting fog drawing', { fogMode, fogBrushSize });
    setIsDrawing(true);
    paint(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  if (!fogEnabled) return null;

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full ${fogEditMode ? 'pointer-events-auto' : 'pointer-events-none'}`}
      style={{
        display: fogEnabled ? 'block' : 'none',
        cursor: fogEditMode ? (isDrawing ? 'none' : fogMode === 'reveal' ? 'crosshair' : 'grab') : 'default',
        touchAction: fogEditMode ? 'none' : 'auto',
        zIndex: 10, // Ниже чем у элементов управления
      }}
      onMouseDown={startDrawing}
      onMouseMove={(e) => {
        // Предотвращаем перетаскивание карты при рисовании
        if (isDrawing) {
          e.preventDefault();
          e.stopPropagation();
        }
        paint(e);
      }}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
    />
  );
};