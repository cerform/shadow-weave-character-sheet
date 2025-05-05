
/**
 * Parse spell components from the code string
 * Component codes:
 * В - Verbal
 * С - Somatic
 * М - Material
 * Р - Ritual
 * К - Concentration
 */
export const parseComponents = (componentCode: string): {
  verbal: boolean;
  somatic: boolean;
  material: boolean;
  ritual: boolean;
  concentration: boolean;
} => {
  return {
    verbal: componentCode.includes('В') || componentCode.includes('V'),
    somatic: componentCode.includes('С') || componentCode.includes('S'),
    material: componentCode.includes('М') || componentCode.includes('M'),
    ritual: componentCode.includes('Р') || componentCode.includes('R'),
    concentration: componentCode.includes('К') || componentCode.includes('K')
  };
};

/**
 * Build component string from boolean flags
 */
export const buildComponentString = (components: {
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  ritual?: boolean;
  concentration?: boolean;
}): string => {
  let result = '';
  if (components.verbal) result += 'В';
  if (components.somatic) result += 'С';
  if (components.material) result += 'М';
  if (components.ritual) result += 'Р';
  if (components.concentration) result += 'К';
  return result || '';
};

/**
 * Получает строку с описанием компонентов заклинания на основе флагов
 */
export const getComponentsDescription = (components: {
  verbal?: boolean;
  somatic?: boolean;
  material?: boolean;
  materialComponents?: string;
}): string => {
  const parts = [];
  
  if (components.verbal) parts.push('В');
  if (components.somatic) parts.push('С');
  if (components.material) {
    parts.push('М');
    if (components.materialComponents) {
      parts.push(`(${components.materialComponents})`);
    }
  }
  
  return parts.join(', ');
};

/**
 * Вычисляет доступное количество заклинаний по уровню персонажа и классу
 */
export const calculateAvailableSpellsByClassAndLevel = (
  characterClass: string,
  characterLevel: number,
  abilityScores: { [key: string]: number } = {}
): { cantrips: number; spells: number } => {
  // Значения по умолчанию
  let cantrips = 0;
  let spells = 0;
  
  // Получаем модификаторы характеристик
  const wisModifier = Math.max(0, Math.floor((abilityScores.wisdom || 10) - 10) / 2);
  const chaModifier = Math.max(0, Math.floor((abilityScores.charisma || 10) - 10) / 2);
  const intModifier = Math.max(0, Math.floor((abilityScores.intelligence || 10) - 10) / 2);
  
  switch (characterClass) {
    case "Бард":
      // Заговоры для барда: 2 на 1 уровне, +1 на 10-м уровне
      cantrips = characterLevel >= 10 ? 3 : 2;
      // Известные заклинания для барда по уровням
      const bardSpellsByLevel = [0, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22];
      spells = bardSpellsByLevel[characterLevel] || 0;
      break;
      
    case "Жрец":
      // Заговоры для жреца: 3 на 1 уровне, +1 на 4-м и 10-м уровнях
      if (characterLevel >= 10) cantrips = 5;
      else if (characterLevel >= 4) cantrips = 4;
      else cantrips = 3;
      // Жрецы готовят заклинания: уровень + модификатор мудрости
      spells = characterLevel + wisModifier;
      break;
      
    case "Друид":
      // Заговоры для друида: 2 на 1 уровне, +1 на 4-м и 10-м уровнях
      if (characterLevel >= 10) cantrips = 4;
      else if (characterLevel >= 4) cantrips = 3;
      else cantrips = 2;
      // Друиды готовят заклинания: уровень + модификатор мудрости
      spells = characterLevel + wisModifier;
      break;
      
    case "Волшебник":
      // Заговоры для волшебника: 3 на 1 уровне, +1 на 4-м и 10-м уровнях
      if (characterLevel >= 10) cantrips = 5;
      else if (characterLevel >= 4) cantrips = 4;
      else cantrips = 3;
      // Волшебники работают иначе - они записывают в книгу заклинаний
      spells = 6 + (characterLevel - 1) * 2;
      break;
      
    case "Чародей":
      // Заговоры для чародея: 4 на 1 уровне, +1 на 4-м и 10-м уровнях
      if (characterLevel >= 10) cantrips = 6;
      else if (characterLevel >= 4) cantrips = 5;
      else cantrips = 4;
      // Известные заклинания для чародея по уровням
      const sorcererSpellsByLevel = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15];
      spells = sorcererSpellsByLevel[characterLevel] || 0;
      break;
      
    case "Колдун":
    case "Чернокнижник":
      // Заговоры для колдуна: 2 на 1 уровне, +1 на 4-м и 10-м уровнях
      if (characterLevel >= 10) cantrips = 4;
      else if (characterLevel >= 4) cantrips = 3;
      else cantrips = 2;
      // Известные заклинания для колдуна по уровням
      const warlockSpellsByLevel = [0, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15];
      spells = warlockSpellsByLevel[characterLevel] || 0;
      break;
      
    case "Паладин":
      // Паладины не получают заговоры
      cantrips = 0;
      // Паладины получают заклинания со 2-го уровня
      if (characterLevel < 2) spells = 0;
      else {
        // Половина уровня + модификатор Харизмы (минимум 1)
        spells = Math.max(1, Math.floor(characterLevel / 2) + chaModifier);
      }
      break;
      
    case "Следопыт":
      // Следопыты не получают заговоры
      cantrips = 0;
      // Следопыты получают заклинания со 2-го уровня
      if (characterLevel < 2) spells = 0;
      else {
        // Половина уровня + модификатор Мудрости (минимум 1)
        spells = Math.max(1, Math.floor(characterLevel / 2) + wisModifier);
      }
      break;
      
    default:
      cantrips = 0;
      spells = 0;
  }
  
  return { cantrips, spells };
};
