
import React, { useEffect, useState } from "react";
import { socketService, DiceResult } from "@/services/socket";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Minus } from "lucide-react";
import { useUserTheme } from "@/hooks/use-user-theme";
import { themes } from "@/lib/themes";

interface DiceRollerProps {
  roomCode: string;
}

const DiceRoller: React.FC<DiceRollerProps> = ({ roomCode }) => {
  const [results, setResults] = useState<DiceResult[]>([]);
  const [diceCount, setDiceCount] = useState<number>(1);
  const [modifier, setModifier] = useState<number>(0);
  const [selectedDice, setSelectedDice] = useState<string>("d20");
  
  const { activeTheme } = useUserTheme();
  const themeKey = (activeTheme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;

  const rollDice = () => {
    const formula = `${diceCount}${selectedDice}${modifier > 0 ? '+' + modifier : modifier < 0 ? modifier : ''}`;
    socketService.sendRoll(formula);
  };

  useEffect(() => {
    const unsubscribe = socketService.on("diceResult", (result: DiceResult) => {
      setResults((prev) => {
        // Ограничиваем историю до 20 последних бросков
        const newResults = [...prev, result];
        if (newResults.length > 20) {
          return newResults.slice(-20);
        }
        return newResults;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <div className="p-4 border-t mt-4 bg-black/30 rounded-lg">
      <h2 className="text-lg font-semibold mb-3">Бросить кубик</h2>
      
      {/* Кубики и настройки */}
      <div className="space-y-4 mb-4">
        <div className="grid grid-cols-6 gap-2 mb-4">
          {["d4", "d6", "d8", "d10", "d12", "d20"].map((dice) => (
            <Button
              key={dice}
              onClick={() => setSelectedDice(dice)}
              style={{
                backgroundColor: selectedDice === dice ? currentTheme.accent : undefined,
                borderColor: currentTheme.accent,
              }}
              variant={selectedDice === dice ? "default" : "outline"}
            >
              {dice}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Количество кубиков */}
          <div>
            <Label htmlFor="diceCount" className="mb-1 block">Количество:</Label>
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDiceCount(prev => Math.max(1, prev - 1))} 
                className="h-10 px-3"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="diceCount"
                type="number"
                className="mx-2 text-center"
                value={diceCount}
                onChange={(e) => setDiceCount(Math.max(1, Math.min(10, Number(e.target.value))))}
                min={1}
                max={10}
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDiceCount(prev => Math.min(10, prev + 1))} 
                className="h-10 px-3"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Модификатор */}
          <div>
            <Label htmlFor="modifier" className="mb-1 block">Модификатор:</Label>
            <div className="flex items-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setModifier(prev => Math.max(-20, prev - 1))} 
                className="h-10 px-3"
              >
                <Minus className="h-4 w-4" />
              </Button>
              <Input
                id="modifier"
                type="number"
                className="mx-2 text-center"
                value={modifier}
                onChange={(e) => setModifier(Math.max(-20, Math.min(20, Number(e.target.value))))}
                min={-20}
                max={20}
              />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setModifier(prev => Math.min(20, prev + 1))} 
                className="h-10 px-3"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Кнопка броска */}
      <Button 
        onClick={rollDice} 
        className="w-full mb-4"
        style={{
          backgroundColor: currentTheme.accent,
        }}
      >
        Бросить {diceCount}{selectedDice}{modifier > 0 ? '+' + modifier : modifier < 0 ? modifier : ''}
      </Button>

      {/* История бросков */}
      <div className="h-32 overflow-y-auto bg-black/40 p-3 rounded border border-white/10 text-sm">
        <h3 className="font-semibold mb-1">История бросков:</h3>
        {results.length > 0 ? (
          results.map((res, idx) => (
            <div key={idx} className="py-1 border-b border-white/10 last:border-0">
              <strong>{res.nickname}</strong> бросил <strong>{res.diceType}</strong>: {res.result}
            </div>
          ))
        ) : (
          <div className="text-center py-2 text-white/60">
            Нет истории бросков
          </div>
        )}
      </div>
    </div>
  );
};

export default DiceRoller;
