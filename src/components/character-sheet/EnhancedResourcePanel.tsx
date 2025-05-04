
import React, { useState, useEffect, useContext } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { Heart, Shield, Dices, RefreshCw, Plus, Minus, Clock, Bed } from 'lucide-react';
import { CharacterContext } from '@/contexts/CharacterContext';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { HPBar } from './HPBar';
import { DamageLog } from './DamageLog';
import { motion } from 'framer-motion';
import { DiceRoller3DFixed } from '@/components/character-sheet/DiceRoller3DFixed';
import { useHealthSystem } from '@/hooks/useHealthSystem';
import { useRestSystem } from '@/hooks/useRestSystem';
import { getNumericModifier } from '@/utils/characterUtils';
import { CharacterSheet } from '@/types/character';

export const EnhancedResourcePanel: React.FC = () => {
  const { character, updateCharacter } = useContext(CharacterContext);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  const [showHitDiceRoller, setShowHitDiceRoller] = useState(false);
  const [showHealingRoller, setShowHealingRoller] = useState(false);
  const [damageValue, setDamageValue] = useState(1);
  const [healValue, setHealValue] = useState(1);
  const [tempHpValue, setTempHpValue] = useState(1);
  
  // Получаем модификатор телосложения
  const constitutionModifier = character?.abilities
    ? getNumericModifier(character.abilities.constitution || 10)
    : 0;
  
  // Инициализируем систему здоровья
  const {
    currentHp,
    maxHp,
    tempHp,
    events,
    applyDamage,
    applyHealing,
    addTempHp,
    undoLastEvent
  } = useHealthSystem({
    initialCurrentHp: character?.currentHp || 0,
    initialMaxHp: character?.maxHp || 1,
    initialTempHp: character?.temporaryHp || 0,
    constitutionModifier,
    onHealthChange: (newCurrentHp, newMaxHp, newTempHp) => {
      // Создаем обновление правильного типа
      const updates: Partial<CharacterSheet> = {
        currentHp: newCurrentHp,
        maxHp: newMaxHp,
        temporaryHp: newTempHp
      };
      updateCharacter(updates);
    }
  });
  
  // Инициализируем систему отдыха
  const {
    isShortResting,
    isLongResting,
    takeShortRest,
    takeLongRest,
    useHitDie,
    getHitDieType,
    getCurrentHitDice,
    getMaxHitDice
  } = useRestSystem({
    character,
    updateCharacter,
    onHealthRestore: (amount, isLongRest) => {
      if (isLongRest) {
        // Полное восстановление при длинном отдыхе
        updateCharacter({
          currentHp: character?.maxHp || 0,
          temporaryHp: 0
        });
      } else {
        // Частичное восстановление при коротком отдыхе
        applyHealing(amount, 'Короткий отдых');
      }
    }
  });
  
  // Обработчики изменения значений в полях ввода
  const handleDamageValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setDamageValue(value);
    }
  };
  
  const handleHealValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setHealValue(value);
    }
  };
  
  const handleTempHpValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0) {
      setTempHpValue(value);
    }
  };
  
  // Обработчик броска кубика хитов
  const handleHitDieRollComplete = (result: number) => {
    useHitDie(result);
    setShowHitDiceRoller(false);
  };
  
  // Обработчик броска кубика лечения
  const handleHealingRollComplete = (result: number) => {
    applyHealing(result, 'Лечебное заклинание');
    setShowHealingRoller(false);
  };
  
  // Безопасное получение типа кубика хитов для использования с DiceRoller3DFixed
  const getSafeDiceType = (): "d4" | "d6" | "d8" | "d10" | "d12" | "d20" | "d100" => {
    const diceType = getHitDieType();
    // Преобразуем в один из допустимых типов для компонента DiceRoller3DFixed
    switch (diceType) {
      case "d4": return "d4";
      case "d6": return "d6";
      case "d8": return "d8";
      case "d10": return "d10";
      case "d12": return "d12";
      case "d20": return "d20";
      default: return "d8"; // Значение по умолчанию
    }
  };
  
  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
      <h3 className="text-lg font-semibold mb-4 text-primary">Ресурсы</h3>
      
      <div className="space-y-4">
        {/* HP и Temp HP бары */}
        <div>
          <HPBar 
            currentHp={currentHp} 
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
                    <span className="text-xs font-medium">Урон</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {[1, 5, 10, 50, 100].map(value => (
                      <Button
                        key={`damage-${value}`}
                        size="sm"
                        variant="destructive"
                        className="h-7 text-xs"
                        onClick={() => applyDamage(value)}
                      >
                        {value}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {/* Лечение */}
                <div className="bg-black/20 p-2 rounded-md">
                  <div className="flex items-center gap-1 mb-1">
                    <Plus className="h-3 w-3 text-green-500" />
                    <span className="text-xs font-medium">Лечение</span>
                  </div>
                  <div className="grid grid-cols-5 gap-1">
                    {[1, 5, 10, 50, 100].map(value => (
                      <Button
                        key={`heal-${value}`}
                        size="sm"
                        variant="secondary"
                        className="h-7 text-xs bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-500"
                        onClick={() => applyHealing(value)}
                      >
                        {value}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Панель ввода значений */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {/* Ввод урона */}
            <div>
              <Label className="text-xs mb-1 block">Урон</Label>
              <div className="flex">
                <Input
                  type="number"
                  value={damageValue}
                  min={1}
                  onChange={handleDamageValueChange}
                  className="rounded-r-none"
                />
                <Button 
                  variant="destructive" 
                  className="rounded-l-none" 
                  onClick={() => applyDamage(damageValue)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Ввод лечения */}
            <div>
              <Label className="text-xs mb-1 block">Лечение</Label>
              <div className="flex">
                <Input
                  type="number"
                  value={healValue}
                  min={1}
                  onChange={handleHealValueChange}
                  className="rounded-r-none"
                />
                <Button 
                  className="rounded-l-none bg-emerald-600 hover:bg-emerald-700" 
                  onClick={() => applyHealing(healValue)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {/* Ввод временных HP */}
            <div>
              <Label className="text-xs mb-1 block">Временные HP</Label>
              <div className="flex">
                <Input
                  type="number"
                  value={tempHpValue}
                  min={1}
                  onChange={handleTempHpValueChange}
                  className="rounded-r-none"
                />
                <Button 
                  className="rounded-l-none bg-cyan-600 hover:bg-cyan-700" 
                  onClick={() => addTempHp(tempHpValue)}
                >
                  <Shield className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Кнопки дополнительных действий */}
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2" 
              onClick={() => setShowHitDiceRoller(true)}
            >
              <Dices className="h-4 w-4" />
              <span>
                Бросок лечения 
                <span className="ml-1 text-xs opacity-70">
                  ({getCurrentHitDice()}/{getMaxHitDice()})
                </span>
              </span>
            </Button>
            
            <Button 
              variant="outline" 
              className="flex items-center gap-2" 
              onClick={() => setShowHealingRoller(true)}
            >
              <RefreshCw className="h-4 w-4" />
              Магическое лечение
            </Button>
          </div>
        </div>
        
        {/* Разделитель */}
        <div className="border-t border-gray-800 my-4"></div>
        
        {/* Панель отдыха */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">Отдых</h4>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={isShortResting ? undefined : takeShortRest}
              disabled={isShortResting || isLongResting}
              className={`flex items-center justify-center gap-1 ${isShortResting ? 'animate-pulse' : ''}`}
              style={{
                color: currentTheme.textColor,
                borderColor: currentTheme.accent
              }}
            >
              <Clock className="h-4 w-4 mr-1" />
              Короткий отдых
            </Button>
            
            <Button 
              size="sm"
              onClick={isLongResting ? undefined : takeLongRest}
              disabled={isShortResting || isLongResting}
              className={`flex items-center justify-center gap-1 ${isLongResting ? 'animate-pulse' : ''}`}
              style={{
                color: currentTheme.buttonText || '#FFFFFF',
                backgroundColor: isLongResting ? `${currentTheme.accent}80` : currentTheme.accent
              }}
            >
              <Bed className="h-4 w-4 mr-1" />
              Длинный отдых
            </Button>
          </div>
        </div>
        
        {/* Журнал урона/лечения */}
        <DamageLog 
          events={events} 
          undoLastEvent={undoLastEvent} 
          className="mt-4"
        />
      </div>
      
      {/* Диалоги для бросков кубиков */}
      <Sheet open={showHitDiceRoller} onOpenChange={setShowHitDiceRoller}>
        <SheetContent side="right" className="w-[90%] sm:max-w-md p-0">
          <SheetHeader className="p-4">
            <SheetTitle>Использование Hit Die</SheetTitle>
            <SheetDescription>
              Бросьте кубик хитов {getHitDieType()} для восстановления здоровья
            </SheetDescription>
          </SheetHeader>
          <div className="h-[80vh]">
            <DiceRoller3DFixed
              initialDice={getSafeDiceType()}
              hideControls={false}
              modifier={constitutionModifier}
              onRollComplete={handleHitDieRollComplete}
              themeColor={currentTheme.accent}
            />
          </div>
        </SheetContent>
      </Sheet>
      
      <Sheet open={showHealingRoller} onOpenChange={setShowHealingRoller}>
        <SheetContent side="right" className="w-[90%] sm:max-w-md p-0">
          <SheetHeader className="p-4">
            <SheetTitle>Магическое лечение</SheetTitle>
            <SheetDescription>
              Бросьте кубики для определения силы лечения
            </SheetDescription>
          </SheetHeader>
          <div className="h-[80vh]">
            <DiceRoller3DFixed
              initialDice="d8"
              initialCount={2}
              hideControls={false}
              modifier={constitutionModifier}
              onRollComplete={handleHealingRollComplete}
              themeColor={currentTheme.accent}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Card>
  );
};

export default EnhancedResourcePanel;
