
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from 'lucide-react';

interface DiceRollerProps {
  onRoll: (diceType: string, modifier: number, reason?: string) => void;
}

const DiceRoller: React.FC<DiceRollerProps> = ({ onRoll }) => {
  const [selectedDice, setSelectedDice] = useState('d20');
  const [modifier, setModifier] = useState(0);
  const [reason, setReason] = useState('');
  const [diceCount, setDiceCount] = useState(1);

  const diceTypes = [
    { value: 'd4', label: 'D4', icon: <Dice1 className="h-4 w-4" /> },
    { value: 'd6', label: 'D6', icon: <Dice2 className="h-4 w-4" /> },
    { value: 'd8', label: 'D8', icon: <Dice3 className="h-4 w-4" /> },
    { value: 'd10', label: 'D10', icon: <Dice4 className="h-4 w-4" /> },
    { value: 'd12', label: 'D12', icon: <Dice5 className="h-4 w-4" /> },
    { value: 'd20', label: 'D20', icon: <Dice6 className="h-4 w-4" /> },
    { value: 'd100', label: 'D100', icon: <Dice6 className="h-4 w-4" /> }
  ];

  const quickRolls = [
    { label: 'Атака', dice: 'd20', modifier: 0, reason: 'Атака' },
    { label: 'Урон', dice: 'd6', modifier: 0, reason: 'Урон' },
    { label: 'Спасбросок', dice: 'd20', modifier: 0, reason: 'Спасбросок' },
    { label: 'Проверка навыка', dice: 'd20', modifier: 0, reason: 'Проверка навыка' },
    { label: 'Инициатива', dice: 'd20', modifier: 0, reason: 'Инициатива' }
  ];

  const handleRoll = () => {
    const diceString = diceCount > 1 ? `${diceCount}${selectedDice}` : selectedDice;
    onRoll(diceString, modifier, reason || undefined);
    setReason('');
  };

  const handleQuickRoll = (quickRoll: typeof quickRolls[0]) => {
    onRoll(quickRoll.dice, quickRoll.modifier, quickRoll.reason);
  };

  return (
    <div className="space-y-4">
      {/* Быстрые броски */}
      <div className="flex flex-wrap gap-2">
        {quickRolls.map((roll, index) => (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => handleQuickRoll(roll)}
            className="flex items-center gap-1"
          >
            <Dice6 className="h-3 w-3" />
            {roll.label}
          </Button>
        ))}
      </div>

      <Card>
        <CardContent className="pt-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Количество кубиков</Label>
              <Select 
                value={diceCount.toString()} 
                onValueChange={(value) => setDiceCount(parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Тип кубика</Label>
              <Select value={selectedDice} onValueChange={setSelectedDice}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {diceTypes.map(dice => (
                    <SelectItem key={dice.value} value={dice.value}>
                      <div className="flex items-center gap-2">
                        {dice.icon}
                        {dice.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="modifier">Модификатор</Label>
              <Input
                id="modifier"
                type="number"
                value={modifier}
                onChange={(e) => setModifier(parseInt(e.target.value) || 0)}
                placeholder="0"
              />
            </div>

            <div>
              <Label htmlFor="reason">Причина (опционально)</Label>
              <Input
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Например: Атака мечом"
              />
            </div>
          </div>

          <Button onClick={handleRoll} className="w-full" size="lg">
            <Dice6 className="h-5 w-5 mr-2" />
            Бросить {diceCount > 1 && `${diceCount}×`}{selectedDice.toUpperCase()}
            {modifier !== 0 && ` ${modifier >= 0 ? '+' : ''}${modifier}`}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default DiceRoller;
