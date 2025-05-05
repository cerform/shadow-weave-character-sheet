
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, PlusCircle, Image, FileUp, Smile } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface SessionChatProps {
  roomCode: string;
  sessionCode?: string; // Добавляем для совместимости
  playerName?: string; // Добавляем для совместимости
  messages?: any[]; // Добавляем для совместимости
  onSendMessage?: (text: string) => void; // Добавляем для совместимости
}

const SessionChat: React.FC<SessionChatProps> = ({ roomCode, sessionCode, playerName, messages: initialMessages, onSendMessage: externalSendMessage }) => {
  const [message, setMessage] = React.useState('');
  const [messages, setMessages] = React.useState<any[]>(initialMessages || []);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const { socket, isConnected } = useSocket();
  const { user } = useAuth();
  const { toast } = useToast();

  React.useEffect(() => {
    if (!socket && !externalSendMessage) return;

    if (socket) {
      // Listen for incoming messages
      socket.on('chat-message', (msg: any) => {
        setMessages(prev => [...prev, msg]);
      });

      // Listen for chat history
      socket.on('chat-history', (history: any[]) => {
        setMessages(history);
      });

      // Request chat history when component mounts
      socket.emit('get-chat-history', roomCode);

      return () => {
        socket.off('chat-message');
        socket.off('chat-history');
      };
    }
  }, [socket, roomCode, externalSendMessage]);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim()) return;

    if (externalSendMessage) {
      // Используем внешний обработчик, если он предоставлен
      externalSendMessage(message);
      setMessage('');
      return;
    }

    if (!socket || !user) {
      toast({
        title: "Ошибка отправки",
        description: "Не удалось отправить сообщение. Проверьте соединение.",
        variant: "destructive",
      });
      return;
    }

    const newMessage = {
      id: Date.now().toString(),
      text: message,
      sender: {
        id: user.uid,
        name: user.displayName || 'Аноним',
        avatar: user.photoURL || '',
      },
      timestamp: new Date().toISOString(),
      roomCode,
    };

    socket.emit('send-message', newMessage);
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = () => {
    toast({
      title: 'Функция в разработке',
      description: 'Загрузка файлов будет доступна в ближайшем обновлении',
    });
  };

  // Адаптируем компонент для работы с обоими форматами сообщений
  const renderMessages = () => {
    if (messages.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          Нет сообщений. Начните общение!
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {messages.map((msg, index) => {
          // Определяем тип сообщения и адаптируем вывод
          const isSimpleFormat = !msg.sender || typeof msg.sender !== 'object';
          const senderId = isSimpleFormat ? msg.sender : msg.sender.id;
          const senderName = isSimpleFormat ? msg.sender : msg.sender.name;
          const senderAvatar = isSimpleFormat ? '' : msg.sender.avatar;
          const isCurrentUser = user ? (isSimpleFormat ? senderId === playerName : senderId === user.uid) : false;
          
          return (
            <div
              key={msg.id || index}
              className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex gap-2 max-w-[80%] ${isCurrentUser ? 'flex-row-reverse' : ''}`}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={senderAvatar} />
                  <AvatarFallback>
                    {senderName?.substring(0, 2).toUpperCase() || 'AN'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div
                    className={`rounded-lg px-3 py-2 ${
                      isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                  <div className="flex items-center mt-1 text-xs text-muted-foreground">
                    <span className="font-medium mr-2">{senderName}</span>
                    <span>
                      {msg.timestamp && formatDistanceToNow(new Date(msg.timestamp), {
                        addSuffix: true,
                        locale: ru,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
    );
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-lg">
          {sessionCode ? `Чат сессии ${sessionCode}` : `Чат комнаты ${roomCode}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          {renderMessages()}
        </ScrollArea>
        <div className="p-3 border-t">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleFileUpload}>
              <PlusCircle className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleFileUpload}>
              <Image className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleFileUpload}>
              <FileUp className="h-5 w-5" />
            </Button>
            <Input
              placeholder="Введите сообщение..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1"
            />
            <Button variant="ghost" size="icon" onClick={handleFileUpload}>
              <Smile className="h-5 w-5" />
            </Button>
            <Button onClick={handleSendMessage} disabled={!message.trim()}>
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionChat;
