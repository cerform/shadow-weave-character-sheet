export interface SpellData {
  id: string | number;
  name: string;
  level: number;
  school: string;
  castingTime: string;
  range: string;
  components: string;
  duration: string;
  description: string | string[];
  classes: string[] | string;
  source?: string;
  ritual?: boolean;
  concentration?: boolean;
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materials?: string;
  prepared?: boolean;
  higherLevel?: string;
  higherLevels?: string;
}

export interface SpellbookEntry {
  id: string | number;
  userId: string;
  spellId: string | number;
  name: string;
  isFavorite: boolean;
  notes?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
  spell?: SpellData;
}

import { CharacterSpell } from './character';

export function getSpellLevelName(level: number): string {
  const spellLevels = [
    'Заговор',
    'Первый уровень',
    'Второй уровень',
    'Третий уровень',
    'Четвёртый уровень',
    'Пятый уровень',
    'Шестой уровень',
    'Седьмой уровень',
    'Восьмой уровень',
    'Девятый уровень',
  ];
  
  return spellLevels[level] || `Уровень ${level}`;
}

export function convertCharacterSpellToSpellData(spell: any): SpellData {
  return {
    id: spell.id || `spell-${Math.random().toString(36).substring(2, 11)}`,
    name: spell.name || '',
    level: typeof spell.level === 'number' ? spell.level : 0,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'Касание',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || '',
    classes: spell.classes || [],
    source: spell.source || '',
    ritual: !!spell.ritual,
    concentration: !!spell.concentration,
    verbal: !!spell.verbal,
    somatic: !!spell.somatic,
    material: !!spell.material,
    prepared: !!spell.prepared,
    materials: spell.materials || '',
    higherLevel: spell.higherLevel || '',
    higherLevels: spell.higherLevels || '',
  };
}

export function convertSpellDataToCharacterSpell(spell: SpellData): CharacterSpell {
  return {
    ...spell,
    name: spell.name,
    level: spell.level,
    id: spell.id
  };
}

export function convertSpellArray(spells: CharacterSpell[]): SpellData[] {
  return spells.map(spell => convertCharacterSpellToSpellData(spell));
}
