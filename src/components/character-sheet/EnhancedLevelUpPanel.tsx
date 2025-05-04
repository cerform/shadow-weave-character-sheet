
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowUp, Sparkles } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useCharacterProgression } from '@/hooks/useCharacterProgression';
import { CharacterContext } from '@/contexts/CharacterContext';

export const EnhancedLevelUpPanel: React.FC = () => {
  const { character, updateCharacter } = React.useContext(CharacterContext);
  const { toast } = useToast();
  const [isLeveling, setIsLeveling] = useState(false);
  
  // Используем хук для логики повышения уровня
  const { startLevelUp } = useCharacterProgression({
    character,
    updateCharacter,
    onMaxHpChange: (newMaxHp, hpChange) => {
      toast({
        title: "Уровень повышен!",
        description: `Максимум HP увеличен на ${hpChange}. Новое значение: ${newMaxHp}`,
      });
    }
  });
  
  // Расчет прогресса опыта (упрощенная реализация)
  const calculateXpProgress = () => {
    const level = character?.level || 1;
    // Используем безопасное получение xp с проверкой на undefined
    const characterXp = character?.xp !== undefined ? character.xp : 0;
    
    // Упрощенная таблица опыта
    const xpThresholds = [
      0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 
      64000, 85000, 100000, 120000, 140000, 165000, 
      195000, 225000, 265000, 305000, 355000
    ];
    
    if (level >= 20) return 100; // Максимальный уровень
    
    const currentLevelXP = xpThresholds[level - 1];
    const nextLevelXP = xpThresholds[level];
    const xpForNextLevel = nextLevelXP - currentLevelXP;
    const xpProgress = characterXp - currentLevelXP;
    
    return Math.min(100, Math.max(0, (xpProgress / xpForNextLevel) * 100));
  };
  
  const handleLevelUp = () => {
    if (isLeveling) return;
    
    const level = character?.level || 1;
    
    if (level >= 20) {
      toast({
        title: "Максимальный уровень",
        description: "Ваш персонаж уже достиг максимального уровня 20",
        variant: "destructive",
      });
      return;
    }
    
    setIsLeveling(true);
    
    // Имитация процесса повышения уровня
    setTimeout(() => {
      startLevelUp();
      setIsLeveling(false);
    }, 1000);
  };
  
  return (
    <Card className="p-4 bg-card/30 backdrop-blur-sm border-primary/20">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Уровень {character?.level || 1}</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleLevelUp}
          disabled={isLeveling || (character?.level || 1) >= 20}
          className={`${isLeveling ? 'animate-pulse' : ''}`}
        >
          <ArrowUp className="h-4 w-4 mr-1" />
          Повысить
        </Button>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex justify-between mb-1 text-sm">
            <span>Опыт: {character?.xp !== undefined ? character.xp : 0} XP</span>
            <span>Прогресс к уровню {Math.min(20, (character?.level || 1) + 1)}</span>
          </div>
          <Progress value={calculateXpProgress()} className="h-2" />
        </div>
        
        <div className="text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Бонус мастерства:</span>
            <span>+{Math.ceil(1 + ((character?.level || 1) / 4))}</span>
          </div>
          
          {character?.class && ['Волшебник', 'Жрец', 'Друид', 'Бард', 'Колдун', 'Чернокнижник', 'Чародей'].includes(character.class) && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground flex items-center">
                <Sparkles className="h-3 w-3 mr-1" /> 
                Заклинания:
              </span>
              <span>
                {/* Упрощенная логика для слотов заклинаний */}
                {character?.level >= 3 ? '1ур: 4, 2ур: 2' : '1ур: 2'}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default EnhancedLevelUpPanel;
