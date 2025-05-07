
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessionById, getSessionTokens, updateToken, removeToken } from '@/services/sessionService';
import { GameSession, TokenData, Initiative } from '@/types/session.types';
import { useToast } from '@/hooks/use-toast';
import { socketService } from '@/services/socket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BattleMap from '@/components/battle/BattleMap';
import SessionChat from '@/components/SessionChat';

const DMSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<GameSession | null>(null);
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<number | null>(null);
  const [background, setBackground] = useState<string | null>(null);
  const [battleActive, setBattleActive] = useState<boolean>(false);
  const [initiative, setInitiative] = useState<Initiative[]>([]);
  const [activeTab, setActiveTab] = useState<string>('map');
  const { toast } = useToast();
  const navigate = useNavigate();

  // Загружаем данные сессии
  useEffect(() => {
    if (!sessionId) return;
    
    const loadSession = async () => {
      try {
        const sessionData = await getSessionById(sessionId);
        if (!sessionData) {
          toast({
            title: 'Ошибка',
            description: 'Сессия не найдена',
            variant: 'destructive',
          });
          navigate('/dm');
          return;
        }
        
        setSession(sessionData);
        setBattleActive(sessionData.battleActive || false);
        
        if (sessionData.map?.background) {
          setBackground(sessionData.map.background);
        }
        
        if (sessionData.initiative) {
          setInitiative(sessionData.initiative);
        }
        
        // Загружаем токены
        const sessionTokens = await getSessionTokens(sessionId);
        setTokens(sessionTokens || []);
        
        // Подключаем WebSocket
        socketService.connect(sessionData.code, 'Мастер подземелий', undefined);
      } catch (error) {
        console.error('Ошибка при загрузке сессии:', error);
        toast({
          title: 'Ошибка',
          description: 'Произошла ошибка при загрузке сессии',
          variant: 'destructive',
        });
      }
    };
    
    loadSession();
    
    // Отключаем WebSocket при размонтировании
    return () => {
      socketService.disconnect();
    };
  }, [sessionId, navigate, toast]);

  // Обновление позиции токена
  const handleUpdateTokenPosition = async (id: number, x: number, y: number) => {
    const updatedTokens = tokens.map(token => 
      token.id === id ? { ...token, x, y } : token
    );
    
    setTokens(updatedTokens);
    
    const updatedToken = updatedTokens.find(token => token.id === id);
    if (updatedToken && sessionId) {
      try {
        await updateToken(sessionId, updatedToken);
        // Отправляем обновление через WebSocket
        socketService.updateToken(updatedToken);
      } catch (error) {
        console.error('Ошибка при обновлении токена:', error);
      }
    }
  };

  // Выбор токена
  const handleSelectToken = (id: number | null) => {
    setSelectedTokenId(id);
  };

  // Отправка сообщения в чат
  const handleSendMessage = (message: string) => {
    if (!message.trim()) return;
    
    const chatMessage = {
      message,
      roomCode: session?.code || '',
      nickname: 'Мастер подземелий'
    };
    
    socketService.sendChatMessage(chatMessage);
  };

  // Обработка запросов на бросок кубиков
  const handleDiceRoll = (formula: string, reason?: string) => {
    socketService.sendRoll({ formula, reason });
  };

  // Если данные сессии еще не загружены
  if (!session || !sessionId) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Загрузка сессии...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 h-[calc(100vh-4rem)]">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold">{session.name}</h1>
          <p className="text-muted-foreground">Код сессии: {session.code}</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={battleActive ? "destructive" : "default"}
            onClick={() => setBattleActive(!battleActive)}
          >
            {battleActive ? 'Завершить бой' : 'Начать бой'}
          </Button>
          <Button variant="outline" onClick={() => navigate('/dm')}>
            Выйти из сессии
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[calc(100%-3rem)]">
        <TabsList>
          <TabsTrigger value="map">Карта</TabsTrigger>
          <TabsTrigger value="players">Игроки ({session.players.length})</TabsTrigger>
          <TabsTrigger value="chat">Чат</TabsTrigger>
        </TabsList>
        
        <TabsContent value="map" className="h-full">
          <div className="h-full">
            <BattleMap 
              tokens={tokens}
              setTokens={(newToken) => {
                if (typeof newToken === 'function') {
                  setTokens(newToken);
                } else {
                  setTokens(prevTokens => [...prevTokens, newToken]);
                }
              }}
              background={background}
              setBackground={setBackground}
              onUpdateTokenPosition={handleUpdateTokenPosition}
              onSelectToken={handleSelectToken}
              selectedTokenId={selectedTokenId}
              initiative={initiative}
              battleActive={battleActive}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="players" className="h-full">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Игроки в сессии</CardTitle>
            </CardHeader>
            <CardContent>
              {session.players.length > 0 ? (
                <div className="space-y-4">
                  {session.players.map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{player.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {player.character?.name || "Персонаж не выбран"}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <span className={`h-3 w-3 rounded-full mr-2 ${player.isConnected ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                        {player.isConnected ? 'В сети' : 'Не в сети'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8">
                  <p className="text-muted-foreground">В сессии пока нет игроков</p>
                  <p className="mt-2 text-sm">Поделитесь кодом сессии: <span className="font-bold">{session.code}</span></p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="chat" className="h-full">
          <div className="h-full">
            <SessionChat 
              messages={[]}
              onSendMessage={handleSendMessage}
              sessionCode={session.code}
              playerName="Мастер подземелий"
              roomCode={session.code}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DMSessionPage;
