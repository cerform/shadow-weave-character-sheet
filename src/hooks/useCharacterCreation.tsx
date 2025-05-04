
import { useState } from "react";
import { CharacterSheet, ClassLevel } from "@/types/character";
import { useToast } from "@/hooks/use-toast";
import { convertToCharacter } from "@/utils/characterConverter";
import { getModifierFromAbilityScore, isMagicClass as checkIsMagicClass } from "@/utils/characterUtils";
import { getCurrentUid } from "@/utils/authHelpers";

export const useCharacterCreation = () => {
  const { toast } = useToast();
  const [character, setCharacter] = useState<CharacterSheet>({
    name: "",
    gender: "", // Поле для пола персонажа
    race: "",
    class: "",
    subclass: "",
    additionalClasses: [], // Добавляем поле для мультиклассирования
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
    stats: {  // Добавляем поле stats для совместимости
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
    // Если обновляются abilities, также обновляем и stats для совместимости
    if (updates.abilities) {
      updates.stats = updates.abilities;
    }
    // Если обновляются stats, также обновляем и abilities для совместимости
    else if (updates.stats) {
      updates.abilities = updates.stats;
    }
    
    // Добавляем userId из текущего авторизованного пользователя, если он доступен
    const uid = getCurrentUid();
    if (uid && !character.userId) {
      updates.userId = uid;
    }
    
    setCharacter(prev => ({ ...prev, ...updates }));
    console.log("Персонаж обновлен:", { ...character, ...updates });
  };

  // Проверяем, является ли класс магическим
  const checkMagicClass = () => {
    if (!character.class) return false;
    return checkIsMagicClass(character.class);
  };

  // Получаем общий уровень персонажа (основной + мультикласс)
  const getTotalLevel = (): number => {
    let totalLevel = character.level;
    
    if (character.additionalClasses && character.additionalClasses.length > 0) {
      character.additionalClasses.forEach(cls => {
        totalLevel += cls.level;
      });
    }
    
    return totalLevel;
  };

  // Получаем бонус мастерства на основе общего уровня
  const getProficiencyBonus = (): number => {
    const level = getTotalLevel();
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
    
    const level = Math.min(20, Math.max(1, getTotalLevel()));
    return xpByLevel[level - 1];
  };
  
  // Расчет количества очков для распределения характеристик в зависимости от уровня
  const getAbilityScorePointsByLevel = (basePoints: number = 27): number => {
    let totalPoints = basePoints;
    
    // Добавляем бонусы за уровни
    const level = getTotalLevel();
    
    if (level >= 5) totalPoints += 3;
    if (level >= 10) totalPoints += 2; // Всего +5 на 10 уровне
    if (level >= 15) totalPoints += 2; // Всего +7 на 15 уровне
    
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
  const getAllClasses = (): string[] => {
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
    isMagicClass: checkMagicClass, 
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
