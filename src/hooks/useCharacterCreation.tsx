import { useState, useCallback } from 'react';
import { Character } from '@/types/character';

export const useCharacterCreation = () => {
  // Базовое состояние для создания персонажа
  const [characterData, setCharacterData] = useState<Partial<Character>>({
    name: '',
    race: '',
    class: '',
    background: '',
    level: 1,
    alignment: 'Нейтральный',
    abilities: {
      // Обеспечиваем совместимость с обоими форматами
      strength: 10,
      dexterity: 10,
      constitution: 10,
      intelligence: 10,
      wisdom: 10,
      charisma: 10,
      STR: 10,
      DEX: 10,
      CON: 10,
      INT: 10,
      WIS: 10,
      CHA: 10
    },
    maxHp: 10,
    currentHp: 10
  });

  // Текущий шаг создания персонажа
  const [currentStep, setCurrentStep] = useState(1);
  
  // Состояние для отслеживания подклассов и уровня
  const [classInfo, setClassInfo] = useState<{level: number; subclass?: string}>({
    level: 1,
    subclass: undefined
  });

  // Обновление базовой информации персонажа
  const updateBasicInfo = useCallback((info: Partial<Character>) => {
    setCharacterData(prev => ({ ...prev, ...info }));
  }, []);

  // Обновление способностей
  const updateAbilities = useCallback((abilities: Record<string, number>) => {
    // Обеспечиваем обновление в обоих форматах
    const updatedAbilities = { 
      ...characterData.abilities,
      STR: 10,
      DEX: 10,
      CON: 10,
      INT: 10,
      WIS: 10,
      CHA: 10
    };
    
    Object.entries(abilities).forEach(([key, value]) => {
      if (key === 'strength' || key === 'STR') {
        updatedAbilities.strength = value;
        updatedAbilities.STR = value;
      } else if (key === 'dexterity' || key === 'DEX') {
        updatedAbilities.dexterity = value;
        updatedAbilities.DEX = value;
      } else if (key === 'constitution' || key === 'CON') {
        updatedAbilities.constitution = value;
        updatedAbilities.CON = value;
      } else if (key === 'intelligence' || key === 'INT') {
        updatedAbilities.intelligence = value;
        updatedAbilities.INT = value;
      } else if (key === 'wisdom' || key === 'WIS') {
        updatedAbilities.wisdom = value;
        updatedAbilities.WIS = value;
      } else if (key === 'charisma' || key === 'CHA') {
        updatedAbilities.charisma = value;
        updatedAbilities.CHA = value;
      }
    });
    
    setCharacterData(prev => ({ ...prev, abilities: updatedAbilities }));
  }, [characterData.abilities]);

  // Выбор расы
  const selectRace = useCallback((race: string) => {
    setCharacterData(prev => ({ ...prev, race }));
  }, []);

  // Выбор класса
  const selectClass = useCallback((className: string) => {
    setCharacterData(prev => ({
      ...prev,
      class: className,
      hitDice: {
        total: prev.level || 1,
        used: 0,
        type: getHitDiceForClass(className),
        dieType: getHitDiceForClass(className)
      }
    }));
  }, []);

  // Выбор подкласса
  const selectSubclass = useCallback((subclass: string) => {
    setClassInfo(prev => ({ ...prev, subclass }));
  }, []);

  // Выбор мировоззрения
  const selectAlignment = useCallback((alignment: string) => {
    setCharacterData(prev => ({ ...prev, alignment }));
  }, []);

  // Выбор предыстории
  const selectBackground = useCallback((background: string) => {
    setCharacterData(prev => ({ ...prev, background }));
  }, []);

  // Установка уровня
  const setLevel = useCallback((level: number) => {
    setCharacterData(prev => ({ ...prev, level }));
    setClassInfo(prev => ({ ...prev, level }));
  }, []);

  // Расчет здоровья
  const calculateHealth = useCallback(() => {
    if (!characterData.abilities) return;
    
    const conModifier = Math.floor((characterData.abilities.constitution || 10) - 10) / 2;
    const hitDiceValue = getHitDiceValueForClass(characterData.class || '');
    const level = characterData.level || 1;
    
    // Для первого уровня максимальное значение хит-дайса + модификатор телосложения
    let maxHP = hitDiceValue + conModifier;
    
    // Для остальных уровней среднее значение хит-дайса + модификатор телосложения
    if (level > 1) {
      const averageRoll = Math.ceil(hitDiceValue / 2) + 0.5;
      maxHP += (level - 1) * (averageRoll + conModifier);
    }
    
    setCharacterData(prev => ({
      ...prev,
      maxHp: Math.max(1, Math.floor(maxHP)),
      currentHp: Math.max(1, Math.floor(maxHP))
    }));
  }, [characterData.abilities, characterData.class, characterData.level]);

  // Завершение создания персонажа
  const finalizeCharacter = useCallback((): Character => {
    // Рассчитываем бонус мастерства
    const profBonus = Math.floor((characterData.level || 1) / 4) + 2;
    
    // Получаем модификатор ловкости для расчета класса брони
    const dexModifier = Math.floor((characterData.abilities?.dexterity || 10) - 10) / 2;
    
    // Финализируем персонажа
    const finalCharacter: Character = {
      id: Date.now().toString(),
      userId: '',
      name: characterData.name || 'Новый персонаж',
      race: characterData.race || 'Человек',
      class: characterData.class || 'Воин',
      level: characterData.level || 1,
      background: characterData.background || '',
      alignment: characterData.alignment || 'Нейтральный',
      experience: 0,
      abilities: characterData.abilities || {
        strength: 10,
        dexterity: 10,
        constitution: 10,
        intelligence: 10,
        wisdom: 10,
        charisma: 10
      },
      proficiencyBonus: profBonus,
      armorClass: 10 + dexModifier,
      maxHp: characterData.maxHp || 10,
      currentHp: characterData.maxHp || 10,
      temporaryHp: 0,
      hitDice: {
        total: characterData.level || 1,
        used: 0,
        type: getHitDiceForClass(characterData.class || 'Воин')
      },
      deathSaves: {
        successes: 0,
        failures: 0
      },
      inspiration: false,
      inventory: [],
      equipment: [],
      spells: [],
      proficiencies: [],
      features: [],
      notes: '',
      resources: {},
      savingThrowProficiencies: getSavingThrowsForClass(characterData.class || 'Воин'),
      skillProficiencies: [],
      expertise: [],
      skillBonuses: {},
      spellcasting: getSpellcastingForClass(characterData.class || 'Воин'),
      gold: 0,
      initiative: dexModifier,
      lastDiceRoll: { formula: '', rolls: [], total: 0 },
      conditions: [],
      languages: []
    };
    
    return finalCharacter;
  }, [characterData]);

  // Вспомогательные функции
  const getHitDiceForClass = (className: string): string => {
    switch (className.toLowerCase()) {
      case 'варвар': return 'd12';
      case 'паладин':
      case 'воин':
      case 'следопыт': return 'd10';
      case 'бард':
      case 'клерик':
      case 'друид':
      case 'монах':
      case 'плут':
      case 'колдун': return 'd8';
      case 'чародей':
      case 'волшебник': return 'd6';
      default: return 'd8';
    }
  };
  
  const getHitDiceValueForClass = (className: string): number => {
    const diceType = getHitDiceForClass(className);
    switch (diceType) {
      case 'd12': return 12;
      case 'd10': return 10;
      case 'd8': return 8;
      case 'd6': return 6;
      default: return 8;
    }
  };
  
  const getSavingThrowsForClass = (className: string): string[] => {
    switch (className.toLowerCase()) {
      case 'варвар': return ['strength', 'constitution'];
      case 'бард': return ['dexterity', 'charisma'];
      case 'клерик': return ['wisdom', 'charisma'];
      case 'друид': return ['intelligence', 'wisdom'];
      case 'воин': return ['strength', 'constitution'];
      case 'монах': return ['strength', 'dexterity'];
      case 'паладин': return ['wisdom', 'charisma'];
      case 'следопыт': return ['strength', 'dexterity'];
      case 'плут': return ['dexterity', 'intelligence'];
      case 'чародей': return ['constitution', 'charisma'];
      case 'колдун': return ['wisdom', 'charisma'];
      case 'волшебник': return ['intelligence', 'wisdom'];
      default: return ['strength', 'dexterity'];
    }
  };
  
  const getSpellcastingForClass = (className: string): { ability?: string } => {
    switch (className.toLowerCase()) {
      case 'бард': 
      case 'чародей':
      case 'колдун':
      case 'паладин': return { ability: 'charisma' };
      case 'клерик':
      case 'друид':
      case 'следопыт': return { ability: 'wisdom' };
      case 'волшебник': return { ability: 'intelligence' };
      default: return {};
    }
  };

  return {
    characterData,
    currentStep,
    classInfo,
    setCurrentStep,
    updateBasicInfo,
    updateAbilities,
    selectRace,
    selectClass,
    selectSubclass,
    selectAlignment,
    selectBackground,
    setLevel,
    calculateHealth,
    finalizeCharacter
  };
};
