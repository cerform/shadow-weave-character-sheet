
import { create } from 'zustand';
import { themes } from '@/lib/themes';

export type ThemeType = 'default' | 'dark' | 'light' | 'fantasy' | 'warlock' | 'wizard' | 'druid' | 'warrior' | 'bard' | 'cyberpunk';

interface ThemeStore {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  themeStyles?: any; // Add themeStyles property
}

export const useTheme = create<ThemeStore>((set) => ({
  theme: 'default',
  setTheme: (theme) => set({ theme }),
  themeStyles: themes.default, // Initialize themeStyles with default theme
}));

export default useTheme;
