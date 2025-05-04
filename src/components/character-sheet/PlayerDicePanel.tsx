import React, { useState, useContext } from 'react';
import { Button } from "@/components/ui/button";
import { Dices } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
// Используем напрямую контекст вместо хука
import { SessionContext } from '@/contexts/SessionContext';

export const PlayerDicePanel = () => {
  const [diceType, setDiceType] = useState("d20");
  const [diceCount, setDiceCount] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [rollHistory, setRollHistory] = useState([]);
  const [isRolling, setIsRolling] = useState(false);
  const { toast } = useToast();
  
  // Получаем контекст напрямую вместо использования хука
  const sessionContext = useContext(SessionContext);
  const session = sessionContext?.session;
  
  const handleRoll = () => {
    setIsRolling(true);
    
    // Имитация броска кубика
    setTimeout(() => {
      const rollResult = Math.floor(Math.random() * parseInt(diceType.slice(1))) + 1;
      const total = rollResult + modifier;
      
      setRollHistory(prev => [...prev, {
        diceType,
        diceCount,
        modifier,
        rollResult,
        total
      }]);
      
      toast({
        title: "Кости брошены",
        description: `${diceCount}${diceType} + ${modifier} = ${total}`,
      });
      
      setIsRolling(false);
    }, 1500);
  };

  return (
    <div>
      <h2>Бросок кубиков</h2>
      
      <div>
        <label>Тип кубика:</label>
        <Select value={diceType} onValueChange={(value) => setDiceType(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите тип кубика" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="d4">d4</SelectItem>
            <SelectItem value="d6">d6</SelectItem>
            <SelectItem value="d8">d8</SelectItem>
            <SelectItem value="d10">d10</SelectItem>
            <SelectItem value="d12">d12</SelectItem>
            <SelectItem value="d20">d20</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div>
        <label>Количество кубиков:</label>
        <input 
          type="number" 
          value={diceCount} 
          onChange={(e) => setDiceCount(parseInt(e.target.value))} 
        />
      </div>
      
      <div>
        <label>Модификатор:</label>
        <input 
          type="number" 
          value={modifier} 
          onChange={(e) => setModifier(parseInt(e.target.value))} 
        />
      </div>
      
      <Button onClick={handleRoll} disabled={isRolling}>
        {isRolling ? "Бросаем..." : "Бросить кости"}
      </Button>
      
      <h3>История бросков:</h3>
      <ul>
        {rollHistory.map((roll, index) => (
          <li key={index}>
            {roll.diceCount}{roll.diceType} + {roll.modifier} = {roll.total}
          </li>
        ))}
      </ul>
    </div>
  );
};
