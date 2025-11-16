import { useState, useCallback, useEffect } from 'react';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';
import { useBattleSession } from '@/hooks/useBattleSession';
import { useBattleMapSync } from '@/hooks/useBattleMapSync';
import { useToast } from '@/hooks/use-toast';
import { MAP_W, MAP_H } from '../utils/constants';

export function useBattleMapState(sessionId: string, isDM: boolean) {
  const { toast } = useToast();
  const { mapImageUrl, setMapImageUrl } = useEnhancedBattleStore();
  const { session, currentMap, saveMapFromUrl, saveMapToSession, loading } = useBattleSession(sessionId);
  
  const [mapDimensions, setMapDimensions] = useState({ width: MAP_W, height: MAP_H });
  const [autoFitMap, setAutoFitMap] = useState(true);

  // Sync map for players
  useBattleMapSync(sessionId, isDM);

  // Load map dimensions from current map
  useEffect(() => {
    if (currentMap) {
      setMapDimensions({
        width: currentMap.width || MAP_W,
        height: currentMap.height || MAP_H,
      });
    }
  }, [currentMap]);

  const handleMapUpload = useCallback(
    async (file: File) => {
      try {
        const result = await saveMapToSession(file);
        if (result) {
          toast({
            title: "Карта загружена",
            description: `Карта "${file.name}" успешно загружена`,
          });
        }
      } catch (error) {
        console.error('Error uploading map:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить карту",
          variant: "destructive",
        });
      }
    },
    [saveMapToSession, toast]
  );

  const handleMapFromUrl = useCallback(
    async (url: string) => {
      try {
        await saveMapFromUrl(url);
        toast({
          title: "Карта загружена",
          description: "Карта успешно загружена из URL",
        });
      } catch (error) {
        console.error('Error loading map from URL:', error);
        toast({
          title: "Ошибка",
          description: "Не удалось загрузить карту из URL",
          variant: "destructive",
        });
      }
    },
    [saveMapFromUrl, toast]
  );

  return {
    mapImageUrl,
    mapDimensions,
    autoFitMap,
    session,
    currentMap,
    loading,
    setMapImageUrl,
    setMapDimensions,
    setAutoFitMap,
    handleMapUpload,
    handleMapFromUrl,
  };
}
