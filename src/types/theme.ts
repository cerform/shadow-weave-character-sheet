
export type ThemeType = 'default' | 'dark' | 'fantasy' | 'magical' | 'parchment' | 'nature' | 'dungeon';

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
}
