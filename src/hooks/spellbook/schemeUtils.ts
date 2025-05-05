
/**
 * Возвращает вариант бейджа в зависимости от школы магии
 */
export const getSpellSchoolBadgeVariant = (school: string): "outline" | "secondary" | "destructive" | "default" => {
  switch (school?.toLowerCase()) {
    case 'воплощение':
      return 'destructive';
    case 'некромантия':
      return 'outline';
    case 'очарование':
      return 'secondary';
    case 'преобразование':
      return 'default';
    case 'прорицание':
      return 'default';
    case 'вызов':
      return 'secondary';
    case 'ограждение':
      return 'default';
    case 'иллюзия':
      return 'outline';
    default:
      return 'default';
  }
};

/**
 * Возвращает цвет бейджа в зависимости от школы магии
 */
export const getSpellSchoolColor = (school: string): string => {
  switch (school?.toLowerCase()) {
    case 'воплощение':
      return '#ef4444'; // Красный
    case 'некромантия':
      return '#6b7280'; // Серый
    case 'очарование':
      return '#ec4899'; // Розовый
    case 'преобразование':
      return '#3b82f6'; // Голубой
    case 'прорицание':
      return '#8b5cf6'; // Фиолетовый
    case 'вызов':
      return '#10b981'; // Зеленый
    case 'ограждение':
      return '#f59e0b'; // Оранжевый
    case 'иллюзия':
      return '#8b5cf6'; // Фиолетовый
    default:
      return '#6b7280'; // Серый по умолчанию
  }
};
