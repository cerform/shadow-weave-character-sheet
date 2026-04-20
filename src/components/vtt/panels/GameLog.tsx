import React, { useEffect, useRef } from 'react';
import { MessageSquare, Dice6, Info } from 'lucide-react';
import { socketService, SessionMessage } from '@/services/socket';
import { ScrollArea } from '@/components/ui/scroll-area';

export const GameLog: React.FC = () => {
  const [messages, setMessages] = React.useState<SessionMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMessage = (msg: SessionMessage) => {
      setMessages(prev => [...prev, msg].slice(-50)); // Keep last 50
    };

    socketService.onMessage(handleMessage);
    return () => socketService.removeMessageListener(handleMessage);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const renderContent = (msg: SessionMessage) => {
    if (msg.type === 'dice') {
      const data = typeof msg.content === 'string' ? JSON.parse(msg.content) : msg.content;
      return (
        <div className="flex flex-col gap-1 p-2 bg-primary/10 border border-primary/20 rounded-lg animate-in fade-in slide-in-from-right-4">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-tighter">
            <span>{data.playerName} rolled {data.diceType}</span>
            <Dice6 className="w-3 h-3 text-primary" />
          </div>
          <div className="text-xl font-black text-primary text-center py-1">
            {data.total}
          </div>
          {data.rolls && (
            <div className="text-[9px] text-center opacity-50 font-mono">
              ({data.rolls.join(' + ')}) {data.modifier ? `+ ${data.modifier}` : ''}
            </div>
          )}
        </div>
      );
    }
    return <div className="text-sm leading-relaxed opacity-90">{String(msg.content)}</div>;
  };

  return (
    <div className="absolute right-6 top-6 bottom-32 w-80 z-50 flex flex-col gap-2 p-3 bg-background/40 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-1 mb-1 border-b border-white/5 pb-2">
        <MessageSquare className="w-4 h-4 text-sky-400" />
        <span className="text-xs font-bold uppercase tracking-wider opacity-70">Journal</span>
      </div>
      
      <ScrollArea className="flex-1 pr-4">
        <div className="flex flex-col gap-4">
          {messages.map((msg, idx) => (
            <div key={msg.id || idx} className="flex flex-col gap-1">
              {msg.type !== 'dice' && (
                <div className="text-[10px] font-bold text-primary/70 uppercase">
                  {msg.sender}
                </div>
              )}
              {renderContent(msg)}
            </div>
          ))}
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
    </div>
  );
};
