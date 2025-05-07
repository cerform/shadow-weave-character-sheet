import { SpellData, SpellFilter } from '@/types/spells';
import { CharacterSpell } from '@/types/character';
import { getAllSpells } from '@/data/spells';

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
        if (filters.level.length > 0 && !filters.level.includes(spell.level)) return false;
      } else if (spell.level !== filters.level) {
        return false;
      }
    }
    
    // Фильтрация по школе
    if (filters.school !== undefined) {
      if (Array.isArray(filters.school)) {
        if (filters.school.length > 0 && !filters.school.includes(spell.school)) return false;
      } else if (spell.school !== filters.school) {
        return false;
      }
    }
    
    // Фильтрация по классу
    if (filters.class !== undefined) {
      const spellClasses = Array.isArray(spell.classes) ? spell.classes : [spell.classes];
      
      if (Array.isArray(filters.class)) {
        if (filters.class.length > 0 && !filters.class.some(c => spellClasses.includes(c))) return false;
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
 * Парсер для быстрого импорта заклинаний
 */
export function parseSpellEntry(entry: string): Partial<CharacterSpell> {
  // Базовый парсер для строк вида: "[level] name components"
  // Например: "[0] Огненный снаряд ВС"
  const levelMatch = entry.match(/\[(\d+)\]/);
  const level = levelMatch ? parseInt(levelMatch[1]) : 0;
  
  // Получаем имя заклинания (предполагаем, что оно находится между уровнем и компонентами)
  let name = entry.replace(/\[\d+\]\s*/, '').trim();
  
  // Определяем компоненты (обычно в конце строки)
  const componentsMatch = name.match(/\s([ВСМ]+)$/);
  let components = '';
  
  if (componentsMatch) {
    components = componentsMatch[1].replace('В', 'V').replace('С', 'S').replace('М', 'M');
    name = name.replace(/\s[ВСМ]+$/, '').trim();
  }
  
  return {
    name,
    level,
    components: components || '',
    verbal: components.includes('V'),
    somatic: components.includes('S'),
    material: components.includes('M')
  };
}

/**
 * Обработка пакетного импорта заклинаний
 */
export function processSpellBatch(text: string): Partial<CharacterSpell>[] {
  const lines = text.split('\n');
  const results: Partial<CharacterSpell>[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    try {
      const spell = parseSpellEntry(trimmed);
      results.push(spell);
    } catch (error) {
      console.error(`Failed to parse spell entry: "${trimmed}"`, error);
    }
  }
  
  return results;
}

/**
 * Импорт заклинаний из текста
 */
export function importSpellsFromText(text: string, existingSpells: CharacterSpell[] = []): CharacterSpell[] {
  if (!text) return existingSpells;
  
  const allSpells = getAllSpells();
  const lines = text.split('\n');
  const result: CharacterSpell[] = [];
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Ищем заклинание по имени в списке всех заклинаний
    const spellName = trimmed.split('(')[0].split('[')[0].trim();
    const foundSpell = allSpells.find(
      s => s.name.toLowerCase() === spellName.toLowerCase()
    );
    
    if (foundSpell) {
      result.push({
        id: foundSpell.id,
        name: foundSpell.name,
        level: foundSpell.level,
        school: foundSpell.school,
        castingTime: foundSpell.castingTime,
        range: foundSpell.range,
        components: foundSpell.components,
        duration: foundSpell.duration,
        description: foundSpell.description,
        classes: foundSpell.classes,
        ritual: foundSpell.ritual,
        concentration: foundSpell.concentration,
        verbal: foundSpell.verbal,
        somatic: foundSpell.somatic,
        material: foundSpell.material
      });
    } else {
      console.warn(`Заклинание не найдено: ${spellName}`);
    }
  }
  
  return result;
}

/**
 * Получение названия уровня заклинания
 * @param level Уровень заклинания (0-9)
 * @returns Название уровня заклинания на русском языке
 */
export function getSpellLevelName(level: number): string {
  switch (level) {
    case 0:
      return 'Заговоры';
    case 1:
      return '1-й уровень';
    case 2:
      return '2-й уровень';
    case 3:
      return '3-й уровень';
    case 4:
      return '4-й уровень';
    case 5:
      return '5-й уровень';
    case 6:
      return '6-й уровень';
    case 7:
      return '7-й уровень';
    case 8:
      return '8-й уровень';
    case 9:
      return '9-й уровень';
    default:
      return `${level}-й уровень`;
  }
}
