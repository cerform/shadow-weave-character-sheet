
import { useState, useCallback } from 'react';
import { Character } from '@/types/character';
import { useTheme } from '@/hooks/use-theme';
import { getNumericModifier } from '@/utils/characterUtils';
import { useToast } from '@/hooks/use-toast';

interface UseHitPointsReturn {
  currentHp: number;
  maxHp: number;
  tempHp: number;
  addDamage: (amount: number) => void;
  healDamage: (amount: number) => void;
  addTempHp: (amount: number) => void;
  setHp: (current: number, max?: number, temp?: number) => void;
  takeLongRest: () => void;
  takeShortRest: () => void;
  rollHitDie: () => void;
  hitDice: {
    total: number;
    used: number;
    dieType: string;
    value: string;
  };
}

// Get hit die type based on class
function getHitDieType(characterClass: string): string {
  const classLower = characterClass?.toLowerCase();
  
  if (['варвар', 'barbarian'].includes(classLower)) {
    return 'd12';
  } else if (['воин', 'fighter', 'паладин', 'paladin', 'рейнджер', 'ranger'].includes(classLower)) {
    return 'd10';
  } else if (['бард', 'bard', 'клерик', 'cleric', 'друид', 'druid', 'монах', 'monk', 'жрец'].includes(classLower)) {
    return 'd8';
  } else if (['плут', 'rogue', 'чародей', 'sorcerer', 'колдун', 'warlock'].includes(classLower)) {
    return 'd6';
  } else {
    return 'd6'; // default
  }
}

// Calculate maximum hit points
export function calculateMaximumHitPoints(character: Character): number {
  if (!character || !character.level || !character.class) return 0;
  
  const conModifier = getNumericModifier(character.abilities?.constitution || character.constitution || 10);
  const hitDieValue = getHitDieType(character.class);
  const hitDieMax = parseInt(hitDieValue.substring(1));
  
  // First level gets maximum hit points
  let maxHp = hitDieMax + conModifier;
  
  // Add average hit die + con mod for each level after 1st
  for (let i = 1; i < character.level; i++) {
    maxHp += Math.floor(hitDieMax / 2) + 1 + conModifier;
  }
  
  return Math.max(1, maxHp); // Minimum 1 HP
}

export function useHitPoints(character: Character, onUpdate?: (updates: Partial<Character>) => void): UseHitPointsReturn {
  const { toast } = useToast();
  const { themeStyles } = useTheme();
  
  // Initialize hit points
  const calculatedMaxHp = calculateMaximumHitPoints(character);
  const initialMaxHp = character.maxHp || calculatedMaxHp;
  const initialCurrentHp = character.currentHp !== undefined ? character.currentHp : initialMaxHp;
  
  const [currentHp, setCurrentHp] = useState(initialCurrentHp);
  const [maxHp, setMaxHp] = useState(initialMaxHp);
  const [tempHp, setTempHp] = useState(character.tempHp || 0);
  
  // Hit dice management
  const dieType = getHitDieType(character.class || '');
  const totalHitDice = character.level || 1;
  const initialUsedDice = character.hitDice?.used || 0;
  const [usedHitDice, setUsedHitDice] = useState(initialUsedDice);
  
  const hitDice = {
    total: totalHitDice,
    used: usedHitDice,
    dieType,
    value: `${totalHitDice - usedHitDice}/${totalHitDice} ${dieType}`
  };
  
  // Update character if parent component provides an update function
  const updateParent = useCallback((updates: Partial<Character>) => {
    if (onUpdate) {
      onUpdate(updates);
    }
  }, [onUpdate]);
  
  // Add damage to character
  const addDamage = useCallback((amount: number) => {
    if (isNaN(amount) || amount <= 0) return;
    
    setTempHp(prev => {
      const newTempHp = Math.max(0, prev - amount);
      const damageRemaining = amount - (prev - newTempHp);
      
      if (damageRemaining > 0) {
        setCurrentHp(prevHp => {
          const newHp = Math.max(0, prevHp - damageRemaining);
          updateParent({ currentHp: newHp, tempHp: newTempHp });
          
          // Show toast notification with damage information
          toast({
            description: `${character.name} получил ${amount} урона (${newHp}/${maxHp} ОЗ)`
          });
          
          return newHp;
        });
      } else {
        updateParent({ tempHp: newTempHp });
        toast({
            description: `${amount} урона поглощено временными ОЗ (${newTempHp} врем. ОЗ осталось)`
        });
      }
      
      return newTempHp;
    });
  }, [character.name, maxHp, updateParent, toast]);
  
  // Heal character
  const healDamage = useCallback((amount: number) => {
    if (isNaN(amount) || amount <= 0) return;
    
    setCurrentHp(prevHp => {
      const newHp = Math.min(maxHp, prevHp + amount);
      updateParent({ currentHp: newHp });
      
      toast({
          description: `${character.name} исцелён на ${amount} ОЗ (${newHp}/${maxHp} ОЗ)`
      });
      
      return newHp;
    });
  }, [character.name, maxHp, updateParent, toast]);
  
  // Add temporary hit points
  const addTempHp = useCallback((amount: number) => {
    if (isNaN(amount) || amount <= 0) return;
    
    setTempHp(prevTempHp => {
      const newTempHp = Math.max(prevTempHp, amount); // Temp HP doesn't stack, take highest
      updateParent({ tempHp: newTempHp });
      
      toast({
          description: `${character.name} получает ${newTempHp} временных ОЗ`
      });
      
      return newTempHp;
    });
  }, [character.name, updateParent, toast]);
  
  // Set HP values directly
  const setHp = useCallback((current: number, max?: number, temp?: number) => {
    setCurrentHp(current);
    if (max !== undefined) setMaxHp(max);
    if (temp !== undefined) setTempHp(temp);
    
    const updates: Partial<Character> = { currentHp: current };
    if (max !== undefined) updates.maxHp = max;
    if (temp !== undefined) updates.tempHp = temp;
    
    updateParent(updates);
  }, [updateParent]);
  
  // Take a short rest
  const takeShortRest = useCallback(() => {
    // Short rest doesn't automatically restore hit points in D&D 5e
    toast({
        description: `${character.name} отдыхает короткий отдых. Вы можете потратить Кость Хита для восстановления ОЗ.`
    });
  }, [character.name, toast]);
  
  // Roll hit die to recover HP during short rest
  const rollHitDie = useCallback(() => {
    const availableHitDice = totalHitDice - usedHitDice;
    
    if (availableHitDice <= 0) {
      toast({
          description: `У вас не осталось Костей Хитов для восстановления ОЗ.`
      });
      return;
    }
    
    // Determine die type and roll
    const dieMax = parseInt(dieType.substring(1));
    const roll = Math.floor(Math.random() * dieMax) + 1;
    const conMod = getNumericModifier(character.abilities?.constitution || character.constitution || 10);
    const healAmount = Math.max(1, roll + conMod);
    
    // Update hit dice used
    setUsedHitDice(prev => {
      const newUsed = prev + 1;
      updateParent({ hitDice: { used: newUsed, total: totalHitDice, dieType } });
      return newUsed;
    });
    
    // Apply healing
    setCurrentHp(prev => {
      const newHp = Math.min(maxHp, prev + healAmount);
      updateParent({ currentHp: newHp });
      
      toast({
         description: `${character.name} восстанавливает ${healAmount} ОЗ (${dieType}=${roll} + ${conMod}). Осталось ${availableHitDice-1} КХ.`
      });
      
      return newHp;
    });
  }, [character, dieType, maxHp, totalHitDice, usedHitDice, updateParent, toast]);
  
  // Take a long rest
  const takeLongRest = useCallback(() => {
    // Restore all hit points
    setCurrentHp(maxHp);
    setTempHp(0);
    
    // Restore up to half of maximum hit dice (minimum of 1)
    const restoredDice = Math.max(1, Math.floor(totalHitDice / 2));
    const newUsed = Math.max(0, usedHitDice - restoredDice);
    setUsedHitDice(newUsed);
    
    updateParent({ 
      currentHp: maxHp, 
      tempHp: 0,
      hitDice: { used: newUsed, total: totalHitDice, dieType }
    });
    
    toast({
        description: `${character.name} завершил продолжительный отдых. ОЗ полностью восстановлены и восстановлено ${restoredDice} КХ.`
    });
  }, [maxHp, totalHitDice, usedHitDice, character.name, updateParent, dieType, toast]);
  
  return {
    currentHp,
    maxHp,
    tempHp,
    addDamage,
    healDamage,
    addTempHp,
    setHp,
    takeLongRest,
    takeShortRest,
    rollHitDie,
    hitDice
  };
}

export default useHitPoints;
