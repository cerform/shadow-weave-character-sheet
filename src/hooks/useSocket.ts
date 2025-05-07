
import { useState, useEffect, useCallback } from 'react';
import { socketService } from '@/services/socket';

// Add this interface to define what socketService should have
interface SocketService {
  connect: (roomCode: string, playerName: string, characterId?: string) => void;
  disconnect: () => void;
  sendChatMessage: (data: { message: string, roomCode: string, nickname: string }) => void;
  on: (event: string, callback: (...args: any[]) => void) => void;
  off: (event: string, callback: (...args: any[]) => void) => void;
  roomCode?: string;
  nickname?: string;
}

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
    (socketService as SocketService).connect(roomCode, playerName, characterId);
    setIsConnected(true);
    setLastUpdate(new Date());
  }, []);

  const disconnect = useCallback(() => {
    (socketService as SocketService).disconnect();
    setIsConnected(false);
    setLastUpdate(new Date());
  }, []);

  const sendMessage = useCallback((message: string) => {
    (socketService as SocketService).sendChatMessage({
      message: message,
      roomCode: (socketService as SocketService).roomCode || '',
      nickname: (socketService as SocketService).nickname || 'Guest'
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

    (socketService as SocketService).on('connect', handleConnect);
    (socketService as SocketService).on('disconnect', handleDisconnect);

    return () => {
      (socketService as SocketService).off('connect', handleConnect);
      (socketService as SocketService).off('disconnect', handleDisconnect);
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
