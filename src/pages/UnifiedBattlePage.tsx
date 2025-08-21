import React from 'react';
import { DMView } from '@/components/battle/views/DMView';
import { PlayerView } from '@/components/battle/views/PlayerView'; 
import { TacticalBattleView } from '@/components/battle/views/TacticalBattleView';
import { CombatLogger } from '@/components/battle/systems/CombatLogger';
import { InitiativeSystem } from '@/components/battle/systems/InitiativeSystem';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';

export default function UnifiedBattlePage() {
  const { 
    isDM, 
    battleViewMode, 
    setBattleViewMode, 
    initializeBattleScene 
  } = useUnifiedBattleStore();
  
  // Инициализируем демо токены при загрузке
  React.useEffect(() => {
    initializeBattleScene();
  }, [initializeBattleScene]);
  
  // Показываем соответствующий интерфейс
  return (
    <div className="h-screen w-screen bg-neutral-950 text-neutral-100 flex">
      {/* Переключатель режимов в заголовке */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2 bg-background/90 backdrop-blur-sm border rounded-lg p-2">
        <span className="text-sm text-muted-foreground">Вид:</span>
        <button
          onClick={() => setBattleViewMode('2d')}
          className={`px-3 py-1 text-sm rounded ${
            battleViewMode === '2d' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          2D
        </button>
        <button
          onClick={() => setBattleViewMode('3d')}
          className={`px-3 py-1 text-sm rounded ${
            battleViewMode === '3d' 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground hover:bg-muted/80'
          }`}
        >
          3D
        </button>
      </div>

      {/* Основной интерфейс */}
      <div className="flex-1">
        {battleViewMode === '3d' ? (
          isDM ? <DMView /> : <PlayerView />
        ) : (
          <div className="w-full h-full">
            <TacticalBattleView isDM={isDM} />
          </div>
        )}
      </div>
      
      {/* Боковые панели для ДМ */}
      {isDM && (
        <div className="w-80 border-l border-neutral-700 flex flex-col">
          <div className="flex-1">
            <InitiativeSystem className="h-1/2" />
          </div>
          <div className="h-1/2">
            <CombatLogger />
          </div>
        </div>
      )}
    </div>
  );
}