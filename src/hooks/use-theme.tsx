
import { create } from 'zustand';

type Theme = 'shadow' | 'fire' | 'nature' | 'arcane' | 'barbarian' | 'bard';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useTheme = create<ThemeState>((set) => ({
  theme: 'shadow',
  setTheme: (theme) => set({ theme }),
}));
