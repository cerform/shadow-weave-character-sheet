import React, { useState, useEffect } from 'react';
import NavigationButtons from "./NavigationButtons";
import { CharacterSheet } from '@/types/character.d';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';
import { getNumericModifier } from '@/utils/characterUtils';
import { calculateMaxHitPoints } from '@/utils/characterUtils'; 
import HitPointsRoller from './HitPointsRoller';

interface CharacterHitPointsCalculatorProps {
  character: CharacterSheet;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  nextStep: () => void;
  prevStep: () => void;
}

const CharacterHitPointsCalculator: React.FC<CharacterHitPointsCalculatorProps> = ({
  character,
  updateCharacter,
  nextStep,
  prevStep
}) => {
  const { toast } = useToast();
  const { theme } = useTheme();
  const currentTheme = themes[theme as keyof typeof themes] || themes.default;
  
  // Получаем модификатор телосложения из характеристик персонажа
  const constitutionModifier = character.abilities && character.abilities.constitution
    ? getNumericModifier(character.abilities.constitution)
    : 0;
  
  // Сохраняем очки здоровья в состоянии
  const [hitPoints, setHitPoints] = useState<number | null>(character.maxHp || null);
  
  // При монтировании компонента предварительно рассчитываем HP, если его еще нет
  useEffect(() => {
    if (!hitPoints && character.class && character.level) {
      // Используем утилиту расчета HP
      const calculatedHp = calculateMaxHitPoints(
        character.class, 
        character.level, 
        character.abilities?.constitution || 10
      );
      
      setHitPoints(calculatedHp);
    }
  }, [character.class, character.level, character.abilities?.constitution, hitPoints]);
  
  // Обработчик для сохранения HP после броска или ручного ввода
  const handleSaveHitPoints = (hp: number) => {
    setHitPoints(hp);
    
    toast({
      title: "Очки здоровья обновлены",
      description: `У вашего персонажа теперь ${hp} максимальных очков здоровья.`
    });
  };
  
  // Обработчик для перехода к следующему шагу с сохранением HP
  const handleNextStep = () => {
    if (hitPoints) {
      updateCharacter({ 
        maxHp: hitPoints,
        currentHp: hitPoints // Текущие хиты равны максимальным при создании
      });
      nextStep();
    } else {
      toast({
        title: "Не удалось сохранить HP",
        description: "Пожалуйста, бросьте кубик хитов или введите значение вручную",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Расчет здоровья персонажа</h2>
      
      <div className="p-4 bg-primary/10 rounded-lg mb-4">
        <p className="text-sm">
          Очки здоровья (HP) определяют, сколько урона может выдержать ваш персонаж, прежде чем потерять
          сознание или умереть. На первом уровне ваш HP равен максимальному значению кубика хитов вашего класса + 
          модификатор Телосложения. При получении новых уровней вы добавляете результат броска кубика хитов + 
          модификатор Телосложения.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-primary/20 shadow-lg">
          <CardHeader className="bg-primary/5 border-b border-primary/10">
            <CardTitle className="flex justify-between">
              <span>Характеристики персонажа</span>
              <Badge variant="outline">{character.race} {character.class}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-primary/5 rounded-lg">
                <h3 className="text-sm font-medium mb-1">Уровень</h3>
                <p className="text-xl font-bold">{character.level}</p>
              </div>
              <div className="p-3 bg-primary/5 rounded-lg">
                <h3 className="text-sm font-medium mb-1">Телосложение</h3>
                <p className="text-xl font-bold">
                  {character.abilities?.constitution || 10} ({constitutionModifier >= 0 ? '+' : ''}{constitutionModifier})
                </p>
              </div>
            </div>
            
            <div className="p-4 bg-success/10 rounded-lg border border-success/30">
              <h3 className="text-sm font-medium text-success mb-2">Предварительный расчет HP:</h3>
              <p className="text-lg font-bold">{hitPoints || 'Не рассчитано'}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Бросьте кубик для более точного расчета или примите это значение
              </p>
            </div>
          </CardContent>
        </Card>
        
        <HitPointsRoller 
          characterClass={character.class}
          level={character.level}
          constitutionModifier={constitutionModifier}
          onHitPointsRolled={handleSaveHitPoints}
          initialHp={hitPoints || undefined}
        />
      </div>
      
      <NavigationButtons
        allowNext={!!hitPoints}
        nextStep={handleNextStep}
        prevStep={prevStep}
        isFirstStep={false}
        nextLabel="Сохранить и ��родолжить"
      />
    </div>
  );
};

export default CharacterHitPointsCalculator;
