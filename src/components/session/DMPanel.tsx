
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { socketService, GameSession, SessionPlayer, SessionMessage, DiceRollResult } from '@/services/socket';
import { Copy, Users, Crown, MessageSquare, Dice6, Settings, Play, Square, Map, Zap, Scroll, Shield } from 'lucide-react';
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
  const [sessionStats, setSessionStats] = useState({
    totalMessages: 0,
    totalDiceRolls: 0,
    sessionDuration: 0
  });
  
  // Убираем зависимость от CharacterContext для DMPanel
  const character = null; // DM панель может работать без персонажа
  const { toast } = useToast();

  useEffect(() => {
    console.log('🎯 DMPanel: Инициализация');
    initializeConnection();

    return () => {
      console.log('🎯 DMPanel: Очистка');
      cleanup();
    };
  }, []);

  const initializeConnection = async () => {
    try {
      const connected = await socketService.connect();
      setIsConnected(connected);
      
      if (connected) {
        setupEventListeners();
        socketService.startHeartbeat();

        // Проверяем сохраненную сессию
        const savedSession = localStorage.getItem('dm-active-session');
        if (savedSession) {
          try {
            const sessionData = JSON.parse(savedSession);
            console.log('🔄 Восстановление сессии:', sessionData);
            // В реальной ситуации здесь бы был запрос на восстановление сессии
          } catch (error) {
            console.warn('⚠️ Не удалось восстановить сессию:', error);
            localStorage.removeItem('dm-active-session');
          }
        }
      }
    } catch (error) {
      console.error('❌ Ошибка инициализации:', error);
      setIsConnected(false);
    }
  };

  const setupEventListeners = () => {
    const handleSessionUpdate = (session: GameSession) => {
      console.log('📊 Обновление сессии:', session.name);
      setCurrentSession(session);
      setPlayers(session.players);
      setMessages(session.messages || []);
      setDiceRolls(session.diceRolls || []);
      
      // Сохраняем сессию локально
      localStorage.setItem('dm-active-session', JSON.stringify({
        id: session.id,
        code: session.code,
        name: session.name
      }));

      // Обновляем статистику
      setSessionStats({
        totalMessages: session.messages?.length || 0,
        totalDiceRolls: session.diceRolls?.length || 0,
        sessionDuration: Math.floor((Date.now() - new Date(session.createdAt).getTime()) / 1000 / 60)
      });
    };

    const handlePlayerUpdate = (updatedPlayers: SessionPlayer[]) => {
      console.log('👥 Обновление игроков:', updatedPlayers.length);
      setPlayers(updatedPlayers);
    };

    const handleMessage = (message: SessionMessage) => {
      console.log('💬 Новое сообщение:', message.sender);
      setMessages(prev => [...prev, message]);
      setSessionStats(prev => ({ ...prev, totalMessages: prev.totalMessages + 1 }));
    };

    const handleDiceRoll = (roll: DiceRollResult) => {
      console.log('🎲 Новый бросок:', roll.playerName, roll.total);
      setDiceRolls(prev => [...prev, roll]);
      setSessionStats(prev => ({ ...prev, totalDiceRolls: prev.totalDiceRolls + 1 }));
      
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
    socketService.onPlayerUpdate(handlePlayerUpdate);
    socketService.onMessage(handleMessage);
    socketService.onDiceRoll(handleDiceRoll);
  };

  const cleanup = () => {
    socketService.removeSessionUpdateListener(() => {});
    socketService.removePlayerUpdateListener(() => {});
    socketService.removeMessageListener(() => {});
    socketService.removeDiceListener(() => {});
  };

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
      setIsCreating(true);
      console.log('🎯 Создание сессии:', sessionName);
      
      const session = await socketService.createSession(
        sessionName, 
        'Мастер', 
        character || undefined
      );
      
      setCurrentSession(session);
      setSessionName('');
      
      toast({
        title: "🎮 Сессия создана успешно!",
        description: `Код для игроков: ${session.code}`,
      });

      // Автоматически копируем код в буфер обмена
      navigator.clipboard.writeText(session.code);
      
    } catch (error) {
      console.error('❌ Ошибка создания сессии:', error);
      toast({
        title: "Ошибка создания сессии",
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
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
        title: "📋 Код скопирован",
        description: `Код ${currentSession.code} скопирован в буфер обмена`,
      });
    }
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      socketService.sendMessage(newMessage, 'chat');
      setNewMessage('');
    }
  };

  const sendSystemMessage = (message: string) => {
    socketService.sendMessage(`🎯 **Мастер**: ${message}`, 'system');
  };

  const endSession = () => {
    if (currentSession) {
      console.log('🔚 Завершение сессии:', currentSession.name);
      socketService.endSession();
      setCurrentSession(null);
      setPlayers([]);
      setMessages([]);
      setDiceRolls([]);
      localStorage.removeItem('dm-active-session');
      
      toast({
        title: "🏁 Сессия завершена",
        description: "Игровая сессия была успешно завершена",
      });
    }
  };

  // Состояние загрузки
  if (isCreating) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="animate-spin h-8 w-8 border-3 border-primary border-t-transparent rounded-full"></div>
              <h3 className="text-lg font-semibold">Создание игровой сессии...</h3>
              <p className="text-sm text-muted-foreground">Подготавливаем всё для эпического приключения</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Форма создания сессии
  if (!currentSession) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2 text-2xl">
              <Crown className="h-8 w-8 text-yellow-500" />
              Панель Мастера Подземелий
            </CardTitle>
            <p className="text-muted-foreground">Создайте новую игровую сессию D&D</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Название приключения</label>
              <Input
                placeholder="Например: Подземелья Завета Дракона"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createSession()}
                className="text-lg"
              />
            </div>
            
            {character && (
              <Card className="bg-muted/30">
                <CardContent className="pt-4">
                  <p className="text-sm font-medium mb-2">🧙 Ваш персонаж DM:</p>
                  <p className="text-sm">
                    {character.name} - {character.race} {character.class}, Уровень {character.level}
                  </p>
                </CardContent>
              </Card>
            )}
            
            <Button 
              onClick={createSession} 
              className="w-full h-12 text-lg"
              disabled={!isConnected || isCreating}
            >
              <Play className="h-5 w-5 mr-2" />
              {isConnected ? '🎮 Начать приключение' : '🔄 Подключение к серверу...'}
            </Button>
            
            {!isConnected && (
              <p className="text-sm text-muted-foreground text-center">
                ⏳ Устанавливается соединение с игровым сервером...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Основной интерфейс DM
  return (
    <div className="max-w-7xl mx-auto p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList className="grid w-fit grid-cols-4">
            <TabsTrigger value="session" className="flex items-center gap-2">
              <Crown className="h-4 w-4" />
              Сессия
            </TabsTrigger>
            <TabsTrigger value="battle" className="flex items-center gap-2">
              <Map className="h-4 w-4" />
              Боевая карта
            </TabsTrigger>
            <TabsTrigger value="initiative" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Инициатива
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Инструменты
            </TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-4">
            <Badge variant="default" className="text-lg px-4 py-2">
              📋 {currentSession.code}
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
          {/* Статистика сессии */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{players.length}</div>
                <div className="text-sm text-muted-foreground">Игроков</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{sessionStats.totalMessages}</div>
                <div className="text-sm text-muted-foreground">Сообщений</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{sessionStats.totalDiceRolls}</div>
                <div className="text-sm text-muted-foreground">Бросков</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{sessionStats.sessionDuration}</div>
                <div className="text-sm text-muted-foreground">Минут</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Управление сессией */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Crown className="h-5 w-5 text-yellow-500" />
                    🎮 {currentSession.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Поделитесь кодом <strong>{currentSession.code}</strong> с игроками для подключения
                  </p>
                  
                  {/* Быстрые команды DM */}
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => sendSystemMessage('Делаем короткий перерыв ☕')}>
                      ☕ Перерыв
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => sendSystemMessage('Внимание! Начинается бой ⚔️')}>
                      ⚔️ Бой
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => sendSystemMessage('Проверьте инициативу 🎲')}>
                      🎲 Инициатива
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => sendSystemMessage('Сделайте спасбросок 🛡️')}>
                      🛡️ Спасбросок
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Игроки */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    👥 Игроки ({players.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {players.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Ожидаем героев...</p>
                      <p className="text-sm">Поделитесь кодом сессии с игроками!</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {players.map((player) => (
                        <div key={player.id} className="flex items-center justify-between p-3 border rounded-lg bg-card">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${player.isOnline ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{player.name}</p>
                                {player.isDM && <Crown className="h-4 w-4 text-yellow-500" />}
                              </div>
                              {player.character && (
                                <p className="text-sm text-muted-foreground">
                                  🧙 {player.character.name} - {player.character.race} {player.character.class}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={player.isOnline ? "default" : "secondary"}>
                              {player.isOnline ? "🟢 Онлайн" : "🔴 Оффлайн"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Чат */}
            <div>
              <Card className="h-[600px] flex flex-col">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    💬 Чат сессии
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
                            __html: message.content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                          }} />
                          {message.type === 'dice' && (
                            <Dice6 className="h-4 w-4 inline ml-2 text-blue-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  
                  <Separator className="my-2" />
                  
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Сообщение от мастера..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      />
                      <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                        📤
                      </Button>
                    </div>
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

        <TabsContent value="initiative">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                ⚡ Трекер инициативы
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Трекер инициативы будет добавлен в следующем обновлении</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tools">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scroll className="h-5 w-5" />
                  📜 Заметки мастера
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Система заметок для DM в разработке</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  🛡️ NPC Менеджер
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Управление NPC персонажами</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>🎲 Генераторы</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Генераторы имен, сокровищ и событий</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DMPanel;
