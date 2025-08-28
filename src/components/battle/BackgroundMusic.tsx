import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Play, Pause, Volume2, Music, Youtube, Upload } from 'lucide-react';
import { useSocket } from '@/contexts/SocketContext';

interface BackgroundMusicProps {
  isDM?: boolean;
}

interface MusicState {
  url: string;
  youtubeVideoId?: string;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  type: 'audio' | 'youtube';
}

// Объявляем глобальный тип для YouTube API
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function BackgroundMusic({ isDM = false }: BackgroundMusicProps) {
  const [musicUrl, setMusicUrl] = useState('');
  const [youtubeVideoId, setYoutubeVideoId] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState([50]);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [musicType, setMusicType] = useState<'audio' | 'youtube'>('audio');
  const [youtubeReady, setYoutubeReady] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const youtubePlayerRef = useRef<any>(null);
  const { sendUpdate, lastUpdate } = useSocket();

  // Загружаем YouTube API
  useEffect(() => {
    if (!window.YT) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.head.appendChild(script);

      window.onYouTubeIframeAPIReady = () => {
        setYoutubeReady(true);
      };
    } else {
      setYoutubeReady(true);
    }
  }, []);

  // Функция для извлечения YouTube Video ID из URL
  const extractYouTubeVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /(?:youtube\.com\/v\/)([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    
    return null;
  };

  // Обработка YouTube плеера
  const initializeYouTubePlayer = (videoId: string) => {
    if (!youtubeReady || !window.YT) return;

    if (youtubePlayerRef.current) {
      youtubePlayerRef.current.destroy();
    }

    youtubePlayerRef.current = new window.YT.Player('youtube-player', {
      height: '0',
      width: '0',
      videoId: videoId,
      playerVars: {
        autoplay: 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
      },
      events: {
        onReady: (event: any) => {
          event.target.setVolume(volume[0]);
        },
        onStateChange: (event: any) => {
          const state = event.data;
          if (state === window.YT.PlayerState.PLAYING) {
            setIsPlaying(true);
          } else if (state === window.YT.PlayerState.PAUSED || state === window.YT.PlayerState.ENDED) {
            setIsPlaying(false);
          }
        }
      }
    });
  };

  // Обработка обновлений от сокета для игроков
  useEffect(() => {
    if (!isDM && lastUpdate?.music) {
      const musicState: MusicState = lastUpdate.music;
      
      if (musicState.url !== musicUrl) {
        setMusicUrl(musicState.url);
        if (musicState.type === 'youtube' && musicState.youtubeVideoId) {
          setYoutubeVideoId(musicState.youtubeVideoId);
          setMusicType('youtube');
          if (youtubeReady) {
            initializeYouTubePlayer(musicState.youtubeVideoId);
          }
        } else {
          setMusicType('audio');
        }
      }
      
      if (musicState.type === 'youtube' && youtubePlayerRef.current) {
        youtubePlayerRef.current.setVolume(musicState.volume);
        
        if (musicState.isPlaying && !isPlaying) {
          youtubePlayerRef.current.seekTo(musicState.currentTime);
          youtubePlayerRef.current.playVideo();
        } else if (!musicState.isPlaying && isPlaying) {
          youtubePlayerRef.current.pauseVideo();
        }
      } else if (musicState.type === 'audio' && audioRef.current) {
        audioRef.current.volume = musicState.volume / 100;
        
        if (musicState.isPlaying && !isPlaying) {
          audioRef.current.currentTime = musicState.currentTime;
          audioRef.current.play();
        } else if (!musicState.isPlaying && isPlaying) {
          audioRef.current.pause();
        }
      }
      
      setVolume([musicState.volume]);
      setIsPlaying(musicState.isPlaying);
    }
  }, [lastUpdate, isDM, musicUrl, isPlaying, youtubeReady]);

  // Отправка обновлений ДМом
  const sendMusicUpdate = (updates: Partial<MusicState>) => {
    if (isDM && sendUpdate) {
      const musicState: MusicState = {
        url: musicUrl,
        youtubeVideoId: youtubeVideoId || undefined,
        isPlaying,
        volume: volume[0],
        currentTime: getCurrentTime(),
        type: musicType,
        ...updates
      };
      
      sendUpdate({ music: musicState });
    }
  };

  const getCurrentTime = (): number => {
    if (musicType === 'youtube' && youtubePlayerRef.current) {
      return youtubePlayerRef.current.getCurrentTime() || 0;
    } else if (musicType === 'audio' && audioRef.current) {
      return audioRef.current.currentTime || 0;
    }
    return 0;
  };

  const handlePlay = () => {
    if (musicType === 'youtube' && youtubePlayerRef.current) {
      if (isPlaying) {
        youtubePlayerRef.current.pauseVideo();
        setIsPlaying(false);
        sendMusicUpdate({ isPlaying: false });
      } else {
        youtubePlayerRef.current.playVideo();
        setIsPlaying(true);
        sendMusicUpdate({ isPlaying: true, currentTime: getCurrentTime() });
      }
    } else if (musicType === 'audio' && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        sendMusicUpdate({ isPlaying: false });
      } else {
        audioRef.current.play();
        setIsPlaying(true);
        sendMusicUpdate({ isPlaying: true, currentTime: getCurrentTime() });
      }
    }
  };

  const handleVolumeChange = (newVolume: number[]) => {
    setVolume(newVolume);
    
    if (musicType === 'youtube' && youtubePlayerRef.current) {
      youtubePlayerRef.current.setVolume(newVolume[0]);
    } else if (musicType === 'audio' && audioRef.current) {
      audioRef.current.volume = newVolume[0] / 100;
    }
    
    sendMusicUpdate({ volume: newVolume[0] });
  };

  const handleUrlSubmit = () => {
    if (!musicUrl) return;

    const videoId = extractYouTubeVideoId(musicUrl);
    
    if (videoId) {
      // YouTube URL
      setYoutubeVideoId(videoId);
      setMusicType('youtube');
      if (youtubeReady) {
        initializeYouTubePlayer(videoId);
      }
      sendMusicUpdate({ 
        url: musicUrl, 
        youtubeVideoId: videoId,
        type: 'youtube',
        isPlaying: false, 
        currentTime: 0 
      });
    } else {
      // Обычный аудио URL
      setMusicType('audio');
      if (audioRef.current) {
        audioRef.current.load();
      }
      sendMusicUpdate({ 
        url: musicUrl, 
        type: 'audio',
        isPlaying: false, 
        currentTime: 0 
      });
    }
  };

  const handleTimeUpdate = () => {
    if (musicType === 'audio' && audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      setDuration(audioRef.current.duration || 0);
    } else if (musicType === 'youtube' && youtubePlayerRef.current) {
      setCurrentTime(youtubePlayerRef.current.getCurrentTime() || 0);
      setDuration(youtubePlayerRef.current.getDuration() || 0);
    }
  };

  // Обновление времени для YouTube
  useEffect(() => {
    if (musicType === 'youtube' && isPlaying) {
      const interval = setInterval(handleTimeUpdate, 1000);
      return () => clearInterval(interval);
    }
  }, [musicType, isPlaying]);

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
          {musicType === 'youtube' && (
            <Badge variant="secondary" className="text-xs">
              <Youtube className="h-3 w-3 mr-1" />
              YouTube
            </Badge>
          )}
          {musicType === 'audio' && (
            <Badge variant="outline" className="text-xs">
              <Upload className="h-3 w-3 mr-1" />
              Аудио
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isDM && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="YouTube URL или прямая ссылка на аудио..."
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
            <div className="text-xs text-muted-foreground">
              Поддерживается YouTube (видео будет скрыто, воспроизводится только аудио) и прямые ссылки на аудиофайлы
            </div>
          </div>
        )}

        {/* Скрытый YouTube плеер */}
        {musicType === 'youtube' && (
          <div style={{ display: 'none' }}>
            <div id="youtube-player"></div>
          </div>
        )}

        {/* Обычный аудио плеер */}
        {musicType === 'audio' && musicUrl && (
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
        )}

        {(musicUrl || youtubeVideoId) && (
          <>
            <div className="flex items-center gap-3">
              {isDM && (
                <Button
                  onClick={handlePlay}
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  disabled={musicType === 'youtube' && !youtubeReady}
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

        {musicType === 'youtube' && !youtubeReady && (
          <div className="text-xs text-muted-foreground text-center py-2">
            Загрузка YouTube API...
          </div>
        )}
      </CardContent>
    </Card>
  );
}