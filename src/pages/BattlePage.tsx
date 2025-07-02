
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { socketService, GameSession } from '@/services/socket';
import BattleMapPanel from '@/components/battle/BattleMapPanel';
import { ArrowLeft, Crown, Users } from 'lucide-react';

const BattlePage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isDM, setIsDM] = useState(false);

  useEffect(() => {
    const initializeConnection = async () => {
      try {
        const connected = await socketService.connect();
        setIsConnected(connected);
        
        if (connected) {
          const session = socketService.getCurrentSession();
          if (session) {
            setCurrentSession(session);
            // Определяем роль пользователя
            const currentUser = session.players.find(p => p.isOnline);
            setIsDM(currentUser?.isDM || false);
          } else {
            toast({
              title: "Сессия не найдена",
              description: "Подключитесь к активной сессии для доступа к боевой карте",
              variant: "destructive"
            });
            navigate('/');
          }
        }
      } catch (error) {
        console.error('Ошибка подключения:', error);
        toast({
          title: "Ошибка подключения",
          description: "Не удалось подключиться к серверу",
          variant: "destructive"
        });
      }
    };

    initializeConnection();

    // Подписка на обновления сессии
    const handleSessionUpdate = (session: GameSession) => {
      setCurrentSession(session);
    };

    socketService.onSessionUpdate(handleSessionUpdate);

    return () => {
      socketService.removeSessionUpdateListener(handleSessionUpdate);
    };
  }, [sessionId, navigate, toast]);

  const handleBackToSession = () => {
    if (isDM) {
      navigate('/dm');
    } else {
      navigate('/session');
    }
  };

  if (!isConnected) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full"></div>
              <h3 className="text-lg font-semibold">Подключение к серверу...</h3>
              <p className="text-sm text-muted-foreground">Загружаем боевую карту</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-6 w-6" />
              Сессия не найдена
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Для доступа к боевой карте необходимо подключиться к активной игровой сессии.
            </p>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/')}>На главную</Button>
              <Button variant="outline" onClick={() => navigate('/session')}>
                Присоединиться к сессии
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleBackToSession}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Назад к сессии
          </Button>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            ⚔️ Боевая карта
            {isDM && <Crown className="h-6 w-6 text-yellow-500" />}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Сессия: {currentSession.name}
          </span>
          <span className="px-2 py-1 bg-primary/10 text-primary rounded text-sm">
            {currentSession.code}
          </span>
        </div>
      </div>

      <BattleMapPanel 
        isDM={isDM}
        sessionId={sessionId}
      />
    </div>
  );
};

export default BattlePage;
