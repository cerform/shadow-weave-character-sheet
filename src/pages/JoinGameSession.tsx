
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import MobileOptimizedLayout from '@/components/layout/MobileOptimizedLayout';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { io, Socket } from 'socket.io-client';

// URI сервера - обычно нужно бы вынести в .env файл
const SERVER_URI = 'http://localhost:3001';

const JoinGameSession = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [roomCode, setRoomCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [joined, setJoined] = useState(false);
  const [players, setPlayers] = useState<any[]>([]);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<{nickname: string, message: string}[]>([]);

  // Проверяем, есть ли код комнаты в URL параметрах
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const codeFromUrl = params.get('code');
    if (codeFromUrl) {
      setRoomCode(codeFromUrl);
    }
    
    // Загружаем никнейм из localStorage, если он есть
    const savedNickname = localStorage.getItem('player-nickname');
    if (savedNickname) {
      setNickname(savedNickname);
    }
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, [location]);
  
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

  const joinSession = () => {
    if (!roomCode.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите код комнаты',
        variant: 'destructive'
      });
      return;
    }

    if (!nickname.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите ваш никнейм',
        variant: 'destructive'
      });
      return;
    }
    
    setIsConnecting(true);
    
    const newSocket = io(SERVER_URI);
    setSocket(newSocket);
    
    newSocket.on('connect', () => {
      newSocket.emit('joinRoom', { roomCode, nickname }, (response: { success: boolean, message?: string }) => {
        setIsConnecting(false);
        
        if (response.success) {
          setJoined(true);
          localStorage.setItem('player-nickname', nickname);
          
          toast({
            title: 'Успешно!',
            description: 'Вы присоединились к игровой сессии',
          });
        } else {
          toast({
            title: 'Ошибка',
            description: response.message || 'Не удалось присоединиться к комнате',
            variant: 'destructive'
          });
        }
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
      nickname,
      message
    });
    
    setMessage('');
  };
  
  const rollDice = (diceType: string) => {
    if (!socket || !roomCode) return;
    
    socket.emit('rollDice', {
      roomCode,
      nickname,
      diceType
    });
  };
  
  // Компонент для формы присоединения к сессии
  const renderJoinForm = () => (
    <Card className="w-full bg-black/30 backdrop-blur-sm">
      <CardHeader>
        <CardTitle>Присоединиться к игровой сессии</CardTitle>
        <CardDescription>
          Введите свой никнейм и код комнаты, который вам предоставил Мастер
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="nickname">Ваш никнейм</Label>
          <Input
            id="nickname"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Введите ваш игровой никнейм"
            className="mt-1"
          />
        </div>
        
        <div>
          <Label htmlFor="roomCode">Код комнаты</Label>
          <Input
            id="roomCode"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            placeholder="Например: ABC123"
            className="mt-1"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => navigate('/')}>
          Отмена
        </Button>
        <Button 
          onClick={joinSession}
          disabled={isConnecting || !roomCode.trim() || !nickname.trim()}
        >
          {isConnecting ? "Подключение..." : "Присоединиться"}
        </Button>
      </CardFooter>
    </Card>
  );
  
  // Компонент для отображения активной сессии
  const renderActiveSession = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2">
        <Card className="w-full h-full bg-black/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Игровая сессия ({roomCode})</CardTitle>
            <CardDescription>
              Вы подключены как {nickname}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Игроки в сессии ({players.length})</h3>
                <div className="border rounded-md p-3 bg-black/20">
                  {players.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Загрузка списка игроков...</p>
                  ) : (
                    <ul className="space-y-1">
                      {players.map((player, index) => (
                        <li key={index} className="text-sm">
                          {player.nickname} {player.nickname === nickname ? "(вы)" : ""}
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
            <Button variant="outline" className="w-full" onClick={() => navigate('/')}>
              Покинуть сессию
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
                  <div 
                    key={index} 
                    className={`rounded-lg p-2 ${
                      msg.nickname === nickname 
                        ? 'bg-primary/20 text-right mr-2' 
                        : 'bg-black/20 ml-2'
                    }`}
                  >
                    <div className="text-xs font-medium">
                      {msg.nickname === nickname ? 'Вы' : msg.nickname}
                    </div>
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
      title={joined ? "Игровая сессия" : "Присоединиться к сессии"} 
      withBottomPadding={true}
    >
      {joined ? renderActiveSession() : renderJoinForm()}
    </MobileOptimizedLayout>
  );
};

export default JoinGameSession;
