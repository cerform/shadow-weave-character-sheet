
import { CharacterSpell } from './character';

export interface SpellData {
  id: string | number;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string | string[];
  classes: string | string[];
  ritual?: boolean;
  concentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materials?: string;
}

// Функция для преобразования CharacterSpell в SpellData
export const convertCharacterSpellToSpellData = (spell: CharacterSpell): SpellData => {
  if (!spell) {
    console.error("Attempted to convert undefined or null spell");
    // Возвращаем дефолтное заклинание с минимальной информацией
    return {
      id: `default-${Date.now()}`,
      name: "Неизвестное заклинание",
      level: 0,
      school: "Универсальная",
      castingTime: "1 действие",
      range: "Касание",
      components: "",
      duration: "Мгновенная",
      description: "",
      classes: [],
    };
  }
  
  return {
    id: spell.id?.toString() || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'Касание',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes || [],
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    verbal: spell.verbal || false,
    somatic: spell.somatic || false,
    material: spell.material || false,
    materials: spell.materials || ''
  };
};

// Функция для преобразования массива CharacterSpell в массив SpellData
export const convertSpellArray = (spells: CharacterSpell[]): SpellData[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  return spells.map(spell => {
    if (typeof spell === 'string') {
      // Если заклинание представлено строкой, создаем минимальный объект
      return {
        id: `spell-${spell.replace(/\s+/g, '-').toLowerCase()}`,
        name: spell,
        level: 0,
        school: 'Универсальная',
        castingTime: '1 действие',
        range: 'Касание',
        components: '',
        duration: 'Мгновенная',
        description: '',
        classes: [],
      };
    }
    
    return convertCharacterSpellToSpellData(spell);
  });
};

// Функция для преобразования SpellData в CharacterSpell
export const convertSpellDataToCharacterSpell = (spell: SpellData): CharacterSpell => {
  return {
    id: spell.id.toString(),
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: spell.components,
    duration: spell.duration,
    description: spell.description,
    classes: spell.classes,
    ritual: spell.ritual,
    concentration: spell.concentration,
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    materials: spell.materials,
    prepared: true // По умолчанию заклинания считаются подготовленными
  };
};
