
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DiceRoller3D } from '@/components/character-sheet/DiceRoller3D';

interface DiceRollModalProps {
  open: boolean;
  onClose: () => void;
  onRoll: (formula: string, reason?: string) => void;
}

type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20' | 'd100';

const DICE_TYPES: DiceType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20', 'd100'];

export function DiceRollModal({ open, onClose, onRoll }: DiceRollModalProps) {
  const [formula, setFormula] = useState('1d20');
  const [reason, setReason] = useState('');
  const [selectedDice, setSelectedDice] = useState<DiceType>('d20');
  const [quantity, setQuantity] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [lastDieResult, setLastDieResult] = useState<number | null>(null);

  const handleDiceSelect = (dice: DiceType) => {
    setSelectedDice(dice);
    updateFormula(quantity, dice, modifier);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setQuantity(value);
      updateFormula(value, selectedDice, modifier);
    }
  };

  const handleModifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      setModifier(value);
      updateFormula(quantity, selectedDice, value);
    }
  };

  const updateFormula = (qty: number, dice: DiceType, mod: number) => {
    let newFormula = `${qty}${dice}`;
    if (mod > 0) newFormula += `+${mod}`;
    else if (mod < 0) newFormula += `${mod}`;
    setFormula(newFormula);
  };

  const handleRoll = () => {
    onRoll(formula, reason);
    onClose();
  };

  // Обработчик результата броска кубика из 3D компонента
  const handleRollComplete = (value: number) => {
    setLastDieResult(value);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-card/90 backdrop-blur-lg">
        <h2 className="text-lg font-semibold text-center mb-4 text-foreground">Бросок кубиков</h2>
        
        <Tabs defaultValue="builder" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="builder">Конструктор</TabsTrigger>
            <TabsTrigger value="advanced">Вручную</TabsTrigger>
          </TabsList>
          
          <TabsContent value="builder" className="space-y-4">
            <div>
              <Label className="text-foreground">Тип кубика</Label>
              <div className="grid grid-cols-7 gap-2 mt-2">
                {DICE_TYPES.map((dice) => (
                  <Button
                    key={dice}
                    type="button"
                    variant={selectedDice === dice ? "default" : "outline"}
                    onClick={() => handleDiceSelect(dice)}
                    className="flex items-center justify-center p-0 h-10"
                  >
                    {dice}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="quantity" className="text-foreground">Количество</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={handleQuantityChange}
                />
              </div>
              <div>
                <Label htmlFor="modifier" className="text-foreground">Модификатор</Label>
                <Input
                  id="modifier"
                  type="number"
                  value={modifier}
                  onChange={handleModifierChange}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            <div>
              <Label htmlFor="formula" className="text-foreground">Формула броска</Label>
              <Input
                id="formula"
                value={formula}
                onChange={(e) => setFormula(e.target.value)}
                placeholder="например: 2d6+3"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Формат: [количество]d[тип]+[модификатор]
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4">
          <Label htmlFor="reason" className="text-foreground">Причина броска (необязательно)</Label>
          <Input
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Например: Атака дубиной"
          />
        </div>
        
        <div className="h-[200px] w-full">
          <DiceRoller3D 
            initialDice={selectedDice} 
            onRollComplete={handleRollComplete}
            hideControls={true} 
            modifier={modifier}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={handleRoll}>Бросить {formula}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
