
import { useContext } from 'react';
import { UserThemeContext } from '@/contexts/UserThemeContext';
import { themes } from '@/lib/themes';

export const useUserTheme = () => {
  const context = useContext(UserThemeContext);
  
  if (!context) {
    console.warn('useUserTheme must be used within a UserThemeProvider');
    // Возвращаем заглушку при отсутствии контекста
    return {
      activeTheme: 'default',
      setUserTheme: (theme: string) => {
        console.warn(`Unable to set theme to ${theme}: UserThemeProvider not found`);
      },
      currentThemeStyles: themes.default
    };
  }
  
  return context;
};

export default useUserTheme;
