
// Fix for lines 195 and 214 - converting string spells to CharacterSpell objects

// Add this utility function at the top of the component
const ensureCharacterSpellTypes = (spells: (string | CharacterSpell)[] | undefined): CharacterSpell[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return { name: spell, level: 0 };
    }
    return spell;
  });
};

// Then use it in addSpellToCharacter function
const addSpellToCharacter = (spell: CharacterSpell) => {
  if (isSpellAdded(spell.name)) {
    toast({
      title: "Заклинание уже добавлено",
      description: `Заклинание ${spell.name} уже в списке известных заклинаний`
    });
    return;
  }
  
  // Convert any existing spells and add the new one
  const existingSpells = ensureCharacterSpellTypes(character.spells);
  const updatedSpells: CharacterSpell[] = [...existingSpells, spell];
  
  onUpdate({ spells: updatedSpells });
  
  toast({
    title: "Заклинание добавлено",
    description: `Заклинание ${spell.name} добавлено в список известных заклинаний`
  });
};

// Also fix the toggleSpellPrepared function
const toggleSpellPrepared = (spell: CharacterSpell) => {
  if (!character.spells) return;
  
  // Convert any string spells to CharacterSpell objects
  const typedSpells = ensureCharacterSpellTypes(character.spells);
  
  const updatedSpells: CharacterSpell[] = typedSpells.map(existingSpell => {
    if (existingSpell.name === spell.name) {
      return { ...existingSpell, prepared: !existingSpell.prepared };
    }
    return existingSpell;
  });
  
  onUpdate({ spells: updatedSpells });
};
