import { useState, useCallback } from 'react';
import { Character } from '@/types/character';
import { v4 as uuidv4 } from 'uuid';
import { useToast } from './use-toast';
import { calculateStatBonuses, createDefaultCharacter, convertToCharacter } from '@/utils/characterUtils';
import { useCharacter } from '@/contexts/CharacterContext';

export interface UseCharacterCreationOptions {
  initialStep?: number;
  onComplete?: (character: Character) => void;
}

export const useCharacterCreation = (options: UseCharacterCreationOptions = {}) => {
  const { initialStep = 0, onComplete } = options;
  const [currentStep, setCurrentStep] = useState(initialStep);
  const [character, setCharacter] = useState<Partial<Character>>({
    id: uuidv4(),
    name: '',
    race: '',
    class: '',
    level: 1,
    abilities: {
      strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10,
      STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10
    },
    spells: [],
  });
  const { addCharacter } = useCharacter() as any; // Временный тип
  const { toast } = useToast();

  // Обновить персонажа
  const updateCharacter = useCallback((updates: Partial<Character>) => {
    setCharacter(prev => {
      // Обновляем основные поля
      const updated = { ...prev, ...updates };

      // Обновляем характеристики если нужно
      if (updates.abilities) {
        updated.abilities = { 
          ...prev.abilities, 
          ...updates.abilities,
          // Обеспечиваем согласованность всех полей способностей
          strength: updates.abilities.strength ?? prev.abilities?.strength ?? 10,
          dexterity: updates.abilities.dexterity ?? prev.abilities?.dexterity ?? 10,
          constitution: updates.abilities.constitution ?? prev.abilities?.constitution ?? 10,
          intelligence: updates.abilities.intelligence ?? prev.abilities?.intelligence ?? 10,
          wisdom: updates.abilities.wisdom ?? prev.abilities?.wisdom ?? 10,
          charisma: updates.abilities.charisma ?? prev.abilities?.charisma ?? 10,
          // Дублируем в сокращенном формате
          STR: updates.abilities.STR ?? updates.abilities.strength ?? prev.abilities?.STR ?? prev.abilities?.strength ?? 10,
          DEX: updates.abilities.DEX ?? updates.abilities.dexterity ?? prev.abilities?.DEX ?? prev.abilities?.dexterity ?? 10,
          CON: updates.abilities.CON ?? updates.abilities.constitution ?? prev.abilities?.CON ?? prev.abilities?.constitution ?? 10,
          INT: updates.abilities.INT ?? updates.abilities.intelligence ?? prev.abilities?.INT ?? prev.abilities?.intelligence ?? 10,
          WIS: updates.abilities.WIS ?? updates.abilities.wisdom ?? prev.abilities?.WIS ?? prev.abilities?.wisdom ?? 10,
          CHA: updates.abilities.CHA ?? updates.abilities.charisma ?? prev.abilities?.CHA ?? prev.abilities?.charisma ?? 10
        };
      }
      
      // Применяем расовые бонусы если выбрана раса
      if (prev.race !== updated.race && updated.race) {
        const racialBonuses = calculateStatBonuses(updated as Character);
        if (racialBonuses && racialBonuses.abilities) {
          updated.abilities = {
            ...updated.abilities!,
            strength: (updated.abilities?.strength || 10) + (racialBonuses.abilities.strength || 0),
            dexterity: (updated.abilities?.dexterity || 10) + (racialBonuses.abilities.dexterity || 0),
            constitution: (updated.abilities?.constitution || 10) + (racialBonuses.abilities.constitution || 0),
            intelligence: (updated.abilities?.intelligence || 10) + (racialBonuses.abilities.intelligence || 0),
            wisdom: (updated.abilities?.wisdom || 10) + (racialBonuses.abilities.wisdom || 0),
            charisma: (updated.abilities?.charisma || 10) + (racialBonuses.abilities.charisma || 0),
            // Дублируем в сокращенном формате
            STR: (updated.abilities?.STR || 10) + (racialBonuses.abilities.STR || 0),
            DEX: (updated.abilities?.DEX || 10) + (racialBonuses.abilities.DEX || 0),
            CON: (updated.abilities?.CON || 10) + (racialBonuses.abilities.CON || 0),
            INT: (updated.abilities?.INT || 10) + (racialBonuses.abilities.INT || 0),
            WIS: (updated.abilities?.WIS || 10) + (racialBonuses.abilities.WIS || 0),
            CHA: (updated.abilities?.CHA || 10) + (racialBonuses.abilities.CHA || 0)
          };
        }
      }
      
      return updated;
    });
  }, []);

  // Перейти к следующему шагу
  const nextStep = useCallback(() => {
    if (currentStep === 6) {
      // Завершаем создание персонажа
      const finalCharacter = createDefaultCharacter();
      
      // Убедимся, что у персонажа всегда есть id
      const mergedCharacter = {
        ...finalCharacter,
        ...character,
        id: character.id || uuidv4(), // Гарантируем, что id всегда существует
        abilities: {
          ...finalCharacter.abilities,
          ...character.abilities,
          // Ensure both naming conventions
          STR: character.abilities?.STR || character.abilities?.strength || 10,
          DEX: character.abilities?.DEX || character.abilities?.dexterity || 10,
          CON: character.abilities?.CON || character.abilities?.constitution || 10,
          INT: character.abilities?.INT || character.abilities?.intelligence || 10,
          WIS: character.abilities?.WIS || character.abilities?.wisdom || 10,
          CHA: character.abilities?.CHA || character.abilities?.charisma || 10,
          strength: character.abilities?.strength || character.abilities?.STR || 10,
          dexterity: character.abilities?.dexterity || character.abilities?.DEX || 10,
          constitution: character.abilities?.constitution || character.abilities?.CON || 10,
          intelligence: character.abilities?.intelligence || character.abilities?.INT || 10,
          wisdom: character.abilities?.wisdom || character.abilities?.WIS || 10,
          charisma: character.abilities?.charisma || character.abilities?.CHA || 10
        }
      } as Character; // Используем явное приведение типа
      
      // Save character to context
      if (addCharacter) {
        addCharacter(mergedCharacter);
      }
      
      // Show success notification
      toast({
        title: "Персонаж создан",
        description: `${mergedCharacter.name} готов к приключениям!`,
      });
      
      // Call onComplete callback if provided
      if (onComplete) {
        onComplete(mergedCharacter);
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, character, addCharacter, toast, onComplete]);

  // Вернуться к предыдущему шагу
  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(0, prev - 1));
  }, []);

  // Функция для сброса персонажа
  const resetCharacter = useCallback(() => {
    setCharacter({
      id: uuidv4(),
      name: '',
      race: '',
      class: '',
      level: 1,
      abilities: {
        strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10,
        STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10
      },
      spells: [],
    });
    setCurrentStep(0);
  }, []);

  // Check if character's class is a magic user
  const isMagicClass = useCallback(() => {
    const magicClasses = [
      'Бард', 'Жрец', 'Друид', 'Волшебник', 'Колдун', 
      'Чародей', 'Паладин', 'Следопыт'
    ];
    return character.class ? magicClasses.includes(character.class) : false;
  }, [character.class]);

  // Using a helper to create a full character from partial data
  const convertToFullCharacter = useCallback((partialChar: Partial<Character>): Character => {
    return convertToCharacter(partialChar);
  }, []);

  return {
    currentStep,
    character,
    updateCharacter,
    nextStep,
    prevStep: useCallback(() => {
      setCurrentStep(prev => Math.max(0, prev - 1));
    }, []),
    resetCharacter: useCallback(() => {
      setCharacter({
        id: uuidv4(),
        name: '',
        race: '',
        class: '',
        level: 1,
        abilities: {
          strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10
        },
        spells: [],
      });
      setCurrentStep(0);
    }, []),
    setCurrentStep,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === 6,
    isMagicClass: useCallback(() => {
      const magicClasses = [
        'Бард', 'Жрец', 'Друид', 'Волшебник', 'Колдун', 
        'Чародей', 'Паладин', 'Следопыт'
      ];
      return character.class ? magicClasses.includes(character.class) : false;
    }, [character.class]),
    convertToCharacter: convertToCharacter
  };
};

export default useCharacterCreation;
