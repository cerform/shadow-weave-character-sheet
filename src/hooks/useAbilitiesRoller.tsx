
import { useState, useEffect } from "react";

export const useAbilitiesRoller = (abilitiesMethod: "pointbuy" | "standard" | "roll") => {
  const [diceResults, setDiceResults] = useState<number[][]>([]);

  // Initialize dice results when method changes to roll
  useEffect(() => {
    if (abilitiesMethod === "roll" && diceResults.length === 0) {
      rollAllAbilities();
    }
  }, [abilitiesMethod]);

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

  return {
    diceResults,
    rollAllAbilities
  };
};
