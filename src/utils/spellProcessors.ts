// Исправляем спеллы для всех классов, добавляя недостающее свойство known
export const calculateAvailableSpellsByClassAndLevel = (className: string, level: number) => {
  return getSpellSlotsByClass(className, level);
};

export const getSpellSlotsByClass = (className: string, level: number) => {
  switch(className.toLowerCase()) {
    case 'бард':
    case 'bard':
      return {
        cantrips: 2 + (level >= 4 ? 1 : 0) + (level >= 10 ? 1 : 0),
        known: Math.min(
          4 + Math.ceil((level - 1) * (level < 11 ? 1 : 0.5)), 
          22
        ),
        prepared: 0 // Барды не готовят заклинания
      };
    case 'жрец':
    case 'cleric':
      return { 
        cantrips: Math.min(3 + Math.floor((level - 1) / 6), 5),
        known: 0, // Жрецы знают все заклинания из своего списка
        prepared: level + Math.max(1, getAbilityModifier('wisdom', 10)) // Примерное значение
      };
    case 'друид':
    case 'druid':
      return { 
        cantrips: Math.min(2 + Math.floor((level - 1) / 4), 4),
        known: 0, // Друиды знают все заклинания из своего списка
        prepared: level + Math.max(1, getAbilityModifier('wisdom', 10)) // Примерное значение
      };
    case 'паладин':
    case 'paladin':
      return { 
        cantrips: 0, // Паладины не имеют заговоров
        known: 0, // Паладины знают все заклинания из своего списка
        prepared: Math.floor(level / 2) + Math.max(1, getAbilityModifier('charisma', 10)) // Примерное значение
      };
    case 'рейнджер':
    case 'ranger':
      return { 
        cantrips: 0, // Рейнджеры не имеют заговоров
        known: Math.ceil(level / 2) + 1,
        prepared: 0 // Рейнджеры не готовят заклинания
      };
    case 'чародей':
    case 'sorcerer':
      return { 
        cantrips: Math.min(4 + Math.floor((level - 1) / 6), 6),
        known: Math.min(
          2 + Math.ceil((level - 1) * (level < 11 ? 1 : 0.5)), 
          15
        ),
        prepared: 0 // Чародеи не готовят заклинания
      };
    case 'колдун':
    case 'warlock':
      return { 
        cantrips: Math.min(2 + Math.floor((level - 1) / 6), 4),
        known: Math.min(
          2 + Math.ceil((level - 1) * (level < 10 ? 1 : 0.5)), 
          15
        ),
        prepared: 0 // Колдуны не готовят заклинания
      };
    case 'волшебник':
    case 'wizard':
      return { 
        cantrips: Math.min(3 + Math.floor((level - 1) / 6), 5),
        known: 6 + (level * 2), // Примерное количество в книге заклинаний
        prepared: level + Math.max(1, getAbilityModifier('intelligence', 10)) // Примерное значение
      };
    default:
      return { 
        cantrips: 0, 
        known: 0,
        prepared: 0 
      };
  }
};

export const parseComponents = (componentsString: string) => {
  const components = {
    verbal: false,
    somatic: false,
    material: false,
    ritual: false,
  };

  if (componentsString.includes('В')) {
    components.verbal = true;
  }
  if (componentsString.includes('С')) {
    components.somatic = true;
  }
  if (componentsString.includes('М')) {
    components.material = true;
  }
  if (componentsString.includes('(Р)')) {
    components.ritual = true;
  }

  return components;
};

export const processSpellBatch = (rawText: string) => {
  const lines = rawText.split('\n');
  const batchItems = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const parts = line.split(';');
    if (parts.length < 3) continue;

    const name = parts[0].trim();
    const level = parseInt(parts[1].trim(), 10);
    const componentsString = parts[2].trim();

    if (isNaN(level)) continue;

    const components = parseComponents(componentsString);

    batchItems.push({
      name,
      level,
      components,
    });
  }

  return batchItems;
};

// Вспомогательная функция для расчета модификатора характеристики
function getAbilityModifier(ability: string, score: number): number {
  return Math.floor((score - 10) / 2);
}
