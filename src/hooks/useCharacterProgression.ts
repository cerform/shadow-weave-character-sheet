
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { getSpellsByClass, getSpellsByLevel } from '@/data/spells';
import { CharacterSpell } from '@/types/character';
import { calculateMaxHitPoints, getNumericModifier } from '@/utils/characterUtils';

export interface UseCharacterProgressionProps {
  character: any;
  updateCharacter: (updates: any) => void;
  onMaxHpChange?: (newMaxHp: number, hpChange: number) => void;
}

export function useCharacterProgression({
  character,
  updateCharacter,
  onMaxHpChange
}: UseCharacterProgressionProps) {
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [showSpellSelection, setShowSpellSelection] = useState(false);
  const [availableSpells, setAvailableSpells] = useState<CharacterSpell[]>([]);
  const [selectedSpells, setSelectedSpells] = useState<CharacterSpell[]>([]);
  const [rollMode, setRollMode] = useState<"roll" | "average">("average");
  const [rollResult, setRollResult] = useState<number | null>(null);
  
  const { toast } = useToast();
  
  // Получение кубика хитов для класса персонажа
  const getHitDieValue = useCallback(() => {
    const className = character?.class || character?.className || '';
    const hitDiceValues: Record<string, number> = {
      "Варвар": 12,
      "Воин": 10,
      "Паладин": 10,
      "Следопыт": 10,
      "Монах": 8,
      "Плут": 8,
      "Бард": 8,
      "Жрец": 8,
      "Друид": 8,
      "Колдун": 8,
      "Чернокнижник": 8,
      "Волшебник": 6,
      "Чародей": 6
    };
    
    return hitDiceValues[className] || 8;
  }, [character?.class, character?.className]);
  
  // Получение типа кубика хитов (для UI)
  const getHitDieType = useCallback(() => {
    const className = character?.class || character?.className || '';
    const hitDice: Record<string, "d4" | "d6" | "d8" | "d10" | "d12"> = {
      "Варвар": "d12",
      "Воин": "d10",
      "Паладин": "d10",
      "Следопыт": "d10",
      "Монах": "d8",
      "Плут": "d8",
      "Бард": "d8",
      "Жрец": "d8",
      "Друид": "d8",
      "Колдун": "d8",
      "Чернокнижник": "d8",
      "Волшебник": "d6",
      "Чародей": "d6"
    };
    
    return hitDice[className] || "d8";
  }, [character?.class, character?.className]);
  
  // Определение количества новых заклинаний при повышении уровня
  const getNewSpellsCountOnLevelUp = useCallback(() => {
    if (!character) return 0;
    
    const characterClass = character.class || character.className;
    if (!characterClass) return 0;
    
    const currentLevel = character.level || 1;
    const newLevel = currentLevel + 1;
    
    // Логика определения новых заклинаний в зависимости от класса
    if (characterClass === "Волшебник") {
      return 2; // Волшебники получают 2 новых заклинания за уровень
    } else if (["Жрец", "Друид"].includes(characterClass)) {
      const wisModifier = character.abilities?.WIS 
        ? getNumericModifier(character.abilities.WIS)
        : 0;
      return Math.max(1, wisModifier + newLevel);
    } else if (["Бард", "Колдун", "Чернокнижник", "Чародей"].includes(characterClass)) {
      if ([3, 5, 7, 9, 11, 13, 15, 17].includes(newLevel)) return 1;
      else return 0;
    } else if (["Паладин", "Следопыт"].includes(characterClass)) {
      if ([5, 9, 13, 17].includes(newLevel)) return 1;
      else return 0;
    }
    
    return 0;
  }, [character]);
  
  // Определение количества новых заговоров при повышении уровня
  const getNewCantripsCountOnLevelUp = useCallback(() => {
    if (!character) return 0;
    
    const characterClass = character.class || character.className;
    if (!characterClass) return 0;
    
    const currentLevel = character.level || 1;
    const newLevel = currentLevel + 1;
    
    // Для большинства классов заговоры добавляются на определенных уровнях
    if (["Волшебник", "Жрец", "Друид", "Бард", "Колдун", "Чернокнижник", "Чародей"].includes(characterClass)) {
      if ([4, 10].includes(newLevel)) return 1;
    }
    
    return 0;
  }, [character]);
  
  // Получение доступных заклинаний при повышении уровня
  const getAvailableSpells = useCallback(() => {
    if (!character) return [];
    
    const characterClass = character.class || character.className;
    if (!characterClass) return [];
    
    // Проверка, является ли класс заклинателем
    const magicClasses = ["Волшебник", "Жрец", "Друид", "Бард", "Колдун", "Чернокнижник", "Паладин", "Следопыт", "Чародей"];
    if (!magicClasses.includes(characterClass)) return [];
    
    const currentLevel = character.level || 1;
    const newLevel = currentLevel + 1;
    
    // Получаем максимальный уровень заклинаний
    let maxSpellLevel = 0;
    
    if (["Волшебник", "Жрец", "Друид", "Бард", "Чародей"].includes(characterClass)) {
      if (newLevel >= 17) maxSpellLevel = 9;
      else if (newLevel >= 15) maxSpellLevel = 8;
      else if (newLevel >= 13) maxSpellLevel = 7;
      else if (newLevel >= 11) maxSpellLevel = 6;
      else if (newLevel >= 9) maxSpellLevel = 5;
      else if (newLevel >= 7) maxSpellLevel = 4;
      else if (newLevel >= 5) maxSpellLevel = 3;
      else if (newLevel >= 3) maxSpellLevel = 2;
      else maxSpellLevel = 1;
    } else if (["Колдун", "Чернокнижник"].includes(characterClass)) {
      if (newLevel >= 17) maxSpellLevel = 5;
      else if (newLevel >= 13) maxSpellLevel = 4;
      else if (newLevel >= 9) maxSpellLevel = 3;
      else if (newLevel >= 5) maxSpellLevel = 2;
      else if (newLevel >= 2) maxSpellLevel = 1;
      else maxSpellLevel = 0;
    } else if (["Паладин", "Следопыт"].includes(characterClass)) {
      if (newLevel >= 17) maxSpellLevel = 5;
      else if (newLevel >= 13) maxSpellLevel = 4;
      else if (newLevel >= 9) maxSpellLevel = 3;
      else if (newLevel >= 5) maxSpellLevel = 2;
      else if (newLevel >= 2) maxSpellLevel = 1;
      else maxSpellLevel = 0;
    }
    
    // Получаем заклинания для класса
    const classSpells = getSpellsByClass(characterClass);
    
    // Исключаем уже известные заклинания
    const knownSpellsSet = new Set(character.spells || []);
    
    return classSpells.filter(spell => 
      spell && 
      (spell.level || 0) <= maxSpellLevel && 
      !knownSpellsSet.has(spell.name)
    );
  }, [character]);
  
  // Инициализация процесса повышения уровня
  const startLevelUp = useCallback(() => {
    if (!character) {
      toast({
        title: "Ошибка",
        description: "Персонаж не выбран",
        variant: "destructive"
      });
      return;
    }
    
    const currentLevel = character.level || 1;
    
    if (currentLevel >= 20) {
      toast({
        title: "Максимальный уровень",
        description: "Нельзя превысить 20 уровень",
        variant: "destructive"
      });
      return;
    }
    
    // Сбрасываем состояние
    setRollResult(null);
    setSelectedSpells([]);
    
    // Проверяем доступные заклинания
    const availableSpellsList = getAvailableSpells();
    const newSpellsCount = getNewSpellsCountOnLevelUp();
    const newCantripsCount = getNewCantripsCountOnLevelUp();
    
    setAvailableSpells(availableSpellsList);
    
    if ((newSpellsCount > 0 || newCantripsCount > 0) && availableSpellsList.length > 0) {
      setShowSpellSelection(true);
    } else {
      setShowSpellSelection(false);
      
      if (rollMode === "roll") {
        // Показываем диалог броска кубика
        setIsLevelingUp(true);
      } else {
        // Сразу повышаем уровень с средним значением
        const hitDieValue = getHitDieValue();
        const conModifier = character.abilities?.CON 
          ? getNumericModifier(character.abilities.CON)
          : 0;
        
        const hpIncrease = Math.floor(hitDieValue / 2) + 1 + conModifier;
        completeLevelUp(Math.max(1, hpIncrease));
      }
    }
  }, [character, getAvailableSpells, getHitDieValue, getNewCantripsCountOnLevelUp, getNewSpellsCountOnLevelUp, rollMode, toast]);
  
  // Завершение процесса повышения уровня
  const completeLevelUp = useCallback((hpGain: number) => {
    if (!character) return;
    
    const currentLevel = character.level || 1;
    const newLevel = currentLevel + 1;
    
    // Рассчитываем новые значения HP
    const newMaxHp = (character.maxHp || 0) + hpGain;
    
    // Обновляем персонажа
    const updates: any = {
      level: newLevel,
      maxHp: newMaxHp
    };
    
    // Если были выбраны новые заклинания, добавляем их
    if (selectedSpells.length > 0) {
      const updatedSpells = [...(character.spells || [])];
      selectedSpells.forEach(spell => {
        if (!updatedSpells.includes(spell.name)) {
          updatedSpells.push(spell.name);
        }
      });
      
      updates.spells = updatedSpells;
    }
    
    // Вызываем колбэк обновления максимального HP
    if (onMaxHpChange) {
      onMaxHpChange(newMaxHp, hpGain);
    }
    
    // Обновляем персонажа
    updateCharacter(updates);
    
    // Показываем уведомление
    toast({
      title: `Уровень повышен до ${newLevel}!`,
      description: `+${hpGain} HP${selectedSpells.length > 0 ? `, добавлено заклинаний: ${selectedSpells.length}` : ''}`,
    });
    
    // Сбрасываем состояние
    setIsLevelingUp(false);
    setShowSpellSelection(false);
    setSelectedSpells([]);
    setRollResult(null);
  }, [character, onMaxHpChange, selectedSpells, toast, updateCharacter]);
  
  // Обработка понижения уровня
  const handleLevelDown = useCallback(() => {
    if (!character) return;
    
    const currentLevel = character.level || 1;
    if (currentLevel <= 1) {
      toast({
        title: "Минимальный уровень",
        description: "Нельзя опуститься ниже 1 уровня",
        variant: "destructive"
      });
      return;
    }
    
    // Рассчитываем снижение максимального HP
    const conModifier = character.abilities?.CON 
      ? getNumericModifier(character.abilities.CON)
      : 0;
      
    const hitDieValue = getHitDieValue();
    const hpDecrease = Math.max(1, Math.floor(hitDieValue / 2) + 1 + conModifier);
    
    const newMaxHp = Math.max(1, (character.maxHp || 0) - hpDecrease);
    const newLevel = currentLevel - 1;
    
    // Обновляем персонажа
    updateCharacter({
      level: newLevel,
      maxHp: newMaxHp
    });
    
    // Вызываем колбэк обновления максимального HP
    if (onMaxHpChange) {
      onMaxHpChange(newMaxHp, -hpDecrease);
    }
    
    // Показываем уведомление
    toast({
      title: `Уровень понижен до ${newLevel}`,
      description: `-${hpDecrease} максимальных HP`,
      variant: "destructive"
    });
  }, [character, getHitDieValue, onMaxHpChange, toast, updateCharacter]);
  
  // Обработка броска кубика для HP
  const handleDiceRoll = useCallback((result: number) => {
    if (!character) return;
    
    setRollResult(result);
    
    const conModifier = character.abilities?.CON 
      ? getNumericModifier(character.abilities.CON) 
      : 0;
      
    const hpGain = Math.max(1, result + conModifier);
    
    // Если нужно выбрать заклинания
    if (showSpellSelection) {
      return; // Ждем выбора заклинаний
    }
    
    // Иначе сразу завершаем повышение уровня
    completeLevelUp(hpGain);
  }, [character, completeLevelUp, showSpellSelection]);
  
  // Обработка выбора заклинаний
  const handleSpellSelection = useCallback((selected: CharacterSpell[]) => {
    setSelectedSpells(selected);
    
    // Если у нас уже есть результат броска или используем среднее значение
    if (rollResult !== null || rollMode === "average") {
      let hpGain;
      
      if (rollResult !== null) {
        const conModifier = character.abilities?.CON 
          ? getNumericModifier(character.abilities.CON)
          : 0;
        hpGain = Math.max(1, rollResult + conModifier);
      } else {
        // Среднее значение
        const hitDieValue = getHitDieValue();
        const conModifier = character.abilities?.CON 
          ? getNumericModifier(character.abilities.CON)
          : 0;
        hpGain = Math.max(1, Math.floor(hitDieValue / 2) + 1 + conModifier);
      }
      
      completeLevelUp(hpGain);
    } else {
      // Показываем диалог броска кубика
      setIsLevelingUp(true);
    }
  }, [character?.abilities?.CON, completeLevelUp, getHitDieValue, rollMode, rollResult]);
  
  return {
    // Состояния
    isLevelingUp,
    showSpellSelection,
    availableSpells,
    selectedSpells,
    rollMode,
    rollResult,
    
    // Методы управления состоянием
    setSelectedSpells,
    setRollMode,
    setRollResult,
    
    // Основные методы работы с уровнем
    startLevelUp,
    handleLevelDown,
    handleDiceRoll,
    handleSpellSelection,
    
    // Вспомогательные методы
    getNewSpellsCountOnLevelUp,
    getNewCantripsCountOnLevelUp,
    getHitDieValue,
    getHitDieType
  };
}
