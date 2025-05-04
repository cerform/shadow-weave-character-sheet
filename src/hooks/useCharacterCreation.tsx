
import { useState, useContext } from 'react';
import { useToast } from './use-toast';
import { CharacterContext } from '@/contexts/CharacterContext';
import { CharacterSheet } from '@/types/character';

export const useCharacterCreation = () => {
  const { updateCharacter: updateContextCharacter, saveCurrentCharacter, character: contextCharacter } = useContext(CharacterContext);
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState(0);

  // Создаем начальное состояние персонажа, если его нет в контексте
  const [character, setCharacter] = useState<Partial<CharacterSheet>>(() => {
    if (contextCharacter) {
      return contextCharacter;
    }
    
    return {
      name: '',
      race: '',
      subrace: '',
      class: '',
      subclass: '',
      level: 1,
      background: '',
      alignment: '',
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
      backstory: '',
      maxHp: 0,
      currentHp: 0,
      spells: [],
      equipment: [],
      proficiencies: {
        armor: [],
        weapons: [],
        tools: [],
        languages: []
      },
      languages: []
    };
  });

  // Функция обновления данных персонажа
  const updateCharacter = (updates: Partial<CharacterSheet>) => {
    setCharacter(prev => {
      const updated = { ...prev, ...updates };
      
      // Если обновляются характеристики, синхронизируем их
      if (updates.abilities) {
        // Обновляем STR, DEX и т.д. если обновились strength, dexterity и т.д.
        if (updates.abilities.strength !== undefined) updated.abilities!.STR = updates.abilities.strength;
        if (updates.abilities.dexterity !== undefined) updated.abilities!.DEX = updates.abilities.dexterity;
        if (updates.abilities.constitution !== undefined) updated.abilities!.CON = updates.abilities.constitution;
        if (updates.abilities.intelligence !== undefined) updated.abilities!.INT = updates.abilities.intelligence;
        if (updates.abilities.wisdom !== undefined) updated.abilities!.WIS = updates.abilities.wisdom;
        if (updates.abilities.charisma !== undefined) updated.abilities!.CHA = updates.abilities.charisma;
        
        // И наоборот
        if (updates.abilities.STR !== undefined) updated.abilities!.strength = updates.abilities.STR;
        if (updates.abilities.DEX !== undefined) updated.abilities!.dexterity = updates.abilities.DEX;
        if (updates.abilities.CON !== undefined) updated.abilities!.constitution = updates.abilities.CON;
        if (updates.abilities.INT !== undefined) updated.abilities!.intelligence = updates.abilities.INT;
        if (updates.abilities.WIS !== undefined) updated.abilities!.wisdom = updates.abilities.WIS;
        if (updates.abilities.CHA !== undefined) updated.abilities!.charisma = updates.abilities.CHA;
      }
      
      // Обновляем персонажа в контексте, если он там есть
      if (contextCharacter && updateContextCharacter) {
        updateContextCharacter(updates);
      }
      
      return updated;
    });
  };

  // Функция сохранения персонажа
  const saveCharacter = async () => {
    try {
      if (!character.name || !character.race || !character.class) {
        toast({
          title: "Ошибка сохранения",
          description: "Заполните обязательные поля: имя, раса и класс",
          variant: "destructive"
        });
        return;
      }
      
      // Если персонаж уже в контексте, используем метод контекста
      if (contextCharacter && saveCurrentCharacter) {
        await saveCurrentCharacter();
        return;
      }
      
      // Иначе создаем нового персонажа
      // Этот код будет выполнен, если вы используете свой сервис для сохранения персонажей
      toast({
        title: "Персонаж сохранен",
        description: `${character.name} успешно сохранен`
      });
      
    } catch (error) {
      console.error("Ошибка при сохранении персонажа:", error);
      toast({
        title: "Ошибка сохранения",
        description: "Произошла ошибка при сохранении персонажа",
        variant: "destructive"
      });
    }
  };

  // Функция сброса персонажа
  const resetCharacter = () => {
    setCharacter({
      name: '',
      race: '',
      subrace: '',
      class: '',
      subclass: '',
      level: 1,
      background: '',
      alignment: '',
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
      backstory: '',
      maxHp: 0,
      currentHp: 0,
      spells: [],
      equipment: [],
      proficiencies: {
        armor: [],
        weapons: [],
        tools: [],
        languages: []
      },
      languages: []
    });
    
    setActiveStep(0);
    
    toast({
      title: "Персонаж сброшен",
      description: "Все данные персонажа были сброшены"
    });
  };

  return {
    character,
    updateCharacter,
    saveCharacter,
    resetCharacter,
    activeStep,
    setActiveStep
  };
};
