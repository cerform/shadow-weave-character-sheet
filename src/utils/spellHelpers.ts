
import { SpellData } from '@/types/spells';
import { CharacterSpell } from '@/types/character';

/**
 * Получает все уникальные классы из списка заклинаний
 */
export function getAllSpellClasses(spells: SpellData[]): string[] {
  const classes = new Set<string>();
  
  spells.forEach(spell => {
    if (Array.isArray(spell.classes)) {
      spell.classes.forEach(cls => classes.add(cls));
    } else if (typeof spell.classes === 'string') {
      classes.add(spell.classes);
    }
  });
  
  return [...classes].sort();
}

/**
 * Получает все уникальные школы магии из списка заклинаний
 */
export function getAllSpellSchools(spells: SpellData[]): string[] {
  const schools = new Set<string>();
  
  spells.forEach(spell => {
    if (spell.school) {
      schools.add(spell.school);
    }
  });
  
  return [...schools].sort();
}

/**
 * Конвертирует заклинание из формата CharacterSpell в SpellData
 */
export function convertToSpellData(spell: CharacterSpell | string): SpellData {
  if (typeof spell === 'string') {
    // Если передана строка, создаем минимальный объект SpellData
    return {
      id: `spell-${spell.toLowerCase().replace(/\s+/g, '-')}`,
      name: spell,
      level: 0, // По умолчанию заговор
      school: 'Универсальная',
      castingTime: '1 действие',
      range: 'Касание',
      components: 'В, С',
      duration: 'Мгновенная',
      description: 'Нет описания',
      classes: []
    };
  }
  
  // Проверяем, что spell - это объект и у него есть все необходимые поля
  return {
    id: spell.id || `spell-${spell.name.toLowerCase().replace(/\s+/g, '-')}`,
    name: spell.name,
    level: spell.level || 0,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'Касание',
    components: spell.components || 'В, С',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || 'Нет описания',
    classes: spell.classes || [],
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    materials: spell.materials
  };
}

/**
 * Конвертирует массив заклинаний CharacterSpell в массив SpellData
 */
export function convertCharacterSpellsToSpellData(spells: CharacterSpell[]): SpellData[] {
  return spells.map(spell => convertToSpellData(spell));
}
