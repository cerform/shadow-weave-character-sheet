
import { CharacterSpell, SpellData } from '@/types/character';

/**
 * Нормализация данных о заклинаниях
 * @param spells Массив заклинаний или их названий
 * @param allSpells Полный список заклинаний для поиска дополнительной информации
 * @returns Нормализованный массив заклинаний
 */
export const normalizeSpells = (
  spells: (string | CharacterSpell)[],
  allSpells: CharacterSpell[]
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
