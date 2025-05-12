
export interface Theme {
  accent: string;
  textColor: string;
  background: string;
  foreground: string;
  primary: string;
  cardBackground: string;
  inputBackground: string;
  mutedTextColor: string;
  buttonText?: string;
  borderColor?: string;
  backgroundBrightness?: number;
  backgroundGradient?: string;
  decorativeCorners?: boolean;
  spellLevels?: Record<number, string>;
}
