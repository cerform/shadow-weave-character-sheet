
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessionById } from '@/services/sessionService';
import { GameSession, TokenData } from '@/types/session.types';
import { useToast } from '@/hooks/use-toast';
import { socketService } from '@/services/socket';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { useCharacter } from '@/contexts/CharacterContext';
import CharacterContent from '@/components/character-sheet/CharacterContent';
import RestPanel from '@/components/character-sheet/RestPanel';
import SessionChat from '@/components/SessionChat';

const GameSessionPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<GameSession | null>(null);
  const [playerToken, setPlayerToken] = useState<TokenData | null>(null);
  const [activeTab, setActiveTab] = useState<string>('character');
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { character, updateCharacter } = useCharacter();

  // Загружаем данные сессии
  useEffect(() => {
    if (!sessionId || !currentUser) return;
    
    const loadSession = async () => {
      try {
        const sessionData = await getSessionById(sessionId);
        if (!sessionData) {
          toast({
            title: 'Ошибка',
            description: 'Сессия не найдена',
            variant: 'destructive',
          });
          navigate('/player');
          return;
        }
        
        setSession(sessionData);
        
        // Находим игрока в сессии
        const player = sessionData.players.find(p => p.userId === currentUser.uid);
        if (!player) {
          toast({
            title: 'Ошибка',
            description: 'Вы не являетесь участником этой сессии',
            variant: 'destructive',
          });
          navigate('/player');
          return;
        }
        
        // Находим токен персонажа игрока
        if (sessionData.tokens) {
          const token = sessionData.tokens.find(t => t.characterId === player.characterId);
          if (token) {
            setPlayerToken(token);
          }
        }
        
        // Подключаем WebSocket
        socketService.connect(
          sessionData.code,
          player.name,
          player.characterId
        );
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
  }, [sessionId, navigate, toast, currentUser]);

  // Обновление персонажа
  const handleCharacterUpdate = (updates: Partial<Character>) => {
    if (!character) return;
    
    const updatedCharacter = { ...character, ...updates };
    updateCharacter(updatedCharacter);
    
    // Отправляем обновление персонажа через WebSocket
    socketService.updateToken({
      characterId: character.id,
      hp: updatedCharacter.currentHp,
      maxHp: updatedCharacter.maxHp
    });
  };

  // Отправка сообщения в чат
  const handleSendMessage = (message: string) => {
    if (!message.trim() || !session) return;
    
    const chatMessage = {
      message,
      roomCode: session.code,
      nickname: character?.name || 'Игрок'
    };
    
    socketService.sendChatMessage(chatMessage);
  };

  // Обработка броска кубиков
  const handleDiceRoll = (formula: string, reason?: string) => {
    socketService.sendRoll({ 
      formula, 
      reason,
      characterName: character?.name
    });
  };

  // Если данные сессии еще не загружены
  if (!session || !sessionId || !character) {
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
          <p className="text-muted-foreground">Мастер: {session.dmId}</p>
        </div>
        <Button variant="outline" onClick={() => navigate('/player')}>
          Покинуть сессию
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-[calc(100%-3rem)]">
        <TabsList>
          <TabsTrigger value="character">Персонаж</TabsTrigger>
          <TabsTrigger value="map">Карта</TabsTrigger>
          <TabsTrigger value="chat">Чат</TabsTrigger>
        </TabsList>
        
        <TabsContent value="character" className="h-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
            <div className="md:col-span-2 h-full overflow-auto">
              <Card className="h-full">
                <CardContent className="p-4">
                  <CharacterContent
                    character={character}
                    onUpdate={handleCharacterUpdate}
                    section="resources"
                  />
                  <div className="mt-4">
                    <CharacterContent
                      character={character}
                      onUpdate={handleCharacterUpdate}
                      section="skills"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="space-y-4">
              <RestPanel
                character={character}
                onUpdate={handleCharacterUpdate}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle>Броски</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => handleDiceRoll('d20', 'проверка')}
                    >
                      d20
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleDiceRoll('2d6', 'урон')}
                    >
                      2d6
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleDiceRoll('d8', 'исцеление')}
                    >
                      d8
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleDiceRoll('d100', 'случайный эффект')}
                    >
                      d100
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="map" className="h-full">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Карта игровой сессии</CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-4rem)] flex items-center justify-center">
              {session.map?.background ? (
                <div
                  className="h-full w-full bg-center bg-contain bg-no-repeat"
                  style={{ backgroundImage: `url(${session.map.background})` }}
                >
                  {/* Здесь будет отображаться игровая карта для игрока */}
                </div>
              ) : (
                <div className="text-center text-muted-foreground">
                  <p>Карта не загружена мастером</p>
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
              playerName={character.name}
              roomCode={session.code}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GameSessionPage;
