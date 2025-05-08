
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SendHorizontal, Dice6 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChatMessage } from '@/types/session.types';
import { socketService } from '@/services/socket';

interface SessionChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  sessionCode: string;
  playerName: string;
  roomCode: string;
}

const SessionChat: React.FC<SessionChatProps> = ({
  messages: initialMessages,
  onSendMessage,
  sessionCode,
  playerName,
  roomCode
}) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages || []);
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  // Добавление нового сообщения в чат
  const addMessage = (message: ChatMessage) => {
    setMessages(prevMessages => [...prevMessages, message]);
  };
  
  // Обработчики событий WebSocket
  useEffect(() => {
    const handleNewMessage = (data: any) => {
      const newMessage: ChatMessage = {
        id: data.id || Date.now().toString(),
        senderId: data.senderId || 'system',
        sender: data.nickname || playerName,
        senderName: data.nickname || playerName,
        message: data.message,
        content: data.message,
        timestamp: data.timestamp || new Date().toISOString(),
        type: 'message'
      };
      addMessage(newMessage);
    };
    
    const handleRoll = (data: any) => {
      const rollMessage: ChatMessage = {
        id: data.id || Date.now().toString(),
        senderId: data.senderId || 'system',
        sender: data.playerName || 'Система',
        senderName: data.playerName || 'Система',
        message: `${data.reason ? data.reason + ': ' : ''}${data.formula}`,
        content: `${data.reason ? data.reason + ': ' : ''}${data.formula}`,
        timestamp: data.timestamp || new Date().toISOString(),
        type: 'dice',
        rollResult: {
          formula: data.formula,
          rolls: data.rolls || [],
          total: data.total || 0,
          reason: data.reason
        }
      };
      addMessage(rollMessage);
    };
    
    // Регистрируем обработчики событий
    socketService.on('message', handleNewMessage);
    socketService.on('roll', handleRoll);
    
    // Очистка при размонтировании
    return () => {
      socketService.off('message', handleNewMessage);
      socketService.off('roll', handleRoll);
    };
  }, [playerName]);
  
  // Автопрокрутка чата при добавлении новых сообщений
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // Отправка сообщения
  const handleSendMessage = () => {
    if (message.trim() === '') return;
    
    onSendMessage(message);
    setMessage('');
  };
  
  // Отправка броска кубиков
  const handleDiceRoll = (formula: string) => {
    socketService.sendRoll({ formula });
  };
  
  // Форматирование времени сообщений
  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="py-2">
        <CardTitle className="text-lg">Чат сессии</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-2">
        <div className="space-y-2">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p>В чате пока нет сообщений</p>
              <p className="text-sm mt-2">Здесь будет отображаться история чата и бросков кубиков</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="mb-2">
                {msg.type === 'message' ? (
                  <div className="bg-secondary/10 rounded-lg p-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{msg.senderName || msg.sender}</span>
                      <span className="text-muted-foreground">{formatTime(msg.timestamp)}</span>
                    </div>
                    <p>{msg.content || msg.message}</p>
                  </div>
                ) : msg.type === 'dice' ? (
                  <div className="bg-primary/5 rounded-lg p-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{msg.senderName || msg.sender} бросает кубики</span>
                      <span className="text-muted-foreground">{formatTime(msg.timestamp)}</span>
                    </div>
                    <p className="text-sm">{msg.content || msg.message}</p>
                    {msg.rollResult && (
                      <div className="mt-1 flex items-center gap-2">
                        <span className="font-bold text-primary">
                          Результат: {msg.rollResult.total}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          (Броски: {msg.rollResult.rolls.join(', ')})
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-muted/30 rounded-lg p-2">
                    <div className="text-center text-muted-foreground text-sm">
                      {msg.content || msg.message}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>
      </CardContent>
      
      <CardFooter className="p-2 mt-auto border-t">
        <div className="flex w-full gap-2">
          <Popover>
            <PopoverTrigger>
              <Button variant="outline" size="icon">
                <Dice6 className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2">
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full" 
                  onClick={() => handleDiceRoll('1d20')}
                >
                  d20
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1" 
                    onClick={() => handleDiceRoll('1d4')}
                  >
                    d4
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1" 
                    onClick={() => handleDiceRoll('1d6')}
                  >
                    d6
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1" 
                    onClick={() => handleDiceRoll('1d8')}
                  >
                    d8
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1" 
                    onClick={() => handleDiceRoll('1d10')}
                  >
                    d10
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1" 
                    onClick={() => handleDiceRoll('1d12')}
                  >
                    d12
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1" 
                    onClick={() => handleDiceRoll('1d100')}
                  >
                    d100
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Введите сообщение..."
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          
          <Button onClick={handleSendMessage} disabled={message.trim() === ''}>
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SessionChat;
