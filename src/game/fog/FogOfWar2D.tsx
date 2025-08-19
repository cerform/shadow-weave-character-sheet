import React, { useRef, useEffect } from "react";
import { FogGrid } from "./FogGrid";

export const FogOfWar2D: React.FC<{ grid: FogGrid, width: number, height: number }> = ({ grid, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, width, height);

    for (let y = 0; y < grid.rows; y++) {
      for (let x = 0; x < grid.cols; x++) {
        const state = grid.get(x, y);
        if (state === 0) ctx.fillStyle = "rgba(0,0,0,0.9)";
        else if (state === 1) ctx.fillStyle = "rgba(0,0,0,0.5)";
        else if (state === 2) continue;
        
        ctx.fillRect(
          x * grid.cellSize, 
          y * grid.cellSize, 
          grid.cellSize, 
          grid.cellSize
        );
      }
    }
  }, [grid, width, height]);

  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height} 
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none"
      }} 
    />
  );
};