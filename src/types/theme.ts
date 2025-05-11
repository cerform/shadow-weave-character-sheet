
export type ThemeType = 'default' | 'dark' | 'light' | 'fantasy' | 'magical' | 'parchment' | 'nature' | 'dungeon' | 'wizard' | 'warlock' | 'druid' | 'warrior' | 'bard' | 'cyberpunk';

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
  // Добавляем дополнительные свойства, которые используются в различных компонентах
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
