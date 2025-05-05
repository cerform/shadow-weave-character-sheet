
import { useState, useCallback } from 'react';
import { useCharacter } from '@/contexts/CharacterContext';
import { calculateAvailableSpellsByClassAndLevel } from '@/utils/spellUtils';
import { Character } from '@/types/character';
import { useToast } from '@/hooks/use-toast';

const useLevelUp = () => {
  const { character, setCharacter, updateCharacter, saveCurrentCharacter } = useCharacter();
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const { toast } = useToast();

  const handleLevelUp = async () => {
    setIsLevelingUp(true);
    if (!character) {
      setIsLevelingUp(false);
      return;
    }

    const newLevel = character.level + 1;

    // Проверяем, не превышает ли новый уровень максимальный уровень (20)
    if (newLevel > 20) {
      setIsLevelingUp(false);
      toast({
        title: "Максимальный уровень",
        description: "Вы достигли максимального уровня!",
        variant: "destructive"
      });
      return;
    }

    try {
      // Обновляем данные о заклинаниях для магических классов
      if (character.class) {
        const spellsInfo = calculateAvailableSpellsByClassAndLevel(character.class, newLevel);
        console.log('Новые данные о заклинаниях:', spellsInfo);
        
        // Обновляем персонажа с новыми данными о заклинаниях и уровнем
        updateCharacter({
          level: newLevel,
          cantripsKnown: spellsInfo.cantripsCount,
          spellsKnown: spellsInfo.knownSpells,
          maxSpellLevel: spellsInfo.maxLevel
        });
        
        // Сохраняем обновленного персонажа
        await saveCurrentCharacter();
        
        toast({
          title: "Уровень повышен!",
          description: `Персонаж достиг ${newLevel} уровня.`,
        });
      } else {
        // Для не-магических классов просто обновляем уровень
        updateCharacter({ level: newLevel });
        await saveCurrentCharacter();
        
        toast({
          title: "Уровень повышен!",
          description: `Персонаж достиг ${newLevel} уровня.`,
        });
      }
    } catch (error) {
      console.error("Ошибка при повышении уровня:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось повысить уровень персонажа.",
        variant: "destructive"
      });
    } finally {
      setIsLevelingUp(false);
    }
  };

  return { handleLevelUp, isLevelingUp };
};

export default useLevelUp;
