
import { CharacterSpell } from '@/types/character';
import { parseComponents } from './spellProcessors';

/**
 * Импорт заклинаний из текстового формата
 * @param text Текст в формате: [уровень] Название заклинания ВСМ
 * @param existingSpells Существующий массив заклинаний
 */
export function importSpellsFromText(text: string, existingSpells: CharacterSpell[]): CharacterSpell[] {
  const parsedEntries = processSpellBatch(text);
  const existingSpellsMap = new Map<string, CharacterSpell>();

  // Создаем карту существующих заклинаний для быстрого поиска
  existingSpells.forEach(spell => {
    const key = `${spell.name}|${spell.level}`;
    existingSpellsMap.set(key, spell);
  });

  // Создаем новый массив результатов
  const result: CharacterSpell[] = [...existingSpells];

  // Обрабатываем каждую запись
  parsedEntries.forEach(entry => {
    const key = `${entry.name}|${entry.level}`;
    
    if (existingSpellsMap.has(key)) {
      // Обновляем существующее заклинание
      const existingSpellIndex = result.findIndex(
        spell => spell.name === entry.name && spell.level === entry.level
      );
      
      if (existingSpellIndex !== -1) {
        result[existingSpellIndex] = {
          ...result[existingSpellIndex],
          verbal: entry.components.verbal,
          somatic: entry.components.somatic,
          material: entry.components.material,
          ritual: entry.components.ritual,
          concentration: entry.components.concentration,
        };
      }
    } else {
      // Создаем новое заклинание
      result.push({
        name: entry.name,
        level: entry.level,
        school: "Неизвестная",
        castingTime: "1 действие",
        range: "Неизвестно",
        components: makeComponentsString(entry.components),
        duration: "Неизвестно",
        description: "Нет описания",
        verbal: entry.components.verbal,
        somatic: entry.components.somatic,
        material: entry.components.material,
        ritual: entry.components.ritual,
        concentration: entry.components.concentration,
        prepared: false,
        classes: []
      });
    }
  });

  return result;
}

/**
 * Обработка партии заклинаний из текста
 */
export function processSpellBatch(text: string): Array<{
  name: string;
  level: number;
  components: {
    verbal: boolean;
    somatic: boolean;
    material: boolean;
    ritual: boolean;
    concentration: boolean;
  };
}> {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const results = [];

  for (const line of lines) {
    const entry = parseSpellEntry(line);
    if (entry) {
      results.push(entry);
    }
  }

  return results;
}

/**
 * Парсинг одного заклинания из текста
 */
function parseSpellEntry(line: string): {
  name: string;
  level: number;
  components: {
    verbal: boolean;
    somatic: boolean;
    material: boolean;
    ritual: boolean;
    concentration: boolean;
  };
} | null {
  // Паттерн [уровень] Название ВСМ
  const match = line.match(/\[(\d+)\]\s+([^]+?)(?:\s+([ВСМРК]+))?$/);
  
  if (!match) return null;
  
  const level = parseInt(match[1], 10);
  const name = match[2].trim();
  const componentCode = (match[3] || '').trim();
  
  return {
    name,
    level,
    components: parseComponents(componentCode)
  };
}

/**
 * Создает строку компонентов из объекта компонентов
 */
function makeComponentsString(components: {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  ritual: boolean;
  concentration: boolean;
}): string {
  let result = '';
  if (components.verbal) result += 'В';
  if (components.somatic) result += 'С';
  if (components.material) result += 'М';
  if (components.ritual) result += 'Р';
  if (components.concentration) result += 'К';
  return result;
}

/**
 * Экспортируем в глобальный скоуп для использования в компонентах
 */
export { parseComponents };
