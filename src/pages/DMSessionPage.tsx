
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { socketService } from '@/services/socket';
import DiceRoller from '@/components/session/DiceRoller';
import SessionChat from '@/components/session/SessionChat';
import SessionEventLog from '@/components/session/SessionEventLog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import useSessionStore from '@/stores/sessionStore';
import { Session } from '@/types/session';
import { useAuth } from '@/hooks/use-auth';
import { v4 as uuidv4 } from 'uuid';
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Send,
  Clock,
  UserPlus,
  Download,
  Copy,
  MessageSquare,
  Book,
  Dice,
  PlusCircle,
  Sword,
  Wand
} from "lucide-react";
import { EventLogEntry } from '@/components/session/SessionEventLog';

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
  const sessionStore = useSessionStore();
  const { sessions, fetchSessions, endSession } = sessionStore;
  const { currentUser } = useAuth(); // Используем currentUser из useAuth вместо sessionStore
  const { isAuthenticated } = useAuth();
  const [currentSession, setCurrentSession] = useState<any | null>(null);
  const [isAddingPlayer, setIsAddingPlayer] = useState(false);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [isEndingSession, setIsEndingSession] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [eventLog, setEventLog] = useState<EventLogEntry[]>([]);
  const [diceRollResult, setDiceRollResult] = useState<{formula: string, result: number} | null>(null);
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [notes, setNotes] = useState('');
  const [activeTab, setActiveTab] = useState('chat');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth');
      return;
    }
    
    const loadSession = async () => {
      await fetchSessions();
    };
    
    loadSession();
  }, [isAuthenticated, navigate, fetchSessions]);

  // Select the current session when sessions load or ID changes
  useEffect(() => {
    if (sessions && sessionId) {
      const session = sessions.find(s => s.id === sessionId);
      
      if (session) {
        setCurrentSession(session);
        // Инициализация журнала событий с системным сообщением о начале сессии
        setEventLog([
          {
            id: uuidv4(),
            type: 'system',
            message: `Сессия "${session.name}" запущена.`,
            timestamp: new Date().toISOString()
          }
        ]);
      } else {
        // Session not found, navigate back
        navigate('/dm');
        toast({
          title: "Сессия не найдена",
          variant: "destructive"
        });
      }
    }
  }, [sessions, sessionId, navigate, toast]);

  // Добавляем запись в журнал событий при броске кубика
  useEffect(() => {
    if (diceRollResult) {
      addEventLogEntry({
        type: 'dice',
        message: `Мастер бросил ${diceRollResult.formula}: ${diceRollResult.result}`,
      });
    }
  }, [diceRollResult]);

  // Метод для добавления записи в журнал событий
  const addEventLogEntry = (entry: Omit<EventLogEntry, 'id' | 'timestamp'>) => {
    const newEntry: EventLogEntry = {
      id: uuidv4(),
      ...entry,
      timestamp: new Date().toISOString()
    };
    
    setEventLog(prev => [...prev, newEntry]);
    return newEntry;
  };

  const handleEndSession = () => {
    if (sessionId && endSession) {
      // Добавляем запись в журнал о завершении сессии
      addEventLogEntry({
        type: 'system',
        message: "Сессия завершена мастером.",
      });
      
      endSession(sessionId);
      navigate('/dm');
      toast({
        title: "Сессия успешно завершена",
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
    
    // Добавляем запись о подключении игрока
    addEventLogEntry({
      type: 'player',
      message: `Игрок ${newPlayerName} присоединился к сессии.`,
    });
    
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
      sender: currentUser?.displayName || 'DM', // Use displayName instead of name
      content: message,
      timestamp: new Date().toISOString(),
      isDM: true
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    // Добавляем запись в журнал событий о сообщении от мастера
    addEventLogEntry({
      type: 'dm',
      message: `${currentUser?.displayName || 'Мастер'}: "${message}"`,
    });
    
    setMessage('');
    
    // In a real app, you'd send this via socket
  };

  const handleDiceRoll = (formula: string) => {
    // Простая имитация броска кубика
    const match = formula.match(/(\d+)d(\d+)([+-]\d+)?/);
    if (!match) return;
    
    const numDice = parseInt(match[1], 10);
    const sides = parseInt(match[2], 10);
    const modifier = match[3] ? parseInt(match[3], 10) : 0;
    
    let total = 0;
    for (let i = 0; i < numDice; i++) {
      total += Math.floor(Math.random() * sides) + 1;
    }
    total += modifier;
    
    setDiceRollResult({ formula, result: total });
    
    return total;
  };

  const handleClearLog = () => {
    if (confirm("Вы уверены, что хотите очистить журнал событий?")) {
      setEventLog([{
        id: uuidv4(),
        type: 'system',
        message: "Журнал событий очищен.",
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const handleExportLog = () => {
    // Создаем текст для экспорта журнала
    const logText = eventLog.map(entry => {
      const date = new Date(entry.timestamp);
      return `[${date.toLocaleTimeString()}] [${entry.type.toUpperCase()}] ${entry.message}`;
    }).join('\n');
    
    // Создаем и скачиваем файл
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-log-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Журнал экспортирован",
      description: "Файл журнала событий сохранен на ваш компьютер"
    });
  };

  const copySessionCode = () => {
    if (currentSession?.code) {
      navigator.clipboard.writeText(currentSession.code);
      toast({
        title: "Код скопирован",
        description: "Код сессии скопирован в буфер обмена"
      });
    }
  };

  const handleQuickEvent = () => {
    const events = [
      "Внезапно начинается сильный дождь.",
      "Вдалеке слышен странный шум.",
      "Из тени выходит загадочная фигура.",
      "На небе появляется странное свечение.",
      "Земля слегка дрожит под ногами.",
      "В воздухе ощущается запах дыма.",
      "Слышится отдаленный рев какого-то существа.",
      "Налетает внезапный порыв сильного ветра."
    ];
    
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    
    // Добавляем событие в журнал
    addEventLogEntry({
      type: 'dm',
      message: `Событие: ${randomEvent}`,
    });
    
    // Добавляем сообщение в чат от мастера
    const newMessage = {
      id: Date.now().toString(),
      sender: currentUser?.displayName || 'Мастер',
      content: randomEvent,
      timestamp: new Date().toISOString(),
      isDM: true
    };
    
    setMessages(prev => [...prev, newMessage]);
    
    toast({
      title: "Случайное событие",
      description: randomEvent
    });
  };

  if (!currentSession) {
    return (
      <div className="container p-6">
        <h1>Загрузка сессии...</h1>
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
          <div 
            className="px-2 py-1 rounded bg-green-100 text-green-800 text-sm flex items-center cursor-pointer hover:bg-green-200" 
            onClick={copySessionCode}
            title="Нажмите, чтобы скопировать"
          >
            Код: {currentSession.code}
            <Copy className="ml-1 h-3 w-3" />
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
                    {currentSession.players && currentSession.players.length > 0 ? (
                      currentSession.players.map((player: Player) => (
                        <TableRow key={player.id}>
                          <TableCell className="font-medium">{player.name}</TableCell>
                          <TableCell>
                            {player.character ? player.character.name : 'Не выбран'}
                          </TableCell>
                          <TableCell>
                            <div className={`w-3 h-3 rounded-full ${player.connected ? 'bg-green-500' : 'bg-red-500'} mr-2 inline-block`}></div>
                            {player.connected ? 'Онлайн' : 'Оффлайн'}
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
              <CardTitle>Инструменты Мастера</CardTitle>
              <CardDescription>Полезные инструменты для проведения сессии</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <Button onClick={() => navigate(`/battle/${sessionId}`)} className="flex items-center">
                <Sword className="mr-2 h-4 w-4" />
                Карта боя
              </Button>
              
              <Button onClick={handleQuickEvent} className="flex items-center">
                <Wand className="mr-2 h-4 w-4" />
                Случайное событие
              </Button>
              
              <Button className="flex items-center">
                <Dice className="mr-2 h-4 w-4" />
                Генератор имен
              </Button>
              
              <Button className="flex items-center">
                <PlusCircle className="mr-2 h-4 w-4" />
                Бросок для всех
              </Button>
            </CardContent>
          </Card>
          
          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Заметки сессии</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="min-h-[150px]"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Записи для Мастера..."
                />
              </CardContent>
              <CardFooter>
                <Button onClick={() => {
                  localStorage.setItem(`session_notes_${sessionId}`, notes);
                  toast({
                    title: "Заметки сохранены",
                    description: "Ваши заметки были сохранены локально"
                  });
                }}>
                  Сохранить заметки
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-2">
                  <TabsTrigger value="chat" className="flex items-center">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Чат
                  </TabsTrigger>
                  <TabsTrigger value="log" className="flex items-center">
                    <Book className="h-4 w-4 mr-2" />
                    Журнал
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="p-0">
              <TabsContent value="chat" className="m-0">
                <div className="h-[400px]">
                  <SessionChat 
                    messages={messages.map(m => ({ 
                      sender: m.sender,
                      text: m.content,
                      timestamp: m.timestamp 
                    }))}
                    onSendMessage={handleSendMessage}
                    sessionCode={currentSession.code}
                    playerName={currentUser?.displayName || 'DM'}
                  />
                </div>
              </TabsContent>
              <TabsContent value="log" className="m-0">
                <div className="h-[400px]">
                  <SessionEventLog 
                    entries={eventLog}
                    onClearLog={handleClearLog}
                    onExportLog={handleExportLog}
                  />
                </div>
              </TabsContent>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Dice className="h-4 w-4 mr-2" />
                Бросок кубиков
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" onClick={() => handleDiceRoll('1d20')}>
                  D20
                </Button>
                <Button variant="outline" onClick={() => handleDiceRoll('1d12')}>
                  D12
                </Button>
                <Button variant="outline" onClick={() => handleDiceRoll('1d10')}>
                  D10
                </Button>
                <Button variant="outline" onClick={() => handleDiceRoll('1d8')}>
                  D8
                </Button>
                <Button variant="outline" onClick={() => handleDiceRoll('1d6')}>
                  D6
                </Button>
                <Button variant="outline" onClick={() => handleDiceRoll('1d4')}>
                  D4
                </Button>
              </div>
              
              {diceRollResult && (
                <div className="mt-4 p-3 bg-muted rounded-md text-center">
                  <div className="text-sm text-muted-foreground mb-1">Результат броска {diceRollResult.formula}</div>
                  <div className="text-2xl font-bold">{diceRollResult.result}</div>
                </div>
              )}
              
              <div className="mt-4">
                <Label htmlFor="custom-roll">Произвольный бросок</Label>
                <div className="flex gap-2 mt-1">
                  <Input 
                    id="custom-roll" 
                    placeholder="2d6+3" 
                    className="flex-grow"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = (e.target as HTMLInputElement).value;
                        handleDiceRoll(input);
                      }
                    }}
                  />
                  <Button onClick={() => {
                    const input = (document.getElementById('custom-roll') as HTMLInputElement).value;
                    handleDiceRoll(input);
                  }}>
                    Бросить
                  </Button>
                </div>
              </div>
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
      
      {/* Загружаем сохраненные заметки при монтировании компонента */}
      {useEffect(() => {
        const savedNotes = localStorage.getItem(`session_notes_${sessionId}`);
        if (savedNotes) {
          setNotes(savedNotes);
        }
      }, [sessionId])}
    </div>
  );
};

export default DMSessionPage;
