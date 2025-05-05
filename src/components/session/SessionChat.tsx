
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send } from 'lucide-react';

export interface SessionChatProps {
  messages: { sender: string; text: string; timestamp: string }[];
  onSendMessage: (text: string) => void;
  sessionCode: string;
  playerName: string;
}

const SessionChat: React.FC<SessionChatProps> = ({
  messages,
  onSendMessage,
  sessionCode,
  playerName
}) => {
  const [message, setMessage] = useState('');

  const handleSendMessage = () => {
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex justify-between items-center">
          <span>Чат сессии</span>
          {sessionCode && <span className="text-xs text-muted-foreground">Код: {sessionCode}</span>}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex-grow overflow-hidden p-0">
        <ScrollArea className="h-[400px] px-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Сообщений пока нет
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`flex flex-col ${msg.sender === playerName ? 'items-end' : 'items-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-3 ${
                      msg.sender === playerName 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }`}
                  >
                    {msg.sender !== playerName && (
                      <div className="font-medium text-sm mb-1">{msg.sender}</div>
                    )}
                    <div>{msg.text}</div>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="pt-2">
        <div className="flex w-full gap-2">
          <Input 
            placeholder="Напишите сообщение..." 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          />
          <Button size="icon" onClick={handleSendMessage} disabled={!message.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SessionChat;
