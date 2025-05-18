
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

/**
 * Преобразует компоненты заклинания в строку (В, С, М)
 */
export function componentsToString(spell: CharacterSpell | SpellData): string {
  const components: string[] = [];
  if (spell.verbal) components.push('В');
  if (spell.somatic) components.push('С');
  if (spell.material) components.push('М');
  
  return components.join(', ');
}

/**
 * Удаляет дубликаты заклинаний из массива
 */
export function removeDuplicateSpells(spells: CharacterSpell[]): CharacterSpell[] {
  // Создаем карту для отслеживания уникальных заклинаний по имени и уровню
  const uniqueSpells = new Map<string, CharacterSpell>();
  
  for (const spell of spells) {
    if (!spell.name) continue; // Пропускаем заклинания без имени
    
    // Создаем ключ на основе имени и уровня
    const key = `${spell.name.toLowerCase()}-${spell.level}`;
    
    // Если заклинание с таким ключом уже существует, пропускаем
    if (!uniqueSpells.has(key)) {
      uniqueSpells.set(key, spell);
    }
  }
  
  console.log(`Всего уникальных заклинаний после обработки: ${uniqueSpells.size}`);
  return Array.from(uniqueSpells.values());
}

/**
 * Обрабатывает описание заклинания
 */
export function processSpellDescription(description: string | string[]): string {
  if (Array.isArray(description)) {
    return description.join("\n\n");
  }
  return description || "Нет описания";
}

/**
 * Преобразует массив заклинаний из формата CharacterSpell в формат SpellData
 */
export function convertToSpellData(spells: CharacterSpell[]): SpellData[] {
  return spells.map(spell => ({
    id: spell.id?.toString() || `spell-${spell.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'Касание',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes || [],
    ritual: Boolean(spell.ritual),
    concentration: Boolean(spell.concentration),
    verbal: Boolean(spell.verbal),
    somatic: Boolean(spell.somatic),
    material: Boolean(spell.material),
    materials: spell.materials || '',
    source: spell.source || "Player's Handbook"
  }));
}

/**
 * Парсит компоненты заклинания из строки
 */
export function parseComponents(componentString: string): {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  ritual: boolean;
  concentration: boolean;
} {
  const verbal = /[Вв]/.test(componentString);
  const somatic = /[Сс]/.test(componentString);
  const material = /[Мм]/.test(componentString);
  const ritual = /[Рр]/.test(componentString);
  const concentration = /[Кк]/.test(componentString);
  
  return {
    verbal,
    somatic,
    material,
    ritual,
    concentration
  };
}

/**
 * Создает уникальный ключ для заклинания
 */
export function createSpellKey(spell: SpellData | CharacterSpell): string {
  return `${spell.name.toLowerCase().trim()}-${spell.level}`;
}

/**
 * Проверяет, является ли заклинание дубликатом
 */
export function isDuplicateSpell(spell: SpellData | CharacterSpell, existingSpells: Map<string, SpellData | CharacterSpell>): boolean {
  const key = createSpellKey(spell);
  return existingSpells.has(key);
}

/**
 * Объединяет два заклинания
 */
export function mergeSpells(existing: SpellData | CharacterSpell, newSpell: SpellData | CharacterSpell): SpellData | CharacterSpell {
  return {
    ...existing,
    ...newSpell,
    // Сохраняем описание из существующего заклинания, если новое пусто
    description: newSpell.description || existing.description
  };
}

/**
 * Проверяет наличие дубликатов заклинаний
 */
export function checkDuplicateSpells(spells: SpellData[] | CharacterSpell[]): { 
  hasDuplicates: boolean; 
  count: number;
  duplicates: Array<{name: string, level: number, count: number}> 
} {
  const spellCounts = new Map<string, number>();
  const duplicateInfo: Array<{name: string, level: number, count: number}> = [];
  
  // Подсчитываем количество каждого заклинания по ключу (имя+уровень)
  spells.forEach(spell => {
    const key = createSpellKey(spell);
    const count = (spellCounts.get(key) || 0) + 1;
    spellCounts.set(key, count);
  });
  
  // Находим дубликаты (где счетчик > 1)
  let totalDuplicates = 0;
  spellCounts.forEach((count, key) => {
    if (count > 1) {
      const [nameAndLevel] = key.split('-');
      const level = parseInt(key.split('-').pop() || "0");
      const name = key.substring(0, key.lastIndexOf('-')).replace(/-/g, ' ');
      
      duplicateInfo.push({ 
        name, 
        level, 
        count 
      });
      
      totalDuplicates += (count - 1); // Считаем лишние копии
    }
  });
  
  return {
    hasDuplicates: totalDuplicates > 0,
    count: totalDuplicates,
    duplicates: duplicateInfo
  };
}

/**
 * Удаляет дубликаты из массива заклинаний
 */
export function removeDuplicates(spells: SpellData[] | CharacterSpell[]): SpellData[] | CharacterSpell[] {
  const uniqueSpells = new Map<string, SpellData | CharacterSpell>();
  
  // Берем первую встреченную копию каждого заклинания
  spells.forEach(spell => {
    const key = createSpellKey(spell);
    if (!uniqueSpells.has(key)) {
      uniqueSpells.set(key, spell);
    }
  });
  
  return Array.from(uniqueSpells.values());
}
