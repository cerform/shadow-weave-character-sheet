
import React, { useState, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HitPointEvent } from '@/types/character';
import { formatDistance } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Heart, Shield, Skull } from 'lucide-react';

interface DamageLogProps {
  events: HitPointEvent[];
  maxEvents?: number;
}

const DamageLog = ({ events = [], maxEvents = 10 }: DamageLogProps) => {
  const [displayEvents, setDisplayEvents] = useState<HitPointEvent[]>([]);
  
  // Обновляем отображаемые события при изменении списка
  useEffect(() => {
    // Сортируем события по времени (самые новые сверху)
    const sortedEvents = [...events].sort((a, b) => {
      const timeA = a.timestamp instanceof Date ? a.timestamp.getTime() : typeof a.timestamp === 'number' ? a.timestamp : new Date(a.timestamp).getTime();
      const timeB = b.timestamp instanceof Date ? b.timestamp.getTime() : typeof b.timestamp === 'number' ? b.timestamp : new Date(b.timestamp).getTime();
      return timeB - timeA;
    });
    
    // Ограничиваем количество отображаемых событий
    const limited = sortedEvents.slice(0, maxEvents);
    setDisplayEvents(limited);
  }, [events, maxEvents]);
  
  // Если нет событий, не отображаем блок
  if (displayEvents.length === 0) {
    return null;
  }
  
  // Форматирование числа с плюсом или минусом
  const formatAmount = (type: HitPointEvent['type'], amount: number): string => {
    if (type === 'damage') {
      return `-${amount}`;
    } else if (type === 'healing' || type === 'heal') {
      return `+${amount}`;
    } else if (type === 'temporary' || type === 'tempHP' || type === 'temp') {
      return `+${amount} (врем)`;
    } else {
      return `${amount}`;
    }
  };
  
  // Получение класса для типа события
  const getEventClass = (type: HitPointEvent['type']): string => {
    switch (type) {
      case 'damage':
        return 'text-red-500';
      case 'healing':
      case 'heal':
        return 'text-emerald-500';
      case 'temporary':
      case 'tempHP':
      case 'temp':
        return 'text-blue-400';
      case 'death-save':
        return 'text-purple-500';
      default:
        return 'text-gray-400';
    }
  };
  
  // Получение иконки для типа события
  const getEventIcon = (type: HitPointEvent['type']) => {
    switch (type) {
      case 'damage':
        return <Skull className="h-4 w-4 text-red-500" />;
      case 'healing':
      case 'heal':
        return <Heart className="h-4 w-4 text-emerald-500" />;
      case 'temporary':
      case 'tempHP':
      case 'temp':
        return <Shield className="h-4 w-4 text-blue-400" />;
      case 'death-save':
        return <Skull className="h-4 w-4 text-purple-500" />;
      default:
        return null;
    }
  };
  
  // Форматирование временных меток (например, "5 минут назад")
  const formatTimestamp = (timestamp: number | Date): string => {
    try {
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      return formatDistance(date, new Date(), { 
        addSuffix: true,
        locale: ru 
      });
    } catch (error) {
      return 'неизвестно когда';
    }
  };
  
  return (
    <Card className="border-t-4 border-t-primary/50 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">История урона и исцеления</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[200px] pr-4">
          <div className="px-4 pb-4 space-y-3">
            {displayEvents.map((event, index) => (
              <div key={event.id || `event-${index}`} className="flex items-start gap-3 py-2">
                <div className="mt-1">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{event.source || 'Неизвестный источник'}</span>
                    <span className={`font-semibold ${getEventClass(event.type)}`}>
                      {formatAmount(event.type, event.value || event.amount || 0)}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatTimestamp(event.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DamageLog;
