import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize, Minimize } from 'lucide-react';
import { MapScaleController } from './MapScaleController';

interface MapZoomWidgetProps {
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onFitToScreen?: () => void;
  onResetView?: () => void;
  minZoom?: number;
  maxZoom?: number;
  className?: string;
  compact?: boolean;
}

export const MapZoomWidget: React.FC<MapZoomWidgetProps> = ({
  zoom,
  onZoomChange,
  onFitToScreen,
  onResetView,
  minZoom = 25,
  maxZoom = 400,
  className = "",
  compact = false
}) => {
  const quickZoomIn = () => {
    onZoomChange(Math.min(zoom + 25, maxZoom));
  };

  const quickZoomOut = () => {
    onZoomChange(Math.max(zoom - 25, minZoom));
  };

  if (compact) {
    return (
      <div className={`flex items-center gap-1 bg-background/90 backdrop-blur rounded-md p-1 border shadow-sm ${className}`}>
        <Button
          variant="ghost"
          size="sm"
          onClick={quickZoomOut}
          disabled={zoom <= minZoom}
          className="h-7 w-7 p-0"
        >
          <ZoomOut className="h-3 w-3" />
        </Button>
        
        <span className="text-xs font-medium px-2 min-w-[50px] text-center">
          {Math.round(zoom)}%
        </span>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={quickZoomIn}
          disabled={zoom >= maxZoom}
          className="h-7 w-7 p-0"
        >
          <ZoomIn className="h-3 w-3" />
        </Button>
        
        {onFitToScreen && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onFitToScreen}
            className="h-7 w-7 p-0"
          >
            <Maximize className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={`bg-background/90 backdrop-blur-sm border shadow-lg ${className}`}>
      <CardContent className="p-3 space-y-3">
        <MapScaleController
          scale={zoom}
          onScaleChange={onZoomChange}
          min={minZoom}
          max={maxZoom}
          step={5}
          label="Масштаб просмотра"
          showSlider={true}
          showButtons={false}
        />
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={quickZoomOut}
            disabled={zoom <= minZoom}
            className="flex-1"
          >
            <ZoomOut className="h-4 w-4 mr-1" />
            -25%
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={quickZoomIn}
            disabled={zoom >= maxZoom}
            className="flex-1"
          >
            <ZoomIn className="h-4 w-4 mr-1" />
            +25%
          </Button>
        </div>
        
        {(onFitToScreen || onResetView) && (
          <div className="flex gap-2">
            {onFitToScreen && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onFitToScreen}
                className="flex-1"
              >
                <Maximize className="h-4 w-4 mr-1" />
                По размеру
              </Button>
            )}
            
            {onResetView && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onResetView}
                className="flex-1"
              >
                <Minimize className="h-4 w-4 mr-1" />
                100%
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};