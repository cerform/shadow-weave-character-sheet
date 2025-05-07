import { SpellData, SpellFilter } from '@/types/spells';
import { CharacterSpell } from '@/types/character';

/**
 * Фильтрация заклинаний по заданным критериям
 */
export const filterSpells = (spells: SpellData[] | CharacterSpell[], filters: SpellFilter): SpellData[] => {
  if (!spells || spells.length === 0) return [];

  return spells.filter(spell => {
    // Фильтрация по названию
    if (filters.name && !spell.name.toLowerCase().includes(filters.name.toLowerCase())) {
      return false;
    }
    
    // Фильтрация по уровню
    if (filters.level !== undefined) {
      if (Array.isArray(filters.level)) {
        if (!filters.level.includes(spell.level)) return false;
      } else if (spell.level !== filters.level) {
        return false;
      }
    }
    
    // Фильтрация по школе
    if (filters.school !== undefined) {
      if (Array.isArray(filters.school)) {
        if (!filters.school.includes(spell.school)) return false;
      } else if (spell.school !== filters.school) {
        return false;
      }
    }
    
    // Фильтрация по классу
    if (filters.class !== undefined) {
      const spellClasses = Array.isArray(spell.classes) ? spell.classes : [spell.classes];
      
      if (Array.isArray(filters.class)) {
        if (!filters.class.some(c => spellClasses.includes(c))) return false;
      } else if (!spellClasses.includes(filters.class)) {
        return false;
      }
    }
    
    // Фильтрация по ритуалу и концентрации
    if (filters.ritual !== undefined && spell.ritual !== filters.ritual) {
      return false;
    }
    
    if (filters.concentration !== undefined && spell.concentration !== filters.concentration) {
      return false;
    }
    
    return true;
  }) as SpellData[];
};

/**
 * Импорт заклинаний из текста
 */
export function importSpellsFromText(text: string, existingSpells: CharacterSpell[] = []): CharacterSpell[] {
  if (!text) return existingSpells;

  // Разбиваем текст на строки
  const lines = text.split('\n');
  const result: CharacterSpell[] = [...existingSpells];
  
  // Простой парсер для строк с заклинаниями
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) continue;
    
    // Предположим, что каждая строка содержит хотя бы название заклинания
    const spellName = trimmedLine.split('(')[0].trim();
    
    if (spellName && !existingSpells.some(s => typeof s === 'string' ? s === spellName : s.name === spellName)) {
      // Определяем уровень по ключевым словам
      let level = 0;
      if (trimmedLine.toLowerCase().includes('заговор')) {
        level = 0;
      } else {
        for (let i = 1; i <= 9; i++) {
          if (trimmedLine.includes(`${i} уровень`) || trimmedLine.includes(`уровень ${i}`)) {
            level = i;
            break;
          }
        }
      }
      
      // Определяем школу магии
      const schoolMap: Record<string, string> = {
        'воплощение': 'Воплощение',
        'ограждение': 'Ограждение',
        'преобразование': 'Преобразование', 
        'иллюзия': 'Иллюзия',
        'некромантия': 'Некромантия',
        'вызов': 'Вызов',
        'очарование': 'Очарование',
        'прорицание': 'Прорицание'
      };
      
      let school = '';
      for (const [key, value] of Object.entries(schoolMap)) {
        if (trimmedLine.toLowerCase().includes(key)) {
          school = value;
          break;
        }
      }
      
      // Добавляем заклинание
      result.push({
        name: spellName,
        level,
        school,
        description: trimmedLine
      });
    }
  }
  
  return result;
}

/**
 * Получение названия уровня заклинания
 */
export const getSpellLevelName = (level: number): string => {
  if (level === 0) return 'Заговор';
  return `${level} уровень`;
};
