
import { Character } from '@/types/character';
import { SpellData } from '@/types/spells';

// Функция для получения модификатора способности заклинаний
export const getSpellcastingAbilityModifier = (character: Character): number => {
  if (!character || !character.abilities) return 0;
  
  const classLower = character?.class ? character.class.toLowerCase() : '';
  
  if (['жрец', 'друид', 'cleric', 'druid'].includes(classLower)) {
    // Мудрость
    const wisdom = character.abilities?.wisdom || character.abilities?.WIS || 10;
    return Math.floor((wisdom - 10) / 2);
  } else if (['волшебник', 'маг', 'wizard'].includes(classLower)) {
    // Интеллект
    const intelligence = character.abilities?.intelligence || character.abilities?.INT || 10;
    return Math.floor((intelligence - 10) / 2);
  } else {
    // Харизма (бард, колдун, чародей, паладин)
    const charisma = character.abilities?.charisma || character.abilities?.CHA || 10;
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

  if (!characterClass) {
    return { cantripsCount, knownSpells, maxSpellLevel };
  }

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
  if (!characterClass) return 0;
  
  // Убедимся, что characterClass - это строка
  const classLower = typeof characterClass === 'string' ? characterClass.toLowerCase() : '';
  
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
  if (!spells || !Array.isArray(spells) || spells.length === 0 || !characterClass) {
    return [];
  }
  
  const maxSpellLevel = getMaxSpellLevel(characterClass, characterLevel);
  
  // Убедимся, что characterClass - это строка
  const classLower = typeof characterClass === 'string' ? characterClass.toLowerCase() : '';
  
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

export const convertToSpellData = (spells: any[]): SpellData[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  return spells.map(spell => {
    // If it's a string, create a minimal spell object
    if (typeof spell === 'string') {
      return {
        id: `spell-${Math.random().toString(36).substring(2, 11)}`,
        name: spell,
        level: 0,
        school: 'Unknown',
        castingTime: '1 action',
        range: 'Self',
        components: '',
        duration: 'Instantaneous',
        description: '',
        classes: [],
        ritual: false,
        concentration: false,
        verbal: false,
        somatic: false,
        material: false,
        source: 'Custom'
      };
    }
    
    // If it's already a spell object, ensure it has all required fields
    return {
      id: spell.id || `spell-${Math.random().toString(36).substring(2, 11)}`,
      name: spell.name || 'Unknown Spell',
      level: spell.level !== undefined ? spell.level : 0,
      school: spell.school || 'Unknown',
      castingTime: spell.castingTime || '1 action',
      range: spell.range || 'Self',
      components: spell.components || '',
      duration: spell.duration || 'Instantaneous',
      description: spell.description || '',
      classes: spell.classes || [],
      ritual: !!spell.ritual,
      concentration: !!spell.concentration,
      verbal: !!spell.verbal,
      somatic: !!spell.somatic,
      material: !!spell.material,
      materials: spell.materials || '',
      prepared: !!spell.prepared,
      source: spell.source || 'Custom'
    };
  });
};

// Function for character sheet's spell list
export const normalizeSpells = (spells: any[]): any[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        name: spell,
        level: 0, // Default to cantrip if unknown
        prepared: true
      };
    }
    return spell;
  });
};

// Function to process spell components
export const parseComponents = (components: string): {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  ritual: boolean;
  concentration: boolean;
} => {
  const result = {
    verbal: false,
    somatic: false,
    material: false,
    ritual: false,
    concentration: false
  };
  
  if (!components) return result;
  
  const componentsUpper = components.toUpperCase();
  result.verbal = componentsUpper.includes('В') || componentsUpper.includes('V');
  result.somatic = componentsUpper.includes('С') || componentsUpper.includes('S');
  result.material = componentsUpper.includes('М') || componentsUpper.includes('M');
  result.ritual = componentsUpper.includes('Р') || componentsUpper.includes('R');
  result.concentration = componentsUpper.includes('К') || componentsUpper.includes('C');
  
  return result;
};
