
import { create } from 'zustand';

export type Theme = 'shadow' | 'fire' | 'nature' | 'arcane' | 'warrior' | 'bard' | 'paladin' | 'rogue';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const useTheme = create<ThemeState>((set) => ({
  theme: 'shadow',
  setTheme: (theme) => set({ theme }),
}));
