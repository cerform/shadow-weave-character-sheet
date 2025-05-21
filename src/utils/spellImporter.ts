
import { CharacterSpell } from '@/types/character';
import { parseComponents } from './spellProcessors';

interface SpellComponents {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  ritual: boolean;
}

/**
 * Парсит запись заклинания из сырого текстового формата
 * Формат: [уровень] название компоненты
 * Пример: [0] Брызги кислоты ВС.
 */
export const parseSpellEntry = (entry: string): {
  name: string;
  level: number;
  components: SpellComponents;
} | null => {
  // Ищем шаблон типа [0] Название ВСМ
  const match = entry.match(/\[(\d+)\]\s+(.+?)\s+([\w\.]*)$/);
  
  if (!match) return null;
  
  const level = parseInt(match[1], 10);
  const name = match[2].trim();
  const componentCode = match[3] || '';
  
  // Используем функцию parseComponents для обработки кодов компонентов
  const components = parseComponents(componentCode);
  
  return {
    name,
    level,
    components: {
      verbal: components.verbal || false,
      somatic: components.somatic || false,
      material: components.material || false,
      ritual: components.ritual || false
    }
  };
};

/**
 * Пакетная обработка нескольких записей заклинаний из сырого текста
 */
export const processSpellEntries = (rawText: string): Array<{
  name: string;
  level: number;
  components: SpellComponents;
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
 * Обновляет существующую коллекцию заклинаний информацией о компонентах из разобранных записей
 */
export const updateSpellsWithComponents = (
  spells: CharacterSpell[], 
  parsedEntries: Array<{
    name: string;
    level: number;
    components: SpellComponents;
  }>
): CharacterSpell[] => {
  const updatedSpells = [...spells];
  
  parsedEntries.forEach(entry => {
    const existingSpellIndex = updatedSpells.findIndex(s => s.name === entry.name && s.level === entry.level);
    
    if (existingSpellIndex >= 0) {
      // Update existing spell
      updatedSpells[existingSpellIndex] = {
        ...updatedSpells[existingSpellIndex],
        verbal: entry.components.verbal,
        somatic: entry.components.somatic,
        material: entry.components.material,
        ritual: entry.components.ritual
      };
    } else {
      // Could add new spell with basic info, but would need descriptions
      console.log(`Spell not found: ${entry.name} (level ${entry.level})`);
    }
  });
  
  return updatedSpells;
};
