
import { useState, useEffect } from "react";
import { Character, AbilityScores, SpellSlots, Spell, SorceryPoints } from "@/contexts/CharacterContext";

export const useCharacterCreation = () => {
  const [character, setCharacterState] = useState({
    race: "",
    subrace: "",
    class: "",
    subclass: "",
    spells: [] as string[],
    equipment: [] as string[],
    languages: [] as string[],
    proficiencies: [] as string[],
    name: "",
    gender: "",
    alignment: "",
    stats: {
      strength: 8,
      dexterity: 8,
      constitution: 8,
      intelligence: 8,
      wisdom: 8,
      charisma: 8,
    },
    background: "",
    className: "",
    level: 1,
    abilities: {
      STR: 8,
      DEX: 8,
      CON: 8, 
      INT: 8,
      WIS: 8,
      CHA: 8
    } as AbilityScores,
    spellsKnown: [] as Spell[],
    spellSlots: {} as SpellSlots,
    maxHp: 0,
    currentHp: 0,
    sorceryPoints: { current: 0, max: 0 } as SorceryPoints
  });

  // Обновляем свойства персонажа при изменении статов
  useEffect(() => {
    if (character.stats) {
      const characterLevel = character.level || 1;
      
      // Обновляем характеристики
      const updatedCharacter = {
        ...character,
        abilities: {
          STR: character.stats.strength,
          DEX: character.stats.dexterity,
          CON: character.stats.constitution,
          INT: character.stats.intelligence,
          WIS: character.stats.wisdom,
          CHA: character.stats.charisma
        },
        // Устанавливаем имя класса на основе класса и подкласса
        className: `${character.class}${character.subclass ? ` (${character.subclass})` : ''}`,
        // Конвертируем имена заклинаний в объекты Spell
        spellsKnown: character.spells.map((name, index) => ({
          id: String(index),
          name: name,
          level: getSpellLevel(name)
        })),
        // Создаем ячейки заклинаний на основе класса и уровня
        spellSlots: calculateSpellSlots(character.class, characterLevel)
      };
      
      // Создаем очки чародея, если персонаж - чародей
      if (character.class === "Чародей") {
        updatedCharacter.sorceryPoints = {
          current: characterLevel,
          max: characterLevel
        };
      }
      
      // Рассчитываем максимальные HP на основе класса, уровня и телосложения
      if (character.class) {
        const conModifier = Math.floor((character.stats.constitution - 10) / 2);
        const hpByClass = getHitDieByClass(character.class);
        
        // Первый уровень - максимальное значение Hit Die + конституция
        let maxHp = hpByClass + conModifier;
        
        // Для каждого дополнительного уровня - среднее значение Hit Die + конституция
        if (characterLevel > 1) {
          const averageHitPoints = Math.floor((hpByClass + 1) / 2) + 1; // Среднее значение для кубика
          maxHp += (averageHitPoints + conModifier) * (characterLevel - 1);
        }
        
        updatedCharacter.maxHp = maxHp;
        updatedCharacter.currentHp = maxHp;
      }
      
      // Обновляем состояние персонажа
      setCharacterState(updatedCharacter);
    }
  }, [character.stats, character.class, character.subclass, character.spells, character.level]);

  // Получаем Hit Die для класса
  const getHitDieByClass = (characterClass: string): number => {
    const hitDice: Record<string, number> = {
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
    
    return hitDice[characterClass] || 8; // По умолчанию d8
  };

  // Рассчитываем ячейки заклинаний на основе класса и уровня
  const calculateSpellSlots = (className: string, level: number) => {
    if (!isMagicClass(className) || level < 1) return {};
    
    const slots: SpellSlots = {};
    // Полные заклинатели (Волшебник, Жрец, Друид, Бард, Чародей)
    if (["Волшебник", "Чародей", "Жрец", "Друид", "Бард"].includes(className)) {
      if (level >= 1) slots[1] = { max: Math.min(level + 1, 4), used: 0 };
      if (level >= 3) slots[2] = { max: Math.min(level - 1, 3), used: 0 };
      if (level >= 5) slots[3] = { max: Math.min(level - 3, 3), used: 0 };
      if (level >= 7) slots[4] = { max: Math.min(level - 6, 3), used: 0 };
      if (level >= 9) slots[5] = { max: Math.min(level - 8, 2), used: 0 };
      if (level >= 11) slots[6] = { max: 1, used: 0 };
      if (level >= 13) slots[7] = { max: 1, used: 0 };
      if (level >= 15) slots[8] = { max: 1, used: 0 };
      if (level >= 17) slots[9] = { max: 1, used: 0 };
    }
    // Полу-заклинатели (Паладин, Следопыт)
    else if (["Паладин", "Следопыт"].includes(className)) {
      // Полу-заклинатели используют половину своего уровня (округленную вверх) для расчета ячеек заклинаний
      const effectiveLevel = Math.ceil(level / 2);
      if (level >= 2) slots[1] = { max: Math.min(effectiveLevel + 1, 4), used: 0 };
      if (level >= 5) slots[2] = { max: Math.min(effectiveLevel - 1, 3), used: 0 };
      if (level >= 9) slots[3] = { max: Math.min(effectiveLevel - 3, 3), used: 0 };
      if (level >= 13) slots[4] = { max: Math.min(effectiveLevel - 6, 2), used: 0 };
      if (level >= 17) slots[5] = { max: Math.min(effectiveLevel - 8, 1), used: 0 };
    }
    // Чернокнижники имеют свою собственную прогрессию ячеек заклинаний
    else if (className === "Чернокнижник") {
      const slotLevel = Math.min(Math.ceil(level / 2), 5);
      const numSlots = level === 1 ? 1 : Math.min(Math.floor((level + 1) / 2) + 1, 4);
      slots[slotLevel] = { max: numSlots, used: 0 };
    }
    
    return slots;
  };

  // Определяем уровень заклинания (для реального приложения здесь был бы запрос к базе данных)
  const getSpellLevel = (spellName: string) => {
    // Это просто заглушка - в реальном приложении вы бы использовали базу данных заклинаний
    const knownSpells: Record<string, number> = {
      "Волшебная рука": 0,
      "Огненный снаряд": 0,
      "Свет": 0,
      "Малая иллюзия": 0,
      "Танцующие огоньки": 0,
      "Волшебный замок": 2,
      "Огненный шар": 3,
      "Щит": 1,
      "Мистический заряд": 0,
      "Лечение ран": 1,
      "Благословение": 1,
      "Чудотворство": 0,
      "Обнаружение магии": 1,
      "Маскировка": 1,
      "Понимание языков": 1,
      "Огненный Снаряд": 0,
      "Рука Магнуса": 0,
      "Ядовитое Облако": 3
    };
    
    return knownSpells[spellName] || 1; // По умолчанию предполагаем 1 уровень
  };

  // Обновление персонажа
  const updateCharacter = (updates: any) => {
    console.log("Обновление персонажа с данными:", updates);
    setCharacterState((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  // Определение, является ли класс заклинательным
  const isMagicClass = (className: string) => {
    const magicClasses = ['Волшебник', 'Чародей', 'Чернокнижник', 'Бард', 'Жрец', 'Друид', 'Паладин', 'Следопыт'];
    return magicClasses.includes(className);
  };

  // Получение модификатора характеристики
  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  return {
    character,
    updateCharacter,
    isMagicClass,
    getModifier
  };
};
