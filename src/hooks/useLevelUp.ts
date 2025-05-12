
import { useState, useCallback } from 'react';
import { useCharacter } from '@/contexts/CharacterContext';
import { calculateAvailableSpellsByClassAndLevel } from '@/utils/spellUtils';
import { Character } from '@/types/character';
import { useToast } from '@/hooks/use-toast';

const useLevelUp = () => {
  const { character, setCharacter, updateCharacter, saveCurrentCharacter } = useCharacter();
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const { toast } = useToast();

  // Fix the spellcasting initialization to include all required properties
  const initializeSpellcasting = (ability: string, level: number, abilityModifier: number) => {
    return {
      ability: ability,
      saveDC: 8 + 2 + abilityModifier, // 8 + proficiency bonus + ability modifier
      attackBonus: 2 + abilityModifier, // proficiency bonus + ability modifier
      preparedSpellsLimit: level + abilityModifier
    };
  };

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
        
        // Получаем информацию о способности заклинаний для класса
        const getSpellcastingAbility = (characterClass: string) => {
          const classLower = characterClass.toLowerCase();
          if (['жрец', 'друид', 'cleric', 'druid'].includes(classLower)) {
            return 'wisdom';
          } else if (['волшебник', 'wizard'].includes(classLower)) {
            return 'intelligence';
          } else {
            // барды, колдуны, чародеи, паладины
            return 'charisma';
          }
        };
        
        // Вычисляем модификатор способности
        const getAbilityModifier = (character: Character, ability: string) => {
          const abilityValue = character[ability as keyof Character] || 10;
          return Math.floor((Number(abilityValue) - 10) / 2);
        };
        
        // Получаем нужную способность и модификатор
        const spellcastingAbility = getSpellcastingAbility(character.class);
        const abilityModifier = getAbilityModifier(character, spellcastingAbility);
        
        // Создаем или обновляем spellcasting объект
        const currentSpellcasting = character.spellcasting || {};
        
        // Если spellcasting еще не инициализирован полностью, создаем его заново
        const updatedSpellcasting = currentSpellcasting.ability 
          ? {
              ...currentSpellcasting,
              preparedSpellsLimit: spellsInfo.knownSpells || (newLevel + abilityModifier)
            }
          : initializeSpellcasting(spellcastingAbility, newLevel, abilityModifier);
        
        // Обновляем персонажа с новыми данными о заклинаниях и уровнем
        updateCharacter({
          level: newLevel,
          spellcasting: updatedSpellcasting
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
