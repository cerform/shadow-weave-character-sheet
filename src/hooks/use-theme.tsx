
import { useContext, useMemo } from 'react';
import { ThemeContext, Theme } from '@/contexts/ThemeContext';
import { themes } from '@/lib/themes';
import { useUserTheme } from '@/hooks/use-user-theme';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  const userTheme = useUserTheme();
  
  if (!context) {
    console.error('useTheme должен использоваться внутри ThemeProvider');
    return { 
      theme: 'default' as Theme, 
      setTheme: (theme: Theme) => {
        console.error(`Не удалось установить тему ${theme}: ThemeProvider не найден`);
      },
      themeStyles: themes.default,
      effectiveTheme: 'default'
    };
  }
  
  // Мемоизируем значения, чтобы избежать лишних ререндеров компонентов
  return useMemo(() => {
    // Приоритет отдаем пользовательской теме, если она существует
    const effectiveTheme = userTheme?.activeTheme || context.theme;
    
    // Получаем активные стили темы без вычисления при каждом рендеринге
    const themeKey = (effectiveTheme || 'default') as keyof typeof themes;
    const themeStyles = themes[themeKey] || themes.default;
    
    return {
      ...context,
      themeStyles,
      effectiveTheme
    };
  }, [context, userTheme?.activeTheme]); // Зависим только от этих значений
};

export default useTheme;
