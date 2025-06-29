
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { websocketService, SocketMessage, DiceRoll } from '@/services/websocketService';
import { useToast } from '@/hooks/use-toast';
import { Copy, Users, Dice6, MessageSquare } from 'lucide-react';

interface DMSessionManagerProps {
  sessionCode?: string;
  onSessionEnd?: () => void;
}

const DMSessionManager: React.FC<DMSessionManagerProps> = ({ sessionCode: initialCode, onSessionEnd }) => {
  const [sessionCode, setSessionCode] = useState(initialCode || '');
  const [messages, setMessages] = useState<SocketMessage[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    websocketService.connect();
    
    const handleMessage = (message: SocketMessage) => {
      setMessages(prev => [...prev, message]);
    };

    const handleDiceRoll = (roll: DiceRoll) => {
      const diceMessage: SocketMessage = {
        id: Date.now().toString(),
        type: 'dice',
        sender: roll.playerName,
        content: `Бросил ${roll.type}: ${roll.result}`,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, diceMessage]);
    };

    const handlePlayerUpdate = (updatedPlayers: any[]) => {
      setPlayers(updatedPlayers);
    };

    websocketService.onMessage(handleMessage);
    websocketService.onDiceRoll(handleDiceRoll);
    websocketService.onPlayerUpdate(handlePlayerUpdate);

    return () => {
      websocketService.removeMessageListener(handleMessage);
      websocketService.removeDiceListener(handleDiceRoll);
      websocketService.removePlayerUpdateListener(handlePlayerUpdate);
    };
  }, []);

  const createSession = async () => {
    try {
      const code = await websocketService.createRoom('DM');
      setSessionCode(code);
      setIsConnected(true);
      toast({
        title: "Сессия создана",
        description: `Код сессии: ${code}`,
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Не удалось создать сессию",
        variant: "destructive"
      });
    }
  };

  const copySessionCode = () => {
    navigator.clipboard.writeText(sessionCode);
    toast({
      title: "Код скопирован",
      description: "Код сессии скопирован в буфер обмена",
    });
  };

  const sendMessage = () => {
    if (newMessage.trim() && sessionCode) {
      websocketService.sendMessage(newMessage, 'DM');
      setNewMessage('');
    }
  };

  const endSession = () => {
    websocketService.disconnect();
    setIsConnected(false);
    setSessionCode('');
    setMessages([]);
    setPlayers([]);
    onSessionEnd?.();
    toast({
      title: "Сессия завершена",
      description: "Сессия была успешно завершена",
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Управление сессией
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!sessionCode ? (
              <Button onClick={createSession} className="w-full">
                Создать новую сессию
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {sessionCode}
                  </Badge>
                  <Button size="sm" variant="outline" onClick={copySessionCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Поделитесь этим кодом с игроками
                </p>
                <Button onClick={endSession} variant="destructive">
                  Завершить сессию
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Игроки ({players.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {players.length === 0 ? (
              <p className="text-muted-foreground">Игроков пока нет</p>
            ) : (
              <div className="space-y-2">
                {players.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-2 border rounded">
                    <span>{player.nickname}</span>
                    <Badge variant={player.connected ? "default" : "secondary"}>
                      {player.connected ? "Онлайн" : "Оффлайн"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div>
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
            
            <div className="flex gap-2">
              <Input
                placeholder="Введите сообщение..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={!sessionCode}
              />
              <Button onClick={sendMessage} disabled={!sessionCode || !newMessage.trim()}>
                Отправить
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DMSessionManager;
