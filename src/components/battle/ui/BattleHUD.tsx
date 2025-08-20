import { useBattleUIStore } from "@/stores/battleUIStore";
import { useEnhancedBattleStore } from "@/stores/enhancedBattleStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  ChevronUp, 
  ChevronDown, 
  Play, 
  RotateCcw,
  Trash2, 
  Sword, 
  Zap, 
  Shield, 
  Heart,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useState } from "react";

export default function BattleHUD() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { order, activeId, tokens, round, setInitiative, nextTurn, moveInInitiative, combatLog, clearCombatLog } = useBattleUIStore();
  const { tokens: enhancedTokens, activeId: enhancedActiveId, initiativeOrder, combatStarted } = useEnhancedBattleStore();
  
  const byId = Object.fromEntries(tokens.map(t => [t.id, t]));

  const moveToken = (fromIndex: number, direction: 'up' | 'down') => {
    if (direction === 'up' && fromIndex > 0) {
      moveInInitiative(fromIndex, fromIndex - 1);
    } else if (direction === 'down' && fromIndex < order.length - 1) {
      moveInInitiative(fromIndex, fromIndex + 1);
    }
  };

  const resetInitiative = () => {
    setInitiative(order, order[0]);
  };

  const getActionIcon = (action: string) => {
    switch (action.toLowerCase()) {
      case 'attack':
        return <Sword className="h-3 w-3" />;
      case 'spell':
        return <Zap className="h-3 w-3" />;
      case 'defend':
        return <Shield className="h-3 w-3" />;
      case 'heal':
        return <Heart className="h-3 w-3" />;
      default:
        return <span>•</span>;
    }
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'attack':
        return 'destructive';
      case 'spell':
        return 'secondary';
      case 'defend':
        return 'outline';
      case 'heal':
        return 'default';
      default:
        return 'outline';
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className="fixed top-20 right-4 z-30">
      {/* Collapse Toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -left-10 top-4 bg-card/95 backdrop-blur-sm"
      >
        {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
      </Button>

      <div className={`transition-all duration-300 ${isCollapsed ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>
        {/* Initiative Tracker */}
        <Card className="w-80 bg-card/95 backdrop-blur-sm border-border shadow-xl mb-4">
          <CardHeader className="pb-3">
            <CardTitle className="text-primary flex items-center justify-between">
              <span>Инициатива</span>
              <Badge variant="outline" className="text-primary">
                Раунд {round}
              </Badge>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-2 max-h-48 overflow-y-auto">
            {order.length === 0 ? (
              <div className="text-muted-foreground text-center py-4">
                Нет участников боя
              </div>
            ) : (
              order.map((id, index) => {
                const token = byId[id];
                const isActive = id === activeId;
                const isEnemy = token?.isEnemy;
                
                return (
                  <div
                    key={id}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                      isActive 
                        ? 'bg-primary/20 border-primary shadow-md' 
                        : 'bg-muted/50 border-border hover:bg-muted/70'
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-1">
                      {isActive && (
                        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                      )}
                      
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        isEnemy ? 'bg-destructive text-destructive-foreground' : 'bg-primary text-primary-foreground'
                      }`}>
                        {token?.name?.charAt(0) || '?'}
                      </div>
                      
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-foreground'}`}>
                          {token?.name || id}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {token?.hp}/{token?.maxHp} HP
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveToken(index, 'up')}
                        disabled={index === 0}
                        className="h-5 w-5 p-0"
                      >
                        <ChevronUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => moveToken(index, 'down')}
                        disabled={index === order.length - 1}
                        className="h-5 w-5 p-0"
                      >
                        <ChevronDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}

            <div className="flex gap-2 pt-2 border-t border-border">
              <Button 
                onClick={nextTurn} 
                size="sm"
                className="flex-1"
                disabled={order.length === 0}
              >
                <Play className="h-3 w-3 mr-1" />
                Следующий ход
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={resetInitiative}
                disabled={order.length === 0}
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Combat Log */}
        <Card className="w-80 h-96 bg-card/95 backdrop-blur-sm border-border shadow-xl">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-primary">Лог боя</CardTitle>
              {combatLog.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearCombatLog}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>
          </CardHeader>
          
          <CardContent className="h-full pb-4 overflow-hidden">
            <ScrollArea className="h-full pr-4">
              {combatLog.length === 0 ? (
                <div className="text-muted-foreground text-center py-8">
                  События боя будут отображаться здесь
                </div>
              ) : (
                <div className="space-y-2">
                  {combatLog.map((event) => (
                    <div
                      key={event.id}
                      className="p-2 rounded-lg border border-border bg-background/50 hover:bg-background/70 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1">
                          <Badge 
                            variant={getActionColor(event.action) as any}
                            className="flex items-center gap-1 text-xs"
                          >
                            {getActionIcon(event.action)}
                            {event.action}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatTime(event.timestamp)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium text-foreground">
                            {event.actor}
                          </span>
                          {event.target && (
                            <>
                              <span className="text-muted-foreground">→</span>
                              <span className="font-medium text-foreground">
                                {event.target}
                              </span>
                            </>
                          )}
                          {event.damage && (
                            <Badge variant="destructive" className="ml-auto text-xs">
                              {event.damage} урона
                            </Badge>
                          )}
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          {event.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}