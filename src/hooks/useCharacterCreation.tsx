import { useState } from "react";
import { Character } from "@/types/character";
import { useToast } from "@/hooks/use-toast";
import { getModifierFromAbilityScore } from "@/utils/characterUtils";
import { getCurrentUid } from "@/utils/authHelpers";

export const useCharacterCreation = () => {
  const { toast } = useToast();
  const [character, setCharacter] = useState<Character>({
    name: "",
    gender: "",
    race: "",
    class: "",
    subclass: "",
    additionalClasses: [],
    level: 1,
    background: "",
    alignment: "",
    abilities: {
      // Add legacy ability score properties
      STR: 10,
      DEX: 10,
      CON: 10,
      INT: 10,
      WIS: 10,
      CHA: 10,
      // Add new ability score properties
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    stats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    // Initialize with empty objects instead of arrays
    skills: {},
    savingThrows: {},
    proficiencies: [],
    languages: [],
    equipment: [],
    spells: [],
    features: [],
    personalityTraits: "",
    ideals: "",
    bonds: "",
    flaws: "",
    appearance: "",
    backstory: ""
  });

  const updateCharacter = (updates: Partial<Character>) => {
    // Если обновляются abilities, также обновляем и stats для совместимости
    if (updates.abilities) {
      // Make sure we include both old and new properties when updating abilities
      const { strength, dexterity, constitution, intelligence, wisdom, charisma } = updates.abilities;
      
      updates.stats = {
        strength: strength || updates.abilities.STR || character.abilities?.strength || 10,
        dexterity: dexterity || updates.abilities.DEX || character.abilities?.dexterity || 10,
        constitution: constitution || updates.abilities.CON || character.abilities?.constitution || 10,
        intelligence: intelligence || updates.abilities.INT || character.abilities?.intelligence || 10,
        wisdom: wisdom || updates.abilities.WIS || character.abilities?.wisdom || 10,
        charisma: charisma || updates.abilities.CHA || character.abilities?.charisma || 10
      };
    }
    // Если обновляются stats, также обновляем и abilities для совместимости
    else if (updates.stats) {
      updates.abilities = {
        // Keep existing STR, DEX, etc. properties
        STR: character.abilities?.STR || 10,
        DEX: character.abilities?.DEX || 10,
        CON: character.abilities?.CON || 10,
        INT: character.abilities?.INT || 10,
        WIS: character.abilities?.WIS || 10,
        CHA: character.abilities?.CHA || 10,
        // Update with new values
        strength: updates.stats.strength || 10,
        dexterity: updates.stats.dexterity || 10,
        constitution: updates.stats.constitution || 10,
        intelligence: updates.stats.intelligence || 10,
        wisdom: updates.stats.wisdom || 10,
        charisma: updates.stats.charisma || 10
      };
    }
    
    // Добавляем userId из текущего авторизованного пользователя, если он доступен
    const uid = getCurrentUid();
    if (uid && !character.userId) {
      updates.userId = uid;
    }
    
    // Проверяем и удаляем undefined значения
    const cleanedUpdates = { ...updates };
    Object.keys(cleanedUpdates).forEach(key => {
      if (cleanedUpdates[key] === undefined) {
        delete cleanedUpdates[key];
      }
    });
    
    setCharacter(prev => ({ ...prev, ...cleanedUpdates }));
    console.log("Персонаж обновлен:", { ...character, ...cleanedUpdates });
  };

  // Проверяем, является ли класс магическим
  const checkMagicClass = (characterClass = '') => {
    const magicClasses = ["Бард", "Волшебник", "Жрец", "Колдун", "Следопыт", "Чародей", "Паладин", "Друид"];
    return magicClasses.includes(characterClass);
  };

  // Получаем общий уровень персонажа (основной + мультикласс)
  const getTotalLevel = (character: Character): number => {
    let totalLevel = character.level;
    
    if (character.additionalClasses && character.additionalClasses.length > 0) {
      character.additionalClasses.forEach(cls => {
        totalLevel += cls.level;
      });
    }
    
    return totalLevel;
  };

  // Получаем бонус мастерства на основе общего уровня
  const getProficiencyBonus = (level: number): number => {
    if (level < 5) return 2;
    if (level < 9) return 3;
    if (level < 13) return 4;
    if (level < 17) return 5;
    return 6; // 17+ уровень
  };

  // Вычисляем модификатор характеристики
  const getModifier = (score: number): string => {
    return getModifierFromAbilityScore(score);
  };
  
  // Получаем особенности подкласса, доступные для текущего уровня
  const getAvailableSubclassFeatures = (characterClass: string, characterSubclass?: string, level?: number): string[] => {
    if (!characterSubclass) return [];
    
    // Simple example implementation
    return [
      `${characterSubclass} (подкласс ${characterClass})`
    ];
  };
  
  // Получаем доступные классовые особенности на основе уровня
  const getClassFeatures = (characterClass: string, level: number): string[] => {
    // Simple implementation
    return [];
  };
  
  // Рассчитываем опыт необходимый для текущего уровня
  const getRequiredXP = (level: number): number => {
    const xpByLevel = [
      0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
      85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
    ];
    
    const adjustedLevel = Math.min(20, Math.max(1, level));
    return xpByLevel[adjustedLevel - 1];
  };
  
  // Расчет количества очков для распределения характеристик в зависимости от уровня
  const getAbilityScorePointsByLevel = (basePoints: number = 27): number => {
    let totalPoints = basePoints;
    
    // Add level-based bonuses
    if (character.level >= 5) totalPoints += 3;
    if (character.level >= 10) totalPoints += 2; // Total +5 at level 10
    if (character.level >= 15) totalPoints += 2; // Total +7 at level 15
    
    return totalPoints;
  };
  
  // Обработчик для изменения уровня персонажа
  const handleLevelChange = (level: number) => {
    // Проверяем, не превышает ли общий уровень 20 с учетом мультикласса
    let additionalLevels = 0;
    if (character.additionalClasses) {
      additionalLevels = character.additionalClasses.reduce(
        (total, cls) => total + cls.level, 0
      );
    }
    
    if (level + additionalLevels > 20) {
      toast({
        title: "Превышен максимальный уровень",
        description: `Общий уровень персонажа не может превышать 20. У вас уже есть ${additionalLevels} уровней в дополнительных классах.`,
        variant: "destructive"
      });
      return;
    }
    
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
  
  // Получаем все классы персонажа (основной + мультикласс)
  const getAllClasses = (character: Character): string[] => {
    const allClasses = [character.class];
    
    if (character.additionalClasses && character.additionalClasses.length > 0) {
      character.additionalClasses.forEach(cls => {
        allClasses.push(cls.class);
      });
    }
    
    return allClasses.filter(Boolean) as string[];
  };

  return { 
    character, 
    updateCharacter, 
    isMagicClass: () => checkMagicClass(character.class), 
    getProficiencyBonus,
    getModifier,
    getAvailableSubclassFeatures,
    getClassFeatures,
    getRequiredXP,
    handleLevelChange,
    getTotalLevel,
    getAllClasses,
    getAbilityScorePointsByLevel,
    convertToCharacter
  };
};

const getProficiencyBonus = (level: number): number => {
  if (level < 5) return 2;
  if (level < 9) return 3;
  if (level < 13) return 4;
  if (level < 17) return 5;
  return 6; // 17+ уровень
};

const getAvailableSubclassFeatures = (characterClass: string, characterSubclass?: string, level?: number): string[] => {
  if (!characterSubclass) return [];
  
  // Simple example implementation
  return [
    `${characterSubclass} (подкласс ${characterClass})`
  ];
};

const getClassFeatures = (characterClass: string, level: number): string[] => {
  // Simple implementation
  return [];
};

const getRequiredXP = (level: number): number => {
  const xpByLevel = [
    0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
    85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
  ];
  
  const adjustedLevel = Math.min(20, Math.max(1, level));
  return xpByLevel[adjustedLevel - 1];
};

const getAbilityScorePointsByLevel = (level: number, basePoints: number = 27): number => {
  let totalPoints = basePoints;
  
  // Add level-based bonuses
  if (level >= 5) totalPoints += 3;
  if (level >= 10) totalPoints += 2; // Total +5 at level 10
  if (level >= 15) totalPoints += 2; // Total +7 at level 15
  
  return totalPoints;
};

const convertToCharacter = (characterData: any): Character => {
  return characterData as Character;
};
