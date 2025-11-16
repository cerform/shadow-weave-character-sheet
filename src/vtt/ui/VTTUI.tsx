// src/vtt/ui/VTTUI.tsx
import React, { useState } from 'react';
import { VTTCore } from '../engine/VTTCore';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Users } from 'lucide-react';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';

interface VTTUIProps {
  core: VTTCore | null;
  isDM: boolean;
}

export function VTTUI({ core, isDM }: VTTUIProps) {
  const [gridVisible, setGridVisible] = useState(true);
  const tokens = useEnhancedBattleStore((state) => state.tokens);
  
  if (!core) return null;

  const mapDimensions = core.getMapDimensions();
  const playerTokens = tokens.filter(t => !t.isEnemy);
  const enemyTokens = tokens.filter(t => t.isEnemy);

  const toggleGrid = () => {
    const newVisible = !gridVisible;
    core.toggleGrid(newVisible);
    setGridVisible(newVisible);
  };

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
            {mapDimensions && (
              <div className="mt-2 pt-2 border-t border-border space-y-1">
                <p className="text-xs font-semibold text-foreground">Map Info:</p>
                <p className="text-xs">Size: {Math.round(mapDimensions.worldWidth)} × {Math.round(mapDimensions.worldHeight)}</p>
                <p className="text-xs">Grid: {mapDimensions.gridCellSize}px cells</p>
              </div>
            )}
            {tokens.length > 0 && (
              <div className="mt-2 pt-2 border-t border-border space-y-1">
                <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Tokens:
                </p>
                <p className="text-xs">Players: <span className="text-primary">{playerTokens.length}</span></p>
                <p className="text-xs">Enemies: <span className="text-destructive">{enemyTokens.length}</span></p>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Grid controls */}
      {mapDimensions && (
        <div className="absolute top-4 right-4 pointer-events-auto">
          <Card className="p-3 bg-background/90 backdrop-blur-sm border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleGrid}
              className="w-full"
            >
              {gridVisible ? (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Grid Visible
                </>
              ) : (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Grid Hidden
                </>
              )}
            </Button>
          </Card>
        </div>
      )}

      {/* Stage info */}
      <div className="absolute bottom-4 left-4 pointer-events-auto">
        <Card className="p-3 bg-background/90 backdrop-blur-sm border-border">
          <p className="text-xs text-muted-foreground">
            ✓ WebGL Core • ✓ Map + Grid • ✓ Token Rendering • 3/7 complete
          </p>
        </Card>
      </div>
    </div>
  );
}
