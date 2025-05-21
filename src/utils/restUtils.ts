
import { Character } from '@/types/character';

export const handleShortRest = (character: Character): Partial<Character> => {
  const updates: Partial<Character> = {};
  
  // Handle resources that recover on short rest
  if (character.resources) {
    const updatedResources = { ...character.resources };
    Object.keys(updatedResources).forEach(key => {
      const resource = updatedResources[key];
      if (resource && (resource.recoveryType === 'short' || resource.recoveryType === 'short-rest')) {
        updatedResources[key] = {
          ...resource,
          used: 0
        };
      }
    });
    updates.resources = updatedResources;
  }
  
  // Additional short rest logic can be added here
  
  return updates;
};

export const handleLongRest = (character: Character): Partial<Character> => {
  const updates: Partial<Character> = {};
  
  // Reset all resources
  if (character.resources) {
    const updatedResources = { ...character.resources };
    Object.keys(updatedResources).forEach(key => {
      const resource = updatedResources[key];
      if (resource) {
        updatedResources[key] = {
          ...resource,
          used: 0
        };
      }
    });
    updates.resources = updatedResources;
  }
  
  // Restore hit dice (up to half of max)
  if (character.hitDice) {
    const maxRecovery = Math.max(1, Math.floor(character.level / 2));
    const currentUsed = character.hitDice.used || 0;
    const newUsed = Math.max(0, currentUsed - maxRecovery);
    
    updates.hitDice = {
      ...character.hitDice,
      used: newUsed
    };
  }
  
  // Restore HP to max
  updates.currentHp = character.maxHp;
  updates.tempHp = 0;
  
  // Restore sorcery points
  if (character.sorceryPoints) {
    updates.sorceryPoints = {
      ...character.sorceryPoints,
      current: character.sorceryPoints.max
    };
  }
  
  // Restore spell slots
  if (character.spellSlots) {
    const updatedSpellSlots = { ...character.spellSlots };
    Object.keys(updatedSpellSlots).forEach(level => {
      const numLevel = parseInt(level, 10);
      if (!isNaN(numLevel) && updatedSpellSlots[numLevel]) {
        updatedSpellSlots[numLevel] = {
          ...updatedSpellSlots[numLevel],
          used: 0
        };
      }
    });
    updates.spellSlots = updatedSpellSlots;
  }
  
  return updates;
};
