import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useEnhancedBattleStore } from '@/stores/enhancedBattleStore';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

/**
 * Хук для автоматического создания токена игрока при загрузке карты
 */
export const usePlayerTokenSync = (sessionId: string) => {
  const { user } = useAuth();
  const { mapImageUrl, tokens, addToken } = useEnhancedBattleStore();
  const { toast } = useToast();

  useEffect(() => {
    if (!user || !mapImageUrl || !sessionId) return;

    const createPlayerToken = async () => {
      try {
        // Проверяем, есть ли уже токен игрока
        const existingToken = tokens.find(t => t.owner_id === user.id && !t.is_summoned);
        if (existingToken) {
          console.log('✅ Токен игрока уже существует');
          return;
        }

        // Получаем информацию о персонаже игрока
        const { data: sessionPlayer, error: playerError } = await supabase
          .from('session_players')
          .select('character_id, player_name')
          .eq('session_id', sessionId)
          .eq('user_id', user.id)
          .maybeSingle();

        if (playerError) {
          console.error('Ошибка получения информации об игроке:', playerError);
          return;
        }

        if (!sessionPlayer) {
          console.log('ℹ️ Игрок не найден в сессии');
          return;
        }

        let character = null;
        let playerName = sessionPlayer?.player_name || 'Игрок';
        let characterClass = 'fighter'; // По умолчанию

        // Если у игрока есть персонаж, загружаем его данные
        if (sessionPlayer?.character_id) {
          const { data: charData, error: charError } = await supabase
            .from('characters')
            .select('*')
            .eq('id', sessionPlayer.character_id)
            .maybeSingle();

          if (!charError && charData) {
            character = charData;
            playerName = charData.name;
            characterClass = charData.class?.toLowerCase() || 'fighter';
          }
        }

        // Создаем токен в БД
        const { data: newToken, error: tokenError } = await supabase
          .from('battle_tokens')
          .insert({
            session_id: sessionId,
            name: playerName,
            owner_id: user.id,
            character_id: sessionPlayer?.character_id,
            current_hp: character?.current_hp || 20,
            max_hp: character?.max_hp || 20,
            armor_class: character?.armor_class || 10,
            position_x: 1, // Начальная позиция
            position_y: 1,
            color: getClassColor(characterClass),
            token_type: 'character',
            is_visible: true,
            is_hidden_from_players: false,
            is_summoned: false,
          })
          .select()
          .single();

        if (tokenError) {
          console.error('Ошибка создания токена:', tokenError);
          return;
        }

        console.log('✅ Токен игрока создан:', newToken);

        // Добавляем токен в локальный стор
        addToken({
          id: newToken.id,
          name: newToken.name,
          hp: newToken.current_hp || 20,
          maxHp: newToken.max_hp || 20,
          ac: newToken.armor_class || 10,
          position: [newToken.position_x, 0, newToken.position_y],
          conditions: [],
          isEnemy: false,
          isVisible: true,
          color: newToken.color || '#22c55e',
          avatarUrl: newToken.image_url || undefined,
          image_url: newToken.image_url || undefined,
          class: characterClass,
          owner_id: user.id,
          is_summoned: false,
          level: character?.level || 1,
          speed: character?.speed || 30,
        });

        toast({
          title: "Токен создан",
          description: `Ваш персонаж ${playerName} добавлен на карту`,
        });
      } catch (error) {
        console.error('Ошибка при создании токена игрока:', error);
      }
    };

    // Создаем токен когда карта загружена
    createPlayerToken();
  }, [mapImageUrl, sessionId, user, tokens, addToken, toast]);
};

// Цвета по классам D&D
function getClassColor(characterClass: string): string {
  const colors: Record<string, string> = {
    barbarian: '#ef4444',   // Красный - варвар
    bard: '#a855f7',        // Фиолетовый - бард
    cleric: '#fbbf24',      // Золотой - жрец
    druid: '#22c55e',       // Зеленый - друид
    fighter: '#94a3b8',     // Серый - воин
    monk: '#0ea5e9',        // Синий - монах
    paladin: '#fde047',     // Желтый - паладин
    ranger: '#16a34a',      // Темно-зеленый - следопыт
    rogue: '#64748b',       // Темно-серый - плут
    sorcerer: '#dc2626',    // Алый - чародей
    warlock: '#7c3aed',     // Темно-фиолетовый - колдун
    wizard: '#3b82f6',      // Голубой - волшебник
    necromancer: '#581c87', // Темно-фиолетовый - некромант
  };

  return colors[characterClass.toLowerCase()] || '#22c55e';
}
