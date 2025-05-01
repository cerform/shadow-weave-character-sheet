
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dices } from "lucide-react";

export const DicePanel = () => {
  const [diceCount, setDiceCount] = useState(1);
  const [diceResult, setDiceResult] = useState<string | null>(null);
  const [diceType, setDiceType] = useState('d20');
  const [rollsHistory, setRollsHistory] = useState<{type: string, rolls: number[], total: number}[]>([]);
  const [isRolling, setIsRolling] = useState(false);
  
  const rollDice = (type: string) => {
    setDiceType(type);
    setIsRolling(true);
    
    // Небольшая задержка для эффекта "броска"
    setTimeout(() => {
      const count = Math.max(1, Math.min(20, diceCount));
      const max = parseInt(type.replace('d', ''));
      
      let rolls = [];
      let total = 0;
      
      for (let i = 0; i < count; i++) {
        const roll = Math.floor(Math.random() * max) + 1;
        rolls.push(roll);
        total += roll;
      }
      
      // Сохраняем результат броска
      const newRoll = { type, rolls, total };
      setRollsHistory(prev => [newRoll, ...prev.slice(0, 9)]);
      
      setDiceResult(`${type}: ${rolls.join(', ')} = ${total}`);
      setIsRolling(false);
    }, 500);
  };
  
  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
      <h3 className="text-lg font-semibold mb-2">Кубики</h3>
      
      <div className="mb-2">
        <label className="text-sm">Количество кубиков:</label>
        <Input 
          type="number" 
          value={diceCount} 
          onChange={(e) => setDiceCount(Number(e.target.value))} 
          min={1}
          max={20}
          className="w-full mt-1"
        />
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Button variant="outline" size="sm" onClick={() => rollDice('d4')} disabled={isRolling}>d4</Button>
        <Button variant="outline" size="sm" onClick={() => rollDice('d6')} disabled={isRolling}>d6</Button>
        <Button variant="outline" size="sm" onClick={() => rollDice('d8')} disabled={isRolling}>d8</Button>
        <Button variant="outline" size="sm" onClick={() => rollDice('d10')} disabled={isRolling}>d10</Button>
        <Button variant="outline" size="sm" onClick={() => rollDice('d12')} disabled={isRolling}>d12</Button>
        <Button variant="outline" size="sm" onClick={() => rollDice('d20')} disabled={isRolling}>d20</Button>
      </div>
      
      {isRolling && (
        <div className="p-2 mb-2 bg-primary/10 rounded-md text-center">
          <Dices className="inline-block animate-spin" />
          <span className="ml-2">Бросок...</span>
        </div>
      )}
      
      {diceResult && !isRolling && (
        <div className="p-2 mb-2 bg-primary/10 rounded-md text-center font-medium">
          {diceResult}
        </div>
      )}
      
      {rollsHistory.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-1">История бросков</h4>
          <div className="max-h-32 overflow-y-auto">
            {rollsHistory.map((roll, index) => (
              <div key={index} className="text-sm p-1 border-b flex justify-between">
                <span>{roll.type} ({roll.rolls.length})</span>
                <span className="font-medium">{roll.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
