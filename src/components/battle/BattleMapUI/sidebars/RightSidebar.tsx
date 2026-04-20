import React, { useState } from 'react';
import LayerPanel from '@/components/battle/vtt/LayerPanel';
import { VideoChat } from '@/components/battle/VideoChat';
import { Button } from '@/components/ui/button';
import { Video, ChevronRight, ChevronLeft } from 'lucide-react';
import type { Layer } from '../types';

interface RightSidebarProps {
  sessionId: string;
  playerName: string;
  layers: Layer[];
  isDM: boolean;
  onToggleLayer: (layerId: string) => void;
  onToggleLayerLock: (layerId: string) => void;
}

export function RightSidebar({ 
  sessionId, 
  playerName, 
  layers, 
  isDM, 
  onToggleLayer, 
  onToggleLayerLock 
}: RightSidebarProps) {
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  return (
    <div className="absolute right-0 top-0 bottom-0 pointer-events-none flex items-start z-20">
      {/* Кнопка вызова видеочата если он закрыт */}
      {!isVideoOpen && (
        <Button 
          variant="secondary" 
          size="sm" 
          className="pointer-events-auto mt-4 -ml-12 rounded-r-none border-r-0 shadow-lg bg-background/95"
          onClick={() => setIsVideoOpen(true)}
        >
          <Video className="h-4 w-4 mr-2" />
          Связь
        </Button>
      )}

      {/* Сама панель */}
      <div className="w-80 h-full bg-background/95 border-l border-border overflow-y-auto pointer-events-auto flex flex-col">
        {/* Секция видеочата */}
        {isVideoOpen && (
          <div className="p-2 border-b border-border">
            <VideoChat 
              sessionId={sessionId} 
              playerName={playerName} 
              isDM={isDM} 
              onClose={() => setIsVideoOpen(false)}
            />
          </div>
        )}

        {/* Секция слоев (только для DM) */}
        <div className="p-4 flex-1">
          {isDM ? (
            <LayerPanel
              layers={layers}
              activeLayerId={layers[0]?.id || 'map'}
              onLayerSelect={() => {}}
              onLayerToggleVisible={onToggleLayer}
              onLayerToggleLock={onToggleLayerLock}
              onLayerOpacityChange={() => {}}
              onLayerAdd={() => {}}
              onLayerDelete={() => {}}
              onLayerRename={() => {}}
            />
          ) : (
            <div className="text-center py-10 text-muted-foreground text-sm italic">
              Здесь будут ваши активные эффекты и условия
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
