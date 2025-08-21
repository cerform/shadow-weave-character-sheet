// Объединенная страница боевой системы
import React from 'react';
import { DMView } from '@/components/battle/views/DMView';
import { PlayerView } from '@/components/battle/views/PlayerView';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';

export default function UnifiedBattlePage() {
  const { isDM, initializeBattleScene } = useUnifiedBattleStore();
  
  // Инициализируем демо токены при загрузке
  React.useEffect(() => {
    initializeBattleScene();
  }, [initializeBattleScene]);
  
  // Показываем соответствующий интерфейс
  return isDM ? <DMView /> : <PlayerView />;
}