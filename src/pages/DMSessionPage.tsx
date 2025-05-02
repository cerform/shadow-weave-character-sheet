
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { useTheme } from '@/hooks/use-theme';
import { Users, ArrowLeft, Plus, RefreshCw, Copy } from 'lucide-react';
import { useSessionStore } from '@/stores/sessionStore';

const DMSessionPage = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { theme } = useTheme();
  const { sessions, updateSession, endSession, setUserType } = useSessionStore();
  
  const [session, setSession] = useState(useSessionStore.getState().sessions.find(s => s.id === sessionId) || null);
  const [notes, setNotes] = useState('');
  
  // Subscribe to session store changes
  useEffect(() => {
    const unsubscribe = useSessionStore.subscribe(
      (state) => state.sessions,
      (sessions) => {
        const foundSession = sessions.find(s => s.id === sessionId);
        if (foundSession) {
          setSession(foundSession);
        } else {
          toast('Сессия не найдена');
          navigate('/dm');
        }
      }
    );
    
    // Initial check for session
    if (sessionId) {
      const foundSession = sessions.find(s => s.id === sessionId);
      if (foundSession) {
        setSession(foundSession);
        setUserType('dm');
      } else {
        toast('Сессия не найдена');
        navigate('/dm');
      }
    }
    
    return unsubscribe;
  }, [sessionId, sessions, navigate, setUserType]);
  
  // Load notes from localStorage
  useEffect(() => {
    if (session) {
      const savedNotes = localStorage.getItem(`dnd-session-notes-${session.id}`);
      if (savedNotes) {
        setNotes(savedNotes);
      }
    }
  }, [session]);
  
  const handleCopySessionCode = () => {
    if (session) {
      navigator.clipboard.writeText(session.code);
      toast.success('Код сессии скопирован!');
    }
  };
  
  const handleEndSession = () => {
    if (session) {
      endSession(session.id);
      toast.success('Сессия завершена');
      navigate('/dm');
    }
  };
  
  const handleRefreshCode = () => {
    if (session) {
      const newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      updateSession({
        id: session.id,
        code: newCode
      });
      toast.success('Код сессии обновлен');
    }
  };
  
  const handleSaveNotes = () => {
    if (session) {
      localStorage.setItem(`dnd-session-notes-${session.id}`, notes);
      toast.success('Заметки сохранены');
    }
  };
  
  if (!session) {
    return (
      <div className={`min-h-screen p-4 bg-gradient-to-br from-background to-background/80 ${theme}`}>
        <div className="flex justify-center items-center h-screen">
          <p>Загрузка сессии...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 bg-gradient-to-br from-background to-background/80 ${theme}`}>
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center">
            <Button variant="ghost" onClick={() => navigate('/dm')} className="mr-2">
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
              onClick={handleRefreshCode}
            >
              <RefreshCw className="size-4" />
            </Button>
            
            <Button 
              variant="destructive"
              onClick={handleEndSession}
            >
              Завершить сессию
            </Button>
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
                
                {session.players.length === 0 ? (
                  <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <Users className="size-12 text-muted-foreground mb-4" />
                      <p className="text-lg font-medium">В этой сессии пока нет игроков</p>
                      <p className="text-muted-foreground mb-4">Поделитесь кодом сессии с игроками, чтобы они могли присоединиться</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {session.players.map((player) => (
                      <Card key={player.id} className="bg-card/30 backdrop-blur-sm border-primary/20">
                        <CardHeader>
                          <CardTitle className="flex justify-between">
                            <span>{player.name}</span>
                            <span className={player.connected ? "text-green-500" : "text-red-500"}>
                              {player.connected ? "В сети" : "Не в сети"}
                            </span>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            <div>
                              <span className="text-muted-foreground">Персонаж:</span>
                              <span className="ml-2">{player.character?.name || "Неизвестно"}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Класс:</span>
                              <span className="ml-2">{player.character?.class || "Неизвестно"}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Раса:</span>
                              <span className="ml-2">{player.character?.race || "Неизвестно"}</span>
                            </div>
                            <div className="flex justify-end">
                              <Button 
                                size="sm" 
                                onClick={() => {
                                  // View character sheet logic
                                }}
                              >
                                Просмотр персонажа
                              </Button>
                            </div>
                          </div>
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
                      <span>{session.players.length}</span>
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
