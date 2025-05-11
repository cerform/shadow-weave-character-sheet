
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

/**
 * Extract spell details from text input
 */
export function extractSpellDetailsFromText(text: string): Partial<CharacterSpell> {
  const lines = text.trim().split('\n');
  const name = lines[0]?.trim() || 'Неизвестное заклинание';
  
  let level = 0;
  let school = 'Универсальная';
  let castingTime = '1 действие';
  let range = 'На себя';
  let components = '';
  let duration = 'Мгновенная';
  let description = '';
  
  // Extract level and school from first line if possible
  const levelMatch = name.match(/\d+\-го уровня|\d+\-й уровень|заговор/i);
  if (levelMatch) {
    const levelText = levelMatch[0].toLowerCase();
    if (levelText.includes('заговор')) {
      level = 0;
    } else {
      const digit = levelText.match(/\d+/);
      if (digit) level = parseInt(digit[0], 10);
    }
  }
  
  // Extract school from second line if possible
  const schoolMatch = lines[1]?.match(/вызов|ограждение|преобразование|прорицание|очарование|некромантия|иллюзия|воплощение|универсальная/i);
  if (schoolMatch) {
    school = schoolMatch[0];
  }
  
  // Extract other properties from subsequent lines
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    
    if (line.includes('время накладывания')) {
      castingTime = lines[i].split(':')[1]?.trim() || castingTime;
    } else if (line.includes('дистанция')) {
      range = lines[i].split(':')[1]?.trim() || range;
    } else if (line.includes('компоненты')) {
      components = lines[i].split(':')[1]?.trim() || components;
    } else if (line.includes('длительность')) {
      duration = lines[i].split(':')[1]?.trim() || duration;
    } else {
      // Collect remaining lines as description
      description += lines[i] + '\n';
    }
  }
  
  // Generate basic spell details
  return {
    name,
    level,
    school,
    castingTime,
    range,
    components,
    duration,
    description: description.trim(),
    prepared: false
  };
}

/**
 * Generate a unique ID for a spell
 */
export function generateSpellId(name: string): string {
  return `spell-${name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-zа-я0-9\-]/gi, '')}`;
}
