
import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Plus, Minus } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { HitPointEvent } from '@/hooks/useHitPoints';
import { motion } from "framer-motion";

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
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // Получаем события для отображения
  const displayEvents = events.slice(0, maxEvents);
  
  // Функция для форматирования времени события
  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    
    if (diff < 60000) {
      return 'только что';
    }
    
    const minutes = Math.floor(diff / 60000);
    if (minutes < 60) {
      return `${minutes} мин назад`;
    }
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
      return `${hours} ч назад`;
    }
    
    const days = Math.floor(hours / 24);
    return `${days} д назад`;
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

  // Если нет событий, не отображаем лог
  if (displayEvents.length === 0) {
    return null;
  }

  return (
    <div className={`mt-2 ${className}`}>
      <div className="flex justify-between items-center mb-1">
        <h4 className="text-sm font-medium">Журнал урона/лечения</h4>
        <button 
          onClick={undoLastEvent}
          className="text-xs text-blue-500 hover:underline"
        >
          Отменить последнее
        </button>
      </div>
      
      <ScrollArea 
        className={`border rounded-lg h-32 bg-black/20 backdrop-blur-sm`}
        style={{ borderColor: `${currentTheme.accent}40` }}
      >
        <div className="p-2">
          <motion.div layout>
            {displayEvents.map((event) => (
              <motion.div 
                key={event.id}
                className={`flex items-center py-1 px-2 rounded-md mb-1 ${getEventColor(event.type)}`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
              >
                <div className="flex items-center flex-1">
                  {getEventIcon(event.type)}
                  <span className="text-sm">{getEventDescription(event)}</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-xs opacity-60">{formatTimestamp(event.timestamp)}</span>
                  {event.source && (
                    <span className="text-xs opacity-60 max-w-[120px] truncate">{event.source}</span>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </ScrollArea>
    </div>
  );
};
