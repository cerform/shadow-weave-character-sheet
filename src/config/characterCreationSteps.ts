
export const steps = [
  {
    id: 0,
    name: "Раса",
    description: "Выбор расы персонажа"
  },
  {
    id: 1,
    name: "Подраса",
    description: "Выбор подрасы персонажа, если доступно",
    optional: true,
    onlyFor: "hasSubraces"
  },
  {
    id: 2,
    name: "Класс",
    description: "Выбор класса и специализации персонажа"
  },
  {
    id: 3,
    name: "Уровень",
    description: "Выбор уровня и мультиклассирование"
  },
  {
    id: 4,
    name: "Характеристики",
    description: "Распределение базовых характеристик"
  },
  {
    id: 5,
    name: "Предыстория",
    description: "Выбор предыстории персонажа"
  },
  {
    id: 6,
    name: "Здоровье",
    description: "Расчет очков здоровья персонажа"
  },
  {
    id: 7,
    name: "Снаряжение",
    description: "Выбор начального снаряжения"
  },
  {
    id: 8,
    name: "Детали",
    description: "Внешность, личность и связи"
  },
  {
    id: 9,
    name: "Заклинания",
    description: "Выбор заклинаний для персонажа"
    // Заклинания всегда доступны
  },
  {
    id: 10,
    name: "Завершение",
    description: "Проверка и финализация персонажа"
  }
];

// Функция для получения видимых шагов на основе фильтрации
export const getCharacterSteps = (config?: { hasSubraces?: boolean }) => {
  return steps.filter(step => {
    // Для шага подрасы
    if (step.id === 1 && step.onlyFor === "hasSubraces") {
      return config?.hasSubraces || false;
    }
    
    // Все остальные шаги всегда отображаются
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
