
import { CharacterSpell } from '@/types/character';
import { parseComponents } from './spellProcessors';

/**
 * Обрабатывает партию заклинаний из текстового формата
 * Пример входных данных:
 * [0] Луч холода ВС
 * [1] Волшебная стрела ВС
 * 
 * @param batchText Текст с заклинаниями
 * @returns Массив обработанных заклинаний
 */
export function processSpellBatch(batchText: string): CharacterSpell[] {
  const processedSpells: CharacterSpell[] = [];
  const lines = batchText.split('\n').filter(line => line.trim() !== '');
  
  lines.forEach((line, index) => {
    // Извлекаем уровень заклинания [0], [1], и т.д.
    const levelMatch = line.match(/\[(\d+)\]/);
    if (!levelMatch) return;
    
    const level = parseInt(levelMatch[1]);
    
    // Удаляем уровень из строки и получаем остальную часть
    let remainingText = line.replace(/\[\d+\]/, '').trim();
    
    // Ищем название заклинания (до компонентов или до конца строки)
    const componentsIndex = remainingText.search(/\s[ВСМРК\.]+$/);
    let name = remainingText;
    let componentsText = '';
    
    if (componentsIndex > -1) {
      name = remainingText.substring(0, componentsIndex).trim();
      componentsText = remainingText.substring(componentsIndex).trim();
    }
    
    // Определяем компоненты
    const components = parseComponents(componentsText);
    
    // Создаем объект заклинания
    const spell: CharacterSpell = {
      id: `imported-${index}`,
      name: name,
      level: level,
      school: '',
      verbal: components.verbal,
      somatic: components.somatic,
      material: components.material,
      ritual: components.ritual,
      concentration: components.concentration,
      components: componentsText
    };
    
    processedSpells.push(spell);
  });
  
  return processedSpells;
}

/**
 * Обрабатывает заклинание из текста и извлекает его данные
 */
export function parseSpellEntry(line: string): CharacterSpell | null {
  // Извлекаем уровень заклинания [0], [1], и т.д.
  const levelMatch = line.match(/\[(\d+)\]/);
  if (!levelMatch) return null;
  
  const level = parseInt(levelMatch[1]);
  
  // Удаляем уровень из строки и получаем остальную часть
  let remainingText = line.replace(/\[\d+\]/, '').trim();
  
  // Ищем название заклинания (до компонентов или до конца строки)
  const componentsIndex = remainingText.search(/\s[ВСМРК\.]+$/);
  let name = remainingText;
  let componentsText = '';
  
  if (componentsIndex > -1) {
    name = remainingText.substring(0, componentsIndex).trim();
    componentsText = remainingText.substring(componentsIndex).trim();
  }
  
  // Определяем компоненты
  const components = parseComponents(componentsText);
  
  // Создаем объект заклинания
  const spell: CharacterSpell = {
    id: `parsed-${Date.now()}`,
    name: name,
    level: level,
    school: '',
    verbal: components.verbal,
    somatic: components.somatic,
    material: components.material,
    ritual: components.ritual,
    concentration: components.concentration,
    components: componentsText
  };
  
  return spell;
}

/**
 * Импортирует заклинания из текста
 */
export function importSpellsFromText(text: string, existingSpells: CharacterSpell[]): CharacterSpell[] {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const newSpells: CharacterSpell[] = [];
  
  lines.forEach((line) => {
    const spell = parseSpellEntry(line);
    if (spell) {
      // Проверяем, существует ли уже такое заклинание
      const existingIndex = existingSpells.findIndex(
        s => s.name === spell.name && s.level === spell.level
      );
      
      if (existingIndex >= 0) {
        // Обновляем существующее заклинание
        existingSpells[existingIndex] = {
          ...existingSpells[existingIndex],
          verbal: spell.verbal,
          somatic: spell.somatic,
          material: spell.material,
          ritual: spell.ritual,
          concentration: spell.concentration,
          components: spell.components
        };
      } else {
        // Добавляем новое заклинание
        newSpells.push(spell);
      }
    }
  });
  
  return [...existingSpells, ...newSpells];
}
