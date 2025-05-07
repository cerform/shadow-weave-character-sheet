import { useState, useEffect, useCallback } from 'react';
import { socketService } from '@/services/socket';

export interface SocketContextType {
  isConnected: boolean;
  connect: (roomCode: string, playerName: string, characterId?: string) => void;
  disconnect: () => void;
  sendMessage: (message: string) => void;
  connected: boolean;  // Add for compatibility
  lastUpdate: Date;    // Add for compatibility
}

export const useSocket = (): SocketContextType => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const connect = useCallback((roomCode: string, playerName: string, characterId?: string) => {
    socketService.connect(roomCode, playerName, characterId);
    setIsConnected(true);
    setLastUpdate(new Date());
  }, []);

  const disconnect = useCallback(() => {
    socketService.disconnect();
    setIsConnected(false);
    setLastUpdate(new Date());
  }, []);

  const sendMessage = useCallback((message: string) => {
    socketService.sendChatMessage({
      message: message,
      roomCode: socketService.roomCode || '',
      nickname: socketService.nickname || 'Guest'
    });
    setLastUpdate(new Date());
  }, []);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      setLastUpdate(new Date());
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      setLastUpdate(new Date());
    };

    socketService.on('connect', handleConnect);
    socketService.on('disconnect', handleDisconnect);

    return () => {
      socketService.off('connect', handleConnect);
      socketService.off('disconnect', handleDisconnect);
    };
  }, []);
  
  return {
    isConnected,
    connect,
    disconnect,
    sendMessage,
    // Add these for compatibility with existing code
    connected: isConnected,
    lastUpdate
  };
};
