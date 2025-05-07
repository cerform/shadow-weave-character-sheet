import { Character } from '@/types/character';

export const normalizeCharacter = (character: any): Character => {
  const normalized: Character = {
    // Ensure we provide all required properties
    id: character.id || '',
    userId: character.userId || '',
    name: character.name || '',
    race: character.race || '',
    class: character.class || character.className || '',
    level: character.level || 1,
    background: character.background || '',
    alignment: character.alignment || '',
    experience: character.experience || 0,
    abilities: character.abilities || {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    proficiencyBonus: character.proficiencyBonus || 2,
    armorClass: character.armorClass || 10,
    maxHp: character.maxHp || 10,
    currentHp: character.currentHp || 10,
    temporaryHp: character.temporaryHp || 0,
    hitDice: character.hitDice || { total: 1, used: 0, type: 'd6' },
    deathSaves: character.deathSaves || { successes: 0, failures: 0 },
    inspiration: character.inspiration || false,
    conditions: character.conditions || [],
    inventory: character.inventory || [],
    equipment: character.equipment || [],
    spells: character.spells || [],
    proficiencies: character.proficiencies || [],
    features: character.features || [],
    notes: character.notes || '',
    resources: character.resources || {},
    savingThrowProficiencies: character.savingThrowProficiencies || [],
    skillProficiencies: character.skillProficiencies || [],
    expertise: character.expertise || [],
    skillBonuses: character.skillBonuses || {},
    spellcasting: character.spellcasting || {},
    gold: character.gold || 0,
    initiative: character.initiative || 0,
    lastDiceRoll: character.lastDiceRoll || { formula: '', rolls: [], total: 0 },
    
    // Add normalized languages if they exist
    languages: character.languages || []
  };
  
  return normalized;
};
