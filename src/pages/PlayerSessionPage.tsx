
import React from 'react';
import { useSocket } from '@/hooks/useSocket';

const PlayerSessionPage: React.FC = () => {
  // Используем хук useSocket, который экспортируется из нашего обновленного хука
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
