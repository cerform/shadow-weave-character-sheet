
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
export const convertCharacterSpellToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    // Обязательные поля для SpellData
    id: spell.id || String(Date.now()),
    name: spell.name,
    level: spell.level,
    school: spell.school || "Универсальная", // Дефолтное значение для обязательного поля
    castingTime: spell.castingTime || "1 действие", 
    range: spell.range || "На себя",
    components: spell.components || "В",
    duration: spell.duration || "Мгновенная",
    description: spell.description || "",
    
    // Опциональные поля
    prepared: spell.prepared,
    higherLevels: spell.higherLevels,
    ritual: spell.ritual,
    concentration: spell.concentration,
    // Убираем свойство source, которого нет в типе CharacterSpell
    material: spell.material,
    classes: spell.classes
  };
};

// Функция для обработки смешанного типа (строка или объект) при конвертации в SpellData
export const convertToSpellData = (spell: CharacterSpell | string): SpellData => {
  if (typeof spell === 'string') {
    return {
      id: String(Date.now()),
      name: spell,
      level: 0,
      school: "Неизвестная",
      castingTime: "1 действие",
      range: "На себя",
      components: "В",
      duration: "Мгновенная",
      description: ""
    };
  }
  return convertCharacterSpellToSpellData(spell);
};

// Функция конвертации из массива CharacterSpell в массив SpellData
export const convertCharacterSpellsToSpellData = (spells: (CharacterSpell | string)[]): SpellData[] => {
  return spells.map(spell => {
    if (isCharacterSpellObject(spell)) {
      return convertCharacterSpellToSpellData(spell);
    }
    // Если заклинание - строка, создаем базовый объект SpellData
    return {
      id: String(Date.now()),
      name: spell,
      level: 0,
      school: "Неизвестная",
      castingTime: "1 действие",
      range: "На себя",
      components: "В",
      duration: "Мгновенная",
      description: ""
    };
  });
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
