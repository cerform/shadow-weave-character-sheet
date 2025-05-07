
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Gamepad2, Play, Users, Calendar, Clock } from 'lucide-react';
import { GameSession } from '@/types/session.types';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface SessionsListProps {
  sessions: GameSession[];
  type: 'dm' | 'player';
  isLoading?: boolean;
}

const SessionsList: React.FC<SessionsListProps> = ({ sessions, type, isLoading }) => {
  const navigate = useNavigate();

  const handleJoinSession = (sessionId: string) => {
    if (type === 'dm') {
      navigate(`/dm-session/${sessionId}`);
    } else {
      navigate(`/game-session/${sessionId}`);
    }
  };

  const handleCreateSession = () => {
    navigate(type === 'dm' ? '/dm/create-session' : '/join-session');
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((index) => (
          <Card key={index} className="relative animate-pulse">
            <CardHeader className="bg-muted/20 h-16"></CardHeader>
            <CardContent className="py-4">
              <div className="space-y-3">
                <div className="h-4 bg-muted/40 rounded w-3/4"></div>
                <div className="h-3 bg-muted/30 rounded w-1/2"></div>
                <div className="h-3 bg-muted/30 rounded w-2/3"></div>
                <div className="h-3 bg-muted/30 rounded w-1/2"></div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/10 h-12"></CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card className="w-full p-6 flex flex-col items-center justify-center">
        <div className="mb-4">
          <Gamepad2 className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-xl font-semibold mb-2">
          {type === 'dm' ? 'У вас пока нет созданных сессий' : 'Вы не участвуете в сессиях'}
        </h3>
        <p className="text-muted-foreground mb-4 text-center">
          {type === 'dm'
            ? 'Создайте игровую сессию и пригласите игроков присоединиться к ней'
            : 'Попросите мастера поделиться с вами кодом сессии'}
        </p>
        <Button onClick={handleCreateSession}>
          {type === 'dm' ? 'Создать сессию' : 'Присоединиться к сессии'}
        </Button>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sessions.map((session) => {
        // Проверяем, существуют ли нужные данные
        const hasCreatedAt = session.createdAt && !isNaN(new Date(session.createdAt).getTime());
        const hasUpdatedAt = session.updatedAt && !isNaN(new Date(session.updatedAt).getTime());
        
        return (
          <Card key={session.id} className="relative overflow-hidden">
            {!session.isActive && (
              <div className="absolute top-0 right-0 left-0 bg-destructive/90 text-destructive-foreground py-1 px-2 text-center text-sm font-medium">
                Сессия завершена
              </div>
            )}
            
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="truncate">{session.name || 'Без названия'}</CardTitle>
                <Badge variant={session.isActive ? 'default' : 'outline'}>
                  {session.isActive ? 'Активна' : 'Завершена'}
                </Badge>
              </div>
              <CardDescription>
                Код: <span className="font-mono">{session.code}</span>
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <Users className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>
                    {session.players?.length || 0} игроков
                  </span>
                </div>
                
                {hasCreatedAt && (
                  <div className="flex items-center text-sm">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>
                      Создана {' '}
                      {formatDistanceToNow(new Date(session.createdAt), {
                        addSuffix: true,
                        locale: ru,
                      })}
                    </span>
                  </div>
                )}
                
                {hasUpdatedAt && hasCreatedAt && session.updatedAt !== session.createdAt && (
                  <div className="flex items-center text-sm">
                    <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span>
                      Обновлена {' '}
                      {formatDistanceToNow(new Date(session.updatedAt), {
                        addSuffix: true,
                        locale: ru,
                      })}
                    </span>
                  </div>
                )}
                
                {session.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {session.description}
                  </p>
                )}
              </div>
            </CardContent>
            
            <CardFooter>
              <Button 
                className="w-full" 
                variant={session.isActive ? "default" : "outline"}
                onClick={() => handleJoinSession(session.id)}
                disabled={!session.isActive}
              >
                <Play className="mr-2 h-4 w-4" />
                {session.isActive ? 'Присоединиться' : 'Просмотреть'}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default SessionsList;
