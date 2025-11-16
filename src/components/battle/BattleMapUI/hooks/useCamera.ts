import { useState, useCallback, useMemo } from 'react';
import { clamp } from '../utils/clamp';

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.1;

export function useCamera() {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => clamp(prev + ZOOM_STEP, MIN_ZOOM, MAX_ZOOM));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => clamp(prev - ZOOM_STEP, MIN_ZOOM, MAX_ZOOM));
  }, []);

  const handleZoomSet = useCallback((value: number) => {
    setZoom(clamp(value, MIN_ZOOM, MAX_ZOOM));
  }, []);

  const handlePan = useCallback((delta: { x: number; y: number }) => {
    setPan((prev) => ({
      x: prev.x + delta.x,
      y: prev.y + delta.y,
    }));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleFitView = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, []);

  return useMemo(() => ({
    zoom,
    pan,
    handleZoomIn,
    handleZoomOut,
    handleZoomSet,
    handlePan,
    handleReset,
    handleFitView,
  }), [zoom, pan, handleZoomIn, handleZoomOut, handleZoomSet, handlePan, handleReset, handleFitView]);
}
