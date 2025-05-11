
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
      STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10,
      strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10
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
          // Обеспечиваем дублирование для совместимости
          STR: updates.abilities.strength ?? updates.abilities.STR ?? prev.abilities?.STR ?? 10,
          DEX: updates.abilities.dexterity ?? updates.abilities.DEX ?? prev.abilities?.DEX ?? 10,
          CON: updates.abilities.constitution ?? updates.abilities.CON ?? prev.abilities?.CON ?? 10,
          INT: updates.abilities.intelligence ?? updates.abilities.INT ?? prev.abilities?.INT ?? 10,
          WIS: updates.abilities.wisdom ?? updates.abilities.WIS ?? prev.abilities?.WIS ?? 10,
          CHA: updates.abilities.charisma ?? updates.abilities.CHA ?? prev.abilities?.CHA ?? 10,
          strength: updates.abilities.STR ?? updates.abilities.strength ?? prev.abilities?.strength ?? 10,
          dexterity: updates.abilities.DEX ?? updates.abilities.dexterity ?? prev.abilities?.dexterity ?? 10,
          constitution: updates.abilities.CON ?? updates.abilities.constitution ?? prev.abilities?.constitution ?? 10,
          intelligence: updates.abilities.INT ?? updates.abilities.intelligence ?? prev.abilities?.intelligence ?? 10,
          wisdom: updates.abilities.WIS ?? updates.abilities.wisdom ?? prev.abilities?.wisdom ?? 10,
          charisma: updates.abilities.CHA ?? updates.abilities.charisma ?? prev.abilities?.charisma ?? 10
        };
      }
      
      // Применяем расовые бонусы если выбрана раса
      if (prev.race !== updated.race && updated.race) {
        const racialBonuses = calculateStatBonuses(updated as Character);
        if (racialBonuses && racialBonuses.abilities) {
          updated.abilities = {
            ...updated.abilities!,
            STR: (updated.abilities?.STR || 10) + (racialBonuses.abilities.STR || 0),
            DEX: (updated.abilities?.DEX || 10) + (racialBonuses.abilities.DEX || 0),
            CON: (updated.abilities?.CON || 10) + (racialBonuses.abilities.CON || 0),
            INT: (updated.abilities?.INT || 10) + (racialBonuses.abilities.INT || 0),
            WIS: (updated.abilities?.WIS || 10) + (racialBonuses.abilities.WIS || 0),
            CHA: (updated.abilities?.CHA || 10) + (racialBonuses.abilities.CHA || 0),
            strength: (updated.abilities?.strength || 10) + (racialBonuses.abilities.strength || 0),
            dexterity: (updated.abilities?.dexterity || 10) + (racialBonuses.abilities.dexterity || 0),
            constitution: (updated.abilities?.constitution || 10) + (racialBonuses.abilities.constitution || 0),
            intelligence: (updated.abilities?.intelligence || 10) + (racialBonuses.abilities.INT || 0),
            wisdom: (updated.abilities?.wisdom || 10) + (racialBonuses.abilities.wisdom || 0),
            charisma: (updated.abilities?.charisma || 10) + (racialBonuses.abilities.charisma || 0)
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
        id: character.id || uuidv4() // Гарантируем, что id всегда существует
      };
      
      // Save character to context
      if (addCharacter) {
        addCharacter(mergedCharacter);
      }
      
      // Show success notification
      toast({
        title: 'Персонаж создан',
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

  // Сбросить всё
  const resetCharacter = useCallback(() => {
    setCharacter({
      id: uuidv4(),
      name: '',
      race: '',
      class: '',
      level: 1,
      abilities: {
        STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10,
        strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10
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
    prevStep,
    resetCharacter,
    setCurrentStep,
    isFirstStep: currentStep === 0,
    isLastStep: currentStep === 6,
    isMagicClass,
    convertToCharacter: convertToFullCharacter
  };
};

export default useCharacterCreation;
