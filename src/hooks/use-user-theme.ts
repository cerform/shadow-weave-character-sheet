
import { useContext } from 'react';
import { UserThemeContext } from '@/contexts/UserThemeContext';

export const useUserTheme = () => {
  const context = useContext(UserThemeContext);
  if (context === undefined) {
    throw new Error('useUserTheme must be used within a UserThemeProvider');
  }
  return context;
};

export default useUserTheme;
