import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSessionById } from '@/services/sessionService';
import { Character } from '@/types/character';
import { GameSession } from '@/types/session.types';
import { useAuth } from '@/hooks/use-auth';
import { getCharacter } from '@/services/characterService';
import { useSocket } from '@/contexts/SocketContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, MessageSquare, UserCircle, Gamepad } from 'lucide-react';
import SessionChat from '@/components/SessionChat';

const GameSessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [session, setSession] = useState<GameSession | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('character');
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { isConnected, connect, disconnect } = useSocket();

  useEffect(() => {
    if (!sessionId || !currentUser) {
      navigate('/player');
      return;
    }

    const loadSession = async () => {
      setIsLoading(true);
      
      try {
        // Загружаем данные сессии
        const sessionData = await getSessionById(sessionId);
        
        if (!sessionData) {
          toast.error('Сессия не найдена');
          navigate('/player');
          return;
        }
        
        // Проверяем, принадлежит ли пользователь к этой сессии
        const playerData = sessionData.players.find(p => p.userId === currentUser.uid);
        
        if (!playerData) {
          toast.error('Вы не являетесь участником этой сессии');
          navigate('/player');
          return;
        }
        
        // Загружаем персонажа игрока
        if (playerData.characterId) {
          const characterData = await getCharacter(playerData.characterId);
          setCharacter(characterData);
          
          // Подключаемся к WebSocket сессии
          if (!isConnected) {
            connect(
              sessionData.code, 
              characterData?.name || playerData.name, 
              playerData.characterId
            );
          }
        }
        
        setSession(sessionData);
      } catch (error) {
        console.error('Ошибка при загрузке сессии:', error);
        toast.error('Произошла ошибка при загрузке сессии');
      } finally {
        setIsLoading(false);
      }
    };

    loadSession();
    
    // Отключаемся от WebSocket при размонтировании
    return () => {
      disconnect();
    };
  }, [sessionId, currentUser, navigate, connect, disconnect, isConnected]);

  // Отправка сообщения в чат
  const handleSendMessage = (message: string) => {
    if (!message.trim() || !session) return;
    
    const chatMessage = {
      message,
      roomCode: session.code,
      nickname: character?.name || 'Игрок'
    };
    
    // Отправляем через WebSocket
    // socketService.sendChatMessage(chatMessage);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>Загрузка сессии...</p>
        </div>
      </div>
    );
  }

  if (!session || !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <p className="mb-4">Ошибка при загрузке сессии</p>
            <Button onClick={() => navigate('/player')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Вернуться к списку сессий
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b p-4">
        <div className="container mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{session.name}</h1>
            <p className="text-muted-foreground">Код сессии: {session.code}</p>
          </div>
          <Button variant="outline" onClick={() => navigate('/player')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Выйти из сессии
          </Button>
        </div>
      </header>

      <main className="container mx-auto p-4 h-[calc(100vh-5rem)]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="mb-4">
            <TabsTrigger value="character">
              <UserCircle className="mr-2 h-4 w-4" />
              Персонаж
            </TabsTrigger>
            <TabsTrigger value="game">
              <Gamepad className="mr-2 h-4 w-4" />
              Игра
            </TabsTrigger>
            <TabsTrigger value="chat">
              <MessageSquare className="mr-2 h-4 w-4" />
              Чат
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="character" className="h-[calc(100%-48px)]">
            {character ? (
              <div className="bg-card rounded-lg p-4 h-full overflow-auto">
                <h2 className="text-xl font-bold mb-4">{character.name}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p><span className="font-medium">Раса:</span> {character.race}</p>
                    <p><span className="font-medium">Класс:</span> {character.class || character.className}</p>
                    <p><span className="font-medium">Уровень:</span> {character.level}</p>
                  </div>
                  <div>
                    <p><span className="font-medium">HP:</span> {character.currentHp}/{character.maxHp}</p>
                    <p><span className="font-medium">КД:</span> {character.armorClass}</p>
                    <p><span className="font-medium">Бонус мастерства:</span> +{character.proficiencyBonus}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p>Персонаж не выбран</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="game" className="h-[calc(100%-48px)]">
            <div className="bg-card rounded-lg p-4 h-full">
              <h2 className="text-xl font-bold mb-4">Игровая карта</h2>
              <div className="flex items-center justify-center h-[calc(100%-2rem)] bg-muted/20 rounded-lg">
                <p className="text-muted-foreground">Мастер еще не показал карту</p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="chat" className="h-[calc(100%-48px)]">
            <SessionChat
              messages={[]}
              onSendMessage={handleSendMessage}
              sessionCode={session.code}
              playerName={character?.name || 'Игрок'}
              roomCode={session.code}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default GameSessionPage;
