import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { socketService, GameSession } from '@/services/socket';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  MessageSquare, 
  Dice6, 
  Crown, 
  Play,
  Square,
  Copy,
  Home,
  Settings,
  Swords,
  Shield,
  Map
} from 'lucide-react';
import DMSessionManager from '@/components/session/DMSessionManager';
import { useAuth } from '@/hooks/use-auth';

const GMDashboardPage = () => {
  const [sessionName, setSessionName] = useState('');
  const [currentSession, setCurrentSession] = useState<GameSession | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    // Подключаемся к сокет-сервису
    const connectToServer = async () => {
      try {
        await socketService.connect();
        setIsConnected(socketService.isConnected());
      } catch (error) {
        console.error('Ошибка подключения:', error);
        setIsConnected(false);
      }
    };

    connectToServer();

    // Подписываемся на обновления сессии
    const handleSessionUpdate = (session: GameSession) => {
      setCurrentSession(session);
    };

    socketService.onSessionUpdate(handleSessionUpdate);

    return () => {
      socketService.removeSessionUpdateListener(handleSessionUpdate);
    };
  }, []);

  const createNewSession = async () => {
    if (!sessionName.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название сессии",
        variant: "destructive"
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: "Ошибка",
        description: "Необходимо войти в систему",
        variant: "destructive"
      });
      return;
    }

    setIsCreating(true);
    try {
      const session = await socketService.createSession(
        sessionName,
        currentUser.displayName || 'Game Master'
      );
      
      setCurrentSession(session);
      toast({
        title: "Сессия создана!",
        description: `Код сессии: ${session.code}`,
      });
    } catch (error) {
      toast({
        title: "Ошибка",
        description: error instanceof Error ? error.message : "Не удалось создать сессию",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const endSession = () => {
    if (currentSession) {
      socketService.endSession();
      setCurrentSession(null);
      toast({
        title: "Сессия завершена",
        description: "Сессия была успешно завершена",
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

  const ConnectionStatus = () => (
    <div className="flex items-center gap-2 mb-4">
      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
      <span className="text-sm text-muted-foreground">
        {isConnected ? 'Подключено к серверу' : 'Нет соединения с сервером'}
      </span>
    </div>
  );

  if (!currentSession) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/10 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
                <Crown className="h-8 w-8" />
                Панель Мастера
              </h1>
              <p className="text-muted-foreground">Создайте и управляйте игровыми сессиями</p>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              На главную
            </Button>
          </div>

          <ConnectionStatus />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Play className="h-5 w-5" />
                  Создать новую сессию
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Input
                    placeholder="Название сессии (например: 'Проклятие Страда')"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && createNewSession()}
                    className="bg-background/50"
                  />
                </div>
                <Button
                  onClick={createNewSession}
                  disabled={isCreating || !isConnected}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  {isCreating ? "Создание..." : "Создать сессию"}
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-card/50 backdrop-blur-sm border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Settings className="h-5 w-5" />
                  Быстрые инструменты
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/spells')}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Книга заклинаний
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/battle')}
                >
                  <Swords className="h-4 w-4 mr-2" />
                  Боевая карта
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => navigate('/handbook')}
                >
                  <Map className="h-4 w-4 mr-2" />
                  Справочник D&D
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6 bg-card/30 backdrop-blur-sm border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg">Возможности GM Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-2">
                  <Users className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">Управление игроками</div>
                    <div className="text-muted-foreground">Отслеживание подключений и персонажей</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">Чат в реальном времени</div>
                    <div className="text-muted-foreground">Общение с игроками</div>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Dice6 className="h-4 w-4 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium">Система бросков</div>
                    <div className="text-muted-foreground">Видимость всех бросков игроков</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-primary/10 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
              <Crown className="h-6 w-6" />
              {currentSession.name}
            </h1>
            <div className="flex items-center gap-4 mt-1">
              <Badge variant="secondary" className="text-sm">
                Код: {currentSession.code}
              </Badge>
              <Button size="sm" variant="outline" onClick={copySessionCode}>
                <Copy className="h-3 w-3 mr-1" />
                Скопировать
              </Button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" />
              Главная
            </Button>
            <Button variant="destructive" onClick={endSession}>
              <Square className="h-4 w-4 mr-2" />
              Завершить сессию
            </Button>
          </div>
        </div>

        <ConnectionStatus />

        <Tabs defaultValue="session" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-secondary/50">
            <TabsTrigger value="session" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Сессия
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Чат
            </TabsTrigger>
            <TabsTrigger value="dice" className="flex items-center gap-2">
              <Dice6 className="h-4 w-4" />
              Броски
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Инструменты
            </TabsTrigger>
          </TabsList>

          <TabsContent value="session" className="mt-4">
            <DMSessionManager 
              sessionCode={currentSession.code}
              onSessionEnd={() => setCurrentSession(null)}
            />
          </TabsContent>

          <TabsContent value="chat" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Чат сессии</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center text-muted-foreground py-8">
                  Чат интегрирован в основную панель сессии
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="dice" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>История бросков</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {currentSession.diceRolls.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      Бросков пока не было
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {currentSession.diceRolls.slice(-20).reverse().map((roll) => (
                        <div key={roll.id} className="p-3 bg-secondary/30 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{roll.playerName}</div>
                              <div className="text-sm text-muted-foreground">
                                {roll.diceType} {roll.modifier !== 0 && `${roll.modifier > 0 ? '+' : ''}${roll.modifier}`}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold">{roll.total}</div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(roll.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          </div>
                          {roll.reason && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {roll.reason}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Card className="cursor-pointer hover:bg-secondary/20 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">Книга заклинаний</h3>
                      <p className="text-sm text-muted-foreground">Поиск и детали заклинаний</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.open('/spells', '_blank')}
                  >
                    Открыть
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-secondary/20 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Swords className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">Боевая карта</h3>
                      <p className="text-sm text-muted-foreground">Управление боем и токенами</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.open('/battle', '_blank')}
                  >
                    Открыть
                  </Button>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-secondary/20 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <Map className="h-8 w-8 text-primary" />
                    <div>
                      <h3 className="font-semibold">Справочник</h3>
                      <p className="text-sm text-muted-foreground">Расы, классы, предыстории</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full"
                    onClick={() => window.open('/handbook', '_blank')}
                  >
                    Открыть
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default GMDashboardPage;