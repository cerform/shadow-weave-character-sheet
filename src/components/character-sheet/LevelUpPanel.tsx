
import React, { useContext } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CharacterContext } from '@/contexts/CharacterContext';
import { Crown, ArrowUp, ArrowDown, Dices } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { motion } from 'framer-motion';
import { DiceRoller3DFixed } from '@/components/character-sheet/DiceRoller3DFixed';
import { useLevelUp } from '@/hooks/useLevelUp';
import SpellSelectionModal from './SpellSelectionModal';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";

const LevelUpPanel = () => {
  const { character, updateCharacter } = useContext(CharacterContext);
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const {
    isLevelingUp,
    showSpellSelection,
    availableSpells,
    selectedSpells,
    setSelectedSpells,
    rollMode,
    setRollMode,
    startLevelUp,
    handleDiceRoll,
    handleSpellSelection,
    getNewSpellsCountOnLevelUp,
    getNewCantripsCountOnLevelUp,
    getHitDieValue
  } = useLevelUp(character, updateCharacter);
  
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
    if (!character) return;
    
    const currentLevel = character.level || 1;
    if (currentLevel >= 20) return;
    
    setRollMode("roll");
    startLevelUp();
  };
  
  const handleLevelUpAverage = () => {
    if (!character) return;
    
    const currentLevel = character.level || 1;
    if (currentLevel >= 20) return;
    
    setRollMode("average");
    startLevelUp();
  };
  
  const handleLevelDown = () => {
    if (!character) return;
    
    const currentLevel = character.level || 1;
    if (currentLevel <= 1) return;
    
    // Упрощенный расчет снижения максимальных хитов
    const conModifier = character.abilities?.CON 
      ? Math.floor((character.abilities.CON - 10) / 2) 
      : 0;
      
    const hitDieValue = getHitDieValue();
    
    // Используем среднее значение кубика
    const hitPointDecrease = Math.floor(hitDieValue / 2) + 1 + conModifier;
    
    const newMaxHp = Math.max(1, (character.maxHp || 0) - Math.max(1, hitPointDecrease));
    const newCurrentHp = Math.min(character.currentHp || 0, newMaxHp);
    
    // Обновляем персонажа с новым уровнем и здоровьем
    updateCharacter({
      level: currentLevel - 1,
      maxHp: newMaxHp,
      currentHp: newCurrentHp
    });
  };
  
  const newSpellsCount = getNewSpellsCountOnLevelUp();
  const newCantripsCount = getNewCantripsCountOnLevelUp();
  
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
            onClick={handleLevelUpWithDice}
            disabled={isLevelingUp || (character?.level || 1) >= 20}
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
              onClick={handleLevelUpAverage}
              disabled={isLevelingUp || (character?.level || 1) >= 20}
              className="w-full flex items-center justify-center gap-1 group"
              style={{
                backgroundColor: currentTheme.accent,
                color: currentTheme.buttonText
              }}
            >
              <ArrowUp className="h-4 w-4 transition-transform group-hover:translate-y-[-2px]" />
              Среднее значение
            </Button>
          </motion.div>
          
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button 
              onClick={handleLevelDown}
              disabled={isLevelingUp || (character?.level || 1) <= 1}
              variant="outline" 
              className="w-full flex items-center justify-center gap-1 group"
              style={{
                borderColor: currentTheme.accent,
                color: currentTheme.textColor
              }}
            >
              <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-[2px]" />
              Понизить уровень
            </Button>
          </motion.div>
        </div>
      </div>
      
      {/* Модальное окно для броска кубика при повышении уровня */}
      <Sheet open={isLevelingUp} onOpenChange={(open) => !open && setSelectedSpells([])}>
        <SheetContent side="right" className="w-[90%] sm:max-w-md p-0">
          <SheetHeader className="p-4">
            <SheetTitle>Повышение уровня</SheetTitle>
            <SheetDescription>
              Бросьте кубик хитов {getHitDieByClass(character?.className || character?.class || '')} для определения 
              прироста здоровья при повышении уровня
            </SheetDescription>
          </SheetHeader>
          <div className="h-[80vh]">
            <DiceRoller3DFixed
              initialDice={getHitDieByClass(character?.className || character?.class || '')}
              hideControls={false}
              modifier={character?.abilities ? Math.floor((character.abilities.CON - 10) / 2) : 0}
              onRollComplete={handleDiceRoll}
              themeColor={currentTheme.accent}
            />
          </div>
        </SheetContent>
      </Sheet>
      
      {/* Модальное окно для выбора заклинаний */}
      <SpellSelectionModal
        open={showSpellSelection}
        onOpenChange={(open) => !open && setSelectedSpells([])}
        availableSpells={availableSpells}
        onConfirm={handleSpellSelection}
        maxSpellsCount={newSpellsCount}
        maxCantripsCount={newCantripsCount}
        characterClass={character?.className || character?.class}
        characterLevel={character?.level || 1}
      />
    </Card>
  );
};

export default LevelUpPanel;
