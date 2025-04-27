
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export const DicePanel = () => {
  const [diceCount, setDiceCount] = useState(1);
  const [diceResult, setDiceResult] = useState<string | null>(null);
  
  const rollDice = (type: string) => {
    const count = Math.max(1, Math.min(10, diceCount));
    const max = parseInt(type.replace('d', ''));
    
    let rolls = [];
    let total = 0;
    
    for (let i = 0; i < count; i++) {
      const roll = Math.floor(Math.random() * max) + 1;
      rolls.push(roll);
      total += roll;
    }
    
    setDiceResult(`${type}: ${rolls.join(', ')} = ${total}`);
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
          max={10}
          className="w-full mt-1"
        />
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Button variant="outline" size="sm" onClick={() => rollDice('d4')}>d4</Button>
        <Button variant="outline" size="sm" onClick={() => rollDice('d6')}>d6</Button>
        <Button variant="outline" size="sm" onClick={() => rollDice('d8')}>d8</Button>
        <Button variant="outline" size="sm" onClick={() => rollDice('d10')}>d10</Button>
        <Button variant="outline" size="sm" onClick={() => rollDice('d12')}>d12</Button>
        <Button variant="outline" size="sm" onClick={() => rollDice('d20')}>d20</Button>
      </div>
      
      {diceResult && (
        <div className="p-2 bg-primary/10 rounded-md text-center font-medium">
          {diceResult}
        </div>
      )}
    </Card>
  );
};
