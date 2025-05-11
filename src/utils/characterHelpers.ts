
import { Character } from "@/types/character";

// Это файл с вспомогательными функциями для работы с персонажами

// Получить компонент инициативы персонажа (для совместимости с кодом, который использует character.initiative)
export const getInitiativeModifier = (character: Character): number => {
  if (character.initiative !== undefined) {
    return typeof character.initiative === 'string' 
      ? parseInt(character.initiative) || 0 
      : character.initiative || 0;
  }
  
  // Если initiative не указан, пробуем получить модификатор ловкости
  if (character.abilities?.DEX !== undefined) {
    return Math.floor((character.abilities.DEX - 10) / 2);
  } else if (character.abilities?.dexterity !== undefined) {
    return Math.floor((character.abilities.dexterity - 10) / 2);
  } else if (character.dexterity !== undefined) {
    return Math.floor((character.dexterity - 10) / 2);
  }
  
  return 0;
};

// Получить временные хит-поинты персонажа
export const getTemporaryHp = (character: Character): number => {
  if (character.temporaryHp !== undefined) {
    return character.temporaryHp;
  }
  
  if (character.hitPoints?.temporary !== undefined) {
    return character.hitPoints.temporary;
  }
  
  if (character.tempHp !== undefined) {
    return character.tempHp;
  }
  
  return 0;
};

// Получить максимальные хит-поинты персонажа
export const getMaxHp = (character: Character): number => {
  if (character.maxHp !== undefined) {
    return character.maxHp;
  }
  
  if (character.hitPoints?.maximum !== undefined) {
    return character.hitPoints.maximum;
  }
  
  return 0;
};

// Получить текущие хит-поинты персонажа
export const getCurrentHp = (character: Character): number => {
  if (character.currentHp !== undefined) {
    return character.currentHp;
  }
  
  if (character.hitPoints?.current !== undefined) {
    return character.hitPoints.current;
  }
  
  return 0;
};

// Получить записки персонажа
export const getNotes = (character: Character): string => {
  return character.notes || '';
};

// Получить последний бросок кубика
export const getLastDiceRoll = (character: Character): any | undefined => {
  return character.lastDiceRoll;
};

// Получить кости хитов
export const getHitDice = (character: Character): any | undefined => {
  return character.hitDice;
};

// Получить ресурсы персонажа
export const getResources = (character: Character): any | undefined => {
  return character.resources;
};

// Получить очки колдовства
export const getSorceryPoints = (character: Character): any | undefined => {
  return character.sorceryPoints;
};
