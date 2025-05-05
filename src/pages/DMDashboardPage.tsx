
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useNavigate } from 'react-router-dom';
import useSessionStore from '@/stores/sessionStore';
import { Label } from "@/components/ui/label";
import { Users, PlusCircle, ArrowRight, Clock, Calendar, Shield, Trash2, Edit } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';

const DMDashboardPage = () => {
  const navigate = useNavigate();
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const sessionStore = useSessionStore();
  const { currentUser } = useAuth();
  const [userSessions, setUserSessions] = useState<any[]>([]);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);

  useEffect(() => {
    if (!currentUser?.isDM) {
      toast.error("Доступ только для Мастеров Подземелий");
      navigate('/');
      return;
    }

    // Загружаем сессии при монтировании компонента только если они еще не загружены
    if (!sessionsLoaded && currentUser?.id) {
      const loadSessions = async () => {
        try {
          const sessions = await sessionStore.fetchSessions();
          // Фильтруем только сессии текущего DM
          const filteredSessions = sessions.filter(s => s.dmId === currentUser?.id);
          setUserSessions(filteredSessions);
          setSessionsLoaded(true);
        } catch (error) {
          console.error("Ошибка загрузки сессий:", error);
          setSessionsLoaded(true); // Помечаем как загруженные, чтобы избежать повторных запросов
        }
      };

      loadSessions();
    }
  }, [currentUser, navigate, sessionStore, sessionsLoaded]);

  const handleCreateSession = () => {
    if (!sessionName.trim()) {
      toast.error("Введите название сессии!");
      return;
    }

    const newSession = sessionStore.createSession(sessionName, sessionDescription);
    setShowCreateDialog(false);
    setSessionName('');
    setSessionDescription('');
    
    // Обновляем список сессий
    setUserSessions(prev => [...prev, newSession]);
    
    toast.success("Сессия успешно создана!");
  };

  const handleDeleteSession = (sessionId: string) => {
    if (confirm("Вы уверены, что хотите удалить эту сессию?")) {
      sessionStore.endSession(sessionId);
      // Обновляем список сессий
      setUserSessions(prev => prev.filter(s => s.id !== sessionId));
      toast.success("Сессия удалена");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <BackgroundWrapper>
      <div className="min-h-screen p-4 sm:p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Shield className="h-8 w-8" /> Панель Мастера Подземелий
            </h1>
            <IconOnlyNavigation />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Левая колонка - Статистика */}
            <div className="md:col-span-1">
              <Card className="bg-black/50 backdrop-blur-sm border-accent/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Статистика Мастера</CardTitle>
                  <CardDescription>Обзор ваших игровых данных</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-primary" />
                      <span>Всего игроков: {userSessions.reduce((total, session) => total + session.players.length, 0)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      <span>Активных сессий: {userSessions.filter(s => s.isActive).length}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span>Всего сессий: {userSessions.length}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => setShowCreateDialog(true)}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" /> Создать новую сессию
                  </Button>
                </CardFooter>
              </Card>
            </div>

            {/* Правая колонка - Список сессий */}
            <div className="md:col-span-2">
              <Card className="bg-black/50 backdrop-blur-sm border-accent/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Ваши игровые сессии</CardTitle>
                  <CardDescription>Управление созданными вами сессиями</CardDescription>
                </CardHeader>
                <CardContent>
                  {userSessions.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">У вас пока нет созданных сессий</p>
                      <Button 
                        variant="default" 
                        onClick={() => setShowCreateDialog(true)}
                      >
                        <PlusCircle className="h-4 w-4 mr-2" /> Создать первую сессию
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userSessions.map((session) => (
                        <Card key={session.id} className="bg-black/30 hover:bg-black/40 transition-all">
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg font-bold">{session.name}</CardTitle>
                              <div className="flex gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleDeleteSession(session.id)}
                                  className="h-8 w-8 text-destructive hover:text-destructive/80"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => navigate(`/dm-session/${session.id}`)}
                                  className="h-8 w-8"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <CardDescription>
                              Код сессии: <span className="font-mono bg-primary/10 px-1 rounded">{session.code}</span>
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="pt-0">
                            <div className="space-y-2">
                              {session.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {session.description}
                                </p>
                              )}
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                <span>Создано: {formatDate(session.createdAt)}</span>
                              </div>
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Users className="h-3 w-3 mr-1" />
                                <span>Игроков: {session.players.length}</span>
                              </div>
                            </div>
                          </CardContent>
                          <CardFooter>
                            <Button 
                              variant="link" 
                              className="ml-auto flex items-center" 
                              onClick={() => navigate(`/dm-session/${session.id}`)}
                            >
                              Управление сессией <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Диалог создания сессии */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-card/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle>Создание новой игровой сессии</DialogTitle>
            <DialogDescription>
              Введите информацию о новой сессии. Игроки смогут присоединиться к ней с помощью кода.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="sessionName">Название сессии</Label>
              <Input
                id="sessionName"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder="Введите название сессии"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sessionDescription">Описание сессии</Label>
              <Textarea
                id="sessionDescription"
                value={sessionDescription}
                onChange={(e) => setSessionDescription(e.target.value)}
                placeholder="Введите описание сессии (опционально)"
                rows={4}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Отмена</Button>
            <Button onClick={handleCreateSession}>Создать сессию</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </BackgroundWrapper>
  );
};

export default DMDashboardPage;
