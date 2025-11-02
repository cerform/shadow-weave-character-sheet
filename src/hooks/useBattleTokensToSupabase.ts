import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedBattleStore, EnhancedToken } from '@/stores/enhancedBattleStore';
import { useToast } from '@/hooks/use-toast';

/**
 * Хук для синхронизации локальных токенов мастера с Supabase
 * Сохраняет изменения токенов в БД для синхронизации с игроками
 */
export const useBattleTokensToSupabase = (sessionId: string, isDM: boolean) => {
  const { tokens } = useEnhancedBattleStore();
  const { toast } = useToast();
  const prevTokensRef = useRef<EnhancedToken[]>([]);
  const isInitialLoadRef = useRef(true);

  useEffect(() => {
    // Только мастер синхронизирует токены в БД
    if (!isDM || !sessionId) return;

    // Пропускаем первую загрузку
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      prevTokensRef.current = tokens;
      return;
    }

    const syncTokens = async () => {
      try {
        const prevTokens = prevTokensRef.current;
        
        // Находим новые токены
        const newTokens = tokens.filter(
          token => !prevTokens.find(pt => pt.id === token.id)
        );

        // Находим удаленные токены
        const removedTokens = prevTokens.filter(
          token => !tokens.find(t => t.id === token.id)
        );

        // Находим измененные токены
        const updatedTokens = tokens.filter(token => {
          const prevToken = prevTokens.find(pt => pt.id === token.id);
          return prevToken && JSON.stringify(prevToken) !== JSON.stringify(token);
        });

        // Добавляем новые токены
        for (const token of newTokens) {
          const { error } = await supabase
            .from('battle_tokens')
            .insert({
              id: token.id,
              session_id: sessionId,
              name: token.name,
              position_x: token.position[0],
              position_y: token.position[2], // Z координата для 2D
              current_hp: token.hp,
              max_hp: token.maxHp,
              armor_class: token.ac,
              conditions: token.conditions,
              token_type: token.isEnemy ? 'enemy' : 'character',
              is_visible: token.isVisible ?? true,
              is_hidden_from_players: !(token.isVisible ?? true),
              image_url: token.avatarUrl,
              size: token.size || 1,
              color: token.color,
            });

          if (error) {
            console.error('Ошибка при добавлении токена:', error);
            toast({
              title: "Ошибка синхронизации",
              description: `Не удалось добавить токен ${token.name}`,
              variant: "destructive"
            });
          } else {
            console.log('✅ Токен добавлен в БД:', token.name);
          }
        }

        // Обновляем измененные токены
        for (const token of updatedTokens) {
          const { error } = await supabase
            .from('battle_tokens')
            .update({
              name: token.name,
              position_x: token.position[0],
              position_y: token.position[2],
              current_hp: token.hp,
              max_hp: token.maxHp,
              armor_class: token.ac,
              conditions: token.conditions,
              token_type: token.isEnemy ? 'enemy' : 'character',
              is_visible: token.isVisible ?? true,
              is_hidden_from_players: !(token.isVisible ?? true),
              image_url: token.avatarUrl,
              size: token.size || 1,
              color: token.color,
            })
            .eq('id', token.id);

          if (error) {
            console.error('Ошибка при обновлении токена:', error);
          } else {
            console.log('✅ Токен обновлен в БД:', token.name);
          }
        }

        // Удаляем токены
        for (const token of removedTokens) {
          const { error } = await supabase
            .from('battle_tokens')
            .delete()
            .eq('id', token.id);

          if (error) {
            console.error('Ошибка при удалении токена:', error);
          } else {
            console.log('✅ Токен удален из БД:', token.name);
          }
        }

        prevTokensRef.current = tokens;
      } catch (error) {
        console.error('Ошибка синхронизации токенов:', error);
      }
    };

    syncTokens();
  }, [tokens, sessionId, isDM]); // Убрали toast из зависимостей
};
