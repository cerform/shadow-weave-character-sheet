import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { usePlayerSessions } from '@/hooks/usePlayerSessions';
import { Users, Calendar, Hash, ArrowRight, RefreshCw, Home, Crown } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

const PlayerSessionsPage = () => {
  const navigate = useNavigate();
  const { sessions, loading, error, refetch } = usePlayerSessions();

  if (loading) {
    return (
      <div className="container mx-auto p-6 max-w-6xl">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center space-y-4">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground">Загрузка активных сессий...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Заголовок */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
              Мои игровые сессии
            </h1>
            <p className="text-muted-foreground">
              Список активных сессий, в которых вы участвуете
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Обновить
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4 mr-2" />
              На главную
            </Button>
          </div>
        </div>
      </div>

      {/* Ошибка */}
      {error && (
        <Card className="mb-6 border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <p className="text-destructive">❌ {error}</p>
          </CardContent>
        </Card>
      )}

      {/* Список сессий */}
      {sessions.length === 0 ? (
        <Card className="border-2 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="rounded-full bg-muted p-6">
              <Users className="h-12 w-12 text-muted-foreground" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-semibold">Нет активных сессий</h3>
              <p className="text-muted-foreground max-w-md">
                Вы пока не участвуете ни в одной игровой сессии. 
                Попросите Мастера подключить вас к сессии или создайте свою!
              </p>
            </div>
            <div className="flex gap-3 mt-4">
              <Button onClick={() => navigate('/join-session')} variant="default">
                <Users className="h-4 w-4 mr-2" />
                Присоединиться к сессии
              </Button>
              <Button onClick={() => navigate('/dm')} variant="outline">
                <Crown className="h-4 w-4 mr-2" />
                Стать Мастером
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {sessions.map((session) => (
            <Card
              key={session.id}
              className="group hover:shadow-lg transition-all duration-300 hover:border-primary/50 cursor-pointer"
              onClick={() => navigate(`/player-session/${session.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-2xl group-hover:text-primary transition-colors">
                      {session.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {session.description || 'Нет описания'}
                    </CardDescription>
                  </div>
                  <Badge 
                    variant={session.is_active ? 'default' : 'secondary'}
                    className="ml-2"
                  >
                    {session.is_active ? 'Активна' : 'Завершена'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Информация о сессии */}
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Hash className="h-4 w-4" />
                    <span className="font-mono">{session.session_code}</span>
                  </div>
                  
                  {session.joined_at && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>
                        Присоединились{' '}
                        {formatDistanceToNow(new Date(session.joined_at), {
                          addSuffix: true,
                          locale: ru,
                        })}
                      </span>
                    </div>
                  )}

                  {session.player_name && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>Играете как: {session.player_name}</span>
                    </div>
                  )}
                </div>

                {/* Кнопка входа */}
                <Button 
                  className="w-full group-hover:bg-primary/90 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/player-session/${session.id}`);
                  }}
                >
                  Войти в сессию
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Счетчик сессий */}
      {sessions.length > 0 && (
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Найдено активных сессий: <span className="font-semibold text-foreground">{sessions.length}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default PlayerSessionsPage;
