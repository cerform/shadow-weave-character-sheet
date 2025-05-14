
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

// Получение цветов для значков на основе текущей темы
export const useSpellTheme = () => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const getBadgeColor = (level: number) => {
    // Используем цвета уровней из темы, если они есть
    if (currentTheme.spellLevels && currentTheme.spellLevels[level]) {
      return currentTheme.spellLevels[level];
    }
    
    // Запасные цвета, если в теме не определены уровни
    const levelColors: { [key: number]: string } = {
      0: '#6b7280', // gray-500
      1: '#3b82f6', // blue-500
      2: '#8b5cf6', // violet-500
      3: '#ec4899', // pink-500
      4: '#f97316', // orange-500
      5: '#ef4444', // red-500
      6: '#14b8a6', // teal-500
      7: '#6366f1', // indigo-500
      8: '#ca8a04', // yellow-600
      9: '#059669'  // emerald-600
    };

    return levelColors[level] || "#6b7280";
  };

  const getSchoolBadgeColor = (school: string) => {
    const schoolColors: { [key: string]: string } = {
      'Преобразование': '#3b82f6', // blue-600
      'Воплощение': '#ef4444', // red-500
      'Вызов': '#f97316', // orange-500
      'Прорицание': '#8b5cf6', // violet-500
      'Очарование': '#ec4899', // pink-500
      'Иллюзия': '#6366f1', // indigo-500
      'Некромантия': '#10b981', // emerald-500
      'Ограждение': '#eab308', // yellow-500
      'Универсальная': '#6b7280', // gray-500
    };

    return schoolColors[school] || currentTheme.accent || "#6b7280";
  };
  
  return { currentTheme, getBadgeColor, getSchoolBadgeColor };
};
