
import { CharacterSpell } from '@/types/character';
import { cantrips as allCantrips } from '@/data/spells/all_cantrips';
import { allLevel1Spells } from '@/data/spells/all_level1';
import { spells } from '@/data/spells';
import { SpellData, convertCharacterSpellToSpellData } from '@/types/spells';
import { createSpellKey, isDuplicateSpell } from './spellProcessors';

/**
 * Обновляет базу данных заклинаний, добавляя новые заклинания
 * и обновляя существующие, если они уже есть в базе
 */
export function updateSpellDatabase(): SpellData[] {
  // Получаем все существующие заклинания
  const existingSpells: SpellData[] = [...spells];
  
  // Создаем карту существующих заклинаний по имени и уровню для быстрого поиска
  const spellMap = new Map<string, number>();
  existingSpells.forEach((spell, index) => {
    const key = createSpellKey(spell.name, spell.level);
    spellMap.set(key, index);
  });
  
  // Функция для добавления/обновления заклинаний
  const addOrUpdateSpells = (newSpells: CharacterSpell[]) => {
    newSpells.forEach(newSpell => {
      const key = createSpellKey(newSpell.name, newSpell.level);
      const existingIndex = spellMap.get(key);
      
      if (existingIndex !== undefined) {
        // Обновляем существующее заклинание
        existingSpells[existingIndex] = {
          ...existingSpells[existingIndex],
          verbal: newSpell.verbal !== undefined ? newSpell.verbal : existingSpells[existingIndex].verbal,
          somatic: newSpell.somatic !== undefined ? newSpell.somatic : existingSpells[existingIndex].somatic,
          material: newSpell.material !== undefined ? newSpell.material : existingSpells[existingIndex].material,
          ritual: newSpell.ritual !== undefined ? newSpell.ritual : existingSpells[existingIndex].ritual,
          concentration: newSpell.concentration !== undefined ? newSpell.concentration : existingSpells[existingIndex].concentration,
          components: newSpell.components || existingSpells[existingIndex].components
        };
      } else {
        // Преобразуем и добавляем новое заклинание
        const spellData = convertCharacterSpellToSpellData(newSpell);
        existingSpells.push(spellData);
        spellMap.set(key, existingSpells.length - 1);
      }
    });
  };
  
  // Добавляем заклинания из новых списков
  addOrUpdateSpells(allCantrips);
  addOrUpdateSpells(allLevel1Spells);
  
  return existingSpells;
}

/**
 * Получает заклинание из базы по имени
 */
export function getSpellByName(name: string, spells: SpellData[]): SpellData | undefined {
  return spells.find(spell => spell.name.toLowerCase() === name.toLowerCase());
}

/**
 * Импортирует заклинания из текста в формате
 * [уровень] название ВСМ
 */
export function importSpellsFromTextFormat(text: string, existingSpells: SpellData[]): SpellData[] {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  // Создаем копию существующих заклинаний
  const result: SpellData[] = [...existingSpells];
  
  // Используем Map для отслеживания уникальных заклинаний по имени и уровню
  const uniqueSpells = new Map<string, number>();
  
  // Заполняем Map существующими заклинаниями
  existingSpells.forEach((spell, index) => {
    const key = createSpellKey(spell.name, spell.level);
    uniqueSpells.set(key, index);
  });
  
  // Счетчики для статистики
  let addedCount = 0;
  let updatedCount = 0;
  let duplicateCount = 0;
  
  lines.forEach(line => {
    // Регулярное выражение для извлечения уровня, имени и компонентов
    const match = line.match(/\[(\d+)\]\s+(.+?)(?:\s+([ВСМРКД\.]+))?$/);
    
    if (match) {
      const level = parseInt(match[1], 10);
      const name = match[2].trim();
      const componentStr = match[3] || '';
      
      const uniqueKey = createSpellKey(name, level);
      
      // Определяем компоненты
      const verbal = componentStr.includes('В');
      const somatic = componentStr.includes('С');
      const material = componentStr.includes('М');
      const ritual = componentStr.toLowerCase().includes('р') || 
                     componentStr.toLowerCase().includes('r') || 
                     componentStr.includes('Р');
      const concentration = componentStr.toLowerCase().includes('к') || 
                           componentStr.toLowerCase().includes('c') || 
                           componentStr.includes('К');
      
      // Проверяем наличие заклинания в уникальном Map
      if (uniqueSpells.has(uniqueKey)) {
        // Обновляем существующее заклинание
        const existingIndex = uniqueSpells.get(uniqueKey)!;
        result[existingIndex] = {
          ...result[existingIndex],
          components: componentStr,
          verbal,
          somatic,
          material,
          ritual,
          concentration
        };
        updatedCount++;
      } else {
        // Создаем новое заклинание с базовыми параметрами
        const newSpell: SpellData = {
          id: `imported-${Date.now()}-${level}-${name.toLowerCase().replace(/\s+/g, '-')}`,
          name,
          level,
          school: "Универсальная", // По умолчанию
          castingTime: "1 действие", // По умолчанию
          range: "На себя", // По умолчанию
          components: componentStr,
          duration: concentration ? "Концентрация, вплоть до 1 минуты" : "Мгновенная",
          description: "Описание отсутствует",
          classes: ["Универсальный"], // По умолчанию
          verbal,
          somatic,
          material,
          ritual,
          concentration,
          source: "Custom",
        };
        
        result.push(newSpell);
        uniqueSpells.set(uniqueKey, result.length - 1);
        addedCount++;
      }
    }
  });
  
  console.log(`Импорт заклинаний: добавлено ${addedCount}, обновлено ${updatedCount}, дубликатов ${duplicateCount}`);
  
  return result;
}

/**
 * Проверяет базу данных заклинаний на наличие дубликатов
 */
export function checkDuplicateSpells(spells: SpellData[]): { 
  hasDuplicates: boolean; 
  count: number;
  duplicates: Array<{name: string, level: number, count: number}>
} {
  const spellGroups = new Map<string, SpellData[]>();
  
  // Группируем заклинания по имени и уровню
  spells.forEach(spell => {
    const key = createSpellKey(spell.name, spell.level);
    if (!spellGroups.has(key)) {
      spellGroups.set(key, []);
    }
    spellGroups.get(key)!.push(spell);
  });
  
  // Находим группы с более чем 1 заклинанием (дубликаты)
  const duplicates: Array<{name: string, level: number, count: number}> = [];
  let totalDuplicates = 0;
  
  spellGroups.forEach((group, key) => {
    if (group.length > 1) {
      duplicates.push({
        name: group[0].name,
        level: group[0].level,
        count: group.length
      });
      totalDuplicates += group.length - 1;
    }
  });
  
  return {
    hasDuplicates: totalDuplicates > 0,
    count: totalDuplicates,
    duplicates: duplicates.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name))
  };
}

/**
 * Удаляет дубликаты из базы данных заклинаний
 */
export function removeDuplicates(spells: SpellData[]): SpellData[] {
  const uniqueSpells = new Map<string, SpellData>();
  
  // Проходим по всем заклинаниям и оставляем только уникальные
  spells.forEach(spell => {
    const key = createSpellKey(spell.name, spell.level);
    // Если заклинание уже есть, выбираем то, у которого больше полей заполнено
    if (!uniqueSpells.has(key) || countDefinedProps(spell) > countDefinedProps(uniqueSpells.get(key)!)) {
      uniqueSpells.set(key, spell);
    }
  });
  
  return Array.from(uniqueSpells.values());
}

/**
 * Подсчитывает количество определенных свойств в объекте
 */
function countDefinedProps(obj: any): number {
  return Object.keys(obj).filter(key => 
    obj[key] !== undefined && 
    obj[key] !== null && 
    obj[key] !== '' && 
    !(Array.isArray(obj[key]) && obj[key].length === 0)
  ).length;
}

