import { useState, useCallback } from 'react';
import { useCharacter } from '@/contexts/CharacterContext';
import { calculateAvailableSpellsByClassAndLevel } from '@/utils/spellUtils';

const useLevelUp = () => {
  const { character, setCharacter } = useCharacter();
  const [isLevelingUp, setIsLevelingUp] = useState(false);

  const handleLevelUp = async () => {
    setIsLevelingUp(true);
    if (!character) return;

    const newLevel = character.level + 1;

    // Проверяем, не превышает ли новый уровень максимальный уровень (20)
    if (newLevel > 20) {
      setIsLevelingUp(false);
      alert("Вы достигли максимального уровня!");
      return;
    }

    // Обновляем доступные заклинания
    if (character.class) {
      const spellsInfo = calculateAvailableSpellsByClassAndLevel(character.class, newLevel);
      console.log('Новые данные о заклинаниях:', spellsInfo);
      
      // Обновляем информацию о заклинаниях
      if (spellsInfo.cantripsCount !== character.cantripsKnown || 
          spellsInfo.knownSpells !== character.spellsKnown) {
        setCharacter(prev => ({
          ...prev,
          cantripsKnown: spellsInfo.cantripsCount,
          spellsKnown: spellsInfo.knownSpells,
          maxSpellLevel: spellsInfo.maxLevel
        }));
      }
    }

    // Обновляем уровень персонажа
    setCharacter(prev => ({
      ...prev,
      level: newLevel
    }));

    setIsLevelingUp(false);
  };

  return { handleLevelUp, isLevelingUp };
};

export default useLevelUp;
