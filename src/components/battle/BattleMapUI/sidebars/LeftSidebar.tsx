import React from 'react';
import SimpleTokenCreator from '@/components/battle/SimpleTokenCreator';
import { PlayersList } from '@/components/battle/PlayersList';

interface LeftSidebarProps {
  sessionId: string;
  isDM: boolean;
  onCreateToken: (tokenData: any) => void;
}

export function LeftSidebar({ sessionId, isDM, onCreateToken }: LeftSidebarProps) {
  if (!isDM) return null;

  return (
    <div className="absolute left-0 top-0 bottom-0 w-80 bg-background/95 border-r border-border overflow-y-auto z-20">
      <div className="p-4 space-y-4">
        <SimpleTokenCreator onCreateToken={onCreateToken} />
        <PlayersList sessionId={sessionId} />
      </div>
    </div>
  );
}
