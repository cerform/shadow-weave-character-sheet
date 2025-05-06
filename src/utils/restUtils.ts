import { Character } from '@/types/character';

type RestType = 'short-rest' | 'long-rest';

const restoreHitPoints = (character: Character, amount: number) => {
  if (!character) return 0;
  return Math.min(character.maxHp || 0, (character.currentHp || 0) + amount);
};

const restoreSpellSlots = (character: Character) => {
  if (!character || !character.spellSlots) return {};

  const restoredSlots = { ...character.spellSlots };
  for (const level in restoredSlots) {
    restoredSlots[level] = { ...restoredSlots[level], used: 0 };
  }
  return restoredSlots;
};

export const takeRest = (character: Character, restType: RestType) => {
  if (!character) return character;
  
  const updatedChar = { ...character };

  if (restType === 'short-rest') {
    if (character.hitDice && character.hitDice.remaining > 0) {
      const diceToRoll = Math.min(character.hitDice.remaining, Math.ceil((character.level || 1) / 2));
      let healing = 0;
      for (let i = 0; i < diceToRoll; i++) {
        healing += Math.floor(Math.random() * 6) + 1; // Assuming d6 hit dice
      }
      
      updatedChar.currentHp = restoreHitPoints(character, healing);
      updatedChar.hitDice = { ...character.hitDice, remaining: character.hitDice.remaining - diceToRoll };
    }
  }

  if (restType === 'long-rest') {
    updatedChar.currentHp = character.maxHp;
    updatedChar.tempHp = 0;
    updatedChar.temporaryHp = 0;
    
    if (character.hitDice) {
      updatedChar.hitDice = { ...character.hitDice, remaining: Math.ceil((character.level || 1) / 2) };
    }
    
    if (character.spellSlots) {
      updatedChar.spellSlots = restoreSpellSlots(character);
    }
  }
  
  return updatedChar;
};
