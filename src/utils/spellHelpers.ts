
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

export const isCharacterSpellObject = (spell: CharacterSpell | string): spell is CharacterSpell => {
  return typeof spell === 'object';
};

export const getSpellName = (spell: CharacterSpell | string): string => {
  if (typeof spell === 'string') return spell;
  return spell.name;
};

export const getSpellLevel = (spell: CharacterSpell | string): number => {
  if (typeof spell === 'string') return 0; // По умолчанию заговор
  return spell.level;
};

export const getSpellSchool = (spell: CharacterSpell | string): string => {
  if (typeof spell === 'string') return "Неизвестная";
  return spell.school || "Неизвестная";
};

export const isSpellPrepared = (spell: CharacterSpell | string): boolean => {
  if (typeof spell === 'string') return false;
  return spell.prepared || false;
};

export const toggleSpellPrepared = (spell: CharacterSpell | string): CharacterSpell => {
  if (typeof spell === 'string') {
    return {
      name: spell,
      level: 0,
      prepared: true,
      school: 'Неизвестная', // Добавляем обязательное поле school
      castingTime: '1 действие',
      range: 'Неизвестная',
      components: '',
      duration: 'Мгновенная',
      description: ''
    };
  }
  
  return {
    ...spell,
    prepared: !spell.prepared,
    school: spell.school || 'Неизвестная' // Убедимся, что school всегда определена
  };
};

export const getSpellsByLevel = (spells: (CharacterSpell | string)[], level: number): (CharacterSpell | string)[] => {
  return spells.filter(spell => {
    if (typeof spell === 'string') {
      return level === 0; // Строковые заклинания считаются заговорами
    }
    return spell.level === level;
  });
};

// Функция конвертации из CharacterSpell в SpellData
export const convertCharacterSpellToSpellData = (characterSpell: CharacterSpell | string): SpellData => {
  if (typeof characterSpell === 'string') {
    return {
      name: characterSpell,
      level: 0,
      school: "Неизвестная", // Обязательное поле в SpellData
      castingTime: "1 действие",
      range: "Неизвестная",
      components: "",
      duration: "Мгновенная",
      description: ""
    };
  }
  
  return {
    ...characterSpell,
    school: characterSpell.school || "Неизвестная", // Обязательное поле в SpellData
    castingTime: characterSpell.castingTime || "1 действие",
    range: characterSpell.range || "Неизвестная",
    components: characterSpell.components || "",
    duration: characterSpell.duration || "Мгновенная",
    description: characterSpell.description || ""
  };
};

// Функция конвертации из SpellData в CharacterSpell
export const convertSpellDataToCharacterSpell = (spellData: SpellData): CharacterSpell => {
  return {
    ...spellData,
    ritual: spellData.isRitual || spellData.ritual,
    concentration: spellData.isConcentration || spellData.concentration,
    higherLevels: spellData.higherLevel || spellData.higherLevels,
    description: typeof spellData.description === 'string' ? 
                spellData.description : 
                Array.isArray(spellData.description) ?
                spellData.description.join('\n') : ''
  };
};
