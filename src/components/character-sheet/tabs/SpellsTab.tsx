
// Fix for line 53 - converting string spells to CharacterSpell objects

// Add this utility function
const ensureCharacterSpellTypes = (spells: (string | CharacterSpell)[] | undefined): CharacterSpell[] => {
  if (!spells || !Array.isArray(spells)) return [];
  
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return { name: spell, level: 0 };
    }
    return spell;
  });
};

// Then use it when updating spells
const toggleSpellPrepared = (spellName: string) => {
  if (!character.spells) return;
  
  const typedSpells = ensureCharacterSpellTypes(character.spells);
  
  const updatedSpells = typedSpells.map(spell => {
    if (spell.name === spellName) {
      return { ...spell, prepared: !spell.prepared };
    }
    return spell;
  });
  
  onUpdate({ spells: updatedSpells });
};
