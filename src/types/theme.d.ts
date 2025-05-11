
import { themes } from "@/lib/themes";

// Define allowed theme types based on the keys in the themes object
export type ThemeType = 'light' | 'dark' | 'wizard' | 'warlock' | 'default' | 'bard' | 'druid' | 'cleric' | 'paladin' | 'rogue' | 'ranger' | 'barbarian' | 'monk' | 'fighter' | 'sorcerer';

// Define the ThemeStyles interface to match both contexts
export interface ThemeStyles {
  name: string;
  background: string;
  foreground: string;
  cardBackground: string;
  primary: string;
  secondary: string;
  accent: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  shadowColor: string;
  fontFamily: string;
  buttonText: string;
  accentTextColor?: string;
  success?: string;
  warning?: string;
  danger?: string;
  info?: string;
  backgroundBrightness?: number;
  backgroundGradient?: string;
  decorativeCorners?: boolean;
  primaryColor?: string;
}

// Define the context interface to match how it's being used
export interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  activeTheme?: ThemeType;
  setUserTheme?: (theme: ThemeType) => void;
  themeStyles: ThemeStyles;
  currentTheme?: ThemeStyles;
}

export type Theme = ThemeStyles;
