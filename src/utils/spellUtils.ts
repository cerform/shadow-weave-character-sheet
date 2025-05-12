
import { Character } from '@/types/character';

/**
 * Вычисляет максимальное число заклинаний, доступных классу на определенном уровне
 */
export const calculateAvailableSpellsByClassAndLevel = (characterClass: string, level: number) => {
  const classLower = characterClass.toLowerCase();
  
  // Базовые параметры для разных классов заклинателей
  if (['жрец', 'друид', 'волшебник', 'cleric', 'druid', 'wizard'].includes(classLower)) {
    // Классы с полным доступом к заклинаниям
    return {
      cantripsKnown: Math.min(5, 3 + Math.floor(level / 4)),
      knownSpells: level + 1, // Для подготовки (уровень + модификатор способности)
      maxSpellLevel: Math.min(9, Math.ceil(level / 2))
    };
  } else if (['бард', 'следопыт', 'bard', 'ranger'].includes(classLower)) {
    // Классы с ограниченным набором заклинаний
    return {
      cantripsKnown: Math.min(4, 2 + Math.floor(level / 6)),
      spellsKnown: level + 3,
      maxSpellLevel: Math.min(9, Math.ceil(level / 2))
    };
  } else if (['чародей', 'колдун', 'sorcerer', 'warlock'].includes(classLower)) {
    // Классы с очень ограниченным набором заклинаний
    return {
      cantripsKnown: Math.min(6, 4 + Math.floor(level / 6)),
      spellsKnown: level + 1,
      maxSpellLevel: Math.min(9, Math.ceil(level / 2))
    };
  } else if (['паладин', 'paladin'].includes(classLower)) {
    // Паладины получают заклинания с 2-го уровня
    if (level < 2) {
      return { cantripsKnown: 0, knownSpells: 0, maxSpellLevel: 0 };
    }
    return {
      cantripsKnown: 0,
      knownSpells: Math.floor(level / 2) + 1,
      maxSpellLevel: Math.min(5, Math.ceil(level / 4))
    };
  }
  
  // Для не-магических классов
  return {
    cantripsKnown: 0,
    knownSpells: 0,
    maxSpellLevel: 0
  };
};

/**
 * Проверяет, может ли персонаж подготовить больше заклинаний
 */
export const canPrepareMoreSpells = (character: Character): boolean => {
  if (!character.spellcasting || !character.spells) return false;

  // Получаем лимит подготовленных заклинаний
  const preparedLimit = getPreparedSpellsLimit(character);
  
  // Считаем количество уже подготовленных заклинаний
  let preparedCount = 0;
  character.spells.forEach(spell => {
    if (typeof spell === 'object' && spell?.prepared && spell.level > 0) {
      preparedCount++;
    }
  });
  
  return preparedCount < preparedLimit;
};

/**
 * Получает лимит подготовленных заклинаний для персонажа
 */
export const getPreparedSpellsLimit = (character: Character): number => {
  if (!character.spellcasting) return 0;

  // Если лимит уже указан в свойстве preparedSpellsLimit
  if (character.spellcasting.preparedSpellsLimit !== undefined) {
    return character.spellcasting.preparedSpellsLimit;
  }

  // Для классов, которые готовят заклинания (жрец, друид, волшебник и т.д.)
  const classLower = character.class.toLowerCase();
  if (['жрец', 'друид', 'волшебник', 'cleric', 'druid', 'wizard', 'паладин', 'paladin'].includes(classLower)) {
    // Базовая формула: уровень персонажа + модификатор способности заклинаний
    const abilityName = character.spellcasting.ability || 'intelligence';
    const abilityScore = character[abilityName.toLowerCase() as keyof Character] as number;
    const abilityModifier = Math.floor((abilityScore - 10) / 2);
    
    // Для паладинов: уровень / 2 + модификатор харизмы
    if (['паладин', 'paladin'].includes(classLower)) {
      return Math.floor(character.level / 2) + abilityModifier;
    }
    
    return character.level + abilityModifier;
  }
  
  // Для классов, которые знают фиксированное количество заклинаний (бард, чародей)
  return 0; // Эти классы не готовят заклинания, а просто знают их
};
