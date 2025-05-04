
import { safeSome, safeFilter } from '@/utils/spellUtils';
import { CharacterSpell, SpellData } from '@/types/character';

export const filterSpellsByName = (spells: SpellData[], searchTerm: string): SpellData[] => {
  if (!searchTerm.trim()) return spells;
  return safeFilter(spells, (spell) => safeSome(spell.name, searchTerm));
};

export const filterSpellsBySchool = (spells: SpellData[], schools: string[]): SpellData[] => {
  if (!schools.length) return spells;
  return safeFilter(spells, (spell) => {
    if (!spell.school) return false;
    return schools.some(school => safeSome(spell.school, school));
  });
};

export const filterSpellsByLevel = (spells: SpellData[], levels: number[]): SpellData[] => {
  if (!levels.length) return spells;
  return safeFilter(spells, (spell) => levels.includes(spell.level));
};

export const filterSpellsByComponents = (
  spells: SpellData[], 
  components: { verbal?: boolean; somatic?: boolean; material?: boolean }
): SpellData[] => {
  const { verbal, somatic, material } = components;
  if (!verbal && !somatic && !material) return spells;
  
  return safeFilter(spells, (spell) => {
    if (verbal && !spell.verbal) return false;
    if (somatic && !spell.somatic) return false;
    if (material && !spell.material) return false;
    return true;
  });
};

export const filterSpellsByClass = (spells: SpellData[], classes: string[]): SpellData[] => {
  if (!classes.length) return spells;
  
  return safeFilter(spells, (spell) => {
    if (!spell.classes) return false;
    
    if (Array.isArray(spell.classes)) {
      return spell.classes.some(spellClass => 
        classes.some(className => safeSome(spellClass, className))
      );
    }
    
    return classes.some(className => safeSome(spell.classes as string, className));
  });
};

export const filterSpellsByPrepared = (spells: CharacterSpell[], showPrepared: boolean): CharacterSpell[] => {
  if (!showPrepared) return spells;
  return safeFilter(spells, (spell) => spell.prepared);
};
