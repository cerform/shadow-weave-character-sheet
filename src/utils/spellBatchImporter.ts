
import { CharacterSpell } from '@/types/character';

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
    const componentsIndex = remainingText.search(/\s[ВСМ]+$/);
    let name = remainingText;
    let componentsText = '';
    
    if (componentsIndex > -1) {
      name = remainingText.substring(0, componentsIndex).trim();
      componentsText = remainingText.substring(componentsIndex).trim();
    }
    
    // Определяем компоненты
    const components = {
      verbal: componentsText.includes('В'),
      somatic: componentsText.includes('С'),
      material: componentsText.includes('М'),
      ritual: false,
      concentration: false
    };
    
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
