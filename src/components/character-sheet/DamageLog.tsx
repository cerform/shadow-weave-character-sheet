
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { HitPointEvent } from '@/types/character';

interface DamageLogProps {
  events: HitPointEvent[];
  maxItems?: number;
}

const DamageLog: React.FC<DamageLogProps> = ({ events = [], maxItems = 10 }) => {
  const recentEvents = maxItems ? events.slice(-maxItems) : events;

  // Функция для получения стиля на основе типа события
  const getEventStyle = (type: string) => {
    switch (type) {
      case 'damage':
        return {
          badge: 'bg-red-500 text-white',
          text: 'text-red-500',
          label: 'Урон'
        };
      case 'healing':
      case 'heal':
        return {
          badge: 'bg-green-500 text-white',
          text: 'text-green-500',
          label: 'Лечение'
        };
      case 'temp':
      case 'tempHP':
        return {
          badge: 'bg-blue-500 text-white',
          text: 'text-blue-500',
          label: 'Временные ХП'
        };
      case 'death-save':
        return {
          badge: 'bg-purple-500 text-white',
          text: 'text-purple-500',
          label: 'Спасбросок от смерти'
        };
      default:
        return {
          badge: 'bg-gray-500 text-white',
          text: 'text-gray-500',
          label: 'Прочее'
        };
    }
  };

  // Форматирование даты
  const formatDate = (timestamp: number | Date): string => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>История изменений ХП</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[200px] w-full">
          {recentEvents.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              Нет записей об изменениях хитов
            </div>
          ) : (
            <ul className="space-y-2">
              {recentEvents.map((event, index) => {
                const style = getEventStyle(event.type);
                return (
                  <li key={event.id || index} className="flex items-center justify-between p-2 border-b last:border-0">
                    <div className="flex items-center gap-2">
                      <Badge className={style.badge}>{style.label}</Badge>
                      <span className={style.text}>
                        {event.type === 'damage' ? `-${event.value}` : `+${event.value}`}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {event.source && <span className="mr-2">{event.source}</span>}
                      {formatDate(event.timestamp)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default DamageLog;
