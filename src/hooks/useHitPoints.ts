
import { useState, useEffect } from 'react';
import type { Character, HitPointEvent } from '@/types/character';
import { getNumericModifier } from '@/utils/characterUtils';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';

interface UseHitPointsProps {
  character: Character;
  onUpdate: (updates: Partial<Character>) => void;
}

export const useHitPoints = ({ character, onUpdate }: UseHitPointsProps) => {
  const [events, setEvents] = useState<HitPointEvent[]>([]);
  const [currentHP, setCurrentHP] = useState(character.hp);
  const [maxHP, setMaxHP] = useState(character.maxHp);
  const [tempHP, setTempHP] = useState(character.temporaryHp || 0);
  const [isEditing, setIsEditing] = useState(false);
  
  // Sync with character prop changes
  useEffect(() => {
    setCurrentHP(character.hp);
    setMaxHP(character.maxHp);
    setTempHP(character.temporaryHp || 0);
  }, [character.hp, character.maxHp, character.temporaryHp]);

  const addEvent = (eventType: 'damage' | 'healing' | 'temp' | 'tempHP' | 'heal' | 'death-save', amount: number, source = 'manual') => {
    const newEvent: HitPointEvent = {
      id: uuidv4(),
      type: eventType,
      amount,
      source,
      timestamp: new Date().toISOString()
    };
    
    setEvents(prev => [...prev, newEvent]);
    return newEvent;
  };
  
  // Apply damage
  const applyDamage = (amount: number, source = 'manual') => {
    if (amount <= 0) return;
    
    addEvent('damage', amount, source);
    
    // First reduce tempHP if available
    if (tempHP > 0) {
      if (tempHP >= amount) {
        // Temp HP absorbs all damage
        setTempHP(tempHP - amount);
        onUpdate({ temporaryHp: tempHP - amount });
        return;
      } else {
        // Temp HP absorbs part of the damage
        amount -= tempHP;
        setTempHP(0);
        onUpdate({ temporaryHp: 0 });
      }
    }
    
    // Reduce current HP
    const newHP = Math.max(0, currentHP - amount);
    setCurrentHP(newHP);
    onUpdate({ hp: newHP });
    
    // Check for unconsciousness
    if (newHP === 0) {
      toast({
        title: "Персонаж без сознания!",
        description: "HP достигло 0, персонаж без сознания.",
        variant: "destructive",
      });
    }
  };
  
  // Apply healing
  const applyHealing = (amount: number, source = 'manual') => {
    if (amount <= 0) return;
    
    addEvent('healing', amount, source);
    
    // Cannot heal above max HP
    const newHP = Math.min(maxHP, currentHP + amount);
    setCurrentHP(newHP);
    onUpdate({ hp: newHP });
  };
  
  // Add temporary HP
  const addTemporaryHP = (amount: number, source = 'manual') => {
    if (amount <= 0) return;
    
    // Temp HP doesn't stack, take the higher value
    if (amount > tempHP) {
      addEvent('tempHP', amount, source);
      setTempHP(amount);
      onUpdate({ temporaryHp: amount });
    }
  };
  
  // Set current HP directly
  const setHP = (amount: number) => {
    // Clamp between 0 and maxHP
    const newHP = Math.max(0, Math.min(maxHP, amount));
    setCurrentHP(newHP);
    onUpdate({ hp: newHP });
  };
  
  // Set max HP directly
  const setMaximumHP = (amount: number) => {
    if (amount <= 0) return;
    
    setMaxHP(amount);
    onUpdate({ maxHp: amount });
    
    // If current HP is greater than new max HP, reduce current HP
    if (currentHP > amount) {
      setCurrentHP(amount);
      onUpdate({ hp: amount });
    }
  };
  
  // Calculate initial max HP for a character
  const calculateInitialMaxHP = () => {
    if (!character) return 0;
    
    const conModifier = getNumericModifier(character.abilities.CON || character.constitution || 10);
    const classLevel = character.level || 1;
    const className = character.class?.toLowerCase() || '';
    
    // Determine hit die based on class
    let hitDie = 8; // Default medium hit die
    
    if (['варвар', 'barbarian'].includes(className)) {
      hitDie = 12;
    } else if (['воин', 'fighter', 'паладин', 'paladin', 'следопыт', 'ranger'].includes(className)) {
      hitDie = 10;
    } else if (['волшебник', 'wizard', 'колдун', 'warlock', 'чародей', 'sorcerer'].includes(className)) {
      hitDie = 6;
    }
    
    // First level gets maximum hit die value
    let maxHP = hitDie + conModifier;
    
    // Add average hit die for each level beyond first
    if (classLevel > 1) {
      // Average hit die value is (hit die / 2) + 0.5, e.g. d8 average is 4.5
      const averageHitDie = (hitDie / 2) + 0.5;
      maxHP += Math.floor((classLevel - 1) * (averageHitDie + conModifier));
    }
    
    return Math.max(1, maxHP); // Minimum 1 HP
  };
  
  // Set maximum HP based on calculated value
  const resetMaxHP = () => {
    const calculatedMaxHP = calculateInitialMaxHP();
    setMaximumHP(calculatedMaxHP);
    
    // Also set current HP to match if it's at max or 0
    if (currentHP === maxHP || currentHP === 0) {
      setHP(calculatedMaxHP);
    }
  };
  
  // Handle death saves
  const addDeathSave = (success: boolean) => {
    // Only track death saves when at 0 HP
    if (currentHP > 0) return;
    
    const { deathSaves } = character;
    const updatedDeathSaves = { ...deathSaves };
    
    if (success) {
      updatedDeathSaves.successes = Math.min(3, deathSaves.successes + 1);
      
      // Check for stabilization
      if (updatedDeathSaves.successes >= 3) {
        toast({
          title: "Персонаж стабилизирован",
          description: "Персонаж стабилизировался и больше не совершает спасброски от смерти.",
        });
      }
    } else {
      updatedDeathSaves.failures = Math.min(3, deathSaves.failures + 1);
      
      // Check for death
      if (updatedDeathSaves.failures >= 3) {
        toast({
          title: "Персонаж умер",
          description: "Персонаж не выдержал спасброски от смерти и умер.",
          variant: "destructive",
        });
      }
    }
    
    onUpdate({ deathSaves: updatedDeathSaves });
    addEvent('death-save', success ? 1 : 0, success ? 'success' : 'failure');
  };
  
  // Reset death saves
  const resetDeathSaves = () => {
    onUpdate({
      deathSaves: {
        successes: 0,
        failures: 0
      }
    });
  };
  
  // Take a long rest
  const takeLongRest = () => {
    // Restore all HP
    setCurrentHP(maxHP);
    onUpdate({ hp: maxHP });
    
    // Reset death saves
    resetDeathSaves();
    
    // Clear temporary HP
    setTempHP(0);
    onUpdate({ temporaryHp: 0 });
    
    // Reset hit dice (regain up to half)
    const maxHitDice = character.level;
    const currentUsed = character.hitDice.used;
    const regain = Math.min(Math.floor(maxHitDice / 2), currentUsed);
    
    onUpdate({
      hitDice: {
        ...character.hitDice,
        used: Math.max(0, currentUsed - regain)
      }
    });
    
    toast({
      title: "Длительный отдых",
      description: `HP восстановлены до максимума (${maxHP}). Восстановлено ${regain} костей хитов.`,
    });
  };
  
  // Take a short rest
  const takeShortRest = (hitDiceToUse: number) => {
    // Validate number of hit dice to use
    const availableHitDice = character.level - character.hitDice.used;
    hitDiceToUse = Math.min(hitDiceToUse, availableHitDice);
    
    if (hitDiceToUse <= 0) {
      toast({
        title: "Нет доступных костей хитов",
        description: "У персонажа не осталось костей хитов для восстановления здоровья.",
      });
      return;
    }
    
    // Calculate healing
    const conModifier = getNumericModifier(character.abilities.CON || character.constitution || 10);
    const hitDieValue = parseInt(character.hitDice.dieType.substring(1)) || 8; // e.g. "d8" -> 8
    
    let totalHealing = 0;
    for (let i = 0; i < hitDiceToUse; i++) {
      // Roll for each hit die (simulate by using average value)
      const healing = Math.floor(hitDieValue / 2) + 1 + conModifier; // Average roll + CON mod
      totalHealing += Math.max(1, healing); // Minimum 1 HP per die
    }
    
    // Apply healing
    applyHealing(totalHealing, 'short rest');
    
    // Increase used hit dice
    onUpdate({
      hitDice: {
        ...character.hitDice,
        used: character.hitDice.used + hitDiceToUse
      }
    });
    
    toast({
      title: "Короткий отдых",
      description: `Использовано костей хитов: ${hitDiceToUse}. Восстановлено ${totalHealing} HP.`,
    });
  };
  
  return {
    currentHP,
    maxHP,
    tempHP,
    isEditing,
    setIsEditing,
    applyDamage,
    applyHealing,
    addTemporaryHP,
    setHP,
    setMaximumHP,
    resetMaxHP,
    addDeathSave,
    resetDeathSaves,
    takeLongRest,
    takeShortRest,
    events
  };
};

export default useHitPoints;
