
import { CharacterSpell } from '@/types/character';
import { SpellData } from '@/types/spells';

/**
 * Нормализует заклинания, преобразуя строки в объекты
 */
export const normalizeSpells = (spells: Array<CharacterSpell | string>): CharacterSpell[] => {
  return spells.map(spell => {
    if (typeof spell === 'string') {
      return {
        name: spell,
        level: 0, // По умолчанию заговор
      };
    }
    return spell;
  });
};

/**
 * Конвертирует CharacterSpell в SpellData
 */
export const convertToSpellData = (spell: CharacterSpell): SpellData => {
  return {
    name: spell.name,
    level: spell.level,
    school: spell.school || "Универсальная",
    castingTime: spell.castingTime || "1 действие",
    range: spell.range || "На себя",
    components: spell.components || "",
    duration: spell.duration || "Мгновенная",
    description: spell.description || ["Нет описания"],
    classes: spell.classes || [],
    source: spell.source || "Книга игрока",
    prepared: spell.prepared || false,
    id: spell.id || `spell-${spell.name.toLowerCase().replace(/\s/g, '-')}`
  };
};

/**
 * Вычисляет доступное количество подготовленных заклинаний
 * на основе класса и модификатора способности
 */
export const calculatePreparedSpellsLimit = (
  className: string, 
  level: number, 
  abilityModifier: number
): number => {
  // У разных классов разные формулы
  switch (className) {
    case "Жрец":
    case "Друид":
    case "Волшебник":
      return level + abilityModifier;
    case "Паладин":
    case "Следопыт":
      // Половина уровня (округление вниз) + модификатор способности
      return Math.floor(level / 2) + abilityModifier;
    // Варды, Чародеи и Колдуны не готовят заклинания
    case "Бард":
    case "Чародей":
    case "Колдун":
      return 0;
    default:
      return 0;
  }
};

/**
 * Проверяет, можно ли заклинателю подготовить еще заклинания
 */
export const canPrepareMoreSpells = (
  character: { 
    class?: string; 
    level: number; 
    spells?: Array<CharacterSpell | string>; 
    abilities?: any 
  },
  spellcastingAbility: string
): boolean => {
  // Если класс не требует подготовки заклинаний, всегда true
  if (["Бард", "Чародей", "Колдун"].includes(character.class || "")) {
    return true;
  }
  
  // Получаем модификатор способности
  let abilityScore = 10;
  if (character.abilities) {
    switch (spellcastingAbility) {
      case "INT":
        abilityScore = character.abilities.INT || character.abilities.intelligence || 10;
        break;
      case "WIS":
        abilityScore = character.abilities.WIS || character.abilities.wisdom || 10;
        break;
      case "CHA":
        abilityScore = character.abilities.CHA || character.abilities.charisma || 10;
        break;
    }
  }
  
  const abilityModifier = Math.floor((abilityScore - 10) / 2);
  
  // Количество заклинаний, которые можно подготовить
  const spellLimit = calculatePreparedSpellsLimit(
    character.class || "", 
    character.level, 
    abilityModifier
  );
  
  // Если лимит 0, класс не готовит заклинания
  if (spellLimit === 0) return true;
  
  // Подсчитываем количество уже подготовленных заклинаний
  const preparedCount = character.spells?.filter(spell => {
    if (typeof spell === 'string') return false;
    return spell.prepared && spell.level > 0; // Заговоры не учитываются
  }).length || 0;
  
  return preparedCount < spellLimit;
};

/**
 * Получает максимальное количество подготовленных заклинаний для персонажа
 */
export const getPreparedSpellsLimit = (
  character: { 
    class?: string; 
    level: number; 
    abilities?: any; 
    spellcasting?: { ability?: string }
  }
): number => {
  if (!character.class) return 0;
  
  // Если класс не требует подготовки заклинаний
  if (["Бард", "Чародей", "Колдун"].includes(character.class)) {
    return 0; // Не ограничено
  }
  
  // Получаем способность для заклинаний
  let spellcastingAbility = character.spellcasting?.ability || getSpellcastingAbilityByClass(character.class);
  
  // Получаем значение характеристики
  let abilityScore = 10;
  if (character.abilities) {
    switch (spellcastingAbility) {
      case "INT":
        abilityScore = character.abilities.INT || character.abilities.intelligence || 10;
        break;
      case "WIS":
        abilityScore = character.abilities.WIS || character.abilities.wisdom || 10;
        break;
      case "CHA":
        abilityScore = character.abilities.CHA || character.abilities.charisma || 10;
        break;
    }
  }
  
  const abilityModifier = Math.floor((abilityScore - 10) / 2);
  
  // Вычисляем лимит подготовленных заклинаний
  return calculatePreparedSpellsLimit(character.class, character.level, abilityModifier);
};

/**
 * Возвращает основную характеристику для заклинаний на основе класса
 */
function getSpellcastingAbilityByClass(className: string): string {
  switch (className) {
    case "Волшебник":
      return "INT";
    case "Жрец":
    case "Друид":
    case "Следопыт":
      return "WIS";
    case "Бард":
    case "Чародей":
    case "Колдун":
    case "Паладин":
      return "CHA";
    default:
      return "";
  }
}
