
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

/**
 * Преобразует компоненты заклинания в строку (В, С, М)
 */
export function componentsToString(spell: CharacterSpell): string {
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
