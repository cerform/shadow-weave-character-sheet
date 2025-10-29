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
      // Если передан sessionId, ищем конкретную сессию в game_sessions
      if (sessionId) {
        console.log('🔍 Ищем существующую сессию в game_sessions:', sessionId);
        const { data: existingSession, error: sessionError } = await supabase
          .from('game_sessions')
          .select('*')
          .eq('id', sessionId)
          .maybeSingle();

        if (!sessionError && existingSession) {
          console.log('✅ Найдена существующая сессия:', existingSession.id);
          setSession(existingSession as any);
          return existingSession as any;
        }
      }

      // Если sessionId не передан - ВСЕГДА создаем НОВУЮ сессию
      console.log('🆕 Создание новой сессии в game_sessions');
      
      // Деактивируем все старые активные сессии этого DM
      await supabase
        .from('game_sessions')
        .update({ is_active: false })
        .eq('dm_id', user.id)
        .eq('is_active', true);

      // Генерируем уникальный код сессии
      const { data: codeData } = await supabase.rpc('generate_session_code');
      const sessionCode = codeData || Math.random().toString(36).substring(2, 8).toUpperCase();

      // Создаем новую сессию в game_sessions
      const { data: newSession, error: createError } = await supabase
        .from('game_sessions')
        .insert({
          dm_id: user.id,
          name: `Новая сессия ${new Date().toLocaleString('ru')}`,
          description: 'Автоматически созданная сессия',
          session_code: sessionCode,
          is_active: true,
          current_map_url: null,
          max_players: 6
        })
        .select()
        .single();

      if (createError) throw createError;

      console.log('✅ Создана новая пустая сессия в game_sessions:', newSession);
      setSession(newSession as any);
      return newSession as any;
    } catch (err: any) {
      console.error('Ошибка создания/получения сессии:', err);
      setError(err.message);
      return null;
    }
  };

  // Загрузка текущей карты сессии из game_sessions
  const loadCurrentMap = async (sessionId: string) => {
    try {
      const { data: session, error: sessionError } = await supabase
        .from('game_sessions')
        .select('current_map_url')
        .eq('id', sessionId)
        .maybeSingle();

      if (sessionError) throw sessionError;

      if (session?.current_map_url) {
        // Создаем запись в battle_maps для отображения
        const mapData: BattleMap = {
          id: sessionId,
          session_id: sessionId,
          name: 'Текущая карта',
          file_url: session.current_map_url,
          image_url: session.current_map_url,
          grid_size: 64,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        setCurrentMap(mapData);
        return mapData;
      } else {
        setCurrentMap(null);
      }
    } catch (err: any) {
      console.error('Ошибка загрузки карты:', err);
      setCurrentMap(null);
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

      // Обновляем текущую карту сессии в game_sessions
      await supabase
        .from('game_sessions')
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

  // Загрузка карты из URL (blob или внешний URL)
  const saveMapFromUrl = async (
    imageUrl: string, 
    mapName?: string,
    dimensions?: { width: number; height: number }
  ) => {
    if (!session || !user) return null;

    try {
      let blob: Blob;
      
      // Если это blob URL - используем напрямую
      if (imageUrl.startsWith('blob:')) {
        const response = await fetch(imageUrl);
        blob = await response.blob();
      } else {
        // Для внешних URL используем Edge Function прокси
        toast({
          title: "Загрузка изображения",
          description: "Загружаем изображение с внешнего сайта...",
        });
        
        const { data, error } = await supabase.functions.invoke('fetch-image', {
          body: { url: imageUrl }
        });

        if (error) throw error;
        if (!data?.data) throw new Error('No image data received');

        // Конвертируем base64 обратно в blob
        const base64Response = await fetch(data.data);
        blob = await base64Response.blob();
      }
      
      // Определяем расширение файла из MIME типа
      const mimeType = blob.type;
      let extension = 'png';
      if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
        extension = 'jpg';
      } else if (mimeType.includes('webp')) {
        extension = 'webp';
      } else if (mimeType.includes('gif')) {
        extension = 'gif';
      }
      
      // Генерируем безопасное имя файла с расширением
      const timestamp = Date.now();
      const fileName = `battle-map-${timestamp}.${extension}`;
      const file = new File([blob], fileName, { type: blob.type });

      return await saveMapToSession(file, mapName || fileName, dimensions);
    } catch (err: any) {
      console.error('❌ Ошибка конвертации URL в файл:', err);
      toast({
        title: "Ошибка загрузки карты",
        description: err.message === 'Failed to fetch' 
          ? "Не удалось загрузить изображение. Попробуйте скачать файл и загрузить его напрямую."
          : err.details || "Не удалось сохранить карту",
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
      
      // КРИТИЧНО: Очищаем текущую карту при смене сессии ДО загрузки новой
      console.log('🗺️ Очищаем карту перед инициализацией сессии');
      setCurrentMap(null);

      const sessionData = await ensureSession();
      if (sessionData) {
        console.log('🗺️ Загружаем карту для сессии:', sessionData.id);
        await loadCurrentMap(sessionData.id);
      } else {
        console.log('ℹ️ Нет сессии - карта остается пустой');
      }

      setLoading(false);
    };

    if (isAuthenticated) {
      initialize();
    } else {
      setLoading(false);
      setCurrentMap(null);
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