import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

interface DMSession {
  id: string;
  dm_id: string;
  name: string;
  description?: string;
  current_map_url?: string;
  settings: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface BattleMap {
  id: string;
  session_id: string;
  name: string;
  image_url?: string;
  file_path?: string;
  file_url?: string;
  width?: number;
  height?: number;
  grid_size: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useBattleSession = (sessionId?: string) => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [session, setSession] = useState<DMSession | null>(null);
  const [currentMap, setCurrentMap] = useState<BattleMap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Получение или создание сессии по умолчанию
  const ensureSession = async () => {
    if (!isAuthenticated || !user) return null;

    try {
      // Если передан sessionId, ищем конкретную сессию
      if (sessionId) {
        const { data: existingSession, error: sessionError } = await supabase
          .from('dm_sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (!sessionError && existingSession) {
          setSession(existingSession);
          return existingSession;
        }
      }

      // Ищем активную сессию пользователя
      const { data: activeSessions, error: activeError } = await supabase
        .from('dm_sessions')
        .select('*')
        .eq('dm_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (activeError) throw activeError;

      if (activeSessions && activeSessions.length > 0) {
        const activeSession = activeSessions[0];
        setSession(activeSession);
        return activeSession;
      }

      // Создаем новую сессию
      const { data: newSession, error: createError } = await supabase
        .from('dm_sessions')
        .insert({
          dm_id: user.id,
          name: sessionId ? `Сессия ${sessionId.slice(0, 8)}` : 'Основная сессия',
          description: 'Автоматически созданная сессия',
          is_active: true
        })
        .select()
        .single();

      if (createError) throw createError;

      setSession(newSession);
      return newSession;
    } catch (err: any) {
      console.error('Ошибка создания/получения сессии:', err);
      setError(err.message);
      return null;
    }
  };

  // Загрузка текущей карты сессии
  const loadCurrentMap = async (sessionId: string) => {
    try {
      const { data: maps, error: mapsError } = await supabase
        .from('battle_maps')
        .select('*')
        .eq('session_id', sessionId)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);

      if (mapsError) throw mapsError;

      if (maps && maps.length > 0) {
        setCurrentMap(maps[0]);
        return maps[0];
      }
    } catch (err: any) {
      console.error('Ошибка загрузки карты:', err);
    }
    return null;
  };

  // Сохранение карты в Supabase Storage и базу данных
  const saveMapToSession = async (
    file: File,
    mapName?: string,
    dimensions?: { width: number; height: number }
  ) => {
    if (!session || !user) {
      toast({
        title: "Ошибка",
        description: "Нет активной сессии для сохранения карты",
        variant: "destructive"
      });
      return null;
    }

    try {
      setLoading(true);
      
      // Создаем путь к файлу: user_id/session_id/filename
      const fileName = `${file.name}`;
      const filePath = `${user.id}/${session.id}/${fileName}`;

      console.log('🗺️ Загружаем карту в Storage:', filePath);

      // Загружаем файл в Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('battle-maps')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      // Получаем публичный URL
      const { data: urlData } = supabase.storage
        .from('battle-maps')
        .getPublicUrl(filePath);

      console.log('🗺️ Получен URL карты:', urlData.publicUrl);

      // Сохраняем информацию о карте в базу данных
      const { data: mapData, error: mapError } = await supabase
        .from('battle_maps')
        .insert({
          session_id: session.id,
          name: mapName || file.name,
          image_url: urlData.publicUrl,
          file_path: filePath,
          file_url: urlData.publicUrl,
          width: dimensions?.width,
          height: dimensions?.height,
          grid_size: 64,
          is_active: true
        })
        .select()
        .single();

      if (mapError) throw mapError;

      // Обновляем текущую карту сессии
      await supabase
        .from('dm_sessions')
        .update({
          current_map_url: urlData.publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', session.id);

      setCurrentMap(mapData);
      
      toast({
        title: "Карта сохранена!",
        description: `Карта "${mapData.name}" успешно сохранена в сессии`,
      });

      console.log('✅ Карта сохранена:', mapData);
      return mapData;

    } catch (err: any) {
      console.error('❌ Ошибка сохранения карты:', err);
      toast({
        title: "Ошибка сохранения",
        description: err.message || "Не удалось сохранить карту",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Загрузка карты из URL (blob)
  const saveMapFromUrl = async (
    imageUrl: string, 
    mapName?: string,
    dimensions?: { width: number; height: number }
  ) => {
    if (!session || !user) return null;

    try {
      // Конвертируем blob URL в File для загрузки
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], mapName || 'battle-map.png', { type: blob.type });

      return await saveMapToSession(file, mapName, dimensions);
    } catch (err: any) {
      console.error('❌ Ошибка конвертации URL в файл:', err);
      toast({
        title: "Ошибка",
        description: "Не удалось сохранить карту",
        variant: "destructive"
      });
      return null;
    }
  };

  // Инициализация при монтировании
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      setError(null);

      const sessionData = await ensureSession();
      if (sessionData) {
        await loadCurrentMap(sessionData.id);
      }

      setLoading(false);
    };

    if (isAuthenticated) {
      initialize();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, user, sessionId]);

  return {
    session,
    currentMap,
    loading,
    error,
    saveMapToSession,
    saveMapFromUrl,
    ensureSession,
    loadCurrentMap
  };
};