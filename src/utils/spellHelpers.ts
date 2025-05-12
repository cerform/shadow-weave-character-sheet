
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

// Normalize spell array that might contain strings or spell objects
export const normalizeSpells = (spells: any[]): CharacterSpell[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        name: spell,
        level: 0, // Default to cantrip if unknown
        prepared: true
      };
    }
    return spell;
  });
};

// Convert regular spells to SpellData format
export const convertToSpellData = (spells: any[]): SpellData[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  return spells.map(spell => {
    // If it's a string, create a minimal spell object
    if (typeof spell === 'string') {
      return {
        id: `spell-${Math.random().toString(36).substring(2, 11)}`,
        name: spell,
        level: 0,
        school: 'Unknown',
        castingTime: '1 action',
        range: 'Self',
        components: '',
        duration: 'Instantaneous',
        description: '',
        classes: [],
        ritual: false,
        concentration: false,
        verbal: false,
        somatic: false,
        material: false,
        source: 'Custom'
      };
    }
    
    // If it's already a spell object, ensure it has all required fields
    return {
      id: spell.id || `spell-${Math.random().toString(36).substring(2, 11)}`,
      name: spell.name || 'Unknown Spell',
      level: spell.level !== undefined ? spell.level : 0,
      school: spell.school || 'Unknown',
      castingTime: spell.castingTime || '1 action',
      range: spell.range || 'Self',
      components: spell.components || '',
      duration: spell.duration || 'Instantaneous',
      description: spell.description || '',
      classes: spell.classes || [],
      ritual: !!spell.ritual,
      concentration: !!spell.concentration,
      verbal: !!spell.verbal,
      somatic: !!spell.somatic,
      material: !!spell.material,
      materials: spell.materials || '',
      prepared: !!spell.prepared,
      source: spell.source || 'Custom'
    };
  });
};
