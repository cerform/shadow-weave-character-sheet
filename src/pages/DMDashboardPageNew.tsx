import React, { useState } from 'react';
console.log('DMDashboardPageNew загружается...');
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Home, Crown, Users, Sword, Map, Dice6, Eye } from 'lucide-react';
import { sessionService } from '@/services/sessionService';

const DMDashboardPageNew: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const features = [
    { icon: Users, title: 'Инициатива', description: 'Трекер порядка ходов' },
    { icon: Map, title: 'Боевая карта', description: 'Интерактивная карта сражений' },
    { icon: Sword, title: 'Токены', description: 'Управление персонажами и монстрами' },
    { icon: Eye, title: 'Туман войны', description: 'Скрытие областей карты' },
    { icon: Dice6, title: 'Кости', description: 'Система бросков костей' }
  ];

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
      
      // Переходим к странице управления сессией
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
    <div className="min-h-screen bg-slate-900 text-white p-6">
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
                  onClick={() => navigate('/battle-map-fixed')}
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