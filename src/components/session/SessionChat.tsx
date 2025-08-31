import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, MessageCircle } from 'lucide-react';
import { useSessionSync, SessionMessage } from '@/hooks/useSessionSync';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

interface SessionChatProps {
  sessionId: string;
  className?: string;
}

const SessionChat: React.FC<SessionChatProps> = ({
  sessionId,
  className = ""
}) => {
  const [messageInput, setMessageInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, sendMessage } = useSessionSync(sessionId);

  // Автопрокрутка к последнему сообщению
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    await sendMessage(messageInput.trim());
    setMessageInput('');
  };

  const getMessageColor = (messageType: SessionMessage['message_type']) => {
    switch (messageType) {
      case 'system':
        return 'text-muted-foreground bg-muted/20';
      case 'dice':
        return 'text-orange-600 bg-orange-50 dark:bg-orange-950/20';
      case 'action':
        return 'text-purple-600 bg-purple-50 dark:bg-purple-950/20';
      default:
        return 'text-foreground bg-background';
    }
  };

  const getMessageIcon = (messageType: SessionMessage['message_type']) => {
    switch (messageType) {
      case 'dice':
        return '🎲';
      case 'action':
        return '⚔️';
      case 'system':
        return '🤖';
      default:
        return '';
    }
  };

  if (!isExpanded) {
    return (
      <Button
        onClick={() => setIsExpanded(true)}
        className={`fixed bottom-4 right-4 z-50 rounded-full h-12 w-12 p-0 shadow-lg ${className}`}
        size="sm"
      >
        <MessageCircle className="h-5 w-5" />
        {messages.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground rounded-full text-xs w-5 h-5 flex items-center justify-center">
            {messages.length > 99 ? '99+' : messages.length}
          </span>
        )}
      </Button>
    );
  }

  return (
    <Card className={`fixed bottom-4 right-4 z-50 w-80 h-96 shadow-lg ${className}`}>
      <CardHeader className="py-3 px-4 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Чат сессии
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(false)}
            className="h-6 w-6 p-0"
          >
            ×
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex flex-col h-full">
        <ScrollArea className="flex-1 p-3">
          <div className="space-y-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`text-xs p-2 rounded-md ${getMessageColor(message.message_type)}`}
              >
                <div className="flex items-start gap-2">
                  {getMessageIcon(message.message_type) && (
                    <span className="text-sm">{getMessageIcon(message.message_type)}</span>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1 mb-1">
                      <span className="font-medium text-xs truncate">
                        {message.sender_name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(message.created_at), { 
                          addSuffix: true, 
                          locale: ru 
                        })}
                      </span>
                    </div>
                    <p className="text-xs whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-xs py-4">
                Сообщений пока нет
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        <form onSubmit={handleSendMessage} className="p-3 border-t">
          <div className="flex gap-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Введите сообщение..."
              className="text-xs"
              maxLength={500}
            />
            <Button
              type="submit"
              size="sm"
              disabled={!messageInput.trim()}
              className="px-3"
            >
              <Send className="h-3 w-3" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default SessionChat;