
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { 
  getSessionById, 
  subscribeToSession, 
  removeParticipant 
} from '@/services/sessionService';
import { Session, Participant } from '@/types/session';
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
import {
  ArrowLeft,
  Copy,
  RefreshCw,
  UserMinus,
  Send,
  Clock
} from "lucide-react";

const DMSessionPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Array<{ 
    id: string;
    sender: string;
    text: string;
    timestamp: Date;
    isMaster: boolean;
  }>>([]);
  const [notes, setNotes] = useState('');
  const [isRefreshingKey, setIsRefreshingKey] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setError('Идентификатор сессии не указан');
      return;
    }
    
    const loadSession = async () => {
      try {
        setLoading(true);
        const sessionData = await getSessionById(sessionId);
        
        if (!sessionData) {
          setError('Сессия не найдена');
          return;
        }
        
        // Проверяем, является ли пользователь мастером этой сессии
        if (sessionData.hostId !== user?.uid) {
          setError('У вас нет доступа к этой сессии в качестве Мастера');
          return;
        }
        
        setSession(sessionData);
      } catch (err) {
        console.error('Ошибка при загрузке сессии:', err);
        setError('Не удалось загрузить данные сессии');
      } finally {
        setLoading(false);
      }
    };

    loadSession();
    
    // Подписываемся на обновления сессии в реальном времени
    if (sessionId) {
      const unsubscribe = subscribeToSession(sessionId, (updatedSession) => {
        setSession(updatedSession);
      });
      
      return () => {
        unsubscribe();
      };
    }
  }, [sessionId, user]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success('Скопировано в буфер обмена');
      },
      (err) => {
        console.error('Не удалось скопировать: ', err);
        toast.error('Не удалось скопировать');
      }
    );
  };

  const generateInviteLink = () => {
    if (!session) return '';
    return `${window.location.origin}/join/${session.id}?key=${session.sessionKey}`;
  };

  const refreshSessionKey = async () => {
    try {
      setIsRefreshingKey(true);
      // Здесь будет функция обновления ключа сессии
      toast.success('Код сессии обновлен');
    } catch (err) {
      console.error('Ошибка при обновлении кода сессии:', err);
      toast.error('Не удалось обновить код сессии');
    } finally {
      setIsRefreshingKey(false);
    }
  };

  const handleRemoveParticipant = async (userId: string) => {
    if (!session) return;
    
    try {
      await removeParticipant(session.id, userId);
      toast.success('Игрок удален из сессии');
    } catch (err) {
      console.error('Ошибка при удалении игрока:', err);
      toast.error('Не удалось удалить игрока');
    }
  };

  const handleEndSession = async () => {
    if (!session) return;
    
    try {
      // Здесь была бы функция завершения сессии
      navigate('/dm-dashboard');
      toast.success('Сессия завершена');
    } catch (err) {
      console.error('Ошибка при завершении сессии:', err);
      toast.error('Не удалось завершить сессию');
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !user) return;
    
    const newMessage = {
      id: Date.now().toString(),
      sender: user.displayName || 'Мастер',
      text: messageInput,
      timestamp: new Date(),
      isMaster: true
    };
    
    setMessages([...messages, newMessage]);
    setMessageInput('');
    
    // В реальном приложении здесь был бы код для отправки сообщения через сокеты
  };

  const handleSaveNotes = () => {
    // Здесь будет функция сохранения заметок
    toast.success('Заметки сохранены');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-black/50 backdrop-blur-sm">
          <CardContent className="py-12 flex justify-center">
            <p>Загрузка сессии...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="container mx-auto p-6">
        <Card className="bg-black/50 backdrop-blur-sm">
          <CardContent className="py-12">
            <h2 className="text-xl font-bold mb-4 text-center">Ошибка</h2>
            <p className="text-center mb-6">{error || 'Не удалось загрузить сессию'}</p>
            <div className="flex justify-center">
              <Button onClick={() => navigate('/dm-dashboard')}>Назад</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-6 px-4">
      <div className="flex justify-between items-center mb-6 bg-slate-800/80 p-4 rounded-lg">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/dm-dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Назад
          </Button>
          <h1 className="text-3xl font-bold">{session.name}</h1>
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Основная колонка */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-800/60 border-slate-700">
            <CardHeader>
              <CardTitle>Информация о сессии</CardTitle>
              <CardDescription>Настройки и управление сессией</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Код сессии</h3>
                <div className="flex items-center gap-2">
                  <div className="bg-black/20 px-4 py-2 rounded font-mono flex-1 text-center text-xl">
                    {session.sessionKey}
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => copyToClipboard(session.sessionKey)}
                    title="Копировать код"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={refreshSessionKey}
                    disabled={isRefreshingKey}
                    title="Обновить код"
                  >
                    <RefreshCw className={`h-4 w-4 ${isRefreshingKey ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Ссылка для приглашения</h3>
                <div className="flex items-center gap-2">
                  <div className="bg-black/20 px-4 py-2 rounded font-mono text-xs flex-1 overflow-x-auto whitespace-nowrap">
                    {generateInviteLink()}
                  </div>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => copyToClipboard(generateInviteLink())}
                    title="Копировать ссылку"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Участники сессии</h3>
                <div className="bg-black/20 rounded overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Персонаж</TableHead>
                        <TableHead>Игрок</TableHead>
                        <TableHead>Присоединился</TableHead>
                        <TableHead className="text-right">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {session.participants.length > 0 ? (
                        session.participants.map((participant) => (
                          <TableRow key={participant.userId}>
                            <TableCell className="font-medium">{participant.characterName}</TableCell>
                            <TableCell>Игрок</TableCell>
                            <TableCell>
                              {new Date(participant.joinedAt).toLocaleTimeString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => handleRemoveParticipant(participant.userId)}
                                title="Удалить игрока"
                              >
                                <UserMinus className="h-4 w-4 text-red-500" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-6">
                            В сессии пока нет игроков
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-lg font-medium">Панель управления игрой</h3>
                <div className="flex flex-wrap gap-3">
                  <Button onClick={() => navigate(`/session/${session.id}`)}>
                    Присоединиться к сессии
                  </Button>
                  <Button onClick={() => navigate(`/battle/${session.id}`)}>
                    Карта боя
                  </Button>
                  <Button>Генератор событий</Button>
                  <Button>Бестиарий</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Правая колонка */}
        <div className="space-y-6">
          {/* Чат */}
          <Card className="bg-slate-800/60 border-slate-700 h-[400px] flex flex-col">
            <CardHeader>
              <CardTitle>Чат сессии</CardTitle>
              <CardDescription>Общение с игроками</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow overflow-y-auto p-4 flex flex-col">
              {messages.length === 0 ? (
                <div className="flex-grow flex items-center justify-center text-gray-400">
                  Сообщений пока нет
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map(msg => (
                    <div 
                      key={msg.id} 
                      className={`p-3 rounded-lg ${msg.isMaster ? 'bg-amber-100/10 text-amber-200' : 'bg-blue-100/10 text-blue-200'}`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`font-bold ${msg.isMaster ? 'text-amber-400' : 'text-blue-400'}`}>
                          {msg.sender} {msg.isMaster ? '(Мастер)' : ''}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            <div className="p-4 border-t border-slate-700 flex">
              <Input 
                placeholder="Введите сообщение..." 
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="flex-grow bg-slate-700/60 border-slate-600"
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button 
                className="ml-2" 
                onClick={handleSendMessage}
                disabled={!messageInput.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
          
          {/* Заметки */}
          <Card className="bg-slate-800/60 border-slate-700">
            <CardHeader>
              <CardTitle>Заметки Мастера</CardTitle>
              <CardDescription>Личные записи для ведения игры</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea 
                className="w-full h-40 p-3 bg-slate-700/60 border border-slate-600 rounded-md resize-none"
                placeholder="Заметки для Мастера..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Button onClick={handleSaveNotes}>Сохранить заметки</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DMSessionPage;
