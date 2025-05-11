
import { themes, Theme } from "@/lib/themes";

// Define allowed theme types based on the keys in the themes object
export type ThemeType = 'light' | 'dark' | 'wizard' | 'warlock' | 'default';

// Define the context interface to match how it's being used
export interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  activeTheme?: ThemeType;
  setUserTheme?: (theme: ThemeType) => void;
  currentTheme?: Theme;
  themeStyles: Theme; // Required property
}

export type { Theme };
