
import { CharacterSpell, SpellData } from '@/types/character';

/**
 * Нормализация данных о заклинаниях
 * @param spells Массив заклинаний или их названий
 * @param allSpells Полный список заклинаний для поиска дополнительной информации
 * @returns Нормализованный массив заклинаний
 */
export const normalizeSpells = (
  spells: (string | CharacterSpell)[],
  allSpells: CharacterSpell[] = []
): SpellData[] => {
  if (!spells || !spells.length) return [];

  return spells.map(spell => {
    if (typeof spell === 'string') {
      // Если это строка, найдем полную информацию в базе данных заклинаний
      const fullSpell = allSpells.find(s => s.name === spell);
      if (fullSpell) {
        return { 
          ...fullSpell,
          prepared: fullSpell.prepared || false
        };
      } else {
        // Если заклинание не найдено, создадим базовый объект
        return {
          name: spell,
          level: 0,
          school: "Неизвестно",
          description: "Нет доступного описания",
          prepared: false
        };
      }
    } else {
      // Если это уже объект, просто убедимся, что все обязательные поля заполнены
      return {
        ...spell,
        prepared: spell.prepared || false
      };
    }
  });
};

/**
 * Безопасное соединение строк или массивов строк
 * @param value Строка или массив строк
 * @param separator Разделитель для соединения
 * @returns Соединенная строка
 */
export const safeJoin = (value: string | string[] | undefined, separator: string = ', '): string => {
  if (!value) return '';
  
  if (Array.isArray(value)) {
    return value.join(separator);
  }
  
  return value;
};

/**
 * Извлечение имен заклинаний из массива заклинаний
 * @param spells Массив заклинаний
 * @returns Массив имен заклинаний
 */
export const extractSpellNames = (spells: (SpellData | string)[]): string[] => {
  return spells.map(spell => typeof spell === 'string' ? spell : spell.name);
};

/**
 * Безопасная проверка элемента в массиве (аналог Array.some)
 * @param arr Массив или строка
 * @param predicate Функция предикат для проверки
 * @returns Результат проверки
 */
export const safeSome = <T>(arr: T[] | T | undefined, predicate: (item: T) => boolean): boolean => {
  if (!arr) return false;
  
  if (Array.isArray(arr)) {
    return arr.some(predicate);
  }
  
  return predicate(arr);
};

/**
 * Безопасная фильтрация массива
 * @param arr Массив или строка
 * @param predicate Функция предикат для фильтрации
 * @returns Отфильтрованный массив
 */
export const safeFilter = <T>(arr: T[] | T | undefined, predicate: (item: T) => boolean): T[] => {
  if (!arr) return [];
  
  if (Array.isArray(arr)) {
    return arr.filter(predicate);
  }
  
  return predicate(arr) ? [arr] : [];
};
