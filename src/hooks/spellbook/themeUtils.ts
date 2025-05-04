
import { useTheme } from '../use-theme';
import { themes } from '@/lib/themes';

// Хук для получения темы заклинаний
export const useSpellTheme = () => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  // Функция для получения цвета бейджа заклинания по уровню
  const getBadgeColor = (level: number) => {
    const colors = {
      0: '#808080', // Заговоры - серый
      1: '#3b82f6', // 1 уровень - синий
      2: '#10b981', // 2 уровень - зеленый
      3: '#f59e0b', // 3 уровень - желтый
      4: '#ef4444', // 4 уровень - красный
      5: '#8b5cf6', // 5 уровень - фиолетовый
      6: '#ec4899', // 6 уровень - розовый
      7: '#06b6d4', // 7 уровень - голубой
      8: '#9333ea', // 8 уровень - пурпурный
      9: '#dc2626', // 9 уровень - темно-красный
    }[level] || currentTheme.accent;
    return colors;
  };
  
  // Функция для получения цвета бейджа школы магии
  const getSchoolBadgeColor = (school: string) => {
    const colors = {
      'Воплощение': '#ef4444', // Красный
      'Некромантия': '#9333ea', // Фиолетовый
      'Очарование': '#ec4899', // Розовый
      'Преобразование': '#3b82f6', // Синий
      'Призыв': '#f59e0b', // Оранжевый
      'Прорицание': '#06b6d4', // Голубой
      'Иллюзия': '#8b5cf6', // Светло-фиолетовый
      'Ограждение': '#10b981', // Зеленый
    }[school] || '#6b7280'; // Серый по умолчанию
    return colors;
  };
  
  return {
    currentTheme,
    getBadgeColor,
    getSchoolBadgeColor
  };
};
