
import { CharacterSpell } from '@/types/character.d';
import { SpellData } from './types';

// Simple import utility for text-based spell descriptions
export const importSpellsFromText = (text: string): CharacterSpell[] => {
  if (!text || typeof text !== 'string') {
    return [];
  }

  try {
    // Simple parsing logic - this is a basic implementation
    // Split the text by double newlines which typically separate spell entries
    const spellBlocks = text.split(/\n\n+/);
    const spells: CharacterSpell[] = [];
    
    for (const block of spellBlocks) {
      if (!block.trim()) continue;
      
      const lines = block.split('\n');
      if (lines.length > 0) {
        const name = lines[0].trim();
        let level = 0;
        let school = 'Неизвестная';
        
        // Try to parse level and school
        if (lines.length > 1) {
          const secondLine = lines[1].toLowerCase();
          
          if (secondLine.includes('заговор')) {
            level = 0;
          } else {
            const levelMatch = secondLine.match(/(\d+)\s+уровень/);
            if (levelMatch) {
              level = parseInt(levelMatch[1], 10);
            }
          }
          
          // Extract school name if available
          const schoolMatches = [
            'воплощение', 'некромантия', 'очарование', 'преобразование',
            'прорицание', 'вызов', 'ограждение', 'иллюзия'
          ];
          
          for (const schoolName of schoolMatches) {
            if (secondLine.includes(schoolName)) {
              school = schoolName.charAt(0).toUpperCase() + schoolName.slice(1);
              break;
            }
          }
        }
        
        // Extract description
        const description = lines.slice(1).join('\n');
        
        // Create a new spell with mandatory school property
        spells.push({
          name,
          level,
          school,
          description,
          prepared: false
        });
      }
    }
    
    return spells;
  } catch (error) {
    console.error("Error parsing spell text:", error);
    return [];
  }
};
