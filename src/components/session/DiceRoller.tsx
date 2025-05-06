
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DiceResult {
  nickname: string;
  diceType: string;
  result: number;
  timestamp?: Date;
}

interface DiceRollerProps {
  roomCode: string;
}

const DiceRoller: React.FC<DiceRollerProps> = ({ roomCode }) => {
  const [results, setResults] = useState<DiceResult[]>([]);

  const rollDice = (diceType: string) => {
    // Генерация случайного результата для демонстрации
    const result: DiceResult = {
      nickname: "Вы",
      diceType,
      result: generateRandomDiceResult(diceType),
      timestamp: new Date()
    };

    // В будущем здесь будет интеграция с реальным сокет-сервисом
    console.log(`Бросок ${diceType} в комнате ${roomCode}`);
    
    setResults(prev => [result, ...prev].slice(0, 20)); // Ограничиваем историю 20 последними бросками
  };

  // Вспомогательная функция для генерации случайного результата броска
  const generateRandomDiceResult = (diceType: string): number => {
    const diceSize = parseInt(diceType.replace('d', ''));
    return Math.floor(Math.random() * diceSize) + 1;
  };

  return (
    <div className="border border-slate-700 rounded-lg p-4 bg-slate-800/30">
      <div className="flex flex-wrap gap-2 mb-4">
        {["d4", "d6", "d8", "d10", "d12", "d20"].map((dice) => (
          <Button
            key={dice}
            onClick={() => rollDice(dice)}
            className="bg-indigo-600 hover:bg-indigo-700"
            variant="outline"
            size="sm"
          >
            {dice}
          </Button>
        ))}
      </div>

      <ScrollArea className="h-32 bg-slate-900/50 rounded-lg p-2">
        {results.length === 0 ? (
          <div className="text-center text-slate-500 py-4">
            История бросков пуста
          </div>
        ) : (
          <div className="space-y-1">
            {results.map((res, idx) => (
              <div key={idx} className="text-sm py-1 border-b border-slate-700 last:border-0">
                <strong className="text-indigo-400">{res.nickname}</strong> бросил{' '}
                <strong className="text-amber-400">{res.diceType}</strong>:{' '}
                <span className="text-green-400 font-bold">{res.result}</span>
                {res.timestamp && (
                  <span className="text-xs text-slate-400 ml-2">
                    {res.timestamp.toLocaleTimeString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default DiceRoller;
