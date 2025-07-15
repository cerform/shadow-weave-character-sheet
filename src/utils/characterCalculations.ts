
// Утилиты для расчета характеристик персонажа D&D 5e согласно официальным правилам

export const calculateAbilityModifier = (score: number): number => {
  return Math.floor((score - 10) / 2);
};

export const formatModifier = (modifier: number): string => {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

// Бонус мастерства по уровню согласно D&D 5e
export const calculateProficiencyBonusByLevel = (level: number): number => {
  if (level >= 17) return 6;
  if (level >= 13) return 5;
  if (level >= 9) return 4;
  if (level >= 5) return 3;
  return 2;
};

export const calculateSavingThrow = (
  abilityScore: number, 
  proficiencyBonus: number, 
  isProficient: boolean
): number => {
  const modifier = calculateAbilityModifier(abilityScore);
  return isProficient ? modifier + proficiencyBonus : modifier;
};

// Расчет максимальных хитов по классу согласно D&D 5e
export const calculateHitPointsByClass = (
  characterClass: string,
  level: number,
  constitutionModifier: number
): number => {
  const hitDice: Record<string, number> = {
    'Волшебник': 6,
    'Колдун': 6,
    'Бард': 8,
    'Жрец': 8,
    'Друид': 8,
    'Монах': 8,
    'Плут': 8,
    'Чародей': 6,
    'Воин': 10,
    'Паладин': 10,
    'Следопыт': 10,
    'Варвар': 12,
    'Изобретатель': 8
  };
  
  const hitDie = hitDice[characterClass] || 8;
  
  // На 1 уровне: максимум кости + модификатор телосложения
  // На каждом следующем уровне: среднее значение кости + модификатор телосложения
  let maxHp = hitDie + constitutionModifier;
  
  for (let i = 2; i <= level; i++) {
    const averageRoll = Math.floor(hitDie / 2) + 1;
    maxHp += Math.max(1, averageRoll + constitutionModifier);
  }
  
  return Math.max(1, maxHp);
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

// Определения навыков D&D 5e с их связанными характеристиками согласно PHB
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

// Получение владений навыками по классу согласно D&D 5e
export const getClassSkillProficiencies = (characterClass: string): string[] => {
  const classSkills: Record<string, string[]> = {
    'Варвар': ['Анализ', 'Атлетика', 'Запугивание', 'Природа', 'Восприятие', 'Выживание'],
    'Бард': [], // Любые 3 навыка
    'Жрец': ['История', 'Проницательность', 'Медицина', 'Убеждение', 'Религия'],
    'Друид': ['Магия', 'Анализ', 'Медицина', 'Природа', 'Восприятие', 'Религия', 'Выживание', 'Уход за животными'],
    'Воин': ['Акробатика', 'Анализ', 'Атлетика', 'История', 'Проницательность', 'Запугивание', 'Восприятие', 'Выживание'],
    'Монах': ['Акробатика', 'Атлетика', 'История', 'Проницательность', 'Религия', 'Скрытность'],
    'Паладин': ['Атлетика', 'Проницательность', 'Запугивание', 'Медицина', 'Убеждение', 'Религия'],
    'Следопыт': ['Анализ', 'Проницательность', 'Природа', 'Восприятие', 'Скрытность', 'Выживание', 'Уход за животными'],
    'Плут': ['Акробатика', 'Атлетика', 'Обман', 'Проницательность', 'Запугивание', 'Анализ', 'Восприятие', 'Выступление', 'Убеждение', 'Ловкость рук', 'Скрытность'],
    'Чародей': ['Магия', 'Обман', 'Проницательность', 'Запугивание', 'Убеждение', 'Религия'],
    'Колдун': ['Магия', 'Обман', 'История', 'Запугивание', 'Анализ', 'Природа', 'Религия'],
    'Волшебник': ['Магия', 'История', 'Проницательность', 'Анализ', 'Медицина', 'Религия']
  };
  
  return classSkills[characterClass] || [];
};

// Получение количества навыков для выбора по классу
export const getClassSkillCount = (characterClass: string): number => {
  const skillCounts: Record<string, number> = {
    'Варвар': 2,
    'Бард': 3,
    'Жрец': 2,
    'Друид': 2,
    'Воин': 2,
    'Монах': 2,
    'Паладин': 2,
    'Следопыт': 3,
    'Плут': 4,
    'Чародей': 2,
    'Колдун': 2,
    'Волшебник': 2
  };
  
  return skillCounts[characterClass] || 2;
};

// Получение спасбросков класса
export const getClassSavingThrows = (characterClass: string): string[] => {
  const classSaves: Record<string, string[]> = {
    'Варвар': ['strength', 'constitution'],
    'Бард': ['dexterity', 'charisma'],
    'Жрец': ['wisdom', 'charisma'],
    'Друид': ['intelligence', 'wisdom'],
    'Воин': ['strength', 'constitution'],
    'Монах': ['strength', 'dexterity'],
    'Паладин': ['wisdom', 'charisma'],
    'Следопыт': ['strength', 'dexterity'],
    'Плут': ['dexterity', 'intelligence'],
    'Чародей': ['constitution', 'charisma'],
    'Колдун': ['wisdom', 'charisma'],
    'Волшебник': ['intelligence', 'wisdom']
  };
  
  return classSaves[characterClass] || [];
};

export type SkillName = typeof skillDefinitions[number]['name'];
export type AbilityName = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma';
