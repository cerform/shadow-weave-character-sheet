
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dice6 } from "lucide-react";
import { toast } from "sonner";

interface DiceRollProps {
  onRollResult?: (result: number) => void;
  sides?: number;
}

export const DiceRoll = ({ onRollResult, sides = 20 }: DiceRollProps) => {
  const [result, setResult] = useState<number | null>(null);
  const [rolling, setRolling] = useState(false);
  
  const rollDice = () => {
    setRolling(true);
    
    // Simulate dice roll animation
    let rollCount = 0;
    const maxRolls = 10;
    const interval = setInterval(() => {
      const randomNumber = Math.floor(Math.random() * sides) + 1;
      setResult(randomNumber);
      
      rollCount++;
      if (rollCount >= maxRolls) {
        clearInterval(interval);
        setRolling(false);
        
        if (onRollResult) {
          onRollResult(randomNumber);
        }
        
        toast.success(`Выпало: ${randomNumber}`);
      }
    }, 100);
  };
  
  return (
    <Card className="p-4 flex flex-col items-center bg-card/30 backdrop-blur-sm border-primary/20">
      <div className="text-lg font-semibold mb-2">Бросок D{sides}</div>
      
      <div 
        className={`w-20 h-20 flex items-center justify-center text-2xl font-bold mb-4 rounded-lg 
          ${result ? 'bg-primary/20' : 'bg-muted/30'} 
          ${rolling ? 'animate-pulse' : ''}`}
      >
        {result || <Dice6 size={32} />}
      </div>
      
      <Button 
        onClick={rollDice} 
        disabled={rolling} 
        className="gap-2"
      >
        <Dice6 size={16} />
        Бросить D{sides}
      </Button>
    </Card>
  );
};
