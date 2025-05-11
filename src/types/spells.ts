
// Add or update this export in the spells.ts file
export interface CharacterSpell {
  id?: string;
  name: string;
  level: number;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description?: string;
  classes?: string[];
  source?: string;
  ritual?: boolean;
  concentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  prepared?: boolean;
  materials?: string;
  higherLevel?: string;
  higherLevels?: string;
}

export interface SpellData {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string;
  classes: string[];
  source: string;
  ritual: boolean;
  concentration: boolean;
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  materials?: string;
  prepared?: boolean;
  higherLevel?: string;
  higherLevels?: string;
}

// Utility functions for spells
export const convertCharacterSpellToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    id: spell.id || `spell-${Math.random().toString(36).substring(2, 11)}`,
    name: spell.name,
    level: spell.level,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'Касание',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes || [],
    ritual: !!spell.ritual,
    concentration: !!spell.concentration,
    verbal: !!spell.verbal,
    somatic: !!spell.somatic,
    material: !!spell.material,
    prepared: !!spell.prepared,
    materials: spell.materials || '',
    higherLevel: spell.higherLevel || '',
    higherLevels: spell.higherLevels || '',
    source: spell.source || ''
  };
};

export const convertSpellDataToCharacterSpell = (spell: SpellData): CharacterSpell => {
  return {
    id: spell.id,
    name: spell.name,
    level: spell.level,
    school: spell.school,
    castingTime: spell.castingTime,
    range: spell.range,
    components: spell.components,
    duration: spell.duration,
    description: spell.description,
    classes: spell.classes,
    ritual: spell.ritual,
    concentration: spell.concentration,
    verbal: spell.verbal,
    somatic: spell.somatic,
    material: spell.material,
    prepared: spell.prepared,
    materials: spell.materials,
    higherLevel: spell.higherLevel,
    higherLevels: spell.higherLevels,
    source: spell.source
  };
};

export const convertSpellArray = (spells: (string | CharacterSpell)[]): SpellData[] => {
  return spells
    .filter((spell): spell is CharacterSpell => typeof spell !== 'string')
    .map(convertCharacterSpellToSpellData);
};
