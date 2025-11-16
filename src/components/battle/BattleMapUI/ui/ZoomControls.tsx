import React from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react';

interface ZoomControlsProps {
  zoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
}

export function ZoomControls({ zoom, onZoomIn, onZoomOut, onReset }: ZoomControlsProps) {
  return (
    <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2 bg-background/90 p-2 rounded-lg shadow-lg">
      <Button size="icon" variant="outline" onClick={onZoomIn} title="Увеличить">
        <ZoomIn className="h-4 w-4" />
      </Button>
      <div className="text-xs text-center font-medium text-muted-foreground">
        {Math.round(zoom * 100)}%
      </div>
      <Button size="icon" variant="outline" onClick={onZoomOut} title="Уменьшить">
        <ZoomOut className="h-4 w-4" />
      </Button>
      <Button size="icon" variant="outline" onClick={onReset} title="Сбросить">
        <Maximize2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
