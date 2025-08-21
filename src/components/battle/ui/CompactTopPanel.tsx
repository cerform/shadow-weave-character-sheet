import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Settings, 
  Pause, 
  Play,
  RotateCcw,
  Home
} from 'lucide-react';
import { CombatEntity, CombatState } from '@/engine/combat/types';
import { useNavigate } from 'react-router-dom';

interface CompactTopPanelProps {
  combatState: CombatState;
  activeEntity?: CombatEntity;
  isDM: boolean;
  onPauseCombat: () => void;
  onResetCombat: () => void;
  combatActive: boolean;
}

export function CompactTopPanel({
  combatState,
  activeEntity,
  isDM,
  onPauseCombat,
  onResetCombat,
  combatActive
}: CompactTopPanelProps) {
  const navigate = useNavigate();

  return (
    <Card className="fixed top-4 left-1/2 -translate-x-1/2 z-30 bg-background/95 backdrop-blur-sm shadow-lg">
      <div className="flex items-center gap-4 px-4 py-2">
        {/* Navigation */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline">Home</span>
        </Button>

        {/* Combat Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-medium">Round {combatState.round}</span>
            <Badge variant="outline" className="capitalize">
              {combatState.phase.replace('_', ' ')}
            </Badge>
          </div>

          {activeEntity && (
            <>
              <div className="w-px h-6 bg-border" />
              <div className="flex items-center gap-3">
                <span className="font-medium text-sm">
                  {activeEntity.name}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">HP:</span>
                  <Progress 
                    value={(activeEntity.hp.current / activeEntity.hp.max) * 100} 
                    className="w-16 h-2"
                  />
                  <span className="text-xs font-mono">
                    {activeEntity.hp.current}/{activeEntity.hp.max}
                  </span>
                </div>
                <Badge variant="outline" className="text-xs">
                  AC {activeEntity.ac}
                </Badge>
              </div>
            </>
          )}
        </div>

        {/* DM Controls */}
        {isDM && (
          <>
            <div className="w-px h-6 bg-border" />
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={onPauseCombat}
                className="flex items-center gap-1"
              >
                {combatActive ? (
                  <>
                    <Pause className="h-4 w-4" />
                    <span className="hidden sm:inline">Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span className="hidden sm:inline">Resume</span>
                  </>
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onResetCombat}
                className="flex items-center gap-1 text-destructive hover:text-destructive"
              >
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
            </div>
          </>
        )}

        {/* Help Text */}
        <div className="hidden lg:block text-xs text-muted-foreground">
          WASD: Camera • R: Ruler • Space: End Turn
        </div>
      </div>
    </Card>
  );
}