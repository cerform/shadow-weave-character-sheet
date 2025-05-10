
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Book, Dice, Clock, Download } from 'lucide-react';
import { format } from 'date-fns';

export interface EventLogEntry {
  id: string;
  type: 'dice' | 'spell' | 'combat' | 'player' | 'system' | 'dm';
  message: string;
  timestamp: string;
  details?: any;
}

interface SessionEventLogProps {
  entries: EventLogEntry[];
  onClearLog?: () => void;
  onExportLog?: () => void;
}

const SessionEventLog: React.FC<SessionEventLogProps> = ({
  entries = [],
  onClearLog = () => {},
  onExportLog = () => {}
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [filteredEntries, setFilteredEntries] = useState<EventLogEntry[]>(entries);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredEntries(entries);
    } else {
      setFilteredEntries(entries.filter(entry => entry.type === activeTab));
    }
  }, [activeTab, entries]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [filteredEntries]);

  const getEventColor = (type: string) => {
    switch (type) {
      case 'dice': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'spell': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'combat': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'player': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'system': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
      case 'dm': return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };
  
  const getEventIcon = (type: string) => {
    switch (type) {
      case 'dice': return <Dice className="h-3 w-3 mr-1" />;
      case 'spell': return <span className="mr-1">✨</span>;
      case 'combat': return <span className="mr-1">⚔️</span>;
      case 'player': return <span className="mr-1">👤</span>;
      case 'system': return <span className="mr-1">🔧</span>;
      case 'dm': return <span className="mr-1">🎭</span>;
      default: return null;
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span className="flex items-center gap-2">
            <Book className="h-4 w-4" />
            Журнал событий
          </span>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onExportLog}
              title="Экспорт журнала"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearLog}
              title="Очистить журнал"
            >
              Очистить
            </Button>
          </div>
        </CardTitle>
      </CardHeader>

      <div className="px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-7 h-8">
            <TabsTrigger value="all" className="text-xs py-0">Все</TabsTrigger>
            <TabsTrigger value="dice" className="text-xs py-0">Броски</TabsTrigger>
            <TabsTrigger value="spell" className="text-xs py-0">Магия</TabsTrigger>
            <TabsTrigger value="combat" className="text-xs py-0">Бой</TabsTrigger>
            <TabsTrigger value="player" className="text-xs py-0">Игроки</TabsTrigger>
            <TabsTrigger value="dm" className="text-xs py-0">Мастер</TabsTrigger>
            <TabsTrigger value="system" className="text-xs py-0">Система</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      <CardContent className="flex-grow p-0 px-4 overflow-hidden">
        <ScrollArea 
          className="h-[350px] pr-4" 
          ref={scrollRef}
        >
          {filteredEntries.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Журнал пуст
            </div>
          ) : (
            <div className="space-y-2 py-4">
              {filteredEntries.map((entry) => (
                <div key={entry.id} className="text-sm border-l-2 pl-3 py-1" style={{ borderColor: entry.type === 'dm' ? '#f59e0b' : '#d1d5db' }}>
                  <div className="flex justify-between items-center mb-1">
                    <Badge variant="outline" className={`text-xs px-1 py-0 ${getEventColor(entry.type)}`}>
                      <span className="flex items-center">
                        {getEventIcon(entry.type)}
                        {entry.type === 'dice' ? 'Бросок' : 
                         entry.type === 'spell' ? 'Заклинание' : 
                         entry.type === 'combat' ? 'Бой' : 
                         entry.type === 'player' ? 'Игрок' :
                         entry.type === 'dm' ? 'Мастер' : 'Система'}
                      </span>
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {format(new Date(entry.timestamp), 'HH:mm:ss')}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{entry.message}</p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SessionEventLog;
