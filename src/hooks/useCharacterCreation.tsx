
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { CharacterSheet } from '@/types/character';
import { Character } from '@/contexts/CharacterContext';

// Интерфейс для хука создания персонажа
export interface UseCharacterCreationReturn {
  character: Partial<CharacterSheet>;
  updateCharacter: (updates: Partial<CharacterSheet>) => void;
  saveCharacter: () => Promise<void>;
  activeStep: number;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  nextStep: () => void;
  prevStep: () => void;
  canNext: boolean;
  resetCharacter: () => void; // Добавляем функцию для сброса персонажа
}

export function useCharacterCreation(initialCharacter?: Partial<CharacterSheet>): UseCharacterCreationReturn {
  const { toast } = useToast();
  const [character, setCharacter] = useState<Partial<CharacterSheet>>(() => {
    if (initialCharacter) return initialCharacter;
    
    return {
      name: "",
      race: "",
      subrace: "",
      class: "",
      subclass: "",
      level: 1,
      background: "",
      alignment: "",
      abilities: {
        STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10,
        strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10
      },
      proficiencies: {
        armor: [],
        weapons: [],
        tools: [],
        languages: []
      },
      spells: [],
      equipment: [],
      backstory: "",
      languages: []
    };
  });
  
  const [activeStep, setActiveStep] = useState(0);
  
  // Функция для обновления персонажа
  const updateCharacter = useCallback((updates: Partial<CharacterSheet>) => {
    setCharacter(prev => {
      return { ...prev, ...updates };
    });
  }, []);
  
  // Функция для сохранения персонажа в хранилище
  const saveCharacter = useCallback(async () => {
    try {
      // Проверка наличия обязательных полей
      if (!character.name || !character.race || !character.class) {
        toast({
          title: "Ошибка сохранения",
          description: "Заполните все обязательные поля персонажа (имя, раса, класс).",
          variant: "destructive"
        });
        return;
      }
      
      // Имитация сохранения
      toast({
        title: "Персонаж сохранен",
        description: "Персонаж успешно сохранен!"
      });
      
    } catch (error) {
      console.error('Ошибка при сохранении персонажа:', error);
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить персонажа.",
        variant: "destructive"
      });
    }
  }, [character, toast]);
  
  // Функция для перехода к следующему шагу
  const nextStep = useCallback(() => {
    setActiveStep(prev => prev + 1);
  }, []);
  
  // Функция для возврата к предыдущему шагу
  const prevStep = useCallback(() => {
    setActiveStep(prev => Math.max(prev - 1, 0));
  }, []);
  
  // Функция для сброса персонажа к начальным значениям
  const resetCharacter = useCallback(() => {
    setCharacter({
      name: "",
      race: "",
      subrace: "",
      class: "",
      subclass: "",
      level: 1,
      background: "",
      alignment: "",
      abilities: {
        STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10,
        strength: 10, dexterity: 10, constitution: 10, intelligence: 10, wisdom: 10, charisma: 10
      },
      proficiencies: {
        armor: [],
        weapons: [],
        tools: [],
        languages: []
      },
      spells: [],
      equipment: [],
      backstory: "",
      languages: []
    });
    setActiveStep(0);
    toast({
      title: "Персонаж сброшен",
      description: "Все данные персонажа сброшены к начальным значениям."
    });
  }, [toast]);
  
  // Проверка, можно ли перейти к следующему шагу
  const canNext = Boolean(
    (activeStep === 0 && character.name) || 
    activeStep > 0
  );
  
  return {
    character,
    updateCharacter,
    saveCharacter,
    activeStep,
    setActiveStep,
    nextStep,
    prevStep,
    canNext,
    resetCharacter
  };
}
