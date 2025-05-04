
import { CharacterSheet } from '@/types/character.d';

/**
 * Получение строкового представления модификатора характеристики
 * @param abilityScore Значение характеристики
 * @returns Строка модификатора (например, "+3" или "-1")
 */
export const getModifierFromAbilityScore = (abilityScore: number): string => {
  const modifier = Math.floor((abilityScore - 10) / 2);
  return modifier >= 0 ? `+${modifier}` : modifier.toString();
};

/**
 * Получение числового значения модификатора характеристики
 * @param abilityScore Значение характеристики
 * @returns Числовое значение модификатора (например, 3 или -1)
 */
export const getNumericModifier = (abilityScore: number): number => {
  return Math.floor((abilityScore - 10) / 2);
};

/**
 * Проверка, является ли класс персонажа магическим
 * @param className Название класса персонажа
 * @returns true, если класс магический, false в противном случае
 */
export const isMagicClass = (className: string): boolean => {
  if (!className) return false;
  
  const magicClasses = [
    'Бард',
    'Волшебник',
    'Друид',
    'Жрец',
    'Колдун',
    'Паладин',
    'Следопыт',
    'Чародей',
  ];
  
  return magicClasses.includes(className);
};

/**
 * Вычисление максимального количества хитов персонажа
 * @param className Название класса персонажа
 * @param level Уровень персонажа
 * @param constitutionModifier Модификатор телосложения
 * @returns Максимальное количество хитов
 */
export const calculateMaxHitPoints = (className: string, level: number, constitutionModifier: number): number => {
  // Определяем кубик хитов класса
  let hitDie = 8; // По умолчанию d8
  
  if (className === 'Варвар') {
    hitDie = 12;
  } else if (['Воин', 'Паладин', 'Следопыт'].includes(className)) {
    hitDie = 10;
  } else if (['Волшебник', 'Чародей'].includes(className)) {
    hitDie = 6;
  }
  
  // На первом уровне получаем максимум по кубику + модификатор телосложения
  let maxHp = hitDie + constitutionModifier;
  
  // На каждом последующем уровне добавляем среднее значение кубика + модификатор телосложения
  if (level > 1) {
    // Среднее значение кубика = (1 + hitDie) / 2
    const averageRoll = (1 + hitDie) / 2;
    maxHp += (level - 1) * (averageRoll + constitutionModifier);
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
 */
export const hasSpellcasting = (className: string): boolean => {
  return isMagicClass(className);
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
