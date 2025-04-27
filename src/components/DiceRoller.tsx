// components/DiceRoller.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";

const DiceRoller = () => {
  const [rollResult, setRollResult] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);

  const rollD20 = () => {
    setIsRolling(true);
    setTimeout(() => {
      const result = Math.floor(Math.random() * 20) + 1;
      setRollResult(result);
      setIsRolling(false);
    }, 500); // Анимация броска 0.5 секунды
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-8">
      <Button onClick={rollD20} disabled={isRolling}>
        {isRolling ? "Кидаем..." : "Бросить D20"}
      </Button>
      {rollResult !== null && (
        <div className="text-4xl font-bold">
          🎲 {rollResult}
        </div>
      )}
    </div>
  );
};

export default DiceRoller;
