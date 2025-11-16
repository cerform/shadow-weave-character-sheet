import React, { useEffect, useRef } from 'react';

interface FogOfWarLayerProps {
  grid: number[][];
  width: number;
  height: number;
  visible: boolean;
}

export function FogOfWarLayer({ grid, width, height, visible }: FogOfWarLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!visible || !canvasRef.current || !grid.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create image data from fog data
    const imageData = ctx.createImageData(width, height);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const revealed = grid[y]?.[x] ?? 0;
        const idx = (y * width + x) * 4;
        // Black fog where not revealed
        imageData.data[idx] = 0; // R
        imageData.data[idx + 1] = 0; // G
        imageData.data[idx + 2] = 0; // B
        imageData.data[idx + 3] = revealed ? 0 : 200; // Alpha (transparent if revealed)
      }
    }

    ctx.putImageData(imageData, 0, 0);
  }, [grid, width, height, visible]);

  if (!visible) return null;

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      style={{ mixBlendMode: 'multiply' }}
    />
  );
}
