import { useState, useEffect } from "react";
import { Character } from "@/types/character";
import { toast } from 'sonner';
import { getModifierFromAbilityScore } from "@/utils/characterUtils";
import { getCurrentUid } from "@/utils/authHelpers";
import { saveCharacterToFirestore } from "@/services/characterService";

export const useCharacterCreation = () => {
  const defaultCharacter: Character = {
    id: "",
    name: "",
    gender: "",
    race: "",
    class: "",
    subclass: "",
    additionalClasses: [],
    level: 1,
    background: "",
    alignment: "",
    experience: 0,
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    maxHp: 10,
    currentHp: 10,
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
  };

  const [character, setCharacter] = useState<Character>(defaultCharacter);
  const [characterReady, setCharacterReady] = useState<boolean>(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(false);
  const [alreadySaved, setAlreadySaved] = useState<boolean>(false);
  const [additionalClasses, setAdditionalClasses] = useState<Array<{
    class: string;
    level: number;
    subclass?: string;
  }>>([]);

  // Автоматическое сохранение персонажа, когда он готов
  useEffect(() => {
    const autoSaveCharacter = async () => {
      // Добавляем проверку на alreadySaved, чтобы избежать дублирующих сохранений
      if (characterReady && autoSaveEnabled && !alreadySaved && !character.id) {
        const uid = getCurrentUid();
        if (!uid) {
          console.warn("No user ID available, can't auto-save character");
          return;
        }

        try {
          const characterId = await saveCharacterToFirestore(character, uid);
          if (characterId) {
            console.log("✅ Character auto-saved to Firestore with ID:", characterId);
            // Обновляем ID персонажа в локальном состоянии
            setCharacter(prev => ({...prev, id: characterId}));
            setAlreadySaved(true); // Отмечаем, что персонаж уже сохранен
            toast.success("Ваш персонаж был автоматически сохранен");
          }
        } catch (error) {
          console.error("❌ Error during character auto-save:", error);
          toast.error("Не удалось автоматически сохранить персонажа");
        }
      }
    };

    autoSaveCharacter();
  }, [characterReady, autoSaveEnabled, character, alreadySaved]);

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
    
    // Если обновляется ID и ранее не было ID, отмечаем персонажа как сохраненный
    if (updates.id && !character.id) {
      setAlreadySaved(true);
    }
    
    setCharacter(prev => ({ ...prev, ...cleanedUpdates }));
    console.log("Персонаж обновлен:", { ...character, ...cleanedUpdates });
  };

  // Функция для проверки готовности персонажа к сохранению
  const checkCharacterReady = (char: Character = character) => {
    // Проверяем наличие обязательных полей
    const isReady = !!(
      char.name && 
      char.race && 
      char.class && 
      char.level
    );
    
    setCharacterReady(isReady);
    return isReady;
  };

  // Функция для включения автосохранения и проверки готовности персонажа
  const enableAutoSave = () => {
    const isReady = checkCharacterReady();
    setAutoSaveEnabled(true);
    return isReady;
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

  // Получаем бонус мастерства на ��снове общего уровня
  const getProficiencyBonus = (level: number): number => {
    if (level < 5) return 2;
    if (level < 9) return 3;
    if (level < 13) return 4;
    if (level < 17) return 5;
    return 6; // 17+ уровень
  };

  // Вычисляем модификатор характеристики
  const getModifier = (score: number): string => {
    const modifier = getModifierFromAbilityScore(score);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
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
  const handleLevelChange = (level: number | string) => {
    // Convert level from string to number if needed
    const newLevel = typeof level === 'string' ? parseInt(level, 10) : level;
    
    // Проверяем, не превышает ли общий уровень 20 с учетом мультикласса
    let additionalLevels = 0;
    if (character.additionalClasses) {
      additionalLevels = character.additionalClasses.reduce(
        (total, cls) => total + cls.level, 0
      );
    }
    
    if (newLevel + additionalLevels > 20) {
      toast.error(`Общий уровень персонажа не может прев��шать 20. У вас уже есть ${additionalLevels} уровней в дополнительных классах.`);
      return;
    }
    
    if (newLevel >= 1 && newLevel <= 20) {
      // Обновляем уровень в состоянии персонажа
      updateCharacter({ level: newLevel });
      
      // Опционально: здесь можно добавить логику изменения доступных
      // заклинаний, особенностей класса и подкласса в зависимости от уровня
      
      console.log(`Уровень персонажа изменен на ${newLevel}`);
    } else {
      toast.error("Уровень должен быть от 1 до 20");
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
  
  // Функция для конвертации данных в тип Character
  const convertToCharacter = (characterData: any): Character => {
    return characterData as Character;
  };

  // Функции для управления мультиклассами
  const handleAddClass = (className: string) => {
    if (!character) return;
    
    const updatedClasses = Array.isArray(character.additionalClasses) ? 
      [...character.additionalClasses, className] : 
      [className];
    
    setCharacter({
      ...character,
      additionalClasses: updatedClasses
    });
  };

  const handleRemoveClass = (index: number) => {
    if (!character || !Array.isArray(character.additionalClasses)) return;
    
    const updatedClasses = [...character.additionalClasses];
    updatedClasses.splice(index, 1);
    
    setCharacter({
      ...character,
      additionalClasses: updatedClasses
    });
  };

  const handleMultiClass = (className: string) => {
    if (!character) return;
    
    // Check if additionalClasses exists and is an array
    if (!character.additionalClasses) {
      setCharacter({
        ...character,
        additionalClasses: [className]
      });
      return;
    }
    
    // If it exists, add the class if it's not already included
    if (Array.isArray(character.additionalClasses) && !character.additionalClasses.includes(className)) {
      setCharacter({
        ...character,
        additionalClasses: [...character.additionalClasses, className]
      });
    }
  };

  const handleClassChange = (selectedClass: string) => {
    // Convert level from string to number if needed
    const classLevel = typeof selectedLevel === 'string' 
      ? parseInt(selectedLevel, 10) 
      : (selectedLevel || 1);

    // Обновляем класс в состоянии персонажа
    updateCharacter({ class: selectedClass, level: classLevel });
  };

  const handleSubclassChange = (selectedSubclass: string) => {
    // Convert class from string to string if needed (sanity check)
    const currentClass = typeof character.class === 'string' 
      ? character.class 
      : '';
    
    // Обновляем подкласс в состоянии персонажа
    updateCharacter({ subclass: selectedSubclass });
  };

  const handleAdditionalClassAdd = () => {
    if (additionalClasses.length < 3) {
      setAdditionalClasses([...additionalClasses, { class: '', level: 1 }]);
    }
  };

  const handleAdditionalClassRemove = (index: number) => {
    const updatedClasses = [...additionalClasses];
    updatedClasses.splice(index, 1);
    setAdditionalClasses(updatedClasses);
  };

  const handleAdditionalClassChange = (index: number, update: Partial<{ class: string, level: number, subclass: string }>) => {
    const updatedClasses = [...additionalClasses];
    updatedClasses[index] = { ...updatedClasses[index], ...update };
    setAdditionalClasses(updatedClasses);
  };

  const updateAdditionalClass = (index: number, updates: Partial<any>) => {
    if (!additionalClasses) {
      console.warn('No additionalClasses found when trying to update');
      return;
    }

    const updatedClasses = [...additionalClasses];
    updatedClasses[index] = {
      ...updatedClasses[index],
      ...updates,
      // Convert level from string to number if it exists
      ...(updates.level !== undefined ? { level: Number(updates.level) } : {}),
    };

    setAdditionalClasses(updatedClasses);
  };

  const updateCharacterLevel = () => {
    if (!character.class && !additionalClasses?.length) {
      return 1;
    }

    let totalLevel = character.class ? Number(character.level || 1) : 0;
    
    additionalClasses?.forEach(cls => {
      if (cls && cls.level) {
        totalLevel += Number(cls.level);
      }
    });

    return totalLevel || 1;
  };

  const handleApplyBackground = (background: any) => {
    const backgroundClassName = typeof background === 'object' && background.class ? 
      String(background.class) : '';

    if (backgroundClassName) {
      setCharacter(prev => ({
        ...prev,
        background: backgroundClassName
      }));
    }
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
    convertToCharacter,
    characterReady,
    checkCharacterReady,
    enableAutoSave,
    autoSaveEnabled,
    alreadySaved  // Добавляем новое свойство для отслеживания состояния сохранения
  };
};

// Вспомогательные функции для использования вне хука
export const getProficiencyBonus = (level: number): number => {
  if (level < 5) return 2;
  if (level < 9) return 3;
  if (level < 13) return 4;
  if (level < 17) return 5;
  return 6; // 17+ уровень
};

export const getAvailableSubclassFeatures = (characterClass: string, characterSubclass?: string, level?: number): string[] => {
  if (!characterSubclass) return [];
  
  // Simple example implementation
  return [
    `${characterSubclass} (подкласс ${characterClass})`
  ];
};

export const getClassFeatures = (characterClass: string, level: number): string[] => {
  // Simple implementation
  return [];
};

export const getRequiredXP = (level: number): number => {
  const xpByLevel = [
    0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000,
    85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000
  ];
  
  const adjustedLevel = Math.min(20, Math.max(1, level));
  return xpByLevel[adjustedLevel - 1];
};

export const getAbilityScorePointsByLevel = (level: number, basePoints: number = 27): number => {
  let totalPoints = basePoints;
  
  // Add level-based bonuses
  if (level >= 5) totalPoints += 3;
  if (level >= 10) totalPoints += 2; // Total +5 at level 10
  if (level >= 15) totalPoints += 2; // Total +7 at level 15
  
  return totalPoints;
};

export const convertToCharacter = (characterData: any): Character => {
  return characterData as Character;
};
