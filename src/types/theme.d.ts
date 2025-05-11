
import { themes, Theme, ThemeStyles } from "@/lib/themes";

// Define allowed theme types based on the keys in the themes object
export type ThemeType = 'light' | 'dark' | 'wizard' | 'warlock' | 'default' | 'bard' | 'druid' | 'cleric' | 'paladin' | 'rogue' | 'ranger' | 'barbarian' | 'monk' | 'fighter' | 'sorcerer';

// Define the context interface to match how it's being used
export interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  activeTheme?: ThemeType;
  setUserTheme?: (theme: ThemeType) => void;
  themeStyles: Theme; // Required property
  currentTheme?: Theme;
}

export type { Theme, ThemeStyles };
