
/**
 * Generate a unique ID for a spell based on its name
 */
export function generateSpellId(name: string): string {
  return `spell-${name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '')}`;
}

/**
 * Extract spell details from text block
 */
export function extractSpellDetailsFromText(text: string): {
  name: string;
  level: number;
  school?: string;
  castingTime?: string;
  range?: string;
  components?: string;
  duration?: string;
  description?: string;
} {
  const lines = text.trim().split('\n');
  let name = '';
  let level = 0;
  let school = '';
  let castingTime = '';
  let range = '';
  let components = '';
  let duration = '';
  let description = '';
  
  // First line usually contains the name
  if (lines.length > 0) {
    name = lines[0].trim();
    
    // Check if the name contains level information
    const levelMatch = name.match(/(\d)(st|nd|rd|th) level|уровень|уровня/i);
    if (levelMatch) {
      level = parseInt(levelMatch[1], 10);
    } else if (name.toLowerCase().includes('cantrip') || name.toLowerCase().includes('заговор')) {
      level = 0;
    }
    
    // Try to extract school
    const schoolMatches = [
      'abjuration', 'conjuration', 'divination', 'enchantment', 'evocation', 'illusion', 'necromancy', 'transmutation',
      'ограждение', 'вызов', 'прорицание', 'очарование', 'воплощение', 'иллюзия', 'некромантия', 'преобразование'
    ];
    
    for (const schoolType of schoolMatches) {
      if (name.toLowerCase().includes(schoolType)) {
        school = schoolType.charAt(0).toUpperCase() + schoolType.slice(1);
        break;
      }
    }
  }
  
  // Look for specific keywords in the text
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim();
    
    if (line.includes('casting time') || line.includes('время накладывания')) {
      castingTime = lines[i].split(':')[1]?.trim() || '';
    } else if (line.includes('range') || line.includes('дистанция')) {
      range = lines[i].split(':')[1]?.trim() || '';
    } else if (line.includes('components') || line.includes('компоненты')) {
      components = lines[i].split(':')[1]?.trim() || '';
    } else if (line.includes('duration') || line.includes('длительность')) {
      duration = lines[i].split(':')[1]?.trim() || '';
    }
  }
  
  // Everything else is considered description
  const descStartIndex = Math.max(
    1,
    lines.findIndex(line => 
      line.toLowerCase().includes('duration:') || 
      line.toLowerCase().includes('длительность:') ||
      line.toLowerCase().includes('компоненты:') ||
      line.toLowerCase().includes('components:')
    ) + 1
  );
  
  if (descStartIndex < lines.length) {
    description = lines.slice(descStartIndex).join('\n').trim();
  }
  
  return {
    name,
    level,
    school,
    castingTime,
    range,
    components,
    duration,
    description
  };
}
