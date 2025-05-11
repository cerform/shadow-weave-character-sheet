
export type ThemeType = 'default' | 'dark' | 'light' | 'fantasy' | 'magical' | 'parchment' | 'nature' | 'dungeon' | 'wizard' | 'warlock' | 'druid' | 'warrior' | 'bard' | 'cyberpunk';

export interface ThemeStyles {
  name: string;
  background: string;
  foreground: string;  // Required
  cardBackground: string;
  primary: string;     // Required
  secondary: string;   // Required
  accent: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  shadowColor: string;
  fontFamily: string;
  buttonText: string;
  accentTextColor?: string;
  // Optional properties
  success?: string;
  warning?: string;
  danger?: string;
  info?: string;
  backgroundBrightness?: number;
  backgroundGradient?: string;
  decorativeCorners?: boolean;
  primaryColor?: string;
}

// Add this line to export Theme as ThemeStyles
export type Theme = ThemeStyles;
