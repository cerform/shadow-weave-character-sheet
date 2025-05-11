
import { REST_TYPES } from '@/types/constants';

// Fix the rest type comparison issues
export const processShortRest = (character: any) => {
  if (!character) return character;
  
  // Clone the character to avoid direct mutation
  const updatedCharacter = JSON.parse(JSON.stringify(character));
  
  // Restore hit dice
  if (updatedCharacter.hitPoints && updatedCharacter.hitPoints.hitDice) {
    // Calculate how many hit dice to restore (up to half of total, rounded down)
    const hitDiceToRestore = Math.floor(updatedCharacter.level / 2);
    updatedCharacter.hitPoints.hitDice.remaining = Math.min(
      updatedCharacter.hitPoints.hitDice.total,
      updatedCharacter.hitPoints.hitDice.remaining + hitDiceToRestore
    );
  }
  
  // Process class features that recharge on short rest
  if (updatedCharacter.features) {
    updatedCharacter.features = updatedCharacter.features.map((feature: any) => {
      if (feature.rechargeOn === REST_TYPES.SHORT) {
        return { ...feature, used: false };
      }
      return feature;
    });
  }
  
  // Fix the comparison to use REST_TYPES.SHORT instead of "shortRest"
  // Use consistent REST_TYPES for the comparison
  if (REST_TYPES.SHORT) {
    // Process any additional short rest mechanics
    // For example, restore warlock spell slots
    if (updatedCharacter.class === 'Warlock' && updatedCharacter.spellSlots) {
      Object.keys(updatedCharacter.spellSlots).forEach(level => {
        updatedCharacter.spellSlots[level].used = 0;
      });
    }
  }
  
  return updatedCharacter;
};

export const processLongRest = (character: any) => {
  if (!character) return character;
  
  // Clone the character to avoid direct mutation
  const updatedCharacter = JSON.parse(JSON.stringify(character));
  
  // Restore hit points to maximum
  if (updatedCharacter.hitPoints) {
    updatedCharacter.hitPoints.currentHp = updatedCharacter.hitPoints.max;
    updatedCharacter.hitPoints.tempHp = 0;
  }
  
  // Restore all hit dice (up to maximum)
  if (updatedCharacter.hitPoints && updatedCharacter.hitPoints.hitDice) {
    // Restore up to half of total hit dice, rounded up
    const hitDiceToRestore = Math.ceil(updatedCharacter.hitPoints.hitDice.total / 2);
    updatedCharacter.hitPoints.hitDice.remaining = Math.min(
      updatedCharacter.hitPoints.hitDice.total,
      updatedCharacter.hitPoints.hitDice.remaining + hitDiceToRestore
    );
  }
  
  // Reset death saving throws
  if (updatedCharacter.hitPoints && updatedCharacter.hitPoints.deathSaves) {
    updatedCharacter.hitPoints.deathSaves.successes = 0;
    updatedCharacter.hitPoints.deathSaves.failures = 0;
  }
  
  // Restore all spell slots
  if (updatedCharacter.spellSlots) {
    Object.keys(updatedCharacter.spellSlots).forEach(level => {
      updatedCharacter.spellSlots[level].used = 0;
    });
  }
  
  // Reset all features that recharge on short or long rest
  if (updatedCharacter.features) {
    updatedCharacter.features = updatedCharacter.features.map((feature: any) => {
      if (feature.rechargeOn === REST_TYPES.SHORT || feature.rechargeOn === REST_TYPES.LONG) {
        return { ...feature, used: false };
      }
      return feature;
    });
  }
  
  // Fix the comparison to use REST_TYPES.LONG instead of "longRest"
  // Use consistent REST_TYPES for the comparison
  if (REST_TYPES.LONG) {
    // Process any additional long rest mechanics
    // For example, remove levels of exhaustion
    if (updatedCharacter.conditions) {
      const exhaustionIndex = updatedCharacter.conditions.findIndex(
        (c: any) => c.name === 'Exhaustion'
      );
      if (exhaustionIndex >= 0 && updatedCharacter.conditions[exhaustionIndex].level > 0) {
        updatedCharacter.conditions[exhaustionIndex].level -= 1;
        if (updatedCharacter.conditions[exhaustionIndex].level === 0) {
          updatedCharacter.conditions.splice(exhaustionIndex, 1);
        }
      }
    }
  }
  
  return updatedCharacter;
};
