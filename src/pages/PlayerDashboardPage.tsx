import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, useUserRole } from '@/hooks/use-auth';
import { toast } from 'sonner';

import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';
import { useCharacter } from '@/contexts/CharacterContext';
import { useSessionStore } from '@/utils/sessionImports';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Gamepad, 
  Dice6, 
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
    <>
      <div className="min-h-screen p-4 sm:p-6">
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Gamepad className="h-8 w-8" /> Панель игрока
            </h1>
            <IconOnlyNavigation />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* ... остальной контент остается тем же ... */}
            <div className="md:col-span-4 space-y-6">
              <Card className="bg-background/50 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-2">
                  <CardTitle>{currentUser?.displayName || 'Игрок'}</CardTitle>
                  <CardDescription>{currentUser?.email}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Текущий персонаж:</span>
                      <span className="font-semibold">{character?.name || 'Не выбран'}</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-2">
                  <Button className="w-full" onClick={() => navigate('/characters')}>
                    <FileText className="h-4 w-4 mr-2" /> Мои персонажи
                  </Button>
                </CardFooter>
              </Card>
            </div>
            <div className="md:col-span-8">
              <Card className="bg-background/50 backdrop-blur-sm border-border/50">
                <CardHeader>
                  <CardTitle>Игровые сессии</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => setShowJoinDialog(true)} className="w-full">
                    Присоединиться к сессии
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="bg-card/95 backdrop-blur-md">
          <DialogHeader>
            <DialogTitle>Присоединение к сессии</DialogTitle>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleJoinSession}>Присоединиться</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PlayerDashboardPage;
