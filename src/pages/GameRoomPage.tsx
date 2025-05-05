import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import SessionChat, { SessionChatProps } from '@/components/SessionChat';
import { useAuth } from '@/hooks/use-auth';
import { useSocket } from '@/contexts/SocketContext';

const GameRoomPage: React.FC = () => {
  const { roomCode } = useParams<{ roomCode: string }>();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [inputValue, setInputValue] = useState('');

  // Создаем состояние для хранения сообщений
  const [messages, setMessages] = useState<Array<{
    id: string;
    sender: string;
    text: string;
    timestamp: string;
  }>>([]);

  // Функция для отправки сообщения
  const handleSendMessage = (text: string) => {
    console.log("Отправка сообщения:", text);
    // Обработка отправки сообщения здесь
  };

  useEffect(() => {
    if (!socket) return;

    // Подписываемся на событие 'message'
    socket.on('message', (data: { message: { id: string; sender: string; text: string; timestamp: string } }) => {
      setMessages(prevMessages => [...prevMessages, data.message]);
    });

    // Отписываемся от события при размонтировании компонента
    return () => {
      socket.off('message');
    };
  }, [socket]);

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Left Column */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Информация о сессии</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Код комнаты: {roomCode}</p>
              {/* Дополнительная информация о сессии */}
            </CardContent>
          </Card>
        </div>
        
        {/* Right Column */}
        <div>
          <SessionChat 
            messages={messages}
            onSendMessage={handleSendMessage}
            sessionCode={roomCode || ""}
            playerName={user?.displayName || "Гость"}
            roomCode={roomCode}
          />
        </div>
      </div>
    </div>
  );
};

export default GameRoomPage;
