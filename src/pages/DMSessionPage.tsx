
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { useTheme } from '@/hooks/use-theme';
import { useSessionStore } from '@/utils/sessionImports';
import { Copy, Users, ArrowLeft, Plus, RefreshCw, Trash, Link } from 'lucide-react';
import { sessionService } from '@/services/sessionService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const DMSessionPage = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { theme } = useTheme();
  const { sessions, fetchSessions, endSession, currentUser } = useSessionStore();
  
  const [session, setSession] = useState<any | null>(null);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  // Функция для загрузки данных сессии
  const loadSession = async () => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      const sessionData = await sessionService.getSessionById(sessionId);
      
      if (sessionData) {
        setSession(sessionData);
        
        // Если есть заметки, загружаем последнюю
        if (sessionData.notes && sessionData.notes.length > 0) {
          const lastNote = sessionData.notes[sessionData.notes.length - 1];
          setNotes(lastNote.content);
        }
      } else {
        toast.error('Сессия не найдена');
        navigate('/dm-dashboard');
      }
    } catch (error) {
      console.error('Ошибка при загрузке сессии:', error);
      toast.error('Ошибка при загрузке сессии');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadSession();
    fetchSessions();
  }, [sessionId, fetchSessions]);
  
  // Проверка, что пользователь имеет права на доступ к сессии
  useEffect(() => {
    if (!isLoading && session && currentUser && session.dmId !== currentUser.id) {
      toast.error('У вас нет доступа к этой сессии');
      navigate('/dm-dashboard');
    }
  }, [session, currentUser, isLoading, navigate]);
  
  const handleCopySessionCode = () => {
    if (session) {
      navigator.clipboard.writeText(session.code);
      toast.success('Код сессии скопирован!');
    }
  };
  
  const handleCopySessionLink = () => {
    if (session) {
      const sessionLink = `${window.location.origin}/join/${session.code}`;
      navigator.clipboard.writeText(sessionLink);
      toast.success('Ссылка на сессию скопирована!');
    }
  };
  
  const handleEndSession = async () => {
    if (session) {
      const success = await endSession(session.id);
      if (success) {
        navigate('/dm-dashboard');
      }
    }
  };
  
  const handleRefreshCode = async () => {
    if (session) {
      const newCode = await sessionService.updateSessionCode(session.id);
      if (newCode) {
        setSession({...session, code: newCode});
        toast.success('Код сессии обновлен');
      }
    }
  };
  
  const handleSaveNotes = async () => {
    if (session) {
      try {
        const success = await sessionService.saveSessionNotes(session.id, notes);
        if (success) {
          toast.success('Заметки сохранены');
          // Перезагружаем сессию, чтобы получить обновленные заметки
          loadSession();
        }
      } catch (error) {
        toast.error('Ошибка при сохранении заметок');
      }
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen p-4 bg-gradient-to-br from-background to-background/80 theme-${theme}`}>
        <div className="flex justify-center items-center h-screen">
          <p>Загрузка сессии...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className={`min-h-screen p-4 bg-gradient-to-br from-background to-background/80 theme-${theme}`}>
        <div className="flex justify-center items-center h-screen">
          <p>Сессия не найдена</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 bg-gradient-to-br from-background to-background/80 theme-${theme}`}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate('/dm-dashboard')} className="mr-2">
              <ArrowLeft className="size-4" />
            </Button>
            <h1 className="text-2xl font-bold">{session.name}</h1>
          </div>
          
          <div className="flex items-center gap-2 mt-2 md:mt-0">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleCopySessionCode}
            >
              <Copy className="size-4" />
              Код: {session.code}
            </Button>
            
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleCopySessionLink}
            >
              <Link className="size-4" />
              Ссылка
            </Button>
            
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handleRefreshCode}
            >
              <RefreshCw className="size-4" />
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash className="mr-2 h-4 w-4" />
                  Завершить сессию
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Завершить сессию?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Вы действительно хотите завершить эту сессию? Все данные сессии будут удалены.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction onClick={handleEndSession} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Завершить
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </header>

        <Tabs defaultValue="players">
          <TabsList className="mb-6">
            <TabsTrigger value="players" className="gap-2">
              <Users className="size-4" />
              Игроки
            </TabsTrigger>
            <TabsTrigger value="combat">Бой</TabsTrigger>
            <TabsTrigger value="notes">Заметки</TabsTrigger>
            <TabsTrigger value="library">Библиотека</TabsTrigger>
          </TabsList>
          
          <TabsContent value="players">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Участники сессии</h2>
                
                {(!session.users || session.users.length <= 1) ? (
                  <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Users className="size-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium">В этой сессии пока нет игроков</p>
                      <p className="text-muted-foreground mb-4">Поделитесь кодом сессии с игроками, чтобы они могли присоединиться</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {session.users.filter((user: any) => !user.isDM).map((user: any) => (
                      <Card key={user.id} className="bg-card/30 backdrop-blur-sm border-primary/20">
                        <CardHeader>
                          <CardTitle className="flex justify-between">
                            <span>{user.name}</span>
                            <span className={user.isOnline ? "text-green-500" : "text-red-500"}>
                              {user.isOnline ? "В сети" : "Не в сети"}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {user.character ? (
                            <div className="space-y-2">
                              <div>
                                <span className="text-muted-foreground">Персонаж:</span>
                                <span className="ml-2">{user.character.name}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Класс:</span>
                                <span className="ml-2">{user.character.class}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Раса:</span>
                                <span className="ml-2">{user.character.race}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Уровень:</span>
                                <span className="ml-2">{user.character.level}</span>
                              </div>
                            </div>
                          ) : (
                            <p className="text-muted-foreground">Персонаж не выбран</p>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
              
              <div>
                <Card className="bg-card/30 backdrop-blur-sm border-primary/20 mb-6">
                  <CardHeader>
                    <CardTitle>Информация о сессии</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <span className="text-muted-foreground block mb-1">Название:</span>
                      <span>{session.name}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Код доступа:</span>
                      <div className="flex items-center gap-2">
                        <span>{session.code}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="size-6"
                          onClick={handleCopySessionCode}
                        >
                          <Copy className="size-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Описание:</span>
                      <span>{session.description || "Без описания"}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block mb-1">Игроков:</span>
                      <span>{session.users ? session.users.filter((user: any) => !user.isDM).length : 0}</span>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle>Действия</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button onClick={() => {}} className="w-full">
                      Создать NPC
                    </Button>
                    <Button onClick={() => {}} variant="outline" className="w-full">
                      Бросить кубики
                    </Button>
                    <Button onClick={() => {}} variant="outline" className="w-full">
                      Генератор имён
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Оставляем остальные табы без изменений */}
          <TabsContent value="combat">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Боевой трекер</h2>
                  <Button>
                    <Plus className="size-4 mr-2" />
                    Добавить существо
                  </Button>
                </div>
                
                <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center pb-2 border-b border-muted">
                        <span className="font-semibold">Имя</span>
                        <div className="flex gap-8">
                          <span className="font-semibold w-12 text-center">Ини.</span>
                          <span className="font-semibold w-12 text-center">HP</span>
                          <span className="font-semibold w-12 text-center">КЗ</span>
                          <span className="font-semibold w-16"></span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-2 bg-primary/10 rounded-md">
                        <span>Грогнак (Игрок)</span>
                        <div className="flex gap-8">
                          <span className="w-12 text-center">18</span>
                          <span className="w-12 text-center">32/40</span>
                          <span className="w-12 text-center">16</span>
                          <Button variant="ghost" size="sm" className="w-16">Ход</Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-2 rounded-md">
                        <span>Гоблин #1</span>
                        <div className="flex gap-8">
                          <span className="w-12 text-center">12</span>
                          <span className="w-12 text-center">7/7</span>
                          <span className="w-12 text-center">15</span>
                          <Button variant="ghost" size="sm" className="w-16">Ход</Button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center p-2 rounded-md">
                        <span>Гоблин #2</span>
                        <div className="flex gap-8">
                          <span className="w-12 text-center">8</span>
                          <span className="w-12 text-center">7/7</span>
                          <span className="w-12 text-center">15</span>
                          <Button variant="ghost" size="sm" className="w-16">Ход</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div>
                <Card className="bg-card/30 backdrop-blur-sm border-primary/20 mb-6">
                  <CardHeader>
                    <CardTitle>Боевые действия</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button className="w-full">Следующий ход</Button>
                    <Button variant="outline" className="w-full">Новый раунд</Button>
                    <Button variant="outline" className="w-full">Сбросить инициативу</Button>
                    <Button variant="destructive" className="w-full">Завершить бой</Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle>Бросок кубиков</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline">D4</Button>
                      <Button variant="outline">D6</Button>
                      <Button variant="outline">D8</Button>
                      <Button variant="outline">D10</Button>
                      <Button variant="outline">D12</Button>
                      <Button variant="outline">D20</Button>
                    </div>
                    <Input placeholder="Например: 2d6+3" />
                    <Button className="w-full">Бросить</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notes">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Заметки мастера</h2>
                <Button onClick={handleSaveNotes}>Сохранить</Button>
              </div>
              
              <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
                <CardContent className="p-4">
                  <Textarea 
                    value={notes} 
                    onChange={(e) => setNotes(e.target.value)} 
                    className="min-h-[400px]" 
                    placeholder="Записи о приключении, NPC, важных деталях сюжета..."
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="library">
            <div className="space-y-6">
              <h2 className="text-xl font-semibold">Библиотека D&D 5e</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle>Монстры</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      База данных существ и монстров D&D 5e.
                    </p>
                    <Button className="w-full">Открыть</Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle>Заклинания</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Полный список заклинаний D&D 5e.
                    </p>
                    <Button className="w-full">Открыть</Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle>Предметы</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Магические и обычные предметы D&D 5e.
                    </p>
                    <Button className="w-full">Открыть</Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle>Правила</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Основные правила для мастера.
                    </p>
                    <Button className="w-full">Открыть</Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle>Генератор случайностей</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Создавайте случайные события, встречи и сокровища.
                    </p>
                    <Button className="w-full">Открыть</Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
                  <CardHeader>
                    <CardTitle>NPC</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Генератор и база данных неигровых персонажей.
                    </p>
                    <Button className="w-full">Открыть</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DMSessionPage;
