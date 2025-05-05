

import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

// Нормализация массива заклинаний
export const normalizeSpells = (spells: any[]): CharacterSpell[] => {
  return spells.map(spell => {
    if (typeof spell === 'string') {
      // Если заклинание представлено строкой, преобразуем его в объект
      return {
        name: spell,
        level: 0 // По умолчанию считаем заговором
      };
    } else if (typeof spell === 'object') {
      // Если заклинание уже является объектом, возвращаем его как есть
      return spell;
    } else {
      // Этого случая быть не должно, но на всякий случай
      return {
        name: String(spell),
        level: 0
      };
    }
  });
};

// Преобразование CharacterSpell в SpellData
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id,
    name: spell.name,
    level: spell.level || 0,
    school: spell.school || 'Универсальная', // Добавляем значение по умолчанию
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || '60 футов',
    components: spell.components || 'В, С',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || 'Нет описания',
    classes: spell.classes || [],
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    verbal: spell.verbal || false,
    somatic: spell.somatic || false,
    material: spell.material || false,
    prepared: spell.prepared || false
  };
};

// Массовое преобразование массива заклинаний в SpellData
export const convertToSpellDataArray = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(spell => convertToSpellData(spell));
};

// Функция для определения, является ли заклинание заговором или заклинанием определённого уровня
export const getSpellLevel = (spell: any): number => {
  if (typeof spell === 'object' && spell !== null) {
    return spell.level || 0;
  }
  return 0; // По умолчанию считаем заговором
};

// Получение максимального уровня заклинаний для класса и уровня персонажа
export const getMaxSpellLevel = (characterClass: string, characterLevel: number): number => {
  // Упрощенная логика для D&D 5e
  if (characterLevel < 3) return 1;
  if (characterLevel < 5) return 2;
  if (characterLevel < 7) return 3;
  if (characterLevel < 9) return 4;
  if (characterLevel < 11) return 5;
  if (characterLevel < 13) return 6;
  if (characterLevel < 15) return 7;
  if (characterLevel < 17) return 8;
  return 9;
};

// Расчет доступного количества заклинаний для класса и уровня
export const calculateKnownSpells = (characterClass: string, characterLevel: number, abilities?: any): { cantrips: number, spells: number } => {
  // Заговоры и заклинания по умолчанию
  let cantrips = 0;
  let spells = 0;

  // В зависимости от класса
  switch (characterClass.toLowerCase()) {
    case 'бард':
      cantrips = 2;
      spells = characterLevel + 2; // Для барда: уровень + модификатор харизмы
      break;
    case 'волшебник':
      cantrips = characterLevel <= 3 ? 3 : characterLevel <= 9 ? 4 : 5;
      spells = 6 + (characterLevel * 2); // Для волшебника: базовые + на каждый уровень
      break;
    case 'друид':
    case 'жрец':
      cantrips = characterLevel <= 3 ? 3 : characterLevel <= 9 ? 4 : 5;
      spells = characterLevel + (abilities?.wisdom ? Math.floor((abilities.wisdom - 10) / 2) : 0);
      spells = Math.max(1, spells); // Минимум 1 заклинание
      break;
    case 'колдун':
      cantrips = characterLevel <= 9 ? 2 : 3;
      spells = characterLevel + 1;
      break;
    case 'паладин':
    case 'следопыт':
      cantrips = 0; // У паладинов и следопытов нет заговоров
      spells = Math.floor(characterLevel / 2) + (abilities?.wisdom ? Math.floor((abilities.wisdom - 10) / 2) : 0);
      spells = Math.max(1, spells);
      break;
    case 'чародей':
      cantrips = characterLevel <= 3 ? 4 : characterLevel <= 9 ? 5 : 6;
      spells = 1 + characterLevel;
      break;
    default:
      // Для других классов минимальные значения
      cantrips = 0;
      spells = 0;
  }

  return { cantrips, spells };
};

// Проверка, подготовлено ли заклинание
export const isSpellPrepared = (spell: any): boolean => {
  if (typeof spell === 'object' && spell !== null) {
    return !!spell.prepared;
  }
  return false; // По умолчанию заклинание не подготовлено
};

// Проверка, является ли значение объектом CharacterSpell
export const isCharacterSpellObject = (spell: any): spell is CharacterSpell => {
  return typeof spell === 'object' && spell !== null && 'name' in spell;
};

