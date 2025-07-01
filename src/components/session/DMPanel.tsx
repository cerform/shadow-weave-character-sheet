
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCharacter } from '@/contexts/CharacterContext';
import { socketService, GameSession, SessionPlayer, SessionMessage, DiceRollResult } from '@/services/socket';
import { Copy, Users, Crown, MessageSquare, Dice6, Settings, Play, Square } from 'lucide-react';

const DMPanel: React.FC = () => {
  const [sessionName, setSessionName] = useState('');
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<SessionPlayer[]>([]);
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [diceRolls, setDiceRolls] = useState<DiceRollResult[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const { character } = useCharacter();
  const { toast } = useToast();

  useEffect(() => {
    socketService.connect();

    const handleSessionUpdate = (session: GameSession) => {
      setCurrentSession(session);
      setPlayers(session.players);
    };

    const handlePlayerUpdate = (updatedPlayers: SessionPlayer[]) => {
      setPlayers(updatedPlayers);
    };

    const handleMessage = (message: SessionMessage) => {
      setMessages(prev => [...prev, message]);
    };

    const handleDiceRoll = (roll: DiceRollResult) => {
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

    setIsConnected(socketService.isConnected());

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
      const session = await socketService.createSession(sessionName, 'Мастер', character || undefined);
      setCurrentSession(session);
      toast({
        title: "Сессия создана",
        description: `Код сессии: ${session.code}`,
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось создать сессию",
        variant: "destructive"
      });
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
              disabled={!isConnected}
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Управление сессией */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Crown className="h-5 w-5 text-yellow-500" />
                  {currentSession.name}
                </div>
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
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Поделитесь кодом с игроками для подключения
                </p>
                <Button onClick={endSession} variant="destructive">
                  <Square className="h-4 w-4 mr-2" />
                  Завершить сессию
                </Button>
              </div>
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
    </div>
  );
};

export default DMPanel;
