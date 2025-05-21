import { useState, useEffect } from 'react';
import { Character } from '@/types/character';
import { useToast } from "@/components/ui/use-toast";
import { createCharacter, getCurrentUid } from '@/lib/supabase';
import { saveCharacterToFirestore } from '@/services/characterService';

interface UseCharacterCreationReturn {
  characterData: Character | null;
  updateCharacterData: (updates: Partial<Character>) => void;
  saveCharacter: () => Promise<Character | null>;
  isCreating: boolean;
  creationError: string | null;
  rollAbilities: () => void;
  rollAbility: (ability: string) => void;
  assignRaceAbilityBonuses: () => void;
  calculateModifiers: () => void;
  resetCharacter: () => void;
}

const initialState: Character = {
  name: '',
  level: 1,
  abilities: {
    STR: 10,
    DEX: 10,
    CON: 10,
    INT: 10,
    WIS: 10,
    CHA: 10,
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10
  },
  hitPoints: {
    current: 0,
    maximum: 0,
    temporary: 0
  }
};

export const useCharacterCreation = (): UseCharacterCreationReturn => {
  const [characterData, setCharacterData] = useState<Character>(initialState);
  const [isCreating, setIsCreating] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const { toast } = useToast();

  // Update character data
  const updateCharacterData = (updates: Partial<Character>) => {
    setCharacterData(prev => ({ ...prev, ...updates }));
  };

  // Reset character
  const resetCharacter = () => {
    setCharacterData(initialState);
  };

  // Create and save character
  const saveCharacter = async (): Promise<Character | null> => {
    if (!characterData.name) {
      toast({
        title: "Ошибка создания персонажа",
        description: "У персонажа должно быть имя",
        variant: "destructive",
      });
      return null;
    }

    setIsCreating(true);
    setCreationError(null);

    try {
      // Добавляем идентификатор пользователя
      const userId = getCurrentUid();
      const characterWithUserId = {
        ...characterData,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Сохраняем персонажа через Firestore и получаем ID
      const characterId = await saveCharacterToFirestore(characterWithUserId);

      // Обновляем персонажа с ID
      const newCharacter: Character = {
        ...characterWithUserId,
        id: characterId
      };

      toast({
        title: "Персонаж создан",
        description: `${newCharacter.name} успешно создан!`,
      });

      return newCharacter;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Неизвестная ошибка';
      setCreationError(errorMessage);
      toast({
        title: "Ошибка создания персонажа",
        description: errorMessage,
        variant: "destructive",
      });
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  // Roll abilities
  const rollAbilities = () => {
    const newAbilities = {
      STR: rollAbilityScore(),
      DEX: rollAbilityScore(),
      CON: rollAbilityScore(),
      INT: rollAbilityScore(),
      WIS: rollAbilityScore(),
      CHA: rollAbilityScore(),
      // Добавляем алиасы для удобства
      strength: 0,
      dexterity: 0,
      constitution: 0,
      intelligence: 0,
      wisdom: 0,
      charisma: 0
    };

    // Копируем значения в алиасы
    newAbilities.strength = newAbilities.STR;
    newAbilities.dexterity = newAbilities.DEX;
    newAbilities.constitution = newAbilities.CON;
    newAbilities.intelligence = newAbilities.INT;
    newAbilities.wisdom = newAbilities.WIS;
    newAbilities.charisma = newAbilities.CHA;

    setCharacterData(prev => ({
      ...prev,
      abilities: newAbilities
    }));
  };

  // Roll individual ability
  const rollAbility = (ability: string) => {
    if (!characterData.abilities) return;

    const newValue = rollAbilityScore();
    const updatedAbilities = { ...characterData.abilities };

    // Обновляем как основное свойство, так и алиас
    switch (ability) {
      case 'STR':
        updatedAbilities.STR = newValue;
        updatedAbilities.strength = newValue;
        break;
      case 'DEX':
        updatedAbilities.DEX = newValue;
        updatedAbilities.dexterity = newValue;
        break;
      case 'CON':
        updatedAbilities.CON = newValue;
        updatedAbilities.constitution = newValue;
        break;
      case 'INT':
        updatedAbilities.INT = newValue;
        updatedAbilities.intelligence = newValue;
        break;
      case 'WIS':
        updatedAbilities.WIS = newValue;
        updatedAbilities.wisdom = newValue;
        break;
      case 'CHA':
        updatedAbilities.CHA = newValue;
        updatedAbilities.charisma = newValue;
        break;
    }

    setCharacterData(prev => ({
      ...prev,
      abilities: updatedAbilities
    }));
  };

  // Assign race ability bonuses
  const assignRaceAbilityBonuses = () => {
    if (!characterData.race) return;

    // Здесь была бы логика добавления расовых бонусов к характеристикам
    // В зависимости от выбранной расы и подрасы
  };

  // Calculate ability modifiers
  const calculateModifiers = () => {
    // Здесь была бы логика расчета модификаторов характеристик
  };

  // Calculate hit points based on class and level
  useEffect(() => {
    if (!characterData.class || typeof characterData.level !== 'number') return;

    // Здесь была бы логика расчета хитов в зависимости от класса и уровня
  }, [characterData.class, characterData.level, characterData.abilities?.CON]);

  return {
    characterData,
    updateCharacterData,
    saveCharacter,
    isCreating,
    creationError,
    rollAbilities,
    rollAbility,
    assignRaceAbilityBonuses,
    calculateModifiers,
    resetCharacter
  };
};

// Utility function to roll 4d6, drop lowest, sum the rest
const rollAbilityScore = (): number => {
  const rolls = [
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1,
    Math.floor(Math.random() * 6) + 1
  ];
  rolls.sort((a, b) => a - b);
  return rolls.slice(1).reduce((sum, roll) => sum + roll, 0);
};

export default useCharacterCreation;
