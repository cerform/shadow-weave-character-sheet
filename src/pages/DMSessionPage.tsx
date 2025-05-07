import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useSessionStore from '@/stores/sessionStore';
import { GameSession, TokenData, Initiative } from '@/types/session.types';
import { toast } from 'sonner';
import { socketService } from '@/services/socket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import BattleMap from '@/components/battle/BattleMap';
import SessionChat from '@/components/SessionChat';
import ErrorDisplay from '@/components/characters/ErrorDisplay';
import InitiativeTrackerPanel from '@/components/session/InitiativeTrackerPanel';
import DiceRoller from '@/components/session/DiceRoller';

const DMSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<GameSession | null>(null);
  const [tokens, setTokens] = useState<TokenData[]>([]);
  const [selectedTokenId, setSelectedTokenId] = useState<number | string | null>(null);
  const [background, setBackground] = useState<string | null>(null);
  const [battleActive, setBattleActive] = useState<boolean>(false);
  const [initiative, setInitiative] = useState<Initiative[]>([]);
  const [activeTab, setActiveTab] = useState<string>('map');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const navigate = useNavigate();
  const sessionStore = useSessionStore();

  // When loading a session
  useEffect(() => {
    if (!sessionId) return;
    
    const loadSession = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const sessions = await sessionStore.fetchSessions();
        const foundSession = sessions.find(s => s.id === sessionId);
        
        if (!foundSession) {
          setError('Сессия не найдена. Проверьте ID сессии или создайте новую.');
          setIsLoading(false);
          return;
        }
        
        // Cast to GameSession to ensure type safety
        const gameSession: GameSession = {
          ...foundSession,
          dmId: foundSession.dmId || '', // Ensure required property
          chat: foundSession.chat || [],
          initiative: foundSession.initiative || [],
          tokens: foundSession.tokens || [],
          isActive: foundSession.isActive || false,
          battleActive: foundSession.battleActive || false
        };
        
        console.log('Найдена сессия:', gameSession);
        
        // Set current session without triggering a re-render
        setSession(gameSession);
        
        // Set other session properties
        setBattleActive(gameSession.battleActive || false);
        
        if (gameSession.map?.background) {
          setBackground(gameSession.map.background);
        }
        
        if (gameSession.initiative) {
          setInitiative(gameSession.initiative);
        }
        
        setTokens(gameSession.tokens || []);
        
        // Connect to WebSocket
        socketService.connect(gameSession.code, 'Мастер подземелий', undefined);
      } catch (error) {
        console.error('Ошибка при загрузке сессии:', error);
        setError('Произошла ошибка при загрузке сессии. Попробуйте обновить страницу.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSession();
    
    // Disconnect from WebSocket on unmount
    return () => {
      socketService.disconnect();
    };
  }, [sessionId]);

  // Update token position
  const handleUpdateTokenPosition = async (id: number | string, x: number, y: number) => {
    const updatedTokens = tokens.map(token => 
      token.id === id ? { ...token, x, y } : token
    );
    
    setTokens(updatedTokens);
    
    if (session) {
      // Update tokens in session
      sessionStore.updateSession({
        ...session,
        tokens: updatedTokens,
        updatedAt: new Date().toISOString()
      });
      
      // Send update through WebSocket
      const updatedToken = updatedTokens.find(token => token.id === id);
      if (updatedToken) {
        socketService.updateToken(updatedToken);
      }
    }
  };

  // Toggle battle status
  const handleBattleToggle = () => {
    if (!session) return;
    
    const newBattleStatus = !battleActive;
    setBattleActive(newBattleStatus);
    
    sessionStore.updateSession({
      ...session,
      battleActive: newBattleStatus,
      updatedAt: new Date().toISOString()
    });
    
    toast.success(newBattleStatus ? 'Режим боя активирован' : 'Режим боя завершен');
    
    // If battle is finished, clear initiative
    if (!newBattleStatus) {
      setInitiative([]);
      sessionStore.updateSession({
        ...session,
        initiative: [],
        updatedAt: new Date().toISOString()
      });
    }
  };
  
  // Update initiative
  const handleUpdateInitiative = (newInitiative: Initiative[]) => {
    setInitiative(newInitiative);
    
    if (session) {
      sessionStore.updateSession({
        ...session,
        initiative: newInitiative,
        updatedAt: new Date().toISOString()
      });
    }
  };
  
  // Next turn
  const handleNextTurn = () => {
    if (initiative.length === 0) return;
    
    setInitiative(prev => {
      const activeIndex = prev.findIndex(i => i.isActive);
      if (activeIndex === -1) return prev;
      
      const nextIndex = (activeIndex + 1) % prev.length;
      
      const updated = prev.map((item, idx) => ({
        ...item,
        isActive: idx === nextIndex
      }));
      
      if (session) {
        sessionStore.updateSession({
          ...session,
          initiative: updated,
          updatedAt: new Date().toISOString()
        });
      }
      
      return updated;
    });
  };

  // If an error occurs
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <ErrorDisplay 
          errorMessage={error} 
          onRetry={() => navigate('/dm')}
          technicalDetails={{ 
            sessionId,
            availableSessions: sessionStore.sessions.map(s => ({ id: s.id, name: s.name }))
          }}
        />
        <div className="mt-4">
          <Button onClick={() => navigate('/dm')}>
            Вернуться к списку сессий
          </Button>
        </div>
      </div>
    );
  }

  // If session data is still loading
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Загрузка сессии...</p>
        </div>
      </div>
    );
  }

  // If session is not found even after loading
  if (!session) {
    return (
      <div className="container mx-auto p-4">
        <Card className="max-w-md mx-auto bg-card/95 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Сессия не найдена</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Запрошенная сессия не существует или была удалена.</p>
            <Button onClick={() => navigate('/dm')}>
              Вернуться к списку сессий
            </Button>
          </CardContent>
        </Card>
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
          <Button variant="outline" onClick={() => navigate('/dm')}>
            Выйти из сессии
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[calc(100%-3rem)]">
        <TabsList className="grid grid-cols-5 md:w-auto w-full">
          <TabsTrigger value="map">Карта</TabsTrigger>
          <TabsTrigger value="initiative">Инициатива</TabsTrigger>
          <TabsTrigger value="players">Игроки ({session.players?.length || 0})</TabsTrigger>
          <TabsTrigger value="chat">Чат</TabsTrigger>
          <TabsTrigger value="dice">Кубики</TabsTrigger>
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
        
        <TabsContent value="initiative" className="h-full overflow-y-auto">
          <Card className="h-full">
            <CardContent className="p-4">
              <InitiativeTrackerPanel 
                initiative={initiative}
                tokens={tokens}
                battleActive={battleActive}
                sessionId={session.id}
                onUpdateInitiative={handleUpdateInitiative}
                onToggleBattle={handleBattleToggle}
                onNextTurn={handleNextTurn}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="players" className="h-full">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Игроки в сессии</CardTitle>
            </CardHeader>
            <CardContent>
              {session.players && session.players.length > 0 ? (
                <div className="space-y-4">
                  {session.players.map((player) => (
                    <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{player.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {player.characterId ? "Персонаж выбран" : "Персонаж не выбран"}
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
              messages={session?.chat || []}
              onSendMessage={handleSendMessage}
              sessionCode={session?.code || ''}
              playerName="Мастер подземелий"
              roomCode={session?.code || ''}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="dice" className="h-full">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Кубики</CardTitle>
              <CardDescription>
                Бросайте кубики и делитесь результатами с игроками
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DiceRoller roomCode={session.code} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DMSessionPage;
