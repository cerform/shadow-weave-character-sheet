
import { useContext } from 'react';
import { ThemeContext } from '@/contexts/ThemeContext';

export const useTheme = () => {
  const context = useContext(ThemeContext);
  
  if (!context) {
    // Изменяем поведение на обработку по умолчанию вместо выброса исключения
    console.warn('useTheme must be used within a ThemeProvider');
    return { theme: 'default', setTheme: (theme: string) => {
      console.warn(`Unable to set theme to ${theme}: ThemeProvider not found`);
    }};
  }
  
  return context;
};

export default useTheme;
