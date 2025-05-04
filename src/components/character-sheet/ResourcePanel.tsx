
import React, { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Heart, Shield, Dices, RefreshCw, Plus, Minus } from 'lucide-react';
import { useContext } from 'react';
import { CharacterContext } from '@/contexts/CharacterContext';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PopoverTrigger, PopoverContent, Popover } from '@/components/ui/popover';
import { HPBar } from './HPBar';
import { DamageLog } from './DamageLog';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { DiceRoller3DFixed } from '@/components/character-sheet/DiceRoller3DFixed';
import { useHitPoints } from '@/hooks/useHitPoints';
import {
  calculateArmorClass,
  getInitiativeModifier,
  calculateCarryingCapacity,
  getHitDieTypeByClass
} from '@/utils/characterUtils';

interface ResourcePanelProps {
  currentHp: number;
  maxHp: number;
  onHpChange: (value: number) => void;
}

export const ResourcePanel: React.FC<ResourcePanelProps> = ({ 
  currentHp, 
  maxHp, 
  onHpChange 
}) => {
  const { character, updateCharacter } = useContext(CharacterContext);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  const [showHitDiceRoller, setShowHitDiceRoller] = useState(false);
  const [showHealingRoller, setShowHealingRoller] = useState(false);
  const [showDeathSaveRoller, setShowDeathSaveRoller] = useState(false);
  const [hpAdjustValue, setHpAdjustValue] = useState(1);
  const [isShortResting, setIsShortResting] = useState(false);
  const [isLongResting, setIsLongResting] = useState(false);
  
  // Получаем constitution из character
  const constitution = character?.abilities?.constitution || 10;
  
  // Используем хук для управления HP
  const {
    currentHp: hitPoints,
    maxHp: maxHitPoints,
    tempHp,
    events,
    isUnconscious,
    deathSaves,
    applyDamage,
    applyHealing,
    setTemporaryHp,
    undoLastEvent,
    rollHitDieHealing,
    shortRest,
    longRest,
    rollDeathSave
  } = useHitPoints({
    currentHp,
    maxHp,
    constitution,
    onHitPointChange: (hp, tempHp, deathSaves) => {
      onHpChange(hp);
      updateCharacter({
        currentHp: hp,
        temporaryHp: tempHp,
        deathSaves
      });
    }
  });
  
  // Предопределенные значения для быстрого изменения HP
  const quickDamageValues = [1, 5, 10, 50, 100];
  const quickHealValues = [1, 5, 10, 50, 100];
  const quickTempHpValues = [5, 10, 25, 50];
  
  // Обработчики событий для бросков кубиков
  const handleHealingRollComplete = (result: number) => {
    applyHealing(result, "Бросок лечения");
    setShowHealingRoller(false);
  };
  
  const handleDeathSaveRollComplete = (result: number) => {
    rollDeathSave(result);
    setShowDeathSaveRoller(false);
  };
  
  const handleHitDiceRollComplete = (result: number) => {
    const healingAmount = rollHitDieHealing(result);
    setShowHitDiceRoller(false);
    
    // Уменьшаем доступные Hit Dice
    if (character && character.hitDice) {
      const updatedHitDice = {
        ...character.hitDice,
        used: Math.min(character.hitDice.total, (character.hitDice.used || 0) + 1)
      };
      
      updateCharacter({
        hitDice: updatedHitDice
      });
    }
  };
  
  // Обработчики для отдыха
  const handleShortRest = () => {
    if (!character) return;
    
    setIsShortResting(true);
    
    // Имитируем загрузку
    setTimeout(() => {
      // Восстанавливаем Hit Dice (до 1/2 от максимума)
      let hitDiceToRestore = 0;
      if (character.hitDice) {
        const maxRestore = Math.max(1, Math.floor(character.level / 2));
        hitDiceToRestore = Math.min(
          maxRestore,
          character.hitDice.total - (character.hitDice.total - character.hitDice.used)
        );
        
        const updatedHitDice = {
          ...character.hitDice,
          used: Math.max(0, character.hitDice.used - hitDiceToRestore)
        };
        
        updateCharacter({
          hitDice: updatedHitDice
        });
      }
      
      // Проводим короткий отдых
      shortRest();
      
      setIsShortResting(false);
    }, 1500);
  };
  
  const handleLongRest = () => {
    if (!character) return;
    
    setIsLongResting(true);
    
    // Имитируем загрузку
    setTimeout(() => {
      // Восстанавливаем все Hit Dice (до половины от максимума)
      if (character.hitDice) {
        const maxRestore = Math.max(1, Math.floor(character.hitDice.total / 2));
        const updatedHitDice = {
          ...character.hitDice,
          used: Math.max(0, character.hitDice.used - maxRestore)
        };
        
        updateCharacter({
          hitDice: updatedHitDice,
          temporaryHp: 0
        });
      }
      
      // Восстанавливаем ячейки заклинаний
      let updatedSpellSlots = { ...character.spellSlots };
      if (updatedSpellSlots) {
        for (const level in updatedSpellSlots) {
          if (updatedSpellSlots.hasOwnProperty(level)) {
            updatedSpellSlots[level] = {
              ...updatedSpellSlots[level],
              used: 0
            };
          }
        }
        
        updateCharacter({
          spellSlots: updatedSpellSlots
        });
      }
      
      // Восстанавливаем очки чародея
      if (character.sorceryPoints && character.className?.includes('Чародей')) {
        updateCharacter({
          sorceryPoints: {
            current: character.level,
            max: character.level
          }
        });
      }
      
      // Проводим длинный отдых
      longRest();
      
      setIsLongResting(false);
    }, 2000);
  };
  
  // Вспомогательные функции
  const getHitDieByClass = (characterClass?: string): "d4" | "d6" | "d8" | "d10" | "d12" => {
    if (!characterClass) return "d8";
    
    const hitDieType = getHitDieTypeByClass(characterClass);
    switch (hitDieType) {
      case "d4": return "d4";
      case "d6": return "d6";
      case "d8": return "d8";
      case "d10": return "d10";
      case "d12": return "d12";
      default: return "d8";
    }
  };
  
  // Блокируем использование Hit Die, если все использованы
  const hitDiceAvailable = character?.hitDice 
    ? character.hitDice.total - character.hitDice.used
    : 0;
  
  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
      <h3 className="text-lg font-semibold mb-4 text-primary">Ресурсы</h3>
      
      <div className="space-y-4">
        {/* HP и Temp HP бары */}
        <div>
          <HPBar 
            currentHp={hitPoints} 
            maxHp={maxHitPoints} 
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
                    setTemporaryHp(value, "Ручное изменение");
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
                          onClick={() => setTemporaryHp(value, "Временные хиты")}
                          className="justify-start h-7"
                        >
                          <Shield className="h-3 w-3 mr-1 text-emerald-400" /> {value} HP
                        </Button>
                      ))}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setTemporaryHp(0, "Сброс временных хитов")}
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
          
          {/* Состояние персонажа и спасброски от смерти */}
          {isUnconscious && (
            <div className="mb-3 border border-red-900/50 rounded-lg p-2 bg-red-900/10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-red-500">Персонаж без сознания</span>
                <span className="text-xs text-red-400">
                  Спасброски от смерти: {deathSaves.successes}/3 успехов, {deathSaves.failures}/3 провалов
                </span>
              </div>
              
              <Button 
                variant="destructive" 
                className="w-full h-8 text-sm"
                onClick={() => setShowDeathSaveRoller(true)}
              >
                Сделать спасбросок от смерти
              </Button>
            </div>
          )}
          
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
                    disabled={hitDiceAvailable <= 0}
                  >
                    <Dices className="h-3 w-3" /> Hit Die ({hitDiceAvailable})
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
                    initialDice={getHitDieByClass(character?.className)}
                    hideControls={false}
                    modifier={getNumericModifier(constitution)}
                    onRollComplete={handleHitDiceRollComplete}
                    themeColor={currentTheme.accent}
                  />
                </div>
              </SheetContent>
            </Sheet>
          </div>
          
          {/* Для спасбросков от смерти отдельное окно */}
          <Sheet open={showDeathSaveRoller} onOpenChange={setShowDeathSaveRoller}>
            <SheetContent side="right" className="w-[90%] sm:max-w-md p-0">
              <SheetHeader className="p-4">
                <SheetTitle>Спасбросок от смерти</SheetTitle>
                <SheetDescription>
                  10+: Успех (3 успеха = стабилизация), 
                  1-9: Провал (3 провала = смерть),
                  20: Критический успех (1 HP),  
                  1: Критический провал (2 провала)
                </SheetDescription>
              </SheetHeader>
              <div className="h-[80vh]">
                <DiceRoller3DFixed
                  initialDice="d20"
                  hideControls={false}
                  modifier={0}
                  onRollComplete={handleDeathSaveRollComplete}
                  themeColor={currentTheme.accent}
                />
              </div>
            </SheetContent>
          </Sheet>
          
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
              <div className="text-xl font-bold text-primary">
                {character?.abilities ? calculateArmorClass(
                  character.abilities.dexterity,
                  character.abilities.constitution,
                  character.abilities.wisdom,
                  character.className
                ) : 10}
              </div>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.03 }} 
              whileTap={{ scale: 0.98 }}
              className="bg-primary/10 p-3 rounded-lg text-center"
            >
              <div className="text-sm text-muted-foreground mb-1">Инициатива</div>
              <div className="text-xl font-bold text-primary">
                {character?.abilities ? 
                  getInitiativeModifier(character.abilities.dexterity) : 
                  "+0"}
              </div>
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
              {character?.abilities ? 
                calculateCarryingCapacity(character.abilities.strength) : 
                "0 фунтов"}
            </span>
          </div>
        </div>
        
        <Separator />
        
        {/* Панель отдыха */}
        <div>
          <div className="flex flex-col space-y-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={isShortResting ? undefined : handleShortRest}
              disabled={isShortResting || isLongResting}
              className={`w-full flex items-center justify-center gap-1 ${isShortResting ? 'animate-pulse' : ''}`}
              style={{
                color: currentTheme.textColor,
                borderColor: currentTheme.accent
              }}
            >
              {isShortResting ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Короткий отдых
            </Button>
            
            <Button 
              size="sm"
              onClick={isLongResting ? undefined : handleLongRest}
              disabled={isShortResting || isLongResting}
              className={`w-full flex items-center justify-center gap-1 ${isLongResting ? 'animate-pulse' : ''}`}
              style={{
                color: currentTheme.buttonText || '#FFFFFF',
                backgroundColor: isLongResting ? `${currentTheme.accent}80` : currentTheme.accent
              }}
            >
              {isLongResting ? (
                <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              Длинный отдых
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};
