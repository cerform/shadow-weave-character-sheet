import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { realtimeManager } from '@/services/RealtimeService';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Send,
  Clock,
  UserPlus,
  Play,
  Shield,
  Sword,
  Trash2
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

interface BattleToken {
  id: string;
  name: string;
  token_type: string;
  current_hp: number;
  max_hp: number;
  armor_class: number;
}

interface InitiativeEntry {
  id: string;
  character_name: string;
  initiative_roll: number;
  is_current_turn: boolean;
  token_id?: string;
}

const DMSessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [currentSession, setCurrentSession] = useState<any | null>(null);
  const [players, setPlayers] = useState<SessionPlayer[]>([]);
  const [tokens, setTokens] = useState<BattleToken[]>([]);
  const [initiative, setInitiative] = useState<InitiativeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const { toast } = useToast();

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

        if (session.dm_id !== user?.id) {
          toast({ title: 'Доступ запрещен', description: 'У вас нет прав для управления этой сессией', variant: 'destructive' });
          navigate('/dm');
          return;
        }

        setCurrentSession(session);

        // Загрузка участников
        const { data: sessionPlayers } = await supabase
          .from('session_players')
          .select('*')
          .eq('session_id', sessionId)
          .order('joined_at');
        if (sessionPlayers) setPlayers(sessionPlayers as SessionPlayer[]);

        // Загрузка сообщений чата (последние 50)
        const { data: chatMessages } = await supabase
          .from('session_messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true })
          .limit(50);
        if (chatMessages) setMessages(chatMessages as SessionMessage[]);

        // Загрузка токенов
        const { data: battleTokens } = await supabase
          .from('battle_tokens')
          .select('*')
          .eq('session_id', sessionId);
        if (battleTokens) setTokens(battleTokens as BattleToken[]);

        // Загрузка инициативы
        const { data: initData } = await supabase
          .from('initiative_tracker')
          .select('*')
          .eq('session_id', sessionId)
          .order('initiative_roll', { ascending: false });
        if (initData) setInitiative(initData as InitiativeEntry[]);

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

  // Realtime подписки
  useEffect(() => {
    if (!sessionId || !user?.id) return;

    // Heartbeat статуса DM
    const updateDMStatus = () =>
      supabase.from('game_sessions').update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId).eq('dm_id', user.id);

    updateDMStatus();
    const heartbeatInterval = setInterval(updateDMStatus, 30000);

    realtimeManager.connectSession(sessionId).catch(console.error);

    const unsubPlayers = realtimeManager.onPgChange(sessionId, 'session_players', '*', async () => {
      const { data } = await supabase.from('session_players').select('*').eq('session_id', sessionId).order('joined_at');
      if (data) setPlayers(data as SessionPlayer[]);
    });

    const unsubMessages = realtimeManager.onPgChange(sessionId, 'session_messages', 'INSERT', (payload) => {
      setMessages(prev => [...prev, payload.new as SessionMessage].slice(-100));
    });

    const unsubTokens = realtimeManager.onPgChange(sessionId, 'battle_tokens', '*', async () => {
      const { data } = await supabase.from('battle_tokens').select('*').eq('session_id', sessionId);
      if (data) setTokens(data as BattleToken[]);
    });

    const unsubInit = realtimeManager.onPgChange(sessionId, 'initiative_tracker', '*', async () => {
      const { data } = await supabase.from('initiative_tracker').select('*').eq('session_id', sessionId).order('initiative_roll', { ascending: false });
      if (data) setInitiative(data as InitiativeEntry[]);
    });

    return () => {
      clearInterval(heartbeatInterval);
      unsubPlayers();
      unsubMessages();
      unsubTokens();
      unsubInit();
    };
  }, [sessionId, user?.id]);

  const handleEndSession = async () => {
    if (!sessionId || !currentSession) return;
    try {
      const { error } = await supabase.from('game_sessions').update({ is_active: false, ended_at: new Date().toISOString() })
        .eq('id', sessionId).eq('dm_id', user!.id);
      if (error) throw error;
      navigate('/dm');
      toast({ title: 'Сессия завершена' });
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  const handleRemovePlayer = async (playerId: string) => {
    try {
      const { error } = await supabase.from('session_players').delete().eq('id', playerId);
      if (error) throw error;
      toast({ title: 'Игрок удален' });
    } catch (error) {
      toast({ title: 'Ошибка', variant: 'destructive' });
    }
  };

  const handleCopyInviteLink = () => {
    if (!currentSession?.session_code) return;
    const url = `${window.location.origin}/join?code=${currentSession.session_code}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Ссылка скопирована', description: 'Отправьте её игрокам' });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !sessionId || !user) return;
    const content = message.trim();
    setMessage('');
    setIsSending(true);
    try {
      await supabase.from('session_messages').insert({
        session_id: sessionId,
        user_id: user.id,
        sender_name: user.user_metadata?.full_name || 'DM',
        message_type: 'chat',
        content,
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleAddToken = async (type: string, name: string) => {
    if (!sessionId) return;
    const hp = type === 'monster' ? 30 : 150;
    await supabase.from('battle_tokens').insert({
      session_id: sessionId,
      name,
      token_type: type,
      current_hp: hp,
      max_hp: hp,
      armor_class: 12,
      position_x: 100,
      position_y: 100
    });
  };

  const handleUpdateHP = async (id: string, current: number, change: number) => {
    await supabase.from('battle_tokens').update({ current_hp: Math.max(0, current + change) }).eq('id', id);
  };

  const handleDeleteToken = async (id: string) => {
    await supabase.from('battle_tokens').delete().eq('id', id);
  };

  const handleRollInitiative = async () => {
    if (!sessionId || tokens.length === 0) return;
    await supabase.from('initiative_tracker').delete().eq('session_id', sessionId);
    const inits = tokens.map((t, idx) => ({
      session_id: sessionId,
      character_name: t.name,
      token_id: t.id,
      initiative_roll: Math.floor(Math.random() * 20) + 1,
      turn_order: idx,
      is_current_turn: idx === 0
    }));
    await supabase.from('initiative_tracker').insert(inits);
  };

  if (loading) return <div className="p-8 text-white">Загрузка...</div>;
  if (!currentSession) return <div className="p-8 text-white">Сессия не найдена</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/dm')} className="text-slate-400 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Панель
            </Button>
            <div>
              <h1 className="text-2xl font-bold">{currentSession.name}</h1>
              <p className="text-sm text-slate-500">Код: {currentSession.session_code}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyInviteLink}>
              <UserPlus className="h-4 w-4 mr-2" />
              Пригласить
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">Завершить</Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-slate-900 border-slate-800 text-white">
                <AlertDialogHeader>
                  <AlertDialogTitle>Завершить сессию?</AlertDialogTitle>
                  <AlertDialogDescription className="text-slate-400"> Это сделает сессию неактивной для всех игроков.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-slate-800 text-white">Отмена</AlertDialogCancel>
                  <AlertDialogAction onClick={handleEndSession} className="bg-red-600 hover:bg-red-700">Завершить</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Players Table */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Участники ({players.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800">
                      <TableHead className="text-slate-400">Игрок</TableHead>
                      <TableHead className="text-slate-400">Статус</TableHead>
                      <TableHead className="text-slate-400 text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {players.map((p) => (
                      <TableRow key={p.id} className="border-slate-800">
                        <TableCell className="font-medium text-white">{p.player_name}</TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs ${p.is_online ? 'bg-green-500/10 text-green-500' : 'bg-slate-800 text-slate-500'}`}>
                            {p.is_online ? 'В игре' : 'Не в сети'}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleRemovePlayer(p.id)} className="text-slate-500 hover:text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {players.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center py-8 text-slate-500 text-sm">Пока никто не присоединился</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Combat Controls */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-lg">Боевое управление</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Button onClick={() => navigate(`/dm/battle-map/${sessionId}`)} className="bg-indigo-600 hover:bg-indigo-700">
                    <Sword className="h-4 w-4 mr-2" />
                    Карта VTT
                  </Button>
                  <Button variant="outline" onClick={() => handleAddToken('monster', 'Гоблин')} className="border-slate-700 text-slate-300">
                    + Монстр
                  </Button>
                  <Button variant="outline" onClick={handleRollInitiative} className="border-slate-700 text-slate-300">
                    Бросить инициативу
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                    <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Инициатива</h3>
                    <div className="space-y-2">
                      {initiative.map((i) => (
                        <div key={i.id} className={`flex justify-between items-center p-2 rounded ${i.is_current_turn ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-900/50 text-slate-400 border border-slate-800'}`}>
                          <span className="text-xs font-semibold">{i.character_name}</span>
                          <span className="text-xs">🎲 {i.initiative_roll}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
                    <h3 className="text-sm font-bold text-slate-400 mb-3 uppercase tracking-wider">Токены</h3>
                    <div className="space-y-2">
                      {tokens.map((t) => (
                        <div key={t.id} className="flex justify-between items-center p-2 bg-slate-900/50 border border-slate-800 rounded group">
                          <span className="text-xs text-white truncate w-1/3">{t.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500">{t.current_hp}/{t.max_hp} HP</span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button size="icon" className="h-5 w-5 bg-red-900/40" onClick={() => handleUpdateHP(t.id, t.current_hp, -5)}>-5</Button>
                              <Button size="icon" className="h-5 w-5 bg-green-900/40" onClick={() => handleUpdateHP(t.id, t.current_hp, 5)}>+5</Button>
                              <Button size="icon" className="h-5 w-5 bg-slate-800" onClick={() => handleDeleteToken(t.id)}><Trash2 className="h-3 w-3" /></Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Chat & Notes */}
          <div className="space-y-8">
            <Card className="bg-slate-900 border-slate-800 h-[600px] flex flex-col">
              <CardHeader className="border-b border-slate-800 p-4">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Play className="h-4 w-4 text-blue-400" />
                  Чат игры
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.map((m) => {
                  const isDM = m.user_id === user?.id;
                  return (
                    <div key={m.id} className={`flex flex-col ${isDM ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{m.sender_name}</span>
                        <span className="text-[9px] text-slate-600">{new Date(m.created_at).toLocaleTimeString()}</span>
                      </div>
                      <div className={`max-w-[90%] p-3 rounded-2xl text-sm ${isDM ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-800 text-slate-100 rounded-tl-none'}`}>
                        {m.content}
                      </div>
                    </div>
                  );
                })}
              </CardContent>
              <div className="p-4 border-t border-slate-800 bg-slate-900/50">
                <div className="flex gap-2">
                  <Input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Ваше сообщение..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="bg-black/20 border-slate-700 text-white"
                  />
                  <Button size="icon" onClick={handleSendMessage} disabled={isSending} className="bg-blue-600 hover:bg-blue-700">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white text-sm uppercase tracking-widest opacity-50">Блокнот мастера</CardTitle>
              </CardHeader>
              <CardContent>
                <textarea
                  className="w-full h-40 bg-black/20 border border-slate-800 rounded-lg p-3 text-sm text-slate-300 focus:outline-none focus:border-slate-600 transition resize-none"
                  placeholder="Запишите здесь важные детали текущей сцены..."
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DMSessionPage;
