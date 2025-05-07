
import { Character, CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';
import { getAbilityModifier } from './abilityUtils';

// Функция для получения значения способности заклинаний для класса
export function getSpellcastingAbility(className: string): 'intelligence' | 'wisdom' | 'charisma' {
  // Определяем основную характеристику для заклинаний по классу
  switch (className?.toLowerCase()) {
    case 'волшебник':
    case 'wizard':
      return 'intelligence';
    case 'жрец':
    case 'друид':
    case 'следопыт':
    case 'cleric':
    case 'druid':
    case 'ranger':
      return 'wisdom';
    case 'бард':
    case 'чародей':
    case 'колдун':
    case 'паладин':
    case 'bard':
    case 'sorcerer':
    case 'warlock':
    case 'paladin':
      return 'charisma';
    default:
      return 'intelligence'; // По умолчанию используем интеллект
  }
}

// Получение модификатора способности для заклинаний
export function getSpellcastingAbilityModifier(character: Character): number {
  if (!character.class) return 0;
  
  const ability = getSpellcastingAbility(character.class);
  const score = character.abilities?.[ability] || 10;
  
  return getAbilityModifier(score);
}

// Конвертация CharacterSpell в SpellData
export function convertToSpellData(spell: string | CharacterSpell): SpellData {
  if (typeof spell === 'string') {
    // Базовая структура для строкового представления заклинания
    return {
      id: spell,
      name: spell,
      level: 0,
      school: '',
      castingTime: '',
      range: '',
      components: '',
      duration: '',
      description: '',
      classes: []
    };
  }
  
  return {
    id: spell.id || spell.name,
    name: spell.name,
    level: spell.level,
    school: spell.school || '',
    castingTime: spell.castingTime || '',
    range: spell.range || '',
    components: spell.components || '',
    duration: spell.duration || '',
    description: spell.description || '',
    classes: spell.classes || [],
    ritual: spell.ritual,
    concentration: spell.concentration
  };
}

// Функция для расчета доступных заклинаний по классу и уровню
export function calculateAvailableSpellsByClassAndLevel(
  className: string,
  level: number,
  abilityModifier: number
): { maxSpellLevel: number; cantripsCount: number; knownSpells: number; preparedSpells?: number } {
  // Значения по умолчанию
  let maxSpellLevel = 0;
  let cantripsCount = 0;
  let knownSpells = 0;
  let preparedSpells = 0;

  // Нормализуем имя класса
  const normalizedClassName = className?.toLowerCase();

  // Расчет для разных классов
  switch (normalizedClassName) {
    case 'бард':
    case 'bard':
      if (level >= 1) maxSpellLevel = Math.min(9, Math.ceil(level / 2));
      cantripsCount = level >= 1 ? 2 + Math.floor((level - 1) / 4) : 0;
      knownSpells = level >= 1 ? level + 3 + Math.floor(level / 2) : 0;
      break;
      
    case 'волшебник':
    case 'wizard':
      if (level >= 1) maxSpellLevel = Math.min(9, Math.ceil(level / 2));
      cantripsCount = level >= 1 ? 3 + Math.floor((level - 1) / 4) : 0;
      preparedSpells = level + abilityModifier;
      knownSpells = preparedSpells; // Волшебники могут знать любое количество заклинаний из своей книги
      break;
      
    case 'жрец':
    case 'cleric':
      if (level >= 1) maxSpellLevel = Math.min(9, Math.ceil(level / 2));
      cantripsCount = level >= 1 ? 3 + Math.floor((level - 1) / 4) : 0;
      preparedSpells = level + abilityModifier;
      knownSpells = preparedSpells;
      break;
      
    case 'друид':
    case 'druid':
      if (level >= 1) maxSpellLevel = Math.min(9, Math.ceil(level / 2));
      cantripsCount = level >= 1 ? 2 + Math.floor((level - 1) / 4) : 0;
      preparedSpells = level + abilityModifier;
      knownSpells = preparedSpells;
      break;
      
    case 'колдун':
    case 'warlock':
      maxSpellLevel = level >= 1 ? Math.min(5, Math.ceil(level / 2)) : 0;
      cantripsCount = level >= 1 ? 2 + Math.floor((level - 1) / 6) : 0;
      knownSpells = level >= 1 ? level + 1 + Math.floor((level - 1) / 2) : 0;
      break;
      
    case 'паладин':
    case 'paladin':
      if (level >= 2) maxSpellLevel = Math.min(5, Math.ceil((level - 1) / 2));
      preparedSpells = Math.floor(level / 2) + abilityModifier;
      knownSpells = preparedSpells;
      break;
      
    case 'следопыт':
    case 'ranger':
      if (level >= 2) maxSpellLevel = Math.min(5, Math.ceil((level - 1) / 2));
      knownSpells = Math.floor((level - 1) / 2) + 1;
      break;
      
    case 'чародей':
    case 'sorcerer':
      if (level >= 1) maxSpellLevel = Math.min(9, Math.ceil(level / 2));
      cantripsCount = level >= 1 ? 4 + Math.floor((level - 1) / 5) : 0;
      knownSpells = level >= 1 ? level + 1 + Math.floor(level / 2) : 0;
      break;
      
    default:
      // Для неизвестных классов
      break;
  }
  
  return { maxSpellLevel, cantripsCount, knownSpells, preparedSpells };
}

// Функция для фильтрации заклинаний по классу и уровню
export function filterSpellsByClassAndLevel(spells: SpellData[], className: string, maxLevel: number): SpellData[] {
  return spells.filter(spell => {
    // Проверяем класс
    const spellClasses = Array.isArray(spell.classes) ? spell.classes : [spell.classes];
    const matchesClass = spellClasses.some(c => c?.toLowerCase() === className?.toLowerCase());
    
    // Проверяем уровень
    const levelInRange = spell.level <= maxLevel;
    
    return matchesClass && levelInRange;
  });
}

// Получение максимального уровня заклинаний для персонажа
export function getMaxSpellLevel(character: Character): number {
  if (!character.class || !character.level) return 0;
  
  // Используем функцию расчета заклинаний
  const { maxSpellLevel } = calculateAvailableSpellsByClassAndLevel(
    character.class,
    character.level,
    getSpellcastingAbilityModifier(character)
  );
  
  return maxSpellLevel;
}
