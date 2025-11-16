import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Move, 
  Sword, 
  Sparkles, 
  Package, 
  SkipForward, 
  Dice6,
  Shield,
  Heart
} from 'lucide-react';
import { CombatEntity } from '@/engine/combat/types';

interface ActionBarProps {
  activeEntity?: CombatEntity;
  isCurrentPlayer: boolean;
  isDM: boolean;
  onMove: () => void;
  onAttack: () => void;
  onCastSpell: () => void;
  onUseItem: () => void;
  onEndTurn: () => void;
  onDiceRoll: () => void;
  onDefend: () => void;
  onHeal: () => void;
}

export function ActionBar({ 
  activeEntity, 
  isCurrentPlayer, 
  isDM,
  onMove,
  onAttack,
  onCastSpell,
  onUseItem,
  onEndTurn,
  onDiceRoll,
  onDefend,
  onHeal
}: ActionBarProps) {
  const canAct = isCurrentPlayer || isDM;
  const hasMovement = activeEntity?.movement.current && activeEntity.movement.current > 0;
  const hasAction = activeEntity?.actions && !activeEntity.actions.usedAction;
  const hasBonus = activeEntity?.actions && !activeEntity.actions.usedBonus;

  return (
    <Card className="fixed bottom-4 left-1/2 -translate-x-1/2 z-30 bg-background/95 backdrop-blur-sm border shadow-lg">
      <div className="flex items-center gap-2 p-3">
        {/* Movement */}
        <Button
          variant={hasMovement ? "default" : "secondary"}
          size="sm"
          onClick={onMove}
          disabled={!canAct || !hasMovement}
          className="flex items-center gap-2"
        >
          <Move className="h-4 w-4" />
          <span className="hidden sm:inline">Move</span>
          {hasMovement && (
            <Badge variant="outline" className="ml-1 text-xs">
              {activeEntity?.movement.current}ft
            </Badge>
          )}
        </Button>

        {/* Attack */}
        <Button
          variant={hasAction ? "default" : "secondary"}
          size="sm"
          onClick={onAttack}
          disabled={!canAct || !hasAction}
          className="flex items-center gap-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
        >
          <Sword className="h-4 w-4" />
          <span className="hidden sm:inline">Attack</span>
        </Button>

        {/* Cast Spell */}
        <Button
          variant={hasAction ? "default" : "secondary"}
          size="sm"
          onClick={onCastSpell}
          disabled={!canAct || !hasAction}
          className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white"
        >
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Spell</span>
        </Button>

        {/* Use Item */}
        <Button
          variant={hasBonus ? "default" : "secondary"}
          size="sm"
          onClick={onUseItem}
          disabled={!canAct}
          className="flex items-center gap-2"
        >
          <Package className="h-4 w-4" />
          <span className="hidden sm:inline">Item</span>
        </Button>

        {/* Defend */}
        <Button
          variant="outline"
          size="sm"
          onClick={onDefend}
          disabled={!canAct}
          className="flex items-center gap-2"
        >
          <Shield className="h-4 w-4" />
          <span className="hidden sm:inline">Defend</span>
        </Button>

        {/* Heal */}
        <Button
          variant="outline"
          size="sm"
          onClick={onHeal}
          disabled={!canAct}
          className="flex items-center gap-2 text-green-600 hover:text-green-700"
        >
          <Heart className="h-4 w-4" />
          <span className="hidden sm:inline">Heal</span>
        </Button>

        {/* Separator */}
        <div className="w-px h-6 bg-border mx-2" />

        {/* Dice Roller */}
        <Button
          variant="outline"
          size="sm"
          onClick={onDiceRoll}
          className="flex items-center gap-2"
        >
          <Dice6 className="h-4 w-4" />
          <span className="hidden sm:inline">🎲</span>
        </Button>

        {/* End Turn */}
        <Button
          variant="default"
          size="sm"
          onClick={onEndTurn}
          disabled={!canAct}
          className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          <SkipForward className="h-4 w-4" />
          <span>End Turn</span>
        </Button>
      </div>

      {/* Active Entity Info */}
      {activeEntity && (
        <div className="px-3 pb-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="font-medium">{activeEntity.name}</span>
            <span>HP: {Number(activeEntity.hp.current || 0)}/{Number(activeEntity.hp.max || 1)}</span>
            <span>AC: {activeEntity.ac}</span>
            {activeEntity.conditions.length > 0 && (
              <div className="flex gap-1">
                {activeEntity.conditions.map((condition, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {String(condition.key || condition)}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}