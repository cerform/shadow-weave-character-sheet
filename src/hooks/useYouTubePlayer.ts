// Хук для YouTube плеера
import { useState, useEffect, useRef } from 'react';

export interface YouTubePlayerState {
  isReady: boolean;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  error: string | null;
}

export interface YouTubePlayer {
  playVideo: () => void;
  pauseVideo: () => void;
  stopVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead?: boolean) => void;
  setVolume: (volume: number) => void;
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  destroy: () => void;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export function useYouTubePlayer(
  videoId: string,
  elementId: string = 'youtube-player'
) {
  const [state, setState] = useState<YouTubePlayerState>({
    isReady: false,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 50,
    error: null,
  });
  
  const playerRef = useRef<YouTubePlayer | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Загрузка YouTube API
  useEffect(() => {
    if (!window.YT) {
      const script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api';
      script.async = true;
      document.head.appendChild(script);

      window.onYouTubeIframeAPIReady = () => {
        setState(prev => ({ ...prev, isReady: true }));
      };
    } else if (window.YT.Player) {
      setState(prev => ({ ...prev, isReady: true }));
    }
  }, []);

  // Создание плеера
  useEffect(() => {
    if (!state.isReady || !videoId || !window.YT) return;

    try {
      if (playerRef.current) {
        playerRef.current.destroy();
      }

      playerRef.current = new window.YT.Player(elementId, {
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
          iv_load_policy: 3,
          cc_load_policy: 0,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            const duration = event.target.getDuration();
            setState(prev => ({ 
              ...prev, 
              duration,
              volume: 50 
            }));
            event.target.setVolume(50);
          },
          onStateChange: (event: any) => {
            const playerState = event.data;
            const isPlaying = playerState === window.YT.PlayerState.PLAYING;
            
            setState(prev => ({ 
              ...prev, 
              isPlaying 
            }));

            // Запускаем или останавливаем обновление времени
            if (isPlaying) {
              intervalRef.current = setInterval(() => {
                if (playerRef.current) {
                  const currentTime = playerRef.current.getCurrentTime();
                  setState(prev => ({ 
                    ...prev, 
                    currentTime 
                  }));
                }
              }, 1000);
            } else {
              if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
              }
            }
          },
          onError: (event: any) => {
            setState(prev => ({ 
              ...prev, 
              error: `YouTube Error: ${event.data}` 
            }));
          }
        }
      });
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }));
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (playerRef.current) {
        playerRef.current.destroy();
      }
    };
  }, [state.isReady, videoId, elementId]);

  // Методы управления плеером
  const play = () => {
    if (playerRef.current) {
      playerRef.current.playVideo();
    }
  };

  const pause = () => {
    if (playerRef.current) {
      playerRef.current.pauseVideo();
    }
  };

  const stop = () => {
    if (playerRef.current) {
      playerRef.current.stopVideo();
    }
  };

  const seekTo = (seconds: number) => {
    if (playerRef.current) {
      playerRef.current.seekTo(seconds, true);
    }
  };

  const setVolume = (volume: number) => {
    if (playerRef.current) {
      playerRef.current.setVolume(volume);
      setState(prev => ({ ...prev, volume }));
    }
  };

  return {
    state,
    player: playerRef.current,
    play,
    pause,
    stop,
    seekTo,
    setVolume,
  };
}

// Утилита для извлечения YouTube Video ID
export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /(?:youtube\.com\/v\/)([^&\n?#]+)/,
    /(?:youtube\.com\/live\/)([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

// Проверка, является ли URL YouTube ссылкой
export function isYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null;
}