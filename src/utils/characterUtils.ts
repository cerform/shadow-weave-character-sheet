
/**
 * Возвращает числовой модификатор для значения характеристики
 * @param value Значение характеристики (обычно от 1 до 20)
 * @returns Модификатор характеристики
 */
export const getNumericModifier = (value?: number): number => {
  if (!value) return 0;
  return Math.floor((value - 10) / 2);
}

/**
 * Возвращает модификатор для значения характеристики с "+" для положительных значений
 * @param value Значение характеристики (обычно от 1 до 20)
 * @returns Строка с модификатором характеристики (например, "+2" или "-1")
 */
export const getModifierFromAbilityScore = (value?: number): string => {
  if (!value) return "+0";
  const modifier = getNumericModifier(value);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
}

/**
 * Проверяет, является ли класс магическим (использующим заклинания)
 * @param className Название класса
 * @returns true, если класс магический
 */
export const isMagicClass = (className: string): boolean => {
  const magicClasses = [
    'Бард', 'Волшебник', 'Жрец', 'Колдун', 'Следопыт', 'Паладин', 'Чародей', 'Друид'
  ];
  return magicClasses.includes(className);
}

/**
 * Вычисляет класс брони на основе характеристик и класса персонажа
 * @param dexterity значение ловкости
 * @param constitution значение телосложения
 * @param wisdom значение мудрости
 * @param characterClass класс персонажа
 * @returns значение КБ (класса брони)
 */
export const calculateArmorClass = (
  dexterity: number = 10,
  constitution: number = 10,
  wisdom: number = 10,
  characterClass?: string
): number => {
  // Базовый КБ
  let baseAC = 10;
  
  // Модификатор ловкости
  const dexMod = getNumericModifier(dexterity);
  
  // Для большинства классов - 10 + модификатор ловкости
  let ac = baseAC + dexMod;
  
  // Специальные правила для определенных классов
  if (characterClass) {
    // Варвар - может использовать щит + телосложение
    if (characterClass.includes('Варвар')) {
      ac = baseAC + dexMod + getNumericModifier(constitution);
    }
    // Монах - без доспеха + ловкость + мудрость
    else if (characterClass.includes('Монах')) {
      ac = baseAC + dexMod + getNumericModifier(wisdom);
    }
    // Другие классы могут иметь свои особенности
  }
  
  return ac;
}

/**
 * Возвращает модификатор инициативы
 * @param dexterity Значение ловкости
 * @returns Строковое представление модификатора инициативы
 */
export const getInitiativeModifier = (dexterity: number = 10): string => {
  return getModifierFromAbilityScore(dexterity);
}

/**
 * Вычисляет грузоподъемность персонажа
 * @param strength Значение силы
 * @returns Строковое представление грузоподъемности в фунтах
 */
export const calculateCarryingCapacity = (strength: number = 10): string => {
  const capacity = strength * 15;
  return `${capacity} фунтов`;
}

/**
 * Определяет тип кубика хитов для класса
 * @param className Название класса
 * @returns Тип кубика хитов (d6, d8, d10, d12)
 */
export const getHitDieTypeByClass = (className?: string): string => {
  if (!className) return "d8";
  
  // Определение типа кубика по классу
  if (className.includes('Волшебник') || className.includes('Чародей')) {
    return "d6";
  } else if (className.includes('Бард') || className.includes('Друид') || 
             className.includes('Жрец') || className.includes('Монах') || 
             className.includes('Плут') || className.includes('Следопыт')) {
    return "d8";
  } else if (className.includes('Воин') || className.includes('Паладин')) {
    return "d10";
  } else if (className.includes('Варвар')) {
    return "d12";
  }
  
  // По умолчанию d8
  return "d8";
}

/**
 * Вычисляет максимум хитов на основе класса, уровня и телосложения
 * @param className Название класса
 * @param level Уровень персонажа
 * @param constitution Значение телосложения
 * @returns Максимальное количество хитов
 */
export const calculateMaxHitPoints = (
  className: string,
  level: number,
  constitution: number = 10
): number => {
  // Получаем тип кубика хитов
  const hitDieType = getHitDieTypeByClass(className);
  
  // Определяем максимум хитов для кубика
  let maxHitDie: number;
  switch (hitDieType) {
    case "d6": maxHitDie = 6; break;
    case "d8": maxHitDie = 8; break;
    case "d10": maxHitDie = 10; break;
    case "d12": maxHitDie = 12; break;
    default: maxHitDie = 8;
  }
  
  // Модификатор телосложения
  const conMod = getNumericModifier(constitution);
  
  // На первом уровне максимум хитов равен максимуму кубика + модификатор телосложения
  let hp = maxHitDie + conMod;
  
  // На последующих уровнях - среднее значение кубика + модификатор телосложения
  if (level > 1) {
    // Среднее значение кубика: (1 + максимум) / 2
    const avgHitDie = Math.ceil((1 + maxHitDie) / 2);
    
    // Добавляем хиты за каждый уровень после первого
    for (let i = 1; i < level; i++) {
      hp += avgHitDie + conMod;
    }
  }
  
  // Минимум 1 хит на уровень
  return Math.max(level, hp);
}
