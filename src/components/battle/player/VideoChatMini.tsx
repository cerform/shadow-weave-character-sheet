import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Video, VideoOff, Mic, MicOff, Maximize2, User } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Participant {
  id: string;
  name: string;
  stream?: MediaStream;
  isDM: boolean;
}

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
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // Инициализация медиа устройств
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        setLocalStream(stream);
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        
        // По умолчанию отключаем видео и аудио
        stream.getVideoTracks().forEach(track => track.enabled = false);
        stream.getAudioTracks().forEach(track => track.enabled = false);
        
      } catch (error) {
        console.error('Ошибка доступа к медиа устройствам:', error);
      }
    };

    initializeMedia();
    
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Переключение видео
  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoEnabled(!isVideoEnabled);
    }
  };

  // Переключение аудио
  const toggleAudio = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsAudioEnabled(!isAudioEnabled);
    }
  };

  // Подключение к комнате
  const toggleConnection = () => {
    if (isConnected) {
      setIsConnected(false);
      // Здесь будет логика отключения WebRTC
    } else {
      setIsConnected(true);
      // Здесь будет логика подключения WebRTC
      console.log(`Подключение к видеочату сессии: ${sessionId}`);
    }
  };

  // Все участники включая текущего игрока
  const allParticipants = [
    {
      id: 'local',
      name: playerName,
      stream: localStream || undefined,
      isDM: isDM
    },
    ...participants
  ];

  return (
    <div className="fixed bottom-4 right-4 z-50 flex gap-2">
      {/* Контролы */}
      <Card className="p-2 flex flex-col gap-1 bg-card/95 backdrop-blur-sm border-2">
        <Button
          variant={isConnected ? 'default' : 'outline'}
          size="icon"
          onClick={toggleConnection}
          className="h-8 w-8"
          title={isConnected ? 'Отключиться' : 'Подключиться'}
        >
          {isConnected ? '🟢' : '🔴'}
        </Button>
        
        <Button
          variant={isVideoEnabled ? 'default' : 'outline'}
          size="icon"
          onClick={toggleVideo}
          className="h-8 w-8"
          disabled={!localStream}
        >
          {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
        </Button>
        
        <Button
          variant={isAudioEnabled ? 'default' : 'outline'}
          size="icon"
          onClick={toggleAudio}
          className="h-8 w-8"
          disabled={!localStream}
        >
          {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
        </Button>
      </Card>

      {/* Камеры участников */}
      <div className="flex gap-2">
        {allParticipants.map((participant) => {
          const isExpanded = expandedId === participant.id;
          
          return (
            <Card 
              key={participant.id}
              className={`relative overflow-hidden border-2 transition-all ${
                isExpanded 
                  ? 'w-80 h-60' 
                  : 'w-32 h-24'
              } ${
                participant.isDM 
                  ? 'border-primary' 
                  : 'border-border'
              }`}
            >
              {/* Видео */}
              <div className="w-full h-full bg-muted flex items-center justify-center">
                {participant.stream && participant.id === 'local' ? (
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${!isVideoEnabled ? 'hidden' : ''}`}
                  />
                ) : participant.stream ? (
                  <video
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : null}
                
                {/* Аватар-заглушка когда нет видео */}
                {(!participant.stream || (participant.id === 'local' && !isVideoEnabled)) && (
                  <div className="flex items-center justify-center w-full h-full bg-gradient-to-br from-primary/20 to-primary/5">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Информация */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <div className="flex items-center justify-between">
                  <span className="text-white text-xs font-semibold truncate">
                    {participant.name}
                  </span>
                  <div className="flex items-center gap-1">
                    {participant.isDM && (
                      <Badge variant="default" className="text-xs px-1 py-0">
                        DM
                      </Badge>
                    )}
                    {participant.id === 'local' && (
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
                onClick={() => setExpandedId(isExpanded ? null : participant.id)}
              >
                <Maximize2 className="h-3 w-3 text-white" />
              </Button>

              {/* Индикатор микрофона */}
              {participant.id === 'local' && (
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
        })}
      </div>
    </div>
  );
};
