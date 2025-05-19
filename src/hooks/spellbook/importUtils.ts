
import { CharacterSpell } from '@/types/character';
import { parseComponents } from '@/utils/spellProcessors';

/**
 * Парсит запись заклинания из текстового формата
 * Формат: [уровень] название компоненты
 * Пример: [3] Молния ВСМ
 */
export function parseSpellEntry(entry: string): {
  name: string;
  level: number;
  components: string;
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  ritual: boolean;
  concentration: boolean;
} | null {
  // Соответствие шаблону [3] Название ВСМ
  const match = entry.match(/\[(\d+)\]\s+(.+?)\s+([\wКВСМР\.]*)$/);
  
  if (!match) return null;
  
  const level = parseInt(match[1], 10);
  const name = match[2].trim();
  const componentCode = match[3] || '';
  
  // Используем обновленную функцию parseComponents, которая теперь поддерживает concentration
  const parsedComponents = parseComponents(componentCode);
  
  return {
    name,
    level,
    components: componentCode,
    verbal: parsedComponents.verbal,
    somatic: parsedComponents.somatic,
    material: parsedComponents.material,
    ritual: parsedComponents.ritual,
    concentration: parsedComponents.concentration
  };
}

/**
 * Обрабатывает блок текста с заклинаниями
 */
export function processSpellBatch(text: string): Array<{
  name: string;
  level: number;
  components: string;
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  ritual: boolean;
  concentration: boolean;
}> {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const results = [];
  
  for (const line of lines) {
    const parsed = parseSpellEntry(line);
    if (parsed) {
      results.push(parsed);
    }
  }
  
  return results;
}

/**
 * Импортирует заклинания из текста в существующий список
 */
export function importSpellsFromText(text: string, existingSpells: CharacterSpell[]): CharacterSpell[] {
  const parsedSpells = processSpellBatch(text);
  const updatedSpells = [...existingSpells];
  
  // Создаем объект для быстрого поиска
  const existingSpellsMap = new Map<string, number>();
  existingSpells.forEach((spell, index) => {
    const key = `${spell.name}-${spell.level}`;
    existingSpellsMap.set(key, index);
  });
  
  parsedSpells.forEach(parsed => {
    const key = `${parsed.name}-${parsed.level}`;
    const existingIndex = existingSpellsMap.get(key);
    
    if (existingIndex !== undefined) {
      // Обновляем существующее заклинание
      updatedSpells[existingIndex] = {
        ...updatedSpells[existingIndex],
        components: parsed.components,
        verbal: parsed.verbal,
        somatic: parsed.somatic,
        material: parsed.material,
        ritual: parsed.ritual,
        concentration: parsed.concentration
      };
    } else {
      // Добавляем новое заклинание с базовыми параметрами
      const newSpell: CharacterSpell = {
        name: parsed.name,
        level: parsed.level,
        school: "Прорицание", // Школа по умолчанию
        castingTime: "1 действие",
        range: "На себя",
        components: parsed.components,
        duration: parsed.concentration ? "Концентрация, вплоть до 1 минуты" : "Мгновенная",
        description: "Нет описания",
        classes: ["Волшебник"], // Класс по умолчанию
        verbal: parsed.verbal,
        somatic: parsed.somatic,
        material: parsed.material,
        ritual: parsed.ritual,
        concentration: parsed.concentration
      };
      
      updatedSpells.push(newSpell);
    }
  });
  
  return updatedSpells;
}
