
import { CharacterSpell } from '@/types/character';
import { allCantrips } from '@/data/spells/all_cantrips';
import { allLevel1Spells } from '@/data/spells/all_level1';
import { spells } from '@/data/spells';

/**
 * Обновляет базу данных заклинаний, добавляя новые заклинания
 * и обновляя существующие, если они уже есть в базе
 */
export function updateSpellDatabase(): CharacterSpell[] {
  // Получаем все существующие заклинания
  const existingSpells = [...spells];
  
  // Создаем карту существующих заклинаний по имени и уровню для быстрого поиска
  const spellMap = new Map<string, number>();
  existingSpells.forEach((spell, index) => {
    const key = `${spell.name}-${spell.level}`;
    spellMap.set(key, index);
  });
  
  // Функция для добавления/обновления заклинаний
  const addOrUpdateSpells = (newSpells: CharacterSpell[]) => {
    newSpells.forEach(newSpell => {
      const key = `${newSpell.name}-${newSpell.level}`;
      const existingIndex = spellMap.get(key);
      
      if (existingIndex !== undefined) {
        // Обновляем существующее заклинание
        existingSpells[existingIndex] = {
          ...existingSpells[existingIndex],
          verbal: newSpell.verbal,
          somatic: newSpell.somatic,
          material: newSpell.material,
          ritual: newSpell.ritual,
          concentration: newSpell.concentration,
          components: newSpell.components
        };
      } else {
        // Добавляем новое заклинание
        existingSpells.push(newSpell);
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
export function getSpellByName(name: string, spells: CharacterSpell[]): CharacterSpell | undefined {
  return spells.find(spell => spell.name.toLowerCase() === name.toLowerCase());
}

/**
 * Импортирует заклинания из текста в формате
 * [уровень] название ВСМ
 */
export function importSpellsFromTextFormat(text: string, existingSpells: CharacterSpell[]): CharacterSpell[] {
  const lines = text.split('\n').filter(line => line.trim() !== '');
  const result = [...existingSpells];
  
  lines.forEach(line => {
    // Регулярное выражение для извлечения уровня, имени и компонентов
    const match = line.match(/\[(\d+)\]\s+(.+?)(?:\s+([ВСМРКД\.]+))?$/);
    
    if (match) {
      const level = parseInt(match[1], 10);
      const name = match[2].trim();
      const componentStr = match[3] || '';
      
      // Проверяем наличие заклинания в текущем списке
      const existingIndex = result.findIndex(
        s => s.name.toLowerCase() === name.toLowerCase() && s.level === level
      );
      
      // Определяем компоненты
      const verbal = componentStr.includes('В');
      const somatic = componentStr.includes('С');
      const material = componentStr.includes('М');
      const ritual = componentStr.toLowerCase().includes('Р') || componentStr.toLowerCase().includes('Р');
      const concentration = componentStr.toLowerCase().includes('К');
      
      if (existingIndex >= 0) {
        // Обновляем существующее заклинание
        result[existingIndex] = {
          ...result[existingIndex],
          components: componentStr,
          verbal,
          somatic,
          material,
          ritual,
          concentration
        };
      } else {
        // Создаем новое заклинание с базовыми параметрами
        const newSpell: CharacterSpell = {
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
          concentration
        };
        
        result.push(newSpell);
      }
    }
  });
  
  return result;
}
