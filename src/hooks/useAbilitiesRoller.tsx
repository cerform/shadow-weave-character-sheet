
import { useState, useEffect } from "react";

export const useAbilitiesRoller = (abilitiesMethod: "pointbuy" | "standard" | "roll", characterLevel: number) => {
  const [diceResults, setDiceResults] = useState<number[][]>([]);
  const [abilityScorePoints, setAbilityScorePoints] = useState<number>(27);

  // Initialize dice results when method changes to roll
  useEffect(() => {
    if (abilitiesMethod === "roll" && diceResults.length === 0) {
      rollAllAbilities();
    }
  }, [abilitiesMethod]);

  // Calculate point buy points based on character level
  useEffect(() => {
    if (abilitiesMethod === "pointbuy") {
      // Base points is 27 for level 1
      let points = 27;
      
      // Add additional points for higher levels
      // This is a simplified approach - adjust based on your game rules
      if (characterLevel >= 4) points += 2;
      if (characterLevel >= 8) points += 2;
      if (characterLevel >= 12) points += 2;
      if (characterLevel >= 16) points += 2;
      if (characterLevel >= 19) points += 2;
      
      setAbilityScorePoints(points);
    }
  }, [abilitiesMethod, characterLevel]);

  const rollAllAbilities = () => {
    // Generate 6 sets of rolls (4d6 for each ability)
    const rolls = [];
    for (let i = 0; i < 6; i++) {
      const diceRolls = [];
      for (let j = 0; j < 4; j++) {
        diceRolls.push(Math.floor(Math.random() * 6) + 1);
      }
      rolls.push(diceRolls);
    }
    setDiceResults(rolls);
  };

  const rollSingleAbility = () => {
    // Roll 4d6 for a single ability
    const diceRolls = [];
    for (let i = 0; i < 4; i++) {
      diceRolls.push(Math.floor(Math.random() * 6) + 1);
    }
    
    // Sort and drop lowest
    const sorted = [...diceRolls].sort((a, b) => b - a);
    return {
      rolls: diceRolls,
      total: sorted.slice(0, 3).reduce((a, b) => a + b, 0)
    };
  };

  return {
    diceResults,
    rollAllAbilities,
    rollSingleAbility,
    abilityScorePoints
  };
};
