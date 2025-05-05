
import { CharacterSpell } from '@/types/character';

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
    return spell;
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
