import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, RotateCcw, Camera } from 'lucide-react';
import { MapScaleController } from './MapScaleController';

interface CameraScaleControllerProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onResetCamera?: () => void;
  minZoom?: number;
  maxZoom?: number;
  className?: string;
}

export const CameraScaleController: React.FC<CameraScaleControllerProps> = ({
  zoom,
  onZoomChange,
  onResetCamera,
  minZoom = 5,
  maxZoom = 50,
  className = ""
}) => {
  const handleResetCamera = () => {
    onZoomChange(20); // Дефолтное расстояние камеры
    onResetCamera?.();
  };

  return (
    <Card className={`bg-background/90 backdrop-blur-sm ${className}`}>
      <CardHeader className="py-2 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <Camera className="h-4 w-4" />
          Управление камерой
        </CardTitle>
      </CardHeader>
      <CardContent className="py-2">
        <MapScaleController
          scale={zoom}
          onScaleChange={onZoomChange}
          min={minZoom}
          max={maxZoom}
          step={1}
          label="Расстояние камеры"
          showSlider={true}
          showButtons={false}
        />
        
        <div className="flex gap-2 mt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onZoomChange(Math.max(zoom - 5, minZoom))}
            disabled={zoom <= minZoom}
            className="flex-1"
          >
            <ZoomIn className="h-4 w-4 mr-1" />
            Приблизить
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetCamera}
            className="px-3"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onZoomChange(Math.min(zoom + 5, maxZoom))}
            disabled={zoom >= maxZoom}
            className="flex-1"
          >
            <ZoomOut className="h-4 w-4 mr-1" />
            Отдалить
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};