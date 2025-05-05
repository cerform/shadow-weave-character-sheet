
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

// Функция для преобразования CharacterSpell в SpellData
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    ...spell,
    school: spell.school || 'Воплощение', // Use default school if not provided
    level: spell.level || 0,
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || 'В',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    higherLevels: spell.higherLevels || ''
  };
};

// Функция для преобразования массива CharacterSpell в массив SpellData
export const convertToSpellDataArray = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(convertToSpellData);
};

// Функция для расчета количества известных заклинаний по классу и уровню
export const calculateKnownSpells = (characterClass: string, level: number): { knownSpells: number, cantripsKnown: number } => {
  let knownSpells = 0;
  let cantripsKnown = 0;

  switch (characterClass.toLowerCase()) {
    case 'бард':
      cantripsKnown = 2;
      if (level >= 4) cantripsKnown = 3;
      if (level >= 10) cantripsKnown = 4;

      knownSpells = level + 3;
      break;
    case 'волшебник':
      cantripsKnown = 3;
      if (level >= 4) cantripsKnown = 4;
      if (level >= 10) cantripsKnown = 5;
      
      // Волшебники используют книгу заклинаний
      knownSpells = 6 + (level * 2); // Примерно 
      break;
    case 'жрец':
    case 'друид':
      cantripsKnown = 3;
      if (level >= 4) cantripsKnown = 4;
      if (level >= 10) cantripsKnown = 5;
      
      // Жрецы и друиды знают все заклинания своего класса, 
      // но готовят уровень + мод. мудрости
      knownSpells = level + 1; // Предполагаем модификатор мудрости +1
      break;
    case 'колдун':
      cantripsKnown = 2;
      if (level >= 4) cantripsKnown = 3;
      if (level >= 10) cantripsKnown = 4;
      
      if (level === 1) knownSpells = 2;
      else if (level === 2) knownSpells = 3;
      else if (level <= 5) knownSpells = 4;
      else if (level <= 7) knownSpells = 5;
      else if (level <= 9) knownSpells = 6;
      else if (level <= 11) knownSpells = 7;
      else if (level <= 13) knownSpells = 8;
      else if (level <= 15) knownSpells = 9;
      else if (level <= 17) knownSpells = 10;
      else knownSpells = 11;
      break;
    case 'паладин':
    case 'следопыт':
      cantripsKnown = 0; // Нет заговоров
      
      // Паладины и следопыты готовят (уровень / 2) + модификатор хар-ки
      knownSpells = Math.floor(level / 2) + 1; // Предполагаем модификатор +1
      break;
    case 'чародей':
      cantripsKnown = 4;
      if (level >= 4) cantripsKnown = 5;
      if (level >= 10) cantripsKnown = 6;
      
      if (level === 1) knownSpells = 2;
      else if (level === 2) knownSpells = 3;
      else if (level === 3) knownSpells = 4;
      else if (level <= 6) knownSpells = 5;
      else if (level <= 8) knownSpells = 6;
      else if (level <= 10) knownSpells = 7;
      else if (level <= 12) knownSpells = 8;
      else if (level <= 14) knownSpells = 9;
      else if (level <= 16) knownSpells = 10;
      else if (level <= 18) knownSpells = 11;
      else knownSpells = 12;
      break;
    default:
      cantripsKnown = 0;
      knownSpells = 0;
  }

  return { knownSpells, cantripsKnown };
};

// Функция для получения максимального уровня заклинаний по уровню персонажа
export const getMaxSpellLevel = (characterClass: string, level: number): number => {
  // Полные заклинатели (волшебник, жрец, друид, бард)
  const fullCasterTable = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 9, 9];
  
  // Полу-заклинатели (паладин, следопыт)
  const halfCasterTable = [0, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 5];
  
  // Особый случай (колдун)
  const warlockTable = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
  
  const casterClass = characterClass.toLowerCase();
  
  if (level < 1) return 0;
  
  if (casterClass === 'колдун') {
    return warlockTable[Math.min(level - 1, 19)];
  } else if (casterClass === 'паладин' || casterClass === 'следопыт') {
    return halfCasterTable[Math.min(level - 1, 19)];
  } else if (['волшебник', 'жрец', 'друид', 'бард', 'чародей'].includes(casterClass)) {
    return fullCasterTable[Math.min(level - 1, 19)];
  }
  
  return 0;
};

// Функция для получения уровня заклинания
export const getSpellLevel = (level: number): string => {
  if (level === 0) return 'Заговор';
  return `${level}-й уровень`;
};
