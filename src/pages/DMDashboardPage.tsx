import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { sessionService, GameSession } from '@/services/sessionService';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Users, 
  Clock, 
  Settings, 
  Play, 
  Pause, 
  MoreVertical,
  MapPin,
  Dice6,
  Crown
} from 'lucide-react';
import BackgroundWrapper from '@/components/layout/BackgroundWrapper';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';

const DMDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  const [sessions, setSessions] = useState<GameSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  
  // Форма создания сессии
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    loadSessions();
  }, [isAuthenticated, navigate]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const userSessions = await sessionService.getUserSessions();
      setSessions(userSessions);
    } catch (error: any) {
      toast({
        title: "Ошибка загрузки сессий",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    if (!sessionName.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите название сессии",
        variant: "destructive",
      });
      return;
    }

    try {
      setCreating(true);
      const session = await sessionService.createSession(sessionName, sessionDescription);
      
      toast({
        title: "Сессия создана!",
        description: `Код сессии: ${session.session_code}`,
      });
      
      // Сбрасываем форму
      setSessionName('');
      setSessionDescription('');
      setCreateDialogOpen(false);
      
      // Обновляем список сессий
      await loadSessions();
      
      // Переходим к управлению сессией
      navigate(`/dm/session/${session.id}`);
    } catch (error: any) {
      toast({
        title: "Ошибка создания сессии",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleJoinSession = (sessionId: string) => {
    navigate(`/dm/session/${sessionId}`);
  };

  const handleEndSession = async (sessionId: string) => {
    try {
      await sessionService.endSession(sessionId);
      toast({
        title: "Сессия завершена",
        description: "Сессия была успешно завершена",
      });
      await loadSessions();
    } catch (error: any) {
      toast({
        title: "Ошибка завершения сессии",
        description: error.message,
        variant: "destructive",
      });
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

  if (loading) {
    return (
      <BackgroundWrapper>
        <IconOnlyNavigation />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Загрузка сессий...</p>
          </div>
        </div>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <IconOnlyNavigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Заголовок */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold flex items-center gap-3">
              <Crown className="h-10 w-10 text-amber-500" />
              Панель Мастера
            </h1>
            <p className="text-muted-foreground mt-2">
              Управляйте игровыми сессиями и ведите увлекательные приключения
            </p>
          </div>
          
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Создать сессию
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Создание новой сессии</DialogTitle>
                <DialogDescription>
                  Создайте новую игровую сессию для ваших игроков
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="session-name">Название сессии</Label>
                  <Input
                    id="session-name"
                    placeholder="Например: Проклятие Страда"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="session-description">Описание (необязательно)</Label>
                  <Textarea
                    id="session-description"
                    placeholder="Краткое описание приключения..."
                    value={sessionDescription}
                    onChange={(e) => setSessionDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button
                    onClick={handleCreateSession}
                    disabled={creating}
                  >
                    {creating ? 'Создание...' : 'Создать'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Активные сессии</CardTitle>
              <Play className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sessions.filter(s => s.is_active).length}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Всего сессий</CardTitle>
              <Dice6 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sessions.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Последняя активность</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {sessions.length > 0 ? 'Сегодня' : '-'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Список сессий */}
        <Card>
          <CardHeader>
            <CardTitle>Ваши сессии</CardTitle>
            <CardDescription>
              Управляйте своими игровыми сессиями
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessions.length === 0 ? (
              <div className="text-center py-12">
                <Crown className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Нет активных сессий</h3>
                <p className="text-muted-foreground mb-4">
                  Создайте свою первую игровую сессию
                </p>
                <Button onClick={() => setCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Создать сессию
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{session.name}</h3>
                        <Badge variant={session.is_active ? "default" : "secondary"}>
                          {session.is_active ? "Активна" : "Завершена"}
                        </Badge>
                        <Badge variant="outline" className="font-mono">
                          {session.session_code}
                        </Badge>
                      </div>
                      
                      {session.description && (
                        <p className="text-sm text-muted-foreground mb-2">
                          {session.description}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDate(session.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          0/{session.max_players} игроков
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {session.is_active && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleJoinSession(session.id)}
                            className="gap-2"
                          >
                            <MapPin className="h-4 w-4" />
                            Управлять
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEndSession(session.id)}
                            className="gap-2"
                          >
                            <Pause className="h-4 w-4" />
                            Завершить
                          </Button>
                        </>
                      )}
                      {!session.is_active && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleJoinSession(session.id)}
                          className="gap-2"
                        >
                          <Settings className="h-4 w-4" />
                          Просмотр
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </BackgroundWrapper>
  );
};

export default DMDashboardPage;
