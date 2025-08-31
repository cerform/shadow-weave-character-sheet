import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Используем типы из базы данных (для совместимости с существующими таблицами)
export interface SessionState {
  id: string;
  session_id: string;
  current_map_url: string | null;
  map_scale: number;
  fog_enabled: boolean;
  grid_visible: boolean;
  grid_scale: number;
  camera_position: { x: number; y: number; z: number };
  active_audio_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SessionMessage {
  id: string;
  session_id: string;
  user_id: string;
  sender_name: string;  // Используем sender_name вместо username
  content: string;      // Используем content вместо message
  message_type: 'chat' | 'system' | 'dice' | 'action';
  created_at: string;
}

export interface SessionAudio {
  id: string;
  session_id: string;
  name: string;
  file_url: string;
  volume: number;
  is_playing: boolean;
  is_loop: boolean;
  position: number;
  audio_type: 'background' | 'effect' | 'ambient';
  created_at: string;
  updated_at: string;
}

// Хук для синхронизации состояния сессии
export const useSessionSync = (sessionId: string) => {
  const [sessionState, setSessionState] = useState<SessionState | null>(null);
  const [messages, setMessages] = useState<SessionMessage[]>([]);
  const [audio, setAudio] = useState<SessionAudio[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Загружаем начальные данные
  useEffect(() => {
    if (!sessionId) return;

    const loadInitialData = async () => {
      try {
        // Пока используем данные из dm_sessions (пропускаем таблицы которых нет)
        console.log('Loading session data for:', sessionId);
        // Загружаем сообщения (используем существующую таблицу)
        const { data: messagesData, error: messagesError } = await supabase
          .from('session_messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true })
          .limit(50);

        if (messagesError) {
          console.error('Error loading messages:', messagesError);
        } else {
          // Мапим к нашему интерфейсу
          const mappedMessages = messagesData?.map(msg => ({
            id: msg.id,
            session_id: msg.session_id,
            user_id: msg.user_id,
            sender_name: msg.sender_name,
            content: msg.content,
            message_type: msg.message_type as 'chat' | 'system' | 'dice' | 'action',
            created_at: msg.created_at
          })) || [];
          setMessages(mappedMessages);
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
        toast({
          title: "Ошибка загрузки",
          description: "Не удалось загрузить данные сессии",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [sessionId, toast]);

  // Подписываемся на изменения в реальном времени (только сообщения пока)
  useEffect(() => {
    if (!sessionId) return;

    // Подписка на новые сообщения
    const messagesChannel = supabase
      .channel('session-messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'session_messages',
          filter: `session_id=eq.${sessionId}`
        },
        (payload) => {
          console.log('💬 New message:', payload);
          const newMessage = {
            id: payload.new.id,
            session_id: payload.new.session_id,
            user_id: payload.new.user_id,
            sender_name: payload.new.sender_name,
            content: payload.new.content,
            message_type: payload.new.message_type as 'chat' | 'system' | 'dice' | 'action',
            created_at: payload.new.created_at
          };
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [sessionId]);

  // Функции для обновления состояния (пока заглушки)
  const updateSessionState = async (updates: Partial<Omit<SessionState, 'id' | 'session_id' | 'created_at' | 'updated_at'>>) => {
    try {
      console.log('Update session state:', updates);
      // Пока просто логируем, так как таблица session_state еще не создана
      toast({
        title: "Обновление состояния",
        description: "Состояние будет синхронизировано",
      });
    } catch (error) {
      console.error('Error updating session state:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить состояние сессии",
        variant: "destructive"
      });
    }
  };

  // Отправка сообщения (используем существующую таблицу)
  const sendMessage = async (content: string, messageType: SessionMessage['message_type'] = 'chat') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('session_messages')
        .insert({
          session_id: sessionId,
          user_id: user.id,
          sender_name: user.user_metadata?.display_name || user.email || 'Игрок',
          content,
          message_type: messageType
        });

      if (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось отправить сообщение",
        variant: "destructive"
      });
    }
  };

  // Управление аудио (пока заглушка)
  const updateAudio = async (audioId: string, updates: Partial<SessionAudio>) => {
    try {
      console.log('Update audio:', audioId, updates);
      // Пока просто логируем, так как таблица session_audio еще не создана
      toast({
        title: "Аудио обновлено",
        description: "Настройки аудио изменены",
      });
    } catch (error) {
      console.error('Error updating audio:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить аудио",
        variant: "destructive"
      });
    }
  };

  return {
    sessionState,
    messages,
    audio,
    loading,
    updateSessionState,
    sendMessage,
    updateAudio
  };
};