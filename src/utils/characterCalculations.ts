
// Утилиты для расчета характеристик персонажа D&D 5e

export const calculateAbilityModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

export const formatModifier = (modifier: number): string => {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

export const calculateProficiencyBonusByLevel = (level: number): number => {
  return Math.ceil(level / 4) + 1;
};

export const calculateSavingThrow = (
  abilityScore: number, 
  proficiencyBonus: number, 
  isProficient: boolean
): number => {
  const modifier = calculateAbilityModifier(abilityScore);
  return isProficient ? modifier + proficiencyBonus : modifier;
};

export const calculateSkillBonus = (
  abilityScore: number,
  proficiencyBonus: number,
  isProficient: boolean,
  hasExpertise: boolean = false
): number => {
  const abilityModifier = calculateAbilityModifier(abilityScore);
  let bonus = abilityModifier;
  
  if (isProficient) {
    bonus += proficiencyBonus;
  }
  
  if (hasExpertise) {
    bonus += proficiencyBonus;
  }
  
  return bonus;
};

export const calculateInitiative = (dexterityScore: number): number => {
  return calculateAbilityModifier(dexterityScore);
};

export const calculatePassivePerception = (
  wisdomScore: number,
  proficiencyBonus: number,
  isPerceptionProficient: boolean
): number => {
  const perceptionBonus = calculateSkillBonus(
    wisdomScore, 
    proficiencyBonus, 
    isPerceptionProficient
  );
  return 10 + perceptionBonus;
};

export const calculatePassiveInvestigation = (
  intelligenceScore: number,
  proficiencyBonus: number,
  isInvestigationProficient: boolean
): number => {
  const investigationBonus = calculateSkillBonus(
    intelligenceScore, 
    proficiencyBonus, 
    isInvestigationProficient
  );
  return 10 + investigationBonus;
};

// Определения навыков D&D 5e с их связанными характеристиками
export const skillDefinitions = [
  { name: 'Акробатика', ability: 'dexterity', englishName: 'Acrobatics' },
  { name: 'Анализ', ability: 'intelligence', englishName: 'Investigation' },
  { name: 'Атлетика', ability: 'strength', englishName: 'Athletics' },
  { name: 'Восприятие', ability: 'wisdom', englishName: 'Perception' },
  { name: 'Выживание', ability: 'wisdom', englishName: 'Survival' },
  { name: 'Запугивание', ability: 'charisma', englishName: 'Intimidation' },
  { name: 'История', ability: 'intelligence', englishName: 'History' },
  { name: 'Ловкость рук', ability: 'dexterity', englishName: 'Sleight of Hand' },
  { name: 'Магия', ability: 'intelligence', englishName: 'Arcana' },
  { name: 'Медицина', ability: 'wisdom', englishName: 'Medicine' },
  { name: 'Обман', ability: 'charisma', englishName: 'Deception' },
  { name: 'Природа', ability: 'intelligence', englishName: 'Nature' },
  { name: 'Проницательность', ability: 'wisdom', englishName: 'Insight' },
  { name: 'Религия', ability: 'intelligence', englishName: 'Religion' },
  { name: 'Скрытность', ability: 'dexterity', englishName: 'Stealth' },
  { name: 'Убеждение', ability: 'charisma', englishName: 'Persuasion' },
  { name: 'Уход за животными', ability: 'wisdom', englishName: 'Animal Handling' },
  { name: 'Выступление', ability: 'charisma', englishName: 'Performance' }
] as const;

export type SkillName = typeof skillDefinitions[number]['name'];
export type AbilityName = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';
