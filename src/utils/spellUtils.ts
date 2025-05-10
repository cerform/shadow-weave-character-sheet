
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

/**
 * Конвертирует объект заклинания из CharacterSpell в SpellData
 * @param spell Объект заклинания CharacterSpell
 * @returns Объект заклинания SpellData
 */
export const convertToSpellData = (spell: CharacterSpell | string): SpellData => {
  if (typeof spell === 'string') {
    return {
      id: `spell-${spell.toLowerCase().replace(/\s+/g, '-')}`,
      name: spell,
      level: 0,
      school: 'Универсальная',
      castingTime: '1 действие',
      range: 'На себя',
      components: '',
      duration: 'Мгновенная',
      description: ''
    };
  }
  
  return {
    id: spell.id || `spell-${spell.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: spell.name,
    level: spell.level || 0,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    prepared: spell.prepared,
    classes: spell.classes
  };
};

/**
 * Возвращает максимальное количество заклинаний, которые можно подготовить
 * @param character Персонаж
 * @returns Максимальное количество заклинаний
 */
export const getPreparedSpellsLimit = (character: Character): number => {
  const { class: characterClass, level, abilities } = character;
  
  if (!characterClass || !level) return 0;
  
  const classLower = characterClass.toLowerCase();
  
  // Для заклинателей на основе модификатора характеристики
  if (['жрец', 'cleric', 'друид', 'druid', 'паладин', 'paladin'].includes(classLower)) {
    const spellAbility = getDefaultCastingAbility(characterClass);
    const modifier = getSpellcastingAbilityModifier(character);
    
    return level + modifier;
  }
  
  // Для волшебника
  if (['волшебник', 'wizard'].includes(classLower)) {
    const intelligence = abilities?.INT || abilities?.intelligence || 10;
    const modifier = Math.floor((intelligence - 10) / 2);
    
    return level + modifier;
  }
  
  // Для классов, которые не готовят заклинания, а знают их фиксированное количество
  return 0;
};

/**
 * Возвращает характеристику для заклинаний по классу
 * @param characterClass Класс персонажа
 * @returns Название характеристики для заклинаний
 */
export const getDefaultCastingAbility = (characterClass?: string): string => {
  if (!characterClass) return 'intelligence';
  
  const classLower = characterClass.toLowerCase();
  
  if (['жрец', 'cleric', 'друид', 'druid', 'следопыт', 'ranger'].includes(classLower)) {
    return 'wisdom';
  } else if (['бард', 'bard', 'чародей', 'sorcerer', 'колдун', 'warlock', 'паладин', 'paladin'].includes(classLower)) {
    return 'charisma';
  } else {
    return 'intelligence';
  }
};

/**
 * Возвращает модификатор характеристики для заклинаний
 * @param character Персонаж
 * @returns Значение модификатора
 */
export const getSpellcastingAbilityModifier = (character: Character): number => {
  if (!character.class) return 0;
  
  const ability = getDefaultCastingAbility(character.class);
  
  switch (ability) {
    case 'intelligence':
      return Math.floor((character.abilities?.INT || character.abilities?.intelligence || 10) - 10) / 2;
    case 'wisdom':
      return Math.floor((character.abilities?.WIS || character.abilities?.wisdom || 10) - 10) / 2;
    case 'charisma':
      return Math.floor((character.abilities?.CHA || character.abilities?.charisma || 10) - 10) / 2;
    default:
      return 0;
  }
};

/**
 * Рассчитывает сложность спасброска от заклинаний
 * @param character Персонаж
 * @returns Значение сложности спасброска
 */
export const calculateSpellcastingDC = (character: Character): number => {
  const abilityMod = getSpellcastingAbilityModifier(character);
  const proficiencyBonus = character.proficiencyBonus || 2;
  
  return 8 + proficiencyBonus + abilityMod;
};

/**
 * Рассчитывает бонус атаки заклинанием
 * @param character Персонаж
 * @returns Значение бонуса атаки
 */
export const calculateSpellAttackBonus = (character: Character): number => {
  const abilityMod = getSpellcastingAbilityModifier(character);
  const proficiencyBonus = character.proficiencyBonus || 2;
  
  return proficiencyBonus + abilityMod;
};

/**
 * Получает доступные заклинания для класса и уровня
 * @param characterClass Класс персонажа
 * @param level Уровень персонажа
 * @returns Объект с доступными заклинаниями
 */
export const calculateAvailableSpellsByClassAndLevel = (characterClass: string, level: number): { cantrips: number; spells: number } => {
  const classLower = characterClass.toLowerCase();
  let cantrips = 0;
  let spells = 0;
  
  switch(classLower) {
    case 'волшебник':
    case 'wizard':
      cantrips = level >= 10 ? 5 : level >= 4 ? 4 : 3;
      spells = 6 + (level * 2); // Level 1 starts with 6, +2 per level
      break;
    case 'жрец':
    case 'cleric':
    case 'друид':
    case 'druid':
      cantrips = level >= 10 ? 5 : level >= 4 ? 4 : 3;
      spells = level + 1; // Level + wisdom modifier handled separately
      break;
    case 'бард':
    case 'bard':
      cantrips = level >= 10 ? 4 : 2;
      spells = Math.max(4, level + 3); // Starts at 4, increases with level
      break;
    case 'колдун':
    case 'warlock':
      cantrips = level >= 10 ? 4 : 2;
      spells = Math.min(15, level + 1); // Starts at 2, increases with level, max 15
      break;
    case 'чародей':
    case 'sorcerer':
      cantrips = level >= 10 ? 6 : level >= 4 ? 5 : 4;
      spells = level + 1; // Starts at 2, increases with level
      break;
    default:
      cantrips = 0;
      spells = 0;
  }
  
  return { cantrips, spells };
};

/**
 * Фильтрует заклинания по классу и уровню
 * @param spells Массив заклинаний
 * @param characterClass Класс персонажа
 * @param level Уровень персонажа
 * @returns Отфильтрованный массив заклинаний
 */
export const filterSpellsByClassAndLevel = (
  spells: SpellData[], 
  characterClass: string, 
  maxLevel: number
): SpellData[] => {
  return spells.filter(spell => {
    // Проверка по классу
    if (spell.classes) {
      let matchesClass = false;
      
      if (Array.isArray(spell.classes)) {
        matchesClass = spell.classes.some(cls => 
          cls.toLowerCase() === characterClass.toLowerCase()
        );
      } else {
        matchesClass = spell.classes.toLowerCase() === characterClass.toLowerCase();
      }
      
      if (!matchesClass) return false;
    }
    
    // Проверка по уровню
    return spell.level <= maxLevel;
  });
};

/**
 * Определяет максимальный уровень заклинаний для персонажа
 * @param level Уровень персонажа
 * @returns Максимальный уровень заклинаний
 */
export const getMaxSpellLevel = (level: number): number => {
  if (level < 3) return 1;
  if (level < 5) return 2;
  if (level < 7) return 3;
  if (level < 9) return 4;
  if (level < 11) return 5;
  if (level < 13) return 6;
  if (level < 15) return 7;
  if (level < 17) return 8;
  return 9;
};

/**
 * Приводит заклинания персонажа к единому формату
 * @param character Персонаж
 * @returns Массив заклинаний в формате SpellData
 */
export const normalizeSpells = (character: Character): SpellData[] => {
  if (!character.spells || !Array.isArray(character.spells)) {
    return [];
  }
  
  return character.spells.map(spell => convertToSpellData(spell));
};

/**
 * Проверяет, добавлено ли заклинание в список
 * @param spellId ID заклинания
 * @param spells Список заклинаний
 * @returns true, если заклинание уже в списке
 */
export const isSpellAdded = (spellId: string, spells: SpellData[]): boolean => {
  return spells.some(spell => String(spell.id) === String(spellId));
};
