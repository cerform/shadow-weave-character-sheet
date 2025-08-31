import React, { useState } from 'react';
import { useThree } from '@react-three/fiber';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Home, RotateCcw } from 'lucide-react';

interface ZoomControlsProps {
  canvasRef?: React.RefObject<HTMLCanvasElement>;
}

export const ZoomControls: React.FC<ZoomControlsProps> = ({ canvasRef }) => {
  const { camera } = useThree();
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => {
    const newZoom = Math.min(zoom * 1.2, 3);
    setZoom(newZoom);
    camera.position.setY(20 / newZoom);
    camera.updateProjectionMatrix();
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(zoom / 1.2, 0.3);
    setZoom(newZoom);
    camera.position.setY(20 / newZoom);
    camera.updateProjectionMatrix();
  };

  const handleReset = () => {
    setZoom(1);
    camera.position.set(0, 20, 0);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  };

  const handleFitView = () => {
    setZoom(0.7);
    camera.position.set(0, 30, 0);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="w-8 h-8 p-0"
        onClick={handleZoomIn}
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
      
      <div className="text-xs text-center text-muted-foreground px-1 font-mono">
        {Math.round(zoom * 100)}%
      </div>
      
      <Button
        variant="outline"
        size="sm"
        className="w-8 h-8 p-0"
        onClick={handleZoomOut}
      >
        <ZoomOut className="h-4 w-4" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="w-8 h-8 p-0"
        onClick={handleReset}
      >
        <Home className="h-3 w-3" />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        className="w-8 h-8 p-0"
        onClick={handleFitView}
      >
        <RotateCcw className="h-3 w-3" />
      </Button>
    </>
  );
};

export default ZoomControls;