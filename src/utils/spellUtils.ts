
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

/**
 * Безопасное преобразование массива или строки в строку
 */
export const safeJoin = (value: string[] | string | undefined, separator: string = ', '): string => {
  if (!value) return '';
  if (Array.isArray(value)) return value.join(separator);
  return value.toString();
};

/**
 * Нормализует массив заклинаний, преобразуя строки в объекты CharacterSpell
 */
export const normalizeSpells = (spells: (CharacterSpell | string)[] | undefined): CharacterSpell[] => {
  if (!spells) return [];
  
  return spells.map(spell => {
    if (typeof spell === 'string') {
      // Создаем базовый объект CharacterSpell из строки
      return {
        id: `spell-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: spell,
        level: 0, // По умолчанию заговор
        description: '',
        // Добавляем другие обязательные поля с дефолтными значениями
        school: 'Универсальная',
        castingTime: '1 действие',
        range: 'Касание',
        components: '',
        duration: 'Мгновенная',
        prepared: false,
        ritual: false,
        concentration: false,
        verbal: false,
        somatic: false,
        material: false,
      };
    }
    
    // Обеспечиваем наличие всех обязательных полей
    return {
      ...spell,
      id: spell.id || `spell-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      school: spell.school || 'Универсальная',
      castingTime: spell.castingTime || '1 действие',
      range: spell.range || 'Касание',
      components: spell.components || '',
      duration: spell.duration || 'Мгновенная',
      prepared: typeof spell.prepared === 'boolean' ? spell.prepared : false,
      ritual: typeof spell.ritual === 'boolean' ? spell.ritual : false,
      concentration: typeof spell.concentration === 'boolean' ? spell.concentration : false,
      verbal: typeof spell.verbal === 'boolean' ? spell.verbal : false,
      somatic: typeof spell.somatic === 'boolean' ? spell.somatic : false,
      material: typeof spell.material === 'boolean' ? spell.material : false
    };
  });
};

/**
 * Функция для проверки, является ли значение объектом CharacterSpell
 */
export const isCharacterSpellObject = (spell: CharacterSpell | string): spell is CharacterSpell => {
  return typeof spell !== 'string';
};

/**
 * Функция для получения имени заклинания из объекта или строки
 */
export const getSpellName = (spell: CharacterSpell | string): string => {
  if (isCharacterSpellObject(spell)) {
    return spell.name;
  }
  return spell;
};

/**
 * Обработка строк компонентов заклинания
 */
export const parseComponents = (componentString: string): {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  ritual: boolean;
  concentration: boolean;
  materialComponents?: string;
} => {
  // Найдём все материальные компоненты в скобках, если они есть
  const materialRegex = /М\s*\((.*?)\)/;
  const materialMatch = componentString.match(materialRegex);
  const materialComponents = materialMatch ? materialMatch[1] : undefined;

  return {
    verbal: componentString.includes('В'),
    somatic: componentString.includes('С'),
    material: componentString.includes('М'),
    ritual: componentString.includes('Р'),
    concentration: componentString.includes('К'),
    materialComponents
  };
};

/**
 * Конвертирует CharacterSpell в SpellData (гарантирует все обязательные поля)
 */
export const convertToSpellData = (spell: CharacterSpell | string): SpellData => {
  // Если передана строка, сначала преобразуем в CharacterSpell
  const charSpell = typeof spell === 'string' 
    ? {
        id: `spell-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: spell,
        level: 0,
        school: 'Универсальная',
        castingTime: '1 действие',
        range: 'Касание',
        components: '',
        duration: 'Мгновенная',
        description: '',
        prepared: false,
        ritual: false,
        concentration: false,
        verbal: false,
        somatic: false,
        material: false,
      } 
    : spell;

  // Теперь преобразуем в SpellData
  return {
    id: charSpell.id || `spell-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: charSpell.name,
    level: charSpell.level || 0,
    school: charSpell.school || 'Универсальная',
    castingTime: charSpell.castingTime || '1 действие',
    range: charSpell.range || 'Касание',
    components: charSpell.components || '',
    duration: charSpell.duration || 'Мгновенная',
    description: charSpell.description || '',
    classes: charSpell.classes || [],
    ritual: charSpell.ritual || false,
    concentration: charSpell.concentration || false,
    verbal: charSpell.verbal || false,
    somatic: charSpell.somatic || false,
    material: charSpell.material || false,
    prepared: charSpell.prepared || false,
    higherLevels: charSpell.higherLevels || ''
  };
};

/**
 * Конвертирует массив CharacterSpell в массив SpellData
 */
export const convertToSpellDataArray = (spells: (CharacterSpell | string)[] | undefined): SpellData[] => {
  if (!spells) return [];
  return spells.map(convertToSpellData);
};

/**
 * Группирует заклинания по уровням
 */
export const groupSpellsByLevel = (spells: CharacterSpell[] | SpellData[]): Record<number, CharacterSpell[] | SpellData[]> => {
  return spells.reduce((acc: Record<number, any[]>, spell) => {
    const level = spell.level || 0;
    if (!acc[level]) acc[level] = [];
    acc[level].push(spell);
    return acc;
  }, {});
};

/**
 * Создает объект слотов заклинаний для персонажа на основе класса и уровня
 */
export const generateSpellSlotsForCharacter = (characterClass: string, level: number): Record<number, {max: number, used: number}> => {
  const spellSlots: Record<number, {max: number, used: number}> = {};
  
  // Таблица слотов заклинаний для полных заклинателей (волшебник, жрец, друид, бард)
  const fullCasterSlots = [
    // [1-й уровень, 2-й уровень, 3-й уровень, 4-й уровень, 5-й уровень, 6-й уровень, 7-й уровень, 8-й уровень, 9-й уровень]
    [2, 0, 0, 0, 0, 0, 0, 0, 0], // 1-й уровень персонажа
    [3, 0, 0, 0, 0, 0, 0, 0, 0], // 2-й
    [4, 2, 0, 0, 0, 0, 0, 0, 0], // 3-й
    [4, 3, 0, 0, 0, 0, 0, 0, 0], // 4-й
    [4, 3, 2, 0, 0, 0, 0, 0, 0], // 5-й
    [4, 3, 3, 0, 0, 0, 0, 0, 0], // 6-й
    [4, 3, 3, 1, 0, 0, 0, 0, 0], // 7-й
    [4, 3, 3, 2, 0, 0, 0, 0, 0], // 8-й
    [4, 3, 3, 3, 1, 0, 0, 0, 0], // 9-й
    [4, 3, 3, 3, 2, 0, 0, 0, 0], // 10-й
    [4, 3, 3, 3, 2, 1, 0, 0, 0], // 11-й
    [4, 3, 3, 3, 2, 1, 0, 0, 0], // 12-й
    [4, 3, 3, 3, 2, 1, 1, 0, 0], // 13-й
    [4, 3, 3, 3, 2, 1, 1, 0, 0], // 14-й
    [4, 3, 3, 3, 2, 1, 1, 1, 0], // 15-й
    [4, 3, 3, 3, 2, 1, 1, 1, 0], // 16-й
    [4, 3, 3, 3, 2, 1, 1, 1, 1], // 17-й
    [4, 3, 3, 3, 3, 1, 1, 1, 1], // 18-й
    [4, 3, 3, 3, 3, 2, 1, 1, 1], // 19-й
    [4, 3, 3, 3, 3, 2, 2, 1, 1]  // 20-й
  ];
  
  // Таблица слотов для частичных заклинателей (следопыт, паладин)
  const halfCasterSlots = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0], // 1-й уровень персонажа
    [2, 0, 0, 0, 0, 0, 0, 0, 0], // 2-й
    [3, 0, 0, 0, 0, 0, 0, 0, 0], // 3-й
    [3, 0, 0, 0, 0, 0, 0, 0, 0], // 4-й
    [4, 2, 0, 0, 0, 0, 0, 0, 0], // 5-й
    [4, 2, 0, 0, 0, 0, 0, 0, 0], // 6-й
    [4, 3, 0, 0, 0, 0, 0, 0, 0], // 7-й
    [4, 3, 0, 0, 0, 0, 0, 0, 0], // 8-й
    [4, 3, 2, 0, 0, 0, 0, 0, 0], // 9-й
    [4, 3, 2, 0, 0, 0, 0, 0, 0], // 10-й
    [4, 3, 3, 0, 0, 0, 0, 0, 0], // 11-й
    [4, 3, 3, 0, 0, 0, 0, 0, 0], // 12-й
    [4, 3, 3, 1, 0, 0, 0, 0, 0], // 13-й
    [4, 3, 3, 1, 0, 0, 0, 0, 0], // 14-й
    [4, 3, 3, 2, 0, 0, 0, 0, 0], // 15-й
    [4, 3, 3, 2, 0, 0, 0, 0, 0], // 16-й
    [4, 3, 3, 3, 1, 0, 0, 0, 0], // 17-й
    [4, 3, 3, 3, 1, 0, 0, 0, 0], // 18-й
    [4, 3, 3, 3, 2, 0, 0, 0, 0], // 19-й
    [4, 3, 3, 3, 2, 0, 0, 0, 0]  // 20-й
  ];
  
  // Особая таблица для чародея и колдуна
  const warlockSlots = [
    [1, 0, 0, 0, 0], // 1-й уровень персонажа
    [2, 0, 0, 0, 0], // 2-й
    [2, 0, 0, 0, 0], // 3-й
    [2, 0, 0, 0, 0], // 4-й
    [2, 0, 0, 0, 0], // 5-й
    [2, 0, 0, 0, 0], // 6-й
    [2, 0, 0, 0, 0], // 7-й
    [2, 0, 0, 0, 0], // 8-й
    [2, 0, 0, 0, 0], // 9-й
    [2, 0, 0, 0, 0], // 10-й
    [3, 0, 0, 0, 0], // 11-й
    [3, 0, 0, 0, 0], // 12-й
    [3, 0, 0, 0, 0], // 13-й
    [3, 0, 0, 0, 0], // 14-й
    [3, 0, 0, 0, 0], // 15-й
    [3, 0, 0, 0, 0], // 16-й
    [4, 0, 0, 0, 0], // 17-й
    [4, 0, 0, 0, 0], // 18-й
    [4, 0, 0, 0, 0], // 19-й
    [4, 0, 0, 0, 0]  // 20-й
  ];

  // Определяем, какую таблицу использовать в зависимости от класса
  let slots: number[][] = [];
  let maxSlotLevel = 9; // По умолчанию для полных заклинателей

  if (['Волшебник', 'Жрец', 'Друид', 'Бард', 'Чародей'].includes(characterClass)) {
    slots = fullCasterSlots;
  } else if (['Паладин', 'Следопыт'].includes(characterClass)) {
    slots = halfCasterSlots;
  } else if (characterClass === 'Колдун') {
    slots = warlockSlots;
    maxSlotLevel = 5; // Колдуны имеют только 5 уровней слотов
  } else {
    // Возвращаем пустой объект для немагических классов
    return {};
  }

  // Индекс в массиве на 1 меньше, чем уровень персонажа
  const levelIndex = Math.min(level - 1, slots.length - 1);
  
  if (levelIndex >= 0 && slots[levelIndex]) {
    for (let i = 0; i < maxSlotLevel && i < slots[levelIndex].length; i++) {
      const slotLevel = i + 1; // Уровень слота (начиная с 1)
      const maxSlots = slots[levelIndex][i];
      
      if (maxSlots > 0) {
        spellSlots[slotLevel] = { max: maxSlots, used: 0 };
      }
    }
  }

  return spellSlots;
};

/**
 * Рассчитывает количество известных заклинаний для заданного класса и уровня
 */
export const calculateKnownSpells = (
  className: string, 
  characterLevel: number, 
  abilities?: { 
    wisdom?: number; 
    intelligence?: number; 
    charisma?: number; 
  }
): { cantrips: number; spells: number } => {
  // Инициализация результата
  const result = { cantrips: 0, spells: 0 };
  
  // Получаем модификаторы характеристик, если они есть
  const wisMod = abilities?.wisdom ? Math.floor((abilities.wisdom - 10) / 2) : 0;
  const intMod = abilities?.intelligence ? Math.floor((abilities.intelligence - 10) / 2) : 0;
  const chaMod = abilities?.charisma ? Math.floor((abilities.charisma - 10) / 2) : 0;
  
  // Нормализуем имя класса для сравнения
  const normalizedClass = className.toLowerCase();
  
  // Расчет для разных классов
  switch (normalizedClass) {
    // Полные заклинатели
    case 'волшебник':
      result.cantrips = 3 + (characterLevel >= 4 ? 1 : 0) + (characterLevel >= 10 ? 1 : 0);
      // У волшебника особый расчет для известных заклинаний - 6 на первом уровне + 2 на каждый новый уровень
      result.spells = 6 + (characterLevel > 1 ? (characterLevel - 1) * 2 : 0);
      break;
      
    case 'жрец':
    case 'друид':
      result.cantrips = 3 + (characterLevel >= 4 ? 1 : 0) + (characterLevel >= 10 ? 1 : 0);
      // Жрец и друид знают все заклинания своего класса, но могут готовить ограниченное число
      result.spells = characterLevel + (normalizedClass === 'жрец' ? wisMod : wisMod);
      break;
      
    case 'бард':
      result.cantrips = 2 + (characterLevel >= 4 ? 1 : 0) + (characterLevel >= 10 ? 1 : 0);
      // Барды получают известные заклинания по таблице
      if (characterLevel === 1) result.spells = 4;
      else if (characterLevel <= 3) result.spells = 5 + characterLevel - 2;
      else if (characterLevel <= 9) result.spells = 8 + Math.floor((characterLevel - 3) / 2);
      else result.spells = 14 + Math.floor((characterLevel - 9) / 2);
      break;
      
    case 'чародей':
      result.cantrips = 4 + (characterLevel >= 4 ? 1 : 0) + (characterLevel >= 10 ? 1 : 0);
      // Чародеи получают известные заклинания по таблице
      if (characterLevel === 1) result.spells = 2;
      else if (characterLevel <= 8) result.spells = 3 + (characterLevel - 1);
      else if (characterLevel <= 10) result.spells = 10 + (characterLevel - 9);
      else result.spells = 12 + Math.floor((characterLevel - 10) / 2);
      break;
      
    case 'колдун':
    case 'чернокнижник':
      result.cantrips = 2 + (characterLevel >= 4 ? 1 : 0) + (characterLevel >= 10 ? 1 : 0);
      // Колдуны получают известные заклинания по таблице
      if (characterLevel === 1) result.spells = 2;
      else if (characterLevel <= 9) result.spells = 2 + (characterLevel - 1);
      else result.spells = 10 + Math.floor((characterLevel - 9) / 2);
      break;
      
    // Частичные заклинатели
    case 'следопыт':
    case 'рейнджер':
      result.cantrips = 0; // Нет заговоров
      if (characterLevel < 2) result.spells = 0;
      else {
        // Следопыт получает известные заклинания постепенно
        result.spells = Math.min(characterLevel === 2 ? 2 : 3 + Math.floor((characterLevel - 3) / 2), 11);
      }
      break;
      
    case 'паладин':
      result.cantrips = 0; // Нет заговоров
      if (characterLevel < 2) result.spells = 0;
      else {
        // Паладин может готовить (уровень/2 + мод харизмы) заклинаний
        result.spells = Math.floor(characterLevel / 2) + chaMod;
      }
      break;
    
    // Частичные заклинатели с особыми правилами
    case 'плут':
    case 'вор':
    case 'разбойник':
      if (characterLevel >= 3) { // Мистический ловкач
        result.cantrips = 3;
        result.spells = 3;
      }
      break;
      
    case 'воин':
    case 'боец':
    case 'файтер':
      if (characterLevel >= 3) { // Мистический рыцарь
        result.cantrips = 2 + (characterLevel >= 10 ? 1 : 0);
        result.spells = Math.floor(characterLevel / 3) + 2;
      }
      break;
      
    default:
      // Для остальных классов нет заклинаний
      result.cantrips = 0;
      result.spells = 0;
      break;
  }
  
  return result;
};

/**
 * Определяет максимальный уровень заклинаний для класса и уровня персонажа
 */
export const getMaxSpellLevel = (className: string, characterLevel: number): number => {
  // Преобразуем название класса к нижнему регистру для сравнения
  const normalizedClass = className.toLowerCase();
  
  // Полные заклинатели (до 9-го уровня)
  if (['волшебник', 'жрец', 'друид', 'бард', 'чародей'].includes(normalizedClass)) {
    if (characterLevel >= 17) return 9;
    if (characterLevel >= 15) return 8;
    if (characterLevel >= 13) return 7;
    if (characterLevel >= 11) return 6;
    if (characterLevel >= 9) return 5;
    if (characterLevel >= 7) return 4;
    if (characterLevel >= 5) return 3;
    if (characterLevel >= 3) return 2;
    return 1;
  } 
  // Полузаклинатели (до 5-го уровня)
  else if (['паладин', 'следопыт', 'рейнджер'].includes(normalizedClass)) {
    if (characterLevel >= 17) return 5;
    if (characterLevel >= 13) return 4;
    if (characterLevel >= 9) return 3;
    if (characterLevel >= 5) return 2;
    if (characterLevel >= 2) return 1;
    return 0;
  }
  // Особые заклинатели (колдун)
  else if (['колдун', 'чернокнижник'].includes(normalizedClass)) {
    if (characterLevel >= 9) return 5;
    if (characterLevel >= 7) return 4;
    if (characterLevel >= 5) return 3;
    if (characterLevel >= 3) return 2;
    return 1;
  }
  
  // Для частичных заклинателей с ограниченным выбором (мистический рыцарь, мистический ловкач)
  if (['плут', 'вор', 'разбойник'].includes(normalizedClass) && characterLevel >= 3) {
    if (characterLevel >= 19) return 4;
    if (characterLevel >= 13) return 3;
    if (characterLevel >= 7) return 2;
    return 1;
  }
  
  if (['воин', 'боец', 'файтер'].includes(normalizedClass) && characterLevel >= 3) {
    if (characterLevel >= 13) return 4;
    if (characterLevel >= 7) return 3;
    if (characterLevel >= 3) return 1;
    return 0;
  }
  
  // Для остальных классов нет заклинаний
  return 0;
};
