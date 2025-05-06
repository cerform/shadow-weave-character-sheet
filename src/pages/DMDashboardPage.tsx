
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { getSessionsByHostId, deleteSession } from '@/services/sessionService';
import { Session } from '@/types/session';
import { Plus, Trash2, ArrowRight, ChevronRight, ArrowLeft } from 'lucide-react';
import OBSLayout from '@/components/OBSLayout';
import IconOnlyNavigation from '@/components/navigation/IconOnlyNavigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const DMDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/auth', { state: { returnPath: '/dm-dashboard' } });
      return;
    }

    const loadSessions = async () => {
      try {
        setLoading(true);
        const fetchedSessions = await getSessionsByHostId(user.uid);
        setSessions(fetchedSessions);
      } catch (err) {
        console.error('Ошибка при загрузке сессий:', err);
        setError('Не удалось загрузить сессии');
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, [user, navigate]);

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await deleteSession(sessionId);
      setSessions(prev => prev.filter(session => session.id !== sessionId));
      toast.success('Сессия удалена');
    } catch (err) {
      console.error('Ошибка при удалении сессии:', err);
      toast.error('Не удалось удалить сессию');
    }
  };

  const filteredSessions = searchQuery
    ? sessions.filter(session => 
        session.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.sessionKey.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : sessions;

  if (!user) {
    return null; // Редирект обработан в useEffect
  }

  return (
    <OBSLayout
      topPanelContent={
        <div className="flex justify-between items-center p-3">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="gap-2"
          >
            <ArrowLeft size={16} />
            На главную
          </Button>
          
          <h1 className="text-xl font-bold">
            Панель Мастера
          </h1>
          
          <IconOnlyNavigation includeThemeSelector />
        </div>
      }
    >
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="grid grid-cols-1 gap-6">
          {/* Верхняя панель с приветствием и статистикой */}
          <Card className="bg-black/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Панель Мастера</CardTitle>
              <CardDescription>
                Добро пожаловать, {user.displayName || user.username || user.email}!
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-primary/10 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-primary">{sessions.length}</div>
                <div className="text-sm text-gray-400">Активных сессий</div>
              </div>
              <div className="bg-primary/10 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-primary">
                  {sessions.reduce((total, session) => total + session.participants.length, 0)}
                </div>
                <div className="text-sm text-gray-400">Игроков</div>
              </div>
              <div className="bg-primary/10 p-4 rounded-lg text-center">
                <div className="text-3xl font-bold text-primary">0</div>
                <div className="text-sm text-gray-400">Кампаний</div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => navigate('/create-session')} className="gap-2">
                <Plus size={16} />
                Создать новую сессию
              </Button>
            </CardFooter>
          </Card>
          
          {/* Список сессий */}
          <Card className="bg-black/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Ваши игровые сессии</CardTitle>
              <CardDescription>
                Управление созданными вами сессиями
              </CardDescription>
              <div className="mt-2">
                <Input
                  placeholder="Поиск по названию или коду..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-sm"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="py-8 text-center">
                  Загрузка сессий...
                </div>
              ) : error ? (
                <div className="py-8 text-center text-red-500">
                  {error}
                </div>
              ) : sessions.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="mb-4">У вас еще нет созданных сессий</p>
                  <Button onClick={() => navigate('/create-session')}>
                    Создать первую сессию
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Название</TableHead>
                        <TableHead>Код</TableHead>
                        <TableHead>Дата создания</TableHead>
                        <TableHead>Игроков</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSessions.map((session) => (
                        <TableRow key={session.id}>
                          <TableCell className="font-medium">{session.name}</TableCell>
                          <TableCell className="font-mono">{session.sessionKey}</TableCell>
                          <TableCell>
                            {new Date(session.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{session.participants.length}</TableCell>
                          <TableCell className="text-right space-x-1">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => navigate(`/dm-session/${session.id}`)}
                              title="Управление"
                            >
                              <ChevronRight size={16} />
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-500 hover:text-red-700"
                                  title="Удалить"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Удаление сессии приведет к потере всех данных. Это действие нельзя отменить.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Отмена</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteSession(session.id)}>
                                    Удалить
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </OBSLayout>
  );
};

export default DMDashboardPage;
