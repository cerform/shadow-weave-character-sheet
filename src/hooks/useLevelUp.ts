
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
        description: "Вы достигли максимального уровня персонажа (20)",
      });
      return;
    }

    // Обновляем уровень персонажа
    const updates: Partial<Character> = {
      level: newLevel
    };

    // Если персонаж заклинатель, увеличиваем количество ячеек заклинаний
    if (character.class && ['волшебник', 'колдун', 'чародей', 'бард', 'жрец', 'друид', 'паладин', 'следопыт'].includes(character.class.toLowerCase())) {
      // Обновляем ячейки заклинаний
      updates.spellSlots = calculateSpellSlotsForLevel(newLevel, character.class.toLowerCase());
      
      // Добавляем spellcasting, если его нет
      if (!character.spellcasting) {
        const ability = getSpellcastingAbilityForClass(character.class.toLowerCase());
        const modifier = getSpellcastingModifier(character);
        const profBonus = character.proficiencyBonus || 2;
        
        updates.spellcasting = {
          ability: ability,
          spellSaveDC: 8 + modifier + profBonus,
          spellAttackBonus: modifier + profBonus,
          preparedSpellsLimit: getPreparedSpellsLimit(character)
        };
      }
    }

    // Обновляем бонус мастерства
    updates.proficiencyBonus = calculateProficiencyBonus(newLevel);

    try {
      // Обновляем персонажа
      await updateCharacter(updates);
      toast({
        title: "Уровень повышен!",
        description: `Персонаж достиг ${newLevel} уровня.`,
      });
    } catch (error) {
      console.error("Ошибка при повышении уровня:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось повысить уровень персонажа.",
        variant: "destructive",
      });
    }

    setIsLevelingUp(false);
  };

  return {
    isLevelingUp,
    handleLevelUp
  };
};

// Вспомогательные функции
function calculateProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

function getSpellcastingModifier(character: Character): number {
  if (!character.class) return 0;
  
  const classLower = character.class.toLowerCase();
  let abilityKey = 'INT';
  
  if (['бард', 'чародей', 'колдун'].includes(classLower)) {
    abilityKey = 'CHA';
  } else if (['друид', 'жрец', 'следопыт'].includes(classLower)) {
    abilityKey = 'WIS';
  }
  
  const abilityScore = character.abilities?.[abilityKey] || 10;
  return Math.floor((abilityScore - 10) / 2);
}

function getSpellcastingAbilityForClass(classType: string): string {
  if (['бард', 'чародей', 'колдун', 'паладин'].includes(classType)) {
    return 'CHA';
  } else if (['друид', 'жрец', 'следопыт'].includes(classType)) {
    return 'WIS';
  }
  return 'INT';
}

// Fix for half-caster spell slots
function calculateSpellSlotsForLevel(level: number, classType: string): Record<number, { max: number; used: number }> {
  // Базовая таблица ячеек заклинаний полного заклинателя (волшебник, жрец и т.д.)
  const fullCasterSlots = {
    1: { 1: { max: 2, used: 0 } },
    2: { 1: { max: 3, used: 0 } },
    3: { 1: { max: 4, used: 0 }, 2: { max: 2, used: 0 } },
    4: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 } },
    5: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 2, used: 0 } },
    6: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 3, used: 0 } },
    7: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 3, used: 0 }, 4: { max: 1, used: 0 } },
    8: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 3, used: 0 }, 4: { max: 2, used: 0 } },
    9: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 3, used: 0 }, 4: { max: 3, used: 0 }, 5: { max: 1, used: 0 } },
    10: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 3, used: 0 }, 4: { max: 3, used: 0 }, 5: { max: 2, used: 0 } },
    11: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 3, used: 0 }, 4: { max: 3, used: 0 }, 5: { max: 2, used: 0 }, 6: { max: 1, used: 0 } },
    12: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 3, used: 0 }, 4: { max: 3, used: 0 }, 5: { max: 2, used: 0 }, 6: { max: 1, used: 0 } },
    13: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 3, used: 0 }, 4: { max: 3, used: 0 }, 5: { max: 2, used: 0 }, 6: { max: 1, used: 0 }, 7: { max: 1, used: 0 } },
    14: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 3, used: 0 }, 4: { max: 3, used: 0 }, 5: { max: 2, used: 0 }, 6: { max: 1, used: 0 }, 7: { max: 1, used: 0 } },
    15: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 3, used: 0 }, 4: { max: 3, used: 0 }, 5: { max: 2, used: 0 }, 6: { max: 1, used: 0 }, 7: { max: 1, used: 0 }, 8: { max: 1, used: 0 } },
    16: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 3, used: 0 }, 4: { max: 3, used: 0 }, 5: { max: 2, used: 0 }, 6: { max: 1, used: 0 }, 7: { max: 1, used: 0 }, 8: { max: 1, used: 0 } },
    17: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 3, used: 0 }, 4: { max: 3, used: 0 }, 5: { max: 2, used: 0 }, 6: { max: 1, used: 0 }, 7: { max: 1, used: 0 }, 8: { max: 1, used: 0 }, 9: { max: 1, used: 0 } },
    18: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 3, used: 0 }, 4: { max: 3, used: 0 }, 5: { max: 3, used: 0 }, 6: { max: 1, used: 0 }, 7: { max: 1, used: 0 }, 8: { max: 1, used: 0 }, 9: { max: 1, used: 0 } },
    19: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 3, used: 0 }, 4: { max: 3, used: 0 }, 5: { max: 3, used: 0 }, 6: { max: 2, used: 0 }, 7: { max: 1, used: 0 }, 8: { max: 1, used: 0 }, 9: { max: 1, used: 0 } },
    20: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 3, used: 0 }, 4: { max: 3, used: 0 }, 5: { max: 3, used: 0 }, 6: { max: 2, used: 0 }, 7: { max: 2, used: 0 }, 8: { max: 1, used: 0 }, 9: { max: 1, used: 0 } }
  };
  
  // Half-casters like паладин and следопыт
  const halfCasterSlots = {
    1: { 1: { max: 0, used: 0 } },
    2: { 1: { max: 2, used: 0 } },
    3: { 1: { max: 3, used: 0 } },
    4: { 1: { max: 3, used: 0 } },
    5: { 1: { max: 4, used: 0 }, 2: { max: 2, used: 0 } },
    6: { 1: { max: 4, used: 0 }, 2: { max: 2, used: 0 } },
    7: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 } },
    8: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 } },
    9: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 2, used: 0 } },
    10: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 2, used: 0 } },
    11: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 3, used: 0 } },
    12: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 3, used: 0 } },
    13: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 3, used: 0 }, 4: { max: 1, used: 0 } },
    14: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 3, used: 0 }, 4: { max: 1, used: 0 } },
    15: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 3, used: 0 }, 4: { max: 2, used: 0 } },
    16: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 3, used: 0 }, 4: { max: 2, used: 0 } },
    17: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 3, used: 0 }, 4: { max: 3, used: 0 }, 5: { max: 1, used: 0 } },
    18: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 3, used: 0 }, 4: { max: 3, used: 0 }, 5: { max: 1, used: 0 } },
    19: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 3, used: 0 }, 4: { max: 3, used: 0 }, 5: { max: 2, used: 0 } },
    20: { 1: { max: 4, used: 0 }, 2: { max: 3, used: 0 }, 3: { max: 3, used: 0 }, 4: { max: 3, used: 0 }, 5: { max: 2, used: 0 } }
  };
  
  let slots = fullCasterSlots;
  if (['паладин', 'следопыт'].includes(classType)) {
    slots = halfCasterSlots;
  }
  
  const levelKey = level as keyof typeof slots;
  return slots[levelKey] || {};
}

function getPreparedSpellsLimit(character: Character): number {
  if (!character.class) return 0;
  
  const classLower = character.class.toLowerCase();
  const abilityKey = getSpellcastingAbilityForClass(classLower);
  const modifier = getSpellcastingModifier(character);
  
  if (['волшебник', 'жрец', 'друид'].includes(classLower)) {
    return character.level + modifier;
  }
  
  return 0; // Для классов, которые не готовят заклинания
}

export default useLevelUp;
