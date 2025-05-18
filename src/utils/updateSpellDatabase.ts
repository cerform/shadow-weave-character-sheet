
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';
import { parseComponents, convertToSpellData, checkDuplicateSpells, removeDuplicates } from './spellProcessors';

/**
 * Импортирует заклинания из текстового формата
 * Формат: [уровень] название компоненты
 */
export function importSpellsFromTextFormat(text: string, existingSpells: CharacterSpell[] = []): CharacterSpell[] {
  // Получаем все строки и фильтруем пустые
  const lines = text.split('\n').filter(line => line.trim() !== '');
  console.log(`Импортирую ${lines.length} строк с заклинаниями`);
  
  // Для отслеживания уникальности заклинаний
  const spellsMap = new Map<string, CharacterSpell>();
  
  // Заполняем карту существующими заклинаниями
  for (const spell of existingSpells) {
    if (!spell.name) continue;
    const key = `${spell.name.toLowerCase()}-${spell.level}`;
    spellsMap.set(key, spell);
  }

  // Импортируем заклинания из строк
  for (const line of lines) {
    try {
      // Обрабатываем строку формата: [уровень] название компоненты
      const levelMatch = line.match(/\[(\d+)\]/);
      if (!levelMatch) {
        console.warn(`Пропускаю строку с неверным форматом: ${line}`);
        continue;
      }
      
      const level = parseInt(levelMatch[1]);
      
      // Удаляем [уровень] из строки и получаем остальное
      const rest = line.replace(/\[\d+\]/, '').trim();
      
      // Разделяем название и компоненты
      const componentsMatch = rest.match(/(.*?)\s+([ВСМРКвсмрк]+)$/);
      if (!componentsMatch) {
        console.warn(`Пропускаю строку без компонентов: ${line}`);
        continue;
      }
      
      const name = componentsMatch[1].trim();
      const componentString = componentsMatch[2].trim();
      
      // Парсим компоненты
      const { verbal, somatic, material, ritual, concentration } = parseComponents(componentString);
      
      // Создаем объект заклинания
      const spell: CharacterSpell = {
        id: `imported-spell-${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        name,
        level,
        verbal,
        somatic,
        material,
        ritual,
        concentration,
        components: componentString,
        school: 'Универсальная', // По умолчанию
        source: 'PHB' // По умолчанию
      };
      
      // Проверяем на дубликаты по имени и уровню
      const key = `${name.toLowerCase()}-${level}`;
      if (!spellsMap.has(key)) {
        spellsMap.set(key, spell);
      } else {
        console.log(`Пропускаю дубликат: ${name} (уровень ${level})`);
      }
    } catch (error) {
      console.error(`Ошибка при обработке строки: ${line}`, error);
    }
  }
  
  console.log(`Импортировано заклинаний: ${spellsMap.size - existingSpells.length}`);
  return Array.from(spellsMap.values());
}

// Реэкспортируем функции из spellProcessors для обратной совместимости
export { convertToSpellData, checkDuplicateSpells, removeDuplicates };
