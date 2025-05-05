
import React, { useContext } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CharacterContext } from '@/contexts/CharacterContext';
import { Crown, ArrowUp, ArrowDown } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const LevelUpPanel = () => {
  const { character, updateCharacter, saveCurrentCharacter } = useContext(CharacterContext);
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  const { toast } = useToast();
  
  // Функция для получения значения кубика хитов
  const getHitDieValue = () => {
    const characterClass = character?.className || character?.class || '';
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
    
    return hitDiceValues[characterClass] || 8; // По умолчанию d8
  };
  
  // Функция для повышения уровня
  const handleLevelUp = async () => {
    if (!character) return;
    
    const currentLevel = character.level || 1;
    if (currentLevel >= 20) {
      toast({
        title: "Максимальный уровень",
        description: "Нельзя превысить 20 уровень",
        variant: "destructive"
      });
      return;
    }
    
    // Рассчитываем бонус от Телосложения
    const conModifier = character.abilities?.CON 
      ? Math.floor((character.abilities.CON - 10) / 2) 
      : 0;
    
    // Получаем значение кубика хитов для класса
    const hitDieValue = getHitDieValue();
    
    // Используем среднее значение кубика
    const hpIncrease = Math.floor(hitDieValue / 2) + 1 + conModifier;
    const hpGain = Math.max(1, hpIncrease); // Минимум 1 HP
    
    // Рассчитываем новые значения HP
    const newMaxHp = (character.maxHp || 0) + hpGain;
    const newCurrentHp = (character.currentHp || 0) + hpGain;
    
    // Обновляем персонажа
    updateCharacter({
      level: currentLevel + 1,
      maxHp: newMaxHp,
      currentHp: newCurrentHp
    });
    
    // Сохраняем изменения
    await saveCurrentCharacter();
    
    // Показываем уведомление
    toast({
      title: `Уровень повышен до ${currentLevel + 1}!`,
      description: `+${hpGain} HP`,
    });
  };
  
  // Функция для понижения уровня
  const handleLevelDown = async () => {
    if (!character) return;
    
    const currentLevel = character.level || 1;
    if (currentLevel <= 1) {
      toast({
        title: "Минимальный уровень",
        description: "Нельзя опуститься ниже 1 уровня",
        variant: "destructive"
      });
      return;
    }
    
    // Рассчитываем бонус от Телосложения
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
    
    // Сохраняем изменения
    await saveCurrentCharacter();
    
    toast({
      title: `Уровень понижен до ${currentLevel - 1}`,
      description: `-${hitPointDecrease} HP`,
    });
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
            onClick={handleLevelUp}
            disabled={(character?.level || 1) >= 20}
            className="w-full flex items-center justify-center gap-1 group"
            style={{
              backgroundColor: currentTheme.accent,
              color: currentTheme.buttonText
            }}
          >
            <ArrowUp className="h-4 w-4 transition-transform group-hover:translate-y-[-2px]" />
            <span>Повысить уровень</span>
          </Button>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            onClick={handleLevelDown}
            disabled={(character?.level || 1) <= 1}
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
    </Card>
  );
};

export default LevelUpPanel;
