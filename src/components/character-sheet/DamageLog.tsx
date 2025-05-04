
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from 'date-fns';
import { HitPointEvent } from '@/types/character';

interface DamageLogProps {
  events: HitPointEvent[];
}

const DamageLog: React.FC<DamageLogProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <Card className="border border-border">
        <CardHeader>
          <CardTitle className="text-sm">Журнал урона</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Нет записей</p>
        </CardContent>
      </Card>
    );
  }

  const getEventTypeClass = (event: HitPointEvent) => {
    if (typeof event === 'object') {
      if (event.type === 'damage') {
        return "text-red-500";
      } else if (event.type === 'heal' || event.type === 'healing') {
        return "text-green-500";
      } else if (event.type === 'temp' || event.type === 'tempHP') {
        return "text-blue-500";
      }
    }
    return "";
  };

  const formatDate = (timestamp: number) => {
    try {
      return format(new Date(timestamp), 'HH:mm:ss');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getEventLabel = (event: HitPointEvent) => {
    switch (event.type) {
      case 'damage':
        return `-${event.value}`;
      case 'heal':
      case 'healing':
        return `+${event.value}`;
      case 'temp':
      case 'tempHP':
        return `+${event.value} (врем)`;
      case 'death-save':
        return event.value && event.value > 0 ? 'Успех' : 'Провал';
      default:
        return `${event.value}`;
    }
  };

  const getEventIcon = (event: HitPointEvent) => {
    switch (event.type) {
      case 'damage':
        return "⚔️";
      case 'heal':
      case 'healing':
        return "💖";
      case 'temp':
      case 'tempHP':
        return "🛡️";
      case 'death-save':
        return event.value && event.value > 0 ? "✅" : "❌";
      default:
        return "❓";
    }
  };

  // Sort events by timestamp (newest first)
  const sortedEvents = [...events].sort((a, b) => b.timestamp - a.timestamp);
  
  return (
    <Card className="border border-border">
      <CardHeader className="p-4">
        <CardTitle className="text-sm">Журнал урона</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-muted/50 sticky top-0">
              <tr>
                <th className="text-left p-2 text-xs">Время</th>
                <th className="text-left p-2 text-xs">Изменение</th>
                <th className="text-left p-2 text-xs">Источник</th>
              </tr>
            </thead>
            <tbody>
              {sortedEvents.map((event, index) => (
                <tr key={event.id || index} className="border-t border-border hover:bg-muted/20">
                  <td className="p-2 text-xs">
                    {formatDate(event.timestamp)}
                  </td>
                  <td className={`p-2 text-xs ${getEventTypeClass(event)}`}>
                    {getEventIcon(event)} {getEventLabel(event)}
                  </td>
                  <td className="p-2 text-xs text-muted-foreground">
                    {event.source || 'Н/Д'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};

export default DamageLog;
