import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Video, VideoOff, Mic, MicOff, Users, X } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  stream?: MediaStream;
  isDM: boolean;
}

interface VideoChatProps {
  sessionId: string;
  playerName: string;
  isDM?: boolean;
  onClose?: () => void;
}

export const VideoChat: React.FC<VideoChatProps> = ({
  sessionId,
  playerName,
  isDM = false,
  onClose
}) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});

  // Инициализация медиа устройств
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
  const connectToRoom = () => {
    setIsConnected(true);
    // Здесь будет логика WebRTC подключения
    console.log(`Подключение к видеочату сессии: ${sessionId}`);
  };

  // Отключение от комнаты
  const disconnectFromRoom = () => {
    setIsConnected(false);
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
  };

  useEffect(() => {
    initializeMedia();
    
    return () => {
      disconnectFromRoom();
    };
  }, []);

  return (
    <Card className="w-full h-full bg-background/95 backdrop-blur">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="h-5 w-5" />
            Видеочат ({participants.length + 1})
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Локальное видео */}
        <div className="relative">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-32 bg-muted rounded-lg object-cover ${!isVideoEnabled ? 'opacity-0' : ''}`}
          />
          {!isVideoEnabled && (
            <div className="absolute inset-0 bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <VideoOff className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{playerName}</p>
                <p className="text-xs text-muted-foreground">{isDM ? 'DM' : 'Игрок'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Удаленные участники */}
        {participants.map((participant) => (
          <div key={participant.id} className="relative">
            <video
              ref={(el) => {
                if (el) remoteVideoRefs.current[participant.id] = el;
              }}
              autoPlay
              playsInline
              className="w-full h-32 bg-muted rounded-lg object-cover"
            />
            <div className="absolute bottom-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
              {participant.name} {participant.isDM ? '(DM)' : ''}
            </div>
          </div>
        ))}

        {/* Если нет участников */}
        {participants.length === 0 && isConnected && (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Ожидание других участников...</p>
          </div>
        )}

        {/* Управление */}
        <div className="flex justify-center gap-2">
          <Button
            variant={isVideoEnabled ? "default" : "secondary"}
            size="sm"
            onClick={toggleVideo}
            disabled={!localStream}
          >
            {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
          </Button>
          
          <Button
            variant={isAudioEnabled ? "default" : "secondary"}
            size="sm"
            onClick={toggleAudio}
            disabled={!localStream}
          >
            {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
          </Button>
          
          {!isConnected ? (
            <Button onClick={connectToRoom} disabled={!localStream}>
              Подключиться
            </Button>
          ) : (
            <Button variant="destructive" onClick={disconnectFromRoom}>
              Отключиться
            </Button>
          )}
        </div>

        {/* Статус */}
        <div className="text-center text-sm text-muted-foreground">
          {isConnected ? (
            <span className="text-green-500">● Подключен к видеочату</span>
          ) : (
            <span>○ Не подключен</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};