
import React, { useContext } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from '@/hooks/use-toast';
import { CharacterContext } from '@/contexts/CharacterContext';
import { Crown, ArrowUp, ArrowDown } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

const LevelUpPanel = () => {
  const { character, updateCharacter } = useContext(CharacterContext);
  const { toast } = useToast();
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
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
    
    const newLevel = currentLevel + 1;
    
    // Рассчитываем новые максимальные хиты по полной формуле
    const conModifier = character.abilities?.CON 
      ? Math.floor((character.abilities.CON - 10) / 2) 
      : 0;
      
    const hitDieValue = getHitDieValue(character.className || '');
    // При повышении уровня используем полное значение кубика, а не среднее
    const hitPointIncrease = hitDieValue + conModifier;
    
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
    
    const newLevel = currentLevel - 1;
    
    // Упрощенный расчет снижения максимальных хитов
    const conModifier = character.abilities?.CON 
      ? Math.floor((character.abilities.CON - 10) / 2) 
      : 0;
      
    const hitDieValue = getHitDieValue(character.className || '');
    const hitPointDecrease = hitDieValue + conModifier;
    
    const newMaxHp = Math.max(1, (character.maxHp || 0) - Math.max(1, hitPointDecrease));
    const newCurrentHp = Math.min(character.currentHp || 0, newMaxHp); // Текущее HP не должно превышать новый максимум
    
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
  };
  
  // Получаем максимальный размер кубика хитов для класса
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
      
      <div className="grid grid-cols-2 gap-2">
        <Button 
          onClick={handleLevelUp} 
          className="w-full flex items-center justify-center gap-1"
          style={{
            backgroundColor: currentTheme.accent,
            color: currentTheme.buttonText
          }}
        >
          <ArrowUp className="h-4 w-4" />
          повысить
        </Button>
        
        <Button 
          onClick={handleLevelDown} 
          variant="outline" 
          className="w-full flex items-center justify-center gap-1"
          style={{
            borderColor: currentTheme.accent,
            color: currentTheme.textColor
          }}
        >
          <ArrowDown className="h-4 w-4" />
          понизить
        </Button>
      </div>
    </Card>
  );
};

export default LevelUpPanel;
