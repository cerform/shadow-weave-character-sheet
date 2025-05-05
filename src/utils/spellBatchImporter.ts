
import { parseComponents } from './spellProcessors';

export interface SpellBatchItem {
  name: string;
  level: number;
  components: {
    verbal: boolean;
    somatic: boolean;
    material: boolean;
    ritual: boolean;
    concentration?: boolean;
  };
}

export const processSpellBatch = (rawText: string): SpellBatchItem[] => {
  const lines = rawText.split('\n').filter(line => line.trim().length > 0);
  const result: SpellBatchItem[] = [];
  
  for (const line of lines) {
    const match = line.match(/\[(\d+)\]\s+(.+?)\s+([\w\.]*)$/);
    
    if (match) {
      const level = parseInt(match[1], 10);
      const name = match[2].trim();
      const componentCode = match[3] || '';
      
      result.push({
        name,
        level,
        components: parseComponents(componentCode)
      });
    }
  }
  
  return result;
};
