import { DMView } from '../views/DMView';
import { PlayerView } from '../views/PlayerView'; 
import { CombatLogger } from '../systems/CombatLogger';
import { InitiativeSystem } from '../systems/InitiativeSystem';
import { useUnifiedBattleStore } from '@/stores/unifiedBattleStore';

export default function UnifiedBattlePage() {
  const { isDM, initializeBattleScene } = useUnifiedBattleStore();
  
  // Инициализируем демо токены при загрузке
  React.useEffect(() => {
    initializeBattleScene();
  }, [initializeBattleScene]);
  
  // Показываем соответствующий интерфейс
  return (
    <div className="h-screen w-screen bg-neutral-950 text-neutral-100 flex">
      {/* Основной интерфейс */}
      <div className="flex-1">
        {isDM ? <DMView /> : <PlayerView />}
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