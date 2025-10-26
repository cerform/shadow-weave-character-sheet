import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { socketService, GameSession, SessionMessage, DiceRollResult } from '@/services/socket';
import JoinSessionPanel from '@/components/session/JoinSessionPanel';
import DiceRoller from '@/components/session/DiceRoller';
import { MessageSquare, Dice6, Users, Map, LogOut, Crown } from 'lucide-react';

const PlayerSessionPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [diceRolls, setDiceRolls] = useState<DiceRollResult[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const initializeConnection = async () => {
      try {
        const connected = await socketService.connect();
        setIsConnected(connected);
        
        if (connected) {
          setupEventListeners();
          socketService.startHeartbeat();

          // Проверяем сохраненную сессию
          const savedSession = localStorage.getItem('player-active-session');
          if (savedSession) {
            try {
              const sessionData = JSON.parse(savedSession);
              console.log('🔄 Восстановление сессии игрока:', sessionData);
              // В реальной ситуации здесь бы было переподключение
            } catch (error) {
              console.warn('⚠️ Не удалось восстановить сессию:', error);
              localStorage.removeItem('player-active-session');
            }
          }
        }
      } catch (error) {
        console.error('❌ Ошибка инициализации:', error);
        setIsConnected(false);
      }
    };

    initializeConnection();

    return () => {
      cleanup();
    };
  }, []);

  const setupEventListeners = () => {
    const handleSessionUpdate = (session: GameSession) => {
      console.log('📊 Обновление сессии игрока:', session.name);
      setCurrentSession(session);
      setMessages(session.messages || []);
      setDiceRolls(session.diceRolls || []);
      
      // Сохраняем сессию локально
      localStorage.setItem('player-active-session', JSON.stringify({
        id: session.id,
        code: session.code,
        name: session.name
      }));
    };

    const handleMessage = (message: SessionMessage) => {
      console.log('💬 Новое сообщение:', message.sender);
      setMessages(prev => [...prev, message]);
    };

    const handleDiceRoll = (roll: DiceRollResult) => {
      console.log('🎲 Новый бросок:', roll.playerName, roll.total);
      setDiceRolls(prev => [...prev, roll]);
      
      // Добавляем красивое сообщение о броске
      const diceMessage: SessionMessage = {
        id: `dice_${roll.id}`,
        type: 'dice',
        sender: roll.playerName,
        content: `🎲 Бросил ${roll.diceType}${roll.reason ? ` (${roll.reason})` : ''}: [${roll.rolls?.join(', ') || roll.result}]${roll.modifier !== 0 ? ` + ${roll.modifier}` : ''} = **${roll.total}**`,
        timestamp: roll.timestamp,
        sessionId: currentSession?.id || ''
      };
      setMessages(prev => [...prev, diceMessage]);
    };

    socketService.onSessionUpdate(handleSessionUpdate);
    socketService.onMessage(handleMessage);
    socketService.onDiceRoll(handleDiceRoll);
  };

  const cleanup = () => {
    socketService.removeSessionUpdateListener(() => {});
    socketService.removeMessageListener(() => {});
    socketService.removeDiceListener(() => {});
  };

  const handleSessionJoined = (session: GameSession) => {
    setCurrentSession(session);
    setMessages(session.messages || []);
    setDiceRolls(session.diceRolls || []);
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      socketService.sendMessage(newMessage, 'chat');
      setNewMessage('');
    }
  };

  const handleDiceRoll = (diceType: string, modifier: number, reason?: string) => {
    socketService.rollDice(diceType, modifier, reason);
  };

  const leaveSession = () => {
    socketService.disconnect();
    setCurrentSession(null);
    setMessages([]);
    setDiceRolls([]);
    localStorage.removeItem('player-active-session');
    
    toast({
      title: "Вы покинули сессию",
      description: "До встречи в следующем приключении!",
    });
  };

  const goToBattleMap = () => {
    if (currentSession) {
      navigate(`/battle/${currentSession.id}`);
    }
  };

  // Если нет активной сессии, показываем форму подключения
  if (!currentSession) {
    return <JoinSessionPanel onSessionJoined={handleSessionJoined} />;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🎮 {currentSession.name}
          </h1>
          <Badge variant="outline" className="text-lg px-4 py-2">
            📋 {currentSession.code}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={goToBattleMap}>
            <Map className="h-4 w-4 mr-2" />
            Боевая карта
          </Button>
          <Button variant="destructive" onClick={leaveSession}>
            <LogOut className="h-4 w-4 mr-2" />
            Покинуть сессию
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная область */}
        <div className="lg:col-span-2 space-y-6">
          {/* Информация о сессии */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                👥 Участники игры ({currentSession.players.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {currentSession.players.map((player) => (
                  <div key={player.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${player.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{player.name}</span>
                        {player.isDM && <Crown className="h-4 w-4 text-yellow-500" />}
                      </div>
                      {player.character && (
                        <p className="text-sm text-muted-foreground">
                          🧙 {player.character.name} - {player.character.race} {player.character.class}
                        </p>
                      )}
                    </div>
                    <Badge variant={player.isOnline ? "default" : "secondary"}>
                      {player.isOnline ? "🟢" : "🔴"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Панель кубиков */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Dice6 className="h-5 w-5" />
                🎲 Кубики
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DiceRoller onRoll={handleDiceRoll} />
            </CardContent>
          </Card>

          {/* История бросков */}
          <Card>
            <CardHeader>
              <CardTitle>📈 История бросков</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-40">
                <div className="space-y-2">
                  {diceRolls.slice(-5).map((roll) => (
                    <div key={roll.id} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                      <div>
                        <span className="font-medium">{roll.playerName}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {roll.diceType} {roll.reason && `(${roll.reason})`}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-lg">{roll.total}</span>
                        {roll.rolls && roll.rolls.length > 1 && (
                          <div className="text-xs text-muted-foreground">
                            [{roll.rolls.join(', ')}] + {roll.modifier}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Чат */}
        <div>
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                💬 Чат игры
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-grow flex flex-col">
              <ScrollArea className="flex-grow mb-4">
                <div className="space-y-3">
                  {messages.map((message) => (
                    <div key={message.id} className={`p-3 rounded-lg ${
                      message.type === 'system' ? 'bg-yellow-50 border-l-4 border-yellow-400' : 
                      message.type === 'dice' ? 'bg-blue-50 border-l-4 border-blue-400' :
                      message.isDM ? 'bg-purple-50 border-l-4 border-purple-400' :
                      'bg-muted/30'
                    }`}>
                      <div className="flex justify-between text-sm">
                        <span className="font-medium flex items-center gap-1">
                          {message.isDM && <Crown className="h-3 w-3 text-yellow-500" />}
                          {message.sender}
                        </span>
                        <span className="text-muted-foreground">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="mt-1" dangerouslySetInnerHTML={{ 
                        __html: DOMPurify.sanitize(message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'))
                      }} />
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
                  📤
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlayerSessionPage;
