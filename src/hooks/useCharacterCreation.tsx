
import { useState } from "react";
import { CharacterSheet } from "@/types/character";
import { useToast } from "@/hooks/use-toast";

export const useCharacterCreation = () => {
  const { toast } = useToast();
  const [character, setCharacter] = useState<CharacterSheet>({
    name: "",
    gender: "", // Добавляем пол с пустой строкой по умолчанию
    race: "",
    class: "",
    subclass: "",
    level: 1,
    background: "",
    alignment: "",
    abilities: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    skills: [],
    languages: [],
    equipment: [],
    spells: [],
    proficiencies: [],
    features: [],
    personalityTraits: "",
    ideals: "",
    bonds: "",
    flaws: "",
    appearance: "",
    backstory: ""
  });

  const updateCharacter = (updates: Partial<CharacterSheet>) => {
    setCharacter(prev => ({ ...prev, ...updates }));
    console.log("Персонаж обновлен:", { ...character, ...updates });
  };

  // Проверяем, является ли класс магическим
  const isMagicClass = () => {
    const magicClasses = [
      "Бард", "Волшебник", "Жрец", "Друид", "Чародей", "Колдун", "Чернокнижник",
      "Паладин", "Следопыт"
    ];
    
    const magicSubclasses = [
      "Мистический рыцарь", // для Воина
      "Мистический ловкач", // для Плута
      "Путь Тотемного Воина", // для Варвара
      "Путь Четырех Стихий" // для Монаха
    ];

    // Проверяем обычные магические классы
    if (magicClasses.includes(character.class)) {
      return true;
    }
    
    // Проверяем подклассы, дающие магию
    if (magicSubclasses.includes(character.subclass || '')) {
      return true;
    }
    
    return false;
  };

  // Получаем бонус мастерства на основе уровня
  const getProficiencyBonus = (): number => {
    const level = character.level || 1;
    if (level < 5) return 2;
    if (level < 9) return 3;
    if (level < 13) return 4;
    if (level < 17) return 5;
    return 6; // 17+ уровень
  };

  // Вычисляем модификатор характеристики
  const getModifier = (score: number): string => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };
  
  // Получаем особенности подкласса, доступные для текущего уровня
  const getAvailableSubclassFeatures = (): string[] => {
    if (!character.subclass) return [];
    
    // Здесь будет логика получения особенностей на основе подкласса и уровня
    // Пример возвращаемых данных:
    return [
      `${character.subclass} (подкласс ${character.class})`
    ];
  };
  
  // Получаем доступные классовые особенности на основе уровня
  const getClassFeatures = (): string[] => {
    // Здесь будет логика получения особенностей на основе класса и уровня
    return [];
  };
  
  // Рассчитываем опыт необходимый для текущего уровня
  const getRequiredXP = (): number => {
    const xpByLevel = [
      0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
      85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
    ];
    
    const level = Math.min(20, Math.max(1, character.level || 1));
    return xpByLevel[level - 1];
  };
  
  // Обработчик для изменения уровня персонажа
  const handleLevelChange = (level: number) => {
    if (level >= 1 && level <= 20) {
      // Обновляем уровень в состоянии персонажа
      updateCharacter({ level });
      
      // Опционально: здесь можно добавить логику изменения доступных
      // заклинаний, особенностей класса и подкласса в зависимости от уровня
      
      console.log(`Уровень персонажа изменен на ${level}`);
    } else {
      toast({
        title: "Некорректный уровень",
        description: "Уровень должен быть от 1 до 20",
        variant: "destructive"
      });
    }
  };

  return { 
    character, 
    updateCharacter, 
    isMagicClass, 
    getProficiencyBonus,
    getModifier,
    getAvailableSubclassFeatures,
    getClassFeatures,
    getRequiredXP,
    handleLevelChange
  };
};
