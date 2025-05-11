
export type ThemeType = 
  | 'default' 
  | 'dark' 
  | 'light' 
  | 'fantasy' 
  | 'purple' 
  | 'modern' 
  | 'retro' 
  | 'cavernous' 
  | 'forest' 
  | 'mountain'
  | string;

export interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  themeStyles: any;
  effectiveTheme?: ThemeType;
}

export interface ThemeStyles {
  background: string;
  foreground: string;
  primary: string;
  accent: string;
  textColor: string;
  cardBackground: string;
  buttonText?: string;
  mutedTextColor?: string;
  errorText?: string;
  successText?: string;
  infoText?: string;
  warningText?: string;
}
