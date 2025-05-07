import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Character, DiceResult } from '@/types/character';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface DicePanelProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

const DicePanel: React.FC<DicePanelProps> = ({ character, onUpdate }) => {
  const [diceType, setDiceType] = useState('d20');
  const [reason, setReason] = useState('');
  const { toast } = useToast();
  
  // Функция для броска кубика
  const rollDice = (diceType: string, count: number = 1, modifier: number = 0, label: string = '') => {
    const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * parseInt(diceType.slice(1)) + 1));
    const total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;
    
    toast({
      title: `Бросок ${diceType}`,
      description: `Результат: ${total} (${rolls.join('+')}${modifier !== 0 ? (modifier > 0 ? '+' : '') + modifier : ''})`,
    });

    // Преобразуем в правильный формат DiceResult
    const diceResult: DiceResult = {
      formula: `${count}${diceType}+${modifier}`, // Добавляем требуемое поле formula
      rolls: rolls,
      total: total,
      diceType: diceType,  // Сохраняем старые поля для обратной совместимости
      label: label || reason,
    };

    // Обновляем персонажа с результатами броска
    onUpdate({
      lastDiceRoll: diceResult
    });
  };
  
  const rollFormula = (character.lastDiceRoll?.diceType ? 
    `${character.lastDiceRoll?.count || 1}${character.lastDiceRoll?.diceType || 'd20'}${character.lastDiceRoll?.modifier > 0 ? '+' + character.lastDiceRoll?.modifier : character.lastDiceRoll?.modifier < 0 ? character.lastDiceRoll?.modifier : ''}` : 
    '');

  return (
    <div className="bg-card rounded-md p-4 space-y-4">
      <h3 className="font-medium">Бросок кубика</h3>
      
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" onClick={() => rollDice('d4', 1, 0, reason)}>d4</Button>
        <Button variant="outline" onClick={() => rollDice('d6', 1, 0, reason)}>d6</Button>
        <Button variant="outline" onClick={() => rollDice('d8', 1, 0, reason)}>d8</Button>
        <Button variant="outline" onClick={() => rollDice('d10', 1, 0, reason)}>d10</Button>
        <Button variant="outline" onClick={() => rollDice('d12', 1, 0, reason)}>d12</Button>
        <Button variant="outline" onClick={() => rollDice('d20', 1, 0, reason)}>d20</Button>
        <Button variant="outline" onClick={() => rollDice('d100', 1, 0, reason)}>d100</Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="Тип кубика (например, d6)"
          value={diceType}
          onChange={(e) => setDiceType(e.target.value)}
          className="w-24"
        />
        <Button onClick={() => rollDice(diceType, 1, 0, reason)}>Бросить</Button>
      </div>
      
      <div>
        <Label htmlFor="reason">Причина броска</Label>
        <Input
          type="text"
          id="reason"
          placeholder="Например, проверка силы"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      
      {character.lastDiceRoll && (
        <div className="border rounded-md p-3 bg-muted/50">
          <h4 className="font-medium">Последний бросок</h4>
          <p className="text-sm">
            {character.lastDiceRoll.label && <span className="font-bold">{character.lastDiceRoll.label}: </span>}
            {character.lastDiceRoll.total} ({character.lastDiceRoll.rolls.join('+')})
          </p>
        </div>
      )}
    </div>
  );
};

export default DicePanel;
