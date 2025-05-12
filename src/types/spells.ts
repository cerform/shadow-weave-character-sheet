
import { CharacterSpell } from './character';

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
  classes: string[] | string;
  ritual: boolean;
  concentration: boolean;
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  materials?: string;
  higherLevels?: string;
  source: string;
  prepared?: boolean;
}

export interface SpellFilters {
  name: string;
  schools: string[];
  levels: number[];
  classes: string[];
  ritual: boolean | null;
  concentration: boolean | null;
}

export function convertCharacterSpellToSpellData(spell: CharacterSpell): SpellData {
  // Гарантируем, что id будет строкой
  const id = typeof spell.id === 'number' ? String(spell.id) : 
            spell.id || `spell-${spell.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;

  // Полностью обрабатываем все возможные типы полей
  return {
    id: id,
    name: spell.name || '',
    level: typeof spell.level === 'number' ? spell.level : 0,
    school: spell.school || 'Универсальная',
    castingTime: spell.castingTime || '1 действие',
    range: spell.range || 'На себя',
    components: spell.components || '',
    duration: spell.duration || 'Мгновенная',
    description: spell.description || 'Нет описания',
    classes: Array.isArray(spell.classes) ? spell.classes : 
             spell.classes ? [spell.classes.toString()] : [],
    ritual: Boolean(spell.ritual),
    concentration: Boolean(spell.concentration),
    verbal: Boolean(spell.verbal),
    somatic: Boolean(spell.somatic),
    material: Boolean(spell.material),
    materials: spell.materials || '',
    source: spell.source || "Player's Handbook",
    higherLevels: spell.higherLevel || spell.higherLevels || '',
    prepared: Boolean(spell.prepared)
  };
}
