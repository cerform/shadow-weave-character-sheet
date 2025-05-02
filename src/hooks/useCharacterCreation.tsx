
import { useState } from "react";
import { CharacterSheet } from "@/types/character";
import { useToast } from "@/hooks/use-toast";

export const useCharacterCreation = () => {
  const { toast } = useToast();
  const [character, setCharacter] = useState<CharacterSheet>({
    name: "",
    race: "",
    class: "",
    subclass: "", // Добавляем поле для подкласса
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
  const isMagicClass = (): boolean => {
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
    if (magicSubclasses.includes(character.subclass)) {
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
  const getModifier = (score: number): number => {
    return Math.floor((score - 10) / 2);
  };

  return { 
    character, 
    updateCharacter, 
    isMagicClass: isMagicClass(), 
    getProficiencyBonus,
    getModifier
  };
};
