// Нижняя панель действий (action bar)
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Sword, 
  Zap, 
  Package, 
  Settings,
  Target,
  Heart,
  Shield,
  Footprints,
  Eye,
  Search,
  Ruler
} from 'lucide-react';
import { CombatAction, CombatEntity } from '@/engine/combat/types';
import { canUseAction, getRemainingActionHints } from '@/engine/combat/rules';

interface BottomPanelProps {
  activeEntity?: CombatEntity;
  availableActions: CombatAction[];
  onUseAction: (action: CombatAction, targetId?: string) => void;
  onToggleMode: (mode: 'select' | 'move' | 'measure' | 'target') => void;
  currentMode: string;
  isCurrentPlayer: boolean;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({
  activeEntity,
  availableActions,
  onUseAction,
  onToggleMode,
  currentMode,
  isCurrentPlayer
}) => {
  const [selectedAction, setSelectedAction] = useState<CombatAction | null>(null);
  const [actionFilter, setActionFilter] = useState<'all' | 'action' | 'bonus' | 'reaction'>('all');

  const hints = activeEntity ? getRemainingActionHints(activeEntity) : null;

  const getActionsByType = (type: 'action' | 'bonus' | 'reaction') => {
    return availableActions.filter(action => action.type === type);
  };

  const getFilteredActions = () => {
    if (actionFilter === 'all') return availableActions;
    return getActionsByType(actionFilter);
  };

  const canUseActionType = (action: CombatAction): boolean => {
    if (!activeEntity) return false;
    return canUseAction(activeEntity, action.type);
  };

  const getActionColor = (action: CombatAction): string => {
    if (!canUseActionType(action)) return 'muted';
    
    switch (action.type) {
      case 'action': return 'default';
      case 'bonus': return 'secondary';
      case 'reaction': return 'outline';
      default: return 'outline';
    }
  };

  const getActionIcon = (action: CombatAction) => {
    const actionName = action.name.toLowerCase();
    if (actionName.includes('attack') || actionName.includes('атак')) return Sword;
    if (actionName.includes('heal') || actionName.includes('лечение')) return Heart;
    if (actionName.includes('spell') || actionName.includes('заклинание')) return Zap;
    if (actionName.includes('defend') || actionName.includes('защита')) return Shield;
    return Target;
  };

  const ActionButton: React.FC<{ 
    action: CombatAction; 
    index: number; 
    hotkey: string 
  }> = ({ action, index, hotkey }) => {
    const Icon = getActionIcon(action);
    const canUse = canUseActionType(action);
    const isSelected = selectedAction?.id === action.id;

    return (
      <Button
        variant={isSelected ? "default" : getActionColor(action) as any}
        size="lg"
        disabled={!canUse || !isCurrentPlayer}
        onClick={() => {
          if (isSelected) {
            setSelectedAction(null);
          } else {
            setSelectedAction(action);
            if (action.range === -1) {
              // Self-targeting, execute immediately
              onUseAction(action);
              setSelectedAction(null);
            }
          }
        }}
        className="relative flex flex-col items-center p-2 h-16 min-w-[80px] transition-all"
        title={`${String(action.name || 'Action')}\n${String(action.description || '')}\nRange: ${action.range === -1 ? 'Self' : String(action.range) + 'ft'}\nType: ${String(action.type || '')}`}
      >
        <Icon className="w-5 h-5 mb-1" />
        <span className="text-xs leading-tight text-center">{String(action.name || 'Action')}</span>
        
        {/* Hotkey indicator */}
        <Badge 
          variant="outline" 
          className="absolute -top-1 -right-1 text-xs h-4 px-1 bg-background"
        >
          {hotkey}
        </Badge>

        {/* Cooldown indicator */}
        {action.cooldown && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-red-500 opacity-50" />
        )}
      </Button>
    );
  };

  const ModeButton: React.FC<{
    mode: string;
    icon: React.ComponentType<any>;
    label: string;
    hotkey?: string;
  }> = ({ mode, icon: Icon, label, hotkey }) => (
    <Button
      variant={currentMode === mode ? "default" : "outline"}
      size="sm"
      onClick={() => onToggleMode(mode as any)}
      className="flex items-center gap-2"
      title={`${label}${hotkey ? ` (${hotkey})` : ''}`}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
      {hotkey && (
        <Badge variant="outline" className="text-xs h-4 px-1">
          {hotkey}
        </Badge>
      )}
    </Button>
  );

  const filteredActions = getFilteredActions();
  const hotkeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="w-full bg-background/95 backdrop-blur-sm border-t border-border">
      <Card className="rounded-none border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Левая секция: Режимы взаимодействия */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">Режимы:</span>
              
              <ModeButton
                mode="select"
                icon={Target}
                label="Выбор"
                hotkey="V"
              />
              
              <ModeButton
                mode="move"
                icon={Footprints}
                label="Движение"
                hotkey="M"
              />
              
              <ModeButton
                mode="measure"
                icon={Ruler}
                label="Линейка"
                hotkey="R"
              />
              
              <ModeButton
                mode="target"
                icon={Search}
                label="Прицел"
                hotkey="T"
              />
            </div>

            <Separator orientation="vertical" className="h-8" />

            {/* Центральная секция: Действия */}
            {isCurrentPlayer && activeEntity && (
              <div className="flex-1 flex items-center justify-center">
                <div className="flex items-center gap-2">
                  {/* Фильтры типов действий */}
                  <div className="flex items-center gap-1 mr-4">
                    <Button
                      size="sm"
                      variant={actionFilter === 'all' ? 'default' : 'ghost'}
                      onClick={() => setActionFilter('all')}
                      className="text-xs"
                    >
                      Все
                    </Button>
                    <Button
                      size="sm"
                      variant={actionFilter === 'action' ? 'default' : 'ghost'}
                      onClick={() => setActionFilter('action')}
                      disabled={!hints?.hasAction}
                      className="text-xs"
                    >
                      Action
                    </Button>
                    <Button
                      size="sm"
                      variant={actionFilter === 'bonus' ? 'default' : 'ghost'}
                      onClick={() => setActionFilter('bonus')}
                      disabled={!hints?.hasBonus}
                      className="text-xs"
                    >
                      Bonus
                    </Button>
                    <Button
                      size="sm"
                      variant={actionFilter === 'reaction' ? 'default' : 'ghost'}
                      onClick={() => setActionFilter('reaction')}
                      disabled={!hints?.hasReaction}
                      className="text-xs"
                    >
                      Reaction
                    </Button>
                  </div>

                  {/* Кнопки действий */}
                  <div className="flex items-center gap-2">
                    {filteredActions.slice(0, 9).map((action, index) => (
                      <ActionButton
                        key={action.id}
                        action={action}
                        index={index}
                        hotkey={hotkeys[index]}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Для неактивных игроков */}
            {!isCurrentPlayer && (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Eye className="w-6 h-6 mx-auto mb-1" />
                  <p className="text-sm">
                    {activeEntity ? `Ход: ${activeEntity.name}` : 'Ожидание хода'}
                  </p>
                </div>
              </div>
            )}

            <Separator orientation="vertical" className="h-8" />

            {/* Правая секция: Информация */}
            <div className="text-xs text-muted-foreground space-y-1 min-w-[200px]">
              {selectedAction ? (
                <>
                  <div className="font-medium text-contrast">{selectedAction.name}</div>
                  <div>Тип: {selectedAction.type}</div>
                  <div>Дальность: {selectedAction.range === -1 ? 'Self' : `${selectedAction.range} ft`}</div>
                  {selectedAction.damage && (
                    <div>Урон: {selectedAction.damage.dice} ({selectedAction.damage.type})</div>
                  )}
                </>
              ) : (
                <>
                  <div>Наведите на действие для подробностей</div>
                  <div>Или используйте горячие клавиши 1-9</div>
                </>
              )}
            </div>
          </div>

          {/* Выбранное действие требует цель */}
          {selectedAction && selectedAction.range > 0 && (
            <div className="mt-3 p-2 bg-primary/10 border border-primary/20 rounded-md text-sm">
              <div className="flex items-center gap-2 text-primary">
                <Target className="w-4 h-4" />
                <span>Выберите цель для: {selectedAction.name}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setSelectedAction(null)}
                  className="ml-auto text-xs"
                >
                  Отмена
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};