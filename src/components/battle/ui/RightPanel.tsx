// Правая панель с боевым логом
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  ScrollText, 
  Dice1, 
  Undo,
  ChevronDown,
  ChevronRight,
  Sword,
  Shield,
  Heart,
  Zap,
  Target,
  AlertCircle
} from 'lucide-react';
import { CombatLog } from '@/engine/combat/types';

interface RightPanelProps {
  log: CombatLog[];
  canUndo?: boolean;
  onUndo?: (logEntryId: string) => void;
  isDM?: boolean;
}

export const RightPanel: React.FC<RightPanelProps> = ({
  log,
  canUndo = false,
  onUndo,
  isDM = false
}) => {
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Автоскролл к последнему сообщению
  useEffect(() => {
    if (autoScroll && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [log, autoScroll]);

  const toggleExpanded = (entryId: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId);
    } else {
      newExpanded.add(entryId);
    }
    setExpandedEntries(newExpanded);
  };

  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('attack') || actionLower.includes('атак')) return Sword;
    if (actionLower.includes('heal') || actionLower.includes('лечение')) return Heart;
    if (actionLower.includes('spell') || actionLower.includes('заклинание')) return Zap;
    if (actionLower.includes('defend') || actionLower.includes('защита')) return Shield;
    if (actionLower.includes('move') || actionLower.includes('движение')) return Target;
    return AlertCircle;
  };

  const getEntryTypeColor = (action: string): string => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('damage') || actionLower.includes('урон')) return 'text-red-600';
    if (actionLower.includes('heal') || actionLower.includes('лечение')) return 'text-green-600';
    if (actionLower.includes('miss') || actionLower.includes('промах')) return 'text-yellow-600';
    if (actionLower.includes('critical') || actionLower.includes('критический')) return 'text-purple-600';
    return 'text-foreground';
  };

  const formatTime = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const LogEntry: React.FC<{ entry: CombatLog }> = ({ entry }) => {
    const isExpanded = expandedEntries.has(entry.id);
    const ActionIcon = getActionIcon(entry.action);
    const hasDetails = entry.rolls || entry.damage || entry.targets;

    return (
      <Card className="mb-2 text-sm">
        <CardContent className="p-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-2 flex-1 min-w-0">
              {/* Иконка действия */}
              <div className="mt-0.5 flex-shrink-0">
                <ActionIcon className="w-4 h-4 text-muted-foreground" />
              </div>

              <div className="flex-1 min-w-0">
                {/* Заголовок */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-contrast truncate">
                    {entry.actor}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    R{entry.round}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(entry.timestamp)}
                  </span>
                </div>

                {/* Основное описание */}
                <div className={`${getEntryTypeColor(entry.action)} leading-relaxed`}>
                  {entry.description}
                </div>

                {/* Цели */}
                {entry.targets && entry.targets.length > 0 && (
                  <div className="mt-1 text-xs text-muted-foreground">
                    Цели: {entry.targets.join(', ')}
                  </div>
                )}

                {/* Детали (свернуто) */}
                {hasDetails && isExpanded && (
                  <div className="mt-2 space-y-2 text-xs">
                    {/* Броски */}
                    {entry.rolls && entry.rolls.map((roll, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                        <Dice1 className="w-3 h-3" />
                        <span>
                          {roll.type}: {roll.dice} = {roll.result}
                          {roll.total !== roll.result && ` + мод = ${roll.total}`}
                          {roll.advantage && <Badge variant="outline" className="ml-1 text-xs">Преимущество</Badge>}
                          {roll.disadvantage && <Badge variant="outline" className="ml-1 text-xs">Помеха</Badge>}
                        </span>
                      </div>
                    ))}

                    {/* Урон */}
                    {entry.damage && entry.damage.map((dmg, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-950/20 rounded">
                        <span className="text-red-600">
                          {dmg.target}: {dmg.amount} урона ({dmg.type})
                          {dmg.reduced && <span className="text-xs"> (уменьшено)</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Кнопки управления */}
            <div className="flex items-center gap-1 ml-2 flex-shrink-0">
              {hasDetails && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => toggleExpanded(entry.id)}
                  className="h-6 w-6 p-0"
                  title={isExpanded ? "Свернуть детали" : "Показать детали"}
                >
                  {isExpanded ? 
                    <ChevronDown className="w-3 h-3" /> : 
                    <ChevronRight className="w-3 h-3" />
                  }
                </Button>
              )}

              {isDM && canUndo && entry.canUndo && onUndo && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onUndo(entry.id)}
                  className="h-6 w-6 p-0 text-orange-500 hover:text-orange-600"
                  title="Отменить действие"
                >
                  <Undo className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="w-96 h-full bg-background border-l border-border flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ScrollText className="w-5 h-5" />
            Боевой лог
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setAutoScroll(!autoScroll)}
              className={`text-xs ${autoScroll ? 'text-primary' : 'text-muted-foreground'}`}
              title={autoScroll ? "Отключить автоскролл" : "Включить автоскролл"}
            >
              Auto
            </Button>
            
            <Badge variant="outline" className="text-xs">
              {log.length}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <div className="flex-1 flex flex-col min-h-0">
        <Separator className="mb-2" />
        
        <ScrollArea 
          className="flex-1 px-4" 
          ref={scrollAreaRef}
          onScrollCapture={(e) => {
            const target = e.target as HTMLDivElement;
            const isAtBottom = target.scrollTop + target.clientHeight >= target.scrollHeight - 10;
            setAutoScroll(isAtBottom);
          }}
        >
          {log.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <ScrollText className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>Лог боевых действий пуст</p>
              <p className="text-xs mt-1">Действия будут появляться здесь</p>
            </div>
          ) : (
            <div className="space-y-0 pb-4">
              {log.map(entry => (
                <LogEntry key={entry.id} entry={entry} />
              ))}
              
              {/* Индикатор автоскролла */}
              {!autoScroll && (
                <div className="sticky bottom-0 left-0 right-0 text-center">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setAutoScroll(true);
                      scrollAreaRef.current?.scrollTo({
                        top: scrollAreaRef.current.scrollHeight,
                        behavior: 'smooth'
                      });
                    }}
                    className="text-xs bg-background shadow-md"
                  >
                    <ChevronDown className="w-3 h-3 mr-1" />
                    К последнему
                  </Button>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};