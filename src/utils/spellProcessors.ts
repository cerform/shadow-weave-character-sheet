
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

// Тип для объекта с компонентами заклинания
type SpellComponentsObject = {
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  ritual?: boolean;
  concentration?: boolean;
  components?: string;
};

// Обрабатывает компоненты заклинания в удобный для отображения формат
export const componentsToString = (spell: CharacterSpell | SpellData | SpellComponentsObject): string => {
  // Если уже есть строка компонентов, возвращаем её
  if ('components' in spell && typeof spell.components === 'string' && spell.components) {
    return spell.components;
  }
  
  const components: string[] = [];
  
  if ('verbal' in spell && spell.verbal) components.push('В');
  if ('somatic' in spell && spell.somatic) components.push('С');
  if ('material' in spell && spell.material) components.push('М');
  
  let result = components.join(', ');
  
  if ('material' in spell && spell.material && 'materials' in spell && spell.materials) {
    result += ` (${spell.materials})`;
  }
  
  return result || 'Нет';
};

// Анализ компонентов заклинания из строкового представления
export const parseComponents = (componentString: string): {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  materials?: string;
  ritual: boolean;
  concentration: boolean;
} => {
  let materials: string | undefined;
  
  // Извлекаем материальные компоненты из скобок, если они есть
  const materialsMatch = componentString.match(/\(([^)]+)\)/);
  if (materialsMatch && materialsMatch[1]) {
    materials = materialsMatch[1].trim();
  }
  
  return {
    verbal: componentString.includes('В'),
    somatic: componentString.includes('С'),
    material: componentString.includes('М'),
    materials,
    ritual: componentString.toLowerCase().includes('р') || 
           componentString.includes('Р') || 
           componentString.toLowerCase().includes('r'),
    concentration: componentString.toLowerCase().includes('к') || 
                  componentString.includes('К') || 
                  componentString.toLowerCase().includes('c')
  };
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

// Создает уникальный ключ для заклинания на основе имени и уровня
export const createSpellKey = (name: string, level: number): string => {
  return `${name.toLowerCase().trim()}-${level}`;
};

// Проверяет, является ли заклинание дубликатом другого
export const isDuplicateSpell = (spell1: CharacterSpell, spell2: CharacterSpell): boolean => {
  return spell1.name.toLowerCase() === spell2.name.toLowerCase() && 
         spell1.level === spell2.level;
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
