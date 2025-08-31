import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface MapScaleControllerProps {
  scale: number;
  onScaleChange: (scale: number) => void;
  min?: number;
  max?: number;
  step?: number;
  showSlider?: boolean;
  showButtons?: boolean;
  className?: string;
  label?: string;
}

export const MapScaleController: React.FC<MapScaleControllerProps> = ({
  scale,
  onScaleChange,
  min = 25,
  max = 500,
  step = 5,
  showSlider = true,
  showButtons = true,
  className = "",
  label = "Масштаб"
}) => {
  const handleZoomIn = () => {
    const newScale = Math.min(scale + 25, max);
    onScaleChange(newScale);
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale - 25, min);
    onScaleChange(newScale);
  };

  const handleReset = () => {
    onScaleChange(100);
  };

  const handleSliderChange = (value: number[]) => {
    onScaleChange(value[0]);
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Заголовок с процентами */}
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <span className="text-sm text-muted-foreground">{scale}%</span>
      </div>

      {/* Слайдер */}
      {showSlider && (
        <div className="px-1">
          <Slider
            value={[scale]}
            onValueChange={handleSliderChange}
            min={min}
            max={max}
            step={step}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{min}%</span>
            <span>{max}%</span>
          </div>
        </div>
      )}

      {/* Кнопки управления */}
      {showButtons && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={scale <= min}
            className="flex-1"
          >
            <ZoomOut className="h-4 w-4 mr-1" />
            Уменьшить
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="px-2"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={scale >= max}
            className="flex-1"
          >
            <ZoomIn className="h-4 w-4 mr-1" />
            Увеличить
          </Button>
        </div>
      )}
    </div>
  );
};