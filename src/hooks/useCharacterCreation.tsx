
import { useState, useEffect, useCallback } from "react";
import { CharacterSheet, ClassLevel } from "@/types/character";
import { useToast } from "@/hooks/use-toast";
import { convertToCharacter } from "@/utils/characterConverter";
import { getModifierFromAbilityScore, isMagicClass as checkIsMagicClass } from "@/utils/characterUtils";
import { getCurrentUid } from "@/utils/authHelpers";

export const useCharacterCreation = () => {
  const { toast } = useToast();
  const [character, setCharacter] = useState<CharacterSheet>({
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
    stats: {
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10
    },
    skills: {},  // Пустой объект вместо пустого массива
    languages: [],
    equipment: [],
    spells: [],
    proficiencies: {  // Правильная инициализация
      armor: [],
      weapons: [],
      tools: [],
      languages: []
    },
    features: [],
    personalityTraits: "",
    ideals: "",
    bonds: "",
    flaws: "",
    appearance: "",
    backstory: ""
  });

  const updateCharacter = useCallback((updates: Partial<CharacterSheet>) => {
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
  }, [character]);

  // Полный сброс состояния персонажа
  const resetCharacter = useCallback(() => {
    console.log("Сброс персонажа");
    setCharacter({
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
      stats: {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      },
      skills: {},
      languages: [],
      equipment: [],
      spells: [],
      proficiencies: {
        armor: [],
        weapons: [],
        tools: [],
        languages: []
      },
      features: [],
      personalityTraits: "",
      ideals: "",
      bonds: "",
      flaws: "",
      appearance: "",
      backstory: ""
    });
  }, []);

  // Проверяем, является ли класс магическим
  const checkMagicClass = useCallback(() => {
    if (!character.class) return false;
    return checkIsMagicClass(character.class);
  }, [character.class]);

  // Получаем общий уровень персонажа (основной + мультикласс)
  const getTotalLevel = useCallback((): number => {
    let totalLevel = character.level;
    
    if (character.additionalClasses && character.additionalClasses.length > 0) {
      character.additionalClasses.forEach(cls => {
        totalLevel += cls.level;
      });
    }
    
    return totalLevel;
  }, [character.level, character.additionalClasses]);

  // Получаем бонус мастерства на основе общего уровня
  const getProficiencyBonus = useCallback((): number => {
    const level = getTotalLevel();
    if (level < 5) return 2;
    if (level < 9) return 3;
    if (level < 13) return 4;
    if (level < 17) return 5;
    return 6; // 17+ уровень
  }, [getTotalLevel]);

  // Вычисляем модификатор характеристики
  const getModifier = useCallback((score: number): string => {
    return getModifierFromAbilityScore(score);
  }, []);
  
  // Получаем особенности подкласса, доступные для текущего уровня
  const getAvailableSubclassFeatures = useCallback((): string[] => {
    if (!character.subclass) return [];
    
    // Здесь будет логика получения особенностей на основе подкласса и уровня
    // Пример возвращаемых данных:
    return [
      `${character.subclass} (подкласс ${character.class})`
    ];
  }, [character.subclass, character.class]);
  
  // Получаем доступные классовые особенности на основе уровня
  const getClassFeatures = useCallback((): string[] => {
    // Здесь будет логика получения особенностей на основе класса и уровня
    return [];
  }, []);
  
  // Рассчитываем опыт необходимый для текущего уровня
  const getRequiredXP = useCallback((): number => {
    const xpByLevel = [
      0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
      85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
    ];
    
    const level = Math.min(20, Math.max(1, getTotalLevel()));
    return xpByLevel[level - 1];
  }, [getTotalLevel]);
  
  // Расчет количества очков для распределения характеристик в зависимости от уровня
  const getAbilityScorePointsByLevel = useCallback((basePoints: number = 27): number => {
    let totalPoints = basePoints;
    
    // Добавляем бонусы за уровни
    const level = getTotalLevel();
    
    if (level >= 5) totalPoints += 3;
    if (level >= 10) totalPoints += 2; // Всего +5 на 10 уровне
    if (level >= 15) totalPoints += 2; // Всего +7 на 15 уровне
    
    return totalPoints;
  }, [getTotalLevel]);
  
  // Обработчик для изменения уровня персонажа
  const handleLevelChange = useCallback((level: number) => {
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
  }, [character.additionalClasses, toast, updateCharacter]);
  
  // Получаем все классы персонажа (основной + мультикласс)
  const getAllClasses = useCallback((): string[] => {
    const allClasses = [character.class];
    
    if (character.additionalClasses && character.additionalClasses.length > 0) {
      character.additionalClasses.forEach(cls => {
        allClasses.push(cls.class);
      });
    }
    
    return allClasses.filter(Boolean) as string[];
  }, [character.class, character.additionalClasses]);

  // Очищаем ресурсы при размонтировании компонента
  useEffect(() => {
    return () => {
      // Очистка при размонтировании
      console.log("Очистка ресурсов useCharacterCreation");
    };
  }, []);

  return { 
    character, 
    updateCharacter, 
    resetCharacter,
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
