import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useUserRole } from "@/hooks/use-auth";
import { useBattleSession } from "@/hooks/useBattleSession";

/**
 * Главный объект состояния карты,
 * используется BattleMapUI и всеми подвластными компонентами.
 */
export type MapState = {
  sessionId: string;

  mapUrl: string | null;
  mapSize: { width: number; height: number } | null;

  isDM: boolean;
  loading: boolean;

  setMapUrl: (url: string | null) => void;
  setMapFile: (file: File) => Promise<void>;
  setMapSize: (w: number, h: number) => void;

  refreshSessionMap: () => void;
};

export function useBattleMapState(sessionId: string): MapState {
  const { toast } = useToast();
  const { isDM } = useUserRole();
  const { session, currentMap, saveMapFromUrl, saveMapToSession, loading: loadingSession } =
    useBattleSession(sessionId);

  const [mapUrl, setMapUrlState] = useState<string | null>(null);
  const [mapSize, setMapSizeState] = useState<{ width: number; height: number } | null>(null);

  const mapLoadedOnce = useRef(false);

  // --- Инициализация сессии ---
  useEffect(() => {
    if (!sessionId) return;

    // Сброс
    setMapUrlState(null);
    setMapSizeState(null);
    mapLoadedOnce.current = false;
  }, [sessionId]);

  // --- DM: загружаем карту из session.currentMap ---
  useEffect(() => {
    if (!isDM) return;
    if (!currentMap) return;

    if (currentMap.file_url && !mapLoadedOnce.current) {
      setMapUrlState(currentMap.file_url);

      if (currentMap.width && currentMap.height) {
        setMapSizeState({
          width: currentMap.width,
          height: currentMap.height,
        });
      }

      mapLoadedOnce.current = true;
    }
  }, [currentMap, isDM]);

  // --- PLAYER: получаем URL карты из live-sync (game_sessions) ---
  useEffect(() => {
    if (isDM || !sessionId) return;

    const loadMapUrl = async () => {
      const { data } = await supabase
        .from('game_sessions')
        .select('current_map_url')
        .eq('id', sessionId)
        .maybeSingle();

      if (data?.current_map_url) {
        setMapUrlState(data.current_map_url);
      } else {
        setMapUrlState(null);
      }
    };

    loadMapUrl();

    // Real-time подписка на изменения
    const channel = supabase
      .channel(`map-sync-player-${sessionId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${sessionId}`
        },
        (payload) => {
          const newMapUrl = (payload.new as any).current_map_url;
          
          if (newMapUrl) {
            setMapUrlState(newMapUrl);
            toast({
              title: "Карта обновлена",
              description: "Мастер сменил карту боя",
            });
          } else {
            setMapUrlState(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, isDM, toast]);

  // --- Очистка blob URLs ---
  useEffect(() => {
    return () => {
      if (mapUrl?.startsWith('blob:')) {
        URL.revokeObjectURL(mapUrl);
      }
    };
  }, [mapUrl]);

  // --- Загружаем карту в Supabase при локальной загрузке DM ---
  const setMapFile = useCallback(
    async (file: File) => {
      if (!isDM) return;

      const localUrl = URL.createObjectURL(file);
      setMapUrlState(localUrl);

      const img = await loadImage(localUrl);
      const width = img.naturalWidth;
      const height = img.naturalHeight;

      setMapSizeState({ width, height });

      const result = await saveMapToSession(file, file.name);

      if (result?.file_url) {
        setMapUrlState(result.file_url);
        toast({
          title: "Карта обновлена",
          description: "Карта сохранена и синхронизирована с игроками.",
        });
      }
    },
    [isDM, saveMapToSession, toast]
  );

  // --- Устанавливаем карту через URL ---
  const setMapUrl = useCallback(
    (url: string | null) => {
      if (!isDM) return;
      setMapUrlState(url);
    },
    [isDM]
  );

  // --- Установка размеров карты (используется onLoad изображения) ---
  const setMapSize = useCallback((width: number, height: number) => {
    setMapSizeState({ width, height });
  }, []);

  // --- Ручное обновление карты из сессии ---
  const refreshSessionMap = useCallback(() => {
    if (isDM && currentMap?.file_url) {
      setMapUrlState(currentMap.file_url);
      if (currentMap.width && currentMap.height) {
        setMapSizeState({
          width: currentMap.width,
          height: currentMap.height,
        });
      }
    }
  }, [isDM, currentMap]);

  return {
    sessionId,

    mapUrl,
    mapSize,

    isDM,
    loading: loadingSession,

    setMapUrl,
    setMapFile,
    setMapSize,

    refreshSessionMap,
  };
}

// === Utility ===
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}
