import { SpellData } from '@/types/spells';
import { CharacterSpell } from '@/types/character';

/**
 * Получает название уровня заклинания
 */
export const getSpellLevelName = (level: number): string => {
  if (level === 0) {
    return 'Заговор';
  }
  
  return `${level}-й уровень`;
};

/**
 * Конвертирует заклинание персонажа (CharacterSpell) в SpellData
 */
export const convertCharacterSpellToSpellData = (spell: CharacterSpell | string): SpellData => {
  // Если spell это строка, создаем базовое заклинание
  if (typeof spell === 'string') {
    return {
      id: `spell-${spell.replace(/\s+/g, '-').toLowerCase()}`,
      name: spell,
      level: 0, // По умолчанию заговор
      school: 'Универсальная',
      castingTime: '1 действие',
      range: 'Касание',
      components: 'В, С',
      duration: 'Мгновенная',
      description: 'Описание отсутствует',
      ritual: false,
      concentration: false
    };
  }

  // Если spell это объект CharacterSpell
  return {
    id: spell.id || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: spell.name,
    level: spell.level || 0,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'Касание',
    components: spell.components || 'В, С',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || 'Описание отсутствует',
    classes: spell.classes || [],
    ritual: spell.ritual || false,
    concentration: spell.concentration || false
  };
};

/**
 * Конвертирует SpellData в CharacterSpell
 */
export const convertSpellDataToCharacterSpell = (spell: SpellData): CharacterSpell => {
  return {
    id: String(spell.id), // Преобразуем id в строку
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: spell.components,
    duration: spell.duration,
    description: spell.description,
    classes: spell.classes,
    ritual: spell.ritual || false,
    concentration: spell.concentration || false
  };
};

/**
 * Конвертирует массив заклинаний персонажа в массив SpellData
 */
export const convertCharacterSpellsToSpellData = (spells: (CharacterSpell | SpellData | string)[]): SpellData[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  return spells.map(spell => {
    // Если spell уже имеет формат SpellData
    if (typeof spell === 'object' && 'id' in spell && 'name' in spell && 'level' in spell && 'school' in spell) {
      const spellData = spell as SpellData;
      // Проверяем, что обязательные поля определены
      return {
        ...spellData,
        ritual: spellData.ritual || false,
        concentration: spellData.concentration || false
      };
    }
    
    // Если spell это CharacterSpell или строка
    return convertCharacterSpellToSpellData(spell as CharacterSpell | string);
  });
};

/**
 * Конвертирует строку или объект в SpellData (универсальный конвертер)
 */
export const convertToSpellData = (spell: string | CharacterSpell | SpellData | undefined): SpellData => {
  if (!spell) {
    return {
      id: 'unknown',
      name: 'Неизвестное заклинание',
      level: 0,
      school: 'Универсальная',
      castingTime: '1 действие',
      range: 'Касание',
      components: 'В, С',
      duration: 'Мгновенная',
      description: 'Описание отсутствует',
      ritual: false,
      concentration: false
    };
  }
  
  // Если это ��трока, создаем базовое заклинание
  if (typeof spell === 'string') {
    return convertCharacterSpellToSpellData(spell);
  }
  
  // Если это уже SpellData, возвращаем как есть
  if ('school' in spell) {
    const spellData = spell as SpellData;
    return {
      ...spellData,
      ritual: spellData.ritual || false,
      concentration: spellData.concentration || false
    };
  }
  
  // Иначе конвертируем из CharacterSpell
  return convertCharacterSpellToSpellData(spell as CharacterSpell);
};
