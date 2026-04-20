import React from 'react';
import SimpleTokenCreator from '@/components/battle/SimpleTokenCreator';
import { PlayersList } from '@/components/battle/PlayersList';
import { MapUploader } from './MapUploader';
import { AIGenerator } from './AIGenerator';
import { NPCVoicePanel } from '@/components/battle/NPCVoicePanel';

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
  return (
    <div className="absolute left-0 top-0 bottom-0 w-80 bg-background/95 border-r border-border overflow-y-auto z-20 transition-all duration-300">
      <div className="p-4 space-y-6">
        {isDM && (
          <>
            <AIGenerator sessionId={sessionId} />
            <MapUploader 
              onMapFile={onMapFile}
              onMapUrl={onMapUrl}
              currentMapUrl={currentMapUrl}
            />
            <SimpleTokenCreator onCreateToken={onCreateToken} />
            <div className="border-t border-border/20 pt-4">
              <NPCVoicePanel sessionId={sessionId} isDM={isDM} />
            </div>
          </>
        )}
        
        {!isDM && (
          <NPCVoicePanel sessionId={sessionId} isDM={false} />
        )}
        
        <PlayersList sessionId={sessionId} />
      </div>
    </div>
  );
}
