
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Heart, Shield, Dices } from 'lucide-react';
import { useContext } from 'react';
import { CharacterContext } from '@/contexts/CharacterContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from "@/hooks/use-theme";
import { themes } from "@/lib/themes";
import { DiceRoller3DFixed } from '@/components/character-sheet/DiceRoller3DFixed';
import { useToast } from '@/hooks/use-toast';

interface ResourcePanelProps {
  currentHp: number;
  maxHp: number;
  onHpChange: (value: number) => void;
}

export const ResourcePanel = ({ currentHp, maxHp, onHpChange }: ResourcePanelProps) => {
  const { character } = useContext(CharacterContext);
  const { theme } = useTheme();
  const { toast } = useToast();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  const [showHitDiceRoller, setShowHitDiceRoller] = useState(false);
  const [showHealingRoller, setShowHealingRoller] = useState(false);
  
  const handleHpAdjust = (amount: number) => {
    const newHp = Math.max(0, Math.min(currentHp + amount, maxHp));
    onHpChange(newHp);
  };
  
  const hpPercentage = maxHp > 0 ? (currentHp / maxHp) * 100 : 0;
  
  // Определяем цвет полосы HP в зависимости от процента здоровья
  const getHpBarColor = () => {
    if (hpPercentage <= 25) return 'bg-red-500';
    if (hpPercentage <= 50) return 'bg-orange-500';
    if (hpPercentage <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  // Вычисляем бонус инициативы
  const getInitiative = () => {
    if (!character?.abilities) return '+0';
    const dexMod = Math.floor((character.abilities.DEX - 10) / 2);
    return dexMod >= 0 ? `+${dexMod}` : `${dexMod}`;
  };
  
  // Вычисляем класс брони
  const getArmorClass = () => {
    if (!character?.abilities) return 10;
    
    // Базовый класс брони 10 + модификатор Ловкости
    const dexMod = Math.floor((character.abilities.DEX - 10) / 2);
    
    // Базовые правила для простоты
    let ac = 10 + dexMod;
    
    // Для разных классов можно добавить бонусы
    if (character.className?.includes('Монах')) {
      const wisMod = Math.floor((character.abilities.WIS - 10) / 2);
      ac += wisMod;
    } else if (character.className?.includes('Варвар')) {
      const conMod = Math.floor((character.abilities.CON - 10) / 2);
      ac += conMod;
    }
    
    return ac;
  };
  
  // Обработчик результата броска кубика для лечения
  const handleHealingRollComplete = (result: number) => {
    handleHpAdjust(result);
    setShowHealingRoller(false);
    toast({
      title: "Лечение!",
      description: `Вы восстановили ${result} очков здоровья.`,
    });
  };
  
  // Обработчик результата броска Hit Die
  const handleHitDiceRollComplete = (result: number) => {
    const conMod = character?.abilities ? Math.floor((character.abilities.CON - 10) / 2) : 0;
    const healingAmount = result + conMod;
    
    handleHpAdjust(healingAmount);
    setShowHitDiceRoller(false);
    toast({
      title: "Использован Hit Die!",
      description: `Восстановлено HP: ${healingAmount} (${result} + ${conMod} Телосложение)`,
    });
  };
  
  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
      <h3 className="text-lg font-semibold mb-4 text-primary">Ресурсы</h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <Heart className="h-4 w-4 mr-1 text-red-500" />
              <span className="text-sm font-medium text-primary">Здоровье</span>
            </div>
            <span className="text-sm text-primary">
              {currentHp} / {maxHp}
            </span>
          </div>
          <Progress value={hpPercentage} className={`h-3 ${getHpBarColor()}`} />
          <div className="flex justify-between gap-2 mt-2">
            <Button size="sm" variant="outline" onClick={() => handleHpAdjust(-1)}>-1</Button>
            <Button size="sm" variant="outline" onClick={() => handleHpAdjust(-5)}>-5</Button>
            
            <Sheet open={showHealingRoller} onOpenChange={setShowHealingRoller}>
              <SheetTrigger asChild>
                <Button size="sm" variant="outline" className="flex items-center gap-1">
                  <Dices className="h-3 w-3" /> +d8
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[90%] sm:max-w-md p-0">
                <SheetHeader className="p-4">
                  <SheetTitle>Бросок для лечения</SheetTitle>
                  <SheetDescription>
                    Бросьте кубик d8 для восстановления здоровья
                  </SheetDescription>
                </SheetHeader>
                <div className="h-[80vh]">
                  <DiceRoller3DFixed
                    initialDice="d8"
                    hideControls={false}
                    modifier={0}
                    onRollComplete={handleHealingRollComplete}
                    themeColor={currentTheme.accent}
                  />
                </div>
              </SheetContent>
            </Sheet>
            
            <Button size="sm" variant="outline" onClick={() => handleHpAdjust(1)}>+1</Button>
            <Button size="sm" variant="outline" onClick={() => handleHpAdjust(5)}>+5</Button>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/10 p-3 rounded-lg text-center">
              <div className="flex justify-center mb-1">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm text-muted-foreground">Класс Брони</div>
              <div className="text-xl font-bold text-primary">{getArmorClass()}</div>
            </div>
            
            <div className="bg-primary/10 p-3 rounded-lg text-center">
              <div className="text-sm text-muted-foreground mb-1">Инициатива</div>
              <div className="text-xl font-bold text-primary">{getInitiative()}</div>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-primary">Скорость</span>
            <span className="text-sm text-primary">30 футов</span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-primary">Грузоподъёмность</span>
            <span className="text-sm text-primary">
              {character?.abilities ? character.abilities.STR * 15 : 150} фунтов
            </span>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h4 className="text-sm font-medium mb-2 text-primary">Hit Dice</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm text-primary">
              {character?.level || 1}d{getHitDieByClass(character?.className || '')}
            </span>
            <div>
              <Sheet open={showHitDiceRoller} onOpenChange={setShowHitDiceRoller}>
                <SheetTrigger asChild>
                  <Button size="sm" variant="outline" className="flex items-center gap-1">
                    <Dices className="h-3 w-3" /> Использовать
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[90%] sm:max-w-md p-0">
                  <SheetHeader className="p-4">
                    <SheetTitle>Hit Dice</SheetTitle>
                    <SheetDescription>
                      Используйте Hit Die для восстановления здоровья во время короткого отдыха
                    </SheetDescription>
                  </SheetHeader>
                  <div className="h-[80vh]">
                    <DiceRoller3DFixed
                      initialDice={getHitDieByClass(character?.className || '') as any}
                      hideControls={false}
                      modifier={character?.abilities ? Math.floor((character.abilities.CON - 10) / 2) : 0}
                      onRollComplete={handleHitDiceRollComplete}
                      themeColor={currentTheme.accent}
                    />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Получаем Hit Die для класса
const getHitDieByClass = (characterClass: string): 'd4' | 'd6' | 'd8' | 'd10' | 'd12' => {
  const hitDice: Record<string, 'd4' | 'd6' | 'd8' | 'd10' | 'd12'> = {
    "Варвар": "d12",
    "Воин": "d10",
    "Паладин": "d10",
    "Следопыт": "d10",
    "Жрец": "d8",
    "Друид": "d8",
    "Монах": "d8",
    "Плут": "d8",
    "Бард": "d8",
    "Колдун": "d8",
    "Чернокнижник": "d8",
    "Волшебник": "d6",
    "Чародей": "d6"
  };
  
  return hitDice[characterClass] || "d8"; // По умолчанию d8
};
