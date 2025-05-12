import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Character } from '@/types/character';
import { createDefaultCharacter } from '@/utils/characterUtils';
import { createCharacter, updateCharacter as updateCharacterInDb, getCharacter, deleteCharacter as deleteCharacterInDb } from '@/lib/supabase';
import { getCurrentUid } from '@/utils/authHelpers';
import { useToast } from '@/hooks/use-toast';

interface CharacterContextType {
  character: Character | null;
  setCharacter: (character: Character | null) => void;
  createCharacter: (characterData: Omit<Character, 'id'>) => Promise<Character | null>;
  updateCharacter: (updates: Partial<Character>) => void;
  saveCurrentCharacter: () => Promise<void>;
  getCharacterById: (id: string) => Promise<Character | null>;
  deleteCharacter: (id: string) => Promise<void>;
  convertToCharacter: (characterSheet: any) => Character;
  isMagicClass: () => boolean;
}

const CharacterContext = createContext<CharacterContextType>({
  character: null,
  setCharacter: () => {},
  createCharacter: async () => null,
  updateCharacter: () => {},
  saveCurrentCharacter: async () => {},
  getCharacterById: async () => null,
  deleteCharacter: async () => {},
  convertToCharacter: (characterSheet: any) => characterSheet as Character,
  isMagicClass: () => false,
});

export const useCharacter = () => useContext(CharacterContext);

interface CharacterProviderProps {
  children: ReactNode;
}

export const CharacterProvider: React.FC<CharacterProviderProps> = ({ children }) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadCharacter = async () => {
      const lastCharacterId = localStorage.getItem('last-selected-character');
      if (lastCharacterId) {
        try {
          const storedCharacter = localStorage.getItem(`character_${lastCharacterId}`);
          if (storedCharacter) {
            const parsedCharacter = JSON.parse(storedCharacter);
            setCharacter(parsedCharacter);
          } else {
            const fetchedCharacter = await getCharacterById(lastCharacterId);
            if (fetchedCharacter) {
              setCharacter(fetchedCharacter);
            } else {
              setCharacter(createDefaultCharacter());
            }
          }
        } catch (error) {
          console.error("Failed to load character from localStorage:", error);
          setCharacter(createDefaultCharacter());
        }
      } else {
        setCharacter(createDefaultCharacter());
      }
    };

    loadCharacter();
  }, []);

  const createCharacterInContext = async (characterData: Omit<Character, 'id'>): Promise<Character | null> => {
    try {
      const uid = getCurrentUid();
      if (!uid) {
        console.error("User not logged in.");
        return null;
      }

      const newCharacterData: Character = {
        ...characterData,
        userId: uid,
        id: uuidv4(),
      } as Character;

      const newCharacter = await createCharacter(newCharacterData);

      if (newCharacter) {
        setCharacter(newCharacter);
        localStorage.setItem('last-selected-character', newCharacter.id);
        localStorage.setItem(`character_${newCharacter.id}`, JSON.stringify(newCharacter));
        toast({
          title: "Персонаж создан!",
          description: "Персонаж успешно создан.",
        });
        return newCharacter;
      } else {
        toast({
          title: "Ошибка создания",
          description: "Не удалось создать персонажа. Попробуйте еще раз.",
          variant: "destructive",
        });
        return null;
      }
    } catch (error) {
      console.error("Error creating character:", error);
      toast({
        title: "Ошибка создания",
        description: "Произошла ошибка при создании персонажа.",
        variant: "destructive",
      });
      return null;
    }
  };

  const updateCharacter = (updates: Partial<Character>) => {
    setCharacter((prevCharacter) => {
      if (prevCharacter) {
        const updatedCharacter = { ...prevCharacter, ...updates };
        localStorage.setItem(`character_${updatedCharacter.id}`, JSON.stringify(updatedCharacter));
        return updatedCharacter;
      }
      return prevCharacter;
    });
  };

  const saveCurrentCharacter = async () => {
    if (!character) {
      console.warn("No character to save.");
      return;
    }

    try {
      const uid = getCurrentUid();
      if (!uid) {
        console.error("User not logged in.");
        return;
      }

      const characterToSave = { ...character, userId: uid };
      await updateCharacterInDb(characterToSave);
      localStorage.setItem(`character_${character.id}`, JSON.stringify(characterToSave));
      toast({
        title: "Персонаж сохранен!",
        description: "Изменения успешно сохранены.",
      });
    } catch (error) {
      console.error("Error saving character:", error);
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить изменения. Попробуйте еще раз.",
        variant: "destructive",
      });
    }
  };

  const getCharacterById = async (id: string): Promise<Character | null> => {
    try {
      const fetchedCharacter = await getCharacter(id);
      if (fetchedCharacter) {
        // Проверка, есть ли createdAt в персонаже, и если нет, добавляем его
        if (!fetchedCharacter.updatedAt) {
          fetchedCharacter.updatedAt = new Date().toISOString();
        }
        
        return fetchedCharacter as Character;
      } else {
        console.log("Персонаж не найден в базе данных, проверка localStorage...");
        const storedCharacter = localStorage.getItem(`character_${id}`);
        if (storedCharacter) {
          console.log("Персонаж найден в localStorage.");
          return JSON.parse(storedCharacter) as Character;
        } else {
          console.log("Персонаж не найден ни в базе данных, ни в localStorage.");
          return null;
        }
      }
    } catch (error) {
      console.error("Error fetching character:", error);
      return null;
    }
  };

  const deleteCharacter = async (id: string): Promise<void> => {
    try {
      await deleteCharacterInDb(id);
      localStorage.removeItem(`character_${id}`);
      localStorage.removeItem('last-selected-character');
      setCharacter(null);
      toast({
        title: "Персонаж удален!",
        description: "Персонаж успешно удален.",
      });
    } catch (error) {
      console.error("Error deleting character:", error);
      toast({
        title: "Ошибка удаления",
        description: "Не удалось удалить персонажа. Попробуйте еще раз.",
        variant: "destructive",
      });
    }
  };

  const convertToCharacter = (characterSheet: any): Character => {
    const {
      name,
      class: className,
      level,
      race,
      subrace,
      background,
      alignment,
      gender,
      strength,
      dexterity,
      constitution,
      intelligence,
      wisdom,
      charisma,
      maxHp,
      currentHp,
      tempHp,
      armorClass,
      proficiencyBonus,
      speed,
      equipment,
      features,
      spells,
      proficiencies,
      hitDice,
      money,
      deathSaves,
      personalityTraits,
      ideals,
      bonds,
      flaws,
      backstory,
      initiative,
      spellSlots,
      resources,
      sorceryPoints,
      lastDiceRoll,
      notes,
      spellcasting,
      abilityPointsUsed,
      userId,
      stats,
      skills,
      savingThrows,
      languages,
      skill,
      savingThrowProficiencies,
      skillProficiencies,
      expertise,
      appearance,
      inspiration,
      ac,
      experience,
      raceFeatures,
      classFeatures,
      backgroundFeatures,
      feats,
      skillBonuses,
      additionalClasses,
    } = characterSheet;

    return {
      name,
      class: className,
      level,
      race,
      subrace,
      background,
      alignment,
      gender,
      strength,
      dexterity,
      constitution,
      intelligence,
      wisdom,
      charisma,
      maxHp,
      currentHp,
      tempHp,
      armorClass,
      proficiencyBonus,
      speed,
      equipment,
      features,
      spells,
      proficiencies,
      hitDice,
      money,
      deathSaves,
      personalityTraits,
      ideals,
      bonds,
      flaws,
      backstory,
      initiative,
      spellSlots,
      resources,
      sorceryPoints,
      lastDiceRoll,
      notes,
      spellcasting,
      abilityPointsUsed,
      userId,
      stats,
      skills,
      savingThrows,
      languages,
      skill,
      savingThrowProficiencies,
      skillProficiencies,
      expertise,
      appearance,
      inspiration,
      ac,
      experience,
      raceFeatures,
      classFeatures,
      backgroundFeatures,
      feats,
      skillBonuses,
      additionalClasses,
      abilities: {
        strength,
        dexterity,
        constitution,
        intelligence,
        wisdom,
        charisma,
        STR: strength,
        DEX: dexterity,
        CON: constitution,
        INT: intelligence,
        WIS: wisdom,
        CHA: charisma,
      },
    };
  };

  const isMagicClass = (): boolean => {
    if (!character || !character.class) return false;
    const magicClasses = ['wizard', 'sorcerer', 'warlock', 'bard', 'cleric', 'druid', 'paladin', 'ranger', 'колдун', 'чародей', 'жрец', 'друид', 'бард', 'волшебник', 'паладин', 'следопыт'];
    return magicClasses.includes(character.class.toLowerCase());
  };

  const contextValue: CharacterContextType = {
    character,
    setCharacter,
    createCharacter: createCharacterInContext,
    updateCharacter,
    saveCurrentCharacter,
    getCharacterById,
    deleteCharacter,
    convertToCharacter,
    isMagicClass,
  };

  return (
    <CharacterContext.Provider value={contextValue}>
      {children}
    </CharacterContext.Provider>
  );
};
