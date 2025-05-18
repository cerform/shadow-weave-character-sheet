
import { CharacterSpell } from '@/types/character';
import { SpellData, convertCharacterSpellToSpellData } from '@/types/spells';
import { 
  parseComponents, 
  checkDuplicateSpells, 
  removeDuplicates,
  convertToSpellData 
} from './spellProcessors';

/**
 * Импортирует заклинания из текстового формата и добавляет их в существующий массив
 * Формат: [уровень] название компоненты
 */
export function importSpellsFromTextFormat(
  textData: string,
  existingSpells: CharacterSpell[] | SpellData[]
): CharacterSpell[] {
  // Если строка пуста, возвращаем исходный массив
  if (!textData.trim()) {
    return existingSpells as CharacterSpell[];
  }

  // Разбиваем входные данные на строки
  const lines = textData.split('\n');
  
  // Массив для новых заклинаний
  const newSpells: CharacterSpell[] = [];
  
  // Карта для отслеживания существующих заклинаний
  const existingSpellsMap = new Map<string, CharacterSpell | SpellData>();
  existingSpells.forEach(spell => {
    const key = `${spell.name.toLowerCase()}-${spell.level}`;
    existingSpellsMap.set(key, spell);
  });
  
  // Обрабатываем каждую строку
  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine) return;
    
    // Регулярное выражение для извлечения уровня, названия и компонентов
    const match = trimmedLine.match(/^\[(\d+)\]\s+(.+?)(?:\s+([ВСМРКвсмрк]+))?$/);
    
    if (match) {
      const level = parseInt(match[1]);
      const name = match[2].trim();
      const componentsStr = match[3] || '';
      
      // Проверяем, существует ли уже такое заклинание
      const spellKey = `${name.toLowerCase()}-${level}`;
      if (existingSpellsMap.has(spellKey)) {
        // Заклинание уже существует, пропускаем
        console.log(`Пропуск дубликата: ${name} (уровень ${level})`);
        return;
      }
      
      // Парсим компоненты (В, С, М, Р, К)
      const components = parseComponents(componentsStr);
      
      // Создаем новое заклинание
      const newSpell: CharacterSpell = {
        id: `spell-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        name,
        level,
        verbal: components.verbal,
        somatic: components.somatic,
        material: components.material,
        ritual: components.ritual,
        concentration: components.concentration,
        components: componentsStr,
        school: 'Универсальная', // Значение по умолчанию
        castingTime: '1 действие', // Значение по умолчанию
        range: 'Касание', // Значение по умолчанию
        duration: 'Мгновенная', // Значение по умолчанию
        classes: [], // Будет заполнено позже
        source: 'Custom Import'
      };
      
      newSpells.push(newSpell);
      // Также добавляем в карту для отслеживания
      existingSpellsMap.set(spellKey, newSpell);
    }
  });
  
  console.log(`Импортировано ${newSpells.length} новых заклинаний`);
  
  // Объединяем существующие и новые заклинания
  return [...(existingSpells as CharacterSpell[]), ...newSpells];
}

// Экспортируем функции из spellProcessors
export { checkDuplicateSpells, removeDuplicates, convertToSpellData };
