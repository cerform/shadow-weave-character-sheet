
import { Character } from '@/types/character';

/**
 * Рассчитывает модификатор характеристики из значения
 */
export const getAbilityModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

/**
 * Возвращает строковое представление модификатора характеристики (с плюсом или минусом)
 */
export const getAbilityModifierString = (score: number): string => {
  const modifier = getAbilityModifier(score);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

/**
 * Проверяет, является ли навык с экспертизой
 */
export const isExpertiseSkill = (character: Character, skillName: string): boolean => {
  return character.expertise ? character.expertise.includes(skillName) : false;
};

/**
 * Получает бонус навыка для персонажа
 */
export const getSkillBonus = (character: Character, skillName: string): number => {
  // Базовый модификатор характеристики
  const abilityType = getAbilityForSkill(skillName);
  const abilityScore = character.abilities?.[abilityType] || 10;
  const abilityMod = getAbilityModifier(abilityScore);
  
  // Проверяем владение
  const isProficient = character.skills?.[skillName] === true;
  
  // Проверяем экспертизу
  const isExpertise = isExpertiseSkill(character, skillName);
  
  // Дополнительные бонусы
  const additionalBonus = character.skillBonuses?.[skillName] || 0;
  
  // Расчет итогового бонуса
  let totalBonus = abilityMod + additionalBonus;
  
  if (isProficient) {
    totalBonus += character.proficiencyBonus || 2;
  }
  
  if (isExpertise) {
    totalBonus += character.proficiencyBonus || 2;
  }
  
  return totalBonus;
};

/**
 * Определяет, какая характеристика связана с навыком
 */
export const getAbilityForSkill = (skillName: string): string => {
  const skillMap: Record<string, string> = {
    // Сила
    'athletics': 'strength',
    'атлетика': 'strength',
    
    // Ловкость
    'acrobatics': 'dexterity',
    'sleight_of_hand': 'dexterity',
    'stealth': 'dexterity',
    'акробатика': 'dexterity',
    'ловкость_рук': 'dexterity',
    'скрытность': 'dexterity',
    
    // Интеллект
    'arcana': 'intelligence',
    'history': 'intelligence',
    'investigation': 'intelligence',
    'nature': 'intelligence',
    'religion': 'intelligence',
    'магия': 'intelligence',
    'история': 'intelligence',
    'расследование': 'intelligence',
    'природа': 'intelligence',
    'религия': 'intelligence',
    
    // Мудрость
    'animal_handling': 'wisdom',
    'insight': 'wisdom',
    'medicine': 'wisdom',
    'perception': 'wisdom',
    'survival': 'wisdom',
    'уход_за_животными': 'wisdom',
    'проницательность': 'wisdom',
    'медицина': 'wisdom',
    'внимательность': 'wisdom',
    'выживание': 'wisdom',
    
    // Харизма
    'deception': 'charisma',
    'intimidation': 'charisma',
    'performance': 'charisma',
    'persuasion': 'charisma',
    'обман': 'charisma',
    'запугивание': 'charisma',
    'выступление': 'charisma',
    'убеждение': 'charisma'
  };
  
  return skillMap[skillName] || 'dexterity';
};

/**
 * Получает список всех навыков сгруппированных по характеристикам
 */
export const getSkillsByAbility = (): Record<string, string[]> => {
  return {
    strength: ['athletics'],
    dexterity: ['acrobatics', 'sleight_of_hand', 'stealth'],
    intelligence: ['arcana', 'history', 'investigation', 'nature', 'religion'],
    wisdom: ['animal_handling', 'insight', 'medicine', 'perception', 'survival'],
    charisma: ['deception', 'intimidation', 'performance', 'persuasion']
  };
};
