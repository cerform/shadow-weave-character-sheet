import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, Music } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';

interface BackgroundMusicProps {
  isDM?: boolean;
}

interface MusicState {
  url: string;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
}

export default function BackgroundMusic({ isDM = false }: BackgroundMusicProps) {
  const [musicUrl, setMusicUrl] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { sendUpdate, lastUpdate } = useSocket();

  // Обработка обновлений от сокета для игроков
  useEffect(() => {
    if (!isDM && lastUpdate?.music) {
      const musicState: MusicState = lastUpdate.music;
      
      if (musicState.url !== musicUrl) {
        setMusicUrl(musicState.url);
      }
      
      if (audioRef.current) {
        audioRef.current.volume = musicState.volume / 100;
        
        if (musicState.isPlaying && !isPlaying) {
          audioRef.current.currentTime = musicState.currentTime;
          audioRef.current.play();
          setIsPlaying(true);
        } else if (!musicState.isPlaying && isPlaying) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      }
      
      setVolume([musicState.volume]);
    }
  }, [lastUpdate, isDM, musicUrl, isPlaying]);

  // Отправка обновлений ДМом
  const sendMusicUpdate = (updates: Partial<MusicState>) => {
    if (isDM && sendUpdate) {
      const musicState: MusicState = {
        url: musicUrl,
        isPlaying,
        volume: volume[0],
        currentTime: audioRef.current?.currentTime || 0,
        ...updates
      };
      
      sendUpdate({ music: musicState });
    }
  };

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        sendMusicUpdate({ isPlaying: false });
      } else {
        audioRef.current.play();
        setIsPlaying(true);
        sendMusicUpdate({ isPlaying: true, currentTime: audioRef.current.currentTime });
      }
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume[0] / 100;
      sendMusicUpdate({ volume: newVolume[0] });
    }
  };

  const handleUrlSubmit = () => {
    if (musicUrl && audioRef.current) {
      audioRef.current.load();
      sendMusicUpdate({ url: musicUrl, isPlaying: false, currentTime: 0 });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Music className="h-4 w-4" />
          {isDM ? 'Управление фоновой музыкой' : 'Фоновая музыка'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isDM && (
          <div className="flex gap-2">
            <Input
              type="url"
              placeholder="URL аудиофайла..."
              value={musicUrl}
              onChange={(e) => setMusicUrl(e.target.value)}
              className="text-xs"
            />
            <Button 
              onClick={handleUrlSubmit}
              size="sm"
              disabled={!musicUrl}
            >
              Загрузить
            </Button>
          </div>
        )}

        {musicUrl && (
          <>
            <audio
              ref={audioRef}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleTimeUpdate}
              onEnded={() => {
                setIsPlaying(false);
                sendMusicUpdate({ isPlaying: false });
              }}
            >
              <source src={musicUrl} />
            </audio>

            <div className="flex items-center gap-3">
              {isDM && (
                <Button
                  onClick={handlePlay}
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                >
                  {isPlaying ? (
                    <Pause className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                </Button>
              )}

              <div className="flex-1 text-xs text-muted-foreground">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Volume2 className="h-3 w-3 text-muted-foreground" />
              <Slider
                value={volume}
                onValueChange={handleVolumeChange}
                max={100}
                step={1}
                className="flex-1"
                disabled={!isDM}
              />
              <span className="text-xs text-muted-foreground w-8">
                {volume[0]}%
              </span>
            </div>
          </>
        )}

        {!musicUrl && !isDM && (
          <div className="text-xs text-muted-foreground text-center py-4">
            ДМ не включил фоновую музыку
          </div>
        )}
      </CardContent>
    </Card>
  );
}