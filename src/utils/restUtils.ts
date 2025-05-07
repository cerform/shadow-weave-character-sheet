
import { Character } from '@/types/character';
import { useToast } from '@/hooks/use-toast';

// Assuming this is a mock for first examples
export const performShortRest = (character: Character, hitDiceToUse: number = 0): Partial<Character> => {
  if (!character) return {};
  
  // Create updated character with necessary adjustments for short rest
  const updatedCharacter: Partial<Character> = {
    // Reset any 'short rest' resources
    resources: { ...character.resources },
    // Update hit dice if using any
    hitDice: {
      ...character.hitDice,
      used: character.hitDice.used + hitDiceToUse,
      // This line had an error - removing "available" as it's not in the type
      // available: character.hitDice.total - character.hitDice.used - hitDiceToUse
    }
  };
  
  // Update resources that recover on short rest
  if (character.resources) {
    Object.entries(character.resources).forEach(([key, resource]) => {
      if (resource.shortRestRecover) {
        updatedCharacter.resources![key] = {
          ...resource,
          used: 0
        };
      }
    });
  }
  
  // Calculate HP gained from hit dice
  let hpGained = 0;
  if (hitDiceToUse > 0) {
    const conModifier = Math.floor((character.abilities.constitution - 10) / 2);
    const dieType = character.hitDice.type.replace('d', ''); // e.g., 'd8' -> '8'
    const dieValue = parseInt(dieType);
    
    // Roll hit dice
    for (let i = 0; i < hitDiceToUse; i++) {
      // Roll a die with the appropriate number of sides
      const roll = Math.floor(Math.random() * dieValue) + 1;
      hpGained += roll + conModifier;
    }
    
    // Update HP, not exceeding max
    const newHP = Math.min(character.currentHp + hpGained, character.maxHp);
    updatedCharacter.currentHp = newHP;
  }
  
  return updatedCharacter;
};

export const performLongRest = (character: Character): Partial<Character> => {
  if (!character) return {};
  
  // Create updated character with necessary adjustments for long rest
  const updatedCharacter: Partial<Character> = {
    // Reset HP to maximum
    currentHp: character.maxHp,
    // Reset temporary HP
    temporaryHp: 0,
    // Reset death saving throws
    deathSaves: { successes: 0, failures: 0 },
    // Reset conditions that end on a long rest
    conditions: character.conditions ? character.conditions.filter(condition => {
      // List conditions that don't end on long rest
      const persistentConditions = ['cursed', 'diseased'];
      return persistentConditions.includes(condition.toLowerCase());
    }) : [],
    // Reset half of used Hit Dice (minimum of 1)
    hitDice: {
      ...character.hitDice,
      used: Math.max(0, character.hitDice.used - Math.max(1, Math.floor(character.hitDice.total / 2)))
    },
    // Reset resources
    resources: { ...character.resources },
    // Reset all spell slots
    spellSlots: character.spellSlots ? Object.entries(character.spellSlots).reduce((acc, [level, slotData]) => {
      acc[parseInt(level)] = { ...slotData, used: 0 };
      return acc;
    }, {} as Record<number, { max: number; used: number }>) : undefined
  };
  
  // Reset all resources
  if (character.resources) {
    Object.entries(character.resources).forEach(([key, resource]) => {
      if (resource.longRestRecover || resource.shortRestRecover) {
        updatedCharacter.resources![key] = {
          ...resource,
          used: 0
        };
      }
    });
  }
  
  return updatedCharacter;
};
