
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useCharacter } from '@/contexts/CharacterContext';
import { socketService, GameSession, SessionPlayer, SessionMessage, DiceRollResult } from '@/services/socket';
import { Copy, Users, Crown, MessageSquare, Dice6, Settings, Play, Square, Map } from 'lucide-react';
import BattleMapPanel from '@/components/battle/BattleMapPanel';

const DMPanel: React.FC = () => {
  const [sessionName, setSessionName] = useState('');
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<SessionPlayer[]>([]);
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [diceRolls, setDiceRolls] = useState<DiceRollResult[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [activeTab, setActiveTab] = useState('session');
  const [isCreating, setIsCreating] = useState(false);
  const { character } = useCharacter();
  const { toast } = useToast();

  useEffect(() => {
    console.log('DMPanel: Инициализация компонента');
    socketService.connect();

    const handleSessionUpdate = (session: GameSession) => {
      console.log('DMPanel: Получено обновление сессии:', session);
      setCurrentSession(session);
      setPlayers(session.players);
    };

    const handlePlayerUpdate = (updatedPlayers: SessionPlayer[]) => {
      console.log('DMPanel: Обновлены игроки:', updatedPlayers);
      setPlayers(updatedPlayers);
    };

    const handleMessage = (message: SessionMessage) => {
      console.log('DMPanel: Получено сообщение:', message);
      setMessages(prev => [...prev, message]);
    };

    const handleDiceRoll = (roll: DiceRollResult) => {
      console.log('DMPanel: Получен результат броска:', roll);
      setDiceRolls(prev => [...prev, roll]);
      // Добавляем сообщение о броске в чат
      const diceMessage: SessionMessage = {
        id: `dice_${roll.id}`,
        type: 'dice',
        sender: roll.playerName,
        content: `Бросил ${roll.diceType}: ${roll.result} ${roll.modifier !== 0 ? `+ ${roll.modifier}` : ''} = ${roll.total}`,
        timestamp: roll.timestamp,
        sessionId: roll.playerId
      };
      setMessages(prev => [...prev, diceMessage]);
    };

    socketService.onSessionUpdate(handleSessionUpdate);
    socketService.onPlayerUpdate(handlePlayerUpdate);
    socketService.onMessage(handleMessage);
    socketService.onDiceRoll(handleDiceRoll);

    const connectionStatus = socketService.isConnected();
    console.log('DMPanel: Статус подключения:', connectionStatus);
    setIsConnected(connectionStatus);

    // Проверяем, есть ли уже активная сессия
    const existingSession = socketService.getCurrentSession();
    if (existingSession) {
      console.log('DMPanel: Найдена существующая сессия:', existingSession);
      setCurrentSession(existingSession);
    }

    return () => {
      socketService.removeSessionUpdateListener(handleSessionUpdate);
      socketService.removePlayerUpdateListener(handlePlayerUpdate);
      socketService.removeMessageListener(handleMessage);
      socketService.removeDiceListener(handleDiceRoll);
    };
  }, []);

  const createSession = async () => {
    if (!sessionName.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название сессии",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('DMPanel: Создание сессии с названием:', sessionName);
      setIsCreating(true);
      
      const session = await socketService.createSession(sessionName, 'Мастер', character || undefined);
      console.log('DMPanel: Сессия создана успешно:', session);
      
      setCurrentSession(session);
      setSessionName(''); // Очищаем поле ввода
      
      toast({
        title: "Сессия создана",
        description: `Код сессии: ${session.code}`,
      });
    } catch (error) {
      console.error('DMPanel: Ошибка создания сессии:', error);
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось создать сессию",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const copySessionCode = () => {
    if (currentSession) {
      navigator.clipboard.writeText(currentSession.code);
      toast({
        title: "Код скопирован",
        description: "Код сессии скопирован в буфер обмена",
      });
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      socketService.sendMessage(newMessage, 'chat');
      setNewMessage('');
    }
  };

  const endSession = () => {
    console.log('DMPanel: Завершение сессии');
    socketService.endSession();
    setCurrentSession(null);
    setPlayers([]);
    setMessages([]);
    setDiceRolls([]);
    toast({
      title: "Сессия завершена",
      description: "Игровая сессия была завершена",
    });
  };

  // Если идет создание сессии - показываем загрузку
  if (isCreating) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
              <span>Создание сессии...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Если нет активной сессии - показываем форму создания
  if (!currentSession) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-6 w-6 text-yellow-500" />
              Панель мастера
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Название сессии</label>
              <Input
                placeholder="Введите название сессии..."
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createSession()}
              />
            </div>
            <Button 
              onClick={createSession} 
              className="w-full"
              disabled={!isConnected || isCreating}
            >
              <Play className="h-4 w-4 mr-2" />
              {isConnected ? 'Создать сессию' : 'Подключение...'}
            </Button>
            {!isConnected && (
              <p className="text-sm text-muted-foreground text-center">
                Подключение к серверу...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Основной интерфейс мастера - показываем всегда когда есть сессия
  return (
    <div className="max-w-7xl mx-auto p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-fit grid-cols-3">
            <TabsTrigger value="session" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Сессия
            </TabsTrigger>
            <TabsTrigger value="battle" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Боевая карта
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Инструменты
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-4">
            <Badge variant="default" className="text-lg px-3 py-1">
              {currentSession.code}
              <Button
                size="sm"
                variant="ghost"
                className="ml-2 h-6 w-6 p-0"
                onClick={copySessionCode}
              >
                <Copy className="h-3 w-3" />
              </Button>
            </Badge>
            <Button onClick={endSession} variant="destructive">
              <Square className="h-4 w-4 mr-2" />
              Завершить сессию
            </Button>
          </div>
        </div>

        <TabsContent value="session" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Управление сессией */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    {currentSession.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Поделитесь кодом с игроками для подключения
                  </p>
                </CardContent>
              </Card>

              {/* Игроки */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Игроки ({players.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {players.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      Игроков пока нет. Поделитесь кодом сессии!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {players.map((player) => (
                        <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${player.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                            <div>
                              <p className="font-medium">{player.name}</p>
                              {player.character && (
                                <p className="text-sm text-muted-foreground">
                                  {player.character.name} - {player.character.race} {player.character.class}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {player.isDM && <Crown className="h-4 w-4 text-yellow-500" />}
                            <Badge variant={player.isOnline ? "default" : "secondary"}>
                              {player.isOnline ? "Онлайн" : "Оффлайн"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Чат и активность */}
            <div className="space-y-6">
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Чат сессии
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow flex flex-col">
                  <ScrollArea className="flex-grow mb-4">
                    <div className="space-y-2">
                      {messages.map((message) => (
                        <div key={message.id} className="p-2 rounded bg-muted/30">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{message.sender}</span>
                            <span className="text-muted-foreground">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                          </div>
                          <p className="mt-1">{message.content}</p>
                          {message.type === 'dice' && (
                            <Dice6 className="h-4 w-4 inline ml-2 text-blue-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <Separator className="my-2" />
                  
                  <div className="flex gap-2">
                    <Input
                      placeholder="Сообщение мастера..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    />
                    <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                      Отправить
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="battle">
          <BattleMapPanel 
            isDM={true} 
            sessionId={currentSession.id}
          />
        </TabsContent>

        <TabsContent value="tools">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Инструменты мастера</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Дополнительные инструменты будут добавлены позже</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DMPanel;
