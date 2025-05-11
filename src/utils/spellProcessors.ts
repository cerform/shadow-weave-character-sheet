
interface SpellComponents {
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  ritual?: boolean;
  concentration?: boolean;
  materialComponents?: string;
}

/**
 * Converts boolean components to a string representation
 */
export function componentsToString(components: SpellComponents): string {
  const result = [];
  
  if (components.verbal) result.push('В');
  if (components.somatic) result.push('С');
  if (components.material) result.push('М');
  
  return result.join('');
}

/**
 * Parse components string into boolean values
 */
export function parseComponents(componentsStr: string): SpellComponents {
  const components: SpellComponents = {
    verbal: false,
    somatic: false,
    material: false,
    ritual: false,
    concentration: false
  };
  
  if (!componentsStr) return components;
  
  // Convert to uppercase for consistency
  const upperComponents = componentsStr.toUpperCase();
  
  // Check for each component type
  components.verbal = upperComponents.includes('В') || upperComponents.includes('V');
  components.somatic = upperComponents.includes('С') || upperComponents.includes('S');
  components.material = upperComponents.includes('М') || upperComponents.includes('M');
  components.ritual = upperComponents.includes('РИТУАЛ') || upperComponents.includes('RITUAL') || upperComponents.includes('Р') || upperComponents.includes('R');
  components.concentration = upperComponents.includes('КОНЦЕНТРАЦИЯ') || upperComponents.includes('CONCENTRATION') || upperComponents.includes('К') || upperComponents.includes('C');
  
  return components;
}

/**
 * Extract material components description
 */
export function extractMaterialDescription(description: string): string | null {
  // Look for material component pattern in description
  const materialMatch = description.match(/\(M(?:aterial)?\s*:?\s*([^)]+)\)/i);
  if (materialMatch && materialMatch[1]) {
    return materialMatch[1].trim();
  }
  
  return null;
}
