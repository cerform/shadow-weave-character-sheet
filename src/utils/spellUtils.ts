
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
        duration: 'Мгновенная'
      };
    }
    
    // Обеспечиваем наличие всех обязательных полей
    return {
      ...spell,
      school: spell.school || 'Универсальная',
      castingTime: spell.castingTime || '1 действие',
      range: spell.range || 'Касание',
      components: spell.components || '',
      duration: spell.duration || 'Мгновенная'
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
        description: ''
      } 
    : spell;

  // Теперь преобразуем в SpellData
  return {
    id: charSpell.id || `spell-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: charSpell.name,
    level: charSpell.level,
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
export const convertToSpellDataArray = (spells: (CharacterSpell | string)[]): SpellData[] => {
  return spells.map(convertToSpellData);
};
