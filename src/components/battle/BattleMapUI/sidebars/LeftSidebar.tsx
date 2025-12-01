import React from 'react';
import SimpleTokenCreator from '@/components/battle/SimpleTokenCreator';
import { PlayersList } from '@/components/battle/PlayersList';
import { MapUploader } from './MapUploader';

interface LeftSidebarProps {
  sessionId: string;
  isDM: boolean;
  onCreateToken: (tokenData: any) => void;
  onMapFile: (file: File) => void;
  onMapUrl: (url: string) => void;
  currentMapUrl?: string | null;
}

export function LeftSidebar({ 
  sessionId, 
  isDM, 
  onCreateToken,
  onMapFile,
  onMapUrl,
  currentMapUrl
}: LeftSidebarProps) {
  if (!isDM) return null;

  return (
    <div className="absolute left-0 top-0 bottom-0 w-80 bg-background/95 border-r border-border overflow-y-auto z-20">
      <div className="p-4 space-y-4">
        <MapUploader 
          onMapFile={onMapFile}
          onMapUrl={onMapUrl}
          currentMapUrl={currentMapUrl}
        />
        <SimpleTokenCreator onCreateToken={onCreateToken} />
        <PlayersList sessionId={sessionId} />
      </div>
    </div>
  );
}
