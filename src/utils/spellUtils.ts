
import { Character, CharacterSpell } from "@/types/character";
import { SpellData } from "@/types/spells";

// Нормализация списка заклинаний персонажа (преобразование строк в объекты)
export const normalizeSpells = (character: Character): CharacterSpell[] => {
  if (!character.spells || !Array.isArray(character.spells)) return [];
  
  return character.spells.map(spell => {
    // Если заклинание уже является объектом, просто возвращаем его
    if (typeof spell !== 'string') return spell;
    
    // Иначе создаем минимальный объект заклинания
    return {
      name: spell,
      level: 0, // По умолчанию считаем заговором
      prepared: true
    };
  });
};

// Преобразование CharacterSpell в SpellData для отображения
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'Касание',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: Array.isArray(spell.classes) ? spell.classes : (spell.classes ? [spell.classes] : [])
  };
};

// Расчет доступных заклинаний по классу и уровню персонажа
export const calculateAvailableSpellsByClassAndLevel = (characterClass: string, level: number, abilityModifier = 0) => {
  const lowerClass = characterClass.toLowerCase();
  
  // Максимальный уровень заклинаний
  let maxSpellLevel = 0;
  // Количество известных заговоров
  let cantripsCount = 0;
  // Количество известных или подготовленных заклинаний
  let knownSpells = 0;
  
  // Определение максимального уровня заклинаний и количества известных заклинаний
  // в зависимости от класса и уровня персонажа
  switch (lowerClass) {
    case 'волшебник':
    case 'маг':
      maxSpellLevel = Math.min(9, Math.ceil(level / 2));
      cantripsCount = level < 4 ? 3 : (level < 10 ? 4 : 5);
      knownSpells = level + abilityModifier; // Уровень + модификатор Интеллекта
      break;
      
    case 'жрец':
    case 'друид':
      maxSpellLevel = Math.min(9, Math.ceil(level / 2));
      cantripsCount = level < 4 ? 3 : (level < 10 ? 4 : 5);
      knownSpells = level + abilityModifier; // Уровень + модификатор Мудрости
      break;
      
    case 'бард':
      maxSpellLevel = Math.min(9, Math.ceil(level / 2));
      cantripsCount = level < 4 ? 2 : (level < 10 ? 3 : 4);
      // Количество известных заклинаний для барда
      knownSpells = level === 1 ? 4 : 3 + level;
      break;
      
    case 'чародей':
      maxSpellLevel = Math.min(9, Math.ceil(level / 2));
      cantripsCount = level < 4 ? 4 : (level < 10 ? 5 : 6);
      // Количество известных заклинаний для чародея
      knownSpells = level === 1 ? 2 : 3 + (level - 1);
      break;
      
    case 'колдун':
      maxSpellLevel = Math.min(5, Math.ceil(level / 2));
      cantripsCount = level < 4 ? 2 : (level < 10 ? 3 : 4);
      // Количество известных заклинаний для колдуна
      knownSpells = level === 1 ? 2 : 3 + (level - 1);
      break;
      
    case 'паладин':
    case 'следопыт':
      maxSpellLevel = Math.min(5, Math.ceil((level - 1) / 4)); // Начинает с 2го уровня
      cantripsCount = 0; // У этих классов нет заговоров
      knownSpells = level < 2 ? 0 : Math.ceil(level / 2) + abilityModifier;
      break;
      
    default:
      maxSpellLevel = 0;
      cantripsCount = 0;
      knownSpells = 0;
  }
  
  return {
    maxSpellLevel,
    cantripsCount,
    knownSpells
  };
};

// Получение максимального уровня заклинаний для класса и уровня
export const getMaxSpellLevel = (characterClass: string, level: number): number => {
  const { maxSpellLevel } = calculateAvailableSpellsByClassAndLevel(characterClass, level);
  return maxSpellLevel;
};
