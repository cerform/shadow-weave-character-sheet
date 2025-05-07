
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MobileOptimizedLayout from '@/components/layout/MobileOptimizedLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { io, Socket } from 'socket.io-client';
import { Users, Copy, ArrowRight, Share2 } from 'lucide-react';

// URI сервера - обычно нужно бы вынести в .env файл
const SERVER_URI = 'http://localhost:3001';

const DMSessionManager = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentUser } = useAuth();
  
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [players, setPlayers] = useState<any[]>([]);
  const [roomCode, setRoomCode] = useState<string | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<{nickname: string, message: string}[]>([]);
  const [dmNickname, setDmNickname] = useState('Мастер');
  const [isConnecting, setIsConnecting] = useState(false);

  // Инициализация сокета при монтировании компонента
  useEffect(() => {
    if (!currentUser) {
      toast({
        title: 'Требуется авторизация',
        description: 'Чтобы создать сессию, необходимо авторизоваться',
        variant: 'destructive'
      });
      navigate('/');
      return;
    }

    // Сохраняем имя мастера из аккаунта, если оно есть
    if (currentUser.displayName) {
      setDmNickname(currentUser.displayName);
    }

    return () => {
      // Отключение сокета при размонтировании
      if (socket) {
        socket.disconnect();
      }
    };
  }, [currentUser, navigate, toast]);
  
  // Слушатели событий сокета
  useEffect(() => {
    if (!socket) return;

    socket.on('updatePlayers', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on('chatMessage', (data) => {
      setChatMessages((prev) => [...prev, data]);
    });

    socket.on('diceResult', (data) => {
      const message = `${data.nickname} бросает ${data.diceType}: выпало ${data.result}`;
      setChatMessages((prev) => [...prev, { nickname: 'Система', message }]);
    });

    return () => {
      socket.off('updatePlayers');
      socket.off('chatMessage');
      socket.off('diceResult');
    };
  }, [socket]);

  const createSession = () => {
    if (!sessionName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название сессии',
        variant: 'destructive'
      });
      return;
    }
    
    setIsConnecting(true);
    
    const newSocket = io(SERVER_URI);
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      newSocket.emit('createRoom', dmNickname, (response: { roomCode: string }) => {
        setRoomCode(response.roomCode);
        setIsConnecting(false);
        
        toast({
          title: 'Сессия создана',
          description: `Код комнаты: ${response.roomCode}`,
        });
      });
    });
    
    newSocket.on('connect_error', () => {
      toast({
        title: 'Ошибка подключения',
        description: 'Не удалось подключиться к серверу',
        variant: 'destructive'
      });
      setIsConnecting(false);
    });
  };

  const sendMessage = () => {
    if (!message.trim() || !socket || !roomCode) return;
    
    socket.emit('chatMessage', {
      roomCode,
      nickname: dmNickname,
      message
    });
    
    setMessage('');
  };
  
  const rollDice = (diceType: string) => {
    if (!socket || !roomCode) return;
    
    socket.emit('rollDice', {
      roomCode,
      nickname: dmNickname,
      diceType
    });
  };
  
  const copyRoomCode = () => {
    if (!roomCode) return;
    
    navigator.clipboard.writeText(roomCode)
      .then(() => {
        toast({
          title: 'Скопировано',
          description: 'Код комнаты скопирован в буфер обмена',
        });
      })
      .catch(() => {
        toast({
          title: 'Ошибка',
          description: 'Не удалось скопировать код комнаты',
          variant: 'destructive'
        });
      });
  };
  
  const shareInvite = () => {
    if (!roomCode) return;
    
    const inviteUrl = `${window.location.origin}/join-game?code=${roomCode}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Приглашение в D&D сессию: ${sessionName}`,
        text: `Присоединяйтесь к моей D&D сессии! Код комнаты: ${roomCode}`,
        url: inviteUrl,
      })
      .catch((error) => {
        toast({
          title: 'Ошибка',
          description: 'Не удалось поделиться ссылкой',
          variant: 'destructive'
        });
      });
    } else {
      navigator.clipboard.writeText(inviteUrl)
        .then(() => {
          toast({
            title: 'Скопировано',
            description: 'Ссылка-приглашение скопирована в буфер обмена',
          });
        })
        .catch(() => {
          toast({
            title: 'Ошибка',
            description: 'Не удалось скопировать ссылку-приглашение',
            variant: 'destructive'
          });
        });
    }
  };

  // Компонент создания сессии, если комната еще не создана
  const renderSessionCreator = () => (
    <Card className="w-full bg-black/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Создание новой игровой сессии</CardTitle>
        <CardDescription>
          Укажите свой никнейм и название сессии, затем создайте комнату для ваших игроков
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="dmNickname">Ваш никнейм</Label>
          <Input
            id="dmNickname"
            value={dmNickname}
            onChange={(e) => setDmNickname(e.target.value)}
            placeholder="Мастер Подземелий"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="sessionName">Название сессии</Label>
          <Input
            id="sessionName"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
            placeholder="Опасное приключение"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="sessionDescription">Описание (опционально)</Label>
          <Textarea
            id="sessionDescription"
            value={sessionDescription}
            onChange={(e) => setSessionDescription(e.target.value)}
            placeholder="Введите описание вашей игровой сессии"
            className="mt-1"
            rows={3}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => navigate('/')}>
          Отмена
        </Button>
        <Button 
          onClick={createSession}
          disabled={isConnecting || !sessionName.trim()}
        >
          {isConnecting ? "Создание..." : "Создать сессию"}
        </Button>
      </CardFooter>
    </Card>
  );
  
  // Компонент управления активной сессией
  const renderActiveSession = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2">
        <Card className="w-full h-full bg-black/30 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle>{sessionName || "Игровая сессия"}</CardTitle>
              <div className="flex items-center space-x-2">
                <div className="bg-primary/20 rounded px-2 py-1 text-sm font-mono">
                  {roomCode}
                </div>
                <Button size="icon" variant="ghost" onClick={copyRoomCode}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="ghost" onClick={shareInvite}>
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardDescription>
              {sessionDescription || "Управление игровой сессией"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Игроки в сессии ({players.length})</h3>
                <div className="border rounded-md p-3 bg-black/20">
                  {players.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Пока никто не присоединился</p>
                  ) : (
                    <ul className="space-y-1">
                      {players.map((player, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm">
                          <Users className="h-3.5 w-3.5" />
                          <span>{player.nickname}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Броски костей</h3>
                <div className="flex flex-wrap gap-2">
                  {["d4", "d6", "d8", "d10", "d12", "d20", "d100"].map((dice) => (
                    <Button key={dice} size="sm" variant="outline" onClick={() => rollDice(dice)}>
                      {dice}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => navigate(`/battle-scene?room=${roomCode}`)}
            >
              Перейти к карте боя
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <div>
        <Card className="w-full h-full flex flex-col bg-black/30 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Чат сессии</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow overflow-hidden p-0">
            <div className="h-[300px] overflow-y-auto p-4 space-y-2">
              {chatMessages.length === 0 ? (
                <p className="text-sm text-muted-foreground">Нет сообщений</p>
              ) : (
                chatMessages.map((msg, index) => (
                  <div key={index} className="bg-black/10 rounded-lg p-2">
                    <div className="text-xs text-primary font-medium">{msg.nickname}</div>
                    <div className="text-sm">{msg.message}</div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
          <div className="p-3 border-t">
            <div className="flex space-x-2">
              <Input 
                value={message} 
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Сообщение..." 
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              />
              <Button onClick={sendMessage} disabled={!message.trim()}>
                Отправить
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
  
  return (
    <MobileOptimizedLayout 
      title={roomCode ? `Сессия: ${roomCode}` : "Создание игровой сессии"} 
      withBottomPadding={true}
    >
      {roomCode ? renderActiveSession() : renderSessionCreator()}
    </MobileOptimizedLayout>
  );
};

export default DMSessionManager;
