
interface SpellComponents {
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materials?: string;
  ritual?: boolean;
}

/**
 * Converts spell components to a readable string format
 */
export const componentsToString = (components: SpellComponents): string => {
  const parts: string[] = [];
  
  if (components.verbal) parts.push('В');
  if (components.somatic) parts.push('С');
  if (components.material) {
    if (components.materials) {
      parts.push(`М (${components.materials})`);
    } else {
      parts.push('М');
    }
  }
  
  return parts.length > 0 ? parts.join(', ') : 'Нет';
};

/**
 * Formats spell duration for display
 */
export const formatDuration = (duration: string): string => {
  if (!duration) return 'Мгновенная';
  
  // Common translations
  if (duration.toLowerCase().includes('concentration')) {
    return duration.replace(/concentration/i, 'Концентрация');
  }
  
  return duration;
};

/**
 * Formats spell range for display
 */
export const formatRange = (range: string): string => {
  if (!range) return 'На себя';
  
  // Common translations
  if (range.toLowerCase() === 'self') return 'На себя';
  if (range.toLowerCase() === 'touch') return 'Касание';
  if (range.toLowerCase().includes('feet') || range.toLowerCase().includes('ft')) {
    return range.replace(/feet|ft/i, 'фт');
  }
  
  return range;
};

/**
 * Gets the CSS color for a spell school
 */
export const getSpellSchoolColor = (school: string = ''): string => {
  const schoolColors: Record<string, string> = {
    'abjuration': '#5E81AC',    // синий
    'conjuration': '#81A1C1',   // голубой
    'divination': '#88C0D0',    // светло-голубой
    'enchantment': '#B48EAD',   // фиолетовый
    'evocation': '#BF616A',     // красный
    'illusion': '#D08770',      // оранжевый
    'necromancy': '#5E2750',    // темно-фиолетовый
    'transmutation': '#A3BE8C', // зеленый
    'universal': '#EBCB8B'      // желтый
  };
  
  const normalizedSchool = school.toLowerCase();
  return schoolColors[normalizedSchool] || schoolColors.universal;
};

/**
 * Вычисляет модификатор характеристики
 * Это функция-алиас для getAbilityModifier для обеспечения совместимости
 */
export const calculateModifier = (score: number): number => {
  return getAbilityModifier(score);
};

/**
 * Парсит компоненты из строкового формата (В, С, М)
 */
export const parseComponents = (componentsStr: string): SpellComponents => {
  const verbal = componentsStr.includes('В');
  const somatic = componentsStr.includes('С');
  const material = componentsStr.includes('М');
  const ritual = componentsStr.includes('ритуал');
  
  // Extract material components if available
  let materials = '';
  if (material && componentsStr.includes('(')) {
    const match = componentsStr.match(/М\s*\((.*?)\)/);
    materials = match ? match[1] : '';
  }
  
  return { verbal, somatic, material, materials, ritual };
};

// Import getAbilityModifier for the calculateModifier function
import { getAbilityModifier } from '@/utils/characterUtils';
