// Верхняя панель состояния боя
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sword, 
  Zap, 
  Shield, 
  SkipForward,
  Clock,
  Users,
  Activity
} from 'lucide-react';
import { CombatState, CombatEntity } from '@/engine/combat/types';
import { getRemainingActionHints } from '@/engine/combat/rules';

interface TopPanelProps {
  combatState: CombatState;
  activeEntity?: CombatEntity;
  canEndTurn: boolean;
  onEndTurn: () => void;
  isCurrentPlayer: boolean;
}

export const TopPanel: React.FC<TopPanelProps> = ({
  combatState,
  activeEntity,
  canEndTurn,
  onEndTurn,
  isCurrentPlayer
}) => {
  const actionHints = activeEntity ? getRemainingActionHints(activeEntity) : null;

  const getPhaseDisplayName = (phase: string): string => {
    switch (phase) {
      case 'round_start': return 'Начало раунда';
      case 'turn_start': return 'Начало хода';
      case 'action_phase': return 'Фаза действий';
      case 'reaction_phase': return 'Реакции';
      case 'turn_end': return 'Конец хода';
      case 'round_end': return 'Конец раунда';
      default: return 'Ожидание';
    }
  };

  const getActionIcon = (actionType: 'action' | 'bonus' | 'reaction', used: boolean) => {
    const baseClasses = "w-8 h-8 p-1.5 rounded-md border-2 transition-all";
    const usedClasses = used 
      ? "bg-muted border-muted text-muted-foreground opacity-50" 
      : "bg-primary/10 border-primary text-primary shadow-sm";

    const IconComponent = actionType === 'action' ? Sword : 
                         actionType === 'bonus' ? Zap : Shield;

    return (
      <div className={`${baseClasses} ${usedClasses}`} title={
        actionType === 'action' ? 'Основное действие' :
        actionType === 'bonus' ? 'Бонусное действие' : 'Реакция'
      }>
        <IconComponent className="w-full h-full" />
      </div>
    );
  };

  return (
    <div className="w-full h-16 bg-background/95 backdrop-blur-sm border-b border-border flex items-center justify-between px-6 shadow-sm">
      {/* Левая секция: Информация о раунде и ходе */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-primary" />
          <div className="text-sm">
            <div className="font-semibold text-contrast">
              Раунд {combatState.round}
            </div>
            <div className="text-muted-foreground text-xs">
              {getPhaseDisplayName(combatState.phase)}
            </div>
          </div>
        </div>

        {activeEntity && (
          <>
            <div className="w-px h-8 bg-border" />
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center">
                <Users className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-medium text-contrast">
                  {activeEntity.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {activeEntity.isPlayer ? 'Игрок' : 'NPC'}
                </div>
              </div>
            </div>

            {/* HP Bar */}
            <div className="flex items-center gap-2 min-w-[120px]">
              <div className="text-xs text-muted-foreground">HP:</div>
              <div className="flex-1">
                <Progress 
                  value={(activeEntity.hp.current / activeEntity.hp.max) * 100} 
                  className="h-2"
                />
              </div>
              <div className="text-xs font-mono min-w-[50px] text-right">
                {activeEntity.hp.current}/{activeEntity.hp.max}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Центральная секция: Действия */}
      {activeEntity && actionHints && (
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {getActionIcon('action', actionHints.hasAction === false)}
            {getActionIcon('bonus', actionHints.hasBonus === false)}
            {getActionIcon('reaction', actionHints.hasReaction === false)}
          </div>

          <div className="w-px h-8 bg-border" />

          {/* Движение */}
          <div className="flex items-center gap-2">
            <div className="text-xs text-muted-foreground min-w-[80px]">
              Движение:
            </div>
            <Badge variant={actionHints.movementLeft > 0 ? "outline" : "secondary"}>
              {actionHints.movementLeft} фт
            </Badge>
          </div>
        </div>
      )}

      {/* Правая секция: Управление */}
      <div className="flex items-center gap-4">
        {/* Подсказки управления */}
        <div className="text-xs text-muted-foreground hidden lg:block">
          <div>WASD - камера • R - линейка • Space - завершить ход</div>
        </div>

        {/* Кнопка завершения хода */}
        {isCurrentPlayer && activeEntity && (
          <Button
            onClick={onEndTurn}
            disabled={!canEndTurn || combatState.heldForReaction}
            variant={actionHints?.movementLeft === 0 && !actionHints.hasAction && !actionHints.hasBonus ? "default" : "outline"}
            className="flex items-center gap-2 min-w-[140px]"
          >
            {combatState.heldForReaction ? (
              <>
                <Clock className="w-4 h-4 animate-spin" />
                Ожидание...
              </>
            ) : (
              <>
                <SkipForward className="w-4 h-4" />
                Завершить ход
              </>
            )}
          </Button>
        )}

        {/* Индикатор для других игроков */}
        {!isCurrentPlayer && activeEntity && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            Ход: {activeEntity.name}
          </div>
        )}
      </div>
    </div>
  );
};