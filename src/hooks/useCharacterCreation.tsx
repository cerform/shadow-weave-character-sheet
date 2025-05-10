
import { useState, useCallback } from 'react';
import { Character } from "@/types/character";
import { toast } from 'sonner';
import { getModifierFromAbilityScore } from "@/utils/characterUtils";
import { getCurrentUid } from "@/utils/authHelpers";
import { saveCharacterToFirestore } from "@/services/characterService";
import { v4 as uuidv4 } from 'uuid';

export function useCharacterCreation() {
  const [isLoading, setIsLoading] = useState(false);
  const [character, setCharacter] = useState<Character>(() => {
    // Initialize a new character with default values
    return {
      id: uuidv4(),
      name: '',
      race: '',
      class: '',
      background: '',
      alignment: 'Нейтральный',
      level: 1,
      xp: 0,
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
        charisma: 10,
      },
      savingThrows: {
        STR: 0,
        DEX: 0,
        CON: 0,
        INT: 0,
        WIS: 0,
        CHA: 0,
        strength: 0,
        dexterity: 0,
        constitution: 0,
        intelligence: 0,
        wisdom: 0,
        charisma: 0,
      },
      skills: {},
      hp: 0,
      maxHp: 0,
      temporaryHp: 0,
      ac: 10,
      proficiencyBonus: 2,
      speed: 30,
      initiative: 0,
      inspiration: false,
      hitDice: {
        total: 1,
        used: 0,
        dieType: 'd8',
      },
      resources: {},
      deathSaves: {
        successes: 0,
        failures: 0,
      },
      spellcasting: {
        ability: 'intelligence',
        dc: 10,
        attack: 0,
      },
      spellSlots: {},
      spells: [],
      equipment: {
        weapons: [],
        armor: '',
        items: [],
        gold: 0,
      },
      proficiencies: {
        languages: ['Common'],
        tools: [],
        weapons: [],
        armor: [],
      },
      features: [],
      notes: '',
      savingThrowProficiencies: [],
      skillProficiencies: [],
      expertise: [],
      skillBonuses: {},
    };
  });

  // Update character data
  const updateCharacter = useCallback((updates: Partial<Character>) => {
    setCharacter(prev => ({ ...prev, ...updates }));
  }, []);

  // Save character to database
  const saveCharacter = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // Calculate HP based on class and constitution
      const conModifier = getModifierFromAbilityScore(character.abilities.CON);
      let baseHP = 0;
      
      switch(character.class.toLowerCase()) {
        case 'варвар':
          baseHP = 12;
          break;
        case 'воин':
        case 'паладин':
        case 'следопыт':
          baseHP = 10;
          break;
        case 'жрец':
        case 'друид':
        case 'монах':
        case 'плут':
          baseHP = 8;
          break;
        case 'бард':
        case 'колдун':
        case 'чародей':
        case 'волшебник':
          baseHP = 6;
          break;
        default:
          baseHP = 8;
      }
      
      const maxHp = baseHP + conModifier;
      const updatedCharacter = {
        ...character,
        hp: maxHp,
        maxHp: maxHp,
        userId: getCurrentUid()
      };
      
      // Save to Firestore
      await saveCharacterToFirestore(updatedCharacter);
      
      toast({
        title: 'Персонаж создан!',
        description: `${character.name} успешно сохранен.`
      });
      
      return updatedCharacter;
    } catch (error) {
      console.error('Error saving character:', error);
      toast({
        title: 'Ошибка при сохранении',
        description: 'Не удалось сохранить персонажа. Попробуйте позже.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [character]);

  return {
    character,
    updateCharacter,
    saveCharacter,
    isLoading
  };
}

export default useCharacterCreation;
