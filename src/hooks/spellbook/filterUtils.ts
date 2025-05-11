
import { SpellData } from '@/types/spells';
import { Character } from '@/types/character';

export const getSpellcastingAbilityModifier = (character: Character): number => {
  if (!character || !character.abilities) return 0;
  
  const classLower = character?.class?.toLowerCase() || '';
  
  if (['жрец', 'друид', 'cleric', 'druid'].includes(classLower)) {
    // Мудрость
    const wisdom = character.abilities?.wisdom || character.abilities?.WIS || character.wisdom || 10;
    return Math.floor((wisdom - 10) / 2);
  } else if (['волшебник', 'маг', 'wizard'].includes(classLower)) {
    // Интеллект
    const intelligence = character.abilities?.intelligence || character.abilities?.INT || character.intelligence || 10;
    return Math.floor((intelligence - 10) / 2);
  } else {
    // Харизма (бард, колдун, чародей, паладин)
    const charisma = character.abilities?.charisma || character.abilities?.CHA || character.charisma || 10;
    return Math.floor((charisma - 10) / 2);
  }
};

export const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string,
  characterLevel: number,
  abilityModifier: number = 0
): { cantripsCount: number; knownSpells: number; maxSpellLevel: number } => {
  // Значения по умолчанию
  let cantripsCount = 0;
  let knownSpells = 0;
  let maxSpellLevel = 0;

  const classLower = characterClass.toLowerCase();

  if (['волшебник', 'маг', 'wizard'].includes(classLower)) {
    // Волшебник
    cantripsCount = characterLevel >= 10 ? 5 : characterLevel >= 4 ? 4 : 3;
    knownSpells = 6 + (characterLevel > 1 ? (characterLevel - 1) * 2 : 0);
    maxSpellLevel = Math.min(9, Math.ceil(characterLevel / 2));
  } else if (['жрец', 'cleric'].includes(classLower)) {
    // Жрец
    cantripsCount = characterLevel >= 10 ? 5 : characterLevel >= 4 ? 4 : 3;
    knownSpells = characterLevel + abilityModifier;
    maxSpellLevel = Math.min(9, Math.ceil(characterLevel / 2));
  } else if (['бард', 'bard'].includes(classLower)) {
    // Бард
    cantripsCount = 2;
    knownSpells = 4 + Math.floor((characterLevel - 1) / 2);
    maxSpellLevel = Math.min(9, Math.ceil(characterLevel / 2));
  } else if (['друид', 'druid'].includes(classLower)) {
    // Друид
    cantripsCount = characterLevel >= 4 ? 3 : 2;
    knownSpells = characterLevel + abilityModifier;
    maxSpellLevel = Math.min(9, Math.ceil(characterLevel / 2));
  } else if (['колдун', 'чародей', 'warlock', 'sorcerer'].includes(classLower)) {
    // Колдун/Чародей
    cantripsCount = characterLevel >= 10 ? 4 : characterLevel >= 4 ? 3 : 2;
    knownSpells = Math.min(15, characterLevel + 1);
    maxSpellLevel = Math.min(5, Math.ceil(characterLevel / 2));
  } else if (['паладин', 'paladin'].includes(classLower)) {
    // Паладин
    cantripsCount = 0;
    knownSpells = Math.floor(characterLevel / 2) + abilityModifier;
    maxSpellLevel = Math.min(5, Math.ceil(characterLevel / 4));
  } else if (['рейнджер', 'следопыт', 'ranger'].includes(classLower)) {
    // Следопыт
    cantripsCount = 0;
    knownSpells = Math.floor(characterLevel / 2);
    maxSpellLevel = Math.min(5, Math.ceil(characterLevel / 4));
  }

  return { cantripsCount, knownSpells, maxSpellLevel };
};

export const getMaxSpellLevel = (characterClass: string, characterLevel: number): number => {
  const classLower = characterClass.toLowerCase();
  
  if (['волшебник', 'маг', 'wizard', 'жрец', 'cleric', 'бард', 'bard', 'друид', 'druid'].includes(classLower)) {
    return Math.min(9, Math.ceil(characterLevel / 2));
  } else if (['колдун', 'чародей', 'warlock', 'sorcerer'].includes(classLower)) {
    return Math.min(5, Math.ceil(characterLevel / 2));
  } else if (['паладин', 'paladin', 'рейнджер', 'следопыт', 'ranger'].includes(classLower)) {
    return Math.min(5, Math.ceil(characterLevel / 4));
  }
  
  return 0;
};

export const filterSpellsByClassAndLevel = (
  spells: SpellData[], 
  characterClass: string, 
  characterLevel: number
): SpellData[] => {
  if (!spells || !Array.isArray(spells) || spells.length === 0) {
    return [];
  }
  
  const maxSpellLevel = getMaxSpellLevel(characterClass, characterLevel);
  const classLower = characterClass.toLowerCase();
  
  return spells.filter(spell => {
    // Проверка уровня заклинания
    if (spell.level > maxSpellLevel) {
      return false;
    }
    
    // Проверка соответствия классу
    if (spell.classes) {
      if (Array.isArray(spell.classes)) {
        return spell.classes.some(cls => {
          if (typeof cls === 'string') {
            return cls.toLowerCase() === classLower;
          }
          return false;
        });
      } else if (typeof spell.classes === 'string') {
        return spell.classes.toLowerCase() === classLower;
      }
    }
    
    return false;
  });
};
