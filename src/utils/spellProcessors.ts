
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

// Обрабатывает компоненты заклинания в удобный для отображения формат
export const componentsToString = (spell: CharacterSpell | SpellData): string => {
  if (spell.components) {
    return spell.components;
  }
  
  const components: string[] = [];
  
  if (spell.verbal) components.push('В');
  if (spell.somatic) components.push('С');
  if (spell.material) components.push('М');
  
  let result = components.join(', ');
  
  if (spell.material && spell.materials) {
    result += ` (${spell.materials})`;
  }
  
  return result || 'Нет';
};

// Обрабатывает описание заклинания для правильного отображения
export const processSpellDescription = (description: string | string[]): string[] => {
  if (!description) return ['Нет описания'];
  
  if (typeof description === 'string') {
    return description.split('\n');
  }
  
  if (Array.isArray(description)) {
    return description;
  }
  
  return ['Нет описания'];
};

// Удаляет дубликаты заклинаний из массива
export const removeDuplicateSpells = (spells: CharacterSpell[]): CharacterSpell[] => {
  const uniqueSpells = new Map<string, CharacterSpell>();
  
  spells.forEach(spell => {
    const key = `${spell.name.toLowerCase()}-${spell.level}`;
    
    if (!uniqueSpells.has(key)) {
      uniqueSpells.set(key, spell);
    } else {
      // Если есть дубликат, выбираем более полный объект
      const existing = uniqueSpells.get(key)!;
      const merged = mergeSpellObjects(existing, spell);
      uniqueSpells.set(key, merged);
    }
  });
  
  return Array.from(uniqueSpells.values());
};

// Объединяет два объекта заклинаний, выбирая непустые поля
export const mergeSpellObjects = (spell1: CharacterSpell, spell2: CharacterSpell): CharacterSpell => {
  return {
    id: spell1.id || spell2.id,
    name: spell1.name || spell2.name,
    level: spell1.level || spell2.level || 0,
    school: spell1.school || spell2.school,
    castingTime: spell1.castingTime || spell2.castingTime,
    range: spell1.range || spell2.range,
    components: spell1.components || spell2.components,
    duration: spell1.duration || spell2.duration,
    description: spell1.description || spell2.description,
    classes: spell1.classes || spell2.classes,
    ritual: spell1.ritual || spell2.ritual,
    concentration: spell1.concentration || spell2.concentration,
    verbal: spell1.verbal || spell2.verbal,
    somatic: spell1.somatic || spell2.somatic,
    material: spell1.material || spell2.material,
    materials: spell1.materials || spell2.materials,
    prepared: spell1.prepared || spell2.prepared,
    source: spell1.source || spell2.source,
    higherLevel: spell1.higherLevel || spell2.higherLevel,
    higherLevels: spell1.higherLevels || spell2.higherLevels,
    higher_level: spell1.higher_level || spell2.higher_level
  };
};

// Функция форматирования строк классов для отображения
export const formatClassesString = (classes: string[] | string | undefined): string => {
  if (!classes) return "—";
  if (typeof classes === 'string') return classes;
  if (Array.isArray(classes)) return classes.join(', ');
  return "—";
};
