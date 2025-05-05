
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Plus, Minus } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { HitPointEvent } from '@/types/character';
import { motion, AnimatePresence } from "framer-motion";

interface DamageLogProps {
  events: HitPointEvent[];
  undoLastEvent: () => void;
  maxEvents?: number;
  className?: string;
}

export const DamageLog: React.FC<DamageLogProps> = ({
  events,
  undoLastEvent,
  maxEvents = 10,
  className = ""
}) => {
  const [displayEvents, setDisplayEvents] = useState<HitPointEvent[]>([]);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;

  // Обновляем отображаемые события при изменении пропса events
  useEffect(() => {
    // Ограничиваем количество отображаемых событий
    setDisplayEvents(events.slice(0, maxEvents));
  }, [events, maxEvents]);

  // Если событий нет, не отображаем компонент
  if (displayEvents.length === 0) {
    return null;
  }

  // Обработчик отмены последнего действия
  const handleUndo = () => {
    if (displayEvents.length > 0) {
      undoLastEvent();
    }
  };

  // Функция для получения иконки события
  const getEventIcon = (type: 'damage' | 'heal' | 'temp' | 'death-save') => {
    switch (type) {
      case 'damage':
        return <Minus className="h-4 w-4 mr-2 text-red-500" />;
      case 'heal':
        return <Plus className="h-4 w-4 mr-2 text-green-500" />;
      case 'temp':
        return <Shield className="h-4 w-4 mr-2 text-emerald-400" />;
      case 'death-save':
        return <Shield className="h-4 w-4 mr-2 text-purple-400" />;
    }
  };

  // Функция для получения описания события
  const getEventDescription = (event: HitPointEvent): string => {
    switch (event.type) {
      case 'damage':
        return `Урон ${event.amount}`;
      case 'heal':
        return `Лечение ${event.amount}`;
      case 'temp':
        return `Временные HP ${event.amount}`;
      case 'death-save':
        if (event.source?.includes('Критический успех')) {
          return 'Критический успех при спасброске';
        } else if (event.source?.includes('Критическая неудача')) {
          return `${event.amount} провала при спасброске`;
        } else if (event.source?.includes('Успешный')) {
          return 'Успешный спасбросок';
        } else {
          return 'Проваленный спасбросок';
        }
    }
  };
  
  // Цвета для событий
  const getEventColor = (type: 'damage' | 'heal' | 'temp' | 'death-save'): string => {
    switch (type) {
      case 'damage':
        return 'bg-red-900/30';
      case 'heal':
        return 'bg-green-900/30';
      case 'temp':
        return 'bg-emerald-900/30';
      case 'death-save':
        return 'bg-purple-900/30';
    }
  };

  // Функция для форматирования времени события
  const formatEventTime = (timestamp: Date): string => {
    const hours = timestamp.getHours().toString().padStart(2, '0');
    const minutes = timestamp.getMinutes().toString().padStart(2, '0');
    const seconds = timestamp.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  return (
    <div className={`mt-4 ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold">Журнал событий:</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleUndo} 
          disabled={displayEvents.length === 0}
          className="h-7 text-xs"
        >
          Отменить
        </Button>
      </div>

      <div
        className="bg-black/70 rounded-md p-2 border border-primary/20"
        style={{ maxHeight: "200px" }}
      >
        <ScrollArea className="h-[150px]">
          <AnimatePresence initial={false}>
            {displayEvents.map((event, index) => (
              <motion.div
                key={event.id}
                className={`flex items-center py-1 px-2 rounded-md mb-1 ${getEventColor(event.type)}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center flex-grow">
                  {getEventIcon(event.type)}
                  <span className="text-xs">{getEventDescription(event)}</span>
                </div>
                <div className="text-xs text-gray-400">
                  {event.source && (
                    <span className="text-gray-500 mr-2 text-xs">
                      {event.source}
                    </span>
                  )}
                  {formatEventTime(event.timestamp)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </ScrollArea>
      </div>
    </div>
  );
};
