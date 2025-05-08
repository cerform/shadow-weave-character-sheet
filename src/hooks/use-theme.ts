
import { create } from 'zustand';

type ThemeType = 'default' | 'dark' | 'light' | 'fantasy';

interface ThemeStore {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

export const useTheme = create<ThemeStore>((set) => ({
  theme: 'default',
  setTheme: (theme) => set({ theme }),
}));

export default useTheme;
