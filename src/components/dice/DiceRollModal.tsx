
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { DiceRoller3D } from '@/components/dice/DiceRoller3D';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

interface DiceRollModalProps {
  open: boolean;
  onClose: () => void;
  onRoll: (formula: string, reason?: string, playerName?: string) => void;
  playerName?: string;
}

type DiceType = 'd4' | 'd6' | 'd8' | 'd10' | 'd12' | 'd20';

const DICE_TYPES: DiceType[] = ['d4', 'd6', 'd8', 'd10', 'd12', 'd20'];

export function DiceRollModal({ open, onClose, onRoll, playerName: defaultPlayerName }: DiceRollModalProps) {
  const [formula, setFormula] = useState('1d20');
  const [reason, setReason] = useState('');
  const [playerName, setPlayerName] = useState(defaultPlayerName || '');
  const [selectedDice, setSelectedDice] = useState<DiceType>('d20');
  const [quantity, setQuantity] = useState(1);
  const [modifier, setModifier] = useState(0);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [key, setKey] = useState(0); // Для форсирования пересоздания компонента DiceRoller3D
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;

  // При открытии модала, сбрасываем ключ для принудительной перерисовки
  useEffect(() => {
    if (open) {
      setKey(prev => prev + 1);
      setDiceResult(null);
    }
  }, [open, selectedDice]);

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
    onRoll(formula, reason, playerName);
    onClose();
  };

  // Обработчик результата броска кубика из 3D компонента
  const handleRollComplete = (value: number) => {
    setDiceResult(value);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-card/90 backdrop-blur-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-center text-foreground">Бросок кубиков</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="builder" className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="builder" className="text-foreground data-[state=inactive]:text-foreground/70">Конструктор</TabsTrigger>
            <TabsTrigger value="advanced" className="text-foreground data-[state=inactive]:text-foreground/70">Вручную</TabsTrigger>
          </TabsList>
          
          <TabsContent value="builder" className="space-y-4">
            <div>
              <Label className="text-foreground">Тип кубика</Label>
              <div className="grid grid-cols-6 gap-2 mt-2">
                {DICE_TYPES.map((dice) => (
                  <Button
                    key={dice}
                    type="button"
                    variant={selectedDice === dice ? "default" : "outline"}
                    onClick={() => handleDiceSelect(dice)}
                    className="flex items-center justify-center p-0 h-10"
                    style={{
                      backgroundColor: selectedDice === dice ? currentTheme.accent : undefined
                    }}
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
                  className="text-foreground"
                />
              </div>
              <div>
                <Label htmlFor="modifier" className="text-foreground">Модификатор</Label>
                <Input
                  id="modifier"
                  type="number"
                  value={modifier}
                  onChange={handleModifierChange}
                  className="text-foreground"
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
                className="text-foreground"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Формат: [количество]d[тип]+[модификатор]
              </p>
            </div>
          </TabsContent>
        </Tabs>
        
        <div>
          <Label htmlFor="playerName" className="text-foreground">Имя игрока</Label>
          <Input
            id="playerName"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Введите имя персонажа"
            className="text-foreground"
          />
        </div>
        
        <div>
          <Label htmlFor="reason" className="text-foreground">Причина броска (необязательно)</Label>
          <Input
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Например: Атака дубиной"
            className="text-foreground"
          />
        </div>
        
        <div className="h-[200px] w-full">
          <DiceRoller3D 
            key={key}
            initialDice={selectedDice} 
            onRollComplete={handleRollComplete}
            hideControls={true} 
            modifier={modifier}
            playerName={playerName}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button 
            onClick={handleRoll}
            style={{
              backgroundColor: currentTheme.accent,
            }}
          >
            Бросить {formula}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
