
import React, { useEffect, useState } from "react";
import { socketService } from "@/services/socket";
import { DiceResult } from "@/types/character"; // Используем тип DiceResult из character.ts
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";

interface DiceRollerProps {
  roomCode: string;
}

const DiceRoller: React.FC<DiceRollerProps> = ({ roomCode }) => {
  const [results, setResults] = useState<DiceResult[]>([]);
  const [customFormula, setCustomFormula] = useState<string>("");

  const rollDice = (diceType: string) => {
    socketService.sendRoll({
      formula: `1${diceType}`,
      reason: `Бросок ${diceType}`
    });
  };
  
  const rollCustomDice = () => {
    if (!customFormula.trim()) return;
    
    socketService.sendRoll({
      formula: customFormula,
      reason: `Бросок: ${customFormula}`
    });
    
    setCustomFormula("");
  };

  useEffect(() => {
    const handleDiceResult = (result: DiceResult) => {
      setResults((prev) => {
        // Ограничиваем историю до 20 последних бросков
        const newResults = [result, ...prev];
        if (newResults.length > 20) {
          return newResults.slice(0, 20);
        }
        return newResults;
      });
    };

    socketService.on("diceResult", handleDiceResult);

    return () => {
      socketService.off("diceResult", handleDiceResult);
    };
  }, []);

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Стандартные кубики</h3>
        <div className="flex flex-wrap gap-2">
          {["d4", "d6", "d8", "d10", "d12", "d20", "d100"].map((dice) => (
            <Button
              key={dice}
              onClick={() => rollDice(dice)}
              variant="outline"
              className="flex-1"
            >
              {dice}
            </Button>
          ))}
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">Пользовательский бросок</h3>
        <div className="flex gap-2">
          <Input
            placeholder="2d6+3, 1d20+5..."
            value={customFormula}
            onChange={(e) => setCustomFormula(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && rollCustomDice()}
          />
          <Button onClick={rollCustomDice}>
            <Plus className="h-4 w-4 mr-1" />
            Бросить
          </Button>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold mb-2">История бросков</h3>
        <Card className="h-64 overflow-y-auto p-2">
          {results.length === 0 ? (
            <p className="text-center py-4 text-muted-foreground">История бросков пуста</p>
          ) : (
            <div className="space-y-1">
              {results.map((res, idx) => (
                <div key={idx} className="p-2 border-b border-border last:border-0">
                  <div className="flex justify-between">
                    <span className="font-medium">{res.nickname}</span>
                    <span className="text-sm text-muted-foreground">
                      {new Date().toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {res.label || `Бросок ${res.diceType}`}:
                    </span>
                    <span className="font-bold text-primary">
                      {res.total || res.result}
                    </span>
                    {res.rolls && res.rolls.length > 1 && (
                      <span className="text-xs text-muted-foreground">
                        ({res.rolls.join(', ')})
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DiceRoller;
