import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2 } from 'lucide-react';
import { useCombatStore } from '@/stores/combatStore';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

export const CombatLog: React.FC = () => {
  const { combatLog, clearLog } = useCombatStore();

  const getActionIcon = (type: string) => {
    switch (type) {
      case 'attack': return '⚔️';
      case 'spell': return '✨';
      case 'move': return '🏃';
      case 'defend': return '🛡️';
      default: return '🎲';
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'attack': return 'destructive';
      case 'spell': return 'default';
      case 'move': return 'secondary';
      case 'defend': return 'outline';
      default: return 'secondary';
    }
  };

  return (
    <Card className="w-full h-[400px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center justify-between">
          <span>Лог боя</span>
          {combatLog.length > 0 && (
            <Button
              onClick={clearLog}
              variant="outline"
              size="sm"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6 pb-6">
          {combatLog.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              Лог боя пуст
            </div>
          ) : (
            <div className="space-y-4">
              {combatLog.map((logEntry) => (
                <div key={logEntry.id} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Badge variant="outline">
                      Раунд {logEntry.round}, Ход {logEntry.turn + 1}
                    </Badge>
                    <span className="text-muted-foreground">
                      {format(logEntry.timestamp, 'HH:mm:ss', { locale: ru })}
                    </span>
                  </div>
                  
                  <div className="space-y-1 ml-4">
                    {logEntry.actions.map((action) => (
                      <div
                        key={action.id}
                        className="flex items-start gap-2 p-2 rounded-lg bg-muted"
                      >
                        <span className="text-lg">{getActionIcon(action.type)}</span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{action.actor}</span>
                            <Badge 
                              variant={getActionColor(action.type) as any}
                              className="text-xs"
                            >
                              {action.type}
                            </Badge>
                            {action.damage && (
                              <Badge variant="destructive" className="text-xs">
                                {action.damage} урона
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {action.description}
                          </p>
                          {action.target && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Цель: {action.target}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};