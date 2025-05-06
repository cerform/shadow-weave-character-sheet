
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
      
      // Добавляем спеллкастинг, если его нет
      if (!character.spellcasting) {
        updates.spellcasting = {
          ability: getSpellcastingAbilityForClass(character.class.toLowerCase()),
          spellSaveDC: 8 + getSpellcastingModifier(character) + (character.proficiencyBonus || 2),
          spellAttackBonus: getSpellcastingModifier(character) + (character.proficiencyBonus || 2),
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

function calculateSpellSlotsForLevel(level: number, classType: string): Record<number, { max: number; used: number }> {
  // Базовая таблица ячеек заклинаний полного заклинателя (волшебник, жрец и т.д.)
  const fullCasterSlots = {
    1: { 1: 2 },
    2: { 1: 3 },
    3: { 1: 4, 2: 2 },
    4: { 1: 4, 2: 3 },
    5: { 1: 4, 2: 3, 3: 2 },
    6: { 1: 4, 2: 3, 3: 3 },
    7: { 1: 4, 2: 3, 3: 3, 4: 1 },
    8: { 1: 4, 2: 3, 3: 3, 4: 2 },
    9: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
    10: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
    11: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
    12: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1 },
    13: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
    14: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1 },
    15: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
    16: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1 },
    17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2, 6: 1, 7: 1, 8: 1, 9: 1 },
    18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 1, 7: 1, 8: 1, 9: 1 },
    19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 1, 8: 1, 9: 1 },
    20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 3, 6: 2, 7: 2, 8: 1, 9: 1 }
  };
  
  // Half-casters like паладин and следопыт
  const halfCasterSlots = {
    1: {},
    2: { 1: 2 },
    3: { 1: 3 },
    4: { 1: 3 },
    5: { 1: 4, 2: 2 },
    6: { 1: 4, 2: 2 },
    7: { 1: 4, 2: 3 },
    8: { 1: 4, 2: 3 },
    9: { 1: 4, 2: 3, 3: 2 },
    10: { 1: 4, 2: 3, 3: 2 },
    11: { 1: 4, 2: 3, 3: 3 },
    12: { 1: 4, 2: 3, 3: 3 },
    13: { 1: 4, 2: 3, 3: 3, 4: 1 },
    14: { 1: 4, 2: 3, 3: 3, 4: 1 },
    15: { 1: 4, 2: 3, 3: 3, 4: 2 },
    16: { 1: 4, 2: 3, 3: 3, 4: 2 },
    17: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
    18: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 1 },
    19: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 },
    20: { 1: 4, 2: 3, 3: 3, 4: 3, 5: 2 }
  };
  
  let slots = fullCasterSlots;
  if (['паладин', 'следопыт'].includes(classType)) {
    slots = halfCasterSlots;
  }
  
  const levelSlots = slots[level as keyof typeof slots] || {};
  const result: Record<number, { max: number; used: number }> = {};
  
  for (const [slotLevel, count] of Object.entries(levelSlots)) {
    result[Number(slotLevel)] = { max: count, used: 0 };
  }
  
  return result;
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
