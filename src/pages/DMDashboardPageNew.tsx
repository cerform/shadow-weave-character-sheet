import React, { useState, useEffect } from 'react';
console.log('DMDashboardPageNew загружается...');
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Home, Crown, Users, Sword, Map, Dice6, Eye, Play, Pause, Trash2, Copy, Calendar } from 'lucide-react';
import { sessionService } from '@/services/sessionService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

const DMDashboardPageNew: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const features = [
    { icon: Users, title: 'Инициатива', description: 'Трекер порядка ходов' },
    { icon: Map, title: 'Боевая карта', description: 'Интерактивная карта сражений' },
    { icon: Sword, title: 'Токены', description: 'Управление персонажами и монстрами' },
    { icon: Eye, title: 'Туман войны', description: 'Скрытие областей карты' },
    { icon: Dice6, title: 'Кости', description: 'Система бросков костей' }
  ];

  // Загрузка сессий пользователя
  const fetchSessions = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('game_sessions')
        .select(`
          *,
          session_players(count)
        `)
        .eq('dm_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось загрузить сессии",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Загружаем сессии при монтировании компонента
  useEffect(() => {
    fetchSessions();
  }, [user?.id]);

  // Управление сессией
  const handleSessionAction = async (sessionId: string, action: 'pause' | 'resume' | 'delete') => {
    try {
      if (action === 'delete') {
        const { error } = await supabase
          .from('game_sessions')
          .delete()
          .eq('id', sessionId);
        
        if (error) throw error;
        
        toast({
          title: "Сессия удалена",
          description: "Сессия была успешно удалена"
        });
      } else if (action === 'pause') {
        const { error } = await supabase
          .from('game_sessions')
          .update({ is_active: false })
          .eq('id', sessionId);
        
        if (error) throw error;
        
        toast({
          title: "Сессия приостановлена",
          description: "Сессия была приостановлена"
        });
      } else if (action === 'resume') {
        const { error } = await supabase
          .from('game_sessions')
          .update({ is_active: true })
          .eq('id', sessionId);
        
        if (error) throw error;
        
        toast({
          title: "Сессия возобновлена",
          description: "Сессия была возобновлена"
        });
      }
      
      // Перезагружаем список сессий
      fetchSessions();
    } catch (error) {
      console.error('Error managing session:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось выполнить действие",
        variant: "destructive"
      });
    }
  };

  // Копирование кода сессии
  const copySessionCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Код скопирован",
      description: `Код сессии ${code} скопирован в буфер обмена`
    });
  };

  const handleCreateSession = async () => {
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
      console.log('🎮 Создание сессии:', { sessionName, sessionDescription });
      
      const newSession = await sessionService.createSession(
        sessionName.trim(), 
        sessionDescription.trim() || undefined
      );
      
      console.log('✅ Сессия создана успешно:', newSession);
      
      toast({
        title: "Сессия создана",
        description: `Код сессии: ${newSession.session_code}`,
      });
      
      // Перезагружаем сессии после создания
      fetchSessions();
      navigate(`/dm-session/${newSession.id}`);
      
    } catch (error) {
      console.error('Ошибка при создании сессии:', error);
      toast({
        title: "Ошибка при создании сессии",
        description: error instanceof Error ? error.message : "Неизвестная ошибка",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
      setIsCreateSessionOpen(false);
      setSessionName('');
      setSessionDescription('');
    }
  };

  return (
    <div className="min-h-screen text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="text-slate-300 hover:text-white"
            >
              <Home className="h-4 w-4 mr-2" />
              На главную
            </Button>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Crown className="h-8 w-8 text-amber-400" />
              Панель Мастера
            </h1>
            <Badge className="bg-amber-600 text-amber-100">DM Only</Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-slate-800 border-slate-700 hover:bg-slate-750 transition-colors">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <feature.icon className="h-5 w-5 text-blue-400" />
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Список активных сессий */}
        {!loading && sessions.length > 0 && (
          <Card className="bg-slate-800 border-slate-700 mb-8">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Ваши сессии ({sessions.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {sessions.map((session) => (
                  <div key={session.id} className="bg-slate-700 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{session.name}</h3>
                          <Badge variant={session.is_active ? "default" : "secondary"}>
                            {session.is_active ? "Активна" : "Приостановлена"}
                          </Badge>
                          <Badge variant="outline" className="cursor-pointer" onClick={() => copySessionCode(session.session_code)}>
                            <Copy className="h-3 w-3 mr-1" />
                            {session.session_code}
                          </Badge>
                        </div>
                        {session.description && (
                          <p className="text-slate-300 text-sm mb-2">{session.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <span>Создана: {new Date(session.created_at).toLocaleDateString('ru-RU')}</span>
                          <span>Игроков: {session.session_players?.[0]?.count || 0}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          onClick={() => navigate(`/dm-session/${session.id}`)}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Управлять
                        </Button>
                        {session.is_active ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSessionAction(session.id, 'pause')}
                          >
                            <Pause className="h-4 w-4 mr-1" />
                            Пауза
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSessionAction(session.id, 'resume')}
                          >
                            <Play className="h-4 w-4 mr-1" />
                            Продолжить
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleSessionAction(session.id, 'delete')}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Современная панель управления</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <Crown className="h-16 w-16 mx-auto mb-4 text-amber-400" />
              <h3 className="text-xl font-semibold mb-2">Панель DM загружается</h3>
              <p className="text-slate-400 mb-6">
                Полнофункциональная панель Мастера с инициативой, токенами, картами и инструментами управления сессией
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  className="bg-amber-600 hover:bg-amber-700"
                  onClick={() => setIsCreateSessionOpen(true)}
                >
                  Начать новую сессию
                </Button>
                <Button 
                  variant="outline" 
                  className="border-slate-600 text-slate-300"
                  onClick={() => navigate('/dm-map-3d')}
                >
                  Генератор 3D карт
                </Button>
                <Button 
                  variant="outline" 
                  className="border-slate-600 text-slate-300"
                  onClick={() => navigate('/battle-map-3d')}
                >
                  Открыть боевую карту
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Модальное окно создания сессии */}
        <Dialog open={isCreateSessionOpen} onOpenChange={setIsCreateSessionOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Создать новую сессию</DialogTitle>
              <DialogDescription>
                Введите информацию о новой игровой сессии
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="session-name">Название сессии</Label>
                <Input
                  id="session-name"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="Например: Проклятье Страда"
                  onKeyPress={(e) => e.key === 'Enter' && !isCreating && handleCreateSession()}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="session-description">Описание (необязательно)</Label>
                <Input
                  id="session-description"
                  value={sessionDescription}
                  onChange={(e) => setSessionDescription(e.target.value)}
                  placeholder="Краткое описание сессии"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateSessionOpen(false)}
                disabled={isCreating}
              >
                Отмена
              </Button>
              <Button 
                onClick={handleCreateSession}
                disabled={isCreating}
                className="bg-amber-600 hover:bg-amber-700"
              >
                {isCreating ? "Создание..." : "Создать сессию"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DMDashboardPageNew;