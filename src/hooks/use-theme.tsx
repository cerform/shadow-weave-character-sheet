
import { useTheme as useContextTheme } from '@/contexts/ThemeContext';

export const useTheme = () => {
  return useContextTheme();
};

export default useTheme;
