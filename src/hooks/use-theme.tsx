
import { useContext } from 'react';
import { ThemeContext, Theme } from '@/contexts/ThemeContext';
import { themes } from '@/lib/themes';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    console.error('useTheme должен использоваться внутри ThemeProvider');
    return { 
      theme: 'default' as Theme, 
      setTheme: (theme: Theme) => {
        console.error(`Не удалось установить тему ${theme}: ThemeProvider не найден`);
      },
      themeStyles: themes.default
    };
  }
  
  // Получаем активные стили темы
  const themeKey = (context.theme || 'default') as keyof typeof themes;
  const themeStyles = themes[themeKey] || themes.default;
  
  return {
    ...context,
    themeStyles
  };
};

export default useTheme;
