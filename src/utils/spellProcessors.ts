
import { CharacterSpell } from '@/types/character';

/**
 * Maps component codes to their full component names
 * K - Verbal (Компонент вербальный)
 * В/V - Somatic (Компонент жестов)
 * С/S - Material (Материальный компонент)
 * Р/R - Ritual (Ритуальное заклинание)
 */
export const parseComponents = (componentCode: string): {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  ritual: boolean;
} => {
  return {
    verbal: componentCode.includes('К') || componentCode.includes('K'),
    somatic: componentCode.includes('В') || componentCode.includes('V'),
    material: componentCode.includes('С') || componentCode.includes('S') || componentCode.includes('М') || componentCode.includes('M'),
    ritual: componentCode.includes('Р') || componentCode.includes('R'),
  };
};

/**
 * Converts the component properties to a formatted string representation
 */
export const formatComponents = (spell: CharacterSpell): string => {
  const components: string[] = [];
  
  if (spell.verbal) components.push('В');
  if (spell.somatic) components.push('С');
  if (spell.material) components.push('М');
  
  let result = components.join(', ');
  if (spell.ritual) {
    result = 'Р, ' + result;
  }
  
  return result;
};

/**
 * Updates spell components based on the provided component string
 */
export const updateSpellComponents = (spell: CharacterSpell, componentString: string): CharacterSpell => {
  const components = parseComponents(componentString);
  
  return {
    ...spell,
    verbal: components.verbal,
    somatic: components.somatic,
    material: components.material,
    ritual: components.ritual
  };
};

/**
 * Helper to check if a spell exists in the array
 */
export const findSpellByName = (spells: CharacterSpell[], name: string): CharacterSpell | undefined => {
  return spells.find(spell => spell.name === name);
};
