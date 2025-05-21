
import { CharacterSpell } from '@/types/character';

// Helper function to parse spell texts
export const parseSpellEntry = (text: string): Partial<CharacterSpell> | null => {
  try {
    const nameMatch = text.match(/^([^(]+)/);
    const levelMatch = text.match(/(\d+)-й уровень|заговор/i);
    
    if (!nameMatch) return null;
    
    const name = nameMatch[1].trim();
    let level = 0;
    
    if (levelMatch) {
      if (levelMatch[0].toLowerCase().includes('заговор')) {
        level = 0;
      } else {
        level = parseInt(levelMatch[1] || '0', 10);
      }
    }
    
    // Extract school if available
    const schoolMatch = text.match(/(ограждение|вызов|прорицание|очарование|воплощение|иллюзия|некромантия|преобразование)/i);
    const school = schoolMatch ? schoolMatch[1].charAt(0).toUpperCase() + schoolMatch[1].slice(1).toLowerCase() : 'Универсальная';
    
    return {
      name,
      level,
      school,
      prepared: level === 0 // Cantrips are always prepared
    };
  } catch (error) {
    console.error('Error parsing spell:', error);
    return null;
  }
};

// Main import function
export const importSpellsFromText = (text: string, existingSpells: CharacterSpell[]): CharacterSpell[] => {
  if (!text.trim()) {
    return existingSpells;
  }
  
  try {
    // Split by newlines and process each spell
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const newSpells: CharacterSpell[] = [];
    
    for (const line of lines) {
      const spellData = parseSpellEntry(line);
      
      if (spellData && spellData.name) {
        // Check if this spell already exists (by name)
        const exists = existingSpells.some(spell => 
          spell.name.toLowerCase() === spellData.name?.toLowerCase()
        );
        
        if (!exists) {
          newSpells.push({
            name: spellData.name,
            level: spellData.level || 0,
            school: spellData.school,
            prepared: spellData.prepared || false
          });
        }
      }
    }
    
    // Combine existing and new spells
    return [...existingSpells, ...newSpells];
  } catch (error) {
    console.error('Error importing spells:', error);
    return existingSpells;
  }
};

// Function to process a batch of spells (providing compatibility with old code)
export const processSpellBatch = (text: string, existingSpells: CharacterSpell[]): CharacterSpell[] => {
  return importSpellsFromText(text, existingSpells);
};
