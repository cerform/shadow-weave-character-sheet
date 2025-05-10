
export type ThemeType = 'default' | 'dark' | 'light' | 'system' | 'red' | 'green' | 'blue' | 'purple' | 'orange' | 'yellow' | 'pink' | 'gray' | 
  'warlock' | 'wizard' | 'druid' | 'warrior' | 'bard' | 'monk' | 'ranger' | 'sorcerer' | 'cyberpunk' | 'fantasy' | string;

export interface Theme {
  name: string;
  primaryColor?: string;
  primary: string;
  secondary: string;
  textColor: string;
  mutedTextColor: string;
  backgroundColor?: string;
  background: string;
  accentColor?: string;
  accent: string;
  foreground: string;
  cardBackground: string;
  buttonText?: string;
  
  // Additional theme properties
  backgroundBrightness?: number;
  backgroundGradient?: string;
  decorativeCorners?: boolean;
}

export interface ThemeContextType {
  activeTheme: ThemeType;
  setUserTheme: (theme: ThemeType) => void;
  currentTheme: Theme;
}
