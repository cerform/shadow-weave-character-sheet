/**
 * Получает модификатор характеристики
 * @param abilityScore Значение характеристики
 * @returns Строка модификатора с + или -
 */
export const getModifierFromAbilityScore = (abilityScore: number): string => {
  const modifier = Math.floor((abilityScore - 10) / 2);
  return modifier >= 0 ? `+${modifier}` : `${modifier}`;
};

/**
 * Получает числовое значение модификатора характеристики
 * @param abilityScore Значение характеристики
 * @returns Числовое значение модификатора
 */
export const getNumericModifier = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};

/**
 * Вычисляет максимальное количество хитов для персонажа
 * @param className Название класса
 * @param level Уровень персонажа
 * @param constitutionScore Значение характеристики Телосложение
 * @returns Максимальное количество хитов
 */
export const calculateMaxHitPoints = (className: string, level: number, constitutionScore: number): number => {
  const hitDieValue = getHitDieValue(getHitDieTypeByClass(className));
  const constitutionModifier = getNumericModifier(constitutionScore);
  let maxHp = hitDieValue + constitutionModifier; // Учитываем хит дайс и модификатор телосложения на первом уровне

  for (let i = 2; i <= level; i++) {
    maxHp += hitDieValue / 2 + 1 + constitutionModifier; // Учитываем среднее значение хит дайса и модификатор телосложения на последующих уровнях
  }

  return Math.max(1, Math.round(maxHp)); // Минимум 1 хит
};

/**
 * Получение типа кубика хитов для класса персонажа
 * @param className Название класса
 * @returns Строка с типом кубика хитов (например, "d8")
 */
export const getHitDieTypeByClass = (className: string): string => {
  const hitDieByClass: {[key: string]: string} = {
    "Варвар": "d12",
    "Воин": "d10",
    "Паладин": "d10",
    "Следопыт": "d10",
    "Монах": "d8",
    "Плут": "d8",
    "Бард": "d8",
    "Жрец": "d8",
    "Друид": "d8",
    "Волшебник": "d6",
    "Чародей": "d6",
    "Колдун": "d8"
  };
  
  return hitDieByClass[className] || "d8";
};

/**
 * Определение числового значения кубика хитов
 * @param hitDieType Тип кубика хитов (например, "d8")
 * @returns Числовое значение (например, 8)
 */
export const getHitDieValue = (hitDieType: string): number => {
  const match = hitDieType.match(/d(\d+)/);
  return match ? parseInt(match[1]) : 8;
};

/**
 * Определяет, является ли класс магическим
 * @param className Название класса
 * @returns true, если класс является магическим, иначе false
 */
export const isMagicClass = (className: string): boolean => {
  const magicClasses = ["Волшебник", "Чародей", "Колдун", "Бард", "Жрец", "Друид", "Паладин", "Следопыт"];
  return magicClasses.includes(className);
};

/**
 * Получает значение модификатора инициативы
 * @param dexterityScore Значение характеристики Ловкость
 * @returns Строка модификатора инициативы с + или -
 */
export const getInitiativeModifier = (dexterityScore: number): string => {
  return getModifierFromAbilityScore(dexterityScore);
};

/**
 * Вычисляет класс брони персонажа на основе характеристик и класса
 * @param dexterityScore Значение характеристики Ловкость
 * @param constitutionScore Значение характеристики Телосложение
 * @param wisdomScore Значение характеристики Мудрость
 * @param className Класс персонажа
 * @returns Значение класса брони
 */
export const calculateArmorClass = (
  dexterityScore: number,
  constitutionScore: number,
  wisdomScore: number,
  className?: string
): number => {
  const dexMod = getNumericModifier(dexterityScore);
  let ac = 10 + dexMod;
  
  // Особые правила расчета КБ для некоторых классов
  if (className === "Монах") {
    const wisMod = getNumericModifier(wisdomScore);
    ac += wisMod;
  } else if (className === "Варвар") {
    const conMod = getNumericModifier(constitutionScore);
    ac += conMod;
  }
  
  return ac;
};

/**
 * Вычисляет грузоподъемность персонажа
 * @param strengthScore Значение характеристики Сила
 * @returns Строка с грузоподъемностью (например, "150 фунтов")
 */
export const calculateCarryingCapacity = (strengthScore: number): string => {
  return `${strengthScore * 15} фунтов`;
}
