// Объединенная страница боевой системы
import React from 'react';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';
import { DMView } from '@/components/battle/views/DMView';
import { PlayerView } from '@/components/battle/views/PlayerView';
import { TacticalBattleView } from '@/components/battle/views/TacticalBattleView';
import { ViewSwitcher } from '@/components/battle/shared/ViewSwitcher';

export default function UnifiedBattlePage() {
  const { viewMode, isDM } = useUnifiedBattleStore();

  return (
    <div className="w-screen h-screen bg-background text-foreground overflow-hidden">
      {/* Переключатель режимов */}
      <ViewSwitcher />
      
      {/* Новая тактическая боевая система */}
      <TacticalBattleView isDM={isDM} />
    </div>
  );
}