
import Character from '@/types/character';

// Define the Theme interface with all required properties
export interface Theme {
  name: string;
  accent: string;
  background: string;
  cardBackground: string;
  foreground: string;
  primary: string;
  secondary: string;
  textColor: string;
  mutedTextColor: string;
  primaryColor?: string; // Added for backward compatibility
  backgroundBrightness?: number;
  backgroundGradient?: string;
  decorativeCorners?: boolean;
}

// Re-export Character for use across the project
export { Character };
