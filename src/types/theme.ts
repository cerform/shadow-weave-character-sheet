
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
  buttonText: string;       // Required property for button text color
  success?: string;
  warning?: string;
  danger?: string;
  info?: string;
  
  // Theme properties
  backgroundBrightness?: number;
  backgroundGradient?: string;
  decorativeCorners?: boolean;
}

export interface ThemeContextType {
  activeTheme?: ThemeType;
  setUserTheme?: (theme: ThemeType) => void;
  currentTheme?: Theme;
  themeStyles: Theme; // Made this required instead of optional
  theme: string | ThemeType; // Made this required instead of optional
  setTheme: (theme: string | ThemeType) => void; // Made this required instead of optional
}

export interface ThemeStore {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  themeStyles?: Theme;
  effectiveTheme?: string;
}
