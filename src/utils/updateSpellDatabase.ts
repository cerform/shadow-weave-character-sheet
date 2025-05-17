
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';
import { parseComponents, createSpellKey, isDuplicateSpell } from './spellProcessors';

/**
 * Парсит заклинания из текстового формата [уровень] название компоненты
 */
export function importSpellsFromTextFormat(inputText: string, existingSpells: CharacterSpell[]): CharacterSpell[] {
  const lines = inputText.split('\n').filter(line => line.trim().length > 0);
  const existingSpellsMap = new Map<string, CharacterSpell>();
  const updatedSpells = [...existingSpells];
  
  // Создаем карту существующих заклинаний
  existingSpells.forEach(spell => {
    const key = createSpellKey(spell);
    existingSpellsMap.set(key, spell);
  });
  
  // Обрабатываем каждую строку текста
  for (const line of lines) {
    const spellEntry = parseSpellEntry(line);
    if (!spellEntry) continue;
    
    const { name, level, components } = spellEntry;
    const key = `${name.toLowerCase()}-${level}`;
    
    // Если заклинание уже существует, обновляем его компоненты
    if (existingSpellsMap.has(key)) {
      const existingSpellIndex = updatedSpells.findIndex(
        spell => spell.name.toLowerCase() === name.toLowerCase() && spell.level === level
      );
      
      if (existingSpellIndex >= 0) {
        updatedSpells[existingSpellIndex] = {
          ...updatedSpells[existingSpellIndex],
          ...components
        };
      }
    } else {
      // Иначе добавляем новое заклинание
      const newSpell: CharacterSpell = {
        name,
        level,
        school: 'Прорицание', // По умолчанию
        castingTime: '1 действие',
        range: 'На себя',
        duration: components.concentration ? 'Концентрация, до 1 минуты' : 'Мгновенная',
        description: 'Нет описания',
        classes: ['Волшебник'], // По умолчанию
        ...components
      };
      
      updatedSpells.push(newSpell);
    }
  }
  
  return updatedSpells;
}

/**
 * Анализирует строку заклинания
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
    components: string;
  }; 
} | null {
  // Извлекаем уровень заклинания [0], [1], и т.д.
  const levelMatch = line.match(/\[(\d+)\]/);
  if (!levelMatch) return null;
  
  const level = parseInt(levelMatch[1], 10);
  
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
  const parsedComponents = parseComponents(componentsText);
  
  return {
    name,
    level,
    components: {
      ...parsedComponents,
      components: componentsText
    }
  };
}
