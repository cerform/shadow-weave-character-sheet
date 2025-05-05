import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from 'sonner';
import { useTheme } from '@/hooks/use-theme';
import useSessionStore from '@/stores/sessionStore';
import { Copy, Users, ArrowLeft, Plus, RefreshCw, Trash, Link } from 'lucide-react';
import { sessionService } from '@/services/sessionService';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const DMSessionPage = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams<{ sessionId: string }>();
  const { theme } = useTheme();
  const sessionStore = useSessionStore();
  
  // Переменные состояния для сессии и пользователя
  const [currentSession, setCurrentSession] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем данные сессии
  useEffect(() => {
    if (sessionId) {
      // Проверяем, доступен ли метод loadSessionFromStorage
      if (sessionStore.loadSessionFromStorage) {
        const loaded = sessionStore.loadSessionFromStorage(sessionId);
        if (!loaded) {
          toast.error('Не удалось загрузить сессию');
          navigate('/dm-dashboard');
        } else {
          setIsLoading(false);
        }
      } else {
        toast.error('Функция загрузки сессии недоступна');
        navigate('/dm-dashboard');
      }
    }
  }, [sessionId, navigate]);

  // Функция для форматирования даты
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Функция для копирования кода сессии
  const handleCopyCode = () => {
    if (currentSession && currentSession.code) {
      navigator.clipboard.writeText(currentSession.code)
        .then(() => toast.success('Код скопирован'))
        .catch(() => toast.error('Не удалось скопировать код'));
    }
  };

  // Функция для завершения сессии
  const handleEndSession = async () => {
    if (sessionId) {
      // Проверяем, доступен ли метод endSession
      if (sessionStore.setSessionStatus) {
        sessionStore.setSessionStatus(false);
        toast.success('Сессия завершена');
        navigate('/dm-dashboard');
      } else {
        toast.error('Функция завершения сессии недоступна');
      }
    }
  };

  // Функция для обновления списка игроков (временная)
  const handleRefreshPlayers = () => {
    toast.info('Список игроков обновлен');
  };

  // Функция для добавления нового игрока (временная)
  const handleAddPlayer = () => {
    toast.info('Новый игрок добавлен');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <RefreshCw className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Загрузка сессии...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-background text-foreground py-8 theme-${theme}`}>
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => navigate('/dm-dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Назад
            </Button>
            <h1 className="text-3xl font-bold">
              {currentSession ? currentSession.name : 'Загрузка...'}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={handleCopyCode}>
              <Copy className="h-4 w-4 mr-2" />
              Копировать код
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash className="h-4 w-4 mr-2" />
                  Завершить сессию
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Завершить сессию?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Вы уверены, что хотите завершить эту сессию? Это действие нельзя отменить.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                  <AlertDialogAction onClick={handleEndSession}>Завершить</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <Separator className="my-6" />

        <Tabs defaultValue="players" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="players">
              <Users className="h-4 w-4 mr-2" />
              Игроки
            </TabsTrigger>
            <TabsTrigger value="notes">
              <Link className="h-4 w-4 mr-2" />
              Заметки
            </TabsTrigger>
          </TabsList>
          <TabsContent value="players">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Список игроков
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={handleRefreshPlayers}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Обновить
                  </Button>
                  <Button size="sm" onClick={handleAddPlayer}>
                    <Plus className="h-4 w-4 mr-2" />
                    Добавить
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h3 className="font-medium">Игрок 1</h3>
                      <p className="text-sm text-muted-foreground">Персонаж: Имя персонажа</p>
                    </div>
                    <Badge variant="secondary">Активен</Badge>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h3 className="font-medium">Игрок 2</h3>
                      <p className="text-sm text-muted-foreground">Персонаж: Имя персонажа</p>
                    </div>
                    <Badge variant="secondary">Активен</Badge>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="text-sm text-muted-foreground">
                Создано {formatDate(currentSession ? currentSession.createdAt : '')}
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="notes">
            <Card>
              <CardHeader>
                <CardTitle>Заметки сессии</CardTitle>
                <CardDescription>
                  Здесь можно записывать важные моменты и детали сессии
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Input type="text" placeholder="Начните вводить заметки..." />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default DMSessionPage;
