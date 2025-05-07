
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { GameSession } from '@/types/session.types';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Users, Clock, Play, CalendarDays, Edit } from 'lucide-react';

interface SessionsListProps {
  sessions: GameSession[];
  onJoinSession: (sessionId: string) => void;
  onEditSession?: (sessionId: string) => void;
}

const SessionsList: React.FC<SessionsListProps> = ({ sessions, onJoinSession, onEditSession }) => {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true, locale: ru });
    } catch (e) {
      return 'Неизвестная дата';
    }
  };
  
  return (
    <Card className="h-full">
      <ScrollArea className="h-full p-4">
        {sessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8">
            <CalendarDays className="h-12 w-12 mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">Нет игровых сессий</h3>
            <p className="text-muted-foreground text-center">
              Создайте новую игровую сессию или присоединитесь к существующей по коду приглашения.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`p-4 rounded-lg border ${
                  session.isActive
                    ? 'bg-primary/10 border-primary/30'
                    : 'bg-card hover:bg-accent/5'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-lg">{session.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <Users className="h-3.5 w-3.5 mr-1" />
                      <span>
                        {session.players.length} {session.players.length === 1 ? 'игрок' : 'игроков'}
                      </span>
                      <span className="mx-2">•</span>
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>
                        {session.updatedAt
                          ? `Обновлено ${formatDate(session.updatedAt)}`
                          : `Создано ${formatDate(session.createdAt)}`}
                      </span>
                    </div>
                    {session.description && (
                      <p className="mt-2 text-sm line-clamp-2">{session.description}</p>
                    )}
                    <div className="mt-2 flex items-center">
                      <div className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                        Код: {session.code}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {onEditSession && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEditSession(session.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant={session.isActive ? "default" : "outline"}
                      onClick={() => onJoinSession(session.id)}
                    >
                      <Play className="h-4 w-4 mr-2" />
                      {session.isActive ? 'Продолжить' : 'Присоединиться'}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </Card>
  );
};

export default SessionsList;
