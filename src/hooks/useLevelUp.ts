import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { getSpellsByClass, getSpellsByLevel } from '@/data/spells';
import { CharacterSpell } from '@/types/character';
import { calculateAvailableSpellsByClassAndLevel } from '@/utils/spellProcessors';

// Вспомогательные функции для логики повышения уровня
const getHitDieValue = (characterClass: string): number => {
  const hitDiceValues: Record<string, number> = {
    "Варвар": 12,
    "Воин": 10,
    "Паладин": 10,
    "Следопыт": 10,
    "Жрец": 8,
    "Друид": 8,
    "Монах": 8,
    "Плут": 8,
    "Бард": 8,
    "Колдун": 8,
    "Чернокнижник": 8,
    "Волшебник": 6,
    "Чародей": 6
  };
  
  return hitDiceValues[characterClass] || 8; // По умолчанию d8
};

// Получение доступных для изучения заклинаний при повышении уровня
const getAvailableSpellsOnLevelUp = (character: any): CharacterSpell[] => {
  if (!character) return [];
  
  const characterClass = character.class || character.className;
  if (!characterClass) return [];
  
  // Проверяем, является ли класс заклинателем
  const magicClasses = ["Волшебник", "Жрец", "Друид", "Бард", "Колдун", "Чернокнижник", "Паладин", "Следопыт", "Чародей"];
  if (!magicClasses.includes(characterClass)) return [];
  
  const currentLevel = character.level || 1;
  const newLevel = currentLevel + 1;
  
  // Получаем доступные уровни заклинаний
  let maxSpellLevel = 0;
  
  // Определяем максимальный уровень заклинаний в зависимости от класса и уровня персонажа
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
    if (newLevel >= 17) maxSpellLevel = 9;
    else if (newLevel >= 15) maxSpellLevel = 8;
    else if (newLevel >= 13) maxSpellLevel = 7;
    else if (newLevel >= 11) maxSpellLevel = 6;
    else if (newLevel >= 9) maxSpellLevel = 5;
    else if (newLevel >= 7) maxSpellLevel = 4;
    else if (newLevel >= 5) maxSpellLevel = 3;
    else if (newLevel >= 3) maxSpellLevel = 2;
    else maxSpellLevel = 1;
  } else if (["Паладин", "Следопыт"].includes(characterClass)) {
    if (newLevel >= 17) maxSpellLevel = 5;
    else if (newLevel >= 13) maxSpellLevel = 4;
    else if (newLevel >= 9) maxSpellLevel = 3;
    else if (newLevel >= 5) maxSpellLevel = 2;
    else if (newLevel >= 2) maxSpellLevel = 1;
    else maxSpellLevel = 0;
  }
  
  // Получаем заклинания для класса персонажа
  const classSpells = getSpellsByClass(characterClass);
  
  // Создаем множество уже известных заклинаний
  const knownSpellsSet = new Set(character.spells || []);
  
  // Фильтруем по доступным уровням и исключаем уже известные заклинания
  return classSpells.filter(spell => 
    spell && 
    (spell.level || 0) <= maxSpellLevel && 
    !knownSpellsSet.has(spell.name)
  );
};

// Определение количества новых заклинаний при повышении уровня
const getNewSpellsCountOnLevelUp = (character: any): number => {
  if (!character) return 0;
  
  const characterClass = character.class || character.className;
  const currentLevel = character.level || 1;
  const newLevel = currentLevel + 1;
  
  // Используем функцию-калькулятор из spellProcessors
  const currentSpells = calculateAvailableSpellsByClassAndLevel(characterClass, currentLevel);
  
  const newLevelSpells = calculateAvailableSpellsByClassAndLevel(characterClass, newLevel);
  
  // Определяем количество доступных заклинаний на основе результатов функции
  // Проверяем, есть ли свойство known (для классов со списком известных заклинаний)
  // или prepared (для классов, подготавливающих заклинания)
  const currentSpellsCount = currentSpells.known || currentSpells.prepared || 0;
  const newSpellsCount = newLevelSpells.known || newLevelSpells.prepared || 0;
  
  // Возвращаем разницу между новым и текущим количеством заклинаний
  return Math.max(0, newSpellsCount - currentSpellsCount);
};

// Определение количества новых заговоров при повышении уровня
const getNewCantripsCountOnLevelUp = (character: any): number => {
  if (!character) return 0;
  
  const characterClass = character.class || character.className;
  const currentLevel = character.level || 1;
  const newLevel = currentLevel + 1;
  
  // Используем функцию-калькулятор из spellProcessors
  const currentSpells = calculateAvailableSpellsByClassAndLevel(characterClass, currentLevel);
  
  const newLevelSpells = calculateAvailableSpellsByClassAndLevel(characterClass, newLevel);
  
  // Возвращаем разницу между новым и текущим количеством заговоров
  return Math.max(0, newLevelSpells.cantrips - currentSpells.cantrips);
};

// Основной хук для управления повышением уровня
export const useLevelUp = (character: any, updateCharacter: (updates: any) => void) => {
  const [isLevelingUp, setIsLevelingUp] = useState(false);
  const [selectedSpells, setSelectedSpells] = useState<CharacterSpell[]>([]);
  const [availableSpells, setAvailableSpells] = useState<CharacterSpell[]>([]);
  const [showSpellSelection, setShowSpellSelection] = useState(false);
  const [rollMode, setRollMode] = useState<"roll" | "average">("average");
  const [rollResult, setRollResult] = useState<number | null>(null);
  const { toast } = useToast();
  
  // Инициализация процесса повышения уровня
  const startLevelUp = () => {
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
    
    // Проверяем, нужно ли выбирать новые заклинания
    const availableSpellsList = getAvailableSpellsOnLevelUp(character);
    const newSpellsCount = getNewSpellsCountOnLevelUp(character);
    const newCantripsCount = getNewCantripsCountOnLevelUp(character);
    
    setAvailableSpells(availableSpellsList);
    
    if ((newSpellsCount > 0 || newCantripsCount > 0) && availableSpellsList.length > 0) {
      setShowSpellSelection(true);
    } else {
      setShowSpellSelection(false);
      
      // Если нет выбора заклинаний, сразу запускаем повышение
      if (rollMode === "roll") {
        // Если выбран режим броска, показываем диалог с броском
        setIsLevelingUp(true);
      } else {
        // Если выбрано среднее значение, сразу повышаем уровень
        completeLevelUp();
      }
    }
  };
  
  // Завершение процесса повышения уровня
  const completeLevelUp = () => {
    if (!character) return;
    
    const currentLevel = character.level || 1;
    const newLevel = currentLevel + 1;
    const characterClass = character.class || character.className;
    
    // Рассчитываем бонус от Телосложения
    const conModifier = character.abilities?.CON 
      ? Math.floor((character.abilities.CON - 10) / 2) 
      : 0;
    
    // Получаем значение кубика хитов для класса
    const hitDieValue = getHitDieValue(characterClass);
    
    // Определяем прирост HP
    let hpIncrease;
    
    if (rollResult !== null) {
      // Если есть результат броска, используем его
      hpIncrease = rollResult + conModifier;
    } else {
      // Иначе используем среднее значение
      hpIncrease = Math.floor(hitDieValue / 2) + 1 + conModifier;
    }
    
    // Гарантируем минимальный прирост в 1 HP
    const hpGain = Math.max(1, hpIncrease);
    
    // Рассчитываем новые значения HP
    const newMaxHp = (character.maxHp || 0) + hpGain;
    const newCurrentHp = Math.min(newMaxHp, (character.currentHp || 0) + hpGain);
    
    // Обновляем персонажа
    const updates: any = {
      level: newLevel,
      maxHp: newMaxHp,
      currentHp: newCurrentHp
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
    
    // Обновляем персонажа
    updateCharacter(updates);
    
    // Выводим сообщение об успешном повышении уровня
    toast({
      title: `Уровень повышен до ${newLevel}!`,
      description: `+${hpGain} HP${selectedSpells.length > 0 ? `, добавлено заклинаний: ${selectedSpells.length}` : ''}`,
    });
    
    // Сбрасываем состояние
    setIsLevelingUp(false);
    setShowSpellSelection(false);
    setSelectedSpells([]);
    setRollResult(null);
  };
  
  // Обработка броска кубика для HP
  const handleDiceRoll = (result: number) => {
    setRollResult(result);
    
    // Если нужно выбирать заклинания, показываем этот шаг
    if (showSpellSelection) {
      return;
    }
    
    // Иначе завершаем повышение уровня
    completeLevelUp();
  };
  
  // Обработка выбора заклинаний
  const handleSpellSelection = (selectedSpells: CharacterSpell[]) => {
    setSelectedSpells(selectedSpells);
    
    // Если нужен бросок кубика, и он еще не сделан, ждем его
    if (rollMode === "roll" && rollResult === null) {
      setIsLevelingUp(true);
    } else {
      // Иначе завершаем повышение уровня
      completeLevelUp();
    }
  };
  
  return {
    isLevelingUp,
    showSpellSelection,
    availableSpells,
    selectedSpells,
    setSelectedSpells,
    rollMode,
    setRollMode,
    rollResult,
    startLevelUp,
    handleDiceRoll,
    handleSpellSelection,
    getNewSpellsCountOnLevelUp: () => getNewSpellsCountOnLevelUp(character),
    getNewCantripsCountOnLevelUp: () => getNewCantripsCountOnLevelUp(character),
    getHitDieValue: () => getHitDieValue(character?.class || character?.className || '')
  };
};
