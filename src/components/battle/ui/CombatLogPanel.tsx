import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Sword, 
  Heart, 
  Shield, 
  Sparkles, 
  Clock, 
  Trash,
  Eye,
  Target,
  Users
} from 'lucide-react';
import { CombatEntity, CombatState } from '@/engine/combat/types';

interface CombatLogEntry {
  id: string;
  timestamp: number;
  round: number;
  type: 'attack' | 'damage' | 'heal' | 'spell' | 'move' | 'status' | 'initiative' | 'turn';
  actor: string;
  target?: string;
  action: string;
  result?: string;
  damage?: number;
  healing?: number;
  details?: string;
}

interface CombatLogPanelProps {
  entities: CombatEntity[];
  combatState: CombatState;
  log: CombatLogEntry[];
  isDM: boolean;
  onClearLog: () => void;
  onFocusEntity: (id: string) => void;
  onPingEntity: (id: string) => void;
}

export function CombatLogPanel({
  entities,
  combatState,
  log,
  isDM,
  onClearLog,
  onFocusEntity,
  onPingEntity
}: CombatLogPanelProps) {
  const getActionIcon = (type: string) => {
    switch (type) {
      case 'attack': return <Sword className="h-3 w-3" />;
      case 'damage': return <Sword className="h-3 w-3 text-red-500" />;
      case 'heal': return <Heart className="h-3 w-3 text-green-500" />;
      case 'spell': return <Sparkles className="h-3 w-3 text-purple-500" />;
      case 'status': return <Shield className="h-3 w-3 text-yellow-500" />;
      case 'turn': return <Clock className="h-3 w-3 text-blue-500" />;
      default: return <Target className="h-3 w-3" />;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'attack': return 'destructive';
      case 'damage': return 'destructive';
      case 'heal': return 'default';
      case 'spell': return 'secondary';
      case 'status': return 'outline';
      case 'turn': return 'outline';
      default: return 'outline';
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const playerEntities = entities.filter(e => e.isPlayer);
  const enemyEntities = entities.filter(e => !e.isPlayer);
  const activeEntity = entities.find(e => e.id === combatState.activeEntityId);

  return (
    <Card className="fixed right-4 top-4 bottom-20 w-80 z-20 bg-background/95 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Combat Info
          </CardTitle>
          {isDM && (
            <Button variant="outline" size="sm" onClick={onClearLog}>
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-0 space-y-4">
        {/* Combat Status */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Round {combatState.round}</span>
            <Badge variant="outline">{combatState.phase}</Badge>
          </div>
          
          {activeEntity && (
            <div className="p-2 bg-muted/50 rounded-md">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="font-medium text-sm">{activeEntity.name}'s Turn</span>
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                HP: {activeEntity.hp.current}/{activeEntity.hp.max} | AC: {activeEntity.ac}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Initiative Order */}
        <div>
          <h4 className="font-medium mb-2 text-sm">Initiative Order</h4>
          <ScrollArea className="h-32">
            <div className="space-y-1">
              {combatState.queue.map((entityId, index) => {
                const entity = entities.find(e => e.id === entityId);
                if (!entity) return null;
                
                const isActive = entityId === combatState.activeEntityId;
                
                return (
                  <div 
                    key={entityId}
                    className={`flex items-center gap-2 p-2 rounded-md text-sm ${
                      isActive ? 'bg-primary/20 border border-primary/30' : 'bg-muted/30'
                    }`}
                  >
                    <Badge variant="outline" className="text-xs w-6 h-6 flex items-center justify-center p-0">
                      {index + 1}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-medium">{entity.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {entity.hp.current}/{entity.hp.max} HP
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => onFocusEntity(entityId)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => onPingEntity(entityId)}>
                        <Target className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>

        <Separator />

        {/* Entity Lists */}
        <div className="space-y-3">
          {/* Players */}
          <div>
            <h4 className="font-medium mb-2 text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              Party ({playerEntities.length})
            </h4>
            <div className="space-y-1">
              {playerEntities.map(entity => (
                <div key={entity.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md text-sm">
                  <div className="flex-1">
                    <div className="font-medium">{entity.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {entity.hp.current}/{entity.hp.max} HP | AC {entity.ac}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => onFocusEntity(entity.id)}>
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enemies */}
          {enemyEntities.length > 0 && (
            <div>
              <h4 className="font-medium mb-2 text-sm flex items-center gap-2">
                <Target className="h-4 w-4" />
                Enemies ({enemyEntities.length})
              </h4>
              <div className="space-y-1">
                {enemyEntities.map(entity => (
                  <div key={entity.id} className="flex items-center gap-2 p-2 bg-muted/30 rounded-md text-sm">
                    <div className="flex-1">
                      <div className="font-medium">{entity.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {isDM ? `${entity.hp.current}/${entity.hp.max} HP | AC ${entity.ac}` : `AC ${entity.ac}`}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => onFocusEntity(entity.id)}>
                        <Eye className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <Separator />

        {/* Combat Log */}
        <div>
          <h4 className="font-medium mb-2 text-sm">Combat Log</h4>
          <ScrollArea className="h-48">
            {log.length === 0 ? (
              <p className="text-muted-foreground text-sm italic">No combat events yet...</p>
            ) : (
              <div className="space-y-2">
                {log.slice().reverse().map((entry) => (
                  <div key={entry.id} className="p-2 bg-muted/30 rounded-md text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={getActionColor(entry.type) as any} className="text-xs">
                        {getActionIcon(entry.type)}
                        {entry.type}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(entry.timestamp)}
                      </span>
                    </div>
                    
                    <div className="font-medium">
                      {entry.actor}
                      {entry.target && ` → ${entry.target}`}
                    </div>
                    
                    <div className="text-muted-foreground">
                      {entry.action}
                    </div>
                    
                    {entry.result && (
                      <div className="text-sm mt-1">
                        {entry.result}
                        {entry.damage && (
                          <span className="text-red-600 font-medium ml-1">
                            (-{entry.damage} dmg)
                          </span>
                        )}
                        {entry.healing && (
                          <span className="text-green-600 font-medium ml-1">
                            (+{entry.healing} hp)
                          </span>
                        )}
                      </div>
                    )}
                    
                    {entry.details && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {entry.details}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}