
import { Character, CharacterSpell } from '@/types/character';
import { SpellData, convertCharacterSpellToSpellData } from '@/types/spells';

// Проверяет, может ли персонаж подготовить больше заклинаний
export const canPrepareMoreSpells = (character: Character): boolean => {
  if (!character || !character.spells) return false;
  
  // Получаем лимит подготовленных заклинаний
  const limit = getPreparedSpellsLimit(character);
  
  // Подсчитываем уже подготовленные заклинания
  const preparedCount = character.spells.filter(spell => {
    if (typeof spell === 'string') return false; // Строки-заклинания считаем заговорами
    return spell.prepared && spell.level > 0; // Учитываем только подготовленные заклинания не-заговоры
  }).length;
  
  return preparedCount < limit;
};

// Получает лимит подготовленных заклинаний для персонажа
export const getPreparedSpellsLimit = (character: Character): number => {
  if (!character || !character.abilities) return 0;
  
  const classLower = character?.class?.toLowerCase() || '';
  let abilityMod = 0;
  
  // Определяем модификатор характеристики в зависимости от класса
  if (['жрец', 'друид', 'cleric', 'druid'].includes(classLower)) {
    // Мудрость
    const wisdom = character.abilities?.wisdom || character.abilities?.WIS || 10;
    abilityMod = Math.floor((wisdom - 10) / 2);
  } else if (['волшебник', 'маг', 'wizard'].includes(classLower)) {
    // Интеллект
    const intelligence = character.abilities?.intelligence || character.abilities?.INT || 10;
    abilityMod = Math.floor((intelligence - 10) / 2);
  } else if (['паладин', 'paladin'].includes(classLower)) {
    // Харизма для паладинов
    const charisma = character.abilities?.charisma || character.abilities?.CHA || 10;
    abilityMod = Math.floor((charisma - 10) / 2);
  }
  
  // Формула: уровень персонажа + модификатор характеристики
  return character.level + abilityMod;
};

// Нормализует массив заклинаний, преобразуя строки в CharacterSpell
export const normalizeSpells = (spells: (string | CharacterSpell)[]): CharacterSpell[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  return spells.map(spell => {
    if (typeof spell === 'string') {
      // Если заклинание представлено строкой, конвертируем его в объект заклинания (заговор)
      return {
        name: spell,
        level: 0, // Заговор
        prepared: true // Заговоры всегда подготовлены
      };
    }
    return spell;
  });
};

// Конвертирует CharacterSpell в SpellData для компонентов, которые ожидают этот формат
export const convertToSpellData = (spells: CharacterSpell[]): SpellData[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  return spells.map(spell => {
    const id = spell.id || `spell-${Math.random().toString(36).substring(2, 11)}`;
    
    return {
      id,
      name: spell.name,
      level: spell.level,
      school: spell.school || 'Универсальная',
      castingTime: spell.castingTime || '1 действие',
      range: spell.range || 'Касание',
      components: spell.components || '',
      duration: spell.duration || 'Мгновенная',
      description: spell.description || '',
      classes: spell.classes || [],
      source: spell.source || '',
      ritual: spell.ritual || false,
      concentration: spell.concentration || false,
      verbal: spell.verbal || false,
      somatic: spell.somatic || false,
      material: spell.material || false,
      prepared: spell.prepared || false,
      higherLevel: spell.higherLevel || '',
      higherLevels: spell.higherLevels || '',
      materials: spell.materials || ''
    };
  });
};

export const convertCharacterSpellsToSpellData = (character: Character): SpellData[] => {
  if (!character || !character.spells) return [];
  
  // Нормализуем заклинания персонажа
  const normalizedSpells = normalizeSpells(character.spells || []);
  
  // Конвертируем в формат SpellData
  return convertToSpellData(normalizedSpells);
};

// Import getSpellLevelName from types/spells
export { getSpellLevelName } from '@/types/spells';

// Helper function to check if a spell is a CharacterSpell object or just a string
export const isCharacterSpellObject = (spell: string | CharacterSpell): spell is CharacterSpell => {
  return typeof spell !== 'string';
};

// Helper function to get spell level safely
export const getSpellLevel = (spell: string | CharacterSpell): number => {
  if (typeof spell === 'string') return 0; // Strings are considered cantrips
  return spell.level || 0;
};

// Helper function to check if a spell is prepared
export const isSpellPrepared = (spell: string | CharacterSpell): boolean => {
  if (typeof spell === 'string') return true; // String spells are always considered prepared
  return spell.prepared || false;
};
