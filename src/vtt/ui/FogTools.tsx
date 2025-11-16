// Fog of War Tools UI for DM
import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Eye, EyeOff, Eraser, Brush } from 'lucide-react';
import type { FogBrush } from '../types/fog';

interface FogToolsProps {
  brush: FogBrush;
  onBrushChange: (brush: FogBrush) => void;
  onRevealAll: () => void;
  onHideAll: () => void;
  visible: boolean;
}

export function FogTools({ brush, onBrushChange, onRevealAll, onHideAll, visible }: FogToolsProps) {
  if (!visible) return null;

  return (
    <div className="absolute top-4 right-4 bg-background/95 backdrop-blur border border-border rounded-lg p-4 shadow-lg space-y-4 min-w-[240px]">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Fog of War Tools</h3>
        
        {/* Brush Mode */}
        <div className="flex gap-2">
          <Button
            variant={brush.mode === 'reveal' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onBrushChange({ ...brush, mode: 'reveal' })}
            className="flex-1"
          >
            <Eye className="w-4 h-4 mr-2" />
            Reveal
          </Button>
          <Button
            variant={brush.mode === 'hide' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onBrushChange({ ...brush, mode: 'hide' })}
            className="flex-1"
          >
            <EyeOff className="w-4 h-4 mr-2" />
            Hide
          </Button>
        </div>
        
        {/* Brush Size */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            Brush Size: {brush.radius} tiles
          </label>
          <Slider
            value={[brush.radius]}
            onValueChange={([value]) => onBrushChange({ ...brush, radius: value })}
            min={1}
            max={8}
            step={1}
            className="w-full"
          />
        </div>
        
        {/* Brush Strength */}
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">
            Strength: {Math.round(brush.strength * 100)}%
          </label>
          <Slider
            value={[brush.strength * 100]}
            onValueChange={([value]) => onBrushChange({ ...brush, strength: value / 100 })}
            min={10}
            max={100}
            step={10}
            className="w-full"
          />
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="flex gap-2 pt-2 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={onRevealAll}
          className="flex-1"
        >
          <Brush className="w-4 h-4 mr-2" />
          Reveal All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onHideAll}
          className="flex-1"
        >
          <Eraser className="w-4 h-4 mr-2" />
          Hide All
        </Button>
      </div>
    </div>
  );
}
