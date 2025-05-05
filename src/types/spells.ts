
import { CharacterSpell } from './character';

export interface SpellData {
  id: string | number;
  name: string;
  level: number;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description: string | string[];
  classes: string[] | string;
  source?: string;
  
  // Дополнительные данные для отображения
  prepared?: boolean;
  ritual?: boolean;
  concentration?: boolean;
  materials?: string;
  
  // Компоненты заклинания
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  
  // Дополнительные эффекты на высоких уровнях
  higherLevel?: string;
  higherLevels?: string;
}

// Преобразование CharacterSpell в SpellData
export const convertCharacterSpellToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || ['Нет описания'],
    classes: spell.classes || [],
    source: spell.source || 'Книга игрока',
    prepared: spell.prepared || false,
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    materials: spell.materials || '',
    verbal: spell.verbal || false,
    somatic: spell.somatic || false,
    material: spell.material || false,
    higherLevel: spell.higherLevel || spell.higherLevels || '',
    higherLevels: spell.higherLevels || spell.higherLevel || '',
  };
};

// Преобразование SpellData в CharacterSpell
export const convertSpellDataToCharacterSpell = (spell: SpellData): CharacterSpell => {
  return {
    id: typeof spell.id === 'string' ? spell.id : `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: spell.components,
    duration: spell.duration,
    description: spell.description,
    classes: spell.classes,
    source: spell.source,
    prepared: spell.prepared,
    ritual: spell.ritual,
    concentration: spell.concentration,
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    materials: spell.materials,
    higherLevel: spell.higherLevel,
    higherLevels: spell.higherLevels
  };
};

// Добавляем функцию convertSpellArray, которая отсутствовала
export const convertSpellArray = (spells: CharacterSpell[]): SpellData[] => {
  return spells.map(spell => convertCharacterSpellToSpellData(spell));
};

// Преобразование строковых компонентов в объект
export const parseComponents = (componentsStr: string): { verbal: boolean; somatic: boolean; material: boolean; materials?: string } => {
  const result = {
    verbal: componentsStr.includes('В'),
    somatic: componentsStr.includes('С'),
    material: componentsStr.includes('М'),
    materials: ''
  };
  
  // Извлекаем материальные компоненты из скобок, если они есть
  const materialMatch = componentsStr.match(/М\s*\((.*?)\)/);
  if (materialMatch) {
    result.materials = materialMatch[1];
  }
  
  return result;
};

// Создание строки компонентов из флагов
export const componentsToString = (
  { verbal, somatic, material, ritual, concentration, materials }: 
  { verbal?: boolean; somatic?: boolean; material?: boolean; ritual?: boolean; concentration?: boolean; materials?: string }
): string => {
  const parts: string[] = [];
  
  if (verbal) parts.push('В');
  if (somatic) parts.push('С');
  if (material) parts.push('М' + (materials ? ` (${materials})` : ''));
  
  let result = parts.join(', ');
  
  if (ritual) result += ' (ритуал)';
  if (concentration) result += ' (концентрация)';
  
  return result;
};
