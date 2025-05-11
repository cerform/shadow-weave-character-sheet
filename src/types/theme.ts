
export type ThemeType = 'default' | 'dark' | 'light' | 'fantasy' | 'magical' | 'parchment' | 'nature' | 'dungeon' | 'wizard' | 'warlock' | 'druid' | 'warrior' | 'bard' | 'cyberpunk';

export interface ThemeStyles {
  name: string;
  background: string;
  foreground: string;  // Required
  cardBackground: string;
  primary: string;     // Required
  secondary: string;
  accent: string;
  textColor: string;
  mutedTextColor: string;
  borderColor: string;
  shadowColor: string;
  fontFamily: string;
  buttonText: string;
  // Optional properties
  success?: string;
  warning?: string;
  danger?: string;
  info?: string;
  backgroundBrightness?: number;
  backgroundGradient?: string;
  decorativeCorners?: boolean;
  primaryColor?: string;
  accentTextColor?: string;
}
