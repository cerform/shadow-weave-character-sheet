
/**
 * Parse spell components from the code string
 * Component codes:
 * В - Verbal
 * С - Somatic
 * М - Material
 * Р - Ritual
 * К - Concentration
 */
export const parseComponents = (componentCode: string): {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  ritual: boolean;
  concentration: boolean;
} => {
  return {
    verbal: componentCode.includes('В') || componentCode.includes('V'),
    somatic: componentCode.includes('С') || componentCode.includes('S'),
    material: componentCode.includes('М') || componentCode.includes('M'),
    ritual: componentCode.includes('Р') || componentCode.includes('R'),
    concentration: componentCode.includes('К') || componentCode.includes('K')
  };
};

/**
 * Build component string from boolean flags
 */
export const buildComponentString = (components: {
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
}): string => {
  let result = '';
  if (components.verbal) result += 'В';
  if (components.somatic) result += 'С';
  if (components.material) result += 'М';
  return result || '';
};
