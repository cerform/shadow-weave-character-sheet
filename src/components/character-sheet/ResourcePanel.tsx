
import React, { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Heart, Shield, Dices, RefreshCw, Plus, Minus } from 'lucide-react';
import { useContext } from 'react';
import { CharacterContext } from '@/contexts/CharacterContext';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { useToast } from '@/hooks/use-toast';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PopoverTrigger, PopoverContent, Popover } from '@/components/ui/popover';
import { HPBar } from './HPBar';
import { DamageLog } from './DamageLog';
import { useDamageLog } from '@/hooks/useDamageLog';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { DiceRoller3DFixed } from '@/components/character-sheet/DiceRoller3DFixed';
import { RestPanel } from './RestPanel';

interface ResourcePanelProps {
  currentHp: number;
  maxHp: number;
  onHpChange: (value: number) => void;
}

export const ResourcePanel = ({ currentHp, maxHp, onHpChange }: ResourcePanelProps) => {
  const { character, updateCharacter } = useContext(CharacterContext);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  const [showHitDiceRoller, setShowHitDiceRoller] = useState(false);
  const [showHealingRoller, setShowHealingRoller] = useState(false);
  const [hpAdjustValue, setHpAdjustValue] = useState(1);
  const initializedRef = useRef(false);
  
  // Используем хук для управления уроном и здоровьем
  const { 
    currentHp: logCurrentHp, 
    tempHp, 
    events, 
    applyDamage, 
    applyHealing, 
    addTempHp, 
    undoLastEvent,
    setHp,
    setTempHp
  } = useDamageLog(currentHp, maxHp, (hp, tempHp) => {
    // Избегаем повторных обновлений при инициализации
    if (!initializedRef.current) return;
    
    onHpChange(hp);
    updateCharacter({ 
      currentHp: hp,
      temporaryHp: tempHp
    });
  });
  
  // Синхронизируем текущее HP и временные HP с данными персонажа
  useEffect(() => {
    // Используем тихий режим при первоначальной загрузке
    const silent = !initializedRef.current;
    
    setHp(currentHp, silent);
    if (character?.temporaryHp !== undefined) {
      setTempHp(character.temporaryHp, silent);
    }
    
    // После первой синхронизации отмечаем компонент как инициализированный
    if (!initializedRef.current) {
      initializedRef.current = true;
    }
  }, [currentHp, character?.temporaryHp, setHp, setTempHp]);
  
  // Предопределенные значения для быстрого изменения HP
  const quickDamageValues = [1, 5, 10, 50, 100];
  const quickHealValues = [1, 5, 10, 50, 100];
  const quickTempHpValues = [5, 10, 25, 50];
  
  // Обработчики событий для бросков кубиков
  const handleHealingRollComplete = (result: number) => {
    applyHealing(result, "Лечебный бросок");
    setShowHealingRoller(false);
  };
  
  const handleHitDiceRollComplete = (result: number) => {
    const conMod = character?.abilities ? Math.floor((character.abilities.CON - 10) / 2) : 0;
    const healingAmount = result + conMod;
    
    applyHealing(healingAmount, "Hit Die");
    setShowHitDiceRoller(false);
  };
  
  // Вспомогательные функции
  const getInitiative = () => {
    if (!character?.abilities) return '+0';
    const dexMod = Math.floor((character.abilities.DEX - 10) / 2);
    return dexMod >= 0 ? `+${dexMod}` : `${dexMod}`;
  };
  
  const getArmorClass = () => {
    if (!character?.abilities) return 10;
    
    const dexMod = Math.floor((character.abilities.DEX - 10) / 2);
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
  
  const getCarryingCapacity = () => {
    if (!character?.abilities?.STR) return "0";
    const capacity = character.abilities.STR * 15;
    return `${capacity} фунтов`;
  };
  
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
    
    return hitDice[characterClass] || "d8";
  };
  
  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
      <h3 className="text-lg font-semibold mb-4 text-primary">Ресурсы</h3>
      
      <div className="space-y-4">
        {/* HP и Temp HP бары */}
        <div>
          <HPBar 
            currentHp={logCurrentHp} 
            maxHp={maxHp} 
            tempHp={tempHp} 
            showValues={true}
            height="1.5rem"
            className="mb-3"
          />
          
          <div className="grid grid-cols-3 gap-2 mb-3">
            {/* Панель быстрых кнопок урона */}
            <div className="col-span-3">
              <Label className="text-xs text-primary mb-1 block">Быстрые действия</Label>
              <div className="grid grid-cols-2 gap-2">
                {/* Урон */}
                <div className="bg-black/20 p-2 rounded-md">
                  <div className="flex items-center gap-1 mb-1">
                    <Minus className="h-3 w-3 text-red-500" />
                    <span className="text-xs text-primary">Урон</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {quickDamageValues.map(value => (
                      <motion.div key={`damage-${value}`} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-6 px-2 text-xs bg-red-900/20 hover:bg-red-900/30"
                          onClick={() => applyDamage(value, `Быстрый урон ${value}`)}
                        >
                          {value}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                {/* Лечение */}
                <div className="bg-black/20 p-2 rounded-md">
                  <div className="flex items-center gap-1 mb-1">
                    <Plus className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-primary">Лечение</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {quickHealValues.map(value => (
                      <motion.div key={`heal-${value}`} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-6 px-2 text-xs bg-green-900/20 hover:bg-green-900/30"
                          onClick={() => applyHealing(value, `Быстрое лечение ${value}`)}
                        >
                          {value}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Ручной ввод урона/лечения */}
            <div className="col-span-2">
              <Label htmlFor="adjust-hp" className="text-xs text-primary mb-1 block">Ввод значения</Label>
              <div className="flex gap-1">
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
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => applyDamage(hpAdjustValue, "Ввод урона")}
                    className="bg-red-900/20 hover:bg-red-900/30 h-8"
                  >
                    <Minus className="h-4 w-4 text-red-500" />
                  </Button>
                </motion.div>
                <motion.div whileTap={{ scale: 0.95 }}>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => applyHealing(hpAdjustValue, "Ввод лечения")}
                    className="bg-green-900/20 hover:bg-green-900/30 h-8"
                  >
                    <Plus className="h-4 w-4 text-green-500" />
                  </Button>
                </motion.div>
              </div>
            </div>
            
            {/* Временное HP */}
            <div>
              <Label htmlFor="temp-hp" className="text-xs text-primary mb-1 block">Временное HP</Label>
              <div className="flex gap-1">
                <Input 
                  id="temp-hp"
                  type="number" 
                  value={tempHp}
                  onChange={(e) => {
                    const value = Math.max(0, parseInt(e.target.value) || 0);
                    addTempHp(value, "Ввод временного HP");
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
                      className="bg-emerald-900/20 hover:bg-emerald-900/30 h-8"
                    >
                      <Shield className="h-4 w-4 text-emerald-400" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-40 p-2">
                    <div className="grid gap-1">
                      {quickTempHpValues.map(value => (
                        <Button 
                          key={`temp-${value}`}
                          size="sm" 
                          variant="ghost" 
                          onClick={() => addTempHp(value, "Временные хиты")}
                          className="justify-start h-7"
                        >
                          <Shield className="h-3 w-3 mr-1 text-emerald-400" /> {value} HP
                        </Button>
                      ))}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => addTempHp(0, "Сброс временных хитов")}
                        className="justify-start h-7 text-red-400"
                      >
                        Сбросить все
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
          
          {/* Броски кубиков для лечения */}
          <div className="flex justify-between gap-2 mb-2">
            <Sheet open={showHealingRoller} onOpenChange={setShowHealingRoller}>
              <SheetTrigger asChild>
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full flex items-center gap-1 bg-green-900/20 hover:bg-green-900/30"
                  >
                    <Dices className="h-3 w-3" /> Бросок лечения
                  </Button>
                </motion.div>
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
                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="w-full flex items-center gap-1"
                  >
                    <Dices className="h-3 w-3" /> Hit Die
                  </Button>
                </motion.div>
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
          
          {/* Журнал урона/лечения */}
          {events.length > 0 && (
            <DamageLog 
              events={events} 
              undoLastEvent={undoLastEvent} 
              className="mt-3"
            />
          )}
        </div>
        
        <Separator />
        
        {/* Блок с характеристиками боя */}
        <div>
          <div className="grid grid-cols-2 gap-4">
            <motion.div 
              whileHover={{ scale: 1.03 }} 
              whileTap={{ scale: 0.98 }}
              className="bg-primary/10 p-3 rounded-lg text-center"
            >
              <div className="flex justify-center mb-1">
                <Shield className="h-4 w-4 text-primary" />
              </div>
              <div className="text-sm text-muted-foreground">Класс Брони</div>
              <div className="text-xl font-bold text-primary">{getArmorClass() || "10"}</div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.03 }} 
              whileTap={{ scale: 0.98 }}
              className="bg-primary/10 p-3 rounded-lg text-center"
            >
              <div className="text-sm text-muted-foreground mb-1">Инициатива</div>
              <div className="text-xl font-bold text-primary">{getInitiative() || "+0"}</div>
            </motion.div>
          </div>
        </div>
        
        <Separator />
        
        {/* Блок с второстепенными характеристиками */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-primary">Скорость</span>
            <span className="text-sm text-primary">30 футов</span>
          </div>
          
          <div className="flex justify-between items-center">
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
