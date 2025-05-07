import { useState, useEffect } from 'react';
import { Character } from '@/types/character';
import { getAbilityModifier } from '@/utils/characterUtils';

// Типы для хука
interface LevelUpOptions {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

interface ClassFeature {
  name: string;
  description: string;
  level: number;
}

interface SpellSlots {
  [level: number]: {
    [spellLevel: number]: {
      max: number;
      used: number;
    };
  };
}

// Данные о заклинаниях для разных классов
const wizardSpellSlots: SpellSlots = {
  1: {
    1: { max: 2, used: 0 }
  },
  2: {
    1: { max: 3, used: 0 }
  },
  3: {
    1: { max: 4, used: 0 },
    2: { max: 2, used: 0 }
  },
  4: {
    1: { max: 4, used: 0 },
    2: { max: 3, used: 0 }
  },
  5: {
    1: { max: 4, used: 0 },
    2: { max: 3, used: 0 },
    3: { max: 2, used: 0 }
  },
  6: {
    1: { max: 4, used: 0 },
    2: { max: 3, used: 0 },
    3: { max: 3, used: 0 }
  },
  7: {
    1: { max: 4, used: 0 },
    2: { max: 3, used: 0 },
    3: { max: 3, used: 0 },
    4: { max: 1, used: 0 }
  },
  8: {
    1: { max: 4, used: 0 },
    2: { max: 3, used: 0 },
    3: { max: 3, used: 0 },
    4: { max: 2, used: 0 }
  },
  9: {
    1: { max: 4, used: 0 },
    2: { max: 3, used: 0 },
    3: { max: 3, used: 0 },
    4: { max: 3, used: 0 },
    5: { max: 1, used: 0 }
  },
  10: {
    1: { max: 4, used: 0 },
    2: { max: 3, used: 0 },
    3: { max: 3, used: 0 },
    4: { max: 3, used: 0 },
    5: { max: 2, used: 0 }
  },
  11: {
    1: { max: 4, used: 0 },
    2: { max: 3, used: 0 },
    3: { max: 3, used: 0 },
    4: { max: 3, used: 0 },
    5: { max: 2, used: 0 },
    6: { max: 1, used: 0 }
  },
  12: {
    1: { max: 4, used: 0 },
    2: { max: 3, used: 0 },
    3: { max: 3, used: 0 },
    4: { max: 3, used: 0 },
    5: { max: 2, used: 0 },
    6: { max: 1, used: 0 }
  },
  13: {
    1: { max: 4, used: 0 },
    2: { max: 3, used: 0 },
    3: { max: 3, used: 0 },
    4: { max: 3, used: 0 },
    5: { max: 2, used: 0 },
    6: { max: 1, used: 0 },
    7: { max: 1, used: 0 }
  },
  14: {
    1: { max: 4, used: 0 },
    2: { max: 3, used: 0 },
    3: { max: 3, used: 0 },
    4: { max: 3, used: 0 },
    5: { max: 2, used: 0 },
    6: { max: 1, used: 0 },
    7: { max: 1, used: 0 }
  },
  15: {
    1: { max: 4, used: 0 },
    2: { max: 3, used: 0 },
    3: { max: 3, used: 0 },
    4: { max: 3, used: 0 },
    5: { max: 2, used: 0 },
    6: { max: 1, used: 0 },
    7: { max: 1, used: 0 },
    8: { max: 1, used: 0 }
  },
  16: {
    1: { max: 4, used: 0 },
    2: { max: 3, used: 0 },
    3: { max: 3, used: 0 },
    4: { max: 3, used: 0 },
    5: { max: 2, used: 0 },
    6: { max: 1, used: 0 },
    7: { max: 1, used: 0 },
    8: { max: 1, used: 0 }
  },
  17: {
    1: { max: 4, used: 0 },
    2: { max: 3, used: 0 },
    3: { max: 3, used: 0 },
    4: { max: 3, used: 0 },
    5: { max: 2, used: 0 },
    6: { max: 1, used: 0 },
    7: { max: 1, used: 0 },
    8: { max: 1, used: 0 },
    9: { max: 1, used: 0 }
  },
  18: {
    1: { max: 4, used: 0 },
    2: { max: 3, used: 0 },
    3: { max: 3, used: 0 },
    4: { max: 3, used: 0 },
    5: { max: 3, used: 0 },
    6: { max: 1, used: 0 },
    7: { max: 1, used: 0 },
    8: { max: 1, used: 0 },
    9: { max: 1, used: 0 }
  },
  19: {
    1: { max: 4, used: 0 },
    2: { max: 3, used: 0 },
    3: { max: 3, used: 0 },
    4: { max: 3, used: 0 },
    5: { max: 3, used: 0 },
    6: { max: 2, used: 0 },
    7: { max: 1, used: 0 },
    8: { max: 1, used: 0 },
    9: { max: 1, used: 0 }
  },
  20: {
    1: { max: 4, used: 0 },
    2: { max: 3, used: 0 },
    3: { max: 3, used: 0 },
    4: { max: 3, used: 0 },
    5: { max: 3, used: 0 },
    6: { max: 2, used: 0 },
    7: { max: 2, used: 0 },
    8: { max: 1, used: 0 },
    9: { max: 1, used: 0 }
  }
};

const warlockSpellSlots = {
  1: {
    1: { max: 1, used: 0 }
  },
  2: {
    1: { max: 2, used: 0 }
  },
  3: {
    1: { max: 0, used: 0 },
    2: { max: 2, used: 0 }
  },
  4: {
    1: { max: 0, used: 0 },
    2: { max: 2, used: 0 }
  },
  5: {
    1: { max: 0, used: 0 },
    2: { max: 0, used: 0 },
    3: { max: 2, used: 0 }
  },
  6: {
    1: { max: 0, used: 0 },
    2: { max: 0, used: 0 },
    3: { max: 2, used: 0 }
  },
  7: {
    1: { max: 0, used: 0 },
    2: { max: 0, used: 0 },
    3: { max: 0, used: 0 },
    4: { max: 2, used: 0 }
  },
  8: {
    1: { max: 0, used: 0 },
    2: { max: 0, used: 0 },
    3: { max: 0, used: 0 },
    4: { max: 2, used: 0 }
  },
  9: {
    1: { max: 0, used: 0 },
    2: { max: 0, used: 0 },
    3: { max: 0, used: 0 },
    4: { max: 0, used: 0 },
    5: { max: 2, used: 0 }
  },
  10: {
    1: { max: 0, used: 0 },
    2: { max: 0, used: 0 },
    3: { max: 0, used: 0 },
    4: { max: 0, used: 0 },
    5: { max: 2, used: 0 }
  },
  11: {
    1: { max: 0, used: 0 },
    2: { max: 0, used: 0 },
    3: { max: 0, used: 0 },
    4: { max: 0, used: 0 },
    5: { max: 3, used: 0 }
  },
  12: {
    1: { max: 0, used: 0 },
    2: { max: 0, used: 0 },
    3: { max: 0, used: 0 },
    4: { max: 0, used: 0 },
    5: { max: 3, used: 0 }
  },
  13: {
    1: { max: 0, used: 0 },
    2: { max: 0, used: 0 },
    3: { max: 0, used: 0 },
    4: { max: 0, used: 0 },
    5: { max: 0, used: 0 },
    6: { max: 3, used: 0 }
  },
  14: {
    1: { max: 0, used: 0 },
    2: { max: 0, used: 0 },
    3: { max: 0, used: 0 },
    4: { max: 0, used: 0 },
    5: { max: 0, used: 0 },
    6: { max: 3, used: 0 }
  },
  15: {
    1: { max: 0, used: 0 },
    2: { max: 0, used: 0 },
    3: { max: 0, used: 0 },
    4: { max: 0, used: 0 },
    5: { max: 0, used: 0 },
    6: { max: 0, used: 0 },
    7: { max: 3, used: 0 }
  },
  16: {
    1: { max: 0, used: 0 },
    2: { max: 0, used: 0 },
    3: { max: 0, used: 0 },
    4: { max: 0, used: 0 },
    5: { max: 0, used: 0 },
    6: { max: 0, used: 0 },
    7: { max: 3, used: 0 }
  },
  17: {
    1: { max: 0, used: 0 },
    2: { max: 0, used: 0 },
    3: { max: 0, used: 0 },
    4: { max: 0, used: 0 },
    5: { max: 0, used: 0 },
    6: { max: 0, used: 0 },
    7: { max: 0, used: 0 },
    8: { max: 4, used: 0 }
  },
  18: {
    1: { max: 0, used: 0 },
    2: { max: 0, used: 0 },
    3: { max: 0, used: 0 },
    4: { max: 0, used: 0 },
    5: { max: 0, used: 0 },
    6: { max: 0, used: 0 },
    7: { max: 0, used: 0 },
    8: { max: 4, used: 0 }
  },
  19: {
    1: { max: 0, used: 0 },
    2: { max: 0, used: 0 },
    3: { max: 0, used: 0 },
    4: { max: 0, used: 0 },
    5: { max: 0, used: 0 },
    6: { max: 0, used: 0 },
    7: { max: 0, used: 0 },
    8: { max: 0, used: 0 },
    9: { max: 4, used: 0 }
  },
  20: {
    1: { max: 0, used: 0 },
    2: { max: 0, used: 0 },
    3: { max: 0, used: 0 },
    4: { max: 0, used: 0 },
    5: { max: 0, used: 0 },
    6: { max: 0, used: 0 },
    7: { max: 0, used: 0 },
    8: { max: 0, used: 0 },
    9: { max: 4, used: 0 }
  }
};

// Функция для получения количества заклинаний для класса и уровня
const getSpellSlotsForClassAndLevel = (characterClass: string, level: number): SpellSlots | null => {
  const lowerClass = characterClass.toLowerCase();
  
  if (['волшебник', 'wizard'].includes(lowerClass)) {
    return wizardSpellSlots[level] ? { [level]: wizardSpellSlots[level] } : null;
  }
  
  if (['колдун', 'warlock'].includes(lowerClass)) {
    return warlockSpellSlots[level] ? { [level]: warlockSpellSlots[level] } : null;
  }
  
  // Для других классов можно добавить аналогичные проверки
  
  return null;
};

// Функция для получения известных заклинаний для класса и уровня
const getKnownSpellsForClassAndLevel = (characterClass: string, level: number): number => {
  const lowerClass = characterClass.toLowerCase();
  
  if (['волшебник', 'wizard'].includes(lowerClass)) {
    // Волшебники могут знать неограниченное количество заклинаний в книге
    return -1; // -1 означает неограниченное количество
  }
  
  if (['колдун', 'warlock'].includes(lowerClass)) {
    // Колдуны знают ограниченное количество заклинаний
    const knownSpells = {
      1: 2, 2: 3, 3: 4, 4: 5, 5: 6, 6: 7, 7: 8, 8: 9, 9: 10,
      10: 10, 11: 11, 12: 11, 13: 12, 14: 12, 15: 13, 16: 13, 17: 14, 18: 14, 19: 15, 20: 15
    };
    return knownSpells[level as keyof typeof knownSpells] || 0;
  }
  
  // Для других классов можно добавить аналогичные проверки
  
  return 0;
};

// Функция для получения количества заговоров для класса и уровня
const getCantripsForClassAndLevel = (characterClass: string, level: number): number => {
  const lowerClass = characterClass.toLowerCase();
  
  if (['волшебник', 'wizard'].includes(lowerClass)) {
    if (level >= 10) return 5;
    if (level >= 4) return 4;
    return 3;
  }
  
  if (['колдун', 'warlock'].includes(lowerClass)) {
    if (level >= 10) return 4;
    if (level >= 4) return 3;
    return 2;
  }
  
  // Для других классов можно добавить аналогичные проверки
  
  return 0;
};

// Функция для получения особенностей класса для определенного уровня
const getClassFeaturesForLevel = (characterClass: string, level: number): ClassFeature[] => {
  const lowerClass = characterClass.toLowerCase();
  const features: ClassFeature[] = [];
  
  if (['волшебник', 'wizard'].includes(lowerClass)) {
    if (level === 2) {
      features.push({
        name: 'Магическая традиция',
        description: 'Выберите магическую традицию, которая определит вашу специализацию в магии.',
        level: 2
      });
    }
    // Добавьте другие особенности волшебника
  }
  
  if (['колдун', 'warlock'].includes(lowerClass)) {
    if (level === 2) {
      features.push({
        name: 'Таинственные воззвания',
        description: 'Вы изучаете фрагменты запретных знаний, которые наделяют вас постоянной магической способностью.',
        level: 2
      });
    }
    // Добавьте другие особенности колдуна
  }
  
  // Для других классов можно добавить аналогичные проверки
  
  return features;
};

// Основной хук для повышения уровня
export const useLevelUp = ({ character, onUpdate }: LevelUpOptions) => {
  const [availableFeatures, setAvailableFeatures] = useState<ClassFeature[]>([]);
  const [newSpellSlots, setNewSpellSlots] = useState<SpellSlots | null>(null);
  const [newKnownSpells, setNewKnownSpells] = useState<number>(0);
  const [newCantrips, setNewCantrips] = useState<number>(0);
  
  // Обновляем доступные особенности при изменении уровня или класса
  useEffect(() => {
    if (!character || !character.class) return;
    
    const currentLevel = character.level || 1;
    const nextLevel = currentLevel + 1;
    
    // Получаем особенности для следующего уровня
    const features = getClassFeaturesForLevel(character.class, nextLevel);
    setAvailableFeatures(features);
    
    // Получаем слоты заклинаний для следующего уровня
    const spellSlots = getSpellSlotsForClassAndLevel(character.class, nextLevel);
    setNewSpellSlots(spellSlots);
    
    // Получаем количество известных заклинаний для следующего уровня
    const knownSpells = getKnownSpellsForClassAndLevel(character.class, nextLevel);
    setNewKnownSpells(knownSpells);
    
    // Получаем количество заговоров для следующего уровня
    const cantrips = getCantripsForClassAndLevel(character.class, nextLevel);
    setNewCantrips(cantrips);
  }, [character]);
  
  // Функция для повышения уровня персонажа
  const levelUp = () => {
    if (!character) return;
    
    const currentLevel = character.level || 1;
    const nextLevel = currentLevel + 1;
    
    // Базовые обновления для персонажа
    const updates: Partial<Character> = {
      level: nextLevel,
      experience: character.experience || 0, // Опыт остается тем же
    };
    
    // Обновляем бонус мастерства
    if (nextLevel >= 17) {
      updates.proficiencyBonus = 6;
    } else if (nextLevel >= 13) {
      updates.proficiencyBonus = 5;
    } else if (nextLevel >= 9) {
      updates.proficiencyBonus = 4;
    } else if (nextLevel >= 5) {
      updates.proficiencyBonus = 3;
    } else {
      updates.proficiencyBonus = 2;
    }
    
    // Обновляем хиты
    if (character.class) {
      const hitDice = getHitDiceForClass(character.class);
      const conModifier = getAbilityModifier(character, 'CON');
      
      // Среднее значение для хитов (или можно добавить бросок кубика)
      const averageHitPoints = Math.floor(hitDice / 2) + 1 + conModifier;
      
      updates.maxHp = (character.maxHp || 0) + Math.max(1, averageHitPoints);
      updates.hp = updates.maxHp; // Восстанавливаем полные хиты при повышении уровня
    }
    
    // Обновляем слоты заклинаний, если персонаж - заклинатель
    if (character.class && isCaster(character.class) && newSpellSlots) {
      updates.spellSlots = {
        ...(character.spellSlots || {}),
        ...newSpellSlots
      };
    }
    
    // Применяем обновления к персонажу
    onUpdate(updates);
  };
  
  // Вспомогательные функции
  
  // Проверяем, является ли класс заклинателем
  const isCaster = (characterClass: string): boolean => {
    const casterClasses = [
      'волшебник', 'wizard', 'колдун', 'warlock', 'жрец', 'cleric',
      'друид', 'druid', 'бард', 'bard', 'чародей', 'sorcerer',
      'паладин', 'paladin', 'следопыт', 'ranger'
    ];
    return casterClasses.includes(characterClass.toLowerCase());
  };
  
  // Получаем кубик хитов для класса
  const getHitDiceForClass = (characterClass: string): number => {
    const lowerClass = characterClass.toLowerCase();
    
    if (['варвар', 'barbarian'].includes(lowerClass)) return 12;
    if (['воин', 'fighter', 'паладин', 'paladin', 'следопыт', 'ranger'].includes(lowerClass)) return 10;
    if (['бард', 'bard', 'жрец', 'cleric', 'друид', 'druid', 'монах', 'monk', 'плут', 'rogue', 'колдун', 'warlock'].includes(lowerClass)) return 8;
    if (['волшебник', 'wizard', 'чародей', 'sorcerer'].includes(lowerClass)) return 6;
    
    return 8; // По умолчанию d8
  };
  
  return {
    availableFeatures,
    newSpellSlots,
    newKnownSpells,
    newCantrips,
    levelUp
  };
};

export default useLevelUp;
