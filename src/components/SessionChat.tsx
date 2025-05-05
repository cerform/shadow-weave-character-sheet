
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/contexts/AuthContext';
import { useSocket } from '@/contexts/SocketContext';

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
  const { user } = useAuth();
  const { socket } = useSocket();

  // Обработка ввода сообщения
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Обработка отправки сообщения
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
    setChatMessages([...chatMessages, newMessage]);

    // Отправляем через сокет, если он есть
    if (socket) {
      socket.emit('message', {
        room: roomCode || sessionCode,
        message: newMessage
      });
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
    if (messages.length > 0) {
      setChatMessages(messages);
    }
  }, [messages]);

  // Подписываемся на события сокета
  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (data: { message: Message }) => {
      setChatMessages(prev => [...prev, data.message]);
    };

    socket.on('message', handleIncomingMessage);

    return () => {
      socket.off('message', handleIncomingMessage);
    };
  }, [socket]);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-3">
        <CardTitle className="text-lg">Чат сессии</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow p-0 px-4">
        <ScrollArea className="h-[350px] pr-4">
          <div className="space-y-4 pt-2">
            {chatMessages.map((msg) => (
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
            ))}
          </div>
        </ScrollArea>
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
          <Button onClick={handleSendMessage}>Отправить</Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SessionChat;
