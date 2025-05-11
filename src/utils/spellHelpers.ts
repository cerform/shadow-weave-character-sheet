
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

/**
 * Get spell level name in Russian
 */
export function getSpellLevelName(level: number): string {
  switch (level) {
    case 0:
      return 'Заговор';
    case 1:
      return '1-й уровень';
    case 2:
      return '2-й уровень';
    case 3:
      return '3-й уровень';
    case 4:
      return '4-й уровень';
    case 5:
      return '5-й уровень';
    case 6:
      return '6-й уровень';
    case 7:
      return '7-й уровень';
    case 8:
      return '8-й уровень';
    case 9:
      return '9-й уровень';
    default:
      return `${level}-й уровень`;
  }
}

/**
 * Convert character spells to spell data
 */
export function convertCharacterSpellsToSpellData(spells: CharacterSpell[]): SpellData[] {
  return spells.map(spell => {
    return {
      id: spell.id,
      name: spell.name,
      level: spell.level,
      school: spell.school || 'Универсальная',
      castingTime: spell.castingTime || '1 действие',
      range: spell.range || 'Касание',
      components: spell.components || '',
      duration: spell.duration || 'Мгновенная',
      description: spell.description || '',
      classes: spell.classes || [],
      verbal: spell.verbal,
      somatic: spell.somatic,
      material: spell.material,
      ritual: spell.ritual,
      concentration: spell.concentration,
      prepared: spell.prepared
    };
  });
}

