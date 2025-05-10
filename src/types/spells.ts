
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

// Добавим функцию для конвертации CharacterSpell в SpellData
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
