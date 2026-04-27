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

interface SessionMessage {
  id: string;
  sender_name: string;
  content: string;
  message_type: string;
  created_at: string;
  user_id: string;
}

interface SessionPlayer {
  id: string;
  player_name: string;
  character_id?: string;
  is_online: boolean;
  joined_at: string;
  user_id: string;
}

const DMSessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [currentSession, setCurrentSession] = useState<any | null>(null);
  const [players, setPlayers] = useState<SessionPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();

  // Загрузка сессии
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    const loadSession = async () => {
      if (!sessionId) { navigate('/dm'); return; }

      try {
        const { data: session, error: sessionError } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (sessionError || !session) {
          toast({ title: 'Сессия не найдена', variant: 'destructive' });
          navigate('/dm');
          return;
        }

        // ── Ownership guard ──────────────────────────────────────────────
        if (session.dm_id !== user?.id) {
          toast({ title: 'Доступ запрещен', description: 'У вас нет прав для просмотра этой сессии', variant: 'destructive' });
          navigate('/dm');
          return;
        }

        setCurrentSession(session);

        // Load players
        const { data: sessionPlayers, error: playersError } = await supabase
          .from('session_players')
          .select('*')
          .eq('session_id', sessionId)
          .order('joined_at');

        if (!playersError) setPlayers((sessionPlayers ?? []) as SessionPlayer[]);

        // Load last 50 chat messages
        const { data: chatMessages } = await supabase
          .from('session_messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true })
          .limit(50);

        if (chatMessages) setMessages(chatMessages as SessionMessage[]);

      } catch (error) {
        console.error('Error loading session:', error);
        toast({ title: 'Ошибка загрузки', description: 'Не удалось загрузить сессию', variant: 'destructive' });
        navigate('/dm');
      } finally {
        setLoading(false);
      }
    };

    loadSession();
  }, [isAuthenticated, navigate, sessionId, user?.id, toast]);

  // ── Realtime subscriptions ──────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId || !user?.id) return;

    // Heartbeat for DM presence
    const updateDMStatus = () =>
      supabase.from('game_sessions').update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId).eq('dm_id', user.id);

    updateDMStatus();
    const heartbeatInterval = setInterval(updateDMStatus, 30000);

    // Players channel
    const playersChannel = supabase
      .channel(`dm-session-players-${sessionId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'session_players', filter: `session_id=eq.${sessionId}` },
        async () => {
          const { data } = await supabase.from('session_players').select('*').eq('session_id', sessionId).order('joined_at');
          if (data) setPlayers(data as SessionPlayer[]);
        })
      .subscribe();

    // Chat messages channel — DM sees all incoming messages in realtime
    const messagesChannel = supabase
      .channel(`dm-session-messages-${sessionId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'session_messages', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          setMessages(prev => [...prev, payload.new as SessionMessage].slice(-100));
        })
      .subscribe();

    // Session update channel
    const sessionChannel = supabase
      .channel(`dm-game-session-${sessionId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'game_sessions', filter: `id=eq.${sessionId}` },
        (payload) => { setCurrentSession(payload.new); })
      .subscribe();

    return () => {
      clearInterval(heartbeatInterval);
      supabase.removeChannel(playersChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(sessionChannel);
    };
  }, [sessionId, user?.id]);

  const handleEndSession = async () => {
    if (!sessionId) return;
    // ── Ownership guard ──────────────────────────────────────────────────
    if (currentSession?.dm_id !== user?.id) {
      toast({ title: 'Доступ запрещен', variant: 'destructive' });
      return;
    }
    try {
      const { error } = await supabase
        .from('game_sessions')
        .update({ is_active: false, ended_at: new Date().toISOString() })
        .eq('id', sessionId)
        .eq('dm_id', user!.id); // double-check ownership at DB level
      if (error) throw error;
      navigate('/dm');
      toast({ title: 'Сессия успешно завершена' });
    } catch (error) {
      console.error('Error ending session:', error);
      toast({ title: 'Ошибка', description: 'Не удалось завершить сессию', variant: 'destructive' });
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    // ── Ownership guard ──────────────────────────────────────────────────
    if (currentSession?.dm_id !== user?.id) {
      toast({ title: 'Доступ запрещен', variant: 'destructive' });
      return;
    }
    try {
      const { error } = await supabase.from('session_players').delete().eq('id', playerId);
      if (error) throw error;
      toast({ title: 'Игрок удален', description: 'Игрок успешно удален из сессии' });
    } catch (error) {
      console.error('Error removing player:', error);
      toast({ title: 'Ошибка', description: 'Не удалось удалить игрока', variant: 'destructive' });
    }
  };

  // Copy session invite link to clipboard — the proper way to invite players
  const handleCopyInviteLink = () => {
    if (!currentSession?.session_code) return;
    const url = `${window.location.origin}/join?code=${currentSession.session_code}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Ссылка скопирована', description: url });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !sessionId || !user) return;
    const content = message.trim();
    setMessage('');
    setIsSending(true);
    try {
      const { error } = await supabase.from('session_messages').insert({
        session_id: sessionId,
        user_id: user.id,
        sender_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'DM',
        message_type: 'chat',
        content,
      });
      if (error) throw error;
    } catch (err) {
      console.error('Error sending message:', err);
      toast({ title: 'Ошибка отправки', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
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
                     {loading ? (
                       <TableRow>
                         <TableCell colSpan={4} className="text-center py-8">
                           <div className="flex items-center justify-center gap-2">
                             <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
                             <span>Загрузка участников...</span>
                           </div>
                         </TableCell>
                       </TableRow>
                     ) : players && players.length > 0 ? (
                        players.map((player: any) => (
                          <TableRow key={player.id}>
                            <TableCell className="font-medium">{player.player_name}</TableCell>
                            <TableCell>
                              {player.character_id ? 'Персонаж выбран' : 'Не выбран'}
                            </TableCell>
                            <TableCell>
                              <div className={`flex items-center gap-2`}>
                                <div className={`w-3 h-3 rounded-full ${player.is_online ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                {player.is_online ? 'Онлайн' : 'Оффлайн'}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleRemovePlayer(player.id)}
                              >
                                Удалить
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                     ) : (
                       <TableRow>
                         <TableCell colSpan={4} className="text-center py-8">
                           <div className="text-muted-foreground">
                             Нет игроков в сессии
                           </div>
                           <p className="text-sm mt-2">Поделитесь кодом сессии <strong>{currentSession.session_code}</strong> с игроками</p>
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
