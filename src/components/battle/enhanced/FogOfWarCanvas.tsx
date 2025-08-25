import React, { useEffect, useRef, useState } from 'react';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';

export const FogOfWarCanvas: React.FC = () => {
  const { fogEnabled, fogBrushSize, fogMode, fogEditMode } = useEnhancedBattleStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  // Initialize canvas with fog only when fog is first enabled
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !fogEnabled) return;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      
      // Fill with initial fog only on first initialization
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(0, 0, rect.width, rect.height);
      console.log('🌫️ Fog canvas initialized', { fogEnabled, width: rect.width, height: rect.height });
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [fogEnabled]); // Убрал fogEditMode из зависимостей чтобы не сбрасывать нарисованное

  const paint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !fogEnabled || !fogEditMode) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check for override keys
    const forceReveal = e.shiftKey;
    const forceHide = e.altKey;
    const effectiveMode = forceReveal ? 'reveal' : forceHide ? 'hide' : fogMode;

    if (effectiveMode === 'reveal') {
      // Erase fog (reveal area)
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, fogBrushSize, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Draw fog (hide area)
      ctx.globalCompositeOperation = 'source-over';
      
      // Create gradient for smooth edges matching global fog opacity
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, fogBrushSize);
      gradient.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
      gradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.3)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, fogBrushSize, 0, Math.PI * 2);
      ctx.fill();
    }
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!fogEditMode) {
      console.log('🌫️ Drawing blocked - fog edit mode disabled');
      return;
    }
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
      onMouseMove={paint}
      onMouseUp={stopDrawing}
      onMouseLeave={stopDrawing}
    />
  );
};