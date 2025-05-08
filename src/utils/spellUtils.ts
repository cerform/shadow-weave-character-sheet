
import { Character, CharacterSpell } from '@/types/character';
import { safeGet } from './safetyUtils';
import { getAbilityModifier } from './abilityUtils';

/**
 * Тип SpellData для компонента отображения заклинаний
 */
export interface SpellData {
  id: string | number;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  prepared?: boolean;
  ritual?: boolean;
  concentration?: boolean;
  source?: string;
  classes?: string[];
}

/**
 * Преобразует список заклинаний персонажа в нормализованный формат
 */
export function normalizeSpells(character: Character): CharacterSpell[] {
  if (!character.spells || !Array.isArray(character.spells)) {
    return [];
  }

  return character.spells.map(spell => {
    // Если заклинание - строка, преобразуем его в объект минимального формата
    if (typeof spell === 'string') {
      return {
        id: spell,
        name: spell,
        level: 0,
        school: 'Универсальная',
        castingTime: 'Действие',
        range: '60 футов',
        components: 'В',
        duration: 'Мгновенная',
        description: 'Нет подробного описания'
      };
    }

    // Если заклинание уже в виде объекта, возвращаем как есть
    return {
      ...spell,
      id: spell.id || spell.name,
    };
  });
}

/**
 * Проверяет, может ли персонаж подготовить еще заклинания
 */
export function canPrepareMoreSpells(character?: Character): boolean {
  if (!character || !needsPreparation(character)) return true;

  const preparedLimit = getPreparedSpellsLimit(character);
  const preparedCount = character.spells
    ? character.spells.filter(spell => 
        typeof spell !== 'string' && spell.prepared && spell.level > 0
      ).length
    : 0;

  return preparedCount < preparedLimit;
}

/**
 * Проверяет, должен ли класс персонажа готовить заклинания
 */
export function needsPreparation(character?: Character): boolean {
  if (!character || !character.class) return false;

  const preparingClasses = [
    'жрец', 'друид', 'волшебник', 'cleric', 'druid', 'wizard', 
    'паладин', 'paladin', 'следопыт', 'ranger', 'изобретатель', 'artificer'
  ];

  return preparingClasses.includes(character.class.toLowerCase());
}

/**
 * Определяет лимит подготовленных заклинаний для персонажа
 */
export function getPreparedSpellsLimit(character?: Character): number {
  if (!character) return 0;

  // Получаем модификатор базовой характеристики для заклинаний
  const spellcastingAbility = getSpellcastingAbility(character);
  let abilityScore = 0;

  if (spellcastingAbility) {
    abilityScore = safeGet(character, `stats.${spellcastingAbility}`, 10);
  }

  const abilityMod = Math.floor((abilityScore - 10) / 2);
  const characterLevel = character.level || 1;

  // Вычисляем лимит по формуле: модификатор + уровень
  return Math.max(1, abilityMod + characterLevel);
}

/**
 * Определяет базовую характеристику для заклинаний в зависимости от класса
 */
export function getSpellcastingAbility(character?: Character): string {
  if (!character || !character.class) return 'intelligence';

  const characterClass = character.class.toLowerCase();
  
  if (['бард', 'bard', 'чародей', 'sorcerer', 'колдун', 'warlock'].includes(characterClass)) {
    return 'charisma';
  } else if (['жрец', 'cleric', 'друид', 'druid', 'следопыт', 'ranger'].includes(characterClass)) {
    return 'wisdom';
  } else {
    return 'intelligence'; // Волшебник, Мистический рыцарь, Плут (Ловкач), Изобретатель
  }
}

/**
 * Преобразует CharacterSpell в SpellData
 */
export function convertToSpellData(spell: CharacterSpell): SpellData {
  return {
    id: spell.id || spell.name,
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || 'Действие',
    range: spell.range || '60 футов',
    components: spell.components || 'В',
    duration: spell.duration || 'Мгновенная',
    description: Array.isArray(spell.description) ? spell.description.join('\n') : (spell.description || ''),
    prepared: spell.prepared,
    ritual: spell.ritual,
    concentration: spell.concentration,
    source: spell.source,
    classes: Array.isArray(spell.classes) ? spell.classes : spell.classes ? [spell.classes] : []
  };
}

/**
 * Получает модификатор способности заклинаний для персонажа
 */
export function getSpellcastingAbilityModifier(character: Character): number {
  if (!character) return 0;
  
  const ability = getSpellcastingAbility(character);
  return getAbilityModifier(character, ability);
}

/**
 * Вычисляет максимальный уровень заклинаний для класса и уровня персонажа
 */
export function getMaxSpellLevel(characterClass: string, level: number): number {
  if (!characterClass || !level) return 0;
  
  // Базовый расчет: уровень персонажа / 2, округленный вверх
  const baseMaxLevel = Math.ceil(level / 2);
  
  // Корректировка для классов с особенностями
  const classLower = characterClass.toLowerCase();
  
  if (['паладин', 'paladin', 'следопыт', 'ranger'].includes(classLower)) {
    // Паладины и следопыты начинают с уровня 2 и имеют заклинания макс 5 уровня
    if (level < 2) return 0;
    return Math.min(Math.ceil((level - 1) / 2), 5);
  } 
  
  // Для остальных классов
  return Math.min(baseMaxLevel, 9); // Максимальный уровень заклинаний - 9
}

/**
 * Рассчитывает количество известных заклинаний в зависимости от класса и уровня
 */
export function calculateAvailableSpellsByClassAndLevel(
  characterClass: string,
  characterLevel: number,
  abilityModifier: number = 0
): { maxSpellLevel: number; cantripsCount: number; knownSpells: number } {
  // Базовые значения
  let cantripsCount = 0;
  let knownSpells = 0;
  
  const classLower = characterClass.toLowerCase();
  const maxSpellLevel = getMaxSpellLevel(classLower, characterLevel);
  
  switch (classLower) {
    case 'бард':
    case 'bard':
      // Барды: заговоры 2-5, известные заклинания 4-22
      cantripsCount = Math.min(2 + Math.floor((characterLevel - 1) / 4), 5);
      knownSpells = characterLevel === 1 ? 4 : Math.min(3 + characterLevel, 22);
      break;
    
    case 'жрец':
    case 'cleric':
    case 'друид':
    case 'druid':
      // Жрецы и друиды: заговоры 3-5, известные заклинания = уровень + модификатор
      cantripsCount = Math.min(3 + Math.floor((characterLevel - 1) / 4), 5);
      knownSpells = characterLevel + abilityModifier;
      break;
    
    case 'паладин':
    case 'paladin':
      // Паладины: нет заговоров, известные заклинания = уровень / 2 + модификатор
      cantripsCount = 0;
      knownSpells = characterLevel >= 2 ? Math.floor(characterLevel / 2) + abilityModifier : 0;
      break;
    
    case 'следопыт':
    case 'ranger':
      // Следопыты: нет заговоров, известные заклинания см. таблицу
      cantripsCount = 0;
      if (characterLevel >= 2) {
        knownSpells = Math.min(2 + Math.floor((characterLevel - 2) / 2), 11);
      }
      break;
    
    case 'чародей':
    case 'sorcerer':
      // Чародеи: заговоры 4-6, известные заклинания 2-15
      cantripsCount = Math.min(4 + Math.floor((characterLevel - 1) / 4), 6);
      knownSpells = characterLevel === 1 ? 2 : Math.min(2 + characterLevel, 15);
      break;
    
    case 'колдун':
    case 'warlock':
      // Колдуны: заговоры 2-4, известные заклинания 2-15
      cantripsCount = Math.min(2 + Math.floor((characterLevel - 1) / 6), 4);
      knownSpells = characterLevel === 1 ? 2 : Math.min(1 + characterLevel, 15);
      break;
    
    case 'волшебник':
    case 'wizard':
      // Волшебники: заговоры 3-5, книга заклинаний 6 + 2 на уровень
      cantripsCount = Math.min(3 + Math.floor((characterLevel - 1) / 4), 5);
      knownSpells = 6 + (characterLevel - 1) * 2; // Минимум в книге заклинаний
      break;
      
    default:
      // Для неизвестных классов
      cantripsCount = 0;
      knownSpells = 0;
  }
  
  return {
    maxSpellLevel,
    cantripsCount,
    knownSpells: Math.max(0, knownSpells)
  };
}

/**
 * Фильтрует заклинания по классу и уровню персонажа
 */
export function filterSpellsByClassAndLevel(
  spells: SpellData[],
  characterClass: string,
  characterLevel: number
): SpellData[] {
  if (!spells || !characterClass) return [];
  
  const classLower = characterClass.toLowerCase();
  const maxSpellLevel = getMaxSpellLevel(classLower, characterLevel);
  
  return spells.filter(spell => {
    // Проверяем уровень заклинания
    if (spell.level > maxSpellLevel) return false;
    
    // Проверяем соответствие классу
    if (!spell.classes) return false;
    
    const spellClasses = Array.isArray(spell.classes)
      ? spell.classes.map(c => c.toLowerCase())
      : [spell.classes.toLowerCase()];
    
    // Соответствия классов (русские и английские названия)
    const matchingClasses: Record<string, string[]> = {
      'жрец': ['жрец', 'cleric'],
      'друид': ['друид', 'druid'],
      'волшебник': ['волшебник', 'wizard'],
      'бард': ['бард', 'bard'],
      'колдун': ['колдун', 'warlock'],
      'чародей': ['чародей', 'sorcerer'],
      'паладин': ['паладин', 'paladin'],
      'следопыт': ['следопыт', 'ranger']
    };
    
    const validClasses = matchingClasses[classLower] || [classLower];
    
    return spellClasses.some(cls => validClasses.includes(cls));
  });
}

/**
 * Преобразует заклинания для сохранения в состоянии персонажа
 */
export function convertSpellsForState(spells: SpellData[]): CharacterSpell[] {
  return spells.map(spell => ({
    id: spell.id,
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: spell.components,
    duration: spell.duration,
    description: Array.isArray(spell.description) ? spell.description.join('\n') : spell.description,
    prepared: spell.prepared,
    ritual: spell.ritual,
    concentration: spell.concentration,
    classes: spell.classes
  }));
}
