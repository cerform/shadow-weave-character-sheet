import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield, Plus, Minus, Dices, RefreshCw } from 'lucide-react';
import { getNumericModifier } from '@/utils/characterUtils';
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
  getHitDieTypeByClass } from '@/utils/characterUtils';

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
    temporaryHp: character?.temporaryHp,
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
        <div className="space-y-2">
          {/* HP и Temp HP бары */}
          <div>
            <HPBar 
              currentHp={hitPoints}
              maxHp={maxHitPoints}
              tempHp={tempHp}
              showValues={true}
              height="1.5rem"
            />
          </div>
          
          {/* Интерактив��ые кнопки для изменения HP */}
          <div className="flex items-center justify-between gap-2">
            {/* Кнопка урона */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="flex-1 flex items-center gap-1"
                  size="sm"
                >
                  <Minus className="h-4 w-4" /> Урон
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" className="w-48">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Input 
                      type="number" 
                      value={hpAdjustValue} 
                      onChange={(e) => setHpAdjustValue(Math.max(1, parseInt(e.target.value) || 0))}
                      className="h-8 text-sm"
                    />
                    <Button 
                      size="sm"
                      variant="destructive"
                      onClick={() => applyDamage(hpAdjustValue, "Ручной урон")}
                    >
                      OK
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {quickDamageValues.map(value => (
                      <Button
                        key={`damage-${value}`}
                        size="sm"
                        variant="outline"
                        onClick={() => applyDamage(value, "Быстрый урон")}
                        className="justify-start h-7"
                      >
                        <Minus className="h-3 w-3 mr-1 text-red-400" /> {value}
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Кнопка лечения */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="default" 
                  className="flex-1 flex items-center gap-1 bg-green-700 hover:bg-green-800"
                  size="sm"
                >
                  <Plus className="h-4 w-4" /> Лечение
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" className="w-48">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Input 
                      type="number" 
                      value={hpAdjustValue} 
                      onChange={(e) => setHpAdjustValue(Math.max(1, parseInt(e.target.value) || 0))}
                      className="h-8 text-sm"
                    />
                    <Button 
                      size="sm"
                      variant="default"
                      className="bg-green-700 hover:bg-green-800"
                      onClick={() => applyHealing(hpAdjustValue, "Ручное лечение")}
                    >
                      OK
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {quickDamageValues.map(value => (
                      <Button
                        key={`heal-${value}`}
                        size="sm"
                        variant="outline"
                        onClick={() => applyHealing(value, "Быстрое лечение")}
                        className="justify-start h-7"
                      >
                        <Plus className="h-3 w-3 mr-1 text-green-400" /> {value}
                      </Button>
                    ))}
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Кнопка временных HP */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="default" 
                  className="flex-1 flex items-center gap-1 bg-emerald-700 hover:bg-emerald-800"
                  size="sm"
                >
                  <Shield className="h-4 w-4" /> Temp HP
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" className="w-48">
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <Input 
                      type="number" 
                      value={tempHp}
                      onChange={(e) => {
                        const value = Math.max(0, parseInt(e.target.value) || 0);
                        setTemporaryHp(value, "Ручное изменение");
                      }}
                      className="h-8 text-sm"
                      style={{
                        borderColor: currentTheme.accent,
                        color: currentTheme.textColor
                      }}
                    />
                    <Button 
                      size="sm"
                      variant="default"
                      className="bg-emerald-700 hover:bg-emerald-800"
                      onClick={() => setTemporaryHp(hpAdjustValue, "Временные хиты")}
                    >
                      OK
                    </Button>
                  </div>
                  <div className="grid grid-cols-3 gap-1">
                    {[5, 10, 15, 20, 25, 30].map(value => (
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
                </div>
              </PopoverContent>
            </Popover>
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
                <motion.div className="flex-1">
                  <Button 
                    variant="outline"
                    className="w-full flex items-center gap-1"
                    size="sm"
                  >
                    <Dices className="h-3 w-3" /> Бросок лечения
                  </Button>
                </motion.div>
              </SheetTrigger>
              <SheetContent side="right" className="w-[90%] sm:max-w-md p-0">
                <SheetHeader className="p-4">
                  <SheetTitle>Бросок лечения</SheetTitle>
                  <SheetDescription>
                    Выберите тип броска для восстановления здоровья
                  </SheetDescription>
                </SheetHeader>
                <div className="h-[80vh]">
                  <DiceRoller3DFixed
                    initialDice="d8" // было "2d4+2"
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
                <motion.div className="flex-1">
                  <Button 
                    variant="outline"
                    size="sm" 
                    className="w-full flex items-center gap-1"
                    disabled={hitDiceAvailable <= 0}
                  >
                    <Dices className="h-3 w-3" /> Hit Die ({hitDiceAvailable})
                  </Button>
                </motion.div>
              </SheetTrigger>
              <SheetContent side="right" className="w-[90%] sm:max-w-md p-0">
                <SheetHeader className="p-4">
                  <SheetTitle>Использование Hit Die</SheetTitle>
                  <SheetDescription>
                    Используйте кубик хитов для восстановления здоровья
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
              maxEvents={5}
              className="mt-3"
            />
          )}
        </div>
        
        <Separator />
        
        <div>
          <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Боевые характеристики</h4>
          
          <div className="grid grid-cols-3 gap-3 my-3">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
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
        
        <div>
          {/* Характеристики грузоподъемности и прочее */}
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
