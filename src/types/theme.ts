
export type ThemeType = 'default' | 'dark' | 'light' | 'system' | 'red' | 'green' | 'blue' | 'purple' | 'orange' | 'yellow' | 'pink' | 'gray' | 
  'warlock' | 'wizard' | 'druid' | 'warrior' | 'bard' | 'monk' | 'ranger' | 'sorcerer' | 'cyberpunk' | 'fantasy' | string;

export interface Theme {
  name: string;
  primaryColor?: string;  // Альтернатива для primary
  primary: string;
  secondary: string;
  textColor: string;
  mutedTextColor: string;
  backgroundColor?: string;  // Альтернатива для background
  background: string;
  accentColor?: string;     // Альтернатива для accent
  accent: string;
  foreground: string;
  cardBackground: string;
  buttonText?: string;
  
  // Дополнительные свойства темы
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
