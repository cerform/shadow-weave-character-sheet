
// Fix the specific lines that have type errors (112 and 169)
// Since the file is large, we'll just update the problematic functions

// For line 112 error - equipment conversion
const getEquipmentList = (character: Character) => {
  if (!character.equipment) return [];
  
  // Check if equipment is an array of Item objects
  if (Array.isArray(character.equipment)) {
    // Convert Item[] to string[] for display
    return character.equipment.map(item => 
      typeof item === 'string' ? item : `${item.name} (${item.quantity || 1})`
    );
  }
  
  // Handle old equipment format
  const equipment = character.equipment as { weapons: string[], armor: string, items: string[] };
  const weaponsList = equipment.weapons || [];
  const armorItem = equipment.armor ? [equipment.armor] : [];
  const itemsList = equipment.items || [];
  
  return [...weaponsList, ...armorItem, ...itemsList];
};

// For line 169 error - spells conversion
const getSpellsList = (character: Character) => {
  if (!character.spells) return [];
  
  // Convert CharacterSpell[] to string[] for display
  return character.spells.map(spell => {
    if (typeof spell === 'string') return spell;
    return `${spell.name} (${spell.level === 0 ? 'Заговор' : `${spell.level} уровень`})${spell.prepared ? ' ✓' : ''}`;
  });
};
