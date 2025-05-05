
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

// Преобразование заклинаний в единый формат
export const normalizeSpells = (spells: any[]): CharacterSpell[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return { name: spell, level: 0 };
    }
    return spell;
  });
};

// Расчет модификатора заклинаний на основе класса и характеристик
export const calculateSpellModifier = (
  characterClass: string,
  intelligence: number,
  wisdom: number,
  charisma: number
): number => {
  if (!characterClass) return 0;
  
  const getModifier = (score: number) => Math.floor((score - 10) / 2);
  
  const classLower = characterClass.toLowerCase();
  
  if (classLower === 'wizard' || classLower === 'волшебник') {
    return getModifier(intelligence);
  } else if (classLower === 'cleric' || classLower === 'жрец' || 
             classLower === 'druid' || classLower === 'друид' || 
             classLower === 'ranger' || classLower === 'следопыт') {
    return getModifier(wisdom);
  } else if (classLower === 'bard' || classLower === 'бард' || 
             classLower === 'sorcerer' || classLower === 'чародей' || 
             classLower === 'warlock' || classLower === 'колдун' || 
             classLower === 'paladin' || classLower === 'паладин') {
    return getModifier(charisma);
  }
  
  return 0;
};

// Получение текущего уровня заклинаний на основе уровня персонажа
export const getSpellLevel = (characterLevel: number): number => {
  if (characterLevel < 1) return 0;
  if (characterLevel <= 2) return 1;
  if (characterLevel <= 4) return 2;
  if (characterLevel <= 6) return 3;
  if (characterLevel <= 8) return 4;
  if (characterLevel <= 10) return 5;
  if (characterLevel <= 12) return 6;
  if (characterLevel <= 14) return 7;
  if (characterLevel <= 16) return 8;
  return 9;
};

// Конвертация CharacterSpell в SpellData
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    name: spell.name,
    level: spell.level || 0,
    school: spell.school || 'Воплощение', // Предоставляем значение по умолчанию
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || 'В',
    duration: spell.duration || 'Мгновенно',
    description: spell.description || 'Описание отсутствует',
    prepared: spell.prepared || false
  };
};

// Экспортируем alias для совместимости
export const getMaxSpellLevel = getSpellLevel;
export const convertToSpellDataArray = normalizeSpells;
