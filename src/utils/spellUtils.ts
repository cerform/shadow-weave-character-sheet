
// Вспомогательные функции для работы с заклинаниями
import { CharacterSpell } from '@/types/character';

// Функция для извлечения имён заклинаний из массива
export const extractSpellNames = (spells: (string | CharacterSpell)[]): string[] => {
  return spells.map(spell => 
    typeof spell === 'string' ? spell : spell.name
  );
};

// Безопасное объединение массива в строку
export const safeJoin = (value: any): string => {
  if (Array.isArray(value)) {
    return value.join(", ");
  }
  if (typeof value === 'string') {
    return value;
  }
  return String(value || "");
};

// Функция для безопасной проверки, содержится ли подстрока в строке
export const safeSome = (text: string | null | undefined, searchTerm: string): boolean => {
  if (!text) return false;
  return text.toLowerCase().includes(searchTerm.toLowerCase());
};

// Функция для фильтрации заклинаний
export const safeFilter = (spells: any[], filterFn: (spell: any) => boolean): any[] => {
  if (!spells || !Array.isArray(spells)) return [];
  return spells.filter(filterFn);
};

// Преобразование списка заклинаний к единому формату
export const normalizeSpells = (spells: any[], allSpellsData: any[]): CharacterSpell[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  return spells.map(spell => {
    // Если это уже объект CharacterSpell
    if (typeof spell === 'object' && spell !== null) {
      return {
        ...spell,
        prepared: spell.prepared === undefined ? false : spell.prepared
      } as CharacterSpell;
    }
    
    // Если это строка, найти заклинание в базе данных
    if (typeof spell === 'string') {
      const foundSpell = allSpellsData.find(s => s.name === spell);
      if (foundSpell) {
        return {
          ...foundSpell,
          prepared: false // По умолчанию не подготовлено
        } as CharacterSpell;
      }
      // Если не найдено, создаем минимальный объект
      return {
        name: spell,
        level: 0,
        prepared: false
      } as CharacterSpell;
    }
    
    return {
      name: "Неизвестное заклинание",
      level: 0,
      prepared: false
    } as CharacterSpell;
  });
};

// Безопасное получение свойства заклинания
export const safeGet = (spell: any | undefined, property: string, defaultValue: any = ''): any => {
  if (!spell) return defaultValue;
  return spell[property] ?? defaultValue;
};

export default {
  extractSpellNames,
  safeJoin,
  normalizeSpells,
  safeSome,
  safeFilter,
  safeGet
};
