import { Character } from '@/types/character';

export const normalizeCharacter = (character: any): Character => {
  if (!character) return {} as Character;

  // Create a normalized character object
  const normalizedCharacter: Character = {
    ...character,
    // Ensure basic properties exist
    name: character.name || '',
    level: character.level || 1,
    class: character.class || character.className || '',
    race: character.race || '',
    background: character.background || '',
    alignment: character.alignment || '',
    
    // Normalize ability scores
    strength: character.strength || 10,
    dexterity: character.dexterity || 10,
    constitution: character.constitution || 10,
    intelligence: character.intelligence || 10,
    wisdom: character.wisdom || 10,
    charisma: character.charisma || 10,
    
    // Normalize HP values
    maxHp: character.maxHp || 0,
    currentHp: character.currentHp !== undefined ? character.currentHp : character.maxHp || 0,
    tempHp: character.tempHp || character.temporaryHp || 0,
    
    // Normalize other combat stats
    armorClass: character.armorClass || 10,
    initiative: character.initiative || 0,
    speed: character.speed || '30',
    
    // Normalize skills
    skills: character.skills ? Object.fromEntries(
      Object.entries(character.skills).map(([key, value]) => [key, normalizeSkill(value)])
    ) : {},
  };

  return normalizedCharacter;
};

const normalizeSkill = (skill: any) => {
  if (typeof skill === 'object') {
    // Return a properly structured skill object
    return {
      proficient: skill.proficient || false,
      expertise: skill.expertise || false,
      value: skill.value || 0,
      bonus: skill.bonus || 0
    };
  }
  return {
    proficient: false,
    expertise: false,
    value: 0,
    bonus: 0
  };
};
