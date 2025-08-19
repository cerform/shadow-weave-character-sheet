import { 
  BattleMap3D, 
  BattleInitiativeTracker, 
  BattleCombatLog
} from "@/components/battle/ui";
import CompleteBattleActionPanel from "@/components/battle/ui/CompleteBattleActionPanel";

export default function BattleScenePage() {
  return (
    <div className="w-screen h-screen bg-background text-foreground overflow-hidden">
      {/* Заголовок */}
      <div className="absolute top-4 left-4 z-50">
        <h1 className="text-2xl font-bold text-primary drop-shadow-lg">
          Боевая карта D&D 5e
        </h1>
        <p className="text-sm text-muted-foreground">
          Интерактивная 3D боевая система
        </p>
      </div>

      {/* 3D карта */}
      <div className="w-full h-full">
        <BattleMap3D />
      </div>

      {/* UI оверлеи */}
      <BattleInitiativeTracker />
      <BattleCombatLog />
      <CompleteBattleActionPanel />
    </div>
  );
}