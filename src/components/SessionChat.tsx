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
}

const SessionChat: React.FC<SessionChatProps> = ({ roomCode }) => {
  const [message, setMessage] = React.useState('');
  const [messages, setMessages] = React.useState<any[]>([]);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const { socket } = useSocket();
  const { user } = useAuth();
  const { toast } = useToast();

  React.useEffect(() => {
    if (!socket) return;

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
  }, [socket, roomCode]);

  // Scroll to bottom when messages change
  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !socket || !user) return;

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

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="px-4 py-3 border-b">
        <CardTitle className="text-lg">Чат комнаты {roomCode}</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-0 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Нет сообщений. Начните общение!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.sender.id === user?.uid ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`flex gap-2 max-w-[80%] ${
                      msg.sender.id === user?.uid ? 'flex-row-reverse' : ''
                    }`}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={msg.sender.avatar} />
                      <AvatarFallback>
                        {msg.sender.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div
                        className={`rounded-lg px-3 py-2 ${
                          msg.sender.id === user?.uid
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <p className="text-sm">{msg.text}</p>
                      </div>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <span className="font-medium mr-2">{msg.sender.name}</span>
                        <span>
                          {formatDistanceToNow(new Date(msg.timestamp), {
                            addSuffix: true,
                            locale: ru,
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
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
