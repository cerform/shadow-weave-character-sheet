
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, useUserRole } from '@/hooks/use-auth';
import { toast } from 'sonner';
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';
import { useCharacter } from '@/contexts/CharacterContext';
import { useSessionStore } from '@/utils/sessionImports';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Gamepad, 
  Dices, 
  Map, 
  Video, 
  Smile,
  NoteText, 
  LogOut, 
  Calendar, 
  Sword
} from '@/lucide-icons';

const PlayerDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { isPlayer } = useUserRole();
  const { character } = useCharacter();
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
  const [characterName, setCharacterName] = useState('');
  const [activeSessions, setActiveSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверка прав доступа
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    if (!isPlayer) {
      navigate('/unauthorized');
      return;
    }
    
    // Загружаем активные сессии игрока
    const loadActiveSessions = () => {
      // В реальном приложении здесь загружались бы сессии из API/Firebase
      // Пример заглушки:
      setTimeout(() => {
        setActiveSessions([
          {
            id: 'session-1',
            name: 'Приключение в Глубоководье',
            dmName: 'Мастер Подземелий',
            lastPlayed: new Date().toISOString(),
            players: 4,
          }
        ]);
        setLoading(false);
      }, 1000);
    };
    
    loadActiveSessions();
    
    // Если есть персонаж, заполняем имя персонажа
    if (character) {
      setCharacterName(character.name);
    }
  }, [navigate, isAuthenticated, isPlayer, character]);

  // Обработчик присоединения к сессии
  const handleJoinSession = () => {
    if (!sessionCode.trim()) {
      toast.error('Введите код сессии!');
      return;
    }
    
    if (!characterName.trim()) {
      toast.error('Введите имя вашего персонажа!');
      return;
    }
    
    // Сохраняем данные о сессии
    localStorage.setItem('active-session', JSON.stringify({
      sessionCode,
      playerName: characterName
    }));
    
    toast.success('Вы присоединились к сессии!');
    setShowJoinDialog(false);
    
    // Переходим на страницу сессии
    navigate('/game-session');
  };

  // Форматирование даты
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <BackgroundWrapper>
      <div className="min-h-screen p-4 sm:p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Gamepad className="h-8 w-8" /> Панель игрока
            </h1>
            <IconOnlyNavigation />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Левая колонка - Информация о персонаже */}
            <div className="md:col-span-4 space-y-6">
              <Card className="bg-black/50 backdrop-blur-sm border-accent/50">
                <CardHeader className="pb-2">
                  <CardTitle>{currentUser?.displayName || 'Игрок'}</CardTitle>
                  <CardDescription>
                    {currentUser?.email}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Текущий персонаж:</span>
                      <span className="font-semibold">{character?.name || 'Не выбран'}</span>
                    </div>
                    {character && (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Класс:</span>
                          <span>{character.class}, {character.level} уровень</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Раса:</span>
                          <span>{character.race}</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button className="w-full" onClick={() => navigate('/characters')}>
                    <FileText className="h-4 w-4 mr-2" /> Мои персонажи
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => navigate('/character-creation')}>
                    Создать нового персонажа
                  </Button>
                </CardFooter>
              </Card>

              <Card className="bg-black/50 backdrop-blur-sm border-accent/50">
                <CardHeader>
                  <CardTitle>Действия</CardTitle>
                  <CardDescription>Доступные инструменты</CardDescription>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="flex flex-col items-center h-auto py-4" onClick={() => navigate('/spellbook')}>
                    <Gamepad className="h-8 w-8 mb-2" />
                    <span>Заклинания</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center h-auto py-4" onClick={() => navigate('/dice')}>
                    <Dices className="h-8 w-8 mb-2" />
                    <span>Кубики</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center h-auto py-4">
                    <Map className="h-8 w-8 mb-2" />
                    <span>Карта</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center h-auto py-4">
                    <NoteText className="h-8 w-8 mb-2" />
                    <span>Заметки</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center h-auto py-4">
                    <Video className="h-8 w-8 mb-2" />
                    <span>Вебкам</span>
                  </Button>
                  <Button variant="outline" className="flex flex-col items-center h-auto py-4">
                    <Smile className="h-8 w-8 mb-2" />
                    <span>Эмоции</span>
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Правая колонка - Сессии и присоединение */}
            <div className="md:col-span-8 space-y-6">
              <Card className="bg-black/50 backdrop-blur-sm border-accent/50">
                <CardHeader>
                  <CardTitle>Игровые сессии</CardTitle>
                  <CardDescription>Присоединяйтесь к приключениям</CardDescription>
                </CardHeader>
                <Tabs defaultValue="active" className="p-6 pt-0">
                  <TabsList className="mb-4">
                    <TabsTrigger value="active">Активные</TabsTrigger>
                    <TabsTrigger value="history">История</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="active" className="space-y-4">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                        <p className="text-muted-foreground">Загрузка сессий...</p>
                      </div>
                    ) : activeSessions.length > 0 ? (
                      <div className="space-y-4">
                        {activeSessions.map(session => (
                          <Card key={session.id} className="bg-black/30">
                            <CardHeader className="pb-2">
                              <CardTitle>{session.name}</CardTitle>
                              <CardDescription>
                                Ведущий: {session.dmName}
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="py-2">
                              <div className="flex justify-between text-sm">
                                <span className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  Последняя игра: {formatDate(session.lastPlayed)}
                                </span>
                                <span>{session.players} игрока</span>
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Button className="w-full">
                                <Sword className="h-4 w-4 mr-2" />
                                Подключиться к сессии
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground mb-4">У вас нет активных сессий</p>
                      </div>
                    )}
                    
                    <Button onClick={() => setShowJoinDialog(true)} className="w-full">
                      Присоединиться к новой сессии
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="history">
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">История игровых сессий пуста</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </Card>
              
              <Card className="bg-black/50 backdrop-blur-sm border-accent/50">
                <CardHeader>
                  <CardTitle>Справочные материалы</CardTitle>
                  <CardDescription>Источники и руководства</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-3">
                  <Button variant="outline" onClick={() => navigate('/handbook')}>
                    Книга игрока
                  </Button>
                  <Button variant="outline" onClick={() => navigate('/spellbook')}>
                    Книга заклинаний
                  </Button>
                  <Button variant="outline">
                    Расы
                  </Button>
                  <Button variant="outline">
                    Классы
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      {/* Диалог присоединения к сессии */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="bg-card/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle>Присоединение к сессии</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="sessionCode" className="block text-sm font-medium">
                Код сессии
              </label>
              <Input
                id="sessionCode"
                value={sessionCode}
                onChange={(e) => setSessionCode(e.target.value)}
                placeholder="Введите код сессии"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="characterName" className="block text-sm font-medium">
                Имя персонажа
              </label>
              <Input
                id="characterName"
                value={characterName}
                onChange={(e) => setCharacterName(e.target.value)}
                placeholder="Введите имя персонажа"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowJoinDialog(false)}>Отмена</Button>
            <Button onClick={handleJoinSession}>Присоединиться</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BackgroundWrapper>
  );
};

export default PlayerDashboardPage;
