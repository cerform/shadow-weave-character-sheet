import { useState, useEffect } from 'react';
import { Character } from '@/types/character';
import { useToast } from "@/hooks/use-toast";

// Используем интерфейс из types/character.ts
import type { LevelFeature } from '@/types/character';

export const useLevelFeatures = (character: Character) => {
  const [availableFeatures, setAvailableFeatures] = useState<LevelFeature[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<{[key: string]: string}>({});
  const { toast } = useToast();
  
  // Add these states to export
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([
    "Общий", "Эльфийский", "Дварфский", "Гномий", "Орочий", "Гоблинский", "Драконий", "Гигантский", "Глубинная речь"
  ]);
  
  const [availableSkills, setAvailableSkills] = useState<string[]>([
    "Акробатика", "Атлетика", "Магия", "Обман", "История", "Проницательность", 
    "Запугивание", "Расследование", "Медицина", "Природа", "Восприятие", 
    "Выступление", "Убеждение", "Религия", "Ловкость рук", "Скрытность", "Выживание"
  ]);
  
  const [availableTools, setAvailableTools] = useState<string[]>([
    "Инструменты ремесленника", "Инструменты кузнеца", "Инструменты пивовара", 
    "Воровские инструменты", "Набор травника", "Набор целителя", "Музыкальный инструмент"
  ]);
  
  const [availableWeaponTypes, setAvailableWeaponTypes] = useState<string[]>([
    "Простое оружие", "Воинское оружие", "Импровизированное оружие"
  ]);
  
  const [availableArmorTypes, setAvailableArmorTypes] = useState<string[]>([
    "Легкая броня", "Средняя броня", "Тяжелая броня", "Щиты"
  ]);

  // Эффект для определения доступных функций на текущем уровне персонажа
  useEffect(() => {
    if (!character.class) return;
    
    const features: LevelFeature[] = [];
    const level = character.level || 1;

    // Получаем доступные подклассы (архетипы) для класса
    if (level >= getSubclassLevel(character.class) && !character.subclass) {
      features.push({
        id: `subclass-${character.class}-${level}`,
        level: getSubclassLevel(character.class),
        name: 'Архетип',
        description: `Выберите архетип для ${character.class}`,
        type: 'subclass',
        class: character.class,
        required: true
      });
    }

    // Увеличение характеристик
    const abilityScoreImprovements = getAbilityScoreImprovementLevels(character.class);
    for (const abiLevel of abilityScoreImprovements) {
      if (level >= abiLevel) {
        features.push({
          id: `ability-increase-${abiLevel}`,
          level: abiLevel,
          name: 'Увеличение характеристик',
          description: 'Увеличьте одну характеристику на 2 очка или две характеристики на 1 очко каждая',
          type: 'ability_increase'
        });
      }
    }

    // Дополнительная атака
    if (hasExtraAttack(character.class) && level >= 5) {
      features.push({
        id: `extra-attack-${character.class}-5`,
        level: 5,
        name: 'Дополнительная атака',
        description: 'Вы можете атаковать дважды вместо одного раза, когда в свой ход совершаете действие Атака',
        type: 'extra_attack'
      });
    }

    // Доступ к заклинаниям высоких уровней для заклинателей
    if (isMagicClass(character.class)) {
      const spellLevels = getSpellLevelsByCharacterLevel(level);
      for (const [spellLevel, charLevel] of Object.entries(spellLevels)) {
        if (level >= charLevel) {
          features.push({
            id: `spell-level-${spellLevel}`,
            level: charLevel,
            name: `Заклинания ${spellLevel} уровня`,
            description: `Вы получаете доступ к заклинаниям ${spellLevel} уровня`,
            type: 'spell_level'
          });
        }
      }
    }

    // Проверяем наличие обязательных архетипов и выдаем предупреждение
    const requiredSubclass = features.find(f => f.type === 'subclass' && f.required === true);
    if (requiredSubclass && !character.subclass) {
      toast({
        title: "Не выбран архетип",
        description: `Для вашего класса на текущем уровне необходимо выбрать архетип. Нажмите на кнопку "Детали" в разделе Архетип.`,
        variant: "destructive"
      });
    }

    // Сортируем особенности по уровням
    features.sort((a, b) => a.level - b.level);
    
    setAvailableFeatures(features);
  }, [character.class, character.level, character.subclass, toast]);

  // Функция для выбора особенности
  const selectFeature = (featureType: string, value: string) => {
    setSelectedFeatures(prev => ({
      ...prev,
      [featureType]: value
    }));

    toast({
      title: "Особенность выбрана",
      description: `Вы выбрали: ${value}`,
    });
  };

  // Добавляем обработчики для взаимодействия с выбором навыков и характеристик
  const handleLanguageSelection = (language: string, selected: boolean) => {
    // Обработка выбора языка
    if (selected) {
      toast({
        title: "Язык выбран",
        description: `Вы выбрали язык: ${language}`,
      });
    }
  };

  const handleSkillSelection = (skill: string, selected: boolean) => {
    // Обработка выбора навыка
    if (selected) {
      toast({
        title: "Навык выбран",
        description: `Вы выбрали навык: ${skill}`,
      });
    }
  };

  const handleToolSelection = (tool: string, selected: boolean) => {
    // Обработка выбора инструмента
    if (selected) {
      toast({
        title: "Инструмент выбран",
        description: `Вы выбрали инструмент: ${tool}`,
      });
    }
  };

  const handleWeaponTypeSelection = (weaponType: string, selected: boolean) => {
    // Обработка выбора типа оружия
    if (selected) {
      toast({
        title: "Тип оружия выбран",
        description: `Вы выбрали тип оружия: ${weaponType}`,
      });
    }
  };

  const handleArmorTypeSelection = (armorType: string, selected: boolean) => {
    // Обработка выбора типа брони
    if (selected) {
      toast({
        title: "Тип брони выбран",
        description: `Вы выбрали тип брони: ${armorType}`,
      });
    }
  };

  // Helper function for hit dice
  const getHitDiceInfo = (className: string) => {
    switch (className) {
      case "Варвар": return { dieType: "d12", value: "1d12" };
      case "Воин":
      case "Паладин":
      case "Следопыт": return { dieType: "d10", value: "1d10" };
      case "Бард":
      case "Жрец":
      case "Друид":
      case "Монах":
      case "Плут":
      case "Колдун": return { dieType: "d8", value: "1d8" };
      case "Волшебник":
      case "Чародей": return { dieType: "d6", value: "1d6" };
      default: return { dieType: "d8", value: "1d8" };
    }
  };

  // Get subclass level
  const getSubclassLevel = (className: string): number => {
    switch (className) {
      case "Воин": return 3;
      case "Плут": return 3;
      case "Следопыт": return 3;
      case "Варвар": return 3;
      case "Чародей": return 1;
      case "Колдун": return 1;
      case "Волшебник": return 2;
      case "Жрец": return 1;
      case "Друид": return 2;
      case "Монах": return 3;
      case "Паладин": return 3;
      case "Бард": return 3;
      case "Изобретатель": return 3;
      case "Кровавый охотник": return 3;
      case "Мистик": return 2;
      default: return 3;
    }
  };

  // Получаем уровни, на которых происходит увеличение характеристик для выбранного класса
  const getAbilityScoreImprovementLevels = (className: string): number[] => {
    // Для большинства классов: 4, 8, 12, 16, 19
    const defaultLevels = [4, 8, 12, 16, 19];
    
    // Для бойца и плута дополнительные уровни
    switch (className) {
      case "Воин": return [4, 6, 8, 12, 14, 16, 19];
      case "Плут": return [4, 8, 10, 12, 16, 19];
      default: return defaultLevels;
    }
  };

  // Проверяем, имеет ли класс дополнительную атаку
  const hasExtraAttack = (className: string): boolean => {
    const classesWithExtraAttack = [
      "Воин", "Варвар", "Следопыт", "Паладин", "Монах"
    ];
    return classesWithExtraAttack.includes(className);
  };

  // Проверяем, является ли класс магическим
  const isMagicClass = (className: string): boolean => {
    const magicClasses = [
      "Бард", "Волшебник", "Жрец", "Друид", "Чародей", "Колдун", 
      "Паладин", "Следопыт"
    ];
    return magicClasses.includes(className);
  };

  // Получаем доступные уровни заклинаний в зависимости от уровня персонажа
  const getSpellLevelsByCharacterLevel = (characterLevel: number): {[key: string]: number} => {
    return {
      "1": 1,
      "2": 3,
      "3": 5,
      "4": 7,
      "5": 9,
      "6": 11,
      "7": 13,
      "8": 15,
      "9": 17
    };
  };

  // Make sure to return all the needed properties
  return {
    availableFeatures,
    selectedFeatures,
    selectFeature: (featureType: string, value: string) => {
      setSelectedFeatures(prev => ({
        ...prev,
        [featureType]: value
      }));
  
      toast({
        title: "Особенность выбрана",
        description: `Вы выбрали: ${value}`,
      });
    },
    getHitDiceInfo: (className: string) => {
      switch (className) {
        case "Варвар": return { dieType: "d12", value: "1d12" };
        case "Воин":
        case "Паладин":
        case "Следопыт": return { dieType: "d10", value: "1d10" };
        case "Бард":
        case "Жрец":
        case "Друид":
        case "Монах":
        case "Плут":
        case "Колдун": return { dieType: "d8", value: "1d8" };
        case "Волшебник":
        case "Чародей": return { dieType: "d6", value: "1d6" };
        default: return { dieType: "d8", value: "1d8" };
      }
    },
    getSubclassLevel: (className: string): number => {
      switch (className) {
        case "Воин": return 3;
        case "Плут": return 3;
        case "Следопыт": return 3;
        case "Варвар": return 3;
        case "Чародей": return 1;
        case "Колдун": return 1;
        case "Волшебник": return 2;
        case "Жрец": return 1;
        case "Друид": return 2;
        case "Монах": return 3;
        case "Паладин": return 3;
        case "Бард": return 3;
        case "Изобретатель": return 3;
        case "Кровавый охотник": return 3;
        case "Мистик": return 2;
        default: return 3;
      }
    },
    // Add these to the return object:
    availableLanguages,
    availableSkills,
    availableTools,
    availableWeaponTypes,
    availableArmorTypes,
    handleLanguageSelection: (language: string, selected: boolean) => {
      // Обработка выбора языка
      if (selected) {
        toast({
          title: "Язык выбран",
          description: `Вы выбрали язык: ${language}`,
        });
      }
    },
    handleSkillSelection: (skill: string, selected: boolean) => {
      // Обработка выбора навыка
      if (selected) {
        toast({
          title: "Навык выбран",
          description: `Вы выбрали навык: ${skill}`,
        });
      }
    },
    handleToolSelection: (tool: string, selected: boolean) => {
      // Обработка выбора инструмента
      if (selected) {
        toast({
          title: "Инструмент выбран",
          description: `Вы выбрали инструмент: ${tool}`,
        });
      }
    },
    handleWeaponTypeSelection: (weaponType: string, selected: boolean) => {
      // Обработка выбора типа оружия
      if (selected) {
        toast({
          title: "Тип оружия выбран",
          description: `Вы выбрали тип оружия: ${weaponType}`,
        });
      }
    },
    handleArmorTypeSelection: (armorType: string, selected: boolean) => {
      // Обработка выбора типа брони
      if (selected) {
        toast({
          title: "Тип брони выбран",
          description: `Вы выбрали тип брони: ${armorType}`,
        });
      }
    }
  };
};
