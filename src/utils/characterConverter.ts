
import { CharacterSheet, Character, CharacterSpell } from '@/types/character';

export const convertToCharacter = (sheet: CharacterSheet): Character => {
  // Создаем базовую структуру персонажа
  const character: Character = {
    id: sheet.id,
    userId: sheet.userId,
    name: sheet.name || "",
    race: sheet.race || "",
    subrace: sheet.subrace,
    class: sheet.class || "",
    subclass: sheet.subclass,
    level: sheet.level || 1,
    background: sheet.background || "",
    alignment: sheet.alignment || "",
    gender: sheet.gender || "",
    backstory: sheet.backstory || "",
    appearance: sheet.appearance,
    personalityTraits: sheet.personalityTraits,
    ideals: sheet.ideals,
    bonds: sheet.bonds,
    flaws: sheet.flaws,
    
    // Конвертируем abilities
    abilities: {
      STR: sheet.abilities?.STR || sheet.abilities?.strength || 10,
      DEX: sheet.abilities?.DEX || sheet.abilities?.dexterity || 10,
      CON: sheet.abilities?.CON || sheet.abilities?.constitution || 10,
      INT: sheet.abilities?.INT || sheet.abilities?.intelligence || 10,
      WIS: sheet.abilities?.WIS || sheet.abilities?.wisdom || 10,
      CHA: sheet.abilities?.CHA || sheet.abilities?.charisma || 10,
      strength: sheet.abilities?.strength || sheet.abilities?.STR || 10,
      dexterity: sheet.abilities?.dexterity || sheet.abilities?.DEX || 10,
      constitution: sheet.abilities?.constitution || sheet.abilities?.CON || 10,
      intelligence: sheet.abilities?.intelligence || sheet.abilities?.INT || 10,
      wisdom: sheet.abilities?.wisdom || sheet.abilities?.WIS || 10,
      charisma: sheet.abilities?.charisma || sheet.abilities?.CHA || 10
    },
    
    // Конвертируем базовые массивы
    languages: sheet.languages || sheet.proficiencies?.languages || [],
    
    // Обрабатываем навыки
    skillProficiencies: convertSkillsToSkillProficiencies(sheet.skills),
    
    // Обрабатываем спасброски
    savingThrowProficiencies: sheet.savingThrows,
    
    // Обрабатываем боевые характеристики
    maxHp: sheet.maxHp,
    currentHp: sheet.currentHp,
    temporaryHp: sheet.temporaryHp,
    hitDice: sheet.hitDice,
    deathSaves: sheet.deathSaves,
    
    // Обрабатываем заклинания
    spellSlots: sheet.spellSlots,
    sorceryPoints: sheet.sorceryPoints,
    
    // Временные поля для совместимости
    createdAt: sheet.createdAt,
    updatedAt: sheet.updatedAt,
    
    // Преобразуем спеллы CharacterSpell[] в массив строк для совместимости с Character
    spells: convertSpellsToStringArray(sheet.spells),
    
    // Конвертируем equipment в строковый массив
    equipment: sheet.equipment || [],
    
    // Конвертируем proficiencies в строковый массив
    proficiencies: convertProficienciesToStringArray(sheet.proficiencies),
    
    // Дополнительные поля для совместимости
    image: sheet.img
  };
  
  return character;
};

// Вспомогательная функция для конвертации объекта skills в объект skillProficiencies
const convertSkillsToSkillProficiencies = (skills?: {[key: string]: {proficient: boolean; expertise: boolean; bonus?: number}}): {[skillName: string]: boolean} | undefined => {
  if (!skills) return undefined;
  
  const skillProficiencies: {[skillName: string]: boolean} = {};
  
  for (const [skill, details] of Object.entries(skills)) {
    skillProficiencies[skill] = !!details.proficient;
  }
  
  return skillProficiencies;
};

// Вспомогательная функция для преобразования объектов CharacterSpell в строки
const convertSpellsToStringArray = (spells?: CharacterSpell[]): string[] => {
  if (!spells) return [];
  
  // Для совместимости с Character.spells, преобразуем каждое заклинание в строку по имени
  return spells.map(spell => spell.name);
};

// Вспомогательная функция для объединения proficiencies в массив строк
const convertProficienciesToStringArray = (proficiencies?: {
  armor?: string[];
  weapons?: string[];
  tools?: string[];
  languages?: string[];
}): string[] => {
  if (!proficiencies) return [];
  
  const allProficiencies: string[] = [];
  
  // Добавляем все доступные профициенции в общий массив
  if (proficiencies.armor) allProficiencies.push(...proficiencies.armor);
  if (proficiencies.weapons) allProficiencies.push(...proficiencies.weapons);
  if (proficiencies.tools) allProficiencies.push(...proficiencies.tools);
  
  return allProficiencies;
};

export default {
  convertToCharacter
};
