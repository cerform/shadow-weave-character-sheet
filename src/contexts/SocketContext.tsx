
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import socketService, { ChatMessage } from '@/services/socket';
import { SessionData, Token } from '@/types/socket';
import { useToast } from '@/components/ui/use-toast';

interface SocketContextType {
  isConnected: boolean;
  sessionData: SessionData | null;
  chatMessages: ChatMessage[];
  connect: (sessionCode: string, playerName: string, characterId?: string) => void;
  disconnect: () => void;
  sendChatMessage: (message: string) => void;
  sendRoll: (formula: string, reason?: string) => void;
  updateToken: (token: Partial<Token> & { id: string }) => void;
  socketService: typeof socketService; // Добавляем экспорт socketService для прямого доступа
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  
  const { toast } = useToast();

  useEffect(() => {
    // Setup socket event listeners
    const connectionEstablishedUnsubscribe = socketService.on('connection_established', () => {
      setIsConnected(true);
      toast({
        title: "Соединение установлено",
        description: "Вы подключены к серверу",
      });
    });

    const connectionLostUnsubscribe = socketService.on('connection_lost', () => {
      setIsConnected(false);
      toast({
        title: "Соединение потеряно",
        description: "Попытка переподключения...",
        variant: "destructive",
      });
    });

    const sessionUpdateUnsubscribe = socketService.on('session_update', (data: SessionData) => {
      setSessionData(data);
    });

    const chatMessageUnsubscribe = socketService.on('chat_message', (message: ChatMessage) => {
      setChatMessages(prev => [...prev, message]);
    });

    // Cleanup listeners on unmount
    return () => {
      connectionEstablishedUnsubscribe();
      connectionLostUnsubscribe();
      sessionUpdateUnsubscribe();
      chatMessageUnsubscribe();
    };
  }, [toast]);

  const connect = (sessionCode: string, playerName: string, characterId?: string) => {
    socketService.connect(sessionCode, playerName, characterId);
  };

  const disconnect = () => {
    socketService.disconnect();
    setIsConnected(false);
    setSessionData(null);
    setChatMessages([]);
  };

  const sendChatMessage = (message: string) => {
    socketService.sendChatMessage(message);
  };

  const sendRoll = (formula: string, reason?: string) => {
    socketService.sendRoll(formula, reason);
  };

  const updateToken = (token: Partial<Token> & { id: string }) => {
    socketService.updateToken(token);
  };

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        sessionData,
        chatMessages,
        connect,
        disconnect,
        sendChatMessage,
        sendRoll,
        updateToken,
        socketService, // Предоставляем доступ к сервису сокетов
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
