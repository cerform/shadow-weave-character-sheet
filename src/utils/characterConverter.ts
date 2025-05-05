import { CharacterSheet } from '@/types/character';
import { Character } from '@/contexts/CharacterContext';

/**
 * Преобразует объект CharacterSheet в объект Character для сохранения
 */
export const convertToCharacter = (sheet: CharacterSheet): Character => {
  // Расчет максимального HP на основе класса и уровня
  const calculateMaxHp = (): number => {
    // Базовое значение в зависимости от класса
    const baseHpByClass: {[key: string]: number} = {
      "Варвар": 12,
      "Воин": 10,
      "Паладин": 10,
      "Следопыт": 10,
      "Монах": 8,
      "Плут": 8,
      "Бард": 8,
      "Жрец": 8,
      "Друид": 8,
      "Волшебник": 6,
      "Чародей": 6,
      "Колдун": 8
    };
    
    // Убедимся, что у нас есть класс перед вычислением HP
    const characterClass = sheet.class || "Воин"; // По умолчанию "Воин", если класс не указан
    const baseHp = baseHpByClass[characterClass] || 8; // По умолчанию 8, если класс не найден
    const constitutionMod = Math.floor((sheet.abilities.constitution - 10) / 2);
    
    // HP первого уровня = максимум хитов кости + модификатор телосложения
    let maxHp = baseHp + constitutionMod;
    
    // Для каждого уровня выше первого добавляем среднее значение кости хитов + модификатор телосложения
    if (sheet.level > 1) {
      maxHp += ((baseHp / 2 + 1) + constitutionMod) * (sheet.level - 1);
    }
    
    return Math.round(maxHp);
  };
  
  // Вычисляем максимальные хиты
  const maxHp = sheet.maxHp || calculateMaxHp();
  
  // Преобразуем структуру заклинаний
  const spellsArray = sheet.spells || [];
  
  // Определяем слоты заклинаний в зависимости от класса и уровня
  const spellSlots: Record<number, { max: number; used: number }> = {};
  
  // Определяем класс персонажа, обеспечивая непустое значение
  const characterClass = sheet.class || "";
  
  // Заполняем слоты заклинаний для заклинателей
  if (["Бард", "Волшебник", "Жрец", "Друид", "Чародей", "Колдун"].includes(characterClass)) {
    // Упрощённая логика слотов заклинаний
    const level = sheet.level;
    
    if (level >= 1) spellSlots[1] = { max: Math.min(4, level), used: 0 };
    if (level >= 3) spellSlots[2] = { max: Math.min(3, level - 2), used: 0 };
    if (level >= 5) spellSlots[3] = { max: Math.min(3, level - 4), used: 0 };
    if (level >= 7) spellSlots[4] = { max: Math.min(3, level - 6), used: 0 };
    if (level >= 9) spellSlots[5] = { max: Math.min(2, level - 8), used: 0 };
    if (level >= 11) spellSlots[6] = { max: Math.min(1, level - 10), used: 0 };
    if (level >= 13) spellSlots[7] = { max: Math.min(1, level - 12), used: 0 };
    if (level >= 15) spellSlots[8] = { max: Math.min(1, level - 14), used: 0 };
    if (level >= 17) spellSlots[9] = { max: Math.min(1, level - 16), used: 0 };
  } 
  // Для полузаклинателей (паладины, следопыты)
  else if (["Паладин", "Следопыт"].includes(characterClass)) {
    const level = sheet.level;
    
    if (level >= 2) spellSlots[1] = { max: Math.min(3, level - 1), used: 0 };
    if (level >= 5) spellSlots[2] = { max: Math.min(2, level - 4), used: 0 };
    if (level >= 9) spellSlots[3] = { max: Math.min(2, level - 8), used: 0 };
    if (level >= 13) spellSlots[4] = { max: Math.min(1, level - 12), used: 0 };
    if (level >= 17) spellSlots[5] = { max: 1, used: 0 };
  }
  
  return {
    id: sheet.id || "",
    userId: sheet.userId,
    name: sheet.name || "Безымянный",
    race: sheet.race || "",
    // Используем свойство subrace как отдельное поле только если оно есть в Character
    ...(sheet.subrace && { subrace: sheet.subrace }),
    className: sheet.class || "",
    class: sheet.class || "",  // Важно! Устанавливаем значение для обязательного поля
    level: sheet.level || 1,
    abilities: {
      STR: characterSheet.abilities?.STR || characterSheet.abilities?.strength || 10,
      DEX: characterSheet.abilities?.DEX || characterSheet.abilities?.dexterity || 10,
      CON: characterSheet.abilities?.CON || characterSheet.abilities?.constitution || 10,
      INT: characterSheet.abilities?.INT || characterSheet.abilities?.intelligence || 10,
      WIS: characterSheet.abilities?.WIS || characterSheet.abilities?.wisdom || 10,
      CHA: characterSheet.abilities?.CHA || characterSheet.abilities?.charisma || 10,
      strength: characterSheet.abilities?.STR || characterSheet.abilities?.strength || 10,
      dexterity: characterSheet.abilities?.DEX || characterSheet.abilities?.dexterity || 10,
      constitution: characterSheet.abilities?.CON || characterSheet.abilities?.constitution || 10,
      intelligence: characterSheet.abilities?.INT || characterSheet.abilities?.intelligence || 10,
      wisdom: characterSheet.abilities?.WIS || characterSheet.abilities?.wisdom || 10,
      charisma: characterSheet.abilities?.CHA || characterSheet.abilities?.charisma || 10,
    },
    spells: spellsArray,
    spellSlots: spellSlots,
    gender: sheet.gender || "",
    alignment: sheet.alignment || "",
    background: sheet.background || "",
    equipment: sheet.equipment || [],
    languages: sheet.languages || [],
    proficiencies: sheet.proficiencies || [],
    maxHp: maxHp,
    currentHp: maxHp, // Устанавливаем текущие хиты равными максимальным
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
};

/**
 * Функция для получения модификатора из значения характеристики
 */
export const getModifierFromAbilityScore = (score: number): string => {
  const mod = Math.floor((score - 10) / 2);
  return mod >= 0 ? `+${mod}` : `${mod}`;
};
