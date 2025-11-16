// src/vtt/ui/VTTUI.tsx
import React from 'react';
import { VTTCore } from '../engine/VTTCore';
import { Card } from '@/components/ui/card';

interface VTTUIProps {
  core: VTTCore | null;
  isDM: boolean;
}

export function VTTUI({ core, isDM }: VTTUIProps) {
  if (!core) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {/* Info panel */}
      <div className="absolute top-4 left-4 pointer-events-auto">
        <Card className="p-4 bg-background/90 backdrop-blur-sm border-border">
          <h2 className="text-lg font-semibold text-foreground mb-2">
            WebGL VTT Engine
          </h2>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Status: <span className="text-primary">Active</span></p>
            <p>Mode: <span className="text-primary">{isDM ? 'Dungeon Master' : 'Player'}</span></p>
            <p className="mt-2 text-xs">Rotating test cube visible</p>
          </div>
        </Card>
      </div>

      {/* Controls info */}
      <div className="absolute bottom-4 left-4 pointer-events-auto">
        <Card className="p-3 bg-background/90 backdrop-blur-sm border-border">
          <p className="text-xs text-muted-foreground">
            WebGL Core initialized • Stage 1/7 complete
          </p>
        </Card>
      </div>
    </div>
  );
}
