
import React from 'react';
import { Button } from "@/components/ui/button";
import { Undo2 } from "lucide-react";
import { HealthEvent } from '@/hooks/useHealthSystem';

interface DamageLogProps {
  events: HealthEvent[];
  undoLastEvent: () => void;
  className?: string;
}

export const DamageLog: React.FC<DamageLogProps> = ({ 
  events, 
  undoLastEvent,
  className = "" 
}) => {
  if (events.length === 0) {
    return null;
  }

  // Функция форматирования времени
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`${className}`}>
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-semibold">Журнал событий</h4>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={undoLastEvent} 
          disabled={events.length === 0}
          className="h-6 text-xs"
        >
          <Undo2 className="h-3 w-3 mr-1" />
          Отменить
        </Button>
      </div>
      
      <div className="max-h-32 overflow-y-auto text-xs bg-black/20 rounded-md">
        {events.slice(0, 5).map((event, index) => (
          <div key={`${event.type}-${event.timestamp}-${index}`} 
               className={`p-2 border-b border-gray-800 last:border-0 flex justify-between items-center ${
                 event.type === 'damage' ? 'text-red-500' : 
                 event.type === 'healing' ? 'text-green-500' : 
                 'text-blue-500'
               }`}
          >
            <div>
              <span className="font-medium">
                {event.type === 'damage' ? '-' : '+'}
                {event.amount} HP
              </span>
              {event.source && <span className="opacity-70 ml-1">({event.source})</span>}
            </div>
            <div className="opacity-50 text-[10px]">{formatTime(event.timestamp)}</div>
          </div>
        ))}
      </div>
      {events.length > 5 && (
        <div className="text-center text-[10px] mt-1 opacity-60">
          + еще {events.length - 5} событий
        </div>
      )}
    </div>
  );
};

export default DamageLog;
