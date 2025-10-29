import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, VideoOff, Mic, MicOff, Maximize2, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWebRTCChat } from '@/hooks/useWebRTCChat';
import { useAuth } from '@/hooks/use-auth';

interface VideoChatMiniProps {
  sessionId: string;
  playerName: string;
  isDM?: boolean;
}

export const VideoChatMini: React.FC<VideoChatMiniProps> = ({
  sessionId,
  playerName,
  isDM = false
}) => {
  const { user } = useAuth();
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  const {
    localStream,
    participants,
    isVideoEnabled,
    isAudioEnabled,
    isConnected,
    connect,
    disconnect,
    toggleVideo,
    toggleAudio,
  } = useWebRTCChat(
    sessionId,
    user?.id || 'anonymous',
    playerName,
    isDM
  );

  // Подключаем локальное видео
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const toggleConnection = async () => {
    if (isConnected) {
      disconnect();
    } else {
      try {
        await connect();
      } catch (error) {
        console.error('Failed to connect:', error);
      }
    }
  };

  // Компонент для видео участника
  const ParticipantVideo: React.FC<{ 
    id: string;
    name: string;
    stream?: MediaStream;
    isDM: boolean;
    isLocal?: boolean;
  }> = ({ id, name, stream, isDM: participantIsDM, isLocal = false }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const isExpanded = expandedId === id;

    useEffect(() => {
      if (videoRef.current && stream && !isLocal) {
        videoRef.current.srcObject = stream;
      }
    }, [stream, isLocal]);

    return (
      <Card 
        className={`relative overflow-hidden border-2 transition-all ${
          isExpanded 
            ? 'col-span-2' 
            : ''
        } ${
          participantIsDM 
            ? 'border-primary' 
            : 'border-border'
        } aspect-video`}
      >
        {/* Видео */}
        <div className="w-full h-full bg-muted flex items-center justify-center">
          {stream && (isLocal ? isVideoEnabled : true) ? (
            <video
              ref={isLocal ? localVideoRef : videoRef}
              autoPlay
              playsInline
              muted={isLocal}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/20 to-primary/5">
              <User className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Информация */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
          <div className="flex items-center justify-between">
            <span className="text-white text-xs font-semibold truncate">
              {name}
            </span>
            <div className="flex items-center gap-1">
              {participantIsDM && (
                <Badge variant="default" className="text-xs px-1 py-0">
                  DM
                </Badge>
              )}
              {isLocal && (
                <Badge variant="secondary" className="text-xs px-1 py-0">
                  Вы
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Кнопка развернуть */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 h-6 w-6 bg-black/50 hover:bg-black/70"
          onClick={() => setExpandedId(isExpanded ? null : id)}
        >
          <Maximize2 className="h-3 w-3 text-white" />
        </Button>

        {/* Индикатор микрофона для локального */}
        {isLocal && (
          <div className="absolute top-1 left-1">
            {isAudioEnabled ? (
              <Mic className="h-4 w-4 text-green-500" />
            ) : (
              <MicOff className="h-4 w-4 text-red-500" />
            )}
          </div>
        )}
      </Card>
    );
  };

  return (
    <div className="h-full flex flex-col bg-card">
      {/* Заголовок с контролами */}
      <div className="p-3 border-b border-border flex items-center justify-between bg-card/95 flex-shrink-0">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <Video className="h-4 w-4" />
          Видеочат {isConnected && `(${participants.length + 1})`}
        </h3>
        <div className="flex gap-1">
          <Button
            variant={isConnected ? 'default' : 'outline'}
            size="icon"
            onClick={toggleConnection}
            className="h-7 w-7"
            title={isConnected ? 'Отключиться' : 'Подключиться'}
          >
            {isConnected ? '🟢' : '🔴'}
          </Button>
          
          <Button
            variant={isVideoEnabled ? 'default' : 'outline'}
            size="icon"
            onClick={toggleVideo}
            className="h-7 w-7"
            disabled={!localStream}
          >
            {isVideoEnabled ? <Video className="h-3 w-3" /> : <VideoOff className="h-3 w-3" />}
          </Button>
          
          <Button
            variant={isAudioEnabled ? 'default' : 'outline'}
            size="icon"
            onClick={toggleAudio}
            className="h-7 w-7"
            disabled={!localStream}
          >
            {isAudioEnabled ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* Камеры участников */}
      <ScrollArea className="flex-1">
        {!isConnected ? (
          <div className="p-8 text-center text-muted-foreground">
            <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-sm">Нажмите зеленую кнопку для подключения</p>
          </div>
        ) : (
          <div className="p-3 grid grid-cols-2 gap-2">
            {/* Локальное видео */}
            <ParticipantVideo
              id="local"
              name={playerName}
              stream={localStream || undefined}
              isDM={isDM}
              isLocal={true}
            />

            {/* Удаленные участники */}
            {participants.map((participant) => (
              <ParticipantVideo
                key={participant.id}
                id={participant.id}
                name={participant.name}
                stream={participant.stream}
                isDM={participant.isDM}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
