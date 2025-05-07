// Import modules
import { useState } from 'react';
import { Character } from '@/types/character';
import { calculateAbilityModifier } from '@/utils/characterUtils';

export const useLevelUp = (character: Character, onUpdate: (updates: Partial<Character>) => void) => {
  const [leveling, setLeveling] = useState(false);
  const [newLevel, setNewLevel] = useState(character.level || 1);
  
  const startLeveling = () => {
    setLeveling(true);
    setNewLevel(character.level || 1);
  };
  
  const cancelLeveling = () => {
    setLeveling(false);
    setNewLevel(character.level || 1);
  };
  
  const confirmLevelUp = () => {
    if (newLevel <= 0) return;
    
    // Update character level
    onUpdate({
      level: newLevel
    });
    
    updateSpellcasting(newLevel);
    
    setLeveling(false);
  };
  
  const updateSpellcasting = (newLevel: number) => {
    if (!character.spellcasting) return;
    
    // Calculate new spell values
    const ability = character.spellcasting.ability || 'intelligence';
    const abilityScore = character.abilities?.[ability.toLowerCase() as keyof typeof character.abilities] || 10;
    const abilityMod = calculateAbilityModifier(abilityScore);
    const profBonus = 1 + Math.ceil(newLevel / 4);
    
    const updatedSpellcasting = {
      ...character.spellcasting,
      level: newLevel,
      saveDC: 8 + profBonus + abilityMod,
      attackBonus: profBonus + abilityMod,
      preparedSpellsLimit: newLevel + abilityMod
    };
    
    onUpdate({
      spellcasting: updatedSpellcasting
    });
  };
  
  return {
    leveling,
    newLevel,
    setNewLevel,
    startLeveling,
    cancelLeveling,
    confirmLevelUp
  };
};

export default useLevelUp;
