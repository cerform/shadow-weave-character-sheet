
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { ArrowUp, Award } from "lucide-react";
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { CharacterContext } from '@/contexts/CharacterContext';
import { useContext } from 'react';

export function EnhancedLevelUpPanel() {
  const { character, updateCharacter } = useContext(CharacterContext);
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  const { toast } = useToast();
  
  // Состояние для отображения анимации
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  
  // Таблица опыта для уровней
  const xpTable: Record<number, number> = {
    1: 0,
    2: 300,
    3: 900,
    4: 2700,
    5: 6500,
    6: 14000,
    7: 23000,
    8: 34000,
    9: 48000,
    10: 64000,
    11: 85000,
    12: 100000,
    13: 120000,
    14: 140000,
    15: 165000,
    16: 195000,
    17: 225000,
    18: 265000,
    19: 305000,
    20: 355000
  };
  
  // Текущий уровень и опыт персонажа
  const currentLevel = character?.level || 1;
  const currentXP = character?.xp || 0;
  
  // Вычисляем следующий уровень и требуемый опыт
  const nextLevel = currentLevel < 20 ? currentLevel + 1 : 20;
  const xpForNextLevel = xpTable[nextLevel];
  const xpForCurrentLevel = xpTable[currentLevel];
  
  // Вычисляем прогресс к следующему уровню
  let levelProgress = 0;
  if (currentLevel < 20) {
    levelProgress = Math.floor(
      ((currentXP - xpForCurrentLevel) / (xpForNextLevel - xpForCurrentLevel)) * 100
    );
  } else {
    levelProgress = 100; // На 20 уровне прогресс всегда 100%
  }
  
  // Обработчик нажатия кнопки повышения уровня
  const handleLevelUp = () => {
    if (currentLevel >= 20 || currentXP < xpForNextLevel) {
      return;
    }
    
    setIsLevelingUp(true);
    
    // Имитация обработки повышения уровня
    setTimeout(() => {
      // Обновляем уровень персонажа
      updateCharacter({
        level: nextLevel
      });
      
      // Отображаем уведомление о повышении уровня
      toast({
        title: "Поздравляем!",
        description: `Ваш персонаж достиг ${nextLevel} уровня.`,
      });
      
      setIsLevelingUp(false);
    }, 1500);
  };
  
  // Функция для добавления опыта (для тестирования)
  const addExperience = (amount: number) => {
    if (!character) return;
    
    const newXP = (character.xp || 0) + amount;
    updateCharacter({ xp: newXP } as any);
    
    toast({
      title: "Опыт получен",
      description: `+${amount} XP`
    });
  };

  return (
    <Card className="bg-card/30 backdrop-blur-sm border-primary/20">
      <CardContent className="p-4">
        <h3 className="flex items-center text-lg font-semibold mb-3" style={{ color: currentTheme.textColor }}>
          <Award className="mr-2 h-5 w-5" style={{ color: currentTheme.accent }} /> 
          Прогресс персонажа
        </h3>
        
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm">Уровень {currentLevel}</span>
          <span className="text-sm">{currentXP} / {xpForNextLevel} XP</span>
        </div>
        
        <Progress value={levelProgress} className="h-2 mb-4" />
        
        <div className="flex justify-between items-center gap-2">
          <Button 
            variant="outline" 
            className="flex-1 h-9"
            onClick={() => addExperience(100)}
          >
            +100 XP
          </Button>
          
          <Button 
            onClick={handleLevelUp}
            disabled={currentLevel >= 20 || currentXP < xpForNextLevel || isLevelingUp}
            className="flex items-center gap-1 flex-1 h-9"
            style={{
              background: currentTheme.accent,
              opacity: currentLevel >= 20 || currentXP < xpForNextLevel ? 0.5 : 1
            }}
          >
            <ArrowUp className="h-4 w-4" />
            {isLevelingUp ? "Повышение..." : "Повысить уровень"}
          </Button>
        </div>
        
        {currentLevel >= 20 && (
          <div className="mt-2 text-xs text-center text-muted-foreground">
            Достигнут максимальный уровень
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default EnhancedLevelUpPanel;
