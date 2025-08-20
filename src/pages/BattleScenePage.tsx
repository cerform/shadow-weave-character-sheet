import { BattleMap3D } from "@/components/battle/ui";
import CompleteBattleActionPanel from "@/components/battle/ui/CompleteBattleActionPanel";
import BattleToolbar from "@/components/battle/ui/BattleToolbar";
import BattleHUD from "@/components/battle/ui/BattleHUD";
import { DiceRollModal } from "@/components/dice/DiceRollModal";
import { FogControls } from "@/components/battle/FogControls";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dice6 } from "lucide-react";

export default function BattleScenePage() {
  const [diceModalOpen, setDiceModalOpen] = useState(false);

  const handleDiceRoll = (formula: string, reason?: string, playerName?: string) => {
    console.log('Dice roll:', { formula, reason, playerName });
  };

  return (
    <div className="w-screen h-screen bg-background text-foreground overflow-hidden">
      {/* Заголовок */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-sm border-b">
        <div className="flex items-center justify-between px-4 py-2">
          <h1 className="text-lg font-semibold">3D Боевая Карта</h1>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDiceModalOpen(true)}
              className="flex items-center gap-2"
            >
              <Dice6 className="w-4 h-4" />
              Бросить кубик
            </Button>
          </div>
        </div>
      </div>

      {/* 3D Карта */}
      <div className="w-full h-full pt-12">
        <BattleMap3D />
        
        {/* Элементы управления туманом войны */}
        <FogControls />
        
        {/* UI элементы */}
        <BattleToolbar />
        <BattleHUD />
        <CompleteBattleActionPanel />
      </div>

      {/* Модальные окна */}
      <DiceRollModal
        open={diceModalOpen}
        onClose={() => setDiceModalOpen(false)}
        onRoll={handleDiceRoll}
        playerName="ДМ"
      />
    </div>
  );
}