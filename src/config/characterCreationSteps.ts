
export const steps = [
  {
    id: 0,
    name: "Раса",
    description: "Выбор расы персонажа"
  },
  {
    id: 1,
    name: "Класс",
    description: "Выбор основного класса персонажа"
  },
  {
    id: 2,
    name: "Архетип",
    description: "Выбор специализации класса",
    optional: true // Помечаем шаг как опциональный
  },
  {
    id: 3,
    name: "Уровень",
    description: "Уровень персонажа и особенности"
  },
  {
    id: 4,
    name: "Характеристики",
    description: "Распределение очков характеристик"
  },
  {
    id: 5,
    name: "Здоровье",
    description: "Расчет очков здоровья персонажа"
  },
  {
    id: 6,
    name: "Мультиклассирование",
    description: "Дополнительные классы (опционально)"
  },
  {
    id: 7,
    name: "Заклинания",
    description: "Выбор заклинаний для заклинателей",
    optional: true,
    onlyFor: "magic"
  },
  {
    id: 8,
    name: "Снаряжение",
    description: "Выбор оружия и экипировки"
  },
  {
    id: 9,
    name: "Языки",
    description: "Выбор языков персонажа"
  },
  {
    id: 10,
    name: "Черты",
    description: "Определение черт личности"
  },
  {
    id: 11,
    name: "Предыстория",
    description: "История персонажа и связи"
  },
  {
    id: 12,
    name: "Завершение",
    description: "Обзор и финальные штрихи"
  }
];

// Новая функция для получения всех шагов, поддерживающая фильтрацию
export const getCharacterSteps = (config?: { isMagicClass?: boolean; hasSubclasses?: boolean }) => {
  return steps.filter(step => {
    // Фильтруем шаги заклинаний для немагических классов
    if (step.id === 7 && step.onlyFor === "magic" && config?.isMagicClass === false) {
      return false;
    }
    // Фильтруем шаг архетипа для классов без подклассов
    if (step.id === 2 && step.optional && config?.hasSubclasses === false) {
      return false;
    }
    return true;
  });
};

// Получаем индекс шага в отфильтрованном массиве по ID из полного массива
export const getStepIndexByID = (stepId: number, filteredSteps: typeof steps) => {
  return filteredSteps.findIndex(step => step.id === stepId);
};

// Находим следующий доступный шаг после указанного ID
export const getNextStepID = (currentStepId: number, filteredSteps: typeof steps) => {
  const currentIndex = filteredSteps.findIndex(step => step.id === currentStepId);
  if (currentIndex === -1 || currentIndex >= filteredSteps.length - 1) return currentStepId;
  return filteredSteps[currentIndex + 1].id;
};

// Находим предыдущий доступный шаг перед указанным ID
export const getPrevStepID = (currentStepId: number, filteredSteps: typeof steps) => {
  const currentIndex = filteredSteps.findIndex(step => step.id === currentStepId);
  if (currentIndex <= 0) return 0;
  return filteredSteps[currentIndex - 1].id;
};
