import { BattleMap3D } from "@/components/battle/ui";
import CompleteBattleActionPanel from "@/components/battle/ui/CompleteBattleActionPanel";
import BattleToolbar from "@/components/battle/ui/BattleToolbar";
import BattleHUD from "@/components/battle/ui/BattleHUD";
import { DiceRollModal } from "@/components/dice/DiceRollModal";
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

      {/* Горизонтальная панель инструментов */}
      <BattleToolbar />

      {/* Левая панель действий */}
      <CompleteBattleActionPanel />

      {/* Правая панель HUD */}
      <BattleHUD />

      {/* Плавающая кнопка для кубиков ДМ */}
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <Button
          onClick={() => setDiceModalOpen(true)}
          size="lg"
          className="rounded-full w-16 h-16 bg-accent hover:bg-accent/80 shadow-lg"
        >
          <Dice6 className="w-8 h-8" />
        </Button>
      </div>

      {/* Модальное окно бросков кубиков */}
      <DiceRollModal
        open={diceModalOpen}
        onClose={() => setDiceModalOpen(false)}
        onRoll={handleDiceRoll}
        playerName="ДМ"
      />
    </div>
  );
}