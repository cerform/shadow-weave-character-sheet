
// Update the useSocket import to match the updated interface
import { useSocket, SocketContextType } from '@/hooks/useSocket';

// Fix the destructuring
const { isConnected: connected, lastUpdate } = useSocket();
