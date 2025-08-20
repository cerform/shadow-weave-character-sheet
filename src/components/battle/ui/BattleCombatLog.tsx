import { useBattleUIStore } from "@/stores/battleUIStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trash2, Sword, Zap, Shield, Heart } from "lucide-react";

export default function BattleCombatLog() {
  const { combatLog, clearCombatLog } = useBattleUIStore();

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
    <Card className="fixed top-96 right-4 w-96 h-80 bg-card/95 backdrop-blur-sm border-border shadow-xl z-10">{/* Moved down and reduced z-index */}
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-primary">Лог боя</CardTitle>
          {combatLog.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearCombatLog}
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="h-full pb-4 bg-card/70 backdrop-blur-md rounded-lg">{/* Expanded background */}
        <ScrollArea className="h-full pr-4">
          {combatLog.length === 0 ? (
            <div className="text-muted-foreground text-center py-8">
              События боя будут отображаться здесь
            </div>
          ) : (
            <div className="space-y-3">
              {combatLog.map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={getActionColor(event.action) as any}
                        className="flex items-center gap-1"
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
                        <Badge variant="destructive" className="ml-auto">
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
  );
}