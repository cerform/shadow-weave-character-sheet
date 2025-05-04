
import { CharacterSpell, SpellData } from '@/types/character';

/**
 * Извлекает имена заклинаний из массива заклинаний
 * @param spells Массив заклинаний
 * @returns Массив имен заклинаний
 */
export const extractSpellNames = (spells: CharacterSpell[] | string[]): string[] => {
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return spell;
    }
    return spell.name;
  });
};

/**
 * Безопасная версия метода Array.some
 * @param array Массив
 * @param predicate Функция-предикат
 * @returns Результат выполнения метода some
 */
export const safeSome = <T>(array: T[] | undefined, predicate: (item: T) => boolean): boolean => {
  if (!array || !Array.isArray(array)) {
    return false;
  }
  return array.some(predicate);
};

/**
 * Безопасная версия метода Array.filter
 * @param array Массив
 * @param predicate Функция-предикат
 * @returns Отфильтрованный массив
 */
export const safeFilter = <T>(array: T[] | undefined, predicate: (item: T) => boolean): T[] => {
  if (!array || !Array.isArray(array)) {
    return [];
  }
  return array.filter(predicate);
};

/**
 * Безопасно объединяет элементы массива в строку
 * @param array Массив строк
 * @param separator Разделитель
 * @returns Объединенная строка
 */
export const safeJoin = (array: string | string[] | undefined, separator: string = ', '): string => {
  if (!array) {
    return '';
  }
  
  if (Array.isArray(array)) {
    return array.join(separator);
  }
  
  return array;
};

/**
 * Нормализует массив заклинаний, приводя их к единому формату
 * @param spells Массив заклинаний
 * @returns Нормализованный массив заклинаний
 */
export const normalizeSpells = (spells: (CharacterSpell | string)[]): CharacterSpell[] => {
  if (!spells || !Array.isArray(spells)) {
    return [];
  }
  
  return spells.map(spell => {
    // Если заклинание уже в формате CharacterSpell, возвращаем его
    if (typeof spell !== 'string' && spell.name) {
      return spell as CharacterSpell;
    }
    
    // Если заклинание представлено строкой, создаем базовый объект CharacterSpell
    const spellName = typeof spell === 'string' ? spell : spell.name;
    
    return {
      id: spellName,
      name: spellName,
      level: 0, // Значение по умолчанию, должно быть заменено при полной загрузке заклинания
      school: '',
      castingTime: '',
      range: '',
      components: '',
      verbal: false,
      somatic: false,
      material: false,
      materialComponents: '',
      description: '',
      prepared: false,
      concentration: false,
      ritual: false,
      duration: '',
      classes: []
    };
  });
};

/**
 * Преобразует заклинание в формат для отображения
 * @param spell Заклинание
 * @returns Заклинание в формате для отображения
 */
export const spellToDisplayFormat = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id,
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: spell.components,
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    materialComponents: spell.materialComponents,
    description: spell.description,
    higherLevels: spell.higherLevels || spell.higherLevel,
    classes: spell.classes,
    prepared: spell.prepared,
    concentration: spell.concentration,
    ritual: spell.ritual,
    duration: spell.duration
  };
};
