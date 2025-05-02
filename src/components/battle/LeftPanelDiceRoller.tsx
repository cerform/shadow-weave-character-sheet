
import React from 'react';
import { Card } from "@/components/ui/card";
import { DicePanel } from "@/components/character-sheet/DicePanel";

const LeftPanelDiceRoller: React.FC = () => {
  return (
    <div className="h-full flex flex-col p-4 overflow-y-auto">
      <h3 className="font-semibold mb-4 text-center">Бросок кубиков</h3>
      <div className="flex-1 overflow-y-auto">
        <DicePanel />
      </div>
    </div>
  );
};

export default LeftPanelDiceRoller;
