
import { SpellData } from '@/types/spells';

/**
 * Преобразует массив заклинаний в формат SpellData
 */
export const convertCharacterSpellsToSpellData = (spells: any[]): SpellData[] => {
  if (!spells || !Array.isArray(spells)) {
    return [];
  }
  
  return spells.map(spell => {
    // Проверяем, что у заклинания есть необходимые свойства
    const id = spell.id || `spell-${spell.name?.replace(/\s+/g, '-').toLowerCase() || Math.random().toString(36).substr(2, 9)}`;
    
    return {
      id,
      name: spell.name || 'Безымянное заклинание',
      level: typeof spell.level === 'number' ? spell.level : 0,
      school: spell.school || 'Универсальная',
      castingTime: spell.castingTime || '1 действие',
      range: spell.range || 'Касание',
      components: spell.components || 'В, С',
      duration: spell.duration || 'Мгновенная',
      description: spell.description || 'Нет описания',
      classes: spell.classes || [],
      ritual: !!spell.ritual,
      concentration: !!spell.concentration,
      verbal: !!spell.verbal,
      somatic: !!spell.somatic,
      material: !!spell.material,
      materials: spell.materials || ''
    };
  });
};

/**
 * Преобразует объект в формат SpellData
 */
export const convertToSpellData = (spell: any): SpellData => {
  if (!spell) {
    return {
      id: `spell-${Math.random().toString(36).substr(2, 9)}`,
      name: 'Безымянное заклинание',
      level: 0,
      school: 'Универсальная',
      castingTime: '1 действие',
      range: 'Касание',
      components: 'В, С',
      duration: 'Мгновенная',
      description: 'Нет описания',
      classes: []
    };
  }
  
  // Проверяем, что у заклинания есть необходимые свойства
  const id = spell.id || `spell-${spell.name?.replace(/\s+/g, '-').toLowerCase() || Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id,
    name: spell.name || 'Безымянное заклинание',
    level: typeof spell.level === 'number' ? spell.level : 0,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'Касание',
    components: spell.components || 'В, С',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || 'Нет описания',
    classes: spell.classes || [],
    ritual: !!spell.ritual,
    concentration: !!spell.concentration,
    verbal: !!spell.verbal,
    somatic: !!spell.somatic,
    material: !!spell.material,
    materials: spell.materials || '',
    higherLevel: spell.higherLevel || spell.higherLevels || ''
  };
};

/**
 * Получает название уровня заклинания
 */
export const getSpellLevelName = (level: number): string => {
  switch (level) {
    case 0: return 'Заговор';
    case 1: return '1-й уровень';
    case 2: return '2-й уровень';
    case 3: return '3-й уровень';
    case 4: return '4-й уровень';
    case 5: return '5-й уровень';
    case 6: return '6-й уровень';
    case 7: return '7-й уровень';
    case 8: return '8-й уровень';
    case 9: return '9-й уровень';
    default: return `${level}-й уровень`;
  }
};

/**
 * Получает количество заклинаний определенного уровня
 */
export const getSpellCountByLevel = (spells: SpellData[], level: number): number => {
  return spells.filter(spell => spell.level === level).length;
};

/**
 * Получает все уникальные школы магии из списка заклинаний
 */
export const getAllSpellSchools = (spells: SpellData[]): string[] => {
  const schools = new Set<string>();
  spells.forEach(spell => {
    if (spell.school) {
      schools.add(spell.school);
    }
  });
  return Array.from(schools).sort();
};

/**
 * Получает все уникальные классы из списка заклинаний
 */
export const getAllSpellClasses = (spells: SpellData[]): string[] => {
  const classes = new Set<string>();
  
  spells.forEach(spell => {
    if (spell.classes) {
      if (typeof spell.classes === 'string') {
        classes.add(spell.classes);
      } else if (Array.isArray(spell.classes)) {
        spell.classes.forEach(cls => classes.add(cls));
      }
    }
  });
  
  return Array.from(classes).sort();
};
