import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Heart, Shield, Dices } from 'lucide-react';
import { useContext } from 'react';
import { CharacterContext } from '@/contexts/CharacterContext';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { DiceRoller3DFixed } from '@/components/character-sheet/DiceRoller3DFixed';
import { useToast } from '@/hooks/use-toast';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PopoverTrigger, PopoverContent, Popover } from '@/components/ui/popover';
import { RestPanel } from './RestPanel';

interface ResourcePanelProps {
  currentHp: number;
  maxHp: number;
  onHpChange: (value: number) => void;
}

export const ResourcePanel = ({ currentHp, maxHp, onHpChange }: ResourcePanelProps) => {
  const { character, updateCharacter } = useContext(CharacterContext);
  const { theme } = useTheme();
  const { toast } = useToast();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  const [showHitDiceRoller, setShowHitDiceRoller] = useState(false);
  const [showHealingRoller, setShowHealingRoller] = useState(false);
  const [hpAdjustValue, setHpAdjustValue] = useState(1);
  
  // Используем state для отслеживания временных HP
  const [temporaryHp, setTemporaryHp] = useState(0);
  
  // Синхронизируем временные HP с данными персонажа
  useEffect(() => {
    if (character?.temporaryHp !== undefined) {
      setTemporaryHp(character.temporaryHp);
    }
  }, [character?.temporaryHp]);
  
  // Функция для изменения HP (урон или лечение)
  const handleHpAdjust = (amount: number) => {
    if (!character) return;
    
    // Если это урон (отрицательное значение), сначала применяем к временным HP
    if (amount < 0) {
      const damage = Math.abs(amount);
      let remainingDamage = damage;
      let newTempHp = temporaryHp;
      
      // Если есть временные HP, сначала уменьшаем их
      if (temporaryHp > 0) {
        if (temporaryHp >= damage) {
          // Временных HP достаточно, чтобы поглотить весь урон
          newTempHp = temporaryHp - damage;
          remainingDamage = 0;
        } else {
          // Временных HP не хватает, оставшийся урон идет к обычным HP
          newTempHp = 0;
          remainingDamage = damage - temporaryHp;
        }
        
        // Обновляем временные HP
        setTemporaryHp(newTempHp);
        updateCharacter({ temporaryHp: newTempHp });
      }
      
      // Если после вычета из временного HP остался урон, применяем его к обычным HP
      if (remainingDamage > 0) {
        const newCurrentHp = Math.max(0, currentHp - remainingDamage);
        onHpChange(newCurrentHp);
      }
      
      // Показываем сообщение о полученном уроне
      toast({
        title: "Урон получен",
        description: `Урон: ${damage} (Обычные HP: -${Math.min(currentHp, remainingDamage)}, Временные HP: -${damage - remainingDamage})`,
      });
    } else {
      // Для лечения (положительное значение) увеличиваем только обычные HP, но не выше максимума
      const newCurrentHp = Math.min(maxHp, currentHp + amount);
      onHpChange(newCurrentHp);
      
      toast({
        title: "Лечение получено",
        description: `Восстановлено HP: +${newCurrentHp - currentHp}`,
      });
    }
  };
  
  // Функция для добавления временных HP
  const handleAddTemporaryHp = (value: number) => {
    // Временные HP не складываются, берется наибольшее значение
    const newTempHp = Math.max(temporaryHp, value);
    setTemporaryHp(newTempHp);
    updateCharacter({ temporaryHp: newTempHp });
    
    toast({
      title: "Временное HP добавлено",
      description: `Установлено значение: ${newTempHp}`,
    });
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
    
    // Для разных классов можно добавить бонусы
    let ac = 10 + dexMod;
    
    if (character.className?.includes('Монах')) {
      const wisMod = Math.floor((character.abilities.WIS - 10) / 2);
      ac += wisMod;
    } else if (character.className?.includes('Варвар')) {
      const conMod = Math.floor((character.abilities.CON - 10) / 2);
      ac += conMod;
    }
    
    return ac;
  };
  
  // Вычисляем грузоподъемность
  const getCarryingCapacity = () => {
    if (!character?.abilities?.STR) return "0";
    const capacity = character.abilities.STR * 15;
    return `${capacity} фунтов`;
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
  
  // Рассчитываем общие значения HP для правильного отображения
  const totalCurrentHp = currentHp;
  const totalMaxHp = maxHp;
  const effectiveMaxHp = maxHp + temporaryHp;
  const healthPercentage = totalMaxHp > 0 ? (totalCurrentHp / totalMaxHp) * 100 : 0;
  const tempHpPercentage = effectiveMaxHp > 0 ? (temporaryHp / effectiveMaxHp) * 100 : 0;
  
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
              {totalCurrentHp} / {totalMaxHp}
              {temporaryHp > 0 && <span className="ml-1 text-emerald-400">(+{temporaryHp})</span>}
            </span>
          </div>
          
          {/* HP Bar with two layers */}
          <div className="relative h-3">
            {/* Base HP bar */}
            <Progress 
              value={healthPercentage} 
              className={`h-3 ${healthPercentage > 60 ? 'bg-green-500' : healthPercentage > 30 ? 'bg-orange-500' : 'bg-red-500'}`}
            />
            
            {/* Temporary HP overlay */}
            {temporaryHp > 0 && (
              <div 
                className="absolute top-0 right-0 h-3 bg-emerald-400/70 rounded-r-full" 
                style={{ 
                  width: `${tempHpPercentage}%`,
                  boxShadow: '0 0 5px rgba(52, 211, 153, 0.7)'
                }}
              />
            )}
          </div>
          
          <div className="mt-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="adjust-hp" className="text-xs text-primary">Изменить HP</Label>
                <div className="flex mt-1 gap-1">
                  <Input 
                    id="adjust-hp"
                    type="number" 
                    value={hpAdjustValue}
                    onChange={(e) => setHpAdjustValue(Math.max(1, parseInt(e.target.value) || 1))}
                    className="h-8 text-sm"
                    style={{
                      backgroundColor: `${currentTheme.cardBackground}80`,
                      color: currentTheme.textColor
                    }}
                  />
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleHpAdjust(-hpAdjustValue)}
                    style={{
                      borderColor: `${currentTheme.accent}60`
                    }}
                  >
                    -
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => handleHpAdjust(hpAdjustValue)}
                    style={{
                      borderColor: `${currentTheme.accent}60`
                    }}
                  >
                    +
                  </Button>
                </div>
              </div>
              
              <div>
                <Label htmlFor="temp-hp" className="text-xs text-primary">Временное HP</Label>
                <div className="flex mt-1 gap-1">
                  <Input 
                    id="temp-hp"
                    type="number" 
                    value={temporaryHp}
                    onChange={(e) => {
                      const value = Math.max(0, parseInt(e.target.value) || 0);
                      setTemporaryHp(value);
                      updateCharacter({ temporaryHp: value });
                    }}
                    className="h-8 text-sm"
                    style={{
                      backgroundColor: `${currentTheme.cardBackground}80`,
                      color: currentTheme.textColor
                    }}
                  />
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="outline"
                        style={{
                          borderColor: `${currentTheme.accent}60`
                        }}
                      >
                        +
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-2">
                      <div className="grid gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleAddTemporaryHp(5)}
                        >
                          +5 Temp HP
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleAddTemporaryHp(10)}
                        >
                          +10 Temp HP
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => {
                            setTemporaryHp(0);
                            updateCharacter({ temporaryHp: 0 });
                          }}
                        >
                          Сбросить
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-2 flex justify-between gap-2">
            <Sheet open={showHealingRoller} onOpenChange={setShowHealingRoller}>
              <SheetTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center gap-1"
                  style={{ borderColor: `${currentTheme.accent}60` }}
                >
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
            
            <Sheet open={showHitDiceRoller} onOpenChange={setShowHitDiceRoller}>
              <SheetTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex items-center gap-1"
                  style={{ borderColor: `${currentTheme.accent}60` }}
                >
                  <Dices className="h-3 w-3" /> Hit Die
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
                    initialDice={getHitDieByClass(character?.className || '')}
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
        
        <Separator />
        
        <div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-primary/10 p-3 rounded-lg text-center">
              <div className="flex justify-center mb-1">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm text-muted-foreground">Класс Брони</div>
              <div className="text-xl font-bold text-primary">{getArmorClass() || "10"}</div>
            </div>
            
            <div className="bg-primary/10 p-3 rounded-lg text-center">
              <div className="text-sm text-muted-foreground mb-1">Инициатива</div>
              <div className="text-xl font-bold text-primary">{getInitiative() || "+0"}</div>
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
              {getCarryingCapacity()}
            </span>
          </div>
        </div>
        
        <Separator />
        
        {/* Компактная панель отдыха */}
        <div className="mt-2">
          <RestPanel compact={true} />
        </div>
      </div>
    </Card>
  );
};

// Получаем Hit Die для класса
const getHitDieByClass = (characterClass: string): "d4" | "d6" | "d8" | "d10" | "d12" => {
  const hitDice: Record<string, "d4" | "d6" | "d8" | "d10" | "d12"> = {
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
