// Система журнала боевых событий
import React, { useState, useRef, useEffect } from 'react';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';
import type { CombatEvent } from '@/stores/enhancedBattleStore';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Scroll, 
  Trash2, 
  Download, 
  Dice1, 
  Dice2, 
  Dice3, 
  Dice4, 
  Dice5, 
  Dice6,
  Zap,
  Swords,
  Heart,
  Shield
} from 'lucide-react';

interface CombatLoggerProps {
  className?: string;
}

export const CombatLogger: React.FC<CombatLoggerProps> = ({ className = '' }) => {
  const { combatEvents, clearEvents, addCombatEvent } = useUnifiedBattleStore();
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Автоскролл к последнему сообщению
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [combatEvents, autoScroll]);

  // Функции для бросания кубиков
  const rollDie = (faces: number) => {
    const result = Math.floor(Math.random() * faces) + 1;
    addCombatEvent({
      actor: 'Кубик',
      action: `d${faces}`,
      description: `🎲 d${faces} → ${result}`,
      playerName: 'Система',
      type: 'dice'
    });
    return result;
  };

  const rollMultipleDice = (count: number, faces: number, modifier = 0) => {
    const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * faces) + 1);
    const total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;
    const modifierText = modifier !== 0 ? ` ${modifier >= 0 ? '+' : ''}${modifier}` : '';
    
    addCombatEvent({
      actor: 'Кубики',
      action: `${count}d${faces}${modifierText}`,
      description: `🎲 ${count}d${faces}${modifierText} → [${rolls.join(', ')}]${modifierText} = ${total}`,
      playerName: 'Система',
      type: 'dice'
    });
    return { rolls, total };
  };

  // Экспорт лога в текстовый файл
  const exportLog = () => {
    const logText = combatEvents.map(event => 
      `[${new Date(event.timestamp).toLocaleTimeString()}] ${event.actor}: ${event.description}`
    ).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `combat-log-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Получение иконки для типа события
  const getEventIcon = (event: CombatEvent) => {
    if (event.description.includes('🎲')) return <Dice1 className="w-3 h-3" />;
    if (event.action === 'Атака' || event.action === 'Убийство') return <Swords className="w-3 h-3 text-red-400" />;
    if (event.action === 'Исцеление') return <Heart className="w-3 h-3 text-green-400" />;
    if (event.action === 'Состояние') return <Zap className="w-3 h-3 text-yellow-400" />;
    if (event.action === 'Перемещение') return <div className="w-2 h-2 bg-blue-400 rounded-full" />;
    return <Shield className="w-3 h-3 text-gray-400" />;
  };

  // Получение цвета для актера
  const getActorColor = (event: CombatEvent) => {
    if (event.actor === 'Система' || event.actor === 'ДМ') return 'text-yellow-400';
    if (event.description.includes('🎲')) return 'text-purple-400';
    if (event.action === 'Атака' || event.action === 'Убийство') return 'text-red-400';
    if (event.action === 'Исцеление') return 'text-green-400';
    return 'text-blue-400';
  };

  const formatTime = (timestamp: string | number) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  return (
    <div className={`bg-neutral-900 border border-neutral-700 rounded-lg ${className}`}>
      {/* Заголовок */}
      <div className="p-3 border-b border-neutral-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scroll className="w-4 h-4 text-yellow-400" />
          <span className="font-semibold text-yellow-400">Журнал событий</span>
          <Badge variant="outline" className="text-xs">
            {combatEvents.length}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setAutoScroll(!autoScroll)}
            className={`text-xs h-7 ${autoScroll ? 'text-green-400' : 'text-gray-400'}`}
          >
            Авто-скролл
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={exportLog}
            className="text-xs h-7"
            disabled={combatEvents.length === 0}
          >
            <Download className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearEvents}
            className="text-xs h-7 text-red-400 hover:text-red-300"
            disabled={combatEvents.length === 0}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {/* Панель кубиков */}
      <div className="p-2 border-b border-neutral-700 bg-neutral-950">
        <div className="flex items-center gap-1 flex-wrap">
          <span className="text-xs text-gray-400 mr-2">Кубики:</span>
          {[4, 6, 8, 10, 12, 20].map(faces => (
            <Button
              key={faces}
              variant="outline"
              size="sm"
              onClick={() => rollDie(faces)}
              className="text-xs h-6 px-2 bg-neutral-800 border-neutral-600 hover:bg-neutral-700"
            >
              d{faces}
            </Button>
          ))}
          <div className="ml-2 flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => rollMultipleDice(2, 6)}
              className="text-xs h-6 px-2 bg-neutral-800 border-neutral-600 hover:bg-neutral-700"
            >
              2d6
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => rollMultipleDice(3, 6)}
              className="text-xs h-6 px-2 bg-neutral-800 border-neutral-600 hover:bg-neutral-700"
            >
              3d6
            </Button>
          </div>
        </div>
      </div>

      {/* Журнал событий */}
      <ScrollArea className="h-64" ref={scrollRef}>
        <div className="p-2 space-y-1">
          {combatEvents.length === 0 ? (
            <div className="text-center text-gray-500 text-sm py-8">
              Журнал событий пуст
            </div>
          ) : (
            combatEvents.map((event) => (
              <div key={event.id} className="flex items-start gap-2 p-2 rounded hover:bg-neutral-800/50 group">
                <div className="mt-0.5 flex-shrink-0">
                  {getEventIcon(event)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500">
                      {formatTime(event.timestamp)}
                    </span>
                    <span className={`font-medium ${getActorColor(event)}`}>
                      {event.actor}
                    </span>
                    {event.action && (
                      <Badge variant="outline" className="text-xs px-1 py-0 h-4">
                        {event.action}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm text-gray-200 mt-0.5 break-words">
                    {event.description}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};