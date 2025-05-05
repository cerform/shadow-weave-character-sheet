import { CharacterSpell } from '@/types/character';

export interface SpellBatchItem {
  name: string;
  level: number;
  components: {
    verbal: boolean;
    somatic: boolean;
    material: boolean;
    ritual: boolean;
  };
}

export const processSpellBatch = (rawText: string): SpellBatchItem[] => {
  const lines = rawText.trim().split('\n');
  const batchItems: SpellBatchItem[] = [];
  
  lines.forEach(line => {
    const parts = line.split(';');
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const level = parseInt(parts[1].trim(), 10);
      
      if (!isNaN(level)) {
        const componentsString = parts[2] ? parts[2].trim().toUpperCase() : '';
        const components = parseComponents(componentsString);
        
        batchItems.push({
          name,
          level,
          components
        });
      }
    }
  });
  
  return batchItems;
};

export const parseComponents = (componentsString: string): SpellBatchItem['components'] => {
  return {
    verbal: componentsString.includes('V'),
    somatic: componentsString.includes('S'),
    material: componentsString.includes('M'),
    ritual: componentsString.includes('R')
  };
};

export const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string, 
  level: number
): { cantrips: number; known: number; prepared?: number } => {
  switch (characterClass) {
    case 'Бард':
      return {
        cantrips: Math.min(4, 2 + Math.floor(level / 4)),
        known: Math.min(22, level + 3)
      };
    case 'Жрец':
    case 'Друид':
      return {
        cantrips: Math.min(5, 3 + Math.floor(level / 4)),
        prepared: level + Math.max(0, Math.floor((level - 8) / 4))
      };
    case 'Волшебник':
      return {
        cantrips: Math.min(5, 3 + Math.floor(level / 4)),
        prepared: level + 1
      };
    case 'Колдун':
      return {
        cantrips: Math.min(4, 2 + Math.floor(level / 6)),
        known: Math.min(15, level + (level > 9 ? 4 : level > 3 ? 3 : 2))
      };
    case 'Чародей':
      return {
        cantrips: Math.min(6, 4 + Math.floor(level / 6)),
        known: Math.min(15, level + 1)
      };
    default:
      return {
        cantrips: 0,
        known: 0
      };
  }
};

// Add missing function to ensure it's exported
export const parseSpellComponents = (spell: CharacterSpell): { 
  verbal: boolean; 
  somatic: boolean; 
  material: boolean; 
  materialComponents?: string;
} => {
  return {
    verbal: spell.verbal || spell.components?.includes('В') || false,
    somatic: spell.somatic || spell.components?.includes('С') || false,
    material: spell.material || spell.components?.includes('М') || false,
    materialComponents: spell.materialComponents || ''
  };
};
