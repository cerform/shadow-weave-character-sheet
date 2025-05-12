import { Character, Resource } from '@/types/character';

/**
 * Выполняет короткий отдых для персонажа, восстанавливая ресурсы и хиты.
 */
export const performShortRest = (character: Character): Partial<Character> => {
  const updates: Partial<Character> = {};

  // Восстанавливаем хиты, если есть кости хитов
  if (character.hitDice) {
    const recoveredDice = Math.min(character.hitDice.used || 0, Math.ceil(character.hitDice.total / 2));
    const newUsed = (character.hitDice.used || 0) - recoveredDice;

    updates.hitDice = {
      ...character.hitDice,
      used: newUsed
    };

    // TODO: Разобраться с восстановлением HP
    // const recoveredHP = rollHitDice(recoveredDice, character.hitDice.dieType);
    // updates.hp = {
    //   ...character.hp,
    //   current: Math.min((character.hp?.current || 0) + recoveredHP, character.hp?.max || 0)
    // };
  }

  // Обновляем ресурсы, которые восстанавливаются после короткого отдыха
  if (character.resources) {
    const updatedResources = { ...character.resources };
    
    for (const resourceKey in updatedResources) {
      const resource = updatedResources[resourceKey];
      // Исправляем сравнение типов
      if (resource.recoveryType === 'short-rest' || resource.recoveryType === 'short') {
        updatedResources[resourceKey] = {
          ...resource,
          used: 0
        };
      }
    }
    
    updates.resources = updatedResources;
  }

  return updates;
};

/**
 * Выполняет длительный отдых для персонажа, восстанавливая все хиты, кости хитов и ресурсы.
 */
export const performLongRest = (character: Character): Partial<Character> => {
  const updates: Partial<Character> = {};

  // Восстанавливаем все хиты
  updates.hp = {
    ...character.hp,
    current: character.hp?.max || 0
  };

  // Восстанавливаем все кости хитов
  updates.hitDice = {
    ...character.hitDice,
    used: 0
  };

  // Обновляем ресурсы, которые восстанавливаются после длительного отдыха
  if (character.resources) {
    const updatedResources = { ...character.resources };
    
    for (const resourceKey in updatedResources) {
      const resource = updatedResources[resourceKey];
      // Исправляем сравнение типов
      if (resource.recoveryType === 'long-rest' || resource.recoveryType === 'long') {
        updatedResources[resourceKey] = {
          ...resource,
          used: 0
        };
      }
    }
    
    updates.resources = updatedResources;
  }

  // Сбрасываем спасброски от смерти, если они есть
  if (character.deathSaves) {
    updates.deathSaves = {
      successes: 0,
      failures: 0
    };
  }

  return updates;
};
