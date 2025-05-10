
export type ThemeType = 'default' | 'dark' | 'light' | 'system' | 'red' | 'green' | 'blue' | 'purple' | 'orange' | 'yellow' | 'pink' | 'gray' | 
  'warlock' | 'wizard' | 'druid' | 'warrior' | 'bard' | 'monk' | 'ranger' | 'sorcerer' | 'cyberpunk' | 'fantasy' | string;

export interface Theme {
  name: string;
  primaryColor?: string;  // Keep primaryColor as alternative for primary
  primary: string;
  secondary: string;
  textColor: string;
  mutedTextColor: string;
  backgroundColor?: string;  // Alternative for background
  background: string;
  accentColor?: string;     // Alternative for accent
  accent: string;
  foreground: string;
  cardBackground: string;
  buttonText?: string;
  success?: string;
  warning?: string;
  danger?: string;
  info?: string;
  
  // Add missing theme properties
  backgroundBrightness?: number;
  backgroundGradient?: string;
  decorativeCorners?: boolean;
}

export interface ThemeContextType {
  activeTheme?: ThemeType;
  setUserTheme?: (theme: ThemeType) => void;
  currentTheme?: Theme;
}

export interface ThemeStore {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  themeStyles?: Theme;
  effectiveTheme?: string;
}
