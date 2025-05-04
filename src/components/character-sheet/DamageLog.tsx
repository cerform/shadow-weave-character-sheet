
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Plus, Minus } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { HealthEvent } from '@/hooks/useHealthSystem';

// Define the DamageEvent type for compatibility
export interface DamageEvent {
  id: string;
  type: 'damage' | 'heal' | 'temp' | 'rest-short' | 'rest-long' | 'level-up' | 'level-down';
  amount: number;
  source?: string;
  timestamp: Date;
}

interface DamageLogProps {
  events: HealthEvent[] | DamageEvent[];
  undoLastEvent: () => void;
  maxEvents?: number;
  className?: string;
}

export const DamageLog: React.FC<DamageLogProps> = ({ 
  events, 
  undoLastEvent, 
  maxEvents = 5,
  className = ''
}) => {
  const [expanded, setExpanded] = useState(false);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  const displayEvents = expanded ? events : events.slice(0, maxEvents);
  
  if (events.length === 0) {
    return null;
  }
  
  // Функция для форматирования времени
  const formatTimeAgo = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    
    // Преобразуем разницу в минуты
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'сейчас';
    if (minutes < 60) return `${minutes} мин. назад`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ч. назад`;
    
    const days = Math.floor(hours / 24);
    return `${days} д. назад`;
  };
  
  // Функция для получения иконки события
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'damage':
        return <Minus className="h-4 w-4 mr-2 text-red-500" />;
      case 'heal':
        return <Plus className="h-4 w-4 mr-2 text-green-500" />;
      case 'temp':
        return <Shield className="h-4 w-4 mr-2 text-emerald-400" />;
      case 'rest-short':
      case 'rest-long':
        return <Shield className="h-4 w-4 mr-2 text-blue-500" />;
      case 'level-up':
      case 'level-down':
        return <Plus className="h-4 w-4 mr-2 text-purple-500" />;
      default:
        return <Minus className="h-4 w-4 mr-2 text-gray-500" />;
    }
  };
  
  // Функция для получения описания события
  const getEventDescription = (event: DamageEvent | HealthEvent): string => {
    switch (event.type) {
      case 'damage':
        return `Урон ${event.amount}`;
      case 'heal':
        return `Лечение ${event.amount}`;
      case 'temp':
        return `Временные HP ${event.amount}`;
      case 'rest-short':
        return `Короткий отдых (+${event.amount} HP)`;
      case 'rest-long':
        return `Длинный отдых (полное восстановление)`;
      case 'level-up':
        return `Повышение уровня (+${event.amount} макс. HP)`;
      case 'level-down':
        return `Понижение уровня (-${event.amount} макс. HP)`;
      default:
        return `Неизвестное событие`;
    }
  };
  
  return (
    <div className={`rounded-lg overflow-hidden ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 
          className="text-sm font-medium"
          style={{ color: currentTheme.textColor }}
        >
          Журнал событий
        </h3>
        
        {undoLastEvent && events.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={undoLastEvent}
            className="h-7 px-2 text-xs"
            style={{ color: currentTheme.accent }}
          >
            Отменить последнее
          </Button>
        )}
      </div>
      
      <div className={`bg-black/30 rounded-lg p-1 ${expanded ? 'max-h-64' : 'max-h-32'}`}>
        <ScrollArea className="h-full">
          <AnimatePresence initial={false}>
            {displayEvents.map((event) => (
              <motion.div
                key={event.id}
                className="flex items-center py-1 px-2 rounded-md mb-1 bg-black/30"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                {getEventIcon(event.type)}
                
                <div 
                  className="flex-1 text-xs"
                  style={{ color: currentTheme.textColor }}
                >
                  <span>{getEventDescription(event)}</span>
                  {event.source && (
                    <span className="text-gray-400 ml-1">
                      от {event.source}
                    </span>
                  )}
                </div>
                
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(event.timestamp)}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>
      </div>
      
      {events.length > maxEvents && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="w-full mt-1 h-6 text-xs"
          style={{ color: currentTheme.mutedTextColor }}
        >
          {expanded ? "Свернуть" : `Показать все (${events.length})`}
        </Button>
      )}
    </div>
  );
};

export default DamageLog;
