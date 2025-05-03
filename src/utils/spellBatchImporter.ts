
import { parseComponents } from './spellProcessors';
import { CharacterSpell } from '@/types/character';

/**
 * Парсит запись заклинания из сырого текстового формата
 * Формат: [уровень] название компоненты
 * Пример: [0] Брызги кислоты ВС.
 */
export const parseSpellEntry = (entry: string): {
  name: string;
  level: number;
  components: {
    verbal: boolean;
    somatic: boolean;
    material: boolean;
    ritual: boolean;
    concentration: boolean;
  };
} | null => {
  // Проверяем формат записи заклинания
  const match = entry.trim().match(/\[(\d+)\]\s+(.+?)\s*([КВСМР]*)\.?\s*$/);
  
  if (!match) return null;
  
  const level = parseInt(match[1], 10);
  const name = match[2].trim();
  const componentCode = (match[3] || '').trim();
  
  const components = parseComponents(componentCode);
  
  return {
    name,
    level,
    components
  };
};

/**
 * Пакетная обработка множества записей заклинаний из сырого текста
 */
export const processSpellBatch = (rawText: string): Array<{
  name: string;
  level: number;
  components: {
    verbal: boolean;
    somatic: boolean;
    material: boolean;
    ritual: boolean;
    concentration: boolean;
  };
}> => {
  const lines = rawText.split('\n').filter(line => line.trim().length > 0);
  const results = [];
  
  for (const line of lines) {
    const parsed = parseSpellEntry(line);
    if (parsed) {
      results.push(parsed);
    }
  }
  
  return results;
};

/**
 * Создает или обновляет данные заклинаний на основе обработанных данных
 */
export const createOrUpdateSpells = (
  existingSpells: CharacterSpell[], 
  parsedEntries: Array<{
    name: string;
    level: number;
    components: {
      verbal: boolean;
      somatic: boolean;
      material: boolean;
      ritual: boolean;
      concentration: boolean;
    };
  }>
): CharacterSpell[] => {
  const updatedSpells = [...existingSpells];
  const defaultSpell: Partial<CharacterSpell> = {
    castingTime: "1 действие",
    range: "На себя",
    duration: "Мгновенная",
    school: "Прорицание",
    classes: ["Волшебник"],
    description: "Описание отсутствует",
  };
  
  parsedEntries.forEach(entry => {
    // Ищем существующее заклинание
    const existingSpellIndex = updatedSpells.findIndex(s => 
      s.name.toLowerCase() === entry.name.toLowerCase() && s.level === entry.level);
    
    if (existingSpellIndex >= 0) {
      // Обновляем существующее заклинание
      updatedSpells[existingSpellIndex] = {
        ...updatedSpells[existingSpellIndex],
        verbal: entry.components.verbal,
        somatic: entry.components.somatic,
        material: entry.components.material,
        ritual: entry.components.ritual,
        concentration: entry.components.concentration
      };
    } else {
      // Создаем новое заклинание
      const newSpell: CharacterSpell = {
        ...defaultSpell as CharacterSpell,
        name: entry.name,
        level: entry.level,
        verbal: entry.components.verbal,
        somatic: entry.components.somatic,
        material: entry.components.material,
        ritual: entry.components.ritual,
        concentration: entry.components.concentration,
        components: `${entry.components.verbal ? 'В' : ''}${entry.components.somatic ? 'С' : ''}${entry.components.material ? 'М' : ''}${entry.components.ritual ? 'Р' : ''}${entry.components.concentration ? 'К' : ''}`,
      };
      updatedSpells.push(newSpell);
    }
  });
  
  return updatedSpells;
};

/**
 * Процесс импорта заклинаний из сырого текста
 */
export function importSpellsFromText(rawText: string, existingSpells: CharacterSpell[]): CharacterSpell[] {
  const parsedEntries = processSpellBatch(rawText);
  return createOrUpdateSpells(existingSpells, parsedEntries);
}
