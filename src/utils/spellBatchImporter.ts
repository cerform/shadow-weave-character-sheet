
import { CharacterSpell } from '@/types/character';

/**
 * Парсит строку с заклинанием из формата [уровень] Название заклинания ВСМ
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
  // Формат: [0] Название ВСМ или [1] Название ВСР
  const match = entry.match(/\[(\d+)\]\s+(.+?)\s+([ВСМРК\.]*)$/);
  
  if (!match) return null;
  
  const level = parseInt(match[1], 10);
  const name = match[2].trim();
  const componentCode = match[3] || '';
  
  return {
    name,
    level,
    components: {
      verbal: componentCode.includes('В'),
      somatic: componentCode.includes('С'),
      material: componentCode.includes('М'),
      ritual: componentCode.includes('Р'),
      concentration: componentCode.includes('К')
    }
  };
};

/**
 * Обрабатывает пакет заклинаний из текста
 */
export const processSpellBatch = (rawText: string): any[] => {
  const lines = rawText.split('\n').filter(line => line.trim().length > 0);
  const results = [];
  
  for (const line of lines) {
    const parsed = parseSpellEntry(line);
    if (parsed) {
      results.push({
        name: parsed.name,
        level: parsed.level,
        components: parsed.components
      });
    }
  }
  
  return results;
};

/**
 * Импортирует заклинания из текста и добавляет их к существующим
 */
export const importSpellsFromText = (
  rawText: string, 
  existingSpells: CharacterSpell[]
): CharacterSpell[] => {
  if (!rawText.trim()) return existingSpells;
  
  const parsed = processSpellBatch(rawText);
  const updatedSpells = [...existingSpells];
  
  parsed.forEach(spell => {
    const existingIndex = updatedSpells.findIndex(s => 
      s.name === spell.name && s.level === spell.level
    );
    
    if (existingIndex >= 0) {
      // Обновляем существующее заклинание
      updatedSpells[existingIndex] = {
        ...updatedSpells[existingIndex],
        verbal: spell.components.verbal,
        somatic: spell.components.somatic,
        material: spell.components.material,
        ritual: spell.components.ritual,
        concentration: spell.components.concentration
      };
    } else {
      // Добавляем новое заклинание
      updatedSpells.push({
        name: spell.name,
        level: spell.level,
        verbal: spell.components.verbal,
        somatic: spell.components.somatic,
        material: spell.components.material,
        ritual: spell.components.ritual,
        concentration: spell.components.concentration,
        school: "Не указано",
        castingTime: "1 действие",
        range: "Не указано",
        components: "",
        duration: "Мгновенная",
        description: "Нет описания"
      });
    }
  });
  
  return updatedSpells;
};
