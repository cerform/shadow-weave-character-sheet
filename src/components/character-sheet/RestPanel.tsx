
import React, { useState, useContext } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { CharacterContext } from '@/contexts/CharacterContext';
import { Clock, Bed, Hourglass } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import { DiceRoller3DFixed } from '@/components/character-sheet/DiceRoller3DFixed';

interface RestPanelProps {
  compact?: boolean;
}

export const RestPanel = ({ compact = false }: RestPanelProps) => {
  const { character, updateCharacter } = useContext(CharacterContext);
  const { toast } = useToast();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const [isShortResting, setIsShortResting] = useState(false);
  const [isLongResting, setIsLongResting] = useState(false);
  const [showDiceRoller, setShowDiceRoller] = useState(false);

  // Получаем числовое значение кубика хитов для класса
  const getHitDieValue = (className: string): number => {
    const hitDiceValues: Record<string, number> = {
      "Варвар": 12, "Воин": 10, "Паладин": 10, "Следопыт": 10,
      "Монах": 8, "Плут": 8, "Бард": 8, "Жрец": 8,
      "Друид": 8, "Волшебник": 6, "Чародей": 6,
      "Колдун": 8, "Чернокнижник": 8
    };
    
    return hitDiceValues[className] || 8;
  };

  // Получаем тип кубика хитов для DiceRoller
  const getHitDieByClass = (characterClass: string): "d4" | "d6" | "d8" | "d10" | "d12" => {
    const hitDice: Record<string, "d4" | "d6" | "d8" | "d10" | "d12"> = {
      "Варвар": "d12", "Воин": "d10", "Паладин": "d10", "Следопыт": "d10",
      "Жрец": "d8", "Друид": "d8", "Монах": "d8", "Плут": "d8",
      "Бард": "d8", "Колдун": "d8", "Чернокнижник": "d8",
      "Волшебник": "d6", "Чародей": "d6"
    };
    
    return hitDice[characterClass] || "d8";
  };

  const handleShortRest = () => {
    if (!character) {
      toast({
        title: "Ошибка",
        description: "Персонаж не выбран",
        variant: "destructive"
      });
      return;
    }

    setIsShortResting(true);
    
    // Имитируем загрузку короткого отдыха
    setTimeout(() => {
      // Определяем модификатор телосложения
      const conModifier = character.abilities?.CON 
        ? Math.floor((character.abilities.CON - 10) / 2) 
        : 0;
      
      // При коротком отдыхе игрок может потратить Hit Die для восстановления здоровья
      const hitDieValue = getHitDieValue(character.className || '');
      
      // Вычисляем восстановление HP (среднее значение кубика + модификатор телосложения)
      const hpRecovery = Math.max(1, Math.floor(hitDieValue / 2) + conModifier);
      
      // Обновляем HP (не превышая максимум)
      const newCurrentHp = Math.min(
        character.maxHp || 0, 
        (character.currentHp || 0) + hpRecovery
      );
      
      // Обновляем персонажа
      updateCharacter({
        currentHp: newCurrentHp
      });

      // Уведомляем игрока
      toast({
        title: "Короткий отдых завершен",
        description: `Восстановлено ${hpRecovery} HP`,
      });
      
      setIsShortResting(false);
    }, 1500);
  };

  const handleLongRest = () => {
    if (!character) {
      toast({
        title: "Ошибка",
        description: "Персонаж не выбран",
        variant: "destructive"
      });
      return;
    }

    setIsLongResting(true);
    
    // Имитируем загрузку длинного отдыха
    setTimeout(() => {
      // При длинном отдыхе восстанавливаем все здоровье
      const fullHp = character.maxHp || 0;
      
      // Восстанавливаем все ячейки заклинаний, если они есть
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
      }
      
      // Восстанавливаем очки чародея, если персонаж - Чародей
      let sorceryPoints = character.sorceryPoints || { current: 0, max: 0 };
      if (character.className?.toLowerCase().includes('чародей')) {
        sorceryPoints = {
          current: character.level || 0,
          max: character.level || 0
        };
      }
      
      // Обновляем персонажа
      updateCharacter({
        currentHp: fullHp,
        temporaryHp: 0, // Сбрасываем временное здоровье
        spellSlots: updatedSpellSlots,
        sorceryPoints: sorceryPoints
      });
      
      // Уведомляем игрока
      toast({
        title: "Длинный отдых завершен",
        description: `Здоровье и ячейки заклинаний восстановлены.`,
      });
      
      setIsLongResting(false);
    }, 2000);
  };

  // Обработчик результата броска кубика для восстановления HP
  const handleHitDieRollComplete = (result: number) => {
    if (!character) return;
    
    const conModifier = character.abilities?.CON 
      ? Math.floor((character.abilities.CON - 10) / 2) 
      : 0;
    
    const healingAmount = result + conModifier;
    
    // Обновляем HP (не превышая максимум)
    const newCurrentHp = Math.min(
      character.maxHp || 0, 
      (character.currentHp || 0) + healingAmount
    );
    
    // Обновляем персонажа
    updateCharacter({
      currentHp: newCurrentHp
    });
    
    toast({
      title: "Hit Die использован",
      description: `Восстановлено ${healingAmount} HP (${result} + ${conModifier} от CON)`,
    });
    
    setShowDiceRoller(false);
  };

  if (compact) {
    return (
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
            <Hourglass className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Clock className="h-4 w-4 mr-1" />
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
            <Hourglass className="h-4 w-4 mr-1 animate-spin" />
          ) : (
            <Bed className="h-4 w-4 mr-1" />
          )}
          Длинный отдых
        </Button>
        
        <Sheet open={showDiceRoller} onOpenChange={setShowDiceRoller}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="w-full flex items-center justify-center"
              style={{ color: currentTheme.accent }}
            >
              Использовать Hit Die
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[90%] sm:max-w-md p-0">
            <SheetHeader className="p-4">
              <SheetTitle>Hit Die</SheetTitle>
              <SheetDescription>
                Бросьте кубик для восстановления здоровья
              </SheetDescription>
            </SheetHeader>
            <div className="h-[80vh]">
              <DiceRoller3DFixed
                initialDice={getHitDieByClass(character?.className || '')}
                hideControls={false}
                modifier={character?.abilities ? Math.floor((character.abilities.CON - 10) / 2) : 0}
                onRollComplete={handleHitDieRollComplete}
                themeColor={currentTheme.accent}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
      <h3 className="text-lg font-semibold mb-4" 
          style={{ color: currentTheme.textColor }}>
        Отдых
      </h3>
      
      <div className="space-y-4">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
            <h4 className="text-sm font-medium mb-2" 
                style={{ color: currentTheme.textColor || '#FFFFFF' }}>
              Короткий отдых (1 час)
            </h4>
            <p className="text-sm mb-3"
               style={{ color: currentTheme.mutedTextColor || '#DDDDDD' }}>
              Восстанавливает часть здоровья и позволяет использовать Hit Dice.
            </p>
            <Button 
              variant="outline" 
              className={`w-full ${isShortResting ? 'animate-pulse' : ''}`}
              onClick={isShortResting ? undefined : handleShortRest}
              disabled={isShortResting || isLongResting}
              style={{
                color: currentTheme.buttonText || '#FFFFFF',
                borderColor: currentTheme.accent
              }}
            >
              {isShortResting ? (
                <Hourglass className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Clock className="mr-2 h-4 w-4" />
              )}
              Короткий отдых
            </Button>
          </div>
        </motion.div>
        
        <motion.div 
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <div className="bg-black/30 rounded-lg p-4 border border-gray-800">
            <h4 className="text-sm font-medium mb-2"
                style={{ color: currentTheme.textColor || '#FFFFFF' }}>
              Длинный отдых (8 часов)
            </h4>
            <p className="text-sm mb-3"
               style={{ color: currentTheme.mutedTextColor || '#DDDDDD' }}>
              Полностью восстанавливает здоровье и ячейки заклинаний.
            </p>
            <Button 
              className={`w-full ${isLongResting ? 'animate-pulse' : ''}`}
              onClick={isLongResting ? undefined : handleLongRest}
              disabled={isShortResting || isLongResting}
              style={{
                color: currentTheme.buttonText || '#FFFFFF',
                backgroundColor: isLongResting ? `${currentTheme.accent}80` : currentTheme.accent
              }}
            >
              {isLongResting ? (
                <Hourglass className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Bed className="mr-2 h-4 w-4" />
              )}
              Длинный отдых
            </Button>
          </div>
        </motion.div>
      </div>
      
      <div className="mt-4">
        <Sheet open={showDiceRoller} onOpenChange={setShowDiceRoller}>
          <SheetTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full"
              style={{ color: currentTheme.accent }}
            >
              Использовать Hit Die
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[90%] sm:max-w-md p-0">
            <SheetHeader className="p-4">
              <SheetTitle>Hit Die</SheetTitle>
              <SheetDescription>
                Бросьте кубик для восстановления здоровья
              </SheetDescription>
            </SheetHeader>
            <div className="h-[80vh]">
              <DiceRoller3DFixed
                initialDice={getHitDieByClass(character?.className || '')}
                hideControls={false}
                modifier={character?.abilities ? Math.floor((character.abilities.CON - 10) / 2) : 0}
                onRollComplete={handleHitDieRollComplete}
                themeColor={currentTheme.accent}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </Card>
  );
};
