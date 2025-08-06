import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { socketService } from '@/services/socket';
import DiceRoller from '@/components/session/DiceRoller';
import SessionChat from '@/components/session/SessionChat';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Send,
  Clock,
  UserPlus
} from "lucide-react";

// Define the Player type since it doesn't exist in session.ts
interface Player {
  id: string;
  name: string;
  character?: any;
  connected: boolean;
}

const DMSessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [currentSession, setCurrentSession] = useState<any | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    const loadSession = async () => {
      if (!sessionId) {
        navigate('/dm');
        return;
      }

      try {
        // Загружаем сессию
        const { data: session, error: sessionError } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (sessionError || !session) {
          toast({
            title: "Сессия не найдена",
            variant: "destructive"
          });
          navigate('/dm');
          return;
        }

        // Проверяем права доступа
        if (session.dm_id !== user?.id) {
          toast({
            title: "Доступ запрещен",
            description: "У вас нет прав для просмотра этой сессии",
            variant: "destructive"
          });
          navigate('/dm');
          return;
        }

        setCurrentSession(session);

        // Загружаем игроков
        const { data: sessionPlayers, error: playersError } = await supabase
          .from('session_players')
          .select(`
            *,
            characters (
              id,
              name,
              class,
              level
            )
          `)
          .eq('session_id', sessionId);

        if (!playersError && sessionPlayers) {
          setPlayers(sessionPlayers);
        }

      } catch (error) {
        console.error('Error loading session:', error);
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить сессию",
          variant: "destructive"
        });
        navigate('/dm');
      } finally {
        setLoading(false);
      }
    };
    
    loadSession();
  }, [isAuthenticated, navigate, sessionId, user?.id, toast]);

  const handleEndSession = async () => {
    if (!sessionId) return;

    try {
      const { error } = await supabase
        .from('game_sessions')
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq('id', sessionId);

      if (error) throw error;

      navigate('/dm');
      toast({
        title: "Сессия успешно завершена",
      });
    } catch (error) {
      console.error('Error ending session:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось завершить сессию",
        variant: "destructive"
      });
    }
  };

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) {
      toast({
        title: "Ошибка",
        description: "Введите имя игрока",
        variant: "destructive"
      });
      return;
    }
    
    // Add player logic would go here
    
    setNewPlayerName('');
    setIsAddingPlayer(false);
    toast({
      title: "Успех",
      description: `Игрок ${newPlayerName} добавлен в сессию`
    });
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    
    const newMessage = {
      id: Date.now().toString(),
      sender: user?.user_metadata?.full_name || 'DM',
      content: message,
      timestamp: new Date().toISOString(),
      isDM: true
    };
    
    setMessages(prev => [...prev, newMessage]);
    setMessage('');
    
    // В реальном приложении здесь отправка через сокет
  };

  if (loading) {
    return (
      <div className="container p-6">
        <h1>Загрузка сессии...</h1>
        <Button onClick={() => navigate('/dm')}>Вернуться к списку сессий</Button>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="container p-6">
        <h1>Сессия не найдена</h1>
        <Button onClick={() => navigate('/dm')}>Вернуться к списку сессий</Button>
      </div>
    );
  }

  return (
    <div className="container py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/dm')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          <h1 className="text-3xl font-bold">{currentSession.name}</h1>
          <div className="px-2 py-1 rounded bg-green-100 text-green-800 text-sm">
            Код: {currentSession.session_code}
          </div>
        </div>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Завершить сессию</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Вы уверены?</AlertDialogTitle>
              <AlertDialogDescription>
                Завершение сессии приведет к удалению всей информации о ней. Это действие нельзя отменить.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Отмена</AlertDialogCancel>
              <AlertDialogAction onClick={handleEndSession}>Завершить</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
      
      {currentSession.description && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <p>{currentSession.description}</p>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Участники сессии</CardTitle>
              <CardDescription>Игроки, присоединившиеся к вашей сессии</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Имя</TableHead>
                      <TableHead>Персонаж</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                   <TableBody>
                     {players && players.length > 0 ? (
                       players.map((player: any) => (
                         <TableRow key={player.id}>
                           <TableCell className="font-medium">{player.player_name}</TableCell>
                           <TableCell>
                             {player.characters ? player.characters.name : 'Не выбран'}
                           </TableCell>
                           <TableCell>
                             <div className={`w-3 h-3 rounded-full ${player.is_online ? 'bg-green-500' : 'bg-red-500'} mr-2 inline-block`}></div>
                             {player.is_online ? 'Онлайн' : 'Оффлайн'}
                           </TableCell>
                           <TableCell>
                             <Button variant="ghost" size="sm">
                               Просмотр
                             </Button>
                           </TableCell>
                         </TableRow>
                       ))
                     ) : (
                       <TableRow>
                         <TableCell colSpan={4} className="text-center py-4">
                           Нет игроков в сессии
                         </TableCell>
                       </TableRow>
                     )}
                   </TableBody>
                </Table>
              </div>
              
              <div className="mt-4">
                <Button onClick={() => setIsAddingPlayer(true)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Добавить игрока
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Панель управления игрой</CardTitle>
              <CardDescription>Инструменты Мастера Подземелий</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button onClick={() => navigate(`/dm/battle-map/${sessionId}`)}>Карта боя</Button>
              <Button>Генератор событий</Button>
              <Button>Бestiарий</Button>
              <Button>Таблицы лута</Button>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="h-[500px] flex flex-col">
            <CardHeader>
              <CardTitle>Чат сессии</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto min-h-[300px] p-4">
              {messages.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                  Здесь будут отображаться сообщения
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map(msg => (
                    <div key={msg.id} className={`p-2 rounded-lg ${msg.isDM ? 'bg-amber-100 ml-6' : 'bg-blue-100 mr-6'}`}>
                      <div className="font-bold flex justify-between">
                        <span>{msg.sender}</span>
                        <span className="text-xs text-gray-500">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div>{msg.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <div className="p-4 border-t flex">
              <Input 
                placeholder="Введите сообщение..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-grow"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage} className="ml-2">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Заметки</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea 
                className="w-full h-40 p-2 border rounded"
                placeholder="Записи для Мастера..."
              ></textarea>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Dialog open={isAddingPlayer} onOpenChange={setIsAddingPlayer}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Добавить игрока</DialogTitle>
            <DialogDescription>
              Добавьте нового игрока в сессию
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Имя игрока</Label>
              <Input 
                id="name" 
                value={newPlayerName} 
                onChange={(e) => setNewPlayerName(e.target.value)} 
                placeholder="Введите имя игрока"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingPlayer(false)}>Отмена</Button>
            <Button onClick={handleAddPlayer}>Добавить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DMSessionPage;
