
import { CharacterSpell } from '@/types/character';

// Функция для импорта заклинаний из текста
export function importSpellsFromText(text: string, existingSpells: CharacterSpell[]): CharacterSpell[] {
  if (!text || !text.trim()) {
    return existingSpells;
  }

  // Базовый разбор: предполагаем, что каждая строка - это одно заклинание
  const lines = text.split('\n').filter(line => line.trim());
  
  // Создаем новые заклинания из строк
  const newSpells = lines.map(line => {
    const trimmedLine = line.trim();
    // Пытаемся извлечь уровень заклинания из строки, если он указан в формате "Название (уровень X)"
    const levelMatch = trimmedLine.match(/\((?:уровень|level)\s*(\d+)\)/i);
    const level = levelMatch ? parseInt(levelMatch[1], 10) : 0;
    
    // Удаляем информацию об уровне из названия
    const name = trimmedLine.replace(/\s*\((?:уровень|level)\s*\d+\)\s*/i, '');
    
    return {
      name,
      level,
      prepared: true // По умолчанию помечаем как подготовленное
    } as CharacterSpell;
  });
  
  // Объединяем с существующими заклинаниями, избегая дубликатов
  const combinedSpells = [...existingSpells];
  
  newSpells.forEach(newSpell => {
    const existingIndex = combinedSpells.findIndex(spell => 
      (typeof spell === 'string' && spell === newSpell.name) || 
      (typeof spell === 'object' && spell !== null && spell.name === newSpell.name)
    );
    
    if (existingIndex === -1) {
      combinedSpells.push(newSpell);
    }
  });
  
  return combinedSpells;
}

/**
 * Парсит запись заклинания из сырого текстового формата
 * Формат: [уровень] название компоненты
 * Пример: [0] Брызги кислоты ВС
 */
export const parseSpellEntry = (entry: string): {
  name: string;
  level: number;
  components: {
    verbal: boolean;
    somatic: boolean;
    material: boolean;
    ritual: boolean;
  };
} | null => {
  // Паттерн для строк типа [0] Название АБВ
  const match = entry.match(/\[(\d+)\]\s+(.+?)\s+([\w\.]*)$/);
  
  if (!match) return null;
  
  const level = parseInt(match[1], 10);
  const name = match[2].trim();
  const componentCode = match[3] || '';
  
  return {
    name,
    level,
    components: parseComponents(componentCode)
  };
};

/**
 * Парсит коды компонентов заклинания
 */
export const parseComponents = (componentCode: string): {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  ritual: boolean;
} => {
  const verbal = componentCode.includes('В') || componentCode.includes('V');
  const somatic = componentCode.includes('С') || componentCode.includes('S');
  const material = componentCode.includes('М') || componentCode.includes('M');
  const ritual = componentCode.includes('Р') || componentCode.includes('R');
  
  return {
    verbal,
    somatic,
    material,
    ritual
  };
};

/**
 * Обрабатывает несколько записей заклинаний из сырого текста
 */
export const processSpellBatch = (rawText: string): Array<{
  name: string;
  level: number;
  components: {
    verbal: boolean;
    somatic: boolean;
    material: boolean;
    ritual: boolean;
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

