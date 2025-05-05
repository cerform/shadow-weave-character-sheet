
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
 * Обработка строк компонентов заклинания
 */
export const parseComponents = (componentString: string): {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  ritual: boolean;
  concentration: boolean;
} => {
  return {
    verbal: componentString.includes('В'),
    somatic: componentString.includes('С'),
    material: componentString.includes('М'),
    ritual: componentString.includes('Р'),
    concentration: componentString.includes('К')
  };
};

/**
 * Конвертирует CharacterSpell в SpellData (гарантирует все обязательные поля)
 */
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id || `spell-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная', // Гарантируем обязательное поле
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'Касание',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes,
    ritual: spell.ritual,
    concentration: spell.concentration,
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    prepared: spell.prepared,
    higherLevels: spell.higherLevels
  };
};

/**
 * Конвертирует массив CharacterSpell в массив SpellData
 */
export const convertToSpellDataArray = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(convertToSpellData);
};
