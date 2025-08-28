// Компактный видео чат для боевой карты
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Users, 
  X, 
  Phone,
  PhoneOff,
  Maximize2,
  Minimize2
} from 'lucide-react';

interface CompactVideoChatProps {
  isConnected?: boolean;
  participantsCount?: number;
  onToggleVideo?: () => void;
  onToggleAudio?: () => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export default function CompactVideoChat({
  isConnected = false,
  participantsCount = 0,
  onToggleVideo,
  onToggleAudio,
  onConnect,
  onDisconnect
}: CompactVideoChatProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [isMinimized, setIsMinimized] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleToggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
    onToggleVideo?.();
  };

  const handleToggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
    onToggleAudio?.();
  };

  const handleConnect = () => {
    onConnect?.();
  };

  const handleDisconnect = () => {
    onDisconnect?.();
    setIsExpanded(false);
  };

  // Компактный вид в верхней панели
  if (!isExpanded) {
    return (
      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant={isConnected ? "default" : "ghost"}
          onClick={() => setIsExpanded(true)}
          className="h-8 px-2"
          title="Видео чат"
        >
          <Video className="h-4 w-4" />
          {isConnected && participantsCount > 0 && (
            <Badge variant="secondary" className="ml-1 text-xs px-1 py-0 h-4">
              {participantsCount}
            </Badge>
          )}
        </Button>
      </div>
    );
  }

  // Расширенный видео чат
  return (
    <div className="absolute top-16 right-4 z-50">
      <div className="bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg">
        <div className="p-3">
          {/* Заголовок */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Video className="h-4 w-4" />
              <span className="font-medium text-sm">Видео чат</span>
              {isConnected && (
                <Badge variant="default" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {participantsCount}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setIsExpanded(false)}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Видео окно */}
              {isConnected && (
                <div className="mb-3">
                  <div className="bg-muted rounded-lg aspect-video w-60 flex items-center justify-center relative">
                    {isVideoEnabled ? (
                      <video
                        ref={videoRef}
                        className="w-full h-full rounded-lg object-cover"
                        autoPlay
                        muted
                      />
                    ) : (
                      <div className="text-muted-foreground text-sm text-center">
                        <VideoOff className="h-6 w-6 mx-auto mb-1" />
                        Видео отключено
                      </div>
                    )}
                    
                    {/* Участники в мини виде */}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      {Array.from({ length: Math.max(0, participantsCount - 1) }).map((_, i) => (
                        <div key={i} className="bg-background/80 rounded w-8 h-8 flex items-center justify-center">
                          <Users className="h-3 w-3" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Элементы управления */}
              <div className="space-y-2">
                {!isConnected ? (
                  <Button
                    size="sm"
                    onClick={handleConnect}
                    className="w-full h-8 text-xs"
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    Подключиться
                  </Button>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant={isVideoEnabled ? "default" : "outline"}
                        onClick={handleToggleVideo}
                        className="flex-1 h-8 text-xs"
                      >
                        {isVideoEnabled ? <Video className="h-3 w-3" /> : <VideoOff className="h-3 w-3" />}
                      </Button>
                      <Button
                        size="sm"
                        variant={isAudioEnabled ? "default" : "outline"}
                        onClick={handleToggleAudio}
                        className="flex-1 h-8 text-xs"
                      >
                        {isAudioEnabled ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={handleDisconnect}
                      className="w-full h-8 text-xs"
                    >
                      <PhoneOff className="h-4 w-4 mr-1" />
                      Отключиться
                    </Button>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}