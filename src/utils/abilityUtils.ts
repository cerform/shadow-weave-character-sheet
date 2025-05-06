
/**
 * Вычисляет модификатор характеристики на основе значения характеристики
 * @param abilityScore значение характеристики
 * @returns строковое представление модификатора характеристики (например, "+3" или "-1")
 */
export function getAbilityModifierString(abilityScore?: number): string {
  if (abilityScore === undefined || abilityScore === null) {
    return '—'; // Возвращаем тире для неопределенных значений
  }
  
  const modifier = Math.floor((abilityScore - 10) / 2);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

/**
 * Вычисляет числовой модификатор характеристики на основе значения характеристики
 * @param abilityScore значение характеристики
 * @returns числовой модификатор характеристики
 */
export function getAbilityModifier(abilityScore?: number): number {
  if (abilityScore === undefined || abilityScore === null) {
    return 0; // Возвращаем 0 для неопределенных значений
  }
  
  return Math.floor((abilityScore - 10) / 2);
}

/**
 * Проверяет является ли класс персонажа магическим
 * @param characterClass название класса персонажа
 * @returns true если класс магический, иначе false
 */
export function isMagicClass(characterClass?: string): boolean {
  if (!characterClass) return false;
  
  const magicClasses = [
    'Бард', 'Волшебник', 'Друид', 'Жрец', 'Колдун', 
    'Паладин', 'Следопыт', 'Чародей',
    // Английские варианты для совместимости
    'Bard', 'Wizard', 'Druid', 'Cleric', 'Warlock',
    'Paladin', 'Ranger', 'Sorcerer'
  ];
  
  return magicClasses.includes(characterClass);
}
