
import { useContext } from 'react';
import { SocketContext } from '@/contexts/SocketContext';

export interface SocketContextType {
  socket: any;
  isConnected: boolean;
  lastUpdate: Date | null;
}

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  
  return context;
};
