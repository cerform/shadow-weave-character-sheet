
/**
 * Extract spell names from either string or spell object arrays
 */
export const extractSpellNames = (spells: any[]): string[] => {
  return spells.map(spell => {
    if (typeof spell === 'string') return spell;
    return spell.name || '';
  }).filter(Boolean);
};

export default {
  extractSpellNames
};
