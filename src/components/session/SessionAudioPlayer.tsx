import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  SkipBack, 
  SkipForward,
  Upload,
  Music
} from 'lucide-react';
import { useSessionSync, SessionAudio } from '@/hooks/useSessionSync';
import { useToast } from '@/hooks/use-toast';

interface SessionAudioPlayerProps {
  sessionId: string;
  isDM?: boolean;
  className?: string;
}

export const SessionAudioPlayer: React.FC<SessionAudioPlayerProps> = ({
  sessionId,
  isDM = false,
  className = ""
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { sessionState, audio, updateAudio } = useSessionSync(sessionId);
  const { toast } = useToast();

  const currentAudio = audio.find(track => track.id === sessionState?.active_audio_id);

  // Синхронизируем HTML5 аудио с состоянием
  useEffect(() => {
    if (!audioRef.current || !currentAudio) return;

    const audioElement = audioRef.current;
    
    if (currentAudio.is_playing) {
      audioElement.play().catch(console.error);
    } else {
      audioElement.pause();
    }

    audioElement.volume = currentAudio.volume;
    audioElement.loop = currentAudio.is_loop;
    
    // Синхронизируем позицию
    if (Math.abs(audioElement.currentTime - currentAudio.position) > 2) {
      audioElement.currentTime = currentAudio.position;
    }
  }, [currentAudio]);

  // Обновляем позицию трека
  useEffect(() => {
    if (!audioRef.current || !currentAudio || !isDM) return;

    const audioElement = audioRef.current;
    const interval = setInterval(() => {
      if (!audioElement.paused) {
        updateAudio(currentAudio.id, {
          position: audioElement.currentTime
        });
      }
    }, 5000); // Обновляем каждые 5 секунд

    return () => clearInterval(interval);
  }, [currentAudio, isDM, updateAudio]);

  const handlePlayPause = async () => {
    if (!currentAudio || !isDM) return;

    await updateAudio(currentAudio.id, {
      is_playing: !currentAudio.is_playing
    });
  };

  const handleVolumeChange = async (volume: number[]) => {
    if (!currentAudio || !isDM) return;

    await updateAudio(currentAudio.id, {
      volume: volume[0] / 100
    });
  };

  const handleTrackSelect = async (trackId: string) => {
    if (!isDM) return;

    // Останавливаем текущий трек
    if (currentAudio) {
      await updateAudio(currentAudio.id, { is_playing: false });
    }

    // Включаем новый трек
    await updateAudio(trackId, { is_playing: true });
  };

  if (!currentAudio && audio.length === 0) {
    return (
      <Card className={`bg-background/90 backdrop-blur-sm ${className}`}>
        <CardHeader className="py-3 px-4">
          <CardTitle className="text-sm flex items-center gap-2">
            <Music className="h-4 w-4" />
            Музыка сессии
          </CardTitle>
        </CardHeader>
        <CardContent className="py-2">
          <div className="text-center text-muted-foreground text-xs">
            {isDM ? 'Загрузите музыку для сессии' : 'ДМ не добавил музыку'}
          </div>
          {isDM && (
            <Button size="sm" className="w-full mt-2">
              <Upload className="h-3 w-3 mr-1" />
              Загрузить музыку
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-background/90 backdrop-blur-sm ${className}`}>
      <CardHeader className="py-3 px-4">
        <CardTitle className="text-sm flex items-center gap-2">
          <Music className="h-4 w-4" />
          Музыка сессии
        </CardTitle>
      </CardHeader>
      
      <CardContent className="py-2 space-y-3">
        {/* Скрытый аудио элемент */}
        {currentAudio && (
          <audio
            ref={audioRef}
            src={currentAudio.file_url}
            preload="auto"
          />
        )}

        {/* Информация о треке */}
        {currentAudio && (
          <div className="text-center">
            <div className="text-xs font-medium truncate">
              {currentAudio.name}
            </div>
            <div className="text-xs text-muted-foreground">
              {currentAudio.audio_type === 'background' && '🎵 Фон'}
              {currentAudio.audio_type === 'effect' && '🔊 Эффект'}
              {currentAudio.audio_type === 'ambient' && '🌊 Амбиент'}
            </div>
          </div>
        )}

        {/* Управление воспроизведением (только для ДМ) */}
        {isDM && currentAudio && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePlayPause}
              className="h-8 w-8 p-0"
            >
              {currentAudio.is_playing ? (
                <Pause className="h-3 w-3" />
              ) : (
                <Play className="h-3 w-3" />
              )}
            </Button>
          </div>
        )}

        {/* Индикатор воспроизведения для игроков */}
        {!isDM && currentAudio && (
          <div className="flex items-center justify-center">
            <div className={`w-2 h-2 rounded-full ${
              currentAudio.is_playing 
                ? 'bg-green-500 animate-pulse' 
                : 'bg-muted-foreground'
            }`} />
            <span className="text-xs ml-2">
              {currentAudio.is_playing ? 'Воспроизводится' : 'Пауза'}
            </span>
          </div>
        )}

        {/* Контроль громкости */}
        {currentAudio && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {currentAudio.volume === 0 ? (
                <VolumeX className="h-3 w-3" />
              ) : (
                <Volume2 className="h-3 w-3" />
              )}
              <span className="text-xs w-8">{Math.round(currentAudio.volume * 100)}%</span>
            </div>
            {isDM && (
              <Slider
                value={[currentAudio.volume * 100]}
                onValueChange={handleVolumeChange}
                max={100}
                step={5}
                className="w-full"
              />
            )}
          </div>
        )}

        {/* Список треков (для ДМ) */}
        {isDM && audio.length > 1 && (
          <div className="space-y-1">
            <div className="text-xs font-medium">Плейлист:</div>
            <div className="space-y-1 max-h-24 overflow-y-auto">
              {audio.map((track) => (
                <button
                  key={track.id}
                  onClick={() => handleTrackSelect(track.id)}
                  className={`w-full text-left text-xs p-1 rounded truncate hover:bg-muted ${
                    track.id === currentAudio?.id ? 'bg-primary/10' : ''
                  }`}
                >
                  {track.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};