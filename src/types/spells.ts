
export interface SpellData {
  id: string;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string | string[];
  classes?: string[] | string;
  ritual?: boolean;
  concentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materials?: string;
  prepared?: boolean;
  higherLevels?: string;
  higherLevel?: string;
  source?: string;
}

// Add conversion function for CharacterSpell to SpellData
export const convertCharacterSpellToSpellData = (spell: any): SpellData => {
  return {
    id: spell.id || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}`,
    name: spell.name,
    level: spell.level || 0,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: Array.isArray(spell.description) ? spell.description : [spell.description || 'Нет описания'],
    classes: spell.classes || [],
    prepared: spell.prepared || false,
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    higherLevels: spell.higherLevels || spell.higherLevel || '',
    higherLevel: spell.higherLevel || spell.higherLevels || '',
    source: spell.source || ''
  };
};

// Add conversion function for SpellData to CharacterSpell
export const convertSpellDataToCharacterSpell = (spell: SpellData): any => {
  return {
    ...spell,
    // Make sure all required CharacterSpell properties are set
    name: spell.name,
    level: spell.level,
    id: spell.id // Передаем id из SpellData в CharacterSpell
  };
};

// Convert array of spells
export const convertSpellArray = (spells: any[]): SpellData[] => {
  return spells.map(spell => convertCharacterSpellToSpellData(spell));
};
