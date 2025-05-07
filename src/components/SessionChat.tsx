
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CustomScrollArea } from '@/components/ui/custom-scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Определяем интерфейс сообщения
interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

// Определяем интерфейс props
export interface SessionChatProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  sessionCode: string;
  playerName: string;
  roomCode?: string; // Делаем roomCode опциональным
}

const SessionChat: React.FC<SessionChatProps> = ({
  messages = [], // Используем значение по умолчанию
  onSendMessage = () => {}, // Используем функцию-заглушку по умолчанию
  sessionCode = '',
  playerName = '',
  roomCode = '' // Значение по умолчанию для roomCode
}) => {
  const [inputValue, setInputValue] = useState('');
  const [chatMessages, setChatMessages] = useState<Message[]>(messages);
  const [isConnecting, setIsConnecting] = useState(false);
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Автоматически прокручиваем чат вниз при новых сообщениях
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Обработка ввода сообщения
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Обработка отправки сообщения с улучшенной обработкой ошибок
  const handleSendMessage = () => {
    if (inputValue.trim() === '') return;

    // Используем переданную функцию onSendMessage, если есть
    onSendMessage(inputValue);

    // Создаем новое сообщение
    const newMessage: Message = {
      id: Date.now().toString(),
      sender: playerName || (user?.displayName || 'Гость'),
      text: inputValue,
      timestamp: new Date().toISOString()
    };

    // Добавляем в локальный массив
    setChatMessages(prev => [...prev, newMessage]);

    // Отправляем через сокет, если он есть и подключен
    if (socket && isConnected) {
      try {
        socket.emit('message', {
          room: roomCode || sessionCode,
          message: newMessage
        });
      } catch (error) {
        console.error('[CHAT] Ошибка при отправке сообщения:', error);
      }
    } else {
      console.log('[CHAT] Сообщение сохранено локально (нет активного соединения)');
    }

    // Очищаем поле ввода
    setInputValue('');
  };

  // Обработка нажатия Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Обновляем сообщения при получении новых пропсов
  useEffect(() => {
    if (messages && messages.length > 0) {
      setChatMessages(messages);
    }
  }, [messages]);

  // Подписываемся на события сокета с улучшенной обработкой ошибок
  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (data: { message: Message }) => {
      if (data && data.message) {
        setChatMessages(prev => [...prev, data.message]);
      }
    };

    try {
      socket.on('message', handleIncomingMessage);
    } catch (error) {
      console.error('[CHAT] Ошибка при подписке на сообщения:', error);
    }

    return () => {
      try {
        socket.off('message', handleIncomingMessage);
      } catch (error) {
        console.error('[CHAT] Ошибка при отписке от сообщений:', error);
      }
    };
  }, [socket]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Чат сессии</span>
          <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-amber-500'}`} />
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0 px-4">
        <CustomScrollArea className="h-[350px] pr-4">
          <div ref={scrollRef} className="h-full overflow-auto">
            {!isConnected && (
              <Alert variant="warning" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Соединение с сервером не установлено. Сообщения сохраняются локально.
                </AlertDescription>
              </Alert>
            )}
            <div className="space-y-4 pt-2">
              {chatMessages.length > 0 ? chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg ${
                    msg.sender === (playerName || (user?.displayName || 'Гость'))
                      ? 'bg-primary/10 ml-auto max-w-[80%]'
                      : 'bg-muted max-w-[80%]'
                  }`}
                >
                  <div className="font-semibold text-sm flex justify-between items-center mb-1">
                    <span>{msg.sender}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                </div>
              )) : (
                <div className="text-center py-8 text-muted-foreground">
                  Нет сообщений. Будьте первым, кто напишет!
                </div>
              )}
            </div>
          </div>
        </CustomScrollArea>
      </CardContent>
      <CardFooter className="pt-1">
        <div className="flex w-full gap-2">
          <Input
            placeholder="Введите сообщение..."
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            className="flex-1"
          />
          <Button 
            onClick={handleSendMessage}
            disabled={isConnecting}
          >
            {isConnecting ? 'Подключение...' : 'Отправить'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SessionChat;
