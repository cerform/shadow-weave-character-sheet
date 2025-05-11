
/**
 * Функция для генерации случайных характеристик персонажа
 * Симулирует стандартный метод бросков 4d6 с отбрасыванием наименьшего
 */
export function generateRandomStats() {
  const rollStat = (): number => {
    // Бросаем 4d6 и отбрасываем наименьший результат
    const rolls = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
    const total = rolls
      .sort((a, b) => b - a) // Сортируем по убыванию
      .slice(0, 3) // Берем первые 3 (отбрасывая наименьший)
      .reduce((sum, roll) => sum + roll, 0);
      
    return total;
  };

  return {
    strength: rollStat(),
    dexterity: rollStat(),
    constitution: rollStat(),
    intelligence: rollStat(),
    wisdom: rollStat(),
    charisma: rollStat()
  };
}

/**
 * Функция для генерации случайных значений с минимальными требованиями
 */
export function generateRandomStatsWithRequirements(minValue: number = 8) {
  let stats = generateRandomStats();
  
  // Проверяем, что все характеристики соответствуют минимальному требованию
  Object.entries(stats).forEach(([key, value]) => {
    if (value < minValue) {
      stats[key as keyof typeof stats] = minValue;
    }
  });
  
  return stats;
}
