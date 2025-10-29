import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Scroll, Swords, Heart, Shield, Sparkles } from 'lucide-react';
import { CombatEvent } from '@/stores/enhancedBattleStore';

interface CombatLogMiniProps {
  events: CombatEvent[];
  maxItems?: number;
}

export const CombatLogMini: React.FC<CombatLogMiniProps> = ({
  events,
  maxItems = 10
}) => {
  const recentEvents = events.slice(-maxItems).reverse();

  const getEventIcon = (event: CombatEvent) => {
    if (event.action.includes('атака') || event.action.includes('attack')) {
      return <Swords className="h-3 w-3 text-red-500" />;
    }
    if (event.healing) {
      return <Heart className="h-3 w-3 text-green-500" />;
    }
    if (event.action.includes('защита') || event.action.includes('dodge')) {
      return <Shield className="h-3 w-3 text-blue-500" />;
    }
    if (event.action.includes('заклинание') || event.action.includes('spell')) {
      return <Sparkles className="h-3 w-3 text-purple-500" />;
    }
    return <Scroll className="h-3 w-3 text-muted-foreground" />;
  };

  const getEventColor = (event: CombatEvent) => {
    if (event.damage) return 'text-red-400';
    if (event.healing) return 'text-green-400';
    return 'text-foreground';
  };

  return (
    <Card className="w-full h-full bg-card/95 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Scroll className="h-4 w-4" />
          Лог боя
        </CardTitle>
      </CardHeader>
      <CardContent className="p-2">
        <ScrollArea className="h-[300px] pr-2">
          {recentEvents.length === 0 ? (
            <div className="text-center text-muted-foreground text-xs py-8">
              Бой еще не начался
            </div>
          ) : (
            <div className="space-y-1">
              {recentEvents.map((event, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-muted/50 hover:bg-muted transition-colors text-xs"
                >
                  <div className="flex items-start gap-2">
                    {getEventIcon(event)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 mb-1">
                        <span className="font-semibold truncate">
                          {event.actor}
                        </span>
                        <span className="text-muted-foreground">→</span>
                        <span className="truncate">{event.action}</span>
                        {event.target && (
                          <>
                            <span className="text-muted-foreground">→</span>
                            <span className="font-semibold truncate">
                              {event.target}
                            </span>
                          </>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1 flex-wrap">
                        {event.damage && (
                          <Badge variant="destructive" className="text-xs px-1 py-0">
                            -{event.damage} HP
                          </Badge>
                        )}
                        {event.healing && (
                          <Badge variant="default" className="text-xs px-1 py-0 bg-green-500">
                            +{event.healing} HP
                          </Badge>
                        )}
                        {event.diceRoll && (
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            🎲 {String(event.diceRoll)}
                          </Badge>
                        )}
                      </div>
                      
                      {event.description && (
                        <p className="text-muted-foreground mt-1 text-xs">
                          {event.description}
                        </p>
                      )}
                    </div>
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
