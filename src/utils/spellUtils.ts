
// Вспомогательные функции для работы с заклинаниями
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';
import { convertCharacterSpellToSpellData } from '@/types/spells';

// Получить максимальный уровень заклинаний для заданного уровня персонажа
export const getMaxSpellLevel = (level: number): number => {
  if (level <= 0) return 0;
  if (level <= 2) return 1;
  if (level <= 4) return 2;
  if (level <= 6) return 3;
  if (level <= 8) return 4;
  if (level <= 10) return 5;
  if (level <= 12) return 6;
  if (level <= 14) return 7;
  if (level <= 16) return 8;
  return 9;
};

// Нормализация списка заклинаний (преобразование строковых и объектных представлений)
export const normalizeSpells = (spells: (CharacterSpell | string)[]): CharacterSpell[] => {
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return { name: spell, level: 0 };
    }
    return spell;
  });
};

// Преобразование заклинания в SpellData
export const convertToSpellData = (spell: CharacterSpell | string): SpellData => {
  if (typeof spell === 'string') {
    return {
      name: spell,
      level: 0,
      school: 'Универсальная',
      castingTime: '1 действие',
      range: 'На себя',
      components: 'В, С',
      duration: 'Мгновенная',
      description: 'Не указано'
    };
  }
  return convertCharacterSpellToSpellData(spell);
};

// Преобразование массива заклинаний в SpellData[]
export const convertToSpellDataArray = (spells: (CharacterSpell | string)[]): SpellData[] => {
  return spells.map(spell => convertToSpellData(spell));
};

// Расчет количества известных заклинаний для разных классов
export const calculateKnownSpells = (
  className: string, 
  level: number,
  abilityModifier: number = 0
): { cantrips: number; spells: number } => {
  let cantrips = 0;
  let spells = 0;
  
  // Для simplicity, используем базовые значения
  switch(className.toLowerCase()) {
    case 'бард':
    case 'bard':
      cantrips = level === 1 ? 2 : (level < 10 ? 3 : 4);
      spells = Math.min(level + 3, 22); // Максимум 22 известных заклинания
      break;
    case 'жрец':
    case 'cleric':
      cantrips = level < 4 ? 3 : (level < 10 ? 4 : 5);
      spells = level + abilityModifier;
      break;
    case 'друид':
    case 'druid':
      cantrips = level < 4 ? 2 : (level < 10 ? 3 : 4);
      spells = level + abilityModifier;
      break;
    case 'волшебник':
    case 'wizard':
      cantrips = level < 4 ? 3 : (level < 10 ? 4 : 5);
      spells = 2 * level + abilityModifier; // Волшебники записывают заклинания в книгу
      break;
    case 'колдун':
    case 'warlock':
      cantrips = level < 4 ? 2 : (level < 10 ? 3 : 4);
      spells = Math.min(level + 1, 15); // Максимум 15 известных заклинаний
      break;
    case 'чародей':
    case 'sorcerer':
      cantrips = level < 4 ? 4 : (level < 10 ? 5 : 6);
      spells = level + 1;
      break;
    case 'паладин':
    case 'paladin':
      cantrips = 0; // У паладинов нет заговоров
      spells = Math.floor(level / 2) + abilityModifier;
      break;
    case 'следопыт':
    case 'ranger':
      cantrips = 0; // В базовых правилах у следопытов нет заговоров
      spells = Math.floor(level / 2) + abilityModifier;
      break;
    default:
      cantrips = 0;
      spells = 0;
  }
  
  // Минимум один подготовленный спелл для классов с подготовкой
  if (['жрец', 'cleric', 'друид', 'druid', 'волшебник', 'wizard', 'паладин', 'paladin', 'следопыт', 'ranger'].includes(className.toLowerCase())) {
    spells = Math.max(1, spells);
  }
  
  return { cantrips, spells };
};
