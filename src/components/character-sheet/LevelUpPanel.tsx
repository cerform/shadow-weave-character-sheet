
import React, { useContext, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { CharacterContext } from '@/contexts/CharacterContext';
import { Crown, ArrowUp, ArrowDown, Dices } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { motion } from 'framer-motion';
import { 
  Sheet, SheetContent, SheetHeader, 
  SheetTitle, SheetDescription, SheetTrigger 
} from "@/components/ui/sheet";
import { DiceRoller3DFixed } from '@/components/character-sheet/DiceRoller3DFixed';

const LevelUpPanel = () => {
  const { character, updateCharacter } = useContext(CharacterContext);
  const { toast } = useToast();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const [showLevelUpDice, setShowLevelUpDice] = useState(false);
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [isLevelingDown, setIsLevelingDown] = useState(false);
  
  const getHitDieValue = (className: string): number => {
    const hitDiceValues: Record<string, number> = {
      "Варвар": 12,
      "Воин": 10,
      "Паладин": 10,
      "Следопыт": 10,
      "Жрец": 8,
      "Друид": 8,
      "Монах": 8,
      "Плут": 8,
      "Бард": 8,
      "Колдун": 8,
      "Чернокнижник": 8,
      "Волшебник": 6,
      "Чародей": 6
    };
    
    return hitDiceValues[className] || 8; // По умолчанию d8
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
    
    return hitDice[characterClass] || "d8"; // По умолчанию d8
  };
  
  const handleLevelUpWithDice = () => {
    if (!character) {
      toast({
        title: "Ошибка",
        description: "Персонаж не выбран",
        variant: "destructive"
      });
      return;
    }
    
    const currentLevel = character.level || 1;
    if (currentLevel >= 20) {
      toast({
        title: "Максимальный уровень",
        description: "Невозможно превысить 20 уровень",
        variant: "destructive"
      });
      return;
    }
    
    setShowLevelUpDice(true);
  };
  
  const handleLevelUp = () => {
    if (!character) {
      toast({
        title: "Ошибка",
        description: "Персонаж не выбран",
        variant: "destructive"
      });
      return;
    }
    
    const currentLevel = character.level || 1;
    if (currentLevel >= 20) {
      toast({
        title: "Максимальный уровень",
        description: "Невозможно превысить 20 уровень",
        variant: "destructive"
      });
      return;
    }
    
    setIsLevelingUp(true);
    
    // Имитируем процесс повышения уровня
    setTimeout(() => {
      const newLevel = currentLevel + 1;
      
      // Рассчитываем новые максимальные хиты по полной формуле
      const conModifier = character.abilities?.CON 
        ? Math.floor((character.abilities.CON - 10) / 2) 
        : 0;
        
      const hitDieValue = getHitDieValue(character.className || '');
      
      // Используем среднее значение кубика (половина максимума + 1)
      const hitPointIncrease = Math.floor(hitDieValue / 2) + 1 + conModifier;
      
      const newMaxHp = (character.maxHp || 0) + Math.max(1, hitPointIncrease);
      
      // Также увеличиваем текущее HP на величину прироста
      const newCurrentHp = Math.min(newMaxHp, (character.currentHp || 0) + hitPointIncrease);
      
      // Обновляем персонажа с новым уровнем и здоровьем
      const updates: any = {
        level: newLevel,
        maxHp: newMaxHp,
        currentHp: newCurrentHp
      };
      
      updateCharacter(updates);
      
      toast({
        title: `Уровень повышен до ${newLevel}!`,
        description: `Максимальное HP увеличено до ${newMaxHp}. Текущее HP: ${newCurrentHp}.`,
      });
      
      setIsLevelingUp(false);
    }, 1000);
  };
  
  const handleLevelDown = () => {
    if (!character) {
      toast({
        title: "Ошибка",
        description: "Персонаж не выбран",
        variant: "destructive"
      });
      return;
    }
    
    const currentLevel = character.level || 1;
    if (currentLevel <= 1) {
      toast({
        title: "Минимальный уровень",
        description: "Невозможно опуститься ниже 1 уровня",
        variant: "destructive"
      });
      return;
    }
    
    setIsLevelingDown(true);
    
    // Имитируем процесс понижения уровня
    setTimeout(() => {
      const newLevel = currentLevel - 1;
      
      // Упрощенный расчет снижения максимальных хитов
      const conModifier = character.abilities?.CON 
        ? Math.floor((character.abilities.CON - 10) / 2) 
        : 0;
        
      const hitDieValue = getHitDieValue(character.className || '');
      
      // Используем среднее значение кубика
      const hitPointDecrease = Math.floor(hitDieValue / 2) + 1 + conModifier;
      
      const newMaxHp = Math.max(1, (character.maxHp || 0) - Math.max(1, hitPointDecrease));
      const newCurrentHp = Math.min(character.currentHp || 0, newMaxHp);
      
      // Обновляем персонажа с новым уровнем и здоровьем
      const updates: any = {
        level: newLevel,
        maxHp: newMaxHp,
        currentHp: newCurrentHp
      };
      
      updateCharacter(updates);
      
      toast({
        title: `Уровень понижен до ${newLevel}`,
        description: `Максимальное HP уменьшено до ${newMaxHp}. Текущее HP: ${newCurrentHp}.`,
      });
      
      setIsLevelingDown(false);
    }, 1000);
  };
  
  // Обработчик броска кубика для повышения уровня
  const handleLevelUpDiceRoll = (result: number) => {
    if (!character) return;
    
    const currentLevel = character.level || 1;
    const newLevel = currentLevel + 1;
    
    // Получаем бонус от Телосложения
    const conModifier = character.abilities?.CON 
      ? Math.floor((character.abilities.CON - 10) / 2) 
      : 0;
    
    // Прибавляем результат броска и модификатор Телосложения
    const hitPointIncrease = result + conModifier;
    
    // Рассчитываем новые значения HP
    const newMaxHp = (character.maxHp || 0) + Math.max(1, hitPointIncrease);
    const newCurrentHp = Math.min(newMaxHp, (character.currentHp || 0) + hitPointIncrease);
    
    // Обновляем персонажа
    updateCharacter({
      level: newLevel,
      maxHp: newMaxHp,
      currentHp: newCurrentHp
    });
    
    toast({
      title: `Уровень повышен до ${newLevel}!`,
      description: `Результат броска: ${result}. С учетом CON: +${hitPointIncrease} HP.`,
    });
    
    setShowLevelUpDice(false);
  };
  
  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
      <div className="flex items-center gap-2 mb-4">
        <Crown className="h-5 w-5 text-primary" />
        <h3 
          className="text-lg font-semibold"
          style={{ color: currentTheme.textColor }}
        >
          Уровень персонажа: {character?.level || 1}
        </h3>
      </div>
      
      <div className="space-y-3">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            onClick={isLevelingUp ? undefined : handleLevelUpWithDice}
            disabled={isLevelingUp || isLevelingDown}
            className="w-full flex items-center justify-center gap-1 group"
            style={{
              backgroundColor: currentTheme.accent,
              color: currentTheme.buttonText
            }}
          >
            <ArrowUp className="h-4 w-4 transition-transform group-hover:translate-y-[-2px]" />
            <span>Повысить уровень с броском</span>
            <Dices className="h-4 w-4 ml-1" />
          </Button>
        </motion.div>
        
        <div className="grid grid-cols-2 gap-2">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={isLevelingUp ? undefined : handleLevelUp}
              disabled={isLevelingUp || isLevelingDown}
              className={`w-full flex items-center justify-center gap-1 ${isLevelingUp ? 'animate-pulse' : ''} group`}
              style={{
                backgroundColor: currentTheme.accent,
                color: currentTheme.buttonText
              }}
            >
              <ArrowUp className="h-4 w-4 transition-transform group-hover:translate-y-[-2px]" />
              {isLevelingUp ? "Повышение..." : "Повысить уровень"}
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={isLevelingDown ? undefined : handleLevelDown}
              disabled={isLevelingUp || isLevelingDown}
              variant="outline" 
              className={`w-full flex items-center justify-center gap-1 ${isLevelingDown ? 'animate-pulse' : ''} group`}
              style={{
                borderColor: currentTheme.accent,
                color: currentTheme.textColor
              }}
            >
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-[2px]" />
              {isLevelingDown ? "Понижение..." : "Понизить уровень"}
            </Button>
          </motion.div>
        </div>
      </div>
      
      <Sheet open={showLevelUpDice} onOpenChange={setShowLevelUpDice}>
        <SheetContent side="right" className="w-[90%] sm:max-w-md p-0">
          <SheetHeader className="p-4">
            <SheetTitle>Повышение уровня</SheetTitle>
            <SheetDescription>
              Бросьте кубик хитов {getHitDieByClass(character?.className || '')} для определения 
              прироста здоровья при повышении уровня
            </SheetDescription>
          </SheetHeader>
          <div className="h-[80vh]">
            <DiceRoller3DFixed
              initialDice={getHitDieByClass(character?.className || '')}
              hideControls={false}
              modifier={character?.abilities ? Math.floor((character.abilities.CON - 10) / 2) : 0}
              onRollComplete={handleLevelUpDiceRoll}
              themeColor={currentTheme.accent}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Card>
  );
};

export default LevelUpPanel;
