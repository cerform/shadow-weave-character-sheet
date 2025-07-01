
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
import { useNavigate } from 'react-router-dom';
import { socketService, GameSession, SessionPlayer, SessionMessage, DiceRollResult } from '@/services/socket';
import { Users, MessageSquare, Dice6, LogOut, Crown, User, Map } from 'lucide-react';
import DicePanel from '@/components/character-sheet/DicePanel';
import BattleMapPanel from '@/components/battle/BattleMapPanel';

interface PlayerSessionPanelProps {
  sessionCode?: string;
  playerName?: string;
}

const PlayerSessionPanel: React.FC<PlayerSessionPanelProps> = ({ sessionCode: initialCode, playerName: initialName }) => {
  const [sessionCode, setSessionCode] = useState(initialCode || '');
  const [playerName, setPlayerName] = useState(initialName || '');
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [players, setPlayers] = useState<SessionPlayer[]>([]);
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [activeTab, setActiveTab] = useState('session');
  const { character, updateCharacter } = useCharacter();
  const { toast } = useToast();
  const navigate = useNavigate();

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

  const joinSession = async () => {
    if (!sessionCode.trim() || !playerName.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите код сессии и ваше имя",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsJoining(true);
      const session = await socketService.joinSession(sessionCode, playerName, character || undefined);
      setCurrentSession(session);
      
      // Сохраняем данные сессии
      localStorage.setItem('active-session', JSON.stringify({
        sessionCode,
        playerName,
        sessionId: session.id
      }));

      toast({
        title: "Подключение успешно",
        description: `Вы присоединились к сессии "${session.name}"`,
      });
    } catch (error) {
      toast({
        title: "Ошибка подключения",
        description: error instanceof Error ? error.message : "Не удалось подключиться к сессии",
        variant: "destructive"
      });
    } finally {
      setIsJoining(false);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      socketService.sendMessage(newMessage, 'chat');
      setNewMessage('');
    }
  };

  const leaveSession = () => {
    socketService.disconnect();
    localStorage.removeItem('active-session');
    setCurrentSession(null);
    setPlayers([]);
    setMessages([]);
    navigate('/');
    
    toast({
      title: "Выход из сессии",
      description: "Вы покинули игровую сессию",
    });
  };

  const handleDiceRoll = (dice: string, result: number, modifier: number) => {
    socketService.rollDice(dice, modifier, `Бросок ${dice}`);
  };

  const handleCharacterUpdate = (updates: any) => {
    if (character) {
      const updatedCharacter = { ...character, ...updates };
      updateCharacter(updates);
      socketService.updateCharacter(updatedCharacter);
    }
  };

  if (!currentSession) {
    return (
      <div className="max-w-md mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-6 w-6 text-blue-500" />
              Подключение к сессии
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Код сессии</label>
              <Input
                placeholder="Введите код сессии..."
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value.toUpperCase())}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Ваше имя</label>
              <Input
                placeholder="Введите ваше имя..."
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && joinSession()}
              />
            </div>
            {character && (
              <div className="p-3 border rounded-lg bg-muted/30">
                <p className="text-sm font-medium">Выбранный персонаж:</p>
                <p className="text-sm text-muted-foreground">
                  {character.name} - {character.race} {character.class}, Ур. {character.level}
                </p>
              </div>
            )}
            <Button 
              onClick={joinSession} 
              className="w-full"
              disabled={!isConnected || isJoining}
            >
              {isJoining ? 'Подключение...' : 'Присоединиться к игре'}
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
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-fit grid-cols-2">
            <TabsTrigger value="session" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Сессия
            </TabsTrigger>
            <TabsTrigger value="battle" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Боевая карта
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline">{sessionCode}</Badge>
            <Button onClick={leaveSession} variant="destructive" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Выйти
            </Button>
          </div>
        </div>

        <TabsContent value="session" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Информация о сессии и персонаже */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-blue-500" />
                    {currentSession.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Играем как: <strong>{playerName}</strong>
                  </p>
                </CardContent>
              </Card>

              {/* Персонаж */}
              {character && (
                <Card>
                  <CardHeader>
                    <CardTitle>Мой персонаж</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Здоровье</p>
                        <p className="text-xl font-bold">{character.currentHp}/{character.maxHp}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Класс доспеха</p>
                        <p className="text-xl font-bold">{character.armorClass}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Инициатива</p>
                        <p className="text-xl font-bold">{character.initiative}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-muted-foreground">Уровень</p>
                        <p className="text-xl font-bold">{character.level}</p>
                      </div>
                    </div>
                    <Button 
                      onClick={() => navigate('/character-sheet')}
                      variant="outline" 
                      className="w-full"
                    >
                      Открыть полный лист персонажа
                    </Button>
                  </CardContent>
                </Card>
              )}

              {/* Кубики */}
              {character && (
                <DicePanel 
                  character={character} 
                  onUpdate={handleCharacterUpdate}
                  onDiceRoll={handleDiceRoll}
                />
              )}

              {/* Игроки */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Участники ({players.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {players.map((player) => (
                      <div key={player.id} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${player.isOnline ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="font-medium">{player.name}</span>
                          {player.isDM && <Crown className="h-4 w-4 text-yellow-500" />}
                        </div>
                        <Badge variant={player.isOnline ? "default" : "secondary"}>
                          {player.isOnline ? "Онлайн" : "Оффлайн"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Чат */}
            <div>
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Чат игры
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
                      placeholder="Ваше сообщение..."
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
            isDM={false} 
            sessionId={currentSession.id}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlayerSessionPanel;
