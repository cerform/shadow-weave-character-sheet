
import React, { useContext } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CharacterContext } from '@/contexts/CharacterContext';
import { Crown, ArrowUp, ArrowDown, Dices } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { motion } from 'framer-motion';
import { DiceRoller3DFixed } from '@/components/character-sheet/DiceRoller3DFixed';
import SpellSelectionModal from './SpellSelectionModal';
import { useCharacterProgression } from '@/hooks/useCharacterProgression';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";

export const EnhancedLevelUpPanel: React.FC = () => {
  const { character, updateCharacter } = useContext(CharacterContext);
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Инициализируем систему прогрессии персонажа
  const {
    isLevelingUp,
    showSpellSelection,
    availableSpells,
    selectedSpells,
    setSelectedSpells,
    rollMode,
    setRollMode,
    startLevelUp,
    handleLevelDown,
    handleDiceRoll,
    handleSpellSelection,
    getNewSpellsCountOnLevelUp,
    getNewCantripsCountOnLevelUp,
    getHitDieType
  } = useCharacterProgression({
    character,
    updateCharacter,
    onMaxHpChange: (newMaxHp, hpChange) => {
      // Этот колбэк может быть использован для синхронизации с другими системами
      console.log(`Макс. HP изменено: ${newMaxHp} (${hpChange > 0 ? '+' : ''}${hpChange})`);
    }
  });
  
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
            onClick={() => {
              setRollMode("roll");
              startLevelUp();
            }}
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
              onClick={() => {
                setRollMode("average");
                startLevelUp();
              }}
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
              Бросьте кубик хитов {getHitDieType()} для определения 
              прироста здоровья при повышении уровня
            </SheetDescription>
          </SheetHeader>
          <div className="h-[80vh]">
            <DiceRoller3DFixed
              initialDice={getHitDieType()}
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

export default EnhancedLevelUpPanel;
