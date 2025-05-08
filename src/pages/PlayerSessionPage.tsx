
import React from 'react';
import { useSocket } from '@/hooks/useSocket';

const PlayerSessionPage: React.FC = () => {
  // Using the correct properties from our updated SocketContextType
  const { isConnected, lastUpdate } = useSocket();
  
  return (
    <div>
      <h1>Player Session Page</h1>
      <p>Connection status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <p>Last update: {lastUpdate ? lastUpdate.toISOString() : 'Never'}</p>
    </div>
  );
};

export default PlayerSessionPage;
