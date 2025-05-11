
/**
 * Функция симуляции броска костей dN
 * @param sides Количество граней кости
 * @param count Количество костей
 * @param modifier Модификатор, добавляемый к результату
 * @returns Результат броска
 */
export function diceRollSimulator(sides: number, count: number = 1, modifier: number = 0): number {
  let total = 0;
  
  for (let i = 0; i < count; i++) {
    total += Math.floor(Math.random() * sides) + 1;
  }
  
  return total + modifier;
}

/**
 * Функция генерации полного результата бросков с указанием всех значений
 * @param sides Количество граней кости
 * @param count Количество костей
 * @param modifier Модификатор, добавляемый к результату
 * @returns Объект с данными о броске: отдельные броски, модификатор и общая сумма
 */
export function detailedDiceRoll(sides: number, count: number = 1, modifier: number = 0) {
  const rolls: number[] = [];
  
  for (let i = 0; i < count; i++) {
    rolls.push(Math.floor(Math.random() * sides) + 1);
  }
  
  const sum = rolls.reduce((acc, val) => acc + val, 0);
  const total = sum + modifier;
  
  return {
    rolls,
    modifier,
    sum,
    total
  };
}

/**
 * Функция симуляции броска с преимуществом (выбирается лучший из двух бросков)
 */
export function rollWithAdvantage(sides: number = 20): number {
  const roll1 = Math.floor(Math.random() * sides) + 1;
  const roll2 = Math.floor(Math.random() * sides) + 1;
  return Math.max(roll1, roll2);
}

/**
 * Функция симуляции броска с помехой (выбирается худший из двух бросков)
 */
export function rollWithDisadvantage(sides: number = 20): number {
  const roll1 = Math.floor(Math.random() * sides) + 1;
  const roll2 = Math.floor(Math.random() * sides) + 1;
  return Math.min(roll1, roll2);
}
