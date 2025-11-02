
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { websocketService, SocketMessage, DiceRoll } from '@/services/websocketService';
import { useToast } from '@/hooks/use-toast';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

interface PlayerSessionClientProps {
  roomCode: string;
  playerName: string;
  onLeave?: () => void;
}

const PlayerSessionClient: React.FC<PlayerSessionClientProps> = ({ 
  roomCode, 
  playerName, 
  onLeave 
}) => {
  const [messages, setMessages] = useState<SocketMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [players, setPlayers] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();

  const diceTypes = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

  useEffect(() => {
    let isMounted = true;
    
    websocketService.connect();

    const handleMessage = (message: SocketMessage) => {
      if (!isMounted) return;
      setMessages(prev => [...prev, message]);
    };

    const handleDiceRoll = (roll: DiceRoll) => {
      if (!isMounted) return;
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
      if (!isMounted) return;
      setPlayers(updatedPlayers);
    };

    websocketService.onMessage(handleMessage);
    websocketService.onDiceRoll(handleDiceRoll);
    websocketService.onPlayerUpdate(handlePlayerUpdate);

    // Присоединяемся к комнате
    websocketService.joinRoom(roomCode, playerName)
      .then(() => {
        if (!isMounted) return;
        setIsConnected(true);
        toast({
          title: "Подключение успешно",
          description: `Вы присоединились к сессии ${roomCode}`,
        });
      })
      .catch((error) => {
        if (!isMounted) return;
        toast({
          title: "Ошибка подключения",
          description: error,
          variant: "destructive"
        });
      });

    return () => {
      isMounted = false;
      websocketService.removeMessageListener(handleMessage);
      websocketService.removeDiceListener(handleDiceRoll);
      websocketService.removePlayerUpdateListener(handlePlayerUpdate);
    };
  }, [roomCode, playerName, toast]);

  const sendMessage = () => {
    if (newMessage.trim()) {
      websocketService.sendMessage(newMessage, playerName);
      setNewMessage('');
    }
  };

  const rollDice = (diceType: string) => {
    websocketService.rollDice(diceType, playerName);
  };

  const leavSession = () => {
    websocketService.disconnect();
    onLeave?.();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Сессия: {roomCode}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-between items-center">
              <p>Игрок: <strong>{playerName}</strong></p>
              <Button onClick={leavSession} variant="destructive">
                Покинуть сессию
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Dice6 className="h-5 w-5" />
              Броски костей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
              {diceTypes.map((dice) => (
                <Button
                  key={dice}
                  onClick={() => rollDice(dice)}
                  variant="outline"
                  className="aspect-square"
                >
                  {dice}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Игроки в сессии ({players.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {players.map((player) => (
                <div key={player.id} className="px-3 py-1 bg-secondary rounded-full text-sm">
                  {player.nickname}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <Card className="h-[600px] flex flex-col">
          <CardHeader>
            <CardTitle>Чат</CardTitle>
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
              />
              <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                Отправить
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlayerSessionClient;
