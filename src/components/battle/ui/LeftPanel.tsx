// Левая панель со списком участников боя
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Skull, 
  Eye, 
  Target,
  Heart,
  Shield,
  Zap,
  AlertTriangle,
  Crown,
  Sword
} from 'lucide-react';
import { CombatEntity, Condition } from '@/engine/combat/types';

interface LeftPanelProps {
  entities: CombatEntity[];
  activeEntityId?: string;
  currentPlayerId?: string;
  onFocusEntity: (entityId: string) => void;
  onPingEntity: (entityId: string) => void;
  onSelectTarget?: (entityId: string) => void;
}

export const LeftPanel: React.FC<LeftPanelProps> = ({
  entities,
  activeEntityId,
  currentPlayerId,
  onFocusEntity,
  onPingEntity,
  onSelectTarget
}) => {
  const [selectedTab, setSelectedTab] = useState<'party' | 'enemies' | 'all'>('all');

  const filterEntities = (tab: string) => {
    switch (tab) {
      case 'party':
        return entities.filter(e => e.isPlayer);
      case 'enemies':
        return entities.filter(e => !e.isPlayer);
      default:
        return entities;
    }
  };

  const getHealthColor = (current: number, max: number): string => {
    const percent = (current / max) * 100;
    if (percent > 75) return 'text-green-600';
    if (percent > 50) return 'text-yellow-600';
    if (percent > 25) return 'text-orange-600';
    return 'text-red-600';
  };

  const getConditionIcon = (condition: Condition) => {
    switch (condition.key) {
      case 'poisoned': return '🤢';
      case 'prone': return '⬇️';
      case 'grappled': return '🤝';
      case 'restrained': return '⛓️';
      case 'stunned': return '💫';
      case 'paralyzed': return '🧊';
      case 'unconscious': return '😴';
      case 'charmed': return '💕';
      case 'frightened': return '😰';
      case 'invisible': return '👻';
      default: return '❓';
    }
  };

  const EntityCard: React.FC<{ entity: CombatEntity }> = ({ entity }) => {
    const isActive = entity.id === activeEntityId;
    const isCurrentPlayer = entity.id === currentPlayerId;
    const isDead = entity.isDead || entity.hp.current <= 0;

    return (
      <Card className={`transition-all ${
        isActive ? 'ring-2 ring-primary shadow-lg' : 
        isCurrentPlayer ? 'ring-1 ring-accent' : ''
      }`}>
        <CardContent className="p-3">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {/* Аватар */}
              <div className={`relative w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                entity.isPlayer ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {entity.isPlayer ? (
                  <Users className="w-4 h-4" />
                ) : (
                  <Skull className="w-4 h-4" />
                )}
                
                {/* Индикатор активного хода */}
                {isActive && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full animate-pulse">
                    <Crown className="w-2 h-2 text-white m-0.5" />
                  </div>
                )}
              </div>

              {/* Имя и основная информация */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className={`font-medium truncate ${isDead ? 'line-through text-muted-foreground' : ''}`}>
                    {entity.name}
                  </span>
                  {isDead && <Skull className="w-3 h-3 text-red-500" />}
                </div>
                
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    AC {entity.ac}
                  </div>
                  <div className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {Number(entity.movement.current || 0)}ft
                  </div>
                </div>
              </div>
            </div>

            {/* Кнопки действий */}
            <div className="flex gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onFocusEntity(entity.id)}
                className="h-6 w-6 p-0"
                title="Сфокусировать камеру"
              >
                <Eye className="w-3 h-3" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => onPingEntity(entity.id)}
                className="h-6 w-6 p-0"
                title="Пинговать"
              >
                <Target className="w-3 h-3" />
              </Button>

              {onSelectTarget && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onSelectTarget(entity.id)}
                  className="h-6 w-6 p-0"
                  title="Выбрать целью"
                >
                  <Sword className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>

          {/* HP Bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-muted-foreground">Здоровье</span>
              <span className={`font-mono ${getHealthColor(entity.hp.current, entity.hp.max)}`}>
                {Number(entity.hp.current || 0)}/{Number(entity.hp.max || 1)}
                {entity.hp.temporary > 0 && (
                  <span className="text-blue-500"> (+{Number(entity.hp.temporary || 0)})</span>
                )}
              </span>
            </div>
            <Progress 
              value={Math.max(0, (entity.hp.current / entity.hp.max) * 100)} 
              className="h-2"
            />
          </div>

          {/* Условия */}
          {entity.conditions.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {entity.conditions.map((condition, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs px-1 py-0 h-5"
                  title={`${String(condition.name || 'Condition')}: ${String(condition.description || '')}`}
                >
                  <span className="mr-1">{getConditionIcon(condition)}</span>
                  {String(condition.name || 'Condition')}
                  {condition.duration.type === 'rounds' && (
                    <span className="ml-1 text-muted-foreground">
                      ({Number(condition.duration.value || 0)}r)
                    </span>
                  )}
                </Badge>
              ))}
            </div>
          )}

          {/* Статус действий для активного персонажа */}
          {isActive && (
            <div className="mt-2 flex gap-1">
              <Badge variant={entity.actions.usedAction ? "secondary" : "outline"} className="text-xs">
                Action
              </Badge>
              <Badge variant={entity.actions.usedBonus ? "secondary" : "outline"} className="text-xs">
                Bonus
              </Badge>
              <Badge variant={entity.actions.usedReaction ? "secondary" : "outline"} className="text-xs">
                Reaction
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  const filteredEntities = filterEntities(selectedTab);
  const partyCount = entities.filter(e => e.isPlayer).length;
  const enemyCount = entities.filter(e => !e.isPlayer).length;

  return (
    <div className="w-80 h-full bg-background border-r border-border flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Users className="w-5 h-5" />
          Участники боя
        </CardTitle>
      </CardHeader>

      <div className="flex-1 flex flex-col min-h-0">
        <Tabs value={selectedTab} onValueChange={(value: any) => setSelectedTab(value)} className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 mx-4 mb-2">
            <TabsTrigger value="all" className="text-xs">
              Все ({entities.length})
            </TabsTrigger>
            <TabsTrigger value="party" className="text-xs">
              Команда ({partyCount})
            </TabsTrigger>
            <TabsTrigger value="enemies" className="text-xs">
              Враги ({enemyCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={selectedTab} className="flex-1 mt-0">
            <ScrollArea className="h-full px-4">
              <div className="space-y-2 pb-4">
                {filteredEntities.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                    <p>Нет участников в этой категории</p>
                  </div>
                ) : (
                  filteredEntities.map(entity => (
                    <EntityCard key={entity.id} entity={entity} />
                  ))
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};