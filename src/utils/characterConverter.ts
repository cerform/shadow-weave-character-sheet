import { CharacterSheet } from '@/types/character';
import { Character } from '@/types/character.d';

/**
 * Преобразует объект CharacterSheet в объект Character для сохранения
 */
export const convertToCharacter = (data: any): Character => {
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
    const characterClass = data.class || "Воин"; // По умолчанию "Воин", если класс не указан
    const baseHp = baseHpByClass[characterClass] || 8; // По умолчанию 8, если класс не найден
    const constitutionMod = Math.floor((data.abilities.constitution - 10) / 2);
    
    // HP первого уровня = максимум хитов кости + модификатор телосложения
    let maxHp = baseHp + constitutionMod;
    
    // Для каждого уровня выше первого добавляем среднее значение кости хитов + модификатор телосложения
    if (data.level > 1) {
      maxHp += ((baseHp / 2 + 1) + constitutionMod) * (data.level - 1);
    }
    
    return Math.round(maxHp);
  };
  
  // Вычисляем максимальные хиты
  const maxHp = data.maxHp || calculateMaxHp();
  
  // Преобразуем структуру заклинаний
  const spellsArray = data.spells || [];
  
  // Определяем слоты заклинаний в зависимости от класса и уровня
  const spellSlots: Record<number, { max: number; used: number }> = {};
  
  // Определяем класс персонажа, обеспечивая непустое значение
  const characterClass = data.class || "";
  
  // Заполняем слоты заклинаний для заклинателей
  if (["Бард", "Волшебник", "Жрец", "Друид", "Чародей", "Колдун"].includes(characterClass)) {
    // Упрощённая логика слотов заклинаний
    const level = data.level;
    
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
    const level = data.level;
    
    if (level >= 2) spellSlots[1] = { max: Math.min(3, level - 1), used: 0 };
    if (level >= 5) spellSlots[2] = { max: Math.min(2, level - 4), used: 0 };
    if (level >= 9) spellSlots[3] = { max: Math.min(2, level - 8), used: 0 };
    if (level >= 13) spellSlots[4] = { max: Math.min(1, level - 12), used: 0 };
    if (level >= 17) spellSlots[5] = { max: 1, used: 0 };
  }
  
  return {
    id: data.id || "",
    userId: data.userId,
    name: data.name || "Безымянный",
    race: data.race || 'Человек',
    ...(data.subrace && { subrace: data.subrace }),
    className: data.class || "",
    class: data.class || "",  // Важно! Устанавливаем значение для обязательного поля
    level: data.level || 1,
    abilities: {
      STR: data.abilities?.strength || 10,
      DEX: data.abilities?.dexterity || 10,
      CON: data.abilities?.constitution || 10,
      INT: data.abilities?.intelligence || 10,
      WIS: data.abilities?.wisdom || 10,
      CHA: data.abilities?.charisma || 10,
      strength: data.abilities?.strength || 10,
      dexterity: data.abilities?.dexterity || 10,
      constitution: data.abilities?.constitution || 10,
      intelligence: data.abilities?.intelligence || 10,
      wisdom: data.abilities?.wisdom || 10,
      charisma: data.abilities?.charisma || 10,
    },
    spells: spellsArray,
    spellSlots: spellSlots,
    gender: data.gender || "",
    alignment: data.alignment || "",
    background: data.background || "",
    equipment: data.equipment || [],
    languages: data.languages || [],
    proficiencies: data.proficiencies?.languages || [],
    maxHp: maxHp,
    currentHp: maxHp, // Устанавливаем текущие хиты равными максимальным
    inspiration: data.inspiration || false, // Добавляем свойство inspiration
    backstory: data.backstory || '', // Add the missing property
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
