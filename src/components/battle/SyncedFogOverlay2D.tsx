// src/components/battle/SyncedFogOverlay2D.tsx
import React, { useEffect, useRef } from "react";
import { useFogGridStore } from "@/stores/fogGridStore";

type Props = {
  /** if provided, overlays will render to this exact size; else use parent size */
  width?: number;
  height?: number;
  blurPx?: number;          // soft edges
  opacityHidden?: number;   // 0..1
  opacityExplored?: number; // 0..1
  className?: string;
};

export const SyncedFogOverlay2D: React.FC<Props> = ({
  width,
  height,
  blurPx = 6,
  opacityHidden = 0.92,
  opacityExplored = 0.55,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const version = useFogGridStore(s => s.version);
  const raw = useFogGridStore(s => s.raw);
  const dims = useFogGridStore(s => s.dims);
  const cellSize = useFogGridStore(s => s.cellSize);

  // auto-bounds to parent
  useEffect(() => {
    const el = canvasRef.current?.parentElement;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (!canvasRef.current) return;
      const w = width ?? el.clientWidth;
      const h = height ?? el.clientHeight;
      canvasRef.current.width = w;
      canvasRef.current.height = h;
      draw();
    });
    ro.observe(el);
    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  useEffect(() => { draw(); /* redraw on version */ }, [version]);

  const draw = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const data = raw();
    const { cols, rows } = dims();

    // clear & soft edges
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // scale to match grid cells exactly
    const scaleX = canvas.width / (cols * cellSize());
    const scaleY = canvas.height / (rows * cellSize());
    ctx.save();
    ctx.scale(scaleX, scaleY);

    // set blur for soft borders
    (ctx as any).filter = `blur(${blurPx}px)`;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const state = data[y * cols + x];
        if (state === 2) continue; // visible => transparent
        ctx.globalAlpha = state === 0 ? opacityHidden : opacityExplored;
        ctx.fillStyle = "#000";
        ctx.fillRect(x * cellSize(), y * cellSize(), cellSize(), cellSize());
      }
    }

    ctx.restore();
  };

  return (
    <canvas
      ref={canvasRef}
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ zIndex: 40 }}
    />
  );
};

export default SyncedFogOverlay2D;