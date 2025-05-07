import { Character } from '@/types/character';

// Update the rest types to match what's used in the code
export type RestType = 'short' | 'long' | 'short-rest' | 'long-rest';

export const shortRest = (character: Character): Partial<Character> => {
  let updatedCharacter: Partial<Character> = {};
  
  // Восстановление хитов через кости хитов
  if (character.hitDice && character.hitDice.total > 0 && character.hitDice.used < character.hitDice.total) {
    // Игрок может использовать кости хитов
    const availableDice = character.hitDice.total - character.hitDice.used;
    
    // Обновляем персонажа с информацией о доступных костях хитов
    updatedCharacter.hitDice = {
      ...character.hitDice,
      available: availableDice
    };
  }
  
  // Восстановление ресурсов, которые восстанавливаются после короткого отдыха
  if (character.resources) {
    const updatedResources = { ...character.resources };
    let resourcesChanged = false;
    
    Object.keys(character.resources).forEach(key => {
      const resource = character.resources![key];
      if (resource.shortRestRecover) {
        updatedResources[key] = {
          ...resource,
          used: 0 // Сбрасываем использованные ресурсы
        };
        resourcesChanged = true;
      }
    });
    
    if (resourcesChanged) {
      updatedCharacter.resources = updatedResources;
    }
  }
  
  return updatedCharacter;
};

export const longRest = (character: Character): Partial<Character> => {
  let updatedCharacter: Partial<Character> = {};
  
  // Восстановление хитов
  updatedCharacter.currentHp = character.maxHp;
  updatedCharacter.temporaryHp = 0; // Сбрасываем временные хиты
  
  // Восстановление костей хитов (до половины от максимума)
  if (character.hitDice) {
    const recoveredDice = Math.max(1, Math.floor(character.hitDice.total / 2));
    const newUsed = Math.max(0, character.hitDice.used - recoveredDice);
    
    updatedCharacter.hitDice = {
      ...character.hitDice,
      used: newUsed
    };
  }
  
  // Восстановление всех ресурсов
  if (character.resources) {
    const updatedResources = { ...character.resources };
    
    Object.keys(character.resources).forEach(key => {
      const resource = character.resources![key];
      if (resource.longRestRecover !== false) { // По умолчанию все ресурсы восстанавливаются после длительного отдыха
        updatedResources[key] = {
          ...resource,
          used: 0 // Сбрасываем использованные ресурсы
        };
      }
    });
    
    updatedCharacter.resources = updatedResources;
  }
  
  // Восстановление ячеек заклинаний
  if (character.spellSlots) {
    const updatedSpellSlots = { ...character.spellSlots };
    
    Object.keys(character.spellSlots).forEach(level => {
      if (updatedSpellSlots[level]) {
        updatedSpellSlots[level].used = 0; // Восстанавливаем все ячейки заклинаний
      }
    });
    
    updatedCharacter.spellSlots = updatedSpellSlots;
  }
  
  // Сбрасываем состояния (conditions)
  if (character.conditions && character.conditions.length > 0) {
    // Фильтруем состояния, которые не сбрасываются после отдыха
    const persistentConditions = character.conditions.filter(condition => {
      // Здесь можно добавить логику для определения, какие состояния сохраняются
      const persistentTypes = ['curse', 'disease', 'permanent'];
      return condition.type && persistentTypes.includes(condition.type);
    });
    
    updatedCharacter.conditions = persistentConditions;
  }
  
  return updatedCharacter;
};

export const takeRest = (character: Character, restType: RestType): Partial<Character> => {
  if (restType === 'short' || restType === 'short-rest') {
    return shortRest(character);
  } else {
    return longRest(character);
  }
};

export const useHitDice = (character: Character, diceCount: number): Partial<Character> => {
  if (!character.hitDice || character.hitDice.used >= character.hitDice.total) {
    return {}; // Нет доступных костей хитов
  }
  
  // Ограничиваем количество используемых костей
  const availableDice = character.hitDice.total - character.hitDice.used;
  const diceToUse = Math.min(diceCount, availableDice);
  
  if (diceToUse <= 0) return {};
  
  // Вычисляем восстановление хитов
  // Формула: diceToUse * (среднее значение кости хитов) + модификатор телосложения * diceToUse
  const diceType = character.hitDice.type || 'd8'; // По умолчанию d8
  const diceValue = parseInt(diceType.substring(1));
  const averageRoll = Math.floor((diceValue + 1) / 2); // Среднее значение броска
  
  const conModifier = Math.floor((character.abilities?.constitution || 10) - 10) / 2;
  const healingAmount = diceToUse * averageRoll + Math.floor(conModifier) * diceToUse;
  
  // Обновляем хиты и использованные кости хитов
  const newCurrentHp = Math.min(character.maxHp, (character.currentHp || 0) + healingAmount);
  const newUsedDice = character.hitDice.used + diceToUse;
  
  return {
    currentHp: newCurrentHp,
    hitDice: {
      ...character.hitDice,
      used: newUsedDice
    }
  };
};

export const restoreResource = (character: Character, resourceKey: string, amount: number): Partial<Character> => {
  if (!character.resources || !character.resources[resourceKey]) {
    return {};
  }
  
  const resource = character.resources[resourceKey];
  const newUsed = Math.max(0, resource.used - amount);
  
  const updatedResources = {
    ...character.resources,
    [resourceKey]: {
      ...resource,
      used: newUsed
    }
  };
  
  return {
    resources: updatedResources
  };
};

export const getRestoreableResources = (character: Character, restType: RestType): string[] => {
  if (!character.resources) return [];
  
  return Object.keys(character.resources).filter(key => {
    const resource = character.resources![key];
    if (restType === 'long' || restType === 'long-rest') {
      return resource.longRestRecover !== false;
    } else {
      return resource.shortRestRecover === true;
    }
  });
};
