
import { create } from 'zustand';

// Update this to include all the theme types being used
export type Theme = 'shadow' | 'fire' | 'nature' | 'arcane' | 'barbarian' | 'bard';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useTheme = create<ThemeState>((set) => ({
  theme: 'shadow',
  setTheme: (theme) => set({ theme }),
}));
