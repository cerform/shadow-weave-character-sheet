import React from 'react';
import { PlayerList } from './panels/PlayerList';
import { ActionToolbar } from './panels/ActionToolbar';
import { GameLog } from './panels/GameLog';
import { socketService, SessionPlayer } from '@/services/socket';

interface VTTLayoutProps {
  children: React.ReactNode;
}

export const VTTLayout: React.FC<VTTLayoutProps> = ({ children }) => {
  const [players, setPlayers] = React.useState<SessionPlayer[]>([]);

  React.useEffect(() => {
    const handlePlayerUpdate = (updatedPlayers: SessionPlayer[]) => {
      setPlayers(updatedPlayers);
    };

    socketService.onPlayerUpdate(handlePlayerUpdate);
    
    // Initial sync
    const session = socketService.getCurrentSession();
    if (session) {
      setPlayers(session.players);
    }

    return () => socketService.removePlayerUpdateListener(handlePlayerUpdate);
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0a0a0c] text-slate-100">
      {/* Background/WebGL Layer */}
      <div className="absolute inset-0 z-0">
        {children}
      </div>

      {/* UI Overlays */}
      <PlayerList players={players} />
      <GameLog />
      <ActionToolbar />
      
      {/* Ambient Effects */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(50,50,80,0.1)_0%,rgba(0,0,0,0.4)_100%)] z-10" />
    </div>
  );
};
