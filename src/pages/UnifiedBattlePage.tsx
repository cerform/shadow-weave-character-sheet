import React from 'react';
import { BattleMap3D } from '@/features/BattleMap/BattleMap3D';
import { HUD } from '@/features/BattleMap/HUD';
import { SidePanel } from '@/features/BattleMap/SidePanel';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';

export default function UnifiedBattlePage() {
  const { isDM, initializeBattleScene } = useUnifiedBattleStore();
  
  // Инициализируем демо токены при загрузке
  React.useEffect(() => {
    initializeBattleScene();
  }, [initializeBattleScene]);
  
  return (
    <div className="h-screen w-screen bg-background flex">
      {/* Боковая панель */}
      <SidePanel isDM={isDM} className="flex-shrink-0" />
      
      {/* Основная область */}
      <div className="flex-1 flex flex-col">
        {/* HUD */}
        <HUD isDM={isDM} className="flex-shrink-0" />
        
        {/* 3D сцена */}
        <div className="flex-1">
          <BattleMap3D />
        </div>
      </div>
    </div>
  );
}