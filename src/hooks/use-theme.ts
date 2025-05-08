
import { create } from 'zustand';

export type ThemeType = 'default' | 'dark' | 'light' | 'fantasy' | 'warlock' | 'wizard' | 'druid' | 'warrior' | 'bard';

interface ThemeStore {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  themeStyles?: any; // Add themeStyles property
}

export const useTheme = create<ThemeStore>((set) => ({
  theme: 'default',
  setTheme: (theme) => set({ theme }),
  themeStyles: undefined, // Initialize themeStyles
}));

export default useTheme;
