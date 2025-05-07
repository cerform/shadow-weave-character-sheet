
/**
 * Вычисляет модификатор характеристики по её значению
 * @param score Значение характеристики
 * @returns Модификатор характеристики
 */
export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Возвращает строковое представление модификатора характеристики
 * @param modifier Модификатор характеристики
 * @returns Строка с модификатором характеристики (+2, -1 и т.д.)
 */
export function getAbilityModifierString(modifier: number): string {
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

/**
 * Возвращает имя характеристики на русском языке
 * @param ability Ключ характеристики (strength, dexterity и т.д.)
 * @returns Название характеристики на русском
 */
export function getAbilityName(ability: string): string {
  const abilityNames: Record<string, string> = {
    strength: 'Сила',
    dexterity: 'Ловкость',
    constitution: 'Телосложение',
    intelligence: 'Интеллект',
    wisdom: 'Мудрость',
    charisma: 'Харизма',
    STR: 'Сила',
    DEX: 'Ловкость',
    CON: 'Телосложение',
    INT: 'Интеллект',
    WIS: 'Мудрость',
    CHA: 'Харизма',
  };

  return abilityNames[ability] || ability;
}

/**
 * Возвращает имя навыка на русском языке
 * @param skill Ключ навыка (athletics, perception и т.д.)
 * @returns Название навыка на русском
 */
export function getSkillName(skill: string): string {
  const skillNames: Record<string, string> = {
    athletics: 'Атлетика',
    acrobatics: 'Акробатика',
    'sleight-of-hand': 'Ловкость рук',
    stealth: 'Скрытность',
    arcana: 'Магия',
    history: 'История',
    investigation: 'Анализ',
    nature: 'Природа',
    religion: 'Религия',
    'animal-handling': 'Уход за животными',
    insight: 'Проницательность',
    medicine: 'Медицина',
    perception: 'Восприятие',
    survival: 'Выживание',
    deception: 'Обман',
    intimidation: 'Запугивание',
    performance: 'Выступление',
    persuasion: 'Убеждение',
  };

  return skillNames[skill] || skill;
}

/**
 * Получает модификатор характеристики из персонажа
 * @param character Объект персонажа
 * @param ability Ключ характеристики
 * @returns Модификатор характеристики
 */
export function getCharacterAbilityModifier(character: any, ability: string): number {
  // Проверяем различные пути, где могут быть сохранены значения характеристик
  let score: number | undefined;
  
  // Проверяем прямые поля
  if (character[ability] !== undefined) {
    score = character[ability];
  }
  // Проверяем в stats
  else if (character.stats && character.stats[ability] !== undefined) {
    score = character.stats[ability];
  }
  // Проверяем в abilities
  else if (character.abilities && character.abilities[ability.toUpperCase()] !== undefined) {
    score = character.abilities[ability.toUpperCase()];
  }
  else if (character.abilities && character.abilities[ability] !== undefined) {
    score = character.abilities[ability];
  }
  
  // Если значение не найдено, используем 10 как значение по умолчанию
  return getAbilityModifier(score || 10);
}

/**
 * Нормализует ключи характеристик
 * @param ability Ключ характеристики в любом формате
 * @returns Нормализованный ключ характеристики
 */
export function normalizeAbilityKey(ability: string): string {
  // Преобразуем ключи в нижний регистр
  const normalized = ability.toLowerCase();
  
  // Карта сопоставления коротких и полных названий
  const abilityMap: Record<string, string> = {
    str: 'strength',
    dex: 'dexterity',
    con: 'constitution',
    int: 'intelligence',
    wis: 'wisdom',
    cha: 'charisma',
  };
  
  return abilityMap[normalized] || normalized;
}
