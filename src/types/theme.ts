
export type ThemeType = 'default' | 'dark' | 'light' | 'system' | 'red' | 'green' | 'blue' | 'purple' | 'orange' | 'yellow' | 'pink' | 'gray';

export interface Theme {
  name: string;
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  backgroundColor: string;
  accentColor: string;
}

export interface ThemeContextType {
  activeTheme: ThemeType;
  setUserTheme: (theme: ThemeType) => void;
  currentTheme: Theme;
}
