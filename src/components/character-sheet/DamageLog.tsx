
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DamageEvent } from '@/hooks/useDamageLog';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Shield, Heart, Plus, Minus, Undo } from 'lucide-react';
import { format } from 'date-fns';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DamageLogProps {
  events: DamageEvent[];
  undoLastEvent?: () => void;
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
  
  return (
    <div className={`rounded-lg overflow-hidden ${className}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-medium" style={{ color: currentTheme.textColor }}>
          Журнал событий
        </h3>
        {undoLastEvent && events.length > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={undoLastEvent} 
                  className="h-7 px-2 text-xs flex items-center gap-1"
                  style={{ color: currentTheme.accent }}
                >
                  <Undo className="h-3.5 w-3.5" />
                  Отменить
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Отменить последнее изменение HP</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      <div className={`bg-black/30 rounded-lg p-1 ${expanded ? 'max-h-64' : 'max-h-32'}`}>
        <ScrollArea className="h-full">
          <AnimatePresence initial={false}>
            {displayEvents.map((event, index) => (
              <motion.div
                key={event.id}
                className="flex items-center py-1 px-2 rounded-md mb-1 bg-black/30"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div 
                  className={`flex items-center justify-center h-5 w-5 rounded-full mr-2 ${
                    event.type === 'damage' 
                      ? 'bg-red-500/20' 
                      : event.type === 'heal'
                        ? 'bg-green-500/20'
                        : 'bg-emerald-400/20'
                  }`}
                >
                  {event.type === 'damage' ? (
                    <Minus className="h-3 w-3 text-red-500" />
                  ) : event.type === 'heal' ? (
                    <Plus className="h-3 w-3 text-green-500" />
                  ) : (
                    <Shield className="h-3 w-3 text-emerald-400" />
                  )}
                </div>
                
                <div className="flex-1 text-xs" style={{ color: currentTheme.textColor }}>
                  <span>
                    {event.type === 'damage' 
                      ? `Урон ${event.amount}` 
                      : event.type === 'heal' 
                        ? `Лечение ${event.amount}`
                        : `Временные HP ${event.amount}`
                    }
                  </span>
                  {event.source && (
                    <span className="text-gray-400 ml-1">от {event.source}</span>
                  )}
                </div>
                
                <span className="text-xs text-gray-500">
                  {format(new Date(event.timestamp), 'HH:mm:ss')}
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
