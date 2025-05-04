
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CharacterSheet } from '@/types/character';
import { calculateMaxHitPoints, getNumericModifier } from '@/utils/characterUtils';

export interface UseCharacterProgressionProps {
  character: any;
  updateCharacter: (updates: any) => void;
  onMaxHpChange?: (newMaxHp: number, hpChange: number) => void;
}

export function useCharacterProgression({
  character,
  updateCharacter,
  onMaxHpChange
}: UseCharacterProgressionProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const startLevelUp = async () => {
    if (isProcessing) return;
    if (!character) {
      toast({
        title: "Ошибка",
        description: "Персонаж не найден",
        variant: "destructive",
      });
      return;
    }

    const currentLevel = character.level || 1;
    if (currentLevel >= 20) {
      toast({
        title: "Максимальный уровень",
        description: "Персонаж уже на максимальном уровне",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    try {
      // Вычисляем новые значения HP
      const constitutionModifier = getNumericModifier(character.abilities?.constitution || 10);
      const currentMaxHp = character.maxHp || 0;
      
      // Вычисляем среднее значение по кубику хитов для класса
      const newLevel = currentLevel + 1;
      const newMaxHp = calculateMaxHitPoints(
        newLevel,
        character.class,
        constitutionModifier
      );
      
      const hpIncrease = newMaxHp - currentMaxHp;

      // Обновляем персонажа
      const updates: Partial<CharacterSheet> = {
        level: newLevel,
        maxHp: newMaxHp,
        currentHp: Math.min(character.currentHp + hpIncrease, newMaxHp)
      };

      updateCharacter(updates);

      // Вызываем callback для обновления HP, если он предоставлен
      if (onMaxHpChange) {
        onMaxHpChange(newMaxHp, hpIncrease);
      }

      toast({
        title: "Уровень повышен!",
        description: `Персонаж достиг ${newLevel} уровня.`,
      });
    } catch (error) {
      console.error("Ошибка при повышении уровня:", error);
      toast({
        title: "Ошибка повышения уровня",
        description: "Произошла ошибка при повышении уровня",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    startLevelUp,
    isProcessing
  };
}

export default useCharacterProgression;
