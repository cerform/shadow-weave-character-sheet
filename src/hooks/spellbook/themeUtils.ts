
import { useTheme } from '@/hooks/use-theme';
import { themes } from '@/lib/themes';

// Получение цветов для значков на основе текущей темы
export const useSpellTheme = () => {
  const { theme } = useTheme();
  const themeKey = (theme || 'default') as keyof typeof themes;
  const currentTheme = themes[themeKey] || themes.default;
  
  const getBadgeColor = (level: number) => {
    // Цвета на основе выбранной темы
    const levelColors: { [key: number]: string } = {
      0: `bg-stone-800 text-white border border-${currentTheme.accent}`,
      1: `bg-blue-900 text-white border border-${currentTheme.accent}`,
      2: `bg-green-900 text-white border border-${currentTheme.accent}`,
      3: `bg-yellow-900 text-white border border-${currentTheme.accent}`,
      4: `bg-orange-900 text-white border border-${currentTheme.accent}`,
      5: `bg-red-900 text-white border border-${currentTheme.accent}`,
      6: `bg-purple-900 text-white border border-${currentTheme.accent}`,
      7: `bg-pink-900 text-white border border-${currentTheme.accent}`,
      8: `bg-indigo-900 text-white border border-${currentTheme.accent}`,
      9: `bg-cyan-900 text-white border border-${currentTheme.accent}`,
    };

    return levelColors[level] || "bg-gray-800 text-white";
  };

  const getSchoolBadgeColor = (school: string) => {
    const schoolColors: { [key: string]: string } = {
      'Преобразование': 'bg-blue-900 text-white',
      'Воплощение': 'bg-red-900 text-white',
      'Вызов': 'bg-orange-900 text-white',
      'Прорицание': 'bg-purple-900 text-white',
      'Очарование': 'bg-pink-900 text-white',
      'Иллюзия': 'bg-indigo-900 text-white',
      'Некромантия': 'bg-green-900 text-white',
      'Ограждение': 'bg-yellow-900 text-white',
    };

    return schoolColors[school] || "bg-gray-800 text-white";
  };
  
  return { currentTheme, getBadgeColor, getSchoolBadgeColor };
};
