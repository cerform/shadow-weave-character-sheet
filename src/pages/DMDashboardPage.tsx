
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ChevronRight, Plus, Users, Activity, Map, Swords } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import { useSessionStore } from '@/stores/sessionStore';
import { Session } from "@/types/session";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const DMDashboardPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { sessions, fetchSessions, createSession, loading } = useSessionStore();
  
  const [open, setOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [newSessionDescription, setNewSessionDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    // Загружаем сессии при монтировании компонента
    fetchSessions();
  }, [fetchSessions]);

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSessionName) return;

    try {
      setIsCreating(true);
      const newSession = await createSession(newSessionName, newSessionDescription);
      
      // Сбрасываем форму и закрываем диалог
      setNewSessionName("");
      setNewSessionDescription("");
      setOpen(false);
      
      // Переходим на страницу сессии
      navigate(`/dm-session/${newSession.id}`);
    } catch (error) {
      console.error("Ошибка при создании сессии:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const goToSession = (sessionId: string) => {
    navigate(`/dm-session/${sessionId}`);
  };

  const goToBattleScene = () => {
    navigate("/dm/battle");
  };
  
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ru-RU', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch (error) {
      return dateString;
    }
  };

  return (
    <div className={`min-h-screen bg-background text-foreground py-8 theme-${theme}`}>
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Панель Мастера Подземелий</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <Card className="col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Ваши сессии
                </CardTitle>
                <CardDescription>
                  Управляйте игровыми сессиями и приключениями
                </CardDescription>
              </div>
              <Button onClick={() => setOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Создать
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {loading ? (
                  <div className="text-center p-8">
                    <p>Загрузка сессий...</p>
                  </div>
                ) : sessions.length > 0 ? (
                  sessions.map((session) => (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 border rounded cursor-pointer hover:bg-accent"
                      onClick={() => goToSession(session.id)}
                    >
                      <div>
                        <h3 className="font-medium">{session.name || session.title}</h3>
                        <div className="text-sm text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {formatDate(session.createdAt)}
                          <Users className="h-3 w-3 ml-2" />
                          {session.users ? session.users.filter(user => !user.isDM).length : 0} игроков
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  ))
                ) : (
                  <div className="text-center p-8">
                    <p className="text-muted-foreground py-4">
                      У вас пока нет активных сессий
                    </p>
                    <Button onClick={() => setOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Создать сессию
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Swords className="h-5 w-5" />
                  Боевые сцены
                </CardTitle>
                <CardDescription>
                  Управляйте боем и отслеживайте инициативу
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={goToBattleScene} className="w-full">
                  Открыть боевую сцену
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Map className="h-5 w-5" />
                  Карты и локации
                </CardTitle>
                <CardDescription>
                  Управляйте картами и создавайте новые локации
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" variant="outline">
                  Библиотека карт
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Персонажи
                </CardTitle>
                <CardDescription>
                  Просмотр и управление созданными персонажами
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  className="w-full" 
                  variant="outline" 
                  onClick={() => navigate('/characters')}
                >
                  Управление персонажами
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="bg-card p-4 rounded">
          <h2 className="text-xl font-bold mb-4">Советы для Мастера</h2>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Подготовьте несколько встреч заранее, чтобы игра шла плавно</li>
            <li>Используйте боевую сцену для отслеживания инициативы и здоровья</li>
            <li>Делайте заметки о важных моментах игры и решениях персонажей</li>
            <li>Не бойтесь импровизировать, если игроки делают что-то неожиданное</li>
          </ul>
        </div>
      </div>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Создать новую сессию</DialogTitle>
            <DialogDescription>
              Создайте новую игровую сессию и пригласите игроков присоединиться
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleCreateSession}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Название сессии</Label>
                <Input
                  id="name"
                  placeholder="Например: Затерянные шахты Фанделвера"
                  value={newSessionName}
                  onChange={(e) => setNewSessionName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Описание (необязательно)</Label>
                <Textarea
                  id="description"
                  placeholder="Краткое описание вашего приключения"
                  value={newSessionDescription}
                  onChange={(e) => setNewSessionDescription(e.target.value)}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setOpen(false)}
                disabled={isCreating}
              >
                Отмена
              </Button>
              <Button 
                type="submit" 
                disabled={!newSessionName || isCreating}
              >
                {isCreating ? "Создание..." : "Создать сессию"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DMDashboardPage;
