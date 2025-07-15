// Бонусы к характеристикам от рас согласно D&D 5e PHB

export interface AbilityBonus {
  strength?: number;
  dexterity?: number;
  constitution?: number;
  intelligence?: number;
  wisdom?: number;
  charisma?: number;
  all?: number; // Для людей
  custom?: string; // Для вариативных бонусов
}

export const raceAbilityBonuses: Record<string, AbilityBonus> = {
  // Основные расы PHB
  'Человек': { all: 1 },
  'Эльф': { dexterity: 2 },
  'Дварф': { constitution: 2 },
  'Полурослик': { dexterity: 2 },
  'Полуэльф': { charisma: 2, custom: 'Увеличьте две разные характеристики на 1' },
  'Полуорк': { strength: 2, constitution: 1 },
  'Гном': { intelligence: 2 },
  'Драконорожденный': { strength: 2, charisma: 1 },
  'Тифлинг': { intelligence: 1, charisma: 2 }
};

export const subraceAbilityBonuses: Record<string, AbilityBonus> = {
  // Подрасы эльфов
  'Высший эльф': { intelligence: 1 },
  'Лесной эльф': { wisdom: 1 },
  'Тёмный эльф (дроу)': { charisma: 1 },
  
  // Подрасы дварфов
  'Горный дварф': { strength: 2 },
  'Холмовой дварф': { wisdom: 1 },
  
  // Подрасы полуросликов
  'Коренастый полурослик': { constitution: 1 },
  'Легконогий полурослик': { charisma: 1 },
  
  // Подрасы гномов
  'Лесной гном': { dexterity: 1 },
  'Скалный гном': { constitution: 1 },
  
  // Варианты людей
  'Обычный человек': { all: 1 },
  'Вариант человека': { custom: 'Увеличьте две разные характеристики на 1' }
};

// Применить расовые бонусы к характеристикам
export const applyRacialBonuses = (
  baseAbilities: Record<string, number>,
  race: string,
  subrace?: string
): Record<string, number> => {
  const result = { ...baseAbilities };
  
  // Применяем бонусы основной расы
  const raceBonus = raceAbilityBonuses[race];
  if (raceBonus) {
    if (raceBonus.all) {
      // Человек: +1 ко всем характеристикам
      Object.keys(result).forEach(ability => {
        if (ability !== 'all' && ability !== 'custom') {
          result[ability] += raceBonus.all!;
        }
      });
    } else {
      // Остальные расы: конкретные бонусы
      Object.entries(raceBonus).forEach(([ability, bonus]) => {
        if (ability !== 'custom' && typeof bonus === 'number' && result[ability] !== undefined) {
          result[ability] += bonus;
        }
      });
    }
  }
  
  // Применяем бонусы подрасы
  if (subrace) {
    const subraceBonus = subraceAbilityBonuses[subrace];
    if (subraceBonus) {
      Object.entries(subraceBonus).forEach(([ability, bonus]) => {
        if (ability !== 'custom' && typeof bonus === 'number' && result[ability] !== undefined) {
          result[ability] += bonus;
        }
      });
    }
  }
  
  return result;
};

// Получить описание расовых бонусов
export const getRacialBonusDescription = (race: string, subrace?: string): string => {
  const descriptions: string[] = [];
  
  const raceBonus = raceAbilityBonuses[race];
  if (raceBonus) {
    if (raceBonus.all) {
      descriptions.push(`+${raceBonus.all} ко всем характеристикам`);
    } else {
      Object.entries(raceBonus).forEach(([ability, bonus]) => {
        if (ability !== 'custom' && typeof bonus === 'number') {
          const abilityName = getAbilityNameInRussian(ability);
          descriptions.push(`+${bonus} к ${abilityName}`);
        } else if (ability === 'custom' && typeof bonus === 'string') {
          descriptions.push(bonus);
        }
      });
    }
  }
  
  if (subrace) {
    const subraceBonus = subraceAbilityBonuses[subrace];
    if (subraceBonus) {
      Object.entries(subraceBonus).forEach(([ability, bonus]) => {
        if (ability !== 'custom' && typeof bonus === 'number') {
          const abilityName = getAbilityNameInRussian(ability);
          descriptions.push(`+${bonus} к ${abilityName} (${subrace})`);
        } else if (ability === 'custom' && typeof bonus === 'string') {
          descriptions.push(`${bonus} (${subrace})`);
        }
      });
    }
  }
  
  return descriptions.join(', ');
};

// Получить русское название характеристики
function getAbilityNameInRussian(ability: string): string {
  const names: Record<string, string> = {
    'strength': 'Силе',
    'dexterity': 'Ловкости',
    'constitution': 'Телосложению',
    'intelligence': 'Интеллекту',
    'wisdom': 'Мудрости',
    'charisma': 'Харизме'
  };
  
  return names[ability] || ability;
}