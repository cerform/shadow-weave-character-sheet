// src/utils/dice.ts
export function roll(formula: string, mode: 'normal' | 'advantage' | 'disadvantage' = 'normal') {
  // Simple dice rolling implementation
  const match = formula.match(/(\d*)d(\d+)(?:\+(\d+))?/);
  if (!match) return { total: 0, breakdown: '' };
  
  const count = parseInt(match[1] || '1');
  const sides = parseInt(match[2]);
  const modifier = parseInt(match[3] || '0');
  
  let rolls: number[] = [];
  
  if (formula === 'd20' && mode !== 'normal') {
    // For advantage/disadvantage on d20
    const roll1 = Math.floor(Math.random() * sides) + 1;
    const roll2 = Math.floor(Math.random() * sides) + 1;
    
    if (mode === 'advantage') {
      rolls = [Math.max(roll1, roll2)];
    } else {
      rolls = [Math.min(roll1, roll2)];
    }
  } else {
    // Normal rolling
    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * sides) + 1);
    }
  }
  
  const total = rolls.reduce((sum, roll) => sum + roll, 0) + modifier;
  const breakdown = `${rolls.join('+')}${modifier > 0 ? `+${modifier}` : ''}`;
  
  return { total, breakdown };
}